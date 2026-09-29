/**
 * Bastion Studio — Asynchronous Background Worker & Job Manager
 * 
 * Manages long-running extraction jobs, phase progress streaming,
 * and live terminal log telemetry.
 */

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface JobLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ExtractionJob {
  id: string;
  url: string;
  status: JobStatus;
  progress: number; // 0 to 100
  currentPhase: string;
  currentPhaseIndex: number;
  totalPhases: number;
  logs: JobLogEntry[];
  result: any | null;
  error: string | null;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Global in-memory registry across hot-reloads
const globalForJobs = globalThis as unknown as {
  __bastion_extraction_jobs?: Map<string, ExtractionJob>;
};

if (!globalForJobs.__bastion_extraction_jobs) {
  globalForJobs.__bastion_extraction_jobs = new Map();
}

const jobs = globalForJobs.__bastion_extraction_jobs;

// TTL cleanup: remove jobs older than 2 hours
function cleanupStaleJobs() {
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (new Date(job.createdAt).getTime() < cutoff) {
      jobs.delete(id);
    }
  }
}

export class JobManager {
  static createJob(url: string): ExtractionJob {
    cleanupStaleJobs();
    const id = `job_ext_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: ExtractionJob = {
      id,
      url,
      status: 'queued',
      progress: 0,
      currentPhase: 'Queued for headless extraction',
      currentPhaseIndex: 0,
      totalPhases: 8,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Job initialized for target: ${url}`
        }
      ],
      result: null,
      error: null,
      createdAt: new Date().toISOString()
    };
    jobs.set(id, job);
    return job;
  }

  static getJob(id: string): ExtractionJob | undefined {
    return jobs.get(id);
  }

  static updateProgress(
    id: string,
    phaseIndex: number,
    phaseName: string,
    progressPercentage: number
  ) {
    const job = jobs.get(id);
    if (!job) return;

    job.status = 'running';
    if (!job.startedAt) job.startedAt = new Date().toISOString();
    job.currentPhaseIndex = phaseIndex;
    job.currentPhase = phaseName;
    job.progress = Math.min(100, Math.max(job.progress, progressPercentage));

    job.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `[Phase ${phaseIndex}/${job.totalPhases}] ${phaseName} (${job.progress}%)`
    });
  }

  static appendLog(
    id: string,
    message: string,
    level: 'info' | 'warn' | 'error' | 'success' = 'info'
  ) {
    const job = jobs.get(id);
    if (!job) return;
    job.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message
    });
  }

  static completeJob(id: string, result: any) {
    const job = jobs.get(id);
    if (!job) return;
    job.status = 'completed';
    job.progress = 100;
    job.currentPhase = 'Brand Kit synthesized and verified';
    job.result = result;
    job.completedAt = new Date().toISOString();
    job.logs.push({
      timestamp: new Date().toISOString(),
      level: 'success',
      message: 'Extraction completed successfully. Ready for brand kit review.'
    });
  }

  static failJob(id: string, error: string) {
    const job = jobs.get(id);
    if (!job) return;
    job.status = 'failed';
    job.error = error;
    job.completedAt = new Date().toISOString();
    job.logs.push({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: `Extraction aborted: ${error}`
    });
  }

  static cancelJob(id: string): boolean {
    const job = jobs.get(id);
    if (!job) return false;
    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    job.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: 'Job cancelled by user request.'
    });
    return true;
  }
}
