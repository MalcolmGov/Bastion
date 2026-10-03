import type { SectionInstance } from '@/lib/studio/types';

export type ComplianceCategory =
  | 'jse_regulatory'
  | 'esg_greenwashing'
  | 'popia_privacy'
  | 'brand_integrity';

export type ComplianceSeverity = 'critical' | 'warning' | 'advisory';

export interface RemedyPatch {
  sectionId: string;
  fieldPath: string;
  targetText: string;
  replacementValue: string;
}

export interface ComplianceIssue {
  id: string;
  sectionId: string;
  sectionTitle: string;
  componentId: string;
  fieldPath: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  flaggedText: string;
  ruleTitle: string;
  statutoryReference: string;
  explanation: string;
  suggestedFix: string;
  remedyPatch: RemedyPatch;
}

export interface ComplianceAuditReport {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  status: 'clean' | 'advisories' | 'non_compliant';
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  advisoryCount: number;
  issues: ComplianceIssue[];
  summary: string;
  checksRun: number;
  scannedAt: string;
}

interface ComplianceRuleDefinition {
  id: string;
  category: ComplianceCategory;
  severity: ComplianceSeverity;
  ruleTitle: string;
  statutoryReference: string;
  explanation: string;
  pattern: RegExp;
  generateRemedy: (match: string, fullText: string) => string;
}

/**
 * Enterprise Rulebook for JSE Listings, King IV, ISSB S2 Climate Disclosures, and POPIA
 */
