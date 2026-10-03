import crypto from 'crypto';
import { getDb } from '@/lib/db/client';
import { recordRevision, unpackRevision, type ResultsActor } from './history';
import { slugify } from './numbers';
import type { ResultsDocument, StoredResultsDocument, ResultsDocumentSummary } from './types';

let schemaReady: Promise<void> | null = null;

export async function ensureResultsSchema(targetDb?: any): Promise<void> {
  const db = targetDb || getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS results_documents (
      id TEXT PRIMARY KEY,
      client_id TEXT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      source_filename TEXT,
      document_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    );
  `);
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS results_revisions (id TEXT PRIMARY KEY, document_id TEXT NOT NULL, version INTEGER NOT NULL, content_hash TEXT NOT NULL, snapshot_json TEXT NOT NULL, author_id TEXT, author_name TEXT NOT NULL, created_at TEXT NOT NULL, restored_from TEXT, UNIQUE(document_id, version));
    CREATE TABLE IF NOT EXISTS results_revision_assets (document_id TEXT NOT NULL, asset_key TEXT NOT NULL, asset_value TEXT NOT NULL, PRIMARY KEY(document_id, asset_key));
    CREATE TABLE IF NOT EXISTS results_reviews (revision_id TEXT PRIMARY KEY, reviewer_id TEXT NOT NULL, reviewer_name TEXT NOT NULL, reviewed_at TEXT NOT NULL, comment TEXT NOT NULL, source_reviewed INTEGER NOT NULL, validation_reviewed INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS results_review_requests (revision_id TEXT PRIMARY KEY, requested_by TEXT NOT NULL, requested_name TEXT NOT NULL, requested_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS results_publications (document_id TEXT PRIMARY KEY, revision_id TEXT NOT NULL, published_at TEXT NOT NULL);
  `);
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await ensureResultsSchema();
    })();
  }
  await schemaReady;
}

function mapRow(row: Record<string, unknown>): StoredResultsDocument {
  return {
    id: String(row.id),
    clientId: row.client_id ? String(row.client_id) : null,
    slug: String(row.slug),
    title: String(row.title),
    status: row.status === 'published' ? 'published' : 'draft',
    sourceFilename: String(row.source_filename || ''),
    document: JSON.parse(String(row.document_json)) as ResultsDocument,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    publishedAt: row.published_at ? String(row.published_at) : null,
  };
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const db = getDb();
  let slug = slugify(base);
  let suffix = 2;
  while (true) {
    const existing = await db.execute({
      sql: `SELECT id FROM results_documents WHERE slug = ? LIMIT 1`,
      args: [slug],
    });
    const row = existing.rows[0] as { id?: string } | undefined;
    if (!row || row.id === ignoreId) return slug;
    slug = `${slugify(base)}-${suffix}`;
    suffix += 1;
  }
}

