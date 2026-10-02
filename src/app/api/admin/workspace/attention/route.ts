import { NextRequest, NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/db/client";
import { requireUser, clientOwns } from "@/lib/auth/guard";
import { isAgencyUser } from "@/lib/auth/roles";
import { hasPermission } from "@/lib/auth/auth";
import type { AttentionData } from "@/lib/workspace/types";

export async function GET(request: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;
  const db = await ensureDbReady();
  const clientId = isAgencyUser(user)
    ? request.nextUrl.searchParams.get("clientId")
    : user.client_id;
  const siteId = request.nextUrl.searchParams.get("siteId");
  if (siteId) {
    const site = (
      await db.execute({
        sql: "SELECT client_id FROM websites WHERE id = ?",
        args: [siteId],
      })
    ).rows[0];
    if (
      !site ||
      !clientOwns(user, String(site.client_id)) ||
      (clientId && site.client_id !== clientId)
    ) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
  }
  const data: AttentionData = {
    focus:
      user.role === "reviewer"
        ? "Review submitted content"
        : user.role === "publisher"
          ? "Prepare your next release"
          : "Keep your workspace moving",
    counts: {},
    items: [],
    links: [],
  };
  const permitted = (permission: string) =>
    hasPermission(user.role, permission);
  if (permitted("content:read")) {
    let scope = "";
    const args: string[] = [];
    if (clientId) {
      scope += " AND client_id = ?";
      args.push(clientId);
    }
    if (siteId) {
      scope += " AND site_id = ?";
      args.push(siteId);
    }
    // Reviewers see submissions, publishers see approved content; editors see work they own.
    let filter =
      " AND status IN ('draft', 'changes_requested', 'in_review', 'approved', 'scheduled')";
    if (user.role === "reviewer") filter = " AND status = 'in_review'";
    if (user.role === "publisher")
      filter = " AND status IN ('approved', 'scheduled')";
    if (user.role === "content_editor") {
      scope += " AND owner_id = ?";
      args.push(user.id);
    }
    const [counts, records, releases] = await Promise.all([
      db.execute({
        sql: `SELECT status, COUNT(*) AS total FROM content_records WHERE 1=1 ${scope}${filter} GROUP BY status`,
        args,
      }),
      db.execute({
        sql: `SELECT id, title, collection, status, updated_at FROM content_records WHERE 1=1 ${scope}${filter} ORDER BY updated_at DESC LIMIT 12`,
        args,
      }),
      db.execute({
        sql: `SELECT id, name, status, scheduled_at, updated_at FROM content_releases WHERE status IN ('draft', 'scheduled') ${clientId ? "AND client_id = ?" : ""} ${siteId ? "AND site_id = ?" : ""} ORDER BY CASE WHEN scheduled_at IS NULL THEN 1 ELSE 0 END, scheduled_at ASC, updated_at DESC LIMIT 6`,
        args: [...(clientId ? [clientId] : []), ...(siteId ? [siteId] : [])],
      }),
    ]);
    for (const row of counts.rows)
      data.counts[String(row.status)] = Number(row.total);
    data.items = records.rows.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      kind: String(row.collection),
      status: String(row.status),
      updatedAt: String(row.updated_at),
      href: `/admin/${encodeURIComponent(String(row.collection))}/${encodeURIComponent(String(row.id))}`,
    }));
    for (const row of releases.rows)
      data.items.push({
        id: String(row.id),
        title: String(row.name),
        kind: "release",
        status: String(row.status),
        updatedAt: String(row.scheduled_at || row.updated_at),
        href: `/admin/releases/${encodeURIComponent(String(row.id))}/preview`,
      });
    if (permitted("content:edit")) {
      const pageScope = `${clientId ? " AND w.client_id = ?" : ""}${siteId ? " AND p.site_id = ?" : ""}`;
      const pageArgs = [
        ...(clientId ? [clientId] : []),
        ...(siteId ? [siteId] : []),
      ];
      const [pageCounts, pages] = await Promise.all([
        db.execute({
          sql: `SELECT COUNT(*) AS total FROM page_compositions p JOIN websites w ON w.id = p.site_id WHERE p.status = 'draft' ${pageScope}`,
          args: pageArgs,
        }),
        db.execute({
          sql: `SELECT p.id, p.title, p.site_id, p.page_slug, p.updated_at FROM page_compositions p JOIN websites w ON w.id = p.site_id WHERE p.status = 'draft' ${pageScope} ORDER BY p.updated_at DESC LIMIT 6`,
          args: pageArgs,
        }),
      ]);
      data.counts.draft =
        (data.counts.draft || 0) + Number(pageCounts.rows[0]?.total || 0);
      for (const page of pages.rows)
        data.items.push({
          id: String(page.id),
          title: String(page.title),
          kind: "page layout",
          status: "draft",
          updatedAt: String(page.updated_at),
          href: `/admin/editor?siteId=${encodeURIComponent(String(page.site_id))}&pageSlug=${encodeURIComponent(String(page.page_slug))}`,
        });
    }
    if (permitted("content:edit"))
      data.links.push({
        title: "Open visual editor",
        href: siteId
          ? `/admin/editor?siteId=${encodeURIComponent(siteId)}`
          : "/admin/editor",
      });
    if (permitted("content:review"))
      data.links.push({ title: "Review submissions", href: "/admin/tasks" });
    data.links.push({ title: "Explore releases", href: "/admin/releases" });
  }
  if (permitted("analytics:read"))
    data.links.push({ title: "Explore analytics", href: "/admin/analytics" });
  if (permitted("health:read"))
    data.links.push({ title: "Check website health", href: "/admin/health" });
  if (permitted("ai:read"))
    data.links.push({
      title: "Manage AI knowledge",
      href: "/admin/ai-knowledge",
    });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
