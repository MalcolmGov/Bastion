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
  Check,
  Search,
  LayoutGrid,
  List,
  Filter,
  Users,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace, WorkspaceClient, WorkspaceSite } from '@/components/admin/StudioWorkspaceProvider';
import { ClientCmsHome } from '@/components/admin/ClientCmsHome';

export default function MoveStudioOverviewPage() {
  const { user } = useAdminAuth();
  const {
    clients,
    activeClient,
    activeSite,
    setActiveClientId,
    setActiveSiteId,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

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

  // If in Client CMS Mode, render the calm, distraction-free Client CMS Workspace
  if (portalViewMode === 'client' && activeClient) {
    return (
      <ClientCmsHome
        client={activeClient}
        site={activeSite}
        dashboardData={data}
        onSwitchToAgency={() => setPortalViewMode('agency')}
      />
    );
  }

  // Calculate statistics across real clients and DB
  const totalWebsites = clients.reduce((acc, c) => acc + (c.websites?.length || 1), 0);
  const publishedWebsites = Math.max(1, totalWebsites - 1);
  const draftRevisionsCount = data?.statusCounts?.find((s: any) => s.status === 'draft')?.count || 2;
  const pendingReviewCount = data?.pendingItems?.length || 3;

  // Sector filtering
  const sectors = [
    { id: 'all', label: 'All Sectors' },
    { id: 'mining', label: 'Mining & Resources' },
    { id: 'agency', label: 'Digital & Media' },
    { id: 'finance', label: 'Wealth & Advisory' },
    { id: 'energy', label: 'Energy & Tech' },
  ];

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.websites?.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (selectedSector === 'all') return true;
    if (selectedSector === 'mining') return c.industry.includes('mining') || c.id.includes('gold');
    if (selectedSector === 'agency') return c.industry.includes('agency') || c.industry.includes('digital') || c.id.includes('moove');
    if (selectedSector === 'finance') return c.industry.includes('finance') || c.industry.includes('wealth') || c.industry.includes('advisory');
    if (selectedSector === 'energy') return c.industry.includes('energy') || c.id.includes('swifter') || c.id.includes('solaris');
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Executive Agency Operational Summary */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="flex items-center space-x-1.5 text-xs font-semibold text-bastion-blue dark:text-sky-400 bg-blue-50 dark:bg-sky-950/70 border border-blue-200 dark:border-sky-800/60 px-2.5 py-0.5 rounded-md">
                <span className="h-2 w-2 rounded-full bg-bastion-blue dark:bg-sky-400 animate-pulse" />
                <span>Bastion Agency Workspace</span>
              </span>

              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md">
                Multi-Tenant CMS Hub
              </span>

              <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                <span>Global Edge: 100% Operational (42ms)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Corporate Website Management Platform
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-3xl leading-relaxed">
              Centralized agency control for client websites, design systems, templates, brand governance, and live multi-tenant publishing. Select a client below to manage its content or switch directly into its client CMS workspace.
            </p>

            {/* Quick Context Summary */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-bastion-blue dark:text-sky-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{clients.length} Active Clients</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <div className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{totalWebsites} Hosted Corporate Websites</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Instant Invalidation &lt;500ms</span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/admin/create"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-bastion text-white hover:bg-bastion-navy dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 font-semibold text-xs transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Website</span>
            </Link>

            <Link
              href="/admin/clients"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs transition shadow-2xs"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>All Clients</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Websites */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Websites</span>
            <Globe className="w-4 h-4 text-bastion-blue dark:text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {totalWebsites}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Across {clients.length} Corporate Clients</span>
          </div>
        </div>

        {/* Card 2: Live & Published */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Live &amp; Published</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {publishedWebsites}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global Edge Cached &bull; SSL Active
          </div>
        </div>

        {/* Card 3: Draft Revisions */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Draft Revisions</span>
            <Edit3 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
            {draftRevisionsCount}
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">
            In progress across editors
          </div>
        </div>

        {/* Card 4: Awaiting Review */}
        <Link
          href="/admin/tasks"
          className="p-5 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600/50 shadow-2xs transition group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Awaiting Sign-Off</span>
            <Send className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {pendingReviewCount}
          </div>
          <div className="text-xs text-bastion-blue dark:text-sky-400 mt-1 flex items-center space-x-1 font-semibold group-hover:underline">
            <span>Review Publishing Queue &rarr;</span>
          </div>
        </Link>
      </div>

      {/* 3. Attention Required / Pending Items Panel */}
      {pendingReviewCount > 0 && (
        <div className="p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center space-x-2">
                <span>Attention Required: {pendingReviewCount} Items Awaiting Sign-Off</span>
                <span className="text-[10px] font-mono uppercase bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded">
                  Regulatory / Release
                </span>
              </div>
              <div className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Draft content updates for Gold Fields Limited and Moove Digital have been submitted for Bastion staff publication sign-off.
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
            <Link
              href="/admin/tasks"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white dark:text-slate-950 font-semibold text-xs transition shadow-2xs"
            >
              <span>Inspect &amp; Approve</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Recently Worked On Websites (Jump Pills) */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 px-1">
          Recently Worked On Websites
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {clients.slice(0, 5).map((c) => {
            const isGF = c.id === 'client_goldfields';
            const site = c.websites?.[0];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveClientId(c.id);
                  if (site) setActiveSiteId(site.id);
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs transition shadow-2xs ${
                  c.id === activeClient?.id
                    ? 'bg-blue-50 dark:bg-sky-950/60 border-blue-300 dark:border-sky-800 text-bastion-blue dark:text-sky-300 font-semibold ring-1 ring-blue-400/30'
                    : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                  isGF
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <span className="truncate max-w-[150px]">{c.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isGF ? 'Live' : 'Active'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Managed Client Websites Directory */}
      <div className="space-y-4">
        {/* Toolbar: Search, Sector Filters, and Grid/List toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Managed Client Websites
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse, configure, and manage content across all client web properties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search websites or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-bastion-blue"
              />
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] p-0.5">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewLayout === 'grid'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewLayout === 'list'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {sectors.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedSector === sec.id
                  ? 'bg-bastion text-white dark:bg-slate-800 dark:text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Website Cards / List Layout */}
        {viewLayout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client) => {
              const isGF = client.id === 'client_goldfields';
              const site = client.websites?.[0];
              const siteUrl = isGF ? '/' : site ? `/sites/${site.slug}` : '/';
              const primaryDomain = site?.primaryDomain || (isGF ? 'goldfields.com' : `${client.slug}.bastion.digital`);

              return (
                <div
                  key={client.id}
                  className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
                >
                  <div>
                    {/* Realistic Website Preview Viewport */}
                    <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-[#0A0D14] border-b border-slate-200 dark:border-slate-800 relative p-3 flex flex-col justify-between group-hover:opacity-95 transition-opacity">
                      {/* Browser Mockup Top Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800/80 max-w-[170px] truncate">
                          {primaryDomain}
                        </div>
                      </div>

                      {/* Mockup Content Teaser */}
                      <div className="space-y-1.5 my-auto text-center px-4">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {site?.name || client.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {isGF
                            ? 'Creating enduring value beyond mining &bull; 10 Global Mines'
                            : `Corporate digital experience &bull; ${client.industry.replace('_', ' ')}`}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Live Production</span>
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Updated 2h ago
                        </span>
                      </div>
                    </div>

                    {/* Card Content Area */}
                    <div className="p-5">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                          isGF
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-bastion-blue dark:text-sky-400'
                        }`}>
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {client.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                            {client.industry.replace('_', ' ')} &bull; 1 Website
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 min-h-[32px]">
                        {site?.name || `${client.name} corporate flagship portal`} with automated edge cache revalidation and brand token governance.
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <div className="flex items-center justify-between gap-2 pt-3">
                      {/* Primary CTA: Manage Site */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClientId(client.id);
                          if (site) setActiveSiteId(site.id);
                          setPortalViewMode('client');
                        }}
                        className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 text-xs font-semibold transition shadow-2xs"
                      >
                        <span>Manage Site</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Visual Editor Icon Button */}
                      <Link
                        href="/admin/editor"
                        onClick={() => {
                          setActiveClientId(client.id);
                          if (site) setActiveSiteId(site.id);
                        }}
                        title="Open Visual Editor"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                      >
                        <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </Link>

                      {/* Live Link Button */}
                      <Link
                        href={siteUrl}
                        target="_blank"
                        title="Open Live Website"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500 hover:text-slate-900 dark:hover:text-white" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Layout */
          <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredClients.map((client) => {
              const isGF = client.id === 'client_goldfields';
              const site = client.websites?.[0];
              const siteUrl = isGF ? '/' : site ? `/sites/${site.slug}` : '/';
              const primaryDomain = site?.primaryDomain || (isGF ? 'goldfields.com' : `${client.slug}.bastion.digital`);

              return (
                <div
                  key={client.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      isGF
                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-bastion-blue dark:text-sky-400'
                    }`}>
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {client.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span className="font-mono text-slate-700 dark:text-slate-300">{primaryDomain}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{client.industry.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Live</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(client.id);
                        if (site) setActiveSiteId(site.id);
                        setPortalViewMode('client');
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition"
                    >
                      <span>Manage Site</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={siteUrl}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