export async function saveResultsDocument(input: {
  id?: string;
  clientId?: string | null;
  document: ResultsDocument;
  status: 'draft' | 'published';
  expectedUpdatedAt?: string;
  actor?: ResultsActor;
  restoredFrom?: string;
}): Promise<StoredResultsDocument> {
  await ensureSchema();
  const db = getDb();
  let now = new Date().toISOString();
  const title = `${input.document.issuer} — ${input.document.periodLabel}`;

  const id = input.id || `res_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const slug = input.id ? '' : await uniqueSlug(`${input.document.issuer} ${input.document.periodLabel}`);
  const tx = await db.transaction('write');
  try {
    const currentRow = input.id ? (await tx.execute({ sql: 'SELECT * FROM results_documents WHERE id = ?', args: [id] })).rows[0] : null;
    if (input.id && !currentRow) throw new Error('Results document not found');
    const current = currentRow ? mapRow(currentRow) : null;
    if (current) now = new Date(Math.max(Date.now(), Date.parse(current.updatedAt) + 1)).toISOString();
    if (current && input.expectedUpdatedAt && current.updatedAt !== input.expectedUpdatedAt) throw new Error('This draft was changed in another session. Reopen it before saving to avoid overwriting newer work.');
    if (current) {
      const baseline = await recordRevision(tx, id, current.document);
      if (current.status === 'published') await tx.execute({ sql: 'INSERT OR IGNORE INTO results_publications(document_id, revision_id, published_at) VALUES (?, ?, ?)', args: [id, baseline, current.publishedAt || current.updatedAt] });
    }
    const revisionId = await recordRevision(tx, id, input.document, input.actor, input.restoredFrom);
    if (input.status === 'published') {
      const review = (await tx.execute({ sql: 'SELECT reviewer_id FROM results_reviews WHERE revision_id = ?', args: [revisionId] })).rows[0];
      if (!review) throw new Error('This saved version requires independent reviewer approval before publishing.');
    }
    const publishedAt = input.status === 'published' ? now : current?.publishedAt || null;
    if (current) await tx.execute({ sql: 'UPDATE results_documents SET title = ?, status = ?, source_filename = ?, document_json = ?, updated_at = ?, published_at = ? WHERE id = ?', args: [title, input.status, input.document.sourceFilename, JSON.stringify(input.document), now, publishedAt, id] });
    else await tx.execute({ sql: 'INSERT INTO results_documents(id, client_id, slug, title, status, source_filename, document_json, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [id, input.clientId || null, slug, title, input.status, input.document.sourceFilename, JSON.stringify(input.document), now, now, publishedAt] });
    if (input.status === 'published') await tx.execute({ sql: 'INSERT INTO results_publications(document_id, revision_id, published_at) VALUES (?, ?, ?) ON CONFLICT(document_id) DO UPDATE SET revision_id = excluded.revision_id, published_at = excluded.published_at', args: [id, revisionId, now] });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
  const saved = await getResultsDocument(id);
  if (!saved) throw new Error('Results document not found after save');
  return saved;
}

export async function listResultsDocuments(clientId?: string | null): Promise<StoredResultsDocument[]> {
  await ensureSchema();
  const db = getDb();
  let sql = `SELECT * FROM results_documents`;
  const args: any[] = [];
  if (clientId) {
    sql += ` WHERE client_id = ?`;
    args.push(clientId);
  }
  sql += ` ORDER BY updated_at DESC`;
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getResultsDocument(id: string): Promise<StoredResultsDocument | null> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT * FROM results_documents WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0];
  return row ? mapRow(row as Record<string, unknown>) : null;
}

export async function getPublishedResultsBySlug(slug: string): Promise<StoredResultsDocument | null> {
  await ensureSchema();
  const db = getDb();
  const row = (await db.execute({ sql: 'SELECT * FROM results_documents WHERE slug = ? LIMIT 1', args: [slug] })).rows[0];
  if (!row) return null;
  const stored = mapRow(row);
  const live = (await db.execute({ sql: 'SELECT revision_id, published_at FROM results_publications WHERE document_id = ?', args: [stored.id] })).rows[0];
  if (!live) return stored.status === 'published' ? stored : null;
  const document = await unpackRevision(db, stored.id, String(live.revision_id), stored.document);
  return document ? { ...stored, title: `${document.issuer} — ${document.periodLabel}`, document, status: 'published', publishedAt: String(live.published_at) } : null;
}

/** List metadata only: PDF images and full report HTML are loaded on demand. */
export async function listResultsSummaries(clientId?: string | null, offset = 0): Promise<ResultsDocumentSummary[]> {
  await ensureSchema();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, client_id, slug, title, status, source_filename, created_at, updated_at, published_at FROM results_documents ${clientId ? 'WHERE client_id = ?' : ''} ORDER BY updated_at DESC, id DESC LIMIT 51 OFFSET ?`,
    args: [...(clientId ? [clientId] : []), offset],
  });
  return result.rows.map(row => ({
    id: String(row.id), clientId: row.client_id ? String(row.client_id) : null,
    slug: String(row.slug), title: String(row.title), status: row.status === 'published' ? 'published' : 'draft',
    sourceFilename: String(row.source_filename || ''), createdAt: String(row.created_at), updatedAt: String(row.updated_at), publishedAt: row.published_at ? String(row.published_at) : null,
  }));
}
