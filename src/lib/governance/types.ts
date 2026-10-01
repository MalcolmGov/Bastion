export type GovernanceCategory = 'popia' | 'paia' | 'king_iv' | 'security';

export type RuleStatus = 'pass' | 'warning' | 'fail';

export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface GovernanceCheck {
  id: string;
  auditId: string;
  clientId: string;
  ruleId: string;
  category: GovernanceCategory;
  title: string;
  statutoryRef: string;
  status: RuleStatus;
  severity: RuleSeverity;
  scoreWeight: number;
  evidenceText?: string;
  remediationAdvice?: string;
  createdAt: string;
}

export interface GovernanceAudit {
  id: string;
  clientId: string;
  siteId: string;
  overallScore: number; // 0 - 100
  popiaScore: number; // 0 - 100
  paiaScore: number; // 0 - 100
  kingIvScore: number; // 0 - 100
  securityScore: number; // 0 - 100
  status: 'compliant' | 'needs_review' | 'non_compliant';
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  scannedBy: string;
  createdAt: string;
  checks?: GovernanceCheck[];
}

export const CATEGORY_LABELS: Record<GovernanceCategory, string> = {
  popia: 'POPIA (Act 4 of 2013)',
  paia: 'PAIA Section 51 Manual',
  king_iv: 'King IV Corporate Governance',
  security: 'Security & Web Accessibility (WCAG)',
};

export const CATEGORY_DESCRIPTIONS: Record<GovernanceCategory, string> = {
  popia: 'Protection of Personal Information Act statutory compliance, privacy notices, Information Officer particulars, and cookie tracking policies.',
  paia: 'Promotion of Access to Information Act Section 51 statutory manuals, request procedures, and Form 2 access fee disclosures.',
  king_iv: 'King IV Code on Corporate Governance (2016) Board composition, Audit/Remuneration/Ethics charters, and anonymous whistleblower hotline.',
  security: 'Transport-layer encryption (TLS 1.3), edge security headers (HSTS, nosniff, frame options), and WCAG 2.1 AA screen-reader accessibility.',
};

export const CATEGORY_WEIGHTS: Record<GovernanceCategory, number> = {
  popia: 0.30,
  paia: 0.20,
  king_iv: 0.35,
  security: 0.15,
};

export interface StatutoryRuleDefinition {
  ruleId: string;
  category: GovernanceCategory;
  title: string;
  statutoryRef: string;
  severity: RuleSeverity;
  scoreWeight: number;
  description: string;
  remediationAdvice: string;
}