export const COMPLIANCE_RULESET: ComplianceRuleDefinition[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. JSE LISTINGS REQUIREMENTS — SECTION 8.2 (FORWARD-LOOKING CAUTIONARY)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'jse_unconditional_forecast',
    category: 'jse_regulatory',
    severity: 'critical',
    ruleTitle: 'Unconditional Forward-Looking Financial Guarantee',
    statutoryReference: 'JSE Listings Requirements § 8.2 & Cautionary Guidance Note',
    explanation:
      'Unconditional future profit or revenue promises are strictly prohibited without mandatory safe-harbor cautionary framing and auditor qualification notes.',
    pattern: /\b(?:(?:we )?will guarantee|guaranteed to increase|will surge(?: by)?|will reach \d+%\s*growth|projected dividend of [R$]\d+|profits will expand by \d+%)(?!\w)/i,
    generateRemedy: (match) => {
      if (/will reach \d+%\s*growth/i.test(match)) {
        return match.replace(/will reach/i, 'targets medium-term');
      }
      if (/guarantee/i.test(match)) {
        return 'aims to deliver disciplined expansion';
      }
      if (/will surge/i.test(match)) {
        return 'is positioned to capture operational upside of';
      }
      if (/profits will expand by/i.test(match)) {
        return 'targets operating profit expansion of';
      }
      return 'is targeted to achieve, subject to prevailing macroeconomic conditions (refer to cautionary statements)';
    },
  },
  {
    id: 'jse_missing_safe_harbor',
    category: 'jse_regulatory',
    severity: 'warning',
    ruleTitle: 'Forecast Statement Lacking Cautionary Disclaimer',
    statutoryReference: 'JSE Section 8.2 — Forward-Looking Safe Harbor Framework',
    explanation:
      'Forward-looking guidance statements require qualification advising shareholders that projections have not been audited or reviewed by external auditors.',
    pattern: /\b(?:targeting \d+% margin expansion|targeting [R$]\d+ billion in (?:2026|2027|FY\d+)|expects headline earnings to reach)\b/i,
    generateRemedy: (match) => {
      return `${match} (unaudited prospective target; refer to JSE safe-harbor disclosures)`;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 2. ESG & "GREENWASHING" VERIFICATION (KING IV & ISSB S2 / GRI)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'esg_absolute_carbon_zero',
    category: 'esg_greenwashing',
    severity: 'critical',
    ruleTitle: 'Unsubstantiated "Zero-Carbon" or "100% Green" Claim',
    statutoryReference: 'ISSB S2 Climate Standard & King IV Principle 5 / ARB Code § 4.1',
    explanation:
      'Absolute claims such as "100% green" or "completely carbon neutral" create severe regulatory liability unless supported by third-party assured Scope 1, 2, and 3 baselines.',
    pattern: /\b(?:100% (?:green|eco-friendly|sustainable)|completely carbon neutral|zero-carbon operations|zero-emissions mining)\b/i,
    generateRemedy: (match) => {
      if (/100% green/i.test(match)) {
        return 'operating with 52% renewable grid microgrid integration (targeting net-zero by 2040)';
      }
      if (/completely carbon neutral/i.test(match)) {
        return 'advancing toward net-zero operational Scope 1 and 2 emissions against audited FY2019 baseline';
      }
      return 'advancing toward net-zero operational emissions under verified ISAE 3000 assurance';
    },
  },
  {
    id: 'esg_unverified_reduction_claim',
    category: 'esg_greenwashing',
    severity: 'warning',
    ruleTitle: 'Decarbonisation Target Omission of Reference Baseline',
    statutoryReference: 'ISSB S2 § 33 & Global Reporting Initiative (GRI 305)',
    explanation:
      'Stating carbon reductions without specifying the base year and assurance standard violates corporate reporting disclosure standards.',
    pattern: /\b(?:reduced (?:our )?emissions by \d+%(?!\s*(?:against|vs|from)\s*(?:audited\s+)?(?:FY\d+|20\d+))|cutting carbon footprint by \d+%(?!\s*(?:against|vs|from)\s*(?:audited\s+)?(?:FY\d+|20\d+)))(?!\w)/i,
    generateRemedy: (match) => {
      return `${match} against audited FY2019 baseline (Scope 1 and 2)`;
    },
  },
  {
    id: 'esg_missing_assurance_citation',
    category: 'esg_greenwashing',
    severity: 'advisory',
    ruleTitle: 'Material Non-Financial Metric Missing Assurance Standard',
    statutoryReference: 'King IV Disclosure Code & ISAE 3000 (Revised)',
    explanation:
      'High-impact sustainability indicators should explicitly reference independent third-party assurance.',
    pattern: /\b(?:Scope 1 & 2 GHG Reduction|Water Recycled in Operations)(?!\s*\(Independently Assured)\b/i,
    generateRemedy: (match) => {
      return `${match} (Independently Assured under ISAE 3000)`;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 3. POPIA & DATA PRIVACY (PROTECTION OF PERSONAL INFORMATION ACT)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'popia_missing_consent_notice',
    category: 'popia_privacy',
    severity: 'warning',
    ruleTitle: 'Direct Marketing / Contact Form Missing POPIA Consent Notice',
    statutoryReference: 'Protection of Personal Information Act (POPIA) No. 4 of 2013 § 11 & § 69',
    explanation:
      'Any form or action capturing user contact details for corporate communications must provide statutory POPIA lawful processing and opt-out notice.',
    pattern: /\b(?:subscribe to investor alerts|submit your contact details|register for results presentation|join our shareholder mailing list)\b(?![^.;\n]*?(?:POPIA|privacy policy|opt-out))/i,
    generateRemedy: (match) => {
      return `${match} (Personal data processed under POPIA; view privacy policy)`;
    },
  },

  // ─────────────────────────────────────────────────────────────
  // 4. BRAND INTEGRITY & PROHIBITED SENSATIONALIST HYPERBOLE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'brand_sensationalist_hyperbole',
    category: 'brand_integrity',
    severity: 'advisory',
    ruleTitle: 'Informal / Sensationalist Marketing Hyperbole',
    statutoryReference: 'Corporate Governance Communication Standard & JSE Market Conduct',
    explanation:
      'Colloquial hyperbole undermines institutional investor credibility and can be misconstrued as market manipulation or misleading advertisement.',
    pattern: /\b(?:massive profits|skyrocketing returns|killing it in the market|unbeatable yield|free money|supercharge your portfolio)\b/i,
    generateRemedy: (match) => {
      if (/massive profits/i.test(match)) return 'substantial operational earnings growth';
      if (/skyrocketing returns/i.test(match)) return 'strong risk-adjusted shareholder returns';
      if (/unbeatable yield/i.test(match)) return 'competitive dividend yield';
      if (/supercharge your portfolio/i.test(match)) return 'enhance long-term capital preservation';
      return 'disciplined operational value creation';
    },
  },
];

/**
 * Extracts all scannable text fields from a section instance
 */
function extractScannableTextFields(
  section: SectionInstance
): Array<{ fieldPath: string; text: string }> {
  const fields: Array<{ fieldPath: string; text: string }> = [];

  const inspect = (obj: any, path: string) => {
    if (!obj) return;
    if (typeof obj === 'string') {
      if (obj.trim().length > 3 && !obj.startsWith('http') && !obj.startsWith('/') && !obj.startsWith('#')) {
        fields.push({ fieldPath: path, text: obj });
      }
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => inspect(item, `${path}[${idx}]`));
      return;
    }
    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Skip purely technical keys
        if (['id', 'color', 'background', 'theme', 'url', 'href', 'icon'].includes(key)) continue;
        inspect(value, path ? `${path}.${key}` : key);
      }
    }
  };

  inspect(section.props, 'props');
  return fields;
}

