import { ensureDbReady } from '@/lib/db/client';
import crypto from 'crypto';

export interface ContentRelease {
  id: string;
  clientId: string;
  siteId: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentReleaseItem {
  id: string;
  releaseId: string;
  itemType: 'page' | 'article' | 'operation' | 'report' | 'dynamic_zone' | 'banner';
  itemId: string;
  title: string;
  action: 'update' | 'create' | 'delete' | 'publish';
  changesSummary?: string;
  snapshotJson?: string;
  createdAt: string;
}

export async function listReleases(params?: {
  clientId?: string;
  siteId?: string;
  status?: string;
}): Promise<ContentRelease[]> {
  const db = await ensureDbReady();
  let sql = 'SELECT * FROM content_releases WHERE 1=1';
  const args: any[] = [];

  if (params?.clientId) {
    sql += ' AND client_id = ?';
    args.push(params.clientId);
  }
  if (params?.siteId) {
    sql += ' AND site_id = ?';
    args.push(params.siteId);
  }
  if (params?.status && params.status !== 'all') {
    sql += ' AND status = ?';
    args.push(params.status);
  }

  sql += ' ORDER BY created_at DESC';

  const res = await db.execute({ sql, args });
  return res.rows.map(row => ({
    id: String(row.id),
    clientId: String(row.client_id),
    siteId: String(row.site_id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    status: row.status as ContentRelease['status'],
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    publishedBy: row.published_by ? String(row.published_by) : null,
    itemCount: Number(row.item_count || 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  }));
}

export async function getRelease(id: string): Promise<{ release: ContentRelease; items: ContentReleaseItem[] } | null> {
  const db = await ensureDbReady();
  const res = await db.execute({
    sql: 'SELECT * FROM content_releases WHERE id = ? LIMIT 1',
    args: [id]
  });

  if (res.rows.length === 0) return null;
  const row = res.rows[0];

  const itemsRes = await db.execute({
    sql: 'SELECT * FROM content_release_items WHERE release_id = ? ORDER BY created_at ASC',
    args: [id]
  });

  const release: ContentRelease = {
    id: String(row.id),
    clientId: String(row.client_id),
    siteId: String(row.site_id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    status: row.status as ContentRelease['status'],
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    publishedBy: row.published_by ? String(row.published_by) : null,
    itemCount: Number(row.item_count || 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };

  const items: ContentReleaseItem[] = itemsRes.rows.map(r => ({
    id: String(r.id),
    releaseId: String(r.release_id),
    itemType: r.item_type as ContentReleaseItem['itemType'],
    itemId: String(r.item_id),
    title: String(r.title),
    action: r.action as ContentReleaseItem['action'],
    changesSummary: r.changes_summary ? String(r.changes_summary) : undefined,
    snapshotJson: r.snapshot_json ? String(r.snapshot_json) : undefined,
    createdAt: String(r.created_at)
  }));

  return { release, items };
}

export async function createRelease(data: {
  clientId?: string;
  siteId?: string;
  name: string;
  description?: string;
  scheduledAt?: string | null;
  status?: 'draft' | 'scheduled';
}): Promise<ContentRelease> {
  const db = await ensureDbReady();
  const id = `rel_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();
  const status = data.scheduledAt ? 'scheduled' : (data.status || 'draft');
  const clientId = data.clientId || 'client_goldfields';
  const siteId = data.siteId || 'site_goldfields_flagship';

  await db.execute({
    sql: `INSERT INTO content_releases (
      id, client_id, site_id, name, description, status, scheduled_at, published_at, published_by, item_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      clientId,
      siteId,
      data.name,
      data.description || null,
      status,
      data.scheduledAt || null,
      null,
      null,
      0,
      now,
      now
    ]
  });

  return {
    id,
    clientId,
    siteId,
    name: data.name,
    description: data.description,
    status,
    scheduledAt: data.scheduledAt || null,
    publishedAt: null,
    publishedBy: null,
    itemCount: 0,
    createdAt: now,
    updatedAt: now
  };
}

export async function updateRelease(id: string, data: Partial<ContentRelease>): Promise<ContentRelease | null> {
  const db = await ensureDbReady();
  const existing = await getRelease(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = data.name !== undefined ? data.name : existing.release.name;
  const description = data.description !== undefined ? data.description : existing.release.description;
  const scheduledAt = data.scheduledAt !== undefined ? data.scheduledAt : existing.release.scheduledAt;
  const status = data.status !== undefined ? data.status : (scheduledAt ? 'scheduled' : existing.release.status);

  await db.execute({
    sql: `UPDATE content_releases SET name = ?, description = ?, status = ?, scheduled_at = ?, updated_at = ? WHERE id = ?`,
    args: [name, description || null, status, scheduledAt || null, now, id]
  });

  return (await getRelease(id))?.release || null;
}

export async function deleteRelease(id: string): Promise<boolean> {
  const db = await ensureDbReady();
  await db.execute({ sql: 'DELETE FROM content_release_items WHERE release_id = ?', args: [id] });
  const res = await db.execute({ sql: 'DELETE FROM content_releases WHERE id = ?', args: [id] });
  return (res.rowsAffected || 0) > 0;
}

export async function addItemToRelease(releaseId: string, item: {
  itemType: ContentReleaseItem['itemType'];
  itemId: string;
  title: string;
  action?: ContentReleaseItem['action'];
  changesSummary?: string;
  snapshotJson?: string;
}): Promise<ContentReleaseItem> {
  const db = await ensureDbReady();
  const id = `item_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();
  const action = item.action || 'update';

  await db.execute({
    sql: `INSERT INTO content_release_items (
      id, release_id, item_type, item_id, title, action, changes_summary, snapshot_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      releaseId,
      item.itemType,
      item.itemId,
      item.title,
      action,
      item.changesSummary || null,
      item.snapshotJson || null,
      now
    ]
  });

  // Update item_count in content_releases
  await db.execute({
    sql: `UPDATE content_releases SET 
      item_count = (SELECT COUNT(*) FROM content_release_items WHERE release_id = ?),
      updated_at = ?
      WHERE id = ?`,
    args: [releaseId, now, releaseId]
  });

  return {
    id,
    releaseId,
    itemType: item.itemType,
    itemId: item.itemId,
    title: item.title,
    action,
    changesSummary: item.changesSummary,
    snapshotJson: item.snapshotJson,
    createdAt: now
  };
}

export async function removeItemFromRelease(releaseId: string, itemId: string): Promise<boolean> {
  const db = await ensureDbReady();
  const res = await db.execute({
    sql: 'DELETE FROM content_release_items WHERE release_id = ? AND id = ?',
    args: [releaseId, itemId]
  });

  const now = new Date().toISOString();
  await db.execute({
    sql: `UPDATE content_releases SET 
      item_count = (SELECT COUNT(*) FROM content_release_items WHERE release_id = ?),
      updated_at = ?
      WHERE id = ?`,
    args: [releaseId, now, releaseId]
  });

  return (res.rowsAffected || 0) > 0;
}

export async function publishRelease(releaseId: string, publishedBy = 'Malcolm Govender'): Promise<{
  success: boolean;
  publishedCount: number;
  release: ContentRelease;
}> {
  const db = await ensureDbReady();
  const releaseData = await getRelease(releaseId);
  if (!releaseData) throw new Error(`Release not found: ${releaseId}`);

  const now = new Date().toISOString();

  // Atomically promote bundled items
  for (const item of releaseData.items) {
    if (item.itemType === 'page') {
      await db.execute({
        sql: `UPDATE page_compositions SET status = 'published', updated_at = ? WHERE page_slug = ? OR id = ?`,
        args: [now, item.itemId, item.itemId]
      });
    } else if (item.itemType === 'article' || item.itemType === 'report' || item.itemType === 'operation') {
      await db.execute({
        sql: `UPDATE content_records SET status = 'published', updated_at = ? WHERE slug = ? OR id = ?`,
        args: [now, item.itemId, item.itemId]
      });
    }
  }

  // Update release status to published
  await db.execute({
    sql: `UPDATE content_releases SET status = 'published', published_at = ?, published_by = ?, updated_at = ? WHERE id = ?`,
    args: [now, publishedBy, now, releaseId]
  });

  // Record in audit log
  try {
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, created_at)
        VALUES (?, ?, ?, 'RELEASE_PUBLISHED', 'content_releases', ?, 'success', ?, ?)`,
      args: [
        `audit_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
        publishedBy || 'admin',
        publishedBy || 'Administrator',
        releaseId,
        JSON.stringify({ name: releaseData.release.name, itemCount: releaseData.items.length }),
        now
      ]
    });
  } catch (auditErr) {
    console.warn('[Audit Log] Notice recording release publishing:', auditErr);
  }

  const updated = (await getRelease(releaseId))!.release;

  return {
    success: true,
    publishedCount: releaseData.items.length,
    release: updated
  };
}

export async function processScheduledReleases(): Promise<{ executedCount: number; publishedReleases: string[] }> {
  const db = await ensureDbReady();
  const now = new Date().toISOString();

  const dueReleases = await db.execute({
    sql: `SELECT id FROM content_releases WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?`,
    args: [now]
  });

  const publishedReleases: string[] = [];
  for (const row of dueReleases.rows) {
    const relId = String(row.id);
    await publishRelease(relId, 'Bastion Automated Scheduler');
    publishedReleases.push(relId);
  }

  return {
    executedCount: publishedReleases.length,
    publishedReleases
  };
}
