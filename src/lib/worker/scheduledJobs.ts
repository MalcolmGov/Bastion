import crypto from 'crypto';
import type { Client, Row } from '@libsql/client';
import { assertDisclosureApproval } from '@/lib/auth/contentApproval';

export interface ScheduledJobsRun {
  /** Jobs that published. */
  executed: number;
  /** Jobs refused or failed, now marked failed with the reason. */
  failed: number;
}

export interface JobActor {
  id: string;
  name: string;
}

/**
 * Publishes every scheduled job whose time has come. This is the one place that does it: the manual worker and the cron
 * route both call it, so they cannot disagree about the table or the rules.
 *
 * Each job runs in its own transaction that first claims the job. A worker and the cron running at the same moment
 * therefore publish it once, and a failure part-way through publishing leaves nothing half done: the revision, the record
 * and the audit entry all commit together, or the job is marked failed with the reason and nothing else changes.
 */
export async function runDueScheduledJobs(db: Client, actor: JobActor, now = new Date().toISOString()): Promise<ScheduledJobsRun> {
  const due = await db.execute({
    sql: `SELECT j.id, j.revision_id, r.record_id, c.collection
          FROM scheduled_jobs j
          JOIN revisions r ON r.id = j.revision_id
          JOIN content_records c ON c.id = r.record_id
          WHERE j.status = 'pending' AND j.publish_at_utc <= ?
          ORDER BY j.publish_at_utc ASC, j.id ASC`,
    args: [now]
  });

  const run: ScheduledJobsRun = { executed: 0, failed: 0 };
  for (const job of due.rows) {
    const outcome = await runJob(db, job, actor, now);
    if (outcome === 'executed') run.executed++;
    else if (outcome === 'failed') run.failed++;
  }
  return run;
}

async function runJob(db: Client, job: Row, actor: JobActor, now: string): Promise<'executed' | 'failed' | 'skipped'> {
  const jobId = String(job.id);
  const revisionId = String(job.revision_id);
  const recordId = String(job.record_id);
  const collection = String(job.collection);

  const tx = await db.transaction('write');
  let claimed = false;
  try {
    // Claim first: if another runner already took this job, there is nothing to do.
    const claim = await tx.execute({
      sql: `UPDATE scheduled_jobs SET status = 'executed', executed_at_utc = ? WHERE id = ? AND status = 'pending'`,
      args: [now, jobId]
    });
    if (!claim.rowsAffected) {
      await tx.rollback();
      return 'skipped';
    }
    claimed = true;

    // Scheduling must not be a way around the two-person rule: re-check at the moment of publishing.
    await assertDisclosureApproval(tx, collection, revisionId);

    await tx.execute({ sql: `UPDATE revisions SET status = 'published' WHERE id = ?`, args: [revisionId] });
    await tx.execute({
      sql: `UPDATE content_records SET current_published_revision_id = ?, status = 'published', updated_at = ? WHERE id = ?`,
      args: [revisionId, now, recordId]
    });
    await tx.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, 'SCHEDULED_PUBLISH', ?, ?, 'success', ?, ?, '127.0.0.1', ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        actor.id,
        actor.name,
        collection,
        recordId,
        JSON.stringify({ jobId, revisionId }),
        `corr_job_${jobId}`,
        now
      ]
    });
    await tx.commit();
    return 'executed';
  } catch (err: any) {
    await tx.rollback().catch(() => undefined);
    if (!claimed) {
      // Failed before the job was ours (for example the database was busy): leave it pending for the next run.
      console.warn(`[Scheduled Jobs] Job ${jobId} could not be started and stays pending:`, err?.message);
      return 'skipped';
    }
    console.error(`[Scheduled Jobs] Job ${jobId} failed:`, err?.message);
    await db.execute({
      sql: `UPDATE scheduled_jobs SET status = 'failed', error_log = ? WHERE id = ? AND status = 'pending'`,
      args: [String(err?.message || err), jobId]
    });
    return 'failed';
  } finally {
    tx.close();
  }
}
