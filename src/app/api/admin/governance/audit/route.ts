import { NextRequest, NextResponse } from 'next/server';
import {
  runGovernanceAudit,
  getLatestGovernanceAudit,
  getGovernanceAuditHistory,
} from '@/lib/governance/governanceEngine';
import { requireUser, clientOwns } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId') || gate.user.client_id || 'client_goldfields';
    if (!clientOwns(gate.user, clientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let audit = await getLatestGovernanceAudit(clientId);

    // If no audit has been run yet for this client, run the initial baseline scan
    if (!audit) {
      audit = await runGovernanceAudit(clientId);
    }

    const history = await getGovernanceAuditHistory(clientId, 5);

    return NextResponse.json({
      success: true,
      audit,
      history,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/governance/audit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch governance audit' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { clientId, siteId } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }
    if (!clientOwns(gate.user, clientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const audit = await runGovernanceAudit(clientId, siteId);
    const history = await getGovernanceAuditHistory(clientId, 5);

    return NextResponse.json({
      success: true,
      audit,
      history,
      message: `Completed King IV & POPIA statutory audit for ${clientId}. Overall Compliance Score: ${audit.overallScore}% (${audit.status.toUpperCase()}).`,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/governance/audit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run governance audit' },
      { status: 500 }
    );
  }
}
