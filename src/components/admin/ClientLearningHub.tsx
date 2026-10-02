'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Edit3,
  Send,
  FolderOpen,
  Newspaper,
  ShieldCheck,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  X,
  FileText,
  CalendarCheck,
  Info,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

export interface LearningFeature {
  id: string;
  title: string;
  category: 'authoring' | 'governance' | 'media' | 'news' | 'security' | 'team';
  categoryLabel: string;
  icon: any;
  summary: string;
  howItWorks: string[];
  capabilities: string[];
  ctaUrl: string;
  ctaText: string;
  executiveTip: string;
}

const LEARNING_FEATURES: LearningFeature[] = [
  {
    id: 'visual-editor',
    title: 'Visual Live Page Editor',
    category: 'authoring',
    categoryLabel: 'Authoring & Pages',
    icon: Edit3,
    summary: 'Directly modify headlines, copy, callouts, and layout blocks in real time with zero code or technical overhead.',
    howItWorks: [
      'Select any public page or navigation zone from your corporate workspace.',
      'Click inline on text, banners, or images to edit them with instant WYSIWYG feedback.',
      'Save your changes into a staged draft revision ready for review.'
    ],
    capabilities: [
      'Inline text & headline editing without opening code',
      'Preview desktop, tablet, and mobile breakpoints live',
      'Pre-built corporate grid blocks & executive callout zones',
      'Instant draft state persistence with revision rollback'
    ],
    ctaUrl: '/admin/editor',
    ctaText: 'Open Visual Editor',
    executiveTip: 'Changes in the Visual Editor remain in private draft mode until approved. You can safely explore layouts without altering the live website.'
  },
  {
    id: 'pages-navigation',
    title: 'Pages & Corporate Navigation',
    category: 'authoring',
    categoryLabel: 'Authoring & Pages',
    icon: FileText,
    summary: 'Manage corporate hierarchy, header navigation menus, secondary links, and statutory disclosure footers.',
    howItWorks: [
      'View all active and draft pages configured for your corporate domain.',
      'Configure SEO meta titles, open graph preview cards, and search descriptions.',
      'Organize navigation hierarchy across Investors, Governance, Leadership, and Operations.'
    ],
    capabilities: [
      'Structured URL path routing and hierarchical nesting',
      'Automated sitemap.xml and robots.txt generation',
      'Canonical corporate domain mapping and SSL verification',
      'Custom meta tags for statutory regulatory disclosures'
    ],
    ctaUrl: '/admin/pages',
    ctaText: 'Manage Pages',
    executiveTip: 'Maintain clear, consistent navigation so statutory investors and stakeholders can locate reports and announcements in under two clicks.'
  },
  {
    id: 'approvals-governance',
    title: 'Four-Eyes Approvals & Review Queue',
    category: 'governance',
    categoryLabel: 'Approvals & Governance',
    icon: Send,
    summary: 'Enterprise four-eyes principle workflow ensuring no content goes live without authorized executive sign-off.',
    howItWorks: [
      'Content Editors prepare copy revisions and submit them for review.',
      'Compliance Reviewers and Corporate Admins receive notifications with side-by-side diffs.',
      'One-click approval pushes the revision live to the global edge network.'
    ],
    capabilities: [
      'Strict separation of duties between content authors and sign-off officers',
      'Visual side-by-side side diff viewer showing exact word changes',
      'Mandatory review notes and regulatory audit signatures',
      'Emergency rollback to any historical publication snapshot'
    ],
    ctaUrl: '/admin/tasks',
    ctaText: 'View Approvals Queue',
    executiveTip: 'The four-eyes review gate guarantees compliance with JSE and King IV statutory publication governance.'
  },
  {
    id: 'media-library',
    title: 'Digital Asset Management (DAM)',
    category: 'media',
    categoryLabel: 'Media & Documents',
    icon: FolderOpen,
    summary: 'Secure corporate asset repository for executive portraits, brand logos, infographics, and PDF documents.',
    howItWorks: [
      'Drag and drop media assets directly into your dedicated corporate cloud vault.',
      'Assets are automatically optimized, compressed, and assigned immutable CDN URLs.',
      'Embed assets into any page, announcement, or statutory download section.'
    ],
    capabilities: [
      'Support for high-res imagery, PDF booklets, SVGs, and presentation decks',
      'Global multi-region CDN caching for sub-100ms asset loading',
      'Automated thumbnail and responsive image variant generation',
      'Strict tenant isolation preventing asset leaks across corporate clients'
    ],
    ctaUrl: '/admin/media',
    ctaText: 'Browse Media Assets',
    executiveTip: 'Always upload financial statements and investor packs in standardized PDF/A format to ensure long-term document fidelity.'
  },
  {
    id: 'news-releases',
    title: 'News & Corporate Press Releases',
    category: 'news',
    categoryLabel: 'News & Announcements',
    icon: Newspaper,
    summary: 'Publish company announcements, executive appointments, operational milestones, and media statements.',
    howItWorks: [
      'Draft your press release using the executive rich text editor.',
      'Attach supporting media, executive headshots, or downloadable PDF releases.',
      'Schedule publication for a precise time or publish instantly across your portal.'
    ],
    capabilities: [
      'Categorization across Corporate, Sustainability, Leadership, and Operations',
      'Automatic generation of social sharing preview cards (OpenGraph)',
      'Time-locked embargo scheduling for market-sensitive news',
      'RSS and news feed syndication for wire services'
    ],
    ctaUrl: '/admin/news',
    ctaText: 'Publish Announcement',
    executiveTip: 'Use embargo scheduling when coordinating with wire agencies to release announcements precisely upon market open.'
  },
  {
    id: 'content-releases',
    title: 'Scheduled Releases & Time-Locked Drops',
    category: 'governance',
    categoryLabel: 'Approvals & Governance',
    icon: CalendarCheck,
    summary: 'Coordinate multi-page corporate launches, brand refreshes, and annual reporting packs as unified drops.',
    howItWorks: [
      'Bundle multiple page edits, announcements, and asset updates into one named release.',
      'Set an executive go-live timestamp or schedule for embargo release.',
      'All bundled assets deploy simultaneously in a single atomic release.'
    ],
    capabilities: [
      'Atomic publishing: either all bundled pages go live together or none do',
      'Pre-launch staging environment for board and executive preview',
      'Immutable audit snapshot recorded upon release activation',
      'Zero downtime or visual flickering during live deployment'
    ],
    ctaUrl: '/admin/releases',
    ctaText: 'View Scheduled Releases',
    executiveTip: 'Use Content Drops when publishing quarterly financial packs where pages, media files, and news releases must sync simultaneously.'
  },
  {
    id: 'king-iv-audit',
    title: 'King IV & POPIA Governance Audit',
    category: 'security',
    categoryLabel: 'Security & Compliance',
    icon: ShieldCheck,
    summary: 'Continuous compliance verification with King IV governance principles, POPIA data privacy, and statutory disclosures.',
    howItWorks: [
      'The automated compliance engine monitors public pages for statutory disclaimers.',
      'Verifies mandatory PAIA manuals, privacy policies, and whistleblower links.',
      'Generates verifiable compliance audit logs for external auditors and board committees.'
    ],
    capabilities: [
      'Pre-configured King IV corporate governance checklist',
      'POPIA compliance checks on all public forms and contact touchpoints',
      'Automated audit logs with user timestamps, IP hashes, and revision IDs',
      'Exportable compliance reports ready for audit committee packs'
    ],
    ctaUrl: '/admin/governance',
    ctaText: 'Open Governance Audit',
    executiveTip: 'Run an audit scan before publishing annual reports to verify that all statutory disclaimers and privacy notices remain valid.'
  },
  {
    id: 'team-roles',
    title: 'Role-Based Access & Team Permissions',
    category: 'team',
    categoryLabel: 'Team & Collaboration',
    icon: Users,
    summary: 'Manage corporate users with granular role controls: Content Editors, Compliance Reviewers, and Corporate Administrators.',
    howItWorks: [
      'Invite corporate colleagues using their work email address.',
      'Assign roles matching their organizational responsibilities.',
      'Users receive a secure, direct password creation invitation via Resend.'
    ],
    capabilities: [
      'Content Editor: Draft copy, upload media, submit revisions for review',
      'Compliance Reviewer: Inspect diffs, approve content, reject with review notes',
      'Corporate Admin: Full tenant workspace management and user provisioning',
      'Passwordless 48-hour secure token onboarding with zero temporary passwords'
    ],
    ctaUrl: '/admin/users',
    ctaText: 'Manage Team Access',
    executiveTip: 'Always assign the Compliance Reviewer role to statutory or legal officers who hold publication sign-off authority.'
  }
];

