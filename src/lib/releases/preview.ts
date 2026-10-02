import { ensureDbReady } from "@/lib/db/client";
import type { StudioUser } from "@/lib/auth/auth";
import { clientOwns } from "@/lib/auth/guard";
import type { PreviewItem, ReleasePreview } from "@/lib/workspace/types";

function object(value: unknown): Record<string, unknown> | null {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/** Resolve by ID first, then an unambiguous slug, always inside the release's tenant and site. */
export async function getReleasePreview(
  user: StudioUser,
  id: string,
): Promise<ReleasePreview | null> {
  const db = await ensureDbReady();
  const release = (
    await db.execute({
      sql: "SELECT * FROM content_releases WHERE id = ?",
      args: [id],
    })
  ).rows[0];
  if (!release || !clientOwns(user, String(release.client_id))) return null;
  const site = (
    await db.execute({
      sql: "SELECT id FROM websites WHERE id = ? AND client_id = ?",
      args: [release.site_id, release.client_id],
    })
  ).rows[0];
  const result: ReleasePreview = {
    id,
    name: String(release.name),
    status: String(release.status),
    scheduledAt: release.scheduled_at ? String(release.scheduled_at) : null,
    checkedAt: new Date().toISOString(),
    issues: [],
    items: [],
  };
  if (!site)
    result.issues.push(
      "Release website is missing or belongs to another workspace.",
    );
  if (release.status === "published" || release.status === "archived")
    result.issues.push(
      "This release is closed. Previews show current content, not an archived release snapshot.",
    );
  const rows = (
    await db.execute({
      sql: "SELECT * FROM content_release_items WHERE release_id = ? ORDER BY created_at, id",
      args: [id],
    })
  ).rows;
  if (!rows.length)
    result.issues.push("Add content to this release before reviewing it.");
  for (const row of rows) {
    const item: PreviewItem = {
      id: String(row.id),
      title: String(row.title),
      kind: String(row.item_type),
      action: String(row.action),
      issues: [],
      live: null,
      proposed: null,
      fields: [],
      visual: false,
    };
    result.items.push(item);
    if (!site) {
      item.issues.push("Content cannot be resolved without a valid website.");
      continue;
    }
    if (!["update", "create", "publish"].includes(item.action))
      item.issues.push(
        "This action needs a manual review; automatic deletion previews are unavailable.",
      );
    if (item.kind === "page") {
      const pageKey = String(row.item_id).startsWith(`${release.site_id}:`)
        ? String(row.item_id).slice(String(release.site_id).length + 1)
        : String(row.item_id);
      const candidates = (
        await db.execute({
          sql: "SELECT * FROM page_compositions WHERE site_id = ? AND (id = ? OR page_slug = ?)",
          args: [release.site_id, pageKey, pageKey],
        })
      ).rows;
      const exact = candidates.find(
        (candidate) => candidate.id === row.item_id,
      );
      const page = exact || (candidates.length === 1 ? candidates[0] : null);
      if (!page) {
        item.issues.push(
          "Page is missing or its slug is ambiguous in this website.",
        );
        continue;
      }
      const live =
        page.status === "published"
          ? page
          : (
              await db.execute({
                sql: "SELECT * FROM page_versions WHERE site_id = ? AND composition_id = ? AND status = 'published' ORDER BY version DESC LIMIT 1",
                args: [release.site_id, page.id],
              })
            ).rows[0];
      const payload = (value: typeof page) => ({
        title: String(value.title),
        sections: JSON.parse(String(value.sections_json)),
        collection: String(value.layout_collection || "contemporary"),
        metadata: object(value.meta_json) || {},
      });
      try {
        item.proposed = payload(page);
        item.live = live ? payload(live) : null;
        item.visual =
          Array.isArray(item.proposed.sections) &&
          item.proposed.sections.every(
            (section) =>
              section &&
              typeof section.id === "string" &&
              typeof section.componentId === "string" &&
              section.props &&
              typeof section.props === "object",
          );
        if (!item.visual)
          item.issues.push(
            "Page sections are invalid; inspect the structured changes.",
          );
      } catch {
        item.issues.push("Page content contains invalid JSON.");
      }
      item.issues.push(
        "Page compositions have no formal approval workflow. Confirm visual and editorial sign-off manually.",
      );
    } else {
      const collection = (
        {
          article: "news",
          report: "reports",
          operation: "operations",
        } as Record<string, string>
      )[item.kind];
      if (!collection) {
        item.issues.push("Preview is not yet supported for this content type.");
        continue;
      }
      const candidates = (
        await db.execute({
          sql: "SELECT * FROM content_records WHERE client_id = ? AND site_id = ? AND collection = ? AND (id = ? OR slug = ?)",
          args: [
            release.client_id,
            release.site_id,
            collection,
            row.item_id,
            row.item_id,
          ],
        })
      ).rows;
      const record =
        candidates.find((candidate) => candidate.id === row.item_id) ||
        (candidates.length === 1 ? candidates[0] : null);
      if (!record) {
        item.issues.push(
          "Content is missing or its slug is ambiguous in this website.",
        );
        continue;
      }
      const revisions = (
        await db.execute({
          sql: "SELECT * FROM revisions WHERE record_id = ? AND (id = ? OR id = ?)",
          args: [
            record.id,
            record.current_draft_revision_id,
            record.current_published_revision_id,
          ],
        })
      ).rows;
      const draft = revisions.find(
        (revision) => revision.id === record.current_draft_revision_id,
      );
      const live = revisions.find(
        (revision) => revision.id === record.current_published_revision_id,
      );
      item.proposed = object(draft?.data_json);
      item.live = object(live?.data_json);
      if (!item.proposed)
        item.issues.push("No valid draft revision is available.");
      if (draft && ["news", "reports"].includes(collection)) {
        const approvals = await db.execute({
          sql: "SELECT COUNT(DISTINCT reviewer_id) AS total FROM approvals WHERE revision_id = ? AND decision = 'approved' AND content_hash_at_approval = ? AND reviewer_id != ? AND NOT EXISTS (SELECT 1 FROM approvals newer WHERE newer.revision_id = approvals.revision_id AND newer.reviewer_id = approvals.reviewer_id AND (newer.created_at > approvals.created_at OR (newer.created_at = approvals.created_at AND newer.rowid > approvals.rowid)))",
          args: [draft.id, draft.content_hash, draft.author_id || ""],
        });
        if (Number(approvals.rows[0]?.total || 0) === 0)
          item.issues.push(
            "An independent approval for this exact draft is missing.",
          );
      }
      if (
        !["approved", "scheduled", "published"].includes(String(record.status))
      )
        item.issues.push(
          `Content is ${String(record.status).replaceAll("_", " ")}; finish editorial review.`,
        );
    }
    item.fields = [
      ...new Set([
        ...Object.keys(item.live || {}),
        ...Object.keys(item.proposed || {}),
      ]),
    ].filter(
      (key) =>
        JSON.stringify(item.live?.[key]) !==
        JSON.stringify(item.proposed?.[key]),
    );
  }
  return result;
}
