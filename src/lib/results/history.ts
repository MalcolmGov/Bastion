import crypto from 'crypto';
import type { Transaction } from '@libsql/client';
import { sanitizePublicationHtml } from './codeAssistant';
import type { ResultsDocument } from './types';

export type ResultsActor = { id: string; name: string };
const ARTWORK = /data:image\/(?:png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=]+/gi;
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export function packRevision(document: ResultsDocument) {
  const copy = { ...document, sourcePages: undefined, presentationHtml: document.presentationHtml ? sanitizePublicationHtml(document.presentationHtml).replace(/<!doctype html>\s*/i, '<!DOCTYPE html>') : document.presentationHtml };
  const assets = new Map<string, string>();
  const payload = JSON.stringify(canonical(copy)).replace(ARTWORK, asset => {
    const hash = crypto.createHash('sha256').update(asset).digest('hex');
    assets.set(hash, asset);
    return `bastion-artwork:${hash}`;
  });
  return { payload, assets, hash: crypto.createHash('sha256').update(payload).digest('hex') };
}
export async function recordRevision(tx: Transaction, documentId: string, document: ResultsDocument, actor?: ResultsActor, restoredFrom?: string): Promise<string> {
  const packed = packRevision(document);
  const latest = (await tx.execute({ sql: 'SELECT id, content_hash, version FROM results_revisions WHERE document_id = ? ORDER BY version DESC LIMIT 1', args: [documentId] })).rows[0];
  if (!restoredFrom && latest?.content_hash === packed.hash) return String(latest.id);
  const id = crypto.randomUUID();
  for (const [key, value] of packed.assets) await tx.execute({ sql: 'INSERT OR IGNORE INTO results_revision_assets(document_id, asset_key, asset_value) VALUES (?, ?, ?)', args: [documentId, key, value] });
  await tx.execute({ sql: 'INSERT INTO results_revisions(id, document_id, version, content_hash, snapshot_json, author_id, author_name, created_at, restored_from) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [id, documentId, Number(latest?.version || 0) + 1, packed.hash, packed.payload, actor?.id || null, actor?.name || 'Legacy baseline', new Date().toISOString(), restoredFrom || null] });
  return id;
}
export async function unpackRevision(executor: Pick<Transaction, 'execute'>, documentId: string, revisionId: string, source: ResultsDocument): Promise<ResultsDocument | null> {
  const row = (await executor.execute({ sql: 'SELECT snapshot_json FROM results_revisions WHERE id = ? AND document_id = ?', args: [revisionId, documentId] })).rows[0];
  if (!row) return null;
  const assets = (await executor.execute({ sql: 'SELECT asset_key, asset_value FROM results_revision_assets WHERE document_id = ?', args: [documentId] })).rows;
  const values = new Map(assets.map(asset => [String(asset.asset_key), String(asset.asset_value)]));
  const payload = String(row.snapshot_json).replace(/bastion-artwork:([a-f0-9]{64})/g, (_, key) => {
    const value = values.get(key);
    if (!value) throw new Error('Version artwork is missing. Restore was stopped.');
    return value;
  });
  return { ...JSON.parse(payload), sourcePages: source.sourcePages, sourceFinancialContext: source.sourceFinancialContext, sourceFilename: source.sourceFilename, pageCount: source.pageCount, warnings: source.warnings };
}
export function describeRevisionChanges(before: ResultsDocument, after: ResultsDocument): string[] {
  if (packRevision(before).hash === packRevision(after).hash) return ['Same report content'];
  const changes: string[] = [];
  const stable = (value: unknown) => JSON.stringify(canonical(value));
  if (before.issuer !== after.issuer) changes.push('Issuer changed');
  if (before.periodLabel !== after.periodLabel) changes.push('Reporting period changed');
  if (before.unit !== after.unit) changes.push('Reporting unit changed');
  let figures = 0;
  for (const statement of after.statements) for (const row of statement.rows) {
    const old = before.statements.find(item => item.id === statement.id)?.rows.find(item => item.id === row.id);
    row.cells.forEach((cell, index) => { if (cell !== old?.cells[index]) figures++; });
  }
  if (figures) changes.push(`${figures} table cells changed`);
  if (stable(before.statements) !== stable(after.statements) && !figures) changes.push('Table structure changed');
  if (stable(before.publication) !== stable(after.publication) || stable(before.narrative) !== stable(after.narrative) || stable(before.notes) !== stable(after.notes) || stable(before.highlights) !== stable(after.highlights) || before.title !== after.title) changes.push('Report content changed');
  if (before.presentationHtml !== after.presentationHtml || stable(before.brand) !== stable(after.brand)) changes.push('Presentation changed');
  return changes.length ? changes : ['Report metadata changed'];
}
