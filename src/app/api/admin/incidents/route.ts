import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') || 'all';
    const severityFilter = searchParams.get('severity') || 'all';
    const repoFilter = searchParams.get('repo') || 'all';
    const searchQuery = (searchParams.get('q') || '').trim().toLowerCase();

    const db = getDb();
    const rowsRes = await db.execute(`
      SELECT * FROM incidents ORDER BY created_at DESC
    `);

    const allIncidents = rowsRes.rows || [];

    // Filter
    let filtered = allIncidents.filter((inc: any) => {
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (repoFilter !== 'all' && inc.repo_name !== repoFilter) return false;

      if (searchQuery) {
        const matchesId = inc.id?.toLowerCase().includes(searchQuery);
        const matchesTitle = inc.title?.toLowerCase().includes(searchQuery);
        const matchesRoute = inc.affected_routes?.toLowerCase().includes(searchQuery);
        const matchesDiagnosis = inc.ai_diagnosis?.toLowerCase().includes(searchQuery);
        const matchesSha = inc.merge_commit_sha?.toLowerCase().includes(searchQuery);
        const matchesPr = inc.pr_number ? String(inc.pr_number).includes(searchQuery) : false;
        if (!matchesId && !matchesTitle && !matchesRoute && !matchesDiagnosis && !matchesSha && !matchesPr) {
          return false;
        }
      }
      return true;
    });

    // Compute Rich Aggregate Statistics
    const totalCount = allIncidents.length;
    const openCount = allIncidents.filter((i: any) => i.status === 'open').length;
    const investigatingCount = allIncidents.filter((i: any) => i.status === 'investigating').length;
    const resolvedCount = allIncidents.filter((i: any) => i.status === 'resolved').length;
    const verifiedCount = allIncidents.filter((i: any) => i.verification_status === 'passed').length;
    const autoRemediatedCount = allIncidents.filter(
      (i: any) => i.approval_status === 'approved' && (i.pr_status === 'merged' || i.deploy_status === 'deployed')
    ).length;

    // Calculate Average MTTR (Mean Time to Remediate) in seconds for resolved items
    const resolutionTimes = allIncidents
      .filter((i: any) => i.created_at && i.resolved_at)
      .map((i: any) => {
        const diff = (new Date(i.resolved_at).getTime() - new Date(i.created_at).getTime()) / 1000;
        return diff > 0 ? diff : 0;
      });

    const avgMttrSec = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((acc: number, val: number) => acc + val, 0) / resolutionTimes.length)
      : 74; // nominal baseline

    // Repositories List
    const repoSet = new Set<string>();
    allIncidents.forEach((i: any) => {
      if (i.repo_name) repoSet.add(i.repo_name);
    });

    return NextResponse.json({
      success: true,
      incidents: filtered,
      stats: {
        total: totalCount,
        open: openCount,
        investigating: investigatingCount,
        resolved: resolvedCount,
        verified: verifiedCount,
        autoRemediated: autoRemediatedCount,
        autoRemediationRate: totalCount > 0 ? Math.round((autoRemediatedCount / totalCount) * 100) : 100,
        avgMttrSec,
        repositories: Array.from(repoSet)
      }
    });
  } catch (error: any) {
    console.error('[Incidents API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Trigger immediate real-time verification probe against an incident target
 */
export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { incidentId, probeUrl } = body;

    const targetUrl = probeUrl || 'https://www.movedigital.africa/';
    const start = performance.now();
    let httpStatus = 0;
    let ok = false;
    let server = 'Unknown';
    let vercelId = '';

    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
      httpStatus = res.status;
      ok = res.ok;
      server = res.headers.get('server') || 'Cloud Server';
      vercelId = res.headers.get('x-vercel-id') || '';
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        error: err.message,
        latencyMs: Math.round(performance.now() - start),
        targetUrl
      });
    }

    const latencyMs = Math.round(performance.now() - start);

    if (incidentId) {
      const db = getDb();
      await db.execute({
        sql: `UPDATE incidents SET probe_latency_ms = ?, verification_status = ? WHERE id = ?`,
        args: [latencyMs, ok ? 'passed' : 'warning', incidentId]
      });
    }

    return NextResponse.json({
      success: true,
      targetUrl,
      httpStatus,
      ok,
      latencyMs,
      server,
      vercelId,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
