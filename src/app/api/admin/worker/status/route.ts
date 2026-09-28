import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // 1. Pending & recent scheduled jobs
    const jobs = await db.execute(`
      SELECT j.*, u.name as created_by_name, r.record_id, c.collection, c.title
      FROM scheduled_jobs j
      LEFT JOIN revisions r ON j.revision_id = r.id
      LEFT JOIN content_records c ON r.record_id = c.id
      LEFT JOIN users u ON j.scheduled_by_id = u.id
      ORDER BY j.publish_at_utc DESC
      LIMIT 20
    `);

    // 2. Recent worker audit entries
    const workerLogs = await db.execute(`
      SELECT * FROM audit_log
      WHERE actor_id = 'system_worker' OR action LIKE 'WORKFLOW%'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      jobs: jobs.rows,
      logs: workerLogs.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
