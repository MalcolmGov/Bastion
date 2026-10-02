import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { isAgencyUser } from '@/lib/auth/roles';
import { resolveTargetClientId } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const targetClientId = resolveTargetClientId(user, req);
    const scoped = Boolean(targetClientId);
    const clientId = targetClientId || '';

    const statusCounts = await db.execute({
      sql: `SELECT status, COUNT(*) as count FROM content_records ${scoped ? 'WHERE client_id = ?' : ''} GROUP BY status`,
      args: scoped ? [clientId] : []
    });

    const collectionCounts = await db.execute({
      sql: `SELECT collection, COUNT(*) as count FROM content_records ${scoped ? 'WHERE client_id = ?' : ''} GROUP BY collection`,
      args: scoped ? [clientId] : []
    });

    const pendingItems = await db.execute({
      sql: `
      SELECT r.id, r.collection, r.slug, r.title, r.status, r.updated_at, u.name as owner_name, r.client_id
      FROM content_records r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.status IN ('in_review', 'approved', 'draft') ${scoped ? 'AND r.client_id = ?' : ''}
      ORDER BY r.updated_at DESC
      LIMIT 10
    `,
      args: scoped ? [clientId] : []
    });

    const auditLogs = await db.execute({
      sql: `
      SELECT id, actor_name, action, collection, record_id, result, created_at
      FROM audit_log
      ${scoped ? 'WHERE client_id = ?' : ''}
      ORDER BY created_at DESC
      LIMIT 8
    `,
      args: scoped ? [clientId] : []
    });

    const incidents = scoped
      ? { rows: [] as any[] }
      : await db.execute(`
      SELECT id, title, severity, status, affected_routes, created_at
      FROM incidents
      WHERE status != 'resolved'
      ORDER BY created_at DESC
    `);

    const mediaCountRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM media_assets ${scoped ? 'WHERE client_id = ?' : ''}`,
      args: scoped ? [clientId] : []
    });
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
