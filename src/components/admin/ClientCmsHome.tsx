'use client';

import React from 'react';
import Link from 'next/link';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  Edit3,
  FileText,
  Compass,
  FileSpreadsheet,
  Newspaper,
  Leaf,
  ImageIcon,
  Send,
  UserPlus,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import { WorkspaceClient, WorkspaceSite } from './StudioWorkspaceProvider';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

interface ClientCmsHomeProps {
  client: WorkspaceClient;
  site: WorkspaceSite | null;
  dashboardData: any;
  onSwitchToAgency?: () => void;
}

export function ClientCmsHome({
  client,
  site,
  dashboardData,
  onSwitchToAgency
}: ClientCmsHomeProps) {
  const { primaryColor, accentColor, openCustomizer, preferences } = useDashboardCustomizer();
  const isGoldFields = client?.id === 'client_goldfields';
  const siteUrl = isGoldFields ? '/' : site ? `/sites/${site.slug}` : '/';

  const isSolaris = Boolean(client?.id?.includes('solaris') || client?.industry?.includes('energy'));
  const isVodacom = Boolean(client?.id?.includes('voda') || client?.industry?.includes('telecom'));
  const isFinance = Boolean(client?.id?.includes('apex') || client?.id?.includes('meridian') || client?.id?.includes('valence') || client?.industry?.includes('finance'));

  const kpi1 = isGoldFields
    ? { value: '10 Mines', label: 'Mining Operations' }
    : isSolaris
    ? { value: '8 Solar Arrays', label: 'Active Facilities' }
    : isVodacom
    ? { value: '64M Subs', label: 'Network Operations' }
    : isFinance
    ? { value: 'R4.2B AUM', label: 'Managed Mandates' }
    : { value: '12 Pages', label: 'Active Sections' };

  const kpi2 = isGoldFields
    ? { value: 'Wed 14:00', label: 'Upcoming SENS Release' }
    : isSolaris
    ? { value: 'Active Feed', label: 'Grid Interconnection' }
    : isVodacom
    ? { value: 'Live 5G', label: 'Network Infrastructure' }
    : isFinance
    ? { value: 'Q2 Outlook', label: 'Macro Strategy Brief' }
    : { value: 'Live Synced', label: 'Content Pipeline' };

  const kpi3 = isGoldFields
    ? { value: '11 Reports', label: 'Annual & Financial Packs' }
    : isSolaris
    ? { value: '6 ESG Packs', label: 'PPA & Carbon Offset Reports' }
    : isVodacom
    ? { value: '14 Reports', label: 'Interim Results & Factbooks' }
    : isFinance
    ? { value: '8 Mandates', label: 'Deal Teasers & Diligence' }
    : { value: 'Resource Hub', label: 'Media & PDF Assets' };

  // Stats from dashboard or realistic fallbacks
  const pendingApprovalsCount = dashboardData?.pendingTasks?.length || 2;
  const recentRevisions = dashboardData?.recentRevisions || [];

  const gradientBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  // Customizer preferences guards
  const showReviewAlert = preferences.sections?.clientReviewAlert !== false;
  const showDiagnostics = preferences.sections?.clientDiagnosticsBar !== false;
  const showActionCards = preferences.sections?.clientActionCards !== false;
  const showRecentFeed = preferences.sections?.clientRecentFeed !== false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. What website am I managing? & 2. Is it live and healthy? */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span 
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`
                }}
                className="flex items-center space-x-1.5 text-xs font-bold border px-2.5 py-0.5 rounded-md"
              >
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span>{client?.name || 'Corporate'} CMS Portal</span>
              </span>

              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
                Powered by Bastion Group
              </span>

              <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                <span>SSL Secured &bull; CDN Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {client?.name} Website Content Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Welcome to your dedicated corporate content portal. Make updates to approved pages, leadership profiles, announcements, and media in real time with zero code. All published changes reflect automatically on your live website.
            </p>

            {/* Quick Health & Sync Diagnostics */}
            {showDiagnostics && (
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Production Website Live</span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <div>
                  Domain: <strong className="text-slate-800 dark:text-slate-200 font-mono">{site?.primaryDomain || (isGoldFields ? 'goldfields.com' : `${client?.slug || 'site'}.bastion.digital`)}</strong>
                </div>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Bastion Sync: &lt;500ms</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            {/* Customize Portal Trigger for Corporate Users */}
            <button
              type="button"
              onClick={openCustomizer}
              style={{
                borderColor: `${primaryColor}40`,
                backgroundColor: `${primaryColor}12`,
                color: primaryColor
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition shadow-2xs hover:opacity-90 cursor-pointer"
              title="Customize Portal Colors, KPIs & Layout"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Customize Portal</span>
            </button>

            <Link
              href="/admin/editor"
              style={{
                background: gradientBg,
                boxShadow: `0 4px 14px ${primaryColor}35`
              }}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs transition hover:opacity-95 shadow-sm cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Open Visual Editor</span>
            </Link>

            <Link
              href={siteUrl}
              target="_blank"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: accentColor }} />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Client Portal KPI Metric Cards (Customizable via Modal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {preferences.kpis?.clientMiningOps !== false && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div 
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}30`
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{kpi1.value}</div>
              <div className="text-xs text-slate-500 font-semibold">{kpi1.label}</div>
            </div>
          </div>
        )}

        {preferences.kpis?.clientSensReleases !== false && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div 
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                borderColor: `${accentColor}30`
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
            >
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{kpi2.value}</div>
              <div className="text-xs text-slate-500 font-semibold">{kpi2.label}</div>
            </div>
          </div>
        )}

        {preferences.kpis?.clientFinancialReports !== false && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div 
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}30`
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
            >
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{kpi3.value}</div>
              <div className="text-xs text-slate-500 font-semibold">{kpi3.label}</div>
            </div>
          </div>
        )}

        {preferences.kpis?.clientPendingSignoff !== false && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <div 
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                borderColor: `${accentColor}30`
              }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
            >
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{pendingApprovalsCount} Drafts</div>
              <div className="text-xs text-slate-500 font-semibold">Awaiting Executive Sign-Off</div>
            </div>
          </div>
        )}
      </div>

      {/* 3. What needs my review? (Pending Approvals Panel) */}
      {showReviewAlert && pendingApprovalsCount > 0 && (
        <div 
          style={{
            borderColor: `${accentColor}40`,
            backgroundColor: `${accentColor}08`
          }}
          className="p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center space-x-3">
            <div 
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {pendingApprovalsCount} Draft Revisions Awaiting Review &amp; Publishing
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Content updates have been prepared and are ready for executive sign-off before going live.
              </div>
            </div>
          </div>

          <Link
            href="/admin/tasks"
            style={{
              background: gradientBg,
              boxShadow: `0 4px 12px ${primaryColor}30`
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-white font-bold text-xs transition self-start sm:self-auto shrink-0 shadow-2xs hover:opacity-95 cursor-pointer"
          >
            <span>Review Changes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 4. Where do I go to update content? (Plain-Language Action Cards) */}
      {showActionCards && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              What would you like to update?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an area below to make quick updates or review current website content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Homepage & Pages */}
            <Link
              href="/admin/pages"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
            >
              <div 
                style={{
                  backgroundColor: `${primaryColor}12`,
                  color: primaryColor,
                  borderColor: `${primaryColor}25`
                }}
                className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              >
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                Pages &amp; Navigation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Manage page titles, headers, navigation menus, callouts, and layout sections across all public pages.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                <span>Manage Pages</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Visual Page Editor */}
            <Link
              href="/admin/editor"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Edit3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                Visual Website Editor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Preview your live site in real time and edit text, headlines, and blocks inline with instant visual feedback.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span>Open Visual Editor</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 3: News & Announcements */}
            <Link
              href="/admin/news"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
            >
              <div 
                style={{
                  backgroundColor: `${accentColor}12`,
                  color: accentColor,
                  borderColor: `${accentColor}25`
                }}
                className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              >
                <Newspaper className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                {isGoldFields ? 'SENS Announcements & News' : 'News & Press Releases'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Publish regulatory filings, company announcements, press releases, and executive statements.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: accentColor }}>
                <span>Publish Announcements</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Specialized Collection (Operations or Services) */}
            {isGoldFields ? (
              <Link
                href="/admin/operations"
                className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
              >
                <div 
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    borderColor: `${primaryColor}25`
                  }}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                >
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                  Mining Operations &amp; Projects
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Update production figures, reserve estimates, workforce stats, and gallery photos across all 10 mines.
                </p>
                <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                  <span>Manage 10 Operations</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ) : (
              <Link
                href="/admin/media"
                className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
              >
                <div 
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    borderColor: `${primaryColor}25`
                  }}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                >
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                  Media &amp; Downloads Library
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload photography, logos, brochures, presentation decks, and downloadable PDF assets.
                </p>
                <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                  <span>Browse Assets</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )}

            {/* Card 5: Reports & Results or ESG */}
            {isGoldFields ? (
              <Link
                href="/admin/reports"
                className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
              >
                <div 
                  style={{
                    backgroundColor: `${accentColor}12`,
                    color: accentColor,
                    borderColor: `${accentColor}25`
                  }}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                  Reports &amp; Financial Results
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Upload Integrated Annual Reports, quarterly financial statements, and investor presentation packs.
                </p>
                <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: accentColor }}>
                  <span>Manage 11 Reports</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ) : (
              <Link
                href="/admin/users"
                className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
              >
                <div 
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    borderColor: `${primaryColor}25`
                  }}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                >
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                  Team &amp; Access Control
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Invite team members, assign permissions, and send branded welcome emails with secure access credentials.
                </p>
                <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                  <span>Invite Team</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )}

            {/* Card 6: Approvals & Publishing */}
            <Link
              href="/admin/tasks"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
            >
              <div 
                style={{
                  backgroundColor: `${primaryColor}12`,
                  color: primaryColor,
                  borderColor: `${primaryColor}25`
                }}
                className="w-10 h-10 rounded-lg border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
              >
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                Reviews &amp; Publishing Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Review draft revisions, inspect diffs, and approve releases for instant live website publication.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                <span>View Publishing Queue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 5. What changed recently? (Activity Stream) */}
      {showRecentFeed && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Website Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit trail of recent updates and publications on {client?.name}.
              </p>
            </div>
            <Link
              href="/admin/tasks"
              style={{ color: primaryColor }}
              className="text-xs font-semibold hover:underline cursor-pointer"
            >
              View Full Audit Trail &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentRevisions.length > 0 ? (
              recentRevisions.slice(0, 5).map((rev: any, idx: number) => (
                <div key={rev.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {rev.description || rev.title || `Content Revision #${rev.id?.substring(0, 6)}`}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Author: <span className="font-medium text-slate-700 dark:text-slate-300">{rev.author || 'Malcolm Govender'}</span> &bull; Status: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Published</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono shrink-0">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Just now'}
                  </div>
                </div>
              ))
            ) : (
              /* Fallback representative activity records */
              <>
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        Updated Homepage Executive Overview &amp; Key Metrics
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Author: <span className="font-medium text-slate-700 dark:text-slate-300">Malcolm Govender</span> &bull; Status: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced Live</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono shrink-0">
                    2 hours ago
                  </div>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        Published Q2 Corporate Disclosure &amp; Operational Filing
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Author: <span className="font-medium text-slate-700 dark:text-slate-300">Executive Team</span> &bull; Status: <span className="text-emerald-600 dark:text-emerald-400 font-medium">Approved</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono shrink-0">
                    Yesterday
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
