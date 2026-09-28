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

    // 1. Content record status counts
    const statusCounts = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM content_records 
      GROUP BY status
    `);

    // 2. Collection breakdown
    const collectionCounts = await db.execute(`
      SELECT collection, COUNT(*) as count 
      FROM content_records 
      GROUP BY collection
    `);

    // 3. Pending approvals / review items
    const pendingItems = await db.execute(`
      SELECT r.id, r.collection, r.slug, r.title, r.status, r.updated_at, u.name as owner_name
      FROM content_records r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.status IN ('in_review', 'approved', 'draft')
      ORDER BY r.updated_at DESC
      LIMIT 10
    `);

    // 4. Recent audit activity
    const auditLogs = await db.execute(`
      SELECT id, actor_name, action, collection, record_id, result, created_at
      FROM audit_log
      ORDER BY created_at DESC
      LIMIT 8
    `);

    // 5. Active Incidents
    const incidents = await db.execute(`
      SELECT id, title, severity, status, affected_routes, created_at
      FROM incidents
      WHERE status != 'resolved'
      ORDER BY created_at DESC
    `);

    // 6. Media asset count
    const mediaCountRes = await db.execute(`SELECT COUNT(*) as count FROM media_assets`);
    const mediaCount = mediaCountRes.rows[0]?.count || 0;

    return NextResponse.json({
      statusCounts: statusCounts.rows,
      collectionCounts: collectionCounts.rows,
      pendingItems: pendingItems.rows,
      auditLogs: auditLogs.rows,
      incidents: incidents.rows,
      mediaCount
    });
  } catch (error: any) {
    console.error('Dashboard data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
