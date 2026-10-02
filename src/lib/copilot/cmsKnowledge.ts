export interface SuggestedNextStep {
  label: string;
  query: string;
  icon?: 'edit' | 'sparkles' | 'users' | 'check' | 'folder' | 'book' | 'arrow' | 'shield';
}

export interface CmsKnowledgeEntry {
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  steps: string[];
  tips: string;
  actionUrl: string;
  actionLabel: string;
  suggestedNextSteps: SuggestedNextStep[];
}

export const DEFAULT_CLIENT_SUGGESTED_STEPS: SuggestedNextStep[] = [
  { label: 'Edit Website Pages', query: 'How do I edit pages on my website?', icon: 'edit' },
  { label: 'Open Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'sparkles' },
  { label: 'Invite Team Members', query: 'How do I invite team members and set permissions?', icon: 'users' },
  { label: 'Publishing Approvals', query: 'How do reviews and publishing approvals work?', icon: 'check' },
  { label: 'Platform Learning Hub', query: 'Open the Platform Learning Hub', icon: 'book' }
];

export const DEFAULT_AGENCY_SUGGESTED_STEPS: SuggestedNextStep[] = [
  { label: 'Visual Live Editor', query: 'Open the Visual Live Page Editor', icon: 'sparkles' },
  { label: 'Invite Team', query: 'How do I invite team members?', icon: 'users' },
  { label: 'SRE System Health', query: 'Check platform health and SLA uptime', icon: 'shield' },
  { label: 'Active Incidents', query: 'Are there any active incidents or open PR fixes?', icon: 'check' }
];

export const CMS_KNOWLEDGE_BASE: CmsKnowledgeEntry[] = [
  {
    title: 'Visual Live Page Editor',
    category: 'Content Authoring',
    keywords: ['editor', 'visual editor', 'live editor', 'edit page', 'wysiwyg', 'inline editing', 'edit text', 'change text', 'blocks', 'layout'],
    summary: 'The Visual Live Page Editor allows you to edit website pages in real-time with point-and-click ease. All changes remain in a secure draft mode until approved and published.',
    steps: [
      'Navigate to the Visual Page Editor (/admin/editor).',
      'Select the page you wish to edit from the top dropdown selector.',
      'Click directly on any text, headline, or banner to edit inline with instant preview.',
      'Use the block toolbar to add sections, media callouts, or metric counters.',
      'Click "Save Draft" to preserve your changes or "Submit for Review" when ready for publishing.'
    ],
    tips: 'Drafts are isolated in private sandbox mode and will never affect the live production website until formally approved in the review queue.',
    actionUrl: '/admin/editor',
    actionLabel: 'Open Visual Editor',
    suggestedNextSteps: [
      { label: 'Submit for Review', query: 'How do reviews and publishing approvals work?', icon: 'check' },
      { label: 'Explore Site Pages', query: 'Take me to pages and site architecture', icon: 'edit' },
      { label: 'Upload Media Assets', query: 'How do I upload corporate media and photos?', icon: 'folder' }
    ]
  },
  {
    title: 'Pages & Site Architecture',
    category: 'Structure & SEO',
    keywords: ['pages', 'site tree', 'sitemap', 'navigation', 'menu', 'header menu', 'footer menu', 'slug', 'seo', 'add page', 'create page'],
    summary: 'Manage your corporate site hierarchy, parent-child page trees, URLs (slugs), navigation menus, and SEO metadata.',
    steps: [
      'Go to Pages & Site Architecture (/admin/pages).',
      'Click "New Page" to create a standard page, statutory landing page, or sub-page.',
      'Configure the Page Title, URL Slug, and SEO Meta Description for search engines.',
      'Toggle whether the page appears in the primary header navigation or footer index.',
      'Save the page configuration to make it available in the Visual Editor.'
    ],
    tips: 'Every page features automatic OpenGraph card generation for executive sharing on LinkedIn and Twitter.',
    actionUrl: '/admin/pages',
    actionLabel: 'Explore Pages',
    suggestedNextSteps: [
      { label: 'Launch Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'sparkles' },
      { label: 'Review Draft Changes', query: 'How do reviews and publishing approvals work?', icon: 'check' },
      { label: 'Organize Menus', query: 'How do I configure header and footer menus?', icon: 'edit' }
    ]
  },
  {
    title: 'Reviews & Four-Eyes Approvals',
    category: 'Governance & Publishing',
    keywords: ['reviews', 'approval', 'four eyes', 'queue', 'publish', 'publishing', 'sign off', 'drafts', 'workflow', 'pending'],
    summary: 'Ensures strict corporate governance by requiring a four-eyes sign-off before any content modification or release is published to the live edge.',
    steps: [
      'Editors make changes in the Visual Editor and click "Submit for Approval".',
      'Designated Reviewers and Admins are alerted in the Reviews & Publishing Queue (/admin/tasks).',
      'Reviewers inspect side-by-side visual and code diffs comparing the draft to the live page.',
      'Reviewers can click "Approve and Publish" or request revisions with inline review notes.',
      'Upon approval, the live edge CDN is instantly updated with cache invalidation under 50ms.'
    ],
    tips: 'All sign-offs record the reviewer identity, timestamp, and audit hash to comply with King IV standards.',
    actionUrl: '/admin/tasks',
    actionLabel: 'View Publishing Queue',
    suggestedNextSteps: [
      { label: 'Team Roles & Permissions', query: 'How do I invite team members and set permissions?', icon: 'users' },
      { label: 'King IV Governance Audit', query: 'Tell me about King IV governance and audit logs', icon: 'shield' },
      { label: 'Scheduled Drops', query: 'How do scheduled releases and drops work?', icon: 'sparkles' }
    ]
  },
  {
    title: 'Digital Asset Management (DAM) & Media Library',
    category: 'Assets & Media',
    keywords: ['media', 'images', 'upload', 'dam', 'photos', 'pdf', 'documents', 'brochures', 'assets', 'logos', 'files'],
    summary: 'A secure cloud vault for corporate photography, executive portraits, vector logos, and statutory PDF reports.',
    steps: [
      'Open the Media & Downloads Library (/admin/media).',
      'Drag and drop files (JPG, PNG, WebP, SVG, PDF, DOCX) directly into the upload dropzone.',
      'Images are automatically compressed and converted to next-generation WebP formats.',
      'Click on any asset to copy its permanent CDN link or attach it directly into your page sections.'
    ],
    tips: 'Documents like annual reports or policies receive permanent, version-safe download URLs.',
    actionUrl: '/admin/media',
    actionLabel: 'Browse Media Assets',
    suggestedNextSteps: [
      { label: 'Add Image to Page', query: 'Open the Visual Live Page Editor', icon: 'sparkles' },
      { label: 'Publish Press Release', query: 'How do I publish a news release?', icon: 'edit' },
      { label: 'Invite Content Editor', query: 'How do I invite team members and set permissions?', icon: 'users' }
    ]
  },
  {
    title: 'Team & Access Control',
    category: 'Security & Permissions',
    keywords: ['team', 'users', 'invite', 'roles', 'permissions', 'access', 'colleagues', 'admin', 'editor', 'reviewer', 'password'],
    summary: 'Manage corporate colleagues, assign granular role permissions, and deliver branded welcome email credentials with direct access links.',
    steps: [
      'Go to Team & Access Control (/admin/users).',
      'Click "Invite Team Member".',
      'Enter your colleague’s Full Name and Corporate Email Address.',
      'Select their role: Admin (full control), Editor (content authoring), or Reviewer (audit & approvals).',
      'Click "Send Branded Invitation" to deliver a secure one-time activation link to their inbox.'
    ],
    tips: 'Users can reset their passwords or request a fresh sign-in link directly from the login page anytime.',
    actionUrl: '/admin/users',
    actionLabel: 'Manage Team Members',
    suggestedNextSteps: [
      { label: 'Four-Eyes Approvals', query: 'How do reviews and publishing approvals work?', icon: 'check' },
      { label: 'Audit Trail Logs', query: 'Tell me about King IV governance and audit logs', icon: 'shield' },
      { label: 'Platform Learning Hub', query: 'Open the Platform Learning Hub', icon: 'book' }
    ]
  },
  {
    title: 'News & Press Releases',
    category: 'Communications',
    keywords: ['news', 'press releases', 'announcements', 'media releases', 'articles', 'posts', 'communications'],
    summary: 'Publish executive statements, company announcements, media advisories, and industry updates.',
    steps: [
      'Navigate to Content Releases & News (/admin/releases).',
      'Click "New Press Release".',
      'Author your release headline, lead paragraph, full body copy, and attach a featured image.',
      'Assign relevant topical tags (e.g., Corporate, Financial, Executive, Product).',
      'Submit for publishing approval or schedule for future timed dissemination.'
    ],
    tips: 'Press releases are formatted with print-friendly layouts and structured schema markup for Google News.',
    actionUrl: '/admin/releases',
    actionLabel: 'View Press Releases',
    suggestedNextSteps: [
      { label: 'Scheduled Time-Lock', query: 'How do scheduled releases and drops work?', icon: 'sparkles' },
      { label: 'Upload Media Pack', query: 'How do I upload corporate media and photos?', icon: 'folder' },
      { label: 'Review Queue', query: 'How do reviews and publishing approvals work?', icon: 'check' }
    ]
  },
  {
    title: 'Scheduled Releases & Time-Locked Drops',
    category: 'Publishing',
    keywords: ['releases', 'drops', 'schedule', 'timed', 'embargo', 'time lock', 'bundling', 'multi page update'],
    summary: 'Coordinate multi-page corporate updates (e.g. quarterly results, rebrands, product launches) and publish them atomically at a scheduled date and time.',
    steps: [
      'Go to Content Releases (/admin/releases).',
      'Create a new "Release Bundle" and give it a release title (e.g., "Q3 Financials & Annual Strategy").',
      'Attach draft page versions and corporate documents into the release bundle.',
      'Set an embargo or scheduled release date and time down to the minute.',
      'When the schedule triggers, all pages and assets go live synchronously with zero downtime.'
    ],
    tips: 'Ideal for market-sensitive announcements requiring strict embargo enforcement.',
    actionUrl: '/admin/releases',
    actionLabel: 'Manage Content Releases',
    suggestedNextSteps: [
      { label: 'Check Approvals Queue', query: 'How do reviews and publishing approvals work?', icon: 'check' },
      { label: 'Open Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'sparkles' },
      { label: 'Governance Audit Log', query: 'Tell me about King IV governance and audit logs', icon: 'shield' }
    ]
  },
  {
    title: 'King IV Governance & Audit Trail',
    category: 'Governance & Compliance',
    keywords: ['governance', 'king iv', 'audit', 'audit trail', 'logs', 'compliance', 'popia', 'tamper proof', 'board'],
    summary: 'An immutable, cryptographically verifiable audit trail documenting all user actions, content revisions, publishing sign-offs, and administrative changes.',
    steps: [
      'Open King IV Governance & Audit (/admin/governance).',
      'Review real-time event logs detailing who modified what, exact timestamps, and change diffs.',
      'Filter logs by user, date range, or corporate action type.',
      'Export audit reports as tamper-evident PDF or CSV files for board meetings or external auditors.'
    ],
    tips: 'All log entries are append-only to satisfy King IV statutory accountability requirements.',
    actionUrl: '/admin/governance',
    actionLabel: 'View Governance Audit',
    suggestedNextSteps: [
      { label: 'Ethics Hotline', query: 'Tell me about the ethics and whistleblowing hotline', icon: 'shield' },
      { label: 'Team Access Control', query: 'How do I invite team members and set permissions?', icon: 'users' },
      { label: 'Platform Learning Hub', query: 'Open the Platform Learning Hub', icon: 'book' }
    ]
  },
  {
    title: 'Platform Learning Hub',
    category: 'Onboarding & Training',
    keywords: ['learning hub', 'learn', 'guide', 'tutorial', 'help', 'documentation', 'how to use', 'training', 'overview'],
    summary: 'An interactive, comprehensive learning center designed to give users a full overview of platform capabilities with interactive modal deep-dives.',
    steps: [
      'Click "Platform Learning Hub" in the sidebar or visit /admin/learn.',
      'Browse modules across Content Authoring, Governance, Media Management, and Team Access.',
      'Click on any module card to open an interactive deep dive with step-by-step guidance and enterprise tips.',
      'Use the category filters to quickly find answers to your specific workflow questions.'
    ],
    tips: 'You can revisit the Learning Hub at any time directly from the left navigation sidebar.',
    actionUrl: '/admin/learn',
    actionLabel: 'Open Learning Hub',
    suggestedNextSteps: [
      { label: 'Visual Editor Tutorial', query: 'How do I edit pages on my website?', icon: 'edit' },
      { label: 'Invite Colleagues', query: 'How do I invite team members and set permissions?', icon: 'users' },
      { label: 'Media Vault Guide', query: 'How do I upload corporate media and photos?', icon: 'folder' }
    ]
  },
  {
    title: 'Ethics & Whistleblowing Hotline',
    category: 'Governance & Compliance',
    keywords: ['ethics', 'whistleblowing', 'hotline', 'anonymous', 'reporting', 'compliance report', 'tip off'],
    summary: 'A confidential, secure channel enabling employees, suppliers, and stakeholders to submit anonymous compliance or ethical reports.',
    steps: [
      'Access the Ethics Hub at /admin/ethics or view the public reporting portal at /ethics.',
      'Reports are submitted with end-to-end encryption and a unique anonymous tracking PIN.',
      'Compliance officers can review submissions, categorize risk, and post secure follow-up queries without compromising reporter anonymity.'
    ],
    tips: 'Fully aligned with Protected Disclosures and King IV Principle 1 governance standards.',
    actionUrl: '/admin/ethics',
    actionLabel: 'Open Ethics Hub',
    suggestedNextSteps: [
      { label: 'King IV Governance Audit', query: 'Tell me about King IV governance and audit logs', icon: 'shield' },
      { label: 'Team Permissions', query: 'How do I invite team members and set permissions?', icon: 'users' },
      { label: 'Learning Hub Modules', query: 'Open the Platform Learning Hub', icon: 'book' }
    ]
  },
  {
    title: 'Tenders & Procurement RFPs',
    category: 'Procurement',
    keywords: ['tender', 'tenders', 'rfp', 'procurement', 'suppliers', 'vendor', 'contracts'],
    summary: 'Manage corporate procurement notices, tender document distribution, and supplier inquiry deadlines.',
    steps: [
      'Navigate to Suppliers & Tenders (/admin/tenders).',
      'Create tender listings with scope descriptions, submission criteria, and closing dates.',
      'Attach downloadable RFP specification packs and tender forms.',
      'Track incoming supplier submissions and inquiries in one structured portal.'
    ],
    tips: 'Closing countdown timers automatically lock tenders when submission windows expire.',
    actionUrl: '/admin/tenders',
    actionLabel: 'Manage Tenders',
    suggestedNextSteps: [
      { label: 'Upload Tender Documents', query: 'How do I upload corporate media and photos?', icon: 'folder' },
      { label: 'Publishing Approvals', query: 'How do reviews and publishing approvals work?', icon: 'check' },
      { label: 'Platform Learning Hub', query: 'Open the Platform Learning Hub', icon: 'book' }
    ]
  }
];

export function findCmsKnowledge(query: string): CmsKnowledgeEntry | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  for (const item of CMS_KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (q.includes(kw)) {
        return item;
      }
    }
  }

  return null;
}

export function buildCmsKnowledgePrompt(clientName: string, userName?: string): string {
  const modulesSummary = CMS_KNOWLEDGE_BASE.map(k => 
    `- **${k.title}** (${k.category}): ${k.summary} Steps: ${k.steps.slice(0, 2).join(' ')} (Route: ${k.actionUrl})`
  ).join('\n');

  return `You are "Ask AI", the intelligent, executive corporate assistant for ${clientName}.
You are paired with ${userName || 'the user'} to provide expert guidance and answer questions about the ${clientName} CMS platform.

Your tone is professional, warm, clear, and reassuring. Keep responses crisp and highly readable (2 to 4 sentences, or 2 to 3 concise bullet points).
Do not use complicated markdown headers; format with clean text and easy-to-read steps.

PLATFORM CAPABILITIES & KNOWLEDGE:
${modulesSummary}

IMPORTANT RULES:
1. You are the dedicated AI assistant for ${clientName}. Never mention unrelated companies or internal agency operations unless the user specifically asks.
2. If asked how to do something in the CMS, explain the exact steps concisely and mention which section to visit.
3. Suggest the most relevant direct route so the user knows where to navigate (e.g., Visual Editor is at /admin/editor, Pages at /admin/pages, Team at /admin/users, Learning Hub at /admin/learn).
4. If asked "who are you" or "what can you do", explain that you are Ask AI for ${clientName}, ready to assist with editing pages, uploading media, managing team permissions, reviewing drafts, and platform guidance.`;
}
