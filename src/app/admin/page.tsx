'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceActionCenter } from '@/components/admin/WorkspaceActionCenter';
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
  const [timeGreeting, setTimeGreeting] = useState('Good afternoon');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning');
    else if (hour < 18) setTimeGreeting('Good afternoon');
    else setTimeGreeting('Good evening');

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setIsLoading(true);
    async function loadDashboard() {
      try {
        const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
        const res = await fetch(`/api/admin/dashboard${query}`, { signal: controller.signal, cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (!controller.signal.aborted) setData(json);
        }
      } catch (err) {
        if (!controller.signal.aborted) console.error('Failed to load dashboard:', err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    loadDashboard();
    return () => controller.abort();
  }, [activeClient?.id]);

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
        setSearchQuery('Vodacom Group Corporate Website');
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

  const resolveDisplayName = (): string => {
    if (!user?.name) return 'Malcolm';
    const email = user.email?.toLowerCase() || '';
    if (email.includes('malcolm') || email.includes('movedigital')) {
      return 'Malcolm';
    }
    const cleanName = user.name.trim();
    const firstWord = cleanName.split(/\s+/)[0]?.replace(/[.,]/g, '');
    if (!firstWord || firstWord.toLowerCase() === 'm' || ['admin', 'bastion', 'corporate', 'client', 'lead', 'agency'].includes(firstWord.toLowerCase())) {
      return 'Malcolm';
    }
    return firstWord;
  };

  const displayName = resolveDisplayName();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Signature Hero Card with Embedded Search & Voice Composer */}
      {dashboardPrefs.sections.heroComposer && (
        <div className="relative group">
          {/* 1. Ambient Diffused Back Shadow / Glow Card */}
          <div 
            className="absolute -inset-1 sm:-inset-1.5 rounded-[32px] blur-2xl opacity-65 dark:opacity-45 transition-all duration-700 pointer-events-none animate-pulse-slow"
            style={{
              background: `radial-gradient(ellipse at 20% 50%, ${primaryCol}60 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, ${dashboardPrefs.accentColor}50 0%, transparent 60%), linear-gradient(135deg, ${primaryCol}40 0%, #3B82F635 30%, #06B6D430 60%, ${dashboardPrefs.accentColor}40 100%)`
            }}
          />

          {/* 2. Glowing Popping Gradient Motion Border Frame */}
          <div 
            className="relative p-[2px] rounded-[30px] overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              background: `linear-gradient(115deg, ${primaryCol}, #3B82F6, #06B6D4, #10B981, #F59E0B, #EC4899, ${primaryCol})`
            }}
          >
            {/* Continuous Motion Layer for the Gradient Border */}
            <div 
              className="absolute inset-0 animate-gradient-border pointer-events-none"
              style={{
                background: `linear-gradient(115deg, ${primaryCol}, #3B82F6, #06B6D4, #10B981, #F59E0B, #EC4899, ${primaryCol})`,
                backgroundSize: '300% 300%'
              }}
            />

            {/* Rotating Conic Light Sheen Traveling Around the Border Perimeter */}
            <div className="absolute inset-[-150%] pointer-events-none opacity-50 mix-blend-overlay">
              <div 
                className="w-full h-full animate-border-spin"
                style={{
                  background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(255, 255, 255, 0.95) 315deg, transparent 360deg)'
                }}
              />
            </div>

            {/* 3. Hero Card Content Surface */}
            <section className="rounded-[28px] p-6 sm:p-8 lg:p-9 relative overflow-hidden backdrop-blur-2xl bg-white/95 dark:bg-[#0B101B]/95 transition-all duration-300">
          {/* Animated Aurora Glow Orbs */}
          <div 
            className="absolute -top-28 -right-28 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
            style={{
              background: `radial-gradient(circle, ${primaryCol}30 0%, #4F46E520 50%, transparent 70%)`
            }}
          />
          <div 
            className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow-reverse"
            style={{
              background: `radial-gradient(circle, ${dashboardPrefs.accentColor}25 0%, #06B6D415 50%, transparent 70%)`
            }}
          />

          {/* Animated Shimmer Top Border */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2px] opacity-80"
            style={{
              background: `linear-gradient(90deg, ${primaryCol} 0%, ${dashboardPrefs.accentColor} 50%, #4F46E5 100%)`
            }}
          />
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer-sweep" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 8 Cols: Executive Welcome & Command Search */}
            <div className="lg:col-span-8 space-y-4">
              {/* Executive Eyebrow Badge */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  Bastion Executive Network
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  12 Enterprise Tenants Live on Edge
                </span>
              </div>

              {/* Polished Executive Headline & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.035em] text-slate-900 dark:text-white leading-[1.12]">
                  {timeGreeting}, {displayName}.
                </h1>
                <p className="text-sm sm:text-base leading-relaxed text-slate-500 dark:text-slate-400 font-normal max-w-2xl tracking-[-0.01em]">
                  Your central command center for multi-tenant publishing, regulatory compliance, and real-time edge delivery across all corporate properties.
                </p>
              </div>

              {/* Elevated Command Search Box */}
              <div className="relative pt-1">
                <form onSubmit={(e) => { e.preventDefault(); }}>
                  <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all duration-200 shadow-sm">
                    <div className="flex items-center gap-3 px-3.5 flex-1 w-full relative">
                      <Search className="w-5 h-5 shrink-0" style={{ color: primaryCol }} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clients, corporate websites, releases, or pages…"
                        className="w-full py-2.5 pr-8 bg-transparent text-sm sm:text-base focus:outline-none font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal"
                      />
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md select-none pointer-events-none shadow-2xs">
                          ⌘K
                        </kbd>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-0.5">
                      {/* Integrated Voice Button with Animated Equalizer Soundwaves */}
                      <button
                        type="button"
                        onClick={toggleListeningState}
                        style={isListening ? { backgroundColor: primaryCol, borderColor: primaryCol } : undefined}
                        className={`h-10 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs ${
                          isListening
                            ? 'text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {isListening ? (
                          <div className="flex items-center gap-1 h-4 px-0.5">
                            <span className="w-1 bg-white rounded-full animate-soundwave-1" />
                            <span className="w-1 bg-white rounded-full animate-soundwave-2" />
                            <span className="w-1 bg-white rounded-full animate-soundwave-3" />
                            <span className="w-1 bg-white rounded-full animate-soundwave-4" />
                          </div>
                        ) : (
                          <Mic className="w-3.5 h-3.5" style={{ color: primaryCol }} />
                        )}
                        <span>{isListening ? 'Listening…' : 'Voice'}</span>
                      </button>

                      {/* AI Ingest Report Action Button */}
                      <Link
                        href={`/admin/editor?siteId=${encodeURIComponent(activeSite?.id || 'site_goldfields')}&openIngest=true`}
                        className="h-10 px-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-xs"
                        title="Upload or sample Annual Report PDF to automatically synthesize an instant web page"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                        <span>AI Ingest Report</span>
                      </Link>

                      {/* Primary Search CTA */}
                      <button
                        type="submit"
                        style={{ backgroundColor: primaryCol }}
                        className="h-10 px-5 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-[0.98] shrink-0 hover:opacity-90 cursor-pointer shadow-md"
                      >
                        <span>Search CMS</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 4 Cols: Live Edge Telemetry Command Hub */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {/* Telemetry Card 1: Edge CDN Vitals */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>Global Edge CDN</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    99.99% Uptime
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    &lt; 140ms
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Worldwide Invalidation
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-sky-500 h-full rounded-full w-[94%]" />
                </div>
              </div>

              {/* Telemetry Card 2: Fleet Security & Compliance */}
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Fleet Security &amp; Compliance</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Multi-Tenant Active
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Synchronized
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    100% Client Domain SLA
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>
            </section>
          </div>
        </div>
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
                    <span>Vodacom Group Interim &amp; Gold Fields Releases</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200">
                      SCHEDULED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Client corporate teams submitted authenticated disclosures for coordinated multi-site broadcast.
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

      {/* 6. Workspace Action Center: Your Next Steps & Workspace Activity */}
      <WorkspaceActionCenter clientId={activeClient?.id} siteId={activeSite?.id} />
    </div>
  );
}
