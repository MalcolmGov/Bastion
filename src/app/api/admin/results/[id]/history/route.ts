import { NextRequest, NextResponse } from 'next/server';
import { requireUser, clientOwns } from '@/lib/auth/guard';
import { hasPermission } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/client';
import { ensureResultsSchema, getResultsDocument, saveResultsDocument } from '@/lib/results/store';
import { packRevision, unpackRevision, describeRevisionChanges } from '@/lib/results/history';
import { validateFinancials } from '@/lib/results/validateFinancials';

type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, context: Context) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;
  const current = await getResultsDocument(id);
  if (!current || !clientOwns(gate.user, current.clientId)) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  const db = getDb();
  await ensureResultsSchema(db);
  const revisionId = req.nextUrl.searchParams.get('revision');
  if (revisionId) {
    const document = await unpackRevision(db, id, revisionId, current.document);
    return document ? NextResponse.json({ document, changes: describeRevisionChanges(current.document, document) }) : NextResponse.json({ error: 'Version not found.' }, { status: 404 });
  }
  const offset = Number(req.nextUrl.searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0) return NextResponse.json({ error: 'Invalid offset.' }, { status: 400 });
  const rows = (await db.execute({ sql: `SELECT r.id, r.version, r.author_id, r.author_name, r.created_at, r.restored_from, v.reviewer_name, v.reviewed_at, v.comment, q.requested_name, q.requested_at, p.published_at FROM results_revisions r LEFT JOIN results_reviews v ON v.revision_id = r.id LEFT JOIN results_review_requests q ON q.revision_id = r.id LEFT JOIN results_publications p ON p.revision_id = r.id AND p.document_id = r.document_id WHERE r.document_id = ? ORDER BY r.version DESC LIMIT 51 OFFSET ?`, args: [id, offset] })).rows;
  const latest = (await db.execute({ sql: 'SELECT id, content_hash FROM results_revisions WHERE document_id = ? ORDER BY version DESC LIMIT 1', args: [id] })).rows[0];
  return NextResponse.json({ versions: rows.slice(0, 50), nextOffset: rows.length > 50 ? offset + 50 : null, currentRevisionId: latest?.content_hash === packRevision(current.document).hash ? latest.id : null, permissions: { edit: hasPermission(gate.user.role, 'content:edit'), approve: hasPermission(gate.user.role, 'content:approve'), publish: hasPermission(gate.user.role, 'content:publish') }, userId: gate.user.id });
}
export async function POST(req: NextRequest, context: Context) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const { user } = gate;
  const { id } = await context.params;
  const current = await getResultsDocument(id);
  if (!current || !clientOwns(user, current.clientId)) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  const body = await req.json();
  if (!['request', 'approve', 'restore'].includes(body.action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  if (!hasPermission(user.role, body.action === 'approve' ? 'content:approve' : 'content:edit')) return NextResponse.json({ error: 'Your role does not permit this action.' }, { status: 403 });
  if (body.expectedUpdatedAt !== current.updatedAt) return NextResponse.json({ error: 'The draft changed. Reopen it before continuing.' }, { status: 409 });
  const db = getDb();
  if (body.action === 'restore') {
    const document = await unpackRevision(db, id, String(body.revisionId || ''), current.document);
    if (!document) return NextResponse.json({ error: 'Version not found.' }, { status: 404 });
    try {
      return NextResponse.json(await saveResultsDocument({ id, document, status: 'draft', expectedUpdatedAt: body.expectedUpdatedAt, actor: { id: user.id, name: user.name }, restoredFrom: String(body.revisionId) }));
    } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Restore failed.' }, { status: 409 }); }
  }
  const tx = await db.transaction('write');
  try {
    const saved = (await tx.execute({ sql: 'SELECT updated_at FROM results_documents WHERE id = ?', args: [id] })).rows[0];
    if (saved?.updated_at !== body.expectedUpdatedAt) throw new Error('The draft changed. Reopen it before continuing.');
    const revision = (await tx.execute({ sql: 'SELECT id, author_id, content_hash FROM results_revisions WHERE document_id = ? ORDER BY version DESC LIMIT 1', args: [id] })).rows[0];
    if (!revision || revision.id !== body.revisionId || revision.content_hash !== packRevision(current.document).hash) throw new Error('Save the current draft before requesting or recording approval.');
    if (body.action === 'approve') {
      if (revision.author_id === user.id) throw new Error('A different reviewer must approve your version.');
      if (body.sourceReviewed !== true) throw new Error('Complete and confirm the PDF source comparison before approving.');
      if (validateFinancials(current.document).issues.length && body.validationReviewed !== true) throw new Error('Review and acknowledge the financial validation items before approving.');
      if (typeof body.comment !== 'string' || body.comment.length > 2000) throw new Error('Review notes must be at most 2,000 characters.');
      await tx.execute({ sql: 'INSERT OR IGNORE INTO results_reviews(revision_id, reviewer_id, reviewer_name, reviewed_at, comment, source_reviewed, validation_reviewed) VALUES (?, ?, ?, ?, ?, 1, ?)', args: [String(revision.id), user.id, user.name, new Date().toISOString(), body.comment.trim(), body.validationReviewed === true ? 1 : 0] });
    } else {
      await tx.execute({ sql: 'INSERT OR IGNORE INTO results_review_requests(revision_id, requested_by, requested_name, requested_at) VALUES (?, ?, ?, ?)', args: [String(revision.id), user.id, user.name, new Date().toISOString()] });
    }
    await tx.commit();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await tx.rollback();
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Review could not be recorded.' }, { status: 409 });
  } finally { tx.close(); }
}
