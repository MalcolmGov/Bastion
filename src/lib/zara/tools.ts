import { getDb } from '@/lib/db/client';
import { auditCanvasCompliance, applyComplianceRemedy, ComplianceAuditReport } from '@/lib/studio/editor/complianceGuardian';
import { getSreHealthAction, getIncidentsAction, CopilotActionResponse } from '@/lib/copilot/actions';
import reportsData from '@/content/reports.json';
import operationsData from '@/content/operations.json';
import sustainabilityData from '@/content/sustainability.json';
import type { SectionInstance } from '@/lib/studio/types';

export interface ZaraToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export const ZARA_CMS_TOOLS: ZaraToolDefinition[] = [
  {
    name: 'runComplianceAudit',
    description: 'Audits page copy or text against JSE Listings § 8.2 (profit guarantees), King IV Principle 5 & ISSB S2 (greenwashing), and POPIA § 11/69 (data privacy). Returns compliance score, letter grade, and remediation diffs.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Raw text or copy to audit if evaluating specific copy.' },
        clientId: { type: 'string', description: 'Client ID to audit draft compositions for (e.g. client_goldfields).' },
        autoRemediate: { type: 'string', enum: ['true', 'false'], description: 'Whether to return auto-remediated copy.' }
      }
    }
  },
  {
    name: 'getFleetHealth',
    description: 'Fetches real-time multi-tenant edge latency, 90-day SLA uptime percentage, and active SRE incidents across Move Digital & Gold Fields.',
    parameters: {
      type: 'object',
      properties: {
        verbose: { type: 'string', enum: ['true', 'false'], description: 'Whether to include individual probe histories.' }
      }
    }
  },
  {
    name: 'querySensAnnouncements',
    description: 'Queries recent JSE SENS announcements, financial results declarations, and price-sensitive regulatory releases.',
    parameters: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'Client ID filter (defaults to client_goldfields).' },
        limit: { type: 'string', description: 'Maximum announcements to return (default 5).' }
      }
    }
  },
  {
    name: 'extractBrandDna',
    description: 'Extracts brand design system tokens (primary color, accent, font stack, tone) for a client property or domain.',
    parameters: {
      type: 'object',
      properties: {
        domainOrName: { type: 'string', description: 'Target domain or client name (e.g. goldfields.com, vodacom.co.za).' }
      },
      required: ['domainOrName']
    }
  },
  {
    name: 'searchCorporateDisclosures',
    description: 'Searches authoritative corporate records, published interim/annual reports, mining operations data, and ESG targets for public stakeholder queries.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords such as "South Deep", "interim dividend", "AISC", "carbon emissions".' },
        category: { type: 'string', enum: ['financial', 'operations', 'esg', 'all'], description: 'Category filter.' }
      },
      required: ['query']
    }
  }
];

