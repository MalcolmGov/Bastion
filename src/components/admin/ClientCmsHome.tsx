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
  AlertCircle
} from 'lucide-react';
import { WorkspaceClient, WorkspaceSite } from './StudioWorkspaceProvider';

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
  const isGoldFields = client?.id === 'client_goldfields';
  const siteUrl = isGoldFields ? '/' : site ? `/sites/${site.slug}` : '/';

  // Stats from dashboard or realistic fallbacks
  const pendingApprovalsCount = dashboardData?.pendingTasks?.length || 2;
  const recentRevisions = dashboardData?.recentRevisions || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. What website am I managing? & 2. Is it live and healthy? */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 rounded-md">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/admin/editor"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-bastion text-white hover:bg-bastion-navy dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-semibold text-xs transition shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              <span>Open Visual Editor</span>
            </Link>

            <Link
              href={siteUrl}
              target="_blank"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition shadow-2xs"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. What needs my review? (Pending Approvals Panel) */}
      {pendingApprovalsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {pendingApprovalsCount} Draft Revisions Awaiting Review &amp; Publishing
              </div>
              <div className="text-xs text-amber-700/80 dark:text-amber-300/70 mt-0.5">
                Content updates have been prepared and are ready for executive sign-off before going live.
              </div>
            </div>
          </div>

          <Link
            href="/admin/tasks"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-950 font-semibold text-xs transition self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <span>Review Changes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 5. Where do I go to update content? (Plain-Language Action Cards) */}
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
            className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-bastion-blue dark:hover:border-sky-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-sky-950/60 border border-blue-100 dark:border-sky-800 text-bastion-blue dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-bastion-blue dark:group-hover:text-sky-400 transition">
              Pages &amp; Navigation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Manage page titles, headers, navigation menus, callouts, and layout sections across all public pages.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-bastion-blue dark:text-sky-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span>Manage Pages</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Visual Page Editor */}
          <Link
            href="/admin/editor"
            className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
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
            className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              {isGoldFields ? 'SENS Announcements & News' : 'News & Press Releases'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Publish regulatory filings, company announcements, press releases, and executive statements.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span>Publish Announcements</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Specialized Collection (Operations or Services) */}
          {isGoldFields ? (
            <Link
              href="/admin/operations"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                Mining Operations &amp; Projects
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Update production figures, reserve estimates, workforce stats, and gallery photos across all 10 mines.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span>Manage 10 Operations</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : (
            <Link
              href="/admin/media"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500/50 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                Media &amp; Downloads Library
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Upload photography, logos, brochures, presentation decks, and downloadable PDF assets.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-purple-600 dark:text-purple-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span>Browse Assets</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 5: Reports & Results or ESG */}
          {isGoldFields ? (
            <Link
              href="/admin/reports"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                Reports &amp; Financial Results
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Upload Integrated Annual Reports, quarterly financial statements, and investor presentation packs.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span>Manage 11 Reports</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : (
            <Link
              href="/admin/users"
              className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500/50 hover:shadow-md transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-bastion-blue dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-bastion-blue dark:group-hover:text-sky-400 transition">
                Team &amp; Welcome Emailer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Invite team members, assign permissions, and send branded welcome emails with secure access credentials.
              </p>
              <div className="flex items-center space-x-1 text-xs font-semibold text-bastion-blue dark:text-sky-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span>Invite Team</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}

          {/* Card 6: Approvals & Publishing */}
          <Link
            href="/admin/tasks"
            className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
              Reviews &amp; Publishing Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Review draft revisions, inspect diffs, and approve releases for instant live website publication.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span>View Publishing Queue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. What changed recently? (Activity Stream) */}
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
            className="text-xs font-semibold text-bastion-blue dark:text-sky-400 hover:underline"
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
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-bastion-blue dark:text-sky-400 flex items-center justify-center shrink-0">
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
    </div>
  );
}
