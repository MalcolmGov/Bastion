import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/client';
import { closeFixPR } from '@/lib/sre/github-pr';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { incidentId, reason = 'Dismissed by engineer' } = body;

    if (!incidentId) {
      return NextResponse.json({ error: 'incidentId is required' }, { status: 400 });
    }

    const db = getDb();
    const result = await db.execute({
      sql: `SELECT * FROM incidents WHERE id = ?`,
      args: [incidentId]
    });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const incident: any = result.rows[0];

    // Close PR if open
    if (incident.pr_number) {
      await closeFixPR({
        owner: 'MalcolmGov',
        repo: 'Goldfields',
        prNumber: incident.pr_number
      });
    }

    const timeline = incident.timeline_json ? JSON.parse(incident.timeline_json) : [];
    timeline.push({
      time: new Date().toISOString(),
      action: `AI proposed fix dismissed/rejected: ${reason}`,
      by: user.email
    });

    await db.execute({
      sql: `UPDATE incidents SET
        approval_status = 'rejected',
        pr_status = 'closed',
        status = 'resolved',
        resolved_at = ?,
        timeline_json = ?
      WHERE id = ?`,
      args: [
        new Date().toISOString(),
        JSON.stringify(timeline),
        incidentId
      ]
    });

    return NextResponse.json({
      success: true,
      incidentId,
      message: 'Incident dismissed and associated PR closed.'
    });
  } catch (error: any) {
    console.error('[Bastion SRE Reject Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
