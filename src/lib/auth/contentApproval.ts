import type { Client } from '@libsql/client';

export async function assertDisclosureApproval(
  db: Pick<Client, 'execute'>,
  collection: string,
  revisionId: string
): Promise<void> {
  if (!['reports', 'news'].includes(collection)) return;
  const approved = await db.execute({
    sql: `SELECT a.id FROM approvals a JOIN revisions r ON r.id = a.revision_id
          WHERE a.revision_id = ? AND a.decision = 'approved'
          AND (r.author_id IS NULL OR a.reviewer_id != r.author_id)
          AND a.content_hash_at_approval = r.content_hash LIMIT 1`,
    args: [revisionId]
  });
  if (approved.rows.length === 0) {
    throw new Error('Independent approval of the current disclosure revision is required');
  }
}

/**
 * assertDisclosureApproval for callers that only hold a record id, such as the scheduled-publish code
 * paths. Without an explicit revision it checks the one publishing would promote: the current draft,
 * else the current published revision. A record that does not exist has nothing to publish and passes.
 */
export async function assertRecordApproval(
  db: Pick<Client, 'execute'>,
  recordId: string,
  revisionId?: string
): Promise<void> {
  const record = await db.execute({
    sql: `SELECT collection, COALESCE(current_draft_revision_id, current_published_revision_id) AS revision_id
          FROM content_records WHERE id = ? LIMIT 1`,
    args: [recordId]
  });
  if (record.rows.length === 0) return;
  await assertDisclosureApproval(db, String(record.rows[0].collection), revisionId ?? String(record.rows[0].revision_id ?? ''));
}