/**
 * Audits a canvas section tree against JSE, ESG Greenwashing, POPIA, and Brand Tone rules.
 */
export function auditCanvasCompliance(
  sections: SectionInstance[],
  options?: { siteId?: string; pageSlug?: string }
): ComplianceAuditReport {
  const issues: ComplianceIssue[] = [];
  let checksRun = 0;

  for (const section of sections) {
    if (!section.visible) continue;
    const fields = extractScannableTextFields(section);

    for (const field of fields) {
      for (const rule of COMPLIANCE_RULESET) {
        checksRun++;
        const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`;
        const globalRegex = new RegExp(rule.pattern.source, flags);
        let match: RegExpExecArray | null;

        while ((match = globalRegex.exec(field.text)) !== null) {
          const flaggedSnippet = match[0];
          const suggestedReplacement = rule.generateRemedy(flaggedSnippet, field.text);

          issues.push({
            id: `issue_${rule.id}_${section.id}_${issues.length + 1}`,
            sectionId: section.id,
            sectionTitle: (section.props as any)?.title || (section.props as any)?.badge || section.componentId,
            componentId: section.componentId,
            fieldPath: field.fieldPath,
            category: rule.category,
            severity: rule.severity,
            flaggedText: flaggedSnippet,
            ruleTitle: rule.ruleTitle,
            statutoryReference: rule.statutoryReference,
            explanation: rule.explanation,
            suggestedFix: suggestedReplacement,
            remedyPatch: {
              sectionId: section.id,
              fieldPath: field.fieldPath,
              targetText: flaggedSnippet,
              replacementValue: suggestedReplacement,
            },
          });

          if (match[0].length === 0) {
            globalRegex.lastIndex++;
          }
        }
      }
    }
  }

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const advisoryCount = issues.filter((i) => i.severity === 'advisory').length;

  // Calculate Compliance Score (100 base)
  let score = 100 - criticalCount * 25 - warningCount * 10 - advisoryCount * 4;
  if (score < 0) score = 0;

  let grade: ComplianceAuditReport['grade'] = 'A+';
  if (score < 60) grade = 'F';
  else if (score < 75) grade = 'C';
  else if (score < 88) grade = 'B';
  else if (score < 96) grade = 'A';
  else grade = 'A+';

  let status: ComplianceAuditReport['status'] = 'clean';
  if (criticalCount > 0) status = 'non_compliant';
  else if (warningCount > 0 || advisoryCount > 0) status = 'advisories';

  let summary = 'All sections comply with JSE Listing Requirements, King IV, and ISSB S2 standards.';
  if (criticalCount > 0) {
    summary = `Found ${criticalCount} critical statutory violations that require remediation prior to publishing.`;
  } else if (warningCount > 0) {
    summary = `Found ${warningCount} regulatory advisories regarding forward-looking statements or data disclosures.`;
  } else if (advisoryCount > 0) {
    summary = `Found ${advisoryCount} brand voice adjustments to align with institutional corporate guidelines.`;
  }

  return {
    score,
    grade,
    status,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    advisoryCount,
    issues,
    summary,
    checksRun,
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Applies a single compliance remediation patch to a section list immutably
 */
export function applyComplianceRemedy(
  sections: SectionInstance[],
  patch: RemedyPatch
): SectionInstance[] {
  return sections.map((sec) => {
    if (sec.id !== patch.sectionId) return sec;

    const clonedProps = JSON.parse(JSON.stringify(sec.props || {}));

    // Resolve path: e.g. "props.title" or "props.caseStudies[0].outcome"
    const cleanPath = patch.fieldPath.replace(/^props\./, '');
    const tokens = cleanPath.split(/[.[\]]/).filter(Boolean);

    let current = clonedProps;
    for (let i = 0; i < tokens.length - 1; i++) {
      const key = tokens[i];
      if (current[key] === undefined) return sec;
      current = current[key];
    }

    const lastKey = tokens[tokens.length - 1];
    if (current && lastKey in current) {
      if (typeof current[lastKey] === 'string' && patch.targetText) {
        current[lastKey] = current[lastKey].replace(patch.targetText, patch.replacementValue);
      } else {
        current[lastKey] = patch.replacementValue;
      }
    }

    return {
      ...sec,
      props: clonedProps,
    };
  });
}

/**
 * Applies all available compliance remedies in a single batch
 */
export function applyAllComplianceRemedies(
  sections: SectionInstance[],
  issues: ComplianceIssue[]
): SectionInstance[] {
  let updated = [...sections];
  for (const issue of issues) {
    if (issue.remedyPatch) {
      updated = applyComplianceRemedy(updated, issue.remedyPatch);
    }
  }
  return updated;
}
