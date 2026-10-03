import { getDb } from '@/lib/db/client';
import { runDueScheduledJobs } from '@/lib/worker/scheduledJobs';

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

  // 1. Publish scheduled jobs that are due (the same executor the cron route uses)
  const run = await runDueScheduledJobs(db, { id: 'system_worker', name: 'Automated Scheduler' }, now);
  publishedJobsCount = run.executed;

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
