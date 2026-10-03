import { ensureDbReady } from '@/lib/db/client';
import crypto from 'crypto';
import { sanitizeHtmlFragment } from '@/lib/security/sanitizeHtmlFragment';
import type { SensAnnouncement, SensType } from './types';
import { SENS_TYPE_LABELS, SENS_TYPE_COLORS } from './types';

export type { SensAnnouncement, SensType };
export { SENS_TYPE_LABELS, SENS_TYPE_COLORS };

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
}): Promise<SensAnnouncement> {
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
    status: data.status || 'published',
    sponsor: data.sponsor || 'J.P. Morgan Equities South Africa (Pty) Ltd',
    embargoUntil: data.embargoUntil,
    createdAt: now,
    updatedAt: now,
  };

  await db.execute({
    sql: `
      INSERT INTO sens_announcements (
        id, client_id, site_id, headline, announcement_type, jse_code, isin_code,
        released_at, body_html, summary, pdf_url, is_price_sensitive, status,
        sponsor, embargo_until, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ],
  });

  return announcement;
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
  };
}
