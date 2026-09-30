'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Monitor,
  Mic,
  Calendar,
  Lock,
  X,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace, WorkspaceClient, WorkspaceSite } from '@/components/admin/StudioWorkspaceProvider';
import { ClientCmsHome } from '@/components/admin/ClientCmsHome';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';
import { BastionLogo } from '@/components/admin/BastionLogo';
import { ExecutiveAnalyticsDashboard } from '@/components/admin/ExecutiveAnalyticsDashboard';

export default function MoveStudioOverviewPage() {
  const router = useRouter();
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

  const {
    preferences: dashboardPrefs,
    primaryColor: primaryCol,
    accentColor
  } = useDashboardCustomizer();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [quickBrandUrl, setQuickBrandUrl] = useState('');

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
  const pendingReviewCount = data?.pendingItems?.length || 2;

  const toggleListeningState = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setSearchQuery('Gold Fields Mining Operations');
        setIsListening(false);
      }, 1500);
    } else {
      setIsListening(false);
    }
  };

  const handleLaunchBrandDna = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickBrandUrl.trim()) {
      router.push(`/admin/brand?url=${encodeURIComponent(quickBrandUrl.trim())}`);
    } else {
      router.push('/admin/brand');
    }
  };

  const suggestionChips = [
    { label: 'Brand DNA Extractor', query: 'Brand DNA' },
    { label: 'SENS Announcements', query: 'SENS' },
    { label: 'Bastion Group', query: 'Bastion' },
    { label: 'Gold Fields Mining', query: 'Gold Fields' },
    { label: 'Signed Webhooks', query: 'Webhooks' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Signature Hero Card with Embedded Search & Voice Composer */}
      {dashboardPrefs.sections.heroComposer && (
        <section className="rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80">
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${primaryCol} 0%, ${dashboardPrefs.accentColor} 50%, #4F46E5 100%)`
            }}
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Good afternoon, Malcolm. Let&apos;s govern high-impact corporate web properties.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Autonomous edge invalidation, website vitals, and multi-tenant performance across all corporate client environments.
              </p>
            </div>

            {/* Search Composer Box */}
            <div className="relative pt-0.5">
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200 shadow-2xs">
                  <div className="flex items-center gap-2.5 px-3 flex-1 w-full relative">
                    <Search className="w-4.5 h-4.5 shrink-0" style={{ color: primaryCol }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title, client, or collection across Bastion CMS…"
                      className="w-full py-2 pr-8 bg-transparent text-sm sm:text-base focus:outline-none font-semibold text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end px-0.5">
                    {/* Integrated Microphone */}
                    <button
                      type="button"
                      onClick={toggleListeningState}
                      style={isListening ? { backgroundColor: primaryCol, borderColor: primaryCol } : undefined}
                      className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                        isListening
                          ? 'text-white animate-pulse'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" style={{ color: isListening ? '#FFFFFF' : primaryCol }} />
                      <span>{isListening ? 'Listening…' : 'Voice'}</span>
                    </button>

                    {/* Primary Search CTA */}
                    <button
                      type="submit"
                      style={{ backgroundColor: primaryCol }}
                      className="h-9 px-5 rounded-lg text-white text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all active:scale-[0.98] shrink-0 hover:opacity-90 cursor-pointer shadow-md"
                    >
                      <span>Search CMS</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Understated Suggestion Chips */}
            <div className="flex items-center gap-2 pt-0.5 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Popular:</span>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(chip.query)}
                  style={{ color: primaryCol }}
                  className="font-semibold hover:underline transition-colors cursor-pointer"
                >
                  {chip.label}{idx < suggestionChips.length - 1 ? ' •' : ''}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. UPGRADED RECHARTS VISUAL EXECUTIVE ANALYTICS DASHBOARD */}
      <ExecutiveAnalyticsDashboard clients={clients} primaryColor={primaryCol} accentColor={accentColor} />

      {/* 5. Clean & Decluttered Client Snapshot + Supporting Rail */}
      <div className={`grid grid-cols-1 ${dashboardPrefs.layoutMode === 'focus' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6 items-start`}>
        
        {/* Left Column: Decluttered Snapshot of Corporate Clients */}
        <div className={`${dashboardPrefs.layoutMode === 'focus' ? 'w-full' : 'lg:col-span-8'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Corporate Clients &amp; Flagship Properties
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {clients.length} Tenants
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                High-performance corporate web properties deployed on Bastion multi-tenant infrastructure.
              </p>
            </div>

            <Link
              href="/admin/clients"
              style={{ color: primaryCol }}
              className="text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All Properties</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Compact Client Summary Rows */}
          <div className="space-y-3">
            {clients.slice(0, 4).map((client) => {
              const isGF = client.id === 'client_goldfields';
              const website = client.websites?.[0];
              const domain = client.id === 'client_goldfields' ? 'goldfields.com' : `${client.slug}.bastiongroup.co.za`;

              return (
                <div
                  key={client.id}
                  className="rounded-xl p-4 transition-all duration-200 backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-800/80 shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border"
                      style={isGF ? {
                        backgroundColor: 'rgba(201, 151, 0, 0.1)',
                        color: '#C99700',
                        borderColor: 'rgba(201, 151, 0, 0.3)'
                      } : {
                        backgroundColor: `${primaryCol}15`,
                        color: primaryCol,
                        borderColor: `${primaryCol}30`
                      }}
                    >
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {client.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                          100% SLA
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5 truncate">
                        <span>{domain}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{client.industry.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(client.id);
                        setPortalViewMode('client');
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      Client CMS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(client.id);
                        router.push('/admin/pages');
                      }}
                      style={{ backgroundColor: primaryCol }}
                      className="px-3 py-1.5 rounded-lg text-white text-xs font-bold inline-flex items-center gap-1 transition-all active:scale-[0.98] shadow-2xs hover:opacity-95 cursor-pointer"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-white" />
                    </button>

                    <Link
                      href={isGF ? '/' : `/sites/${website?.slug || client.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Open live site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helpful Navigation Prompt to Clients & Websites */}
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-black text-purple-900 dark:text-purple-300">
                Managed For You Corporate Properties have moved
              </div>
              <p className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">
                Access full environment lists, client branding tokens, custom domain DNS records, and visual editor links.
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 shadow-2xs transition"
            >
              <span>Go to Clients &amp; Websites</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Rail: SENS Calendar, Brand DNA Quick Launch, and Edge Network */}
        {dashboardPrefs.layoutMode !== 'focus' && (
          <div className="lg:col-span-4 space-y-4">
            {/* Calendar Pipeline */}
            {dashboardPrefs.sections.calendarPipeline && (
              <div className="rounded-2xl p-5 space-y-3 relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, #F59E0B 0%, ${primaryCol} 100%)`
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Next on your calendar</h3>
                      <p className="text-xs font-semibold text-slate-500">Publishing Pipeline</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Wed 14:00 SAST
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Gold Fields Q3 Production Update</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
                      SENS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Corporate relations submitted regulatory release for scheduled publishing.
                  </p>
                </div>

                <Link
                  href="/admin/tasks"
                  style={{ backgroundColor: primaryCol }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white hover:opacity-95 shadow-xs transition"
                >
                  <span>Inspect &amp; Approve Release</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Brand DNA Quick Launch */}
            {dashboardPrefs.sections.brandDnaExtractor && (
              <div className="rounded-2xl p-5 space-y-3 relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs">
                <div 
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${primaryCol} 0%, #3B82F6 100%)`
                  }}
                />
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${primaryCol}15`,
                      color: primaryCol,
                      borderColor: `${primaryCol}30`
                    }}
                  >
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Brand DNA Extractor</h3>
                    <p className="text-xs font-semibold text-slate-500">URL &rarr; Approved Brand Kit</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Crawl any corporate site to extract computed styles, SVG logos, Google Fonts, and generate WCAG-compliant theme tokens.
                </p>

                <form onSubmit={handleLaunchBrandDna} className="space-y-2">
                  <input
                    type="text"
                    value={quickBrandUrl}
                    onChange={(e) => setQuickBrandUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: primaryCol }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white hover:opacity-95 shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Brand Extractor</span>
                  </button>
                </form>
              </div>
            )}

            {/* Edge Network Status */}
            {dashboardPrefs.sections.edgeNetworkStatus && (
              <div className="rounded-2xl p-5 space-y-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Global Edge Network</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    100% Operational
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Johannesburg Node (JNB-1)</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">18ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frankfurt Edge (FRA-1)</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">42ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>London Edge (LHR-1)</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">46ms</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
