import { ensureDbReady } from '@/lib/db/client';
import crypto from 'crypto';
import { sanitizeHtmlFragment } from '@/lib/security/sanitizeHtmlFragment';
import type { SensAnnouncement, SensType } from './types';
import { SENS_TYPE_LABELS, SENS_TYPE_COLORS } from './types';

export type { SensAnnouncement, SensType };
export { SENS_TYPE_LABELS, SENS_TYPE_COLORS };

/** A refused SENS workflow step. `status` is the HTTP status a route should answer with. */
export class SensApprovalError extends Error {
  constructor(message: string, public readonly status: number = 400) {
    super(message);
  }
}

/** Statuses an announcement can be in before it is published. */
const PRE_PUBLICATION = new Set(['draft', 'embargoed']);

/** Hash of everything a reader would see, so a sign-off stops counting if any of it changes. */
export function sensContentHash(
  a: Pick<SensAnnouncement, 'headline' | 'announcementType' | 'jseCode' | 'isinCode' | 'bodyHtml' | 'summary' | 'pdfUrl' | 'isPriceSensitive' | 'sponsor' | 'embargoUntil'>
): string {
  return crypto.createHash('sha256').update(JSON.stringify([
    a.headline, a.announcementType, a.jseCode, a.isinCode ?? null, a.bodyHtml, a.summary ?? null,
    a.pdfUrl ?? null, a.isPriceSensitive, a.sponsor, a.embargoUntil ?? null,
  ])).digest('hex');
}

export async function listSensAnnouncements(
  clientId: string,
  params?: {
    type?: string;
    priceSensitiveOnly?: boolean;
    search?: string;
    limit?: number;
  }
): Promise<SensAnnouncement[]> {
  const db = await ensureDbReady();
  let sql = 'SELECT * FROM sens_announcements WHERE client_id = ?';
  const args: any[] = [clientId];

  if (params?.type && params.type !== 'all') {
    sql += ' AND announcement_type = ?';
    args.push(params.type);
  }

  if (params?.priceSensitiveOnly) {
    sql += ' AND is_price_sensitive = 1';
  }

  if (params?.search?.trim()) {
    sql += ' AND (headline LIKE ? OR summary LIKE ? OR body_html LIKE ?)';
    const term = `%${params.search.trim()}%`;
    args.push(term, term, term);
  }

  sql += ' ORDER BY released_at DESC';

  if (params?.limit) {
    sql += ` LIMIT ${Math.max(1, params.limit)}`;
  }

  const res = await db.execute({ sql, args });
  return res.rows.map(mapSensRow);
}

export async function getSensAnnouncement(id: string, clientId?: string): Promise<SensAnnouncement | null> {
  const db = await ensureDbReady();
  let sql = 'SELECT * FROM sens_announcements WHERE id = ?';
  const args: any[] = [id];

  if (clientId) {
    sql += ' AND client_id = ?';
    args.push(clientId);
  }

  const res = await db.execute({ sql, args });
  if (res.rows.length === 0) return null;
  return mapSensRow(res.rows[0]);
}

export async function createSensAnnouncement(data: {
  clientId: string;
  siteId: string;
  headline: string;
  announcementType?: SensType;
  jseCode?: string;
  isinCode?: string;
  releasedAt?: string;
  bodyHtml: string;
  summary?: string;
  pdfUrl?: string;
  isPriceSensitive?: boolean;
  status?: 'draft' | 'embargoed' | 'published';
  sponsor?: string;
  embargoUntil?: string;
  createdBy?: string;
}): Promise<SensAnnouncement> {
  // The two-person rule can only be met by a separate approval, so nothing authored here starts out live.
  if (data.status && data.status !== 'draft') {
    throw new SensApprovalError('New SENS announcements are created as drafts and published only after an independent approval');
  }
  const db = await ensureDbReady();
  const id = `sens_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const announcement: SensAnnouncement = {
    id,
    clientId: data.clientId,
    siteId: data.siteId,
    headline: data.headline.trim(),
    announcementType: data.announcementType || 'general',
    jseCode: data.jseCode || 'JSE: GFI',
    isinCode: data.isinCode || 'ZAE000018123',
    releasedAt: data.releasedAt || now,
    bodyHtml: sanitizeHtmlFragment(data.bodyHtml),
    summary: data.summary || data.headline,
    pdfUrl: data.pdfUrl,
    isPriceSensitive: data.isPriceSensitive !== undefined ? data.isPriceSensitive : true,
    status: 'draft',
    sponsor: data.sponsor || 'J.P. Morgan Equities South Africa (Pty) Ltd',
    embargoUntil: data.embargoUntil,
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy,
  };

  await db.execute({
    sql: `
      INSERT INTO sens_announcements (
        id, client_id, site_id, headline, announcement_type, jse_code, isin_code,
        released_at, body_html, summary, pdf_url, is_price_sensitive, status,
        sponsor, embargo_until, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      announcement.id,
      announcement.clientId,
      announcement.siteId,
      announcement.headline,
      announcement.announcementType,
      announcement.jseCode,
      announcement.isinCode || null,
      announcement.releasedAt,
      announcement.bodyHtml,
      announcement.summary || null,
      announcement.pdfUrl || null,
      announcement.isPriceSensitive ? 1 : 0,
      announcement.status,
      announcement.sponsor,
      announcement.embargoUntil || null,
      announcement.createdAt,
      announcement.updatedAt,
      announcement.createdBy || null,
    ],
  });

  return announcement;
}

