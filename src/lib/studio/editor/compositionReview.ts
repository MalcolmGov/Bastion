import { approvePageVersion, assertPageApproved, PageApprovalError } from './pageApproval';
import { ensureDbReady } from '@/lib/db/client';
import { clientOwns, resolveTargetClientId } from '@/lib/auth/guard';
import { hasPermission, type StudioUser } from '@/lib/auth/auth';
import { EditorSaveError } from './saveComposition';
import crypto from 'node:crypto';

export async function ensureCompositionReviews() {
  const db = await ensureDbReady();
  await db.execute(`CREATE TABLE IF NOT EXISTS composition_reviews (
    composition_id TEXT NOT NULL, version INTEGER NOT NULL, requested_by TEXT NOT NULL,
    requested_by_name TEXT NOT NULL, requested_at TEXT NOT NULL,
    decision TEXT NOT NULL DEFAULT 'pending', reviewer_id TEXT, reviewer_name TEXT,
    reviewed_at TEXT, comment TEXT, published_at TEXT,
    PRIMARY KEY(composition_id,version))`);
  return db;
}

export async function listCompositionReviews(user: StudioUser, request?: Request) {
  const db = await ensureCompositionReviews();
  const clientId = resolveTargetClientId(user, request);
  const rows = (await db.execute({
    sql: `SELECT c.id,c.site_id,c.page_slug,c.title,c.version,c.status,w.name AS site_name,w.client_id,
      r.requested_by,r.requested_by_name,r.requested_at,r.decision,r.reviewer_name,r.reviewed_at,r.comment
      FROM page_compositions c JOIN websites w ON w.id=c.site_id
      JOIN composition_reviews r ON r.composition_id=c.id AND r.version=c.version
      WHERE c.status IN ('in_review','approved','changes_requested') ${clientId ? 'AND w.client_id=?' : ''}
      ORDER BY r.requested_at DESC LIMIT 100`, args: clientId ? [clientId] : [],
  })).rows;
  return rows;
}

export async function readCompositionReview(user: StudioUser, id: string) {
  const db = await ensureCompositionReviews();
  const row = (await db.execute({sql: `SELECT c.*,w.client_id,r.decision,r.requested_by,r.requested_by_name,r.reviewer_name,r.comment
    FROM page_compositions c JOIN websites w ON w.id=c.site_id
    JOIN composition_reviews r ON r.composition_id=c.id AND r.version=c.version WHERE c.id=?`, args:[id]})).rows[0];
  if (!row || !clientOwns(user, String(row.client_id))) throw new EditorSaveError('Review not found.',404);
  const live = (await db.execute({sql: `SELECT version,sections_json FROM page_versions WHERE composition_id=? AND status='published' ORDER BY version DESC LIMIT 1`,args:[id]})).rows[0];
  return {...row, sections:JSON.parse(String(row.sections_json)), live:live ? {version:Number(live.version),sections:JSON.parse(String(live.sections_json))} : null};
}

export async function decideCompositionReview(user: StudioUser, id: string, input: {action:string; expectedVersion:number; comment?:string}) {
  if(typeof id !== 'string' || !id || !input) throw new EditorSaveError('Choose a page review.',400);
  const permission = input.action === 'publish' ? 'content:publish' : input.action === 'approve' ? 'content:approve' : input.action === 'request_changes' ? 'content:request_changes' : '';
  if (!permission || !hasPermission(user.role,permission)) throw new EditorSaveError('You cannot perform this review action.',403);
  if (!Number.isSafeInteger(input.expectedVersion) || input.expectedVersion < 1) throw new EditorSaveError('Choose a saved version to review.',400);
  const db = await ensureCompositionReviews();
  const tx = await db.transaction('write');
  try {
    const row = (await tx.execute({sql: `SELECT c.*,w.client_id,r.decision,r.requested_by FROM page_compositions c
      JOIN websites w ON w.id=c.site_id JOIN composition_reviews r ON r.composition_id=c.id AND r.version=c.version WHERE c.id=?`,args:[id]})).rows[0];
    if (!row || !clientOwns(user,String(row.client_id))) throw new EditorSaveError('Review not found.',404);
    if (Number(row.version) !== input.expectedVersion) throw new EditorSaveError('This page changed. Reload and review the latest version.',409);
    if (input.action === 'publish') {
      if (row.decision !== 'approved' || row.status !== 'approved') throw new EditorSaveError('An independent reviewer must approve this exact version before publication.',409);
    } else {
      if (row.status !== 'in_review' || row.decision !== 'pending') throw new EditorSaveError('This version is no longer awaiting review.',409);
      if (row.requested_by === user.id) throw new EditorSaveError('A different person must review this version.',403);
    }
    if(input.action==='approve') await approvePageVersion(user,{siteId:String(row.site_id),pageSlug:String(row.page_slug),version:input.expectedVersion},{transaction:tx});
    if(input.action==='publish') await assertPageApproved(tx,id);
    const now = new Date().toISOString();
    const status = input.action === 'publish' ? 'published' : input.action === 'approve' ? 'approved' : 'changes_requested';
    await tx.execute({sql:'UPDATE page_compositions SET status=?,updated_at=? WHERE id=? AND version=?',args:[status,now,id,input.expectedVersion]});
    await tx.execute({sql:'UPDATE page_versions SET status=? WHERE composition_id=? AND version=?',args:[status,id,input.expectedVersion]});
    if (input.action === 'publish') await tx.execute({sql:'UPDATE composition_reviews SET published_at=? WHERE composition_id=? AND version=?',args:[now,id,input.expectedVersion]});
    else await tx.execute({sql:'UPDATE composition_reviews SET decision=?,reviewer_id=?,reviewer_name=?,reviewed_at=?,comment=? WHERE composition_id=? AND version=?',args:[status,user.id,user.name,now,String(input.comment || '').slice(0,4000),id,input.expectedVersion]});
    await tx.execute({sql:`INSERT INTO audit_log(id,actor_id,actor_name,action,collection,record_id,result,created_at) VALUES (?,?,?,?,?,?,'success',?)`,args:[`audit_${crypto.randomUUID()}`,user.id,user.name,`page_review_${input.action}_v${input.expectedVersion}`,'page_compositions',id,now]});
    await tx.commit(); return {success:true,status,version:input.expectedVersion};
  } catch(error) { await tx.rollback(); if(error instanceof PageApprovalError)throw new EditorSaveError(error.message,error.status); throw error; } finally { tx.close(); }
}
