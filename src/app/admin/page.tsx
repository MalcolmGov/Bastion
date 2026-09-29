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
  Monitor,
  Mic,
  Calendar,
  Lock,
  X,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace, WorkspaceClient, WorkspaceSite } from '@/components/admin/StudioWorkspaceProvider';
import { ClientCmsHome } from '@/components/admin/ClientCmsHome';
import {
  DashboardCustomizeModal,
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES
} from '@/components/admin/DashboardCustomizeModal';

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

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [isListening, setIsListening] = useState(false);
  const [quickBrandUrl, setQuickBrandUrl] = useState('');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // User Dashboard Customization Preferences
  const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPreferences>(DEFAULT_DASHBOARD_PREFERENCES);

  // Load saved dashboard preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bastion_dashboard_prefs');
        if (saved) {
          const parsed = JSON.parse(saved);
          setDashboardPrefs({ ...DEFAULT_DASHBOARD_PREFERENCES, ...parsed });
          // Apply custom primary color to document root
          if (parsed.primaryColor) {
            document.documentElement.style.setProperty('--color-brand-primary', parsed.primaryColor);
          }
        }
      } catch (e) {
        console.warn('Failed to parse dashboard preferences:', e);
      }
    }

    const handleOpenCustomize = () => setIsCustomizeOpen(true);
    window.addEventListener('open-dashboard-customize', handleOpenCustomize);
    return () => window.removeEventListener('open-dashboard-customize', handleOpenCustomize);
  }, []);

  const handleSavePreferences = (newPrefs: DashboardPreferences) => {
    setDashboardPrefs(newPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bastion_dashboard_prefs', JSON.stringify(newPrefs));
      if (newPrefs.primaryColor) {
        document.documentElement.style.setProperty('--color-brand-primary', newPrefs.primaryColor);
      }
    }
  };

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

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.websites?.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.slug.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (selectedSector === 'all') return true;
    if (selectedSector === 'mining') return c.industry.includes('mining') || c.id.includes('gold');
    if (selectedSector === 'agency') return c.industry.includes('agency') || c.industry.includes('digital') || c.id.includes('bastion');
    if (selectedSector === 'finance') return c.industry.includes('finance') || c.industry.includes('wealth') || c.industry.includes('advisory');
    if (selectedSector === 'energy') return c.industry.includes('energy') || c.id.includes('swifter') || c.id.includes('solaris');
    return true;
  });

  const primaryCol = dashboardPrefs.primaryColor || '#7C3AED';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Top Intelligence Strip & Customizer Trigger (Zara CareerOS Signature) */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl border shadow-xs transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${primaryCol}0f 0%, #FFFFFF 50%, ${dashboardPrefs.accentColor}14 100%)`,
          borderColor: `${primaryCol}40`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800">
            <div 
              className="w-5 h-5 rounded-md text-white flex items-center justify-center font-black text-xs"
              style={{ backgroundColor: primaryCol }}
            >
              B
            </div>
            <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
              BASTION
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Bastion Platform Intelligence
            </span>
            <span className="text-[11px] font-bold" style={{ color: primaryCol }}>
              Corporate Website Management Platform &bull; Autonomous Edge Invalidation &lt;500ms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          {/* User Customize Dashboard Button */}
          <button
            type="button"
            onClick={() => setIsCustomizeOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title="Customize dashboard cards, KPIs, colors and layout"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: primaryCol }} />
            <span>Customize</span>
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setPortalViewMode('agency')}
              style={portalViewMode === 'agency' ? { backgroundColor: primaryCol } : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                portalViewMode === 'agency'
                  ? 'text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agency</span>
            </button>
            <button
              type="button"
              onClick={() => setPortalViewMode('client')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                portalViewMode === 'client'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Signature Hero Card with Embedded Search & Voice Composer */}
      {dashboardPrefs.sections.heroComposer && (
        <section className="rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80">
          {/* Top Accent Gradient Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: `linear-gradient(90deg, ${primaryCol} 0%, ${dashboardPrefs.accentColor} 50%, #4F46E5 100%)`
            }}
          />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Good afternoon, Malcolm. Let&apos;s manage high-impact corporate web properties.
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                Precision multi-tenant governance across Gold Fields Limited, Swifter Energy, and Bastion Group client properties.
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

      {/* 3. Operational Stat KPI Cards (Customizable via modal) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Websites */}
        {dashboardPrefs.kpis.totalWebsites && (
          <div className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: `${primaryCol}15`,
                  color: primaryCol,
                  borderColor: `${primaryCol}30`
                }}
              >
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {totalWebsites}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Websites
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Live & Published */}
        {dashboardPrefs.kpis.liveWebsites && (
          <div className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {publishedWebsites}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Live &amp; Healthy
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Upcoming SENS Release */}
        {dashboardPrefs.kpis.upcomingSens && (
          <div className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  1
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Upcoming SENS
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Wed 14:00
            </span>
          </div>
        )}

        {/* Card 4: Awaiting Sign-Off */}
        {dashboardPrefs.kpis.awaitingSignoff && (
          <Link
            href="/admin/tasks"
            className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 shadow-xs hover:shadow-sm transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Send className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {pendingReviewCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Awaiting Sign-Off
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Optional KPI: Draft Revisions */}
        {dashboardPrefs.kpis.draftRevisions && (
          <div className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Edit3 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {draftRevisionsCount}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Draft Revisions
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional KPI: Edge Latency */}
        {dashboardPrefs.kpis.edgeLatency && (
          <div className="p-3.5 sm:p-4 rounded-xl text-left border bg-white dark:bg-[#0F141C] border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  42ms
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Global Edge TTFB
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
              100% SLA
            </span>
          </div>
        )}
      </section>

      {/* 4. Main 2-Column Split (Or Full Focus according to layoutMode preference) */}
      <div className={`grid grid-cols-1 ${dashboardPrefs.layoutMode === 'focus' ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6 items-start`}>
        {/* Left Column: Managed For You / Corporate Client Properties */}
        {dashboardPrefs.sections.managedCards && (
          <div className={`${dashboardPrefs.layoutMode === 'focus' ? 'w-full' : 'lg:col-span-8'} space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {searchQuery ? `Matching Properties (${filteredClients.length})` : 'Managed For You'}
                  </h2>
                  {searchQuery && (
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${primaryCol}15`,
                        color: primaryCol,
                        borderColor: `${primaryCol}30`
                      }}
                    >
                      Live Filtering
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm mt-0.5 font-medium text-slate-600 dark:text-slate-400">
                  Corporate web properties deployed on Bastion high-performance multi-tenant infrastructure.
                </p>
              </div>

              <Link
                href="/admin/create"
                style={{ color: primaryCol }}
                className="text-xs font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Create Website</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Client Website Cards */}
            <div className="space-y-4">
              {filteredClients.map((client) => {
                const isGF = client.id === 'client_goldfields';
                const website = client.websites?.[0];
                const domain = client.id === 'client_goldfields' ? 'goldfields.com' : `${client.slug}.bastiongroup.co.za`;

                return (
                  <div
                    key={client.id}
                    className="rounded-2xl p-5 sm:p-6 transition-all duration-300 group relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-800/80 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                      style={{
                        background: isGF 
                          ? 'linear-gradient(90deg, #C99700 0%, #EAB308 100%)'
                          : `linear-gradient(90deg, ${primaryCol} 0%, ${dashboardPrefs.accentColor} 100%)`
                      }}
                    />

                    {/* Top Row: Monogram, Title, Verified & Live Link */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border shadow-2xs"
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold truncate text-slate-700 dark:text-slate-300">
                              {client.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 border text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Verified Corporate Tenant</span>
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-1 mt-0.5">
                            {website?.name || `${client.name} Flagship Portal`}
                          </h3>
                        </div>
                      </div>

                      <Link
                        href={isGF ? '/' : `/sites/${website?.slug || client.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View live website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Metadata line */}
                    <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm flex-wrap text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{domain}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {client.industry.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Signed Webhook Active</span>
                      </span>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 flex items-center justify-between gap-3 flex-wrap border-t border-slate-100 dark:border-slate-800">
                      <div 
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border"
                        style={{
                          backgroundColor: `${primaryCol}12`,
                          borderColor: `${primaryCol}30`,
                          color: primaryCol
                        }}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>100% Platform Health</span>
                        <span className="text-[11px] font-normal text-slate-500 ml-0.5">&bull; 42ms TTFB</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveClientId(client.id);
                            setPortalViewMode('client');
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
                        >
                          Client CMS Mode
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveClientId(client.id);
                            router.push('/admin/pages');
                          }}
                          style={{ backgroundColor: primaryCol }}
                          className="px-4 py-1.5 rounded-xl text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] hover:opacity-95 shadow-xs"
                        >
                          <span>Manage Website</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Supporting Rail: Calendar, Brand DNA Quick Launch & Health */}
        {dashboardPrefs.layoutMode !== 'focus' && (
          <div className="lg:col-span-4 space-y-4">
            {/* Module 1: Next on your calendar / Publishing Pipeline */}
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
                    Gold Fields corporate relations submitted regulatory release for scheduled publishing.
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

            {/* Module 2: Brand DNA & Design System Extractor (Claude Design Pipeline) */}
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

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Crawl any corporate site to extract computed styles, SVG logos, Google Fonts, reading level, and generate WCAG-compliant theme tokens.
                </p>

                <form onSubmit={handleLaunchBrandDna} className="space-y-2">
                  <input
                    type="text"
                    value={quickBrandUrl}
                    onChange={(e) => setQuickBrandUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    style={{ backgroundColor: primaryCol }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white hover:opacity-95 shadow-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Brand Extractor</span>
                  </button>
                </form>
              </div>
            )}

            {/* Module 3: Edge Invalidation & Global Status */}
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

      {/* 5. User Customization Modal */}
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        preferences={dashboardPrefs}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
