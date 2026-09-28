import { NextResponse } from 'next/server';
import { executeScheduledWorker } from '@/lib/worker/worker';
import { getCurrentUser } from '@/lib/auth/auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await executeScheduledWorker();

    return NextResponse.json({
      success: true,
      message: `Worker executed successfully. ${result.publishedJobsCount} jobs published, ${result.healthChecksCount} health checks completed.`,
      result
    });
  } catch (error: any) {
    console.error('Worker run error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
