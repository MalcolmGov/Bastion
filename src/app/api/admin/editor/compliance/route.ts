import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';
import {
  auditCanvasCompliance,
  COMPLIANCE_RULESET,
  type ComplianceAuditReport,
} from '@/lib/studio/editor/complianceGuardian';
import type { SectionInstance } from '@/lib/studio/types';

export async function POST(req: NextRequest) {
  const gate = await requirePermission('content:read');
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const { sections, siteId, pageSlug } = body;

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid payload: sections must be an array.' },
        { status: 400 }
      );
    }

    const report: ComplianceAuditReport = auditCanvasCompliance(
      sections as SectionInstance[],
      { siteId, pageSlug }
    );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('[Compliance Guardian API error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Compliance scan failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const gate = await requirePermission('content:read');
  if (!gate.ok) return gate.response;

  return NextResponse.json({
    success: true,
    activeJurisdictions: ['JSE (Johannesburg Stock Exchange)', 'King IV Corporate Governance', 'ISSB Climate Disclosures (IFRS S2)', 'POPIA (Republic of South Africa)'],
    rulesCount: COMPLIANCE_RULESET.length,
    rules: COMPLIANCE_RULESET.map((r) => ({
      id: r.id,
      category: r.category,
      severity: r.severity,
      title: r.ruleTitle,
      reference: r.statutoryReference,
      explanation: r.explanation,
    })),
  });
}
