import { NextRequest, NextResponse } from 'next/server';
import { getSiteSlaMetrics, MONITORED_PROPERTIES } from '@/lib/sre/prober-daemon';
import { getDb } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('site') || 'site_movedigital';

    const slaData = await getSiteSlaMetrics(siteId);

    // Fetch public resolved incidents (sanitized without internal code diffs)
    const db = getDb();
    const incRes = await db.execute(`
      SELECT id, title, severity, status, affected_routes, created_at, resolved_at, pr_number, verification_status
      FROM incidents
      WHERE status = 'resolved'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const publicIncidents = (incRes.rows || []).map((inc: any) => ({
      id: inc.id,
      title: inc.title,
      severity: inc.severity,
      status: inc.status,
      impact: inc.severity === 'high' ? 'Major Service Degradation' : 'Minor Route Telemetry Resilience',
      createdAt: inc.created_at,
      resolvedAt: inc.resolved_at,
      verificationStatus: inc.verification_status || 'passed'
    }));

    return NextResponse.json({
      success: true,
      monitoredProperties: MONITORED_PROPERTIES,
      currentSite: slaData,
      incidents: publicIncidents
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
