import { NextRequest, NextResponse } from 'next/server';
import { getLatestGovernanceAudit } from '@/lib/governance/governanceEngine';
import { ensureDbReady } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId') || 'client_goldfields';

    const db = await ensureDbReady();
    const clientRes = await db.execute({
      sql: 'SELECT id, name, slug, industry FROM clients WHERE id = ?',
      args: [clientId],
    });

    if (clientRes.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientRes.rows[0] as any;
    const audit = await getLatestGovernanceAudit(clientId);

    if (!audit) {
      return NextResponse.json({ error: 'No audit found for client' }, { status: 404 });
    }

    const report = {
      reportId: `REP-GOV-${new Date().getFullYear()}-${client.slug.toUpperCase()}`,
      clientName: client.name,
      clientId: client.id,
      industry: client.industry,
      evaluatedDate: audit.createdAt,
      auditor: 'Bastion Group Holdings — Corporate Governance & Secretariat Practice',
      overallComplianceScore: audit.overallScore,
      complianceStatus: audit.status,
      categoryScores: {
        popia: {
          name: 'POPIA (Act 4 of 2013) Data Privacy',
          score: audit.popiaScore,
          status: audit.popiaScore >= 80 ? 'Compliant' : 'Remediation Required',
        },
        paia: {
          name: 'PAIA (Act 2 of 2000) Section 51 Statutory Manual',
          score: audit.paiaScore,
          status: audit.paiaScore >= 80 ? 'Compliant' : 'Remediation Required',
        },
        kingIv: {
          name: 'King IV Corporate Governance Code (2016)',
          score: audit.kingIvScore,
          status: audit.kingIvScore >= 80 ? 'Compliant' : 'Remediation Required',
        },
        security: {
          name: 'Technical Web Security & Accessibility (WCAG 2.1 AA)',
          score: audit.securityScore,
          status: audit.securityScore >= 80 ? 'Compliant' : 'Remediation Required',
        },
      },
      summary: {
        totalRulesEvaluated: audit.totalChecks,
        passed: audit.passedChecks,
        warnings: audit.warningChecks,
        failed: audit.failedChecks,
      },
      criticalFindings: (audit.checks || [])
        .filter((c) => c.status !== 'pass')
        .map((c) => ({
          rule: c.title,
          statutoryRef: c.statutoryRef,
          status: c.status.toUpperCase(),
          severity: c.severity.toUpperCase(),
          evidence: c.evidenceText,
          remediationAdvice: c.remediationAdvice,
        })),
      boardroomRecommendation:
        audit.overallScore >= 85
          ? 'The Audit and Risk Committee is advised that digital disclosures and corporate website channels fulfill statutory King IV and POPIA obligations with minor administrative maintenance.'
          : 'The Audit and Risk Committee is advised to commission the Bastion Statutory Remediation Pack to resolve flagged POPIA Information Officer and Section 51 PAIA manual disclosures.',
    };

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/governance/report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate boardroom report' },
      { status: 500 }
    );
  }
}