export function ClientLearningHub({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFeature, setActiveFeature] = useState<LearningFeature | null>(null);

  const categories = [
    { id: 'all', label: 'All Platform Modules' },
    { id: 'authoring', label: 'Authoring & Pages' },
    { id: 'governance', label: 'Approvals & Governance' },
    { id: 'media', label: 'Media & Documents' },
    { id: 'news', label: 'News & Announcements' },
    { id: 'security', label: 'Security & Compliance' },
    { id: 'team', label: 'Team & Roles' }
  ];

  const filteredFeatures = useMemo(() => {
    return LEARNING_FEATURES.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;
      const matchesQuery =
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        item.capabilities.some(c => c.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className={`space-y-6 ${isEmbedded ? '' : 'max-w-7xl mx-auto py-6'}`}>
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div 
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span 
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`
                }}
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Executive Learning Hub</span>
              </span>
              <span className="text-[11px] font-bold text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-semibold">Bastion Platform Guide</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Master Your Corporate Digital Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore how Bastion empowers your team to edit content, coordinate four-eyes approvals, manage media assets, and publish verified corporate communications with confidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/editor"
              style={{
                backgroundColor: primaryColor,
                color: '#ffffff'
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-95 transition shadow-sm cursor-pointer shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Live Editor</span>
            </Link>
          </div>
        </div>

        {/* Quickstart 3-Step Guided Roadmap */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Recommended Workflow for New Corporate Users</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-black shrink-0">
                1
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Author &amp; Preview Content
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Open the Visual Editor to modify headlines and copy. Changes stay safely in draft mode.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-black shrink-0">
                2
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Submit for Compliance Review
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Send draft revisions to your compliance officer for side-by-side verification.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black shrink-0">
                3
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Instant Executive Sign-Off
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Once approved, your changes reflect immediately on your live website with zero downtime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features & guides..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              onClick={() => setActiveFeature(feat)}
              className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div 
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {feat.categoryLabel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                  {feat.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span className="group-hover:underline">Explore Feature</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No matching learning topics found
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or select &quot;All Platform Modules&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Feature Deep Dive Modal */}
      {activeFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                >
                  {React.createElement(activeFeature.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {activeFeature.categoryLabel}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {activeFeature.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeFeature.summary}
            </p>

            {/* How It Works Step Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                How It Works Step-by-Step
              </h4>
              <div className="space-y-2">
                {activeFeature.howItWorks.map((step, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Capabilities */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enterprise Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeFeature.capabilities.map((cap, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {cap}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Tip */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 flex items-start gap-3">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-purple-950 dark:text-purple-200 block">
                  Executive Tip
                </span>
                <p className="text-purple-800 dark:text-purple-300 mt-0.5 leading-relaxed">
                  {activeFeature.executiveTip}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveFeature(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
              <Link
                href={activeFeature.ctaUrl}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <span>{activeFeature.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
