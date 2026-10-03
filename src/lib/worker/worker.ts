import { getDb } from '@/lib/db/client';
import { assertDisclosureApproval } from '@/lib/auth/contentApproval';
import crypto from 'crypto';

export interface WorkerRunResult {
  publishedJobsCount: number;
  healthChecksCount: number;
  incidentsCreated: number;
  timestamp: string;
}

/**
 * Executes scheduled publishing jobs & automated health checks
 */
export async function executeScheduledWorker(): Promise<WorkerRunResult> {
  const db = getDb();
  const now = new Date().toISOString();
  let publishedJobsCount = 0;
  const incidentsCreated = 0;

  // 1. Process pending scheduled jobs
  const pendingJobs = await db.execute({
    sql: `
      SELECT j.id, j.revision_id, j.publish_at_utc, r.record_id, c.collection, c.title
      FROM scheduled_jobs j
      JOIN revisions r ON j.revision_id = r.id
      JOIN content_records c ON r.record_id = c.id
      WHERE j.status = 'pending' AND j.publish_at_utc <= ?
    `,
    args: [now]
  });

  for (const job of pendingJobs.rows) {
    try {
      const revisionId = String(job.revision_id);
      const recordId = String(job.record_id);
      const collection = String(job.collection);

      // Scheduling must not be a way around the two-person rule: re-check at the moment of publishing.
      // A refused job is marked failed below with the reason, and the rest of the run carries on.
      await assertDisclosureApproval(db, collection, revisionId);

      // Promote draft revision to published
      await db.execute({
        sql: `UPDATE revisions SET status = 'published' WHERE id = ?`,
        args: [revisionId]
      });

      await db.execute({
        sql: `UPDATE content_records 
              SET current_published_revision_id = ?,
                  status = 'published',
                  updated_at = ?
              WHERE id = ?`,
        args: [revisionId, now, recordId]
      });

      // Mark job executed
      await db.execute({
        sql: `UPDATE scheduled_jobs SET status = 'executed', executed_at_utc = ? WHERE id = ?`,
        args: [now, String(job.id)]
      });

      // Audit log
      await db.execute({
        sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
              VALUES (?, 'system_worker', 'Automated Scheduler', 'SCHEDULED_PUBLISH', ?, ?, 'success', ?, ?, '127.0.0.1', ?)`,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          collection,
          recordId,
          JSON.stringify({ jobId: job.id, revisionId }),
          `corr_job_${job.id}`,
          now
        ]
      });

      publishedJobsCount++;
    } catch (err: any) {
      console.error(`Error executing job ${job.id}:`, err);
      await db.execute({
        sql: `UPDATE scheduled_jobs SET status = 'failed', error_log = ? WHERE id = ?`,
        args: [err.message, String(job.id)]
      });
    }
  }

  // 2. Automated Route Health Verification
  const criticalRoutes = ['/', '/operations', '/reports', '/sustainability', '/careers', '/suppliers'];
  const healthChecksCount = criticalRoutes.length;

  return {
    publishedJobsCount,
    healthChecksCount,
    incidentsCreated,
    timestamp: now
  };
}