export const STATUTORY_RULES: StatutoryRuleDefinition[] = [
  // ── POPIA (Act 4 of 2013) ──
  {
    ruleId: 'POPIA_PRIVACY_NOTICE',
    category: 'popia',
    title: 'Statutory Website Privacy Notice',
    statutoryRef: 'POPIA Act 4 of 2013, Section 18',
    severity: 'critical',
    scoreWeight: 25,
    description: 'Requires a conspicuous, published privacy statement outlining lawful grounds for processing personal information.',
    remediationAdvice: 'Publish a dedicated Privacy Notice detailing data collection purposes, retention periods, and data subject rights.',
  },
  {
    ruleId: 'POPIA_INFO_OFFICER',
    category: 'popia',
    title: 'Registered Information Officer Contact Particulars',
    statutoryRef: 'POPIA Act 4 of 2013, Section 55 & 56',
    severity: 'critical',
    scoreWeight: 25,
    description: 'Information Officer and Deputy Information Officer physical address, direct email, and phone contact must be published.',
    remediationAdvice: 'Ensure the designated Information Officer email and telephone particulars are published in the legal/privacy section.',
  },
  {
    ruleId: 'POPIA_COOKIE_CONSENT',
    category: 'popia',
    title: 'Active Cookie & Analytics Consent Banner',
    statutoryRef: 'POPIA Act 4 of 2013, Section 11',
    severity: 'high',
    scoreWeight: 25,
    description: 'Mandatory opt-in or transparent notice mechanism for marketing, analytics, and session cookies.',
    remediationAdvice: 'Activate the Bastion Cookie Consent Banner with explicit categories for Essential, Analytical, and Marketing cookies.',
  },
  {
    ruleId: 'POPIA_CROSS_BORDER',
    category: 'popia',
    title: 'Cross-Border Personal Data Transfer Notice',
    statutoryRef: 'POPIA Act 4 of 2013, Section 72',
    severity: 'medium',
    scoreWeight: 25,
    description: 'Notice regarding whether personal data is stored or transmitted outside South Africa (e.g. AWS/Azure EU or US cloud regions).',
    remediationAdvice: 'Include an explicit disclosure in the privacy policy identifying foreign cloud hosting jurisdictions and adequacy safeguards.',
  },

  // ── PAIA (Act 2 of 2000) ──
  {
    ruleId: 'PAIA_SEC_51_MANUAL',
    category: 'paia',
    title: 'Section 51 Statutory Access to Information Manual',
    statutoryRef: 'PAIA Act 2 of 2000, Section 51(1)',
    severity: 'critical',
    scoreWeight: 50,
    description: 'Private and public bodies must compile and make publicly accessible a Section 51 PAIA manual.',
    remediationAdvice: 'Upload and link the latest annual Section 51 PAIA Manual in the footer navigation or corporate reports center.',
  },
  {
    ruleId: 'PAIA_REQUEST_PROCEDURE',
    category: 'paia',
    title: 'Designated Access Request Procedure & Form 2',
    statutoryRef: 'PAIA Act 2 of 2000, Section 53',
    severity: 'high',
    scoreWeight: 50,
    description: 'Prescribed Form 2 request instructions, submission email, and statutory request fees schedule.',
    remediationAdvice: 'Provide clear instructions for submitting Form 2 requests to the Information Officer along with the prescribed fee schedule.',
  },

  // ── King IV Corporate Governance (2016) ──
  {
    ruleId: 'KING_IV_BOARD_REGISTER',
    category: 'king_iv',
    title: 'Board of Directors & Executive Register',
    statutoryRef: 'King IV Principle 7 (Board Composition & Independence)',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Public register of directors indicating executive, non-executive, and independent status with biographical credentials.',
    remediationAdvice: 'Publish full director bios with explicit designations: Independent Non-Executive, Non-Executive, or Executive Director.',
  },
  {
    ruleId: 'KING_IV_AUDIT_COMMITTEE',
    category: 'king_iv',
    title: 'Audit & Risk Committee Charter & Composition',
    statutoryRef: 'King IV Principle 8 & Companies Act Section 94',
    severity: 'high',
    scoreWeight: 20,
    description: 'Disclosure of Audit & Risk Committee members, meeting attendance records, and terms of reference.',
    remediationAdvice: 'Publish the Audit Committee charter and confirm all members are independent non-executive directors.',
  },
  {
    ruleId: 'KING_IV_SOCIAL_ETHICS',
    category: 'king_iv',
    title: 'Social & Ethics Committee Charter',
    statutoryRef: 'King IV Principle 8 & Companies Act Reg 43',
    severity: 'high',
    scoreWeight: 20,
    description: 'Mandatory oversight committee for workplace safety, B-BBEE transformation, environmental stewardship, and community impact.',
    remediationAdvice: 'Publish Social & Ethics Committee terms of reference and annual reporting on statutory Reg 43 mandates.',
  },
  {
    ruleId: 'KING_IV_REMUNERATION',
    category: 'king_iv',
    title: 'Remuneration Policy & Implementation Report',
    statutoryRef: 'King IV Principle 14 (Fair & Responsible Remuneration)',
    severity: 'medium',
    scoreWeight: 20,
    description: 'Two-part remuneration disclosure detailing background statement, forward-looking policy, and implementation report.',
    remediationAdvice: 'Ensure the Remuneration Policy is accessible in the annual report downloads section.',
  },
  {
    ruleId: 'KING_IV_ETHICS_HOTLINE',
    category: 'king_iv',
    title: 'Confidential Ethics & Whistleblower Hotline',
    statutoryRef: 'King IV Principle 1 & 2 (Ethical Leadership & Culture)',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Independently operated, anonymous toll-free whistleblower hotline details for reporting corruption and ethics violations.',
    remediationAdvice: 'Feature the anonymous Whistleblower / Fraud Hotline phone number and secure link prominently on the website.',
  },
  {
    ruleId: 'KING_IV_SUSTAINABILITY',
    category: 'king_iv',
    title: 'Sustainability & Responsible Citizenship Disclosures',
    statutoryRef: 'King IV Principle 3 & 4 (Responsible Corporate Citizenship)',
    severity: 'medium',
    scoreWeight: 20,
    description: 'Statutory sustainability disclosures, ESG metrics, climate impact commitments, and annual sustainability reports.',
    remediationAdvice: 'Ensure annual ESG reports and sustainability strategy commitments are linked in the corporate publications center.',
  },

  // ── Technical Security & Accessibility (WCAG 2.1 AA) ──
  {
    ruleId: 'SEC_HTTPS_ENCRYPTION',
    category: 'security',
    title: 'TLS 1.3 Transport Encryption & Valid SSL',
    statutoryRef: 'POPIA Section 19 (Security Safeguards)',
    severity: 'critical',
    scoreWeight: 25,
    description: 'Valid production SSL certificate with automated HTTP-to-HTTPS redirect.',
    remediationAdvice: 'Ensure all traffic terminates on HTTPS with automated TLS certificate renewal.',
  },
  {
    ruleId: 'SEC_SECURITY_HEADERS',
    category: 'security',
    title: 'Enterprise Defense-in-Depth HTTP Headers',
    statutoryRef: 'OWASP ASVS & King IV Principle 12 (Tech Governance)',
    severity: 'high',
    scoreWeight: 25,
    description: 'Strict-Transport-Security (HSTS), X-Content-Type-Options: nosniff, and X-Frame-Options configured.',
    remediationAdvice: 'Edge middleware must inject HSTS (max-age=63072000), nosniff, and SAMEORIGIN headers on all public responses.',
  },
  {
    ruleId: 'WCAG_IMAGE_ALT_TEXT',
    category: 'security',
    title: 'Screen-Reader Accessibility (WCAG 2.1 AA Alt-Text)',
    statutoryRef: 'Promotion of Equality Act & WCAG 2.1 Principle 1',
    severity: 'medium',
    scoreWeight: 25,
    description: 'Published corporate images and charts must have descriptive alt-text for screen-reader accessibility.',
    remediationAdvice: 'Audit the Media Library and supply descriptive alt text for all published infographics, leadership portraits, and banners.',
  },
  {
    ruleId: 'LEGAL_TERMS_OF_USE',
    category: 'security',
    title: 'Corporate Website Terms of Use & Disclaimer',
    statutoryRef: 'Electronic Communications and Transactions Act (ECTA) Section 43',
    severity: 'low',
    scoreWeight: 25,
    description: 'Mandatory ECTA Section 43 electronic contracting disclosures, company registration number, and terms of use.',
    remediationAdvice: 'Publish comprehensive Website Terms of Use detailing copyright, forward-looking statements disclaimers, and CIPC particulars.',
  },
];
