import { ensureDbReady } from '@/lib/db/client';
import { clientOwns } from '@/lib/auth/guard';
import { hasPermission, type StudioUser } from '@/lib/auth/auth';
import crypto from 'node:crypto';
import type { Transaction, Row } from '@libsql/client';

export class EditorSaveError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export interface CompositionSave {
  siteId: string;
  pageSlug: string;
  sections: unknown[];
  expectedVersion: number;
  title?: string;
  layoutCollection?: string;
  meta?: unknown;
  status?: string;
  changeSummary?: string;
}

export async function saveComposition(
  user: StudioUser,
  input: CompositionSave,
  batch?: { transaction: Transaction; site: Row },
) {
  if (
    !input ||
    typeof input.siteId !== 'string' ||
    !/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(input.pageSlug || '')
  )
    throw new EditorSaveError('Choose a valid website and page.', 400);
  if (!Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 0)
    throw new EditorSaveError(
      'Reload this page before saving; its version is missing.',
      400,
    );
  if (
    !Array.isArray(input.sections) ||
    input.sections.length > 200 ||
    input.sections.some(
      (section: any) =>
        !section ||
        typeof section.id !== 'string' ||
        typeof section.componentId !== 'string' ||
        !section.props ||
        typeof section.props !== 'object',
    )
  )
    throw new EditorSaveError('Page sections are invalid.', 400);
  if (
    new Set(input.sections.map((section: any) => section.id)).size !==
    input.sections.length
  )
    throw new EditorSaveError(
      'Every section must have a unique identifier.',
      400,
    );
  const status = input.status || 'draft';
  if (!['draft', 'in_review', 'published'].includes(status))
    throw new EditorSaveError('Choose draft, in_review, or published status.', 400);
  if (
    !hasPermission(
      user.role,
      status === 'published' ? 'content:publish' : 'content:edit',
    )
  )
    throw new EditorSaveError(
      'You do not have permission to save this page.',
      403,
    );
  const json = JSON.stringify(input.sections);
  if (json.length > 2_000_000)
    throw new EditorSaveError('Page content is too large to save.', 413);
  const db = await ensureDbReady();
  const site =
    batch?.site ||
    (
      await db.execute({
        sql: 'SELECT * FROM websites WHERE id = ? OR slug = ? LIMIT 1',
        args: [input.siteId, input.siteId],
      })
    ).rows[0];
  if (!site || !clientOwns(user, String(site.client_id)))
    throw new EditorSaveError('Website not found.', 404);
  const tx = batch?.transaction || (await db.transaction('write'));
  const now = new Date().toISOString();
  let result;
  try {
    const existing = (
      await tx.execute({
        sql: 'SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1',
        args: [site.id, input.pageSlug],
      })
    ).rows[0];
    const currentVersion = Number(existing?.version || 0);
    if (currentVersion !== input.expectedVersion)
      throw new EditorSaveError(
        'Someone has updated this page. Your edits are still here. Reload the latest version before saving again.',
        409,
      );
    // Imports or older seed routines may have reset the current version counter.
    // Preserve every history entry and allocate above both counters within the write transaction.
    const history = (await tx.execute({
      sql: 'SELECT MAX(version) AS latest_version FROM page_versions WHERE site_id = ? AND page_slug = ?',
      args: [site.id, input.pageSlug],
    })).rows[0];
    const version = Math.max(currentVersion, Number(history?.latest_version || 0)) + 1;
    const id = existing ? String(existing.id) : `comp_${crypto.randomUUID()}`;
    const title =
      input.title ??
      (existing
        ? String(existing.title)
        : input.pageSlug === 'home'
          ? 'Home'
          : input.pageSlug);
    const layout =
      input.layoutCollection ??
      String(
        existing?.layout_collection ||
          site.design_collection_id ||
          'contemporary',
      );
    if (!['editorial', 'contemporary', 'immersive'].includes(layout))
      throw new EditorSaveError('Unknown page design collection.', 400);
    const meta =
      input.meta !== undefined
        ? JSON.stringify(input.meta)
        : (existing?.meta_json ?? null);
    // Retain a published baseline even for older pages created before version history existed.
    if (existing?.status === 'published')
      await tx.execute({
        sql: `INSERT INTO page_versions (id,composition_id,site_id,page_slug,version,title,layout_collection,sections_json,meta_json,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'published',?) ON CONFLICT(id) DO UPDATE SET status='published',title=excluded.title,layout_collection=excluded.layout_collection,sections_json=excluded.sections_json,meta_json=excluded.meta_json`,
        args: [
          `pver_${site.id}_${input.pageSlug}_v${currentVersion}`,
          id,
          site.id,
          input.pageSlug,
          currentVersion,
          existing.title,
          existing.layout_collection,
          existing.sections_json,
          existing.meta_json,
          existing.updated_at,
        ],
      });
    await tx.execute({
      sql: `INSERT INTO page_compositions (id,site_id,page_slug,title,layout_collection,sections_json,meta_json,version,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,layout_collection=excluded.layout_collection,sections_json=excluded.sections_json,meta_json=excluded.meta_json,version=excluded.version,status=excluded.status,updated_at=excluded.updated_at`,
      args: [
        id,
        site.id,
        input.pageSlug,
        title,
        layout,
        json,
        meta,
        version,
        status,
        existing?.created_at || now,
        now,
      ],
    });
    await tx.execute({
      sql: `INSERT INTO page_versions (id,composition_id,site_id,page_slug,version,title,layout_collection,sections_json,meta_json,status,created_by,created_by_name,change_summary,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        `pver_${site.id}_${input.pageSlug}_v${version}`,
        id,
        site.id,
        input.pageSlug,
        version,
        title,
        layout,
        json,
        meta,
        status,
        user.id,
        user.name,
        input.changeSummary ||
          `${status === 'published' ? 'Published' : 'Saved draft'} v${version}`,
        now,
      ],
    });
    await tx.execute({
      sql: `INSERT INTO audit_log (id,actor_id,actor_name,action,collection,record_id,result,created_at) VALUES (?,?,?,'page_composition_save','page_compositions',?,'success',?)`,
      args: [`audit_${crypto.randomUUID()}`, user.id, user.name, id, now],
    });
    if (!batch) await tx.commit();
    result = {
      success: true,
      compositionId: id,
      version,
      savedAt: now,
      siteId: String(site.id),
      siteSlug: String(site.slug),
      title,
      layoutCollection: layout,
      meta: meta ? JSON.parse(String(meta)) : null,
    };
  } catch (error) {
    if (!batch) await tx.rollback();
    throw error;
  } finally {
    if (!batch) tx.close();
  }
  return result;
}

export async function saveWebsiteDrafts(
  user: StudioUser,
  siteId: string,
  pages: Omit<CompositionSave, 'siteId'>[],
  options?: { allowCreate?: boolean; status?: 'draft' | 'in_review' | 'published' },
) {
  if (
    typeof siteId !== 'string' ||
    !siteId ||
    !Array.isArray(pages) ||
    !pages.length ||
    pages.length > 30 ||
    new Set(pages.map((page) => page.pageSlug)).size !== pages.length
  )
    throw new EditorSaveError('Choose up to 30 distinct pages.', 400);
  const db = await ensureDbReady();
  const site = (
    await db.execute({
      sql: 'SELECT * FROM websites WHERE id = ? OR slug = ? LIMIT 1',
      args: [siteId, siteId],
    })
  ).rows[0];
  if (!site || !clientOwns(user, String(site.client_id)))
    throw new EditorSaveError('Website not found.', 404);
  const transaction = await db.transaction('write');
  try {
    const results = [];
    for (const page of pages) {
      const existing = (
        await transaction.execute({
          sql: 'SELECT id, version FROM page_compositions WHERE site_id = ? AND page_slug = ?',
          args: [site.id, page.pageSlug],
        })
      ).rows[0];
      if (!existing && !options?.allowCreate)
        throw new EditorSaveError(
          'The assistant can only update existing pages.',
          404,
        );

      const expectedVersion = existing ? Number(existing.version || 0) : 0;
      results.push({
        ...(await saveComposition(
          user,
          {
            ...page,
            expectedVersion: page.expectedVersion !== undefined ? page.expectedVersion : expectedVersion,
            siteId: String(site.id),
            status: page.status || options?.status || 'draft',
          },
          { transaction, site },
        )),
        pageSlug: page.pageSlug,
      });
    }
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
}