/** Records an independent sign-off of the announcement's current content. It does not publish. */
export async function approveSensAnnouncement(id: string, reviewerId: string, clientId?: string): Promise<SensAnnouncement> {
  const db = await ensureDbReady();
  const current = await getSensAnnouncement(id, clientId);
  if (!current) throw new SensApprovalError('SENS announcement not found', 404);
  if (!PRE_PUBLICATION.has(current.status)) {
    throw new SensApprovalError('Only announcements that are not yet published can be approved', 409);
  }
  if (current.createdBy && current.createdBy === reviewerId) {
    throw new SensApprovalError('Two-Person Rule Violation: the author of a SENS announcement cannot approve it', 403);
  }
  const now = new Date().toISOString();
  const res = await db.execute({
    sql: `UPDATE sens_announcements SET approved_by = ?, approved_at = ?, approved_content_hash = ?, updated_at = ?
          WHERE id = ? AND status IN ('draft', 'embargoed')`,
    args: [reviewerId, now, sensContentHash(current), now, id],
  });
  if (!res.rowsAffected) throw new SensApprovalError('The announcement changed while it was being approved', 409);
  return (await getSensAnnouncement(id))!;
}

/** Publishes an announcement that has an approval, by someone other than its author, of its current content. */
export async function publishSensAnnouncement(id: string, clientId?: string): Promise<SensAnnouncement> {
  const db = await ensureDbReady();
  const current = await getSensAnnouncement(id, clientId);
  if (!current) throw new SensApprovalError('SENS announcement not found', 404);
  if (!PRE_PUBLICATION.has(current.status)) {
    throw new SensApprovalError('This announcement is already published', 409);
  }
  const currentHash = sensContentHash(current);
  const approved = !!current.approvedBy
    && current.approvedBy !== current.createdBy
    && current.approvedContentHash === currentHash;
  if (!approved) {
    throw new SensApprovalError('Independent approval of the current announcement is required before it can be published', 409);
  }
  const res = await db.execute({
    sql: `UPDATE sens_announcements SET status = 'published', updated_at = ?
          WHERE id = ? AND status IN ('draft', 'embargoed') AND approved_by IS NOT NULL AND approved_content_hash = ?`,
    args: [new Date().toISOString(), id, currentHash],
  });
  if (!res.rowsAffected) throw new SensApprovalError('The announcement changed while it was being published', 409);
  return (await getSensAnnouncement(id))!;
}

export async function deleteSensAnnouncement(id: string, clientId: string): Promise<boolean> {
  const db = await ensureDbReady();
  const res = await db.execute({
    sql: `DELETE FROM sens_announcements WHERE id = ? AND client_id = ?`,
    args: [id, clientId],
  });
  return (res.rowsAffected || 0) > 0;
}

function mapSensRow(row: any): SensAnnouncement {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    siteId: String(row.site_id),
    headline: String(row.headline),
    announcementType: (row.announcement_type as SensType) || 'general',
    jseCode: String(row.jse_code || 'JSE: GFI'),
    isinCode: row.isin_code ? String(row.isin_code) : undefined,
    releasedAt: String(row.released_at),
    // Sanitised on read as well: rows written before this check, or inserted by feed sync, may hold raw HTML.
    bodyHtml: sanitizeHtmlFragment(String(row.body_html || '')),
    summary: row.summary ? String(row.summary) : undefined,
    pdfUrl: row.pdf_url ? String(row.pdf_url) : undefined,
    isPriceSensitive: Number(row.is_price_sensitive) === 1,
    status: (row.status as any) || 'published',
    sponsor: String(row.sponsor || 'J.P. Morgan Equities South Africa (Pty) Ltd'),
    embargoUntil: row.embargo_until ? String(row.embargo_until) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    createdBy: row.created_by ? String(row.created_by) : undefined,
    approvedBy: row.approved_by ? String(row.approved_by) : undefined,
    approvedAt: row.approved_at ? String(row.approved_at) : undefined,
    approvedContentHash: row.approved_content_hash ? String(row.approved_content_hash) : undefined,
  };
}
