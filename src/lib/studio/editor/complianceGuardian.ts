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
  remedyPatch: RemedyPatch | null;
}

export interface ComplianceAuditReport {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F' | '—';
  status: 'clean' | 'advisories' | 'non_compliant' | 'not_scanned';
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
  { id: 'forecast', category: 'jse_regulatory', severity: 'critical', ruleTitle: 'Unqualified financial forecast', statutoryReference: 'Forward-looking statement review', explanation: 'Confirm the forecast, supporting evidence and appropriate cautionary disclosures with the responsible reviewer.', pattern: /\b(?:will guarantee|guaranteed to increase|will surge|will reach \d+% growth|projected dividend of [R$]\d+|profits will expand by \d+%)\b/i, generateRemedy: () => 'Human review required: verify the forecast and its qualifications against the source.' },
  { id: 'forecast_context', category: 'jse_regulatory', severity: 'warning', ruleTitle: 'Forecast context needs review', statutoryReference: 'Forward-looking statement review', explanation: 'This phrase alone does not establish whether the necessary context or qualifications are present elsewhere.', pattern: /\b(?:targeting \d+% margin expansion|expects headline earnings to reach)\b/i, generateRemedy: () => 'Check the complete source disclosure; do not assume audit or review status.' },
  { id: 'absolute_esg', category: 'esg_greenwashing', severity: 'critical', ruleTitle: 'Absolute environmental claim', statutoryReference: 'Environmental claim evidence review', explanation: 'Check the scope, baseline and evidence supporting this claim. The scanner cannot verify them.', pattern: /\b(?:100% (?:green|eco-friendly|sustainable)|completely carbon neutral|zero-carbon operations|zero-emissions mining)\b/i, generateRemedy: () => 'Human review required: supply verified scope and evidence, or remove the unsupported claim.' },
  { id: 'esg_baseline', category: 'esg_greenwashing', severity: 'warning', ruleTitle: 'Reduction baseline needs review', statutoryReference: 'Environmental disclosure review', explanation: 'Confirm the applicable base year, measurement scope and methodology in the source report.', pattern: /\b(?:reduced (?:our )?emissions by \d+%|cutting carbon footprint by \d+%)/i, generateRemedy: () => 'Check the source for the actual baseline and scope. No baseline has been inferred.' },
  { id: 'assurance', category: 'esg_greenwashing', severity: 'advisory', ruleTitle: 'Assurance context needs review', statutoryReference: 'Non-financial reporting review', explanation: 'This check cannot establish whether third-party assurance exists.', pattern: /\b(?:Scope 1 & 2 GHG Reduction|Water Recycled in Operations)\b/i, generateRemedy: () => 'Verify any assurance statement with the source; do not add one without evidence.' },
  { id: 'privacy', category: 'popia_privacy', severity: 'warning', ruleTitle: 'Privacy notice needs review', statutoryReference: 'Privacy and consent review', explanation: 'Review the actual data processing purpose, lawful basis, notice and consent flow. Text replacement alone cannot establish lawful processing.', pattern: /\b(?:subscribe to investor alerts|submit your contact details|register for results presentation|join our shareholder mailing list)\b/i, generateRemedy: () => 'Have the responsible reviewer check the privacy notice and consent controls.' },
  { id: 'tone', category: 'brand_integrity', severity: 'advisory', ruleTitle: 'Promotional wording', statutoryReference: 'Editorial tone review', explanation: 'Consider neutral wording appropriate for corporate reporting.', pattern: /\b(?:massive profits|skyrocketing returns|killing it in the market|unbeatable yield|free money|supercharge your portfolio)\b/i, generateRemedy: (match) => /profits/i.test(match) ? 'reported profits' : /returns/i.test(match) ? 'reported returns' : /yield/i.test(match) ? 'reported yield' : 'investment performance' },
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
    if (section.visible === false) continue;
    const fields = extractScannableTextFields(section);

    for (const field of fields) {
      for (const rule of COMPLIANCE_RULESET) {
        checksRun++;
        const match = field.text.match(rule.pattern);
        if (match && match[0]) {
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
            remedyPatch: rule.category === 'brand_integrity' ? {
              sectionId: section.id,
              fieldPath: field.fieldPath,
              targetText: flaggedSnippet,
              replacementValue: suggestedReplacement,
            } : null,
          });
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

  if (!checksRun) { score = 0; grade = '—'; status = 'not_scanned'; }
  const summary = !checksRun ? 'No eligible text was scanned.' : issues.length
    ? `${issues.length} wording concerns need review. These pattern checks do not determine legal compliance.`
    : 'No matching wording concerns found. These limited pattern checks do not verify facts, assurance, consent flows or legal compliance.';

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
  patch: RemedyPatch | null
): SectionInstance[] {
  if (!patch) return sections;
  return sections.map((sec) => {
    if (sec.id !== patch.sectionId) return sec;

    const clonedProps = JSON.parse(JSON.stringify(sec.props || {}));

    // Resolve path: e.g. "props.title" or "props.caseStudies[0].outcome"
    const cleanPath = patch.fieldPath.replace(/^props\./, '');
    const tokens = cleanPath.split(/[.[\]]/).filter(Boolean);
    if (!tokens.length || tokens.some(token => ['__proto__', 'constructor', 'prototype'].includes(token))) return sec;

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
