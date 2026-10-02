'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Edit3,
  FileText,
  Compass,
  FileSpreadsheet,
  Newspaper,
  FolderOpen,
  Send,
  UserPlus,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  SlidersHorizontal,
  BookOpen,
  CheckCircle2,
  Info,
  CalendarCheck,
  ChevronRight,
  PlusCircle,
  Lock,
  Building,
  HelpCircle
} from 'lucide-react';
import { WorkspaceClient, WorkspaceSite } from './StudioWorkspaceProvider';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';
import { ClientLearningHub } from './ClientLearningHub';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'learning_hub'>('overview');

  const isGoldFields = client?.id === 'client_goldfields';
  const siteUrl = isGoldFields ? '/' : site ? `/sites/${site.slug}` : '/';

  // Extract REAL counts from database / dashboardData with ZERO false dummy numbers
  const statusCounts: { status: string; count: number }[] = dashboardData?.statusCounts || [];
  const publishedPagesCount = Number(statusCounts.find(s => s.status === 'published')?.count || (site && site.status === 'published' ? 1 : 0));
  const draftRevisionsCount = Number(statusCounts.find(s => s.status === 'draft')?.count || 0);
  const pendingApprovalsList = dashboardData?.pendingItems?.filter((i: any) => i.status === 'in_review') || [];
  const pendingApprovalsCount = pendingApprovalsList.length;
  const mediaCount = dashboardData?.mediaCount ?? 0;
  const auditLogs = dashboardData?.auditLogs || [];

  const isBrandNewWorkspace = publishedPagesCount === 0 && draftRevisionsCount === 0;

  const gradientBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  // Preferences toggles
  const showDiagnostics = preferences.sections?.clientDiagnosticsBar !== false;
  const showActionCards = preferences.sections?.clientActionCards !== false;
  const showRecentFeed = preferences.sections?.clientRecentFeed !== false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      
      {/* 1. Executive Identity Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div 
          className="absolute -top-12 -right-12 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
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

              {publishedPagesCount > 0 ? (
                <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Production Website Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  <span>Workspace Active &bull; Staging Ready</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
              {client?.name} Website Content Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Welcome to your dedicated corporate content portal. Author pages, coordinate team reviews, publish announcements, and manage media with real-time edge synchronization and full King IV audit compliance.
            </p>

            {/* Diagnostics Bar */}
            {showDiagnostics && (
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <span className={`h-2 w-2 rounded-full ${publishedPagesCount > 0 ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {publishedPagesCount > 0 ? 'Production Live' : 'Initial Workspace Staging'}
                  </span>
                </div>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <div>
                  Domain: <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {site?.primaryDomain || (client as any)?.primaryDomain || (isGoldFields ? 'goldfields.com' : `${client?.slug || 'portal'}.bastion.digital`)}
                  </strong>
                </div>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Edge Latency: &lt;50ms</span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'learning_hub' ? 'overview' : 'learning_hub')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition cursor-pointer shadow-2xs ${
                activeTab === 'learning_hub'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{activeTab === 'learning_hub' ? 'Back to Overview' : 'Platform Learning Hub'}</span>
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

            {publishedPagesCount > 0 && (
              <Link
                href={siteUrl}
                target="_blank"
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
              >
                <span>View Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* If Learning Hub Tab is active, display the comprehensive learning hub */}
      {activeTab === 'learning_hub' ? (
        <ClientLearningHub isEmbedded={true} />
      ) : (
        <>
          {/* 2. REAL Corporate KPI Metric Cards (No Dummy Numbers) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Published Pages */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div 
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                  {publishedPagesCount} {publishedPagesCount === 1 ? 'Page' : 'Pages'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  {publishedPagesCount === 0 ? 'Ready for Setup' : 'Active Public Sections'}
                </div>
              </div>
            </div>

            {/* KPI 2: Active Draft Revisions */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div 
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                  borderColor: `${accentColor}30`
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              >
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                  {draftRevisionsCount} {draftRevisionsCount === 1 ? 'Draft' : 'Drafts'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">In-Flight Revisions</div>
              </div>
            </div>

            {/* KPI 3: Media & Document Assets */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div 
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              >
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                  {mediaCount} {mediaCount === 1 ? 'Asset' : 'Assets'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">Media &amp; PDFs in Vault</div>
              </div>
            </div>

            {/* KPI 4: Compliance Sign-Off Queue */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div 
                style={{
                  backgroundColor: pendingApprovalsCount > 0 ? '#F59E0B15' : '#10B98115',
                  color: pendingApprovalsCount > 0 ? '#F59E0B' : '#10B981',
                  borderColor: pendingApprovalsCount > 0 ? '#F59E0B30' : '#10B98130'
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0"
              >
                {pendingApprovalsCount > 0 ? <Send className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                  {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Pending` : 'All Synced'}
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  {pendingApprovalsCount > 0 ? 'Awaiting Sign-Off' : 'Zero Pending Approvals'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Real Pending Approvals Alert (Only shown if REAL pending tasks exist) */}
          {pendingApprovalsCount > 0 && (
            <div 
              style={{
                borderColor: `${accentColor}40`,
                backgroundColor: `${accentColor}08`
              }}
              className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start sm:items-center space-x-3">
                <div 
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {pendingApprovalsCount} Draft Revision{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Executive Review &amp; Publishing
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Content updates have been prepared and require authorized compliance review before going live.
                  </div>
                </div>
              </div>

              <Link
                href="/admin/tasks"
                style={{
                  background: gradientBg,
                  boxShadow: `0 4px 12px ${primaryColor}30`
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-white font-bold text-xs transition self-start sm:self-auto shrink-0 shadow-2xs hover:opacity-95 cursor-pointer"
              >
                <span>Review Changes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* 4. GUIDED LAUNCHPAD FOR NEW WORKSPACES (Zero-State Guidance) */}
          {isBrandNewWorkspace && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-500/5 via-slate-50 to-indigo-500/5 dark:from-purple-950/20 dark:via-[#111726] dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                      Guided Workspace Launchpad
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-bold text-slate-500">First-Time Setup</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                    Welcome, {client?.name}! Here is your recommended setup path
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    Your dedicated corporate portal is freshly provisioned. Follow these three steps to organize your content team, explore your digital pages, and begin publishing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('learning_hub')}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Full Platform Guide</span>
                </button>
              </div>

              {/* 3 Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Explore Pages &amp; Architecture
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Review the corporate navigation tree, statutory headers, footers, and page blueprints configured for {client?.name}.
                    </p>
                  </div>
                  <Link
                    href="/admin/pages"
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <span>View Navigation &amp; Pages</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Invite Team &amp; Assign Roles
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Add your colleagues as Content Editors, Compliance Reviewers, or Corporate Admins with direct, secure login invites.
                    </p>
                  </div>
                  <Link
                    href="/admin/users"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <span>Manage Team Members</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Try the Live Visual Editor
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Test inline editing with live preview. Changes are safely preserved in private draft mode until submitted for sign-off.
                    </p>
                  </div>
                  <Link
                    href="/admin/editor"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <span>Launch Visual Editor</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* 5. What would you like to update? (Plain-Language Action Cards) */}
          {showActionCards && (
            <div>
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Corporate Content Management Tools
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an operational module below to make content updates, review drafts, or manage your digital repository.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Pages & Navigation */}
                <Link
                  href="/admin/pages"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div 
                    style={{
                      backgroundColor: `${primaryColor}12`,
                      color: primaryColor,
                      borderColor: `${primaryColor}25`
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    Pages &amp; Navigation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Manage page hierarchy, header menus, callouts, SEO descriptions, and statutory disclosure links.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                    <span>Manage Pages</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 2: Visual Page Editor */}
                <Link
                  href="/admin/editor"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    Visual Website Editor
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Preview your site live and edit text, headlines, and callout blocks inline with zero code required.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span>Open Visual Editor</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 3: News & Announcements */}
                <Link
                  href="/admin/news"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div 
                    style={{
                      backgroundColor: `${accentColor}12`,
                      color: accentColor,
                      borderColor: `${accentColor}25`
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  >
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    News &amp; Press Releases
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Publish corporate announcements, executive appointments, media releases, and company updates.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: accentColor }}>
                    <span>Publish Announcements</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 4: Media Library */}
                <Link
                  href="/admin/media"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div 
                    style={{
                      backgroundColor: `${primaryColor}12`,
                      color: primaryColor,
                      borderColor: `${primaryColor}25`
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    Media &amp; Downloads Library
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Upload corporate photography, logos, brochures, presentation decks, and downloadable PDF reports.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                    <span>Browse Media Assets</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 5: Team & Access Control */}
                <Link
                  href="/admin/users"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div 
                    style={{
                      backgroundColor: `${primaryColor}12`,
                      color: primaryColor,
                      borderColor: `${primaryColor}25`
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  >
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    Team &amp; Access Control
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Invite colleagues, assign role permissions, and deliver branded welcome credentials with direct access links.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                    <span>Invite Team Members</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 6: Approvals & Publishing Queue */}
                <Link
                  href="/admin/tasks"
                  className="p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:shadow-md transition group cursor-pointer"
                >
                  <div 
                    style={{
                      backgroundColor: `${primaryColor}12`,
                      color: primaryColor,
                      borderColor: `${primaryColor}25`
                    }}
                    className="w-10 h-10 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-105 transition-transform"
                  >
                    <Send className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white transition">
                    Reviews &amp; Publishing Queue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Inspect draft diffs, submit review notes, and approve releases for live edge deployment.
                  </p>
                  <div className="flex items-center space-x-1 text-xs font-semibold mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80" style={{ color: primaryColor }}>
                    <span>View Publishing Queue</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* 6. Embedded Feature Directory & Learning Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Platform Documentation &amp; Knowledge Base
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                  Corporate Content Management &bull; Feature Directory
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('learning_hub')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View All 8 Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div 
                onClick={() => setActiveTab('learning_hub')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                    Live Visual Authoring
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  How inline WYSIWYG editing, mobile breakpoints, and draft persistence work.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('learning_hub')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Send className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                    Four-Eyes Approvals
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Separation of duties between content authors and compliance sign-off officers.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('learning_hub')}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600">
                    King IV Governance &amp; Audit
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Immutable revision audit trail, POPIA privacy protection, and disclaimers.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Real Activity Feed or Reassuring Zero-State Audit Banner */}
          {showRecentFeed && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recent Website Activity
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Audit trail of corporate updates and publications on {client?.name}.
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

              {auditLogs.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {auditLogs.slice(0, 5).map((log: any, idx: number) => (
                    <div key={log.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {log.action} &bull; {log.collection || 'Content'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Actor: <span className="font-medium text-slate-700 dark:text-slate-300">{log.actor_name || 'System'}</span> &bull; Result: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{log.result || 'Success'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono shrink-0">
                        {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Premium, Reassuring Zero-State */
                <div className="p-8 text-center rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audit Logging Active &bull; Zero Revisions Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    No publications or content edits have been recorded yet for {client?.name}. When your team modifies pages, uploads media, or submits drafts, an immutable King IV-compliant audit record will appear here in real time.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
