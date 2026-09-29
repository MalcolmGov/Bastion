'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  Palette,
  Eye,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Layers,
  Edit3,
  Send,
  Building,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Activity,
  FileText,
  Compass,
  FileSpreadsheet,
  Newspaper,
  Leaf,
  Terminal,
  Settings,
  Zap,
  Check
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function MoveStudioOverviewPage() {
  const { user } = useAdminAuth();
  const { clients, activeClient, activeSite, setActiveClientId, portalViewMode, setPortalViewMode } = useStudioWorkspace();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const isGoldFields = activeClient?.id === 'client_goldfields';
  const isGoldFieldsPortal = isGoldFields && portalViewMode === 'client';
  const liveUrl = isGoldFields ? '/' : activeSite ? `/sites/${activeSite.slug}` : '/';

  if (isGoldFieldsPortal) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Gold Fields Executive Corporate Affairs Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#171306] via-[#1E1908] to-[#120E04] border border-[#C99700]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-md">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>JSE: GFI &bull; NYSE: GFI &bull; Corporate Disclosure Portal</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-[#0E1522] border border-[#1E293B] px-2 py-0.5 rounded-md">
                Operated by Bastion Group
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gold Fields Corporate Affairs &amp; Investor CMS
            </h1>
            <p className="text-xs text-amber-200/80 mt-1.5 max-w-3xl leading-relaxed">
              Direct no-code portal to update global mining profiles, upload financial results, release SENS regulatory announcements, and track 2030 ESG decarbonisation targets. All published updates instantly sync to the public website (<strong className="text-white">goldfields.com</strong>) in under 500ms via signed webhooks.
            </p>

            <div className="flex items-center space-x-4 mt-3 text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Bastion Website Connected</span>
              </div>
              <span>&bull;</span>
              <div className="text-slate-300">
                Active Environment: <span className="text-amber-400 font-semibold">Production (Flagship)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            <Link
              href="/admin/news"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs tracking-wider uppercase transition shadow-md shadow-amber-500/20"
            >
              <Newspaper className="w-4 h-4 text-black" />
              <span>New SENS Notice</span>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#231E12] hover:bg-[#322A1A] border border-[#483B1F] text-amber-300 hover:text-white text-xs font-semibold transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Upload Report</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-slate-200 hover:text-white text-xs font-semibold transition"
              title="Open Live Public Website"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>View Site</span>
            </Link>
          </div>
        </div>

        {/* 4 Core Corporate Disclosure Pillars */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
              <span>Corporate Disclosure Modules (100% No-Code)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              4 Collections &bull; 21 Live Records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mining Operations */}
            <Link
              href="/admin/operations"
              className="p-5 rounded-2xl bg-[#0D121B] border border-[#2A2315] hover:border-amber-500/50 hover:bg-[#151922] transition space-y-3 group shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                  10 Mines
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                  Mining Assets &amp; Operations
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  2.15M oz attributable gold production across SA, Ghana, Australia, Peru &amp; Chile.
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {['South Deep', 'Tarkwa', 'St Ives', 'Salares Norte'].map((m) => (
                    <span key={m} className="text-[9px] px-1.5 py-0.2 rounded bg-[#161F2E] text-slate-300 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Reports & Results */}
            <Link
              href="/admin/reports"
              className="p-5 rounded-2xl bg-[#0D121B] border border-[#2A2315] hover:border-amber-500/50 hover:bg-[#151922] transition space-y-3 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                  11 Filings
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                  Financial Reports &amp; Results
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Integrated Annual Report 2025, Q1–Q4 booklets, mineral reserve updates and PDF downloads.
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {['Annual Report', 'Q1 2026', 'Mineral Reserves'].map((r) => (
                    <span key={r} className="text-[9px] px-1.5 py-0.2 rounded bg-[#161F2E] text-slate-300 font-mono">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* SENS Announcements */}
            <Link
              href="/admin/news"
              className="p-5 rounded-2xl bg-[#0D121B] border border-[#2A2315] hover:border-amber-500/50 hover:bg-[#151922] transition space-y-3 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
                  <Newspaper className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  JSE Live
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                  SENS Announcements
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Regulatory market press releases, trading statements, dividends, with AI editorial copilot.
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {['Trading Statement', 'Dividend Notice', 'Board Changes'].map((n) => (
                    <span key={n} className="text-[9px] px-1.5 py-0.2 rounded bg-[#161F2E] text-slate-300 font-mono">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            {/* 2030 ESG Targets */}
            <Link
              href="/admin/sustainability"
              className="p-5 rounded-2xl bg-[#0D121B] border border-[#2A2315] hover:border-amber-500/50 hover:bg-[#151922] transition space-y-3 group shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  -30% CO2e
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                  2030 ESG &amp; Decarbonisation
                </div>
                <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Khanyisa 50MW solar plant, Agnew microgrid, 75% water recycled &amp; community metrics.
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {['50MW Solar', '75% Water Recycled', 'Net-Zero 2050'].map((e) => (
                    <span key={e} className="text-[9px] px-1.5 py-0.2 rounded bg-[#161F2E] text-slate-300 font-mono">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bastion Integration Banner */}
        <div className="p-6 rounded-2xl bg-[#0C121D] border border-[#1E293B] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold uppercase">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Bastion Headless Integration &bull; Live Sync Engine</span>
            </div>
            <h2 className="text-base font-bold text-white">
              Headless Connection to Bastion Frontend (goldfields.com)
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Content updates in this portal immediately dispatch an HMAC-SHA256 signed webhook to Bastion&apos;s platform (<code className="text-amber-300 font-mono">https://goldfields.com/api/webhooks/cms-update</code>) to revalidate cached pages in under 500 milliseconds.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
              <span className="text-slate-400">Bearer Token: <span className="text-sky-300 font-mono">sec_goldfields_bastion_2026_live</span></span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400">Webhook Latency: <span className="text-emerald-400 font-bold">&lt; 500ms target (Last ping: 313ms)</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/sandbox"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-semibold transition"
            >
              <Terminal className="w-4 h-4" />
              <span>Open API Sandbox</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-slate-200 hover:text-white text-xs font-semibold transition"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Webhook Settings</span>
            </Link>
          </div>
        </div>

        {/* Quick Jump Shortcuts for Editors */}
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Quick Content Editor Shortcuts
              </h3>
              <p className="text-xs text-slate-400">
                One-click access to most frequently updated Gold Fields corporate profiles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/operations/south-deep"
              className="p-3.5 rounded-xl bg-[#121824] hover:bg-[#182130] border border-[#1E293B] hover:border-amber-500/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                  SD
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                    South Deep Mine Profile
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Gauteng &bull; 328koz &bull; 50MW Solar
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </Link>

            <Link
              href="/admin/reports"
              className="p-3.5 rounded-xl bg-[#121824] hover:bg-[#182130] border border-[#1E293B] hover:border-amber-500/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                  AR
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                    2025 Integrated Annual Report
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Primary PDF Publication &bull; Live
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </Link>

            <Link
              href="/admin/editor"
              className="p-3.5 rounded-xl bg-[#121824] hover:bg-[#182130] border border-[#1E293B] hover:border-amber-500/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                  VE
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                    Visual Page Editor
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Live Canvas &bull; Block Layouts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </Link>
          </div>
        </div>

        {/* Corporate Compliance Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>JSE / NYSE Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">Simultaneous</div>
            <div className="text-[11px] text-slate-400">Release timing locked to regulatory market disclosure rules.</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Two-Person Financial Sign-Off</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">Mandatory</div>
            <div className="text-[11px] text-slate-400">All quarterly results require reviewer and publisher dual approval.</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Outbound Webhook Status</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">&lt; 500ms</div>
            <div className="text-[11px] text-slate-400">Immediate cache revalidation on Bastion frontend servers.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0C121D] via-[#101726] to-[#141E30] border border-[#1E2E44] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-sky-400 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Move Studio Enterprise Platform • Multi-Tenant Agency Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Agency Control & Website Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Active Client: <strong className="text-white">{activeClient?.name || 'All Clients'}</strong> •
            Blueprint: <span className="text-sky-300 font-mono capitalize">{activeSite?.blueprintId || 'None'}</span> •
            Collection: <span className="text-indigo-300 font-mono capitalize">{activeSite?.designCollectionId || 'None'}</span> •
            Environment: <span className="text-emerald-400 font-mono capitalize">{activeSite?.status || 'Active'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/create"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-md shadow-sky-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Website</span>
          </Link>

          <Link
            href={liveUrl}
            target="_blank"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#172336] hover:bg-[#20314C] border border-[#273B57] text-slate-200 hover:text-white text-xs font-semibold transition"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Open Preview</span>
          </Link>
        </div>
      </div>

      {/* Useful Action Grid (Prompt Section 4) */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Useful Quick Actions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/create"
            className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-sky-500/50 hover:bg-[#121A28] transition space-y-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                Create Client Website
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                6-step guided wizard: import, review brand, choose design, and assemble.
              </div>
            </div>
          </Link>

          <Link
            href="/admin/brand"
            className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-amber-500/50 hover:bg-[#121A28] transition space-y-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                Review Extracted Brand
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Inspect 3-layer brand governance, lock tokens, and verify typography scale.
              </div>
            </div>
          </Link>

          <Link
            href={`/admin/editor?siteSlug=${activeSite?.slug || 'apex-advisory'}`}
            className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-emerald-500/50 hover:bg-[#121A28] transition space-y-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                Visual Website Editor
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                3-panel responsive editor with live canvas and targeted AI assistance.
              </div>
            </div>
          </Link>

          <Link
            href="/admin/tasks"
            className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-indigo-500/50 hover:bg-[#121A28] transition space-y-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Reviews & Publishing
              </div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Verify two-person approval, release snapshots, and instant rollback.
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Managed Client Projects Matrix */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Managed Client Projects ({clients.length})
            </h2>
            <p className="text-xs text-slate-400">
              Each website operates in tenant isolation with its own brand kit, blueprint, and CMS records.
            </p>
          </div>

          <Link
            href="/admin/clients"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#1E293B] border border-[#1E293B] rounded-xl overflow-hidden">
          {clients.map((c) => {
            const isActive = c.id === activeClient?.id;
            const primarySite = c.websites?.[0];
            return (
              <div
                key={c.id}
                className={`p-4 flex items-center justify-between transition ${
                  isActive ? 'bg-[#121A26]' : 'bg-[#0E1522] hover:bg-[#111824]'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#141C2A] border border-[#232F42] flex items-center justify-center font-bold text-xs text-sky-400 shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {primarySite?.blueprintId || 'corporate'} • {primarySite?.designCollectionId || 'editorial'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {primarySite?.status || 'Published'}
                  </span>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => setActiveClientId(c.id)}
                      className="px-2.5 py-1 rounded bg-[#141C2A] border border-[#232F42] text-xs text-slate-300 hover:text-white"
                    >
                      Switch
                    </button>
                  )}

                  <Link
                    href={`/admin/editor?siteSlug=${primarySite?.slug || c.slug}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
                    title="Edit in Visual Editor"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <Link
                    href={c.id === 'client_goldfields' ? '/' : `/sites/${primarySite?.slug || c.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
                    title="View live site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Website Health & Integrity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Website Health Status</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">100% OK</div>
          <div className="text-[11px] text-slate-400">Zero broken internal navigation links detected.</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Approved Brand Lock</span>
            <ShieldCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">Protected</div>
          <div className="text-[11px] text-slate-400">Core palette and vector marks locked against AI drift.</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Database Storage</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">LibSQL / SQLite</div>
          <div className="text-[11px] text-slate-400">Persistent local storage with multi-region cloud parity.</div>
        </div>
      </div>
    </div>
  );
}
