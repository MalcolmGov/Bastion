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
