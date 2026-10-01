import { NextRequest, NextResponse } from 'next/server';
import { JobManager } from '@/lib/studio/worker';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId query parameter.' },
        { status: 400 }
      );
    }

    const job = JobManager.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${jobId}' not found or expired.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        url: job.url,
        status: job.status,
        progress: job.progress,
        currentPhase: job.currentPhase,
        currentPhaseIndex: job.currentPhaseIndex,
        totalPhases: job.totalPhases,
        logs: job.logs,
        result: job.result,
        error: job.error,
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }
    });
  } catch (err: any) {
    console.error('[BrandExtractStatusAPI] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to check extraction status.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing jobId query parameter.' },
        { status: 400 }
      );
    }

    const cancelled = JobManager.cancelJob(jobId);

    return NextResponse.json({
      success: true,
      cancelled,
      message: cancelled ? 'Extraction job cancelled.' : 'Job not found.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to cancel extraction job.' },
      { status: 500 }
    );
  }
}