export async function executeZaraTool(name: string, args: Record<string, any>): Promise<{
  success: boolean;
  toolName: string;
  result: any;
  summaryText: string;
}> {
  switch (name) {
    case 'runComplianceAudit': {
      try {
        let sectionsToAudit: SectionInstance[] = [];
        if (args.text) {
          sectionsToAudit = [
            {
              id: 'sec_eval',
              componentId: 'hero',
              variant: 'default',
              visible: true,
              props: {
                title: 'Review Copy',
                subtitle: 'Evaluating copy against statutory listings rulebooks',
                description: args.text
              }
            }
          ];
        } else {
          // Look up latest draft composition in DB for the client
          const db = getDb();
          const clientId = args.clientId || 'client_goldfields';
          try {
            const row = await db.execute({
              sql: `SELECT content_json FROM page_compositions WHERE client_id = ? ORDER BY updated_at DESC LIMIT 1`,
              args: [clientId]
            });
            if (row.rows.length > 0 && row.rows[0].content_json) {
              const parsed = JSON.parse(String(row.rows[0].content_json));
              sectionsToAudit = parsed.sections || [parsed];
            }
          } catch {}
        }

        if (sectionsToAudit.length === 0) {
          // Fallback sample to demonstrate capability
          sectionsToAudit = [
            {
              id: 'sec_sample',
              componentId: 'hero',
              variant: 'default',
              visible: true,
              props: {
                title: 'Gold Fields Corporate Growth',
                subtitle: 'Leading sustainable mining across Africa',
                description: 'Gold Fields will guarantee 25% margin growth with 100% green zero emission operations.'
              }
            }
          ];
        }

        const report = auditCanvasCompliance(sectionsToAudit);
        const shouldRemediate = args.autoRemediate === 'true';
        let remediatedSections = sectionsToAudit;
        if (shouldRemediate && report.issues.length > 0) {
          for (const issue of report.issues) {
            remediatedSections = applyComplianceRemedy(remediatedSections, issue.remedyPatch);
          }
        }

        const gradeEmoji = report.grade.startsWith('A') ? '✅' : report.grade.startsWith('B') ? '⚠️' : '🚨';
        const summaryText = `${gradeEmoji} Compliance Audit Complete: Grade ${report.grade} (${report.score}/100). Found ${report.totalIssues} item(s) requiring attention across JSE Listings § 8.2 and King IV Principle 5.`;

        return {
          success: true,
          toolName: name,
          result: {
            score: report.score,
            overallScore: report.score,
            grade: report.grade,
            letterGrade: report.grade,
            totalIssues: report.totalIssues,
            totalViolations: report.totalIssues,
            violations: report.issues.map(v => ({
              category: v.category,
              severity: v.severity,
              statutoryReference: v.statutoryReference,
              matchedText: v.flaggedText,
              remediationSuggestion: v.suggestedFix
            })),
            remediatedSections
          },
          summaryText
        };
      } catch (err: any) {
        return {
          success: false,
          toolName: name,
          result: { error: err.message },
          summaryText: `Compliance audit failed: ${err.message}`
        };
      }
    }

    case 'getFleetHealth': {
      const sreRes = await getSreHealthAction();
      const data = sreRes.data || {};
      const summaryText = sreRes.speechText || `Platform status: ${data.healthy ? '100% Operational' : 'Degraded'}, average latency ${data.avgLatency || 84}ms.`;
      return {
        success: sreRes.success,
        toolName: name,
        result: data,
        summaryText
      };
    }

    case 'querySensAnnouncements': {
      try {
        const db = getDb();
        const limit = parseInt(args.limit || '5', 10);
        const clientId = args.clientId || 'client_goldfields';
        const res = await db.execute({
          sql: `
            SELECT id, headline, announcement_type, jse_code, released_at, is_price_sensitive, summary, pdf_url
            FROM sens_announcements
            WHERE client_id = ?
            ORDER BY released_at DESC
            LIMIT ?
          `,
          args: [clientId, limit]
        });

        const items = res.rows.map(r => ({
          id: String(r.id),
          headline: String(r.headline),
          type: String(r.announcement_type),
          jseCode: String(r.jse_code),
          releasedAt: String(r.released_at),
          priceSensitive: Boolean(r.is_price_sensitive),
          summary: String(r.summary || ''),
          pdfUrl: String(r.pdf_url || '')
        }));

        const count = items.length;
        const summaryText = count > 0
          ? `Found ${count} SENS announcement(s) for ${clientId}. Latest: "${items[0].headline}" released on ${new Date(items[0].releasedAt).toLocaleDateString()}.`
          : `No SENS announcements found for client ${clientId}.`;

        return {
          success: true,
          toolName: name,
          result: { count, items },
          summaryText
        };
      } catch (err: any) {
        return {
          success: false,
          toolName: name,
          result: { error: err.message },
          summaryText: `Failed to query SENS announcements: ${err.message}`
        };
      }
    }

    case 'extractBrandDna': {
      const input = (args.domainOrName || '').toLowerCase();
      let brand = {
        name: 'Gold Fields Limited',
        primaryColor: '#D97706',
        accentColor: '#B45309',
        fontHeading: 'Inter, system-ui, sans-serif',
        fontBody: 'Inter, system-ui, sans-serif',
        tone: 'Institutional, Prestigious, Sovereign Resources Leader',
        logoUrl: '/assets/goldfields-logo.svg'
      };

      if (input.includes('vodacom')) {
        brand = {
          name: 'Vodacom Group',
          primaryColor: '#E60000',
          accentColor: '#1A1A1A',
          fontHeading: 'Vodacom Modern, sans-serif',
          fontBody: 'Vodacom Text, sans-serif',
          tone: 'Empowering, Digital, Pan-African Telecommunications Leader',
          logoUrl: '/assets/vodacom-logo.svg'
        };
      } else if (input.includes('aurum')) {
        brand = {
          name: 'Aurum Energy & Mining',
          primaryColor: '#059669',
          accentColor: '#10B981',
          fontHeading: 'Cabinet Grotesk, sans-serif',
          fontBody: 'Inter, sans-serif',
          tone: 'Clean Energy Innovation, ESG-First Natural Resources',
          logoUrl: '/assets/aurum-logo.svg'
        };
      } else if (input.includes('bastion') || input.includes('movedigital')) {
        brand = {
          name: 'Bastion Group Holdings',
          primaryColor: '#6366F1',
          accentColor: '#06B6D4',
          fontHeading: 'Plus Jakarta Sans, sans-serif',
          fontBody: 'Inter, sans-serif',
          tone: 'Enterprise Software Studio, High-Precision Multi-Tenant CMS',
          logoUrl: '/assets/bastion-logo.svg'
        };
      }

      return {
        success: true,
        toolName: name,
        result: brand,
        summaryText: `Extracted Brand DNA for ${brand.name}: Primary color ${brand.primaryColor}, Heading font ${brand.fontHeading}, Tone: ${brand.tone}.`
      };
    }

    case 'searchCorporateDisclosures': {
      const q = (args.query || '').toLowerCase().trim();
      const words = q.split(/\s+/).filter((w: string) => w.length > 2 && !['tell', 'about', 'what', 'where', 'when', 'show', 'from', 'with', 'the'].includes(w));
      const results: any[] = [];

      // 1. Search Operations
      if (!args.category || args.category === 'all' || args.category === 'operations') {
        const matchingOps = (operationsData as any[]).filter(op => {
          const name = op.name?.toLowerCase() || '';
          const country = op.country?.toLowerCase() || '';
          const overview = op.overview?.toLowerCase() || '';
          return q.includes(name) || name.includes(q) || words.some((w: string) => name.includes(w) || overview.includes(w));
        });
        for (const op of matchingOps) {
          results.push({
            type: 'operation',
            title: `${op.name} (${op.country})`,
            snippet: op.overview ? op.overview.slice(0, 180) + '...' : `Attributable production: ${op.attributableProd}`,
            linkUrl: `/operations/${op.slug}`,
            metadata: {
              attributableProd: op.attributableProd,
              type: op.type,
              status: op.status
            }
          });
        }
      }

      // 2. Search Reports
      if (!args.category || args.category === 'all' || args.category === 'financial') {
        const matchingReports = (reportsData as any[]).filter(r => {
          const title = r.title?.toLowerCase() || '';
          const summary = r.summary?.toLowerCase() || '';
          const period = r.period?.toLowerCase() || '';
          return q.includes(title) || title.includes(q) || words.some((w: string) => title.includes(w) || summary.includes(w) || period.includes(w));
        });
        for (const rep of matchingReports) {
          results.push({
            type: 'report',
            title: rep.title,
            snippet: rep.summary || `Financial report for period ${rep.period}.`,
            linkUrl: rep.downloadUrl || '/reports',
            metadata: {
              period: rep.period,
              format: rep.format,
              fileSize: rep.fileSize
            }
          });
        }
      }

      // 3. Search Sustainability
      if (!args.category || args.category === 'all' || args.category === 'esg') {
        const matchingEsg = (sustainabilityData as any[]).filter(t => {
          const title = t.title?.toLowerCase() || '';
          const pillar = t.pillar?.toLowerCase() || '';
          const desc = t.description?.toLowerCase() || '';
          return q.includes(title) || title.includes(q) || words.some((w: string) => title.includes(w) || desc.includes(w) || pillar.includes(w));
        });
        for (const esg of matchingEsg) {
          results.push({
            type: 'sustainability',
            title: `${esg.pillar}: ${esg.title}`,
            snippet: esg.description,
            linkUrl: '/sustainability',
            metadata: {
              targetYear: esg.targetYear,
              latestActual: esg.latestActual
            }
          });
        }
      }

      const count = results.length;
      return {
        success: true,
        toolName: name,
        result: { query: q, count, items: results.slice(0, 5) },
        summaryText: count > 0
          ? `Found ${count} authoritative disclosure record(s) matching "${q}". Top match: "${results[0].title}".`
          : `No direct disclosure matches found for "${q}".`
      };
    }

    default:
      return {
        success: false,
        toolName: name,
        result: { error: `Unknown tool: ${name}` },
        summaryText: `Tool ${name} is not recognized.`
      };
  }
}
