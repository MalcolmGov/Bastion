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

    if (!Array.isArray(sections) || sections.length > 200 || sections.some(section=>!section || typeof section.id!=='string' || !section.props || typeof section.props!=='object')) {
      return NextResponse.json(
        { error: 'Invalid payload: sections must be an array.' },
        { status: 400 }
      );
    }

    if(JSON.stringify(sections).length>2_000_000) return NextResponse.json({error:'Page text is too large to scan.'},{status:413});
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
    scope: 'Limited editorial phrase checks; not a legal compliance certification.',
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
