import crypto from 'node:crypto';
import type { Client, Row } from '@libsql/client';
import { ensureDbReady } from '@/lib/db/client';
import { clientOwns } from '@/lib/auth/guard';
import { hasPermission, type StudioUser } from '@/lib/auth/auth';

type Db = Pick<Client, 'execute'>;

/**
 * The two-person rule for visual-editor pages. A page goes live only with a version that someone other than
 * its author approved, and the approval is bound to a hash of the exact content (title, design collection,
 * sections and metadata), so editing after approval, or swapping content in underneath it, invalidates it.
 * Approval is recorded on the page_versions row the approved content was saved as.
 */
export const PAGE_APPROVAL_REQUIRED =
  'Independent approval of this exact page content is required before it can be published. Save a draft and ask a reviewer who did not write it to approve that version.';

export class PageApprovalError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}

export interface PageContent {
  title: string;
  layout: string;
  sectionsJson: string;
  metaJson: string | null;
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(source).sort().map((key) => [key, canonical(source[key])]));
  }
  return value;
}

function parseJson(text: string | null): unknown {
  if (text == null || text === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Hash of what visitors would see. Key order and whitespace in the stored JSON do not change it. */
export function pageContentHash(content: PageContent): string {
  const payload = [content.title, content.layout, parseJson(content.sectionsJson), parseJson(content.metaJson)];
  return crypto.createHash('sha256').update(JSON.stringify(canonical(payload))).digest('hex');
}

export function rowContent(row: Row | Record<string, unknown>): PageContent {
  return {
    title: String(row.title ?? ''),
    layout: String(row.layout_collection ?? ''),
    sectionsJson: String(row.sections_json ?? '[]'),
    metaJson: row.meta_json == null ? null : String(row.meta_json),
  };
}

/** An approval counts when someone approved this exact content and they are not the version's author. */
function isValidApproval(version: Row | undefined, hash: string): version is Row {
  if (!version?.approved_by || version.approved_content_hash !== hash) return false;
  return !version.created_by || version.created_by !== version.approved_by;
}

async function currentVersionRow(db: Db, composition: Row | Record<string, unknown>): Promise<Row | undefined> {
  return (
    await db.execute({
      sql: 'SELECT * FROM page_versions WHERE site_id = ? AND page_slug = ? AND version = ? LIMIT 1',
      args: [String(composition.site_id), String(composition.page_slug), Number(composition.version)],
    })
  ).rows[0];
}

/**
 * Checks that `content` may go live for the page whose current row is `existing` (undefined for a page that has
 * never been saved). Returns the approved version row so the published version can carry the approval, or null when
 * the content is already live and nothing new is being exposed. Throws PageApprovalError otherwise.
 */
export async function assertPublishApproval(db: Db, existing: Row | undefined, content: PageContent): Promise<Row | null> {
  const hash = pageContentHash(content);
  if (existing) {
    if (existing.status === 'published' && pageContentHash(rowContent(existing)) === hash) return null;
    const version = await currentVersionRow(db, existing);
    if (isValidApproval(version, hash)) return version;
  }
  throw new PageApprovalError(PAGE_APPROVAL_REQUIRED);
}

/**
 * For paths that flip an existing page row to published without carrying new content, such as releases: the row's
 * current content must be approved. A row that is already published is left alone, and a missing row has nothing to publish.
 */
export async function assertPageApproved(db: Db, compositionId: string): Promise<void> {
  const composition = (await db.execute({ sql: 'SELECT * FROM page_compositions WHERE id = ? LIMIT 1', args: [compositionId] })).rows[0];
  if (!composition || composition.status === 'published') return;
  const version = await currentVersionRow(db, composition);
  if (!isValidApproval(version, pageContentHash(rowContent(composition)))) throw new PageApprovalError(PAGE_APPROVAL_REQUIRED);
}

const SLUG = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

async function findOwnedSite(db: Db, user: StudioUser, siteId: string): Promise<Row> {
  const site = (await db.execute({ sql: 'SELECT * FROM websites WHERE id = ? OR slug = ? LIMIT 1', args: [siteId, siteId] })).rows[0];
  if (!site || !clientOwns(user, String(site.client_id))) throw new PageApprovalError('Website not found.', 404);
  return site;
}

export interface PageApprovalRequest {
  siteId: unknown;
  pageSlug: unknown;
  version?: unknown;
}

function validRequest(request: PageApprovalRequest): { siteId: string; pageSlug: string } {
  if (typeof request.siteId !== 'string' || typeof request.pageSlug !== 'string' || !SLUG.test(request.pageSlug))
    throw new PageApprovalError('Choose a valid website and page.', 400);
  return { siteId: request.siteId, pageSlug: request.pageSlug };
}

/** Records the approval of the page's current saved version by `user`. */
export async function approvePageVersion(user: StudioUser, request: PageApprovalRequest) {
  if (!hasPermission(user.role, 'content:approve')) throw new PageApprovalError('You do not have permission to approve pages.', 403);
  const { siteId, pageSlug } = validRequest(request);
  const version = request.version;
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1)
    throw new PageApprovalError('Choose the version to approve.', 400);

  const db = await ensureDbReady();
  const tx = await db.transaction('write');
  try {
    const site = await findOwnedSite(tx, user, siteId);
    const composition = (
      await tx.execute({ sql: 'SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1', args: [site.id, pageSlug] })
    ).rows[0];
    if (!composition) throw new PageApprovalError('Page not found.', 404);
    if (Number(composition.version) !== version)
      throw new PageApprovalError('This version is no longer the current one. Reload the page and approve the latest version.');
    if (composition.status === 'published') throw new PageApprovalError('This version is already published, so there is nothing to approve.');

    const now = new Date().toISOString();
    const hash = pageContentHash(rowContent(composition));
    // Seeded and imported drafts have no history row yet. Record one, with no known author, for the approval to attach to.
    await tx.execute({
      sql: `INSERT OR IGNORE INTO page_versions (id,composition_id,site_id,page_slug,version,title,layout_collection,sections_json,meta_json,status,change_summary,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,'draft','Recorded for approval',?)`,
      args: [
        `pver_${site.id}_${pageSlug}_v${version}`, composition.id, site.id, pageSlug, version,
        composition.title, composition.layout_collection, composition.sections_json, composition.meta_json, now,
      ],
    });
    const row = await currentVersionRow(tx, composition);
    if (!row || pageContentHash(rowContent(row)) !== hash)
      throw new PageApprovalError('The saved history for this version does not match the page. Save the page again before approving it.');
    if (row.created_by && row.created_by === user.id)
      throw new PageApprovalError('You saved this version, so a different reviewer must approve it.', 403);

    await tx.execute({
      sql: 'UPDATE page_versions SET approved_by = ?, approved_by_name = ?, approved_at = ?, approved_content_hash = ? WHERE id = ?',
      args: [user.id, user.name, now, hash, String(row.id)],
    });
    await tx.execute({
      sql: `INSERT INTO audit_log (id,actor_id,actor_name,action,collection,record_id,result,details_json,created_at)
            VALUES (?,?,?,'page_composition_approve','page_compositions',?,'success',?,?)`,
      args: [`audit_${crypto.randomUUID()}`, user.id, user.name, String(composition.id), JSON.stringify({ pageSlug, version, contentHash: hash }), now],
    });
    await tx.commit();
    return { success: true, version, approvedBy: user.id, approvedByName: user.name, approvedAt: now, contentHash: hash };
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    tx.close();
  }
}

/** What the editor shows about the page's current version. Read only. */
export async function pageApprovalStatus(user: StudioUser, request: PageApprovalRequest) {
  const { siteId, pageSlug } = validRequest(request);
  const db = await ensureDbReady();
  const site = await findOwnedSite(db, user, siteId);
  const composition = (
    await db.execute({ sql: 'SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1', args: [site.id, pageSlug] })
  ).rows[0];
  if (!composition) return { success: true, version: 0, status: 'new', approved: false, canApprove: false };

  const row = await currentVersionRow(db, composition);
  const live = composition.status === 'published';
  const approved = !live && isValidApproval(row, pageContentHash(rowContent(composition)));
  const mayApprove = hasPermission(user.role, 'content:approve') && !live && !approved && !(row?.created_by && row.created_by === user.id);
  return {
    success: true,
    version: Number(composition.version),
    status: String(composition.status),
    approved,
    canApprove: mayApprove,
    authorName: row?.created_by_name ? String(row.created_by_name) : null,
    approvedByName: approved && row?.approved_by_name ? String(row.approved_by_name) : null,
    approvedAt: approved && row?.approved_at ? String(row.approved_at) : null,
  };
}
