'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Globe,
  Users,
  ArrowUpRight,
  Clock,
  Shield,
  Layers,
  Building,
  Zap,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Activity,
  FileText,
  Sparkles
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';

// Sector-specific telemetry templates
interface SectorTelemetry {
  sectorTitle: string;
  sectorBadge: string;
  sectorDescription: string;
  stat1Label: string;
  stat1Base: number;
  stat1Trend: string;
  stat2Label: string;
  stat2Base: number;
  stat2Sub: string;
  stat3Label: string;
  stat3Base: number;
  stat3Sub: string;
  stat4Label: string;
  stat4Speed: string;
  stat4Sub: string;
  jurisdictionTitle: string;
  jurisdictions: Array<{ region: string; pct: number; color: string }>;
  downloadsTitle: string;
  downloads: Array<{ title: string; baseDl: number; size: string }>;
  trafficTrend: Array<{ day: string; viewsFactor: number; dlFactor: number }>;
}

const TELEMETRY_CONFIGS: Record<string, SectorTelemetry> = {
  // 1. Clean Energy (Solaris Clean Energy / Renewables)
  clean_energy: {
    sectorTitle: 'Clean Energy & Renewable ESG Telemetry',
    sectorBadge: 'Grid & Off-Take Intelligence',
    sectorDescription: 'Real-time telemetry tracking corporate power off-takers, transmission grid interconnection briefs, ESG investor disclosures, and carbon credit audits.',
    stat1Label: 'Total Off-Taker Impressions',
    stat1Base: 84210,
    stat1Trend: '+24.6% since 2026 PPA Expansion release',
    stat2Label: 'Verified ESG Inquirers',
    stat2Base: 26400,
    stat2Sub: 'Across 48 global energy & ESG hubs',
    stat3Label: 'Term Sheet & PPA Downloads',
    stat3Base: 8920,
    stat3Sub: 'Power purchase agreements & technical audits',
    stat4Label: 'Avg Sub-Second Speed',
    stat4Speed: '0.27s',
    stat4Sub: 'Global 99.8% Edge Cache Hit (Solaris PoP)',
    jurisdictionTitle: 'Audience Distribution by Grid Corridor & Capital Hubs',
    jurisdictions: [
      { region: 'South Africa (Gauteng Corporate Off-Takers)', pct: 36, color: 'bg-emerald-500' },
      { region: 'Western & Northern Cape (Solar & Wind Corridors)', pct: 29, color: 'bg-amber-500' },
      { region: 'Europe (Frankfurt & Zurich ESG Funds)', pct: 18, color: 'bg-blue-500' },
      { region: 'United Kingdom (London Climate Capital)', pct: 12, color: 'bg-purple-500' },
      { region: 'North America (Green Energy VC / NYSE)', pct: 5, color: 'bg-teal-500' }
    ],
    downloadsTitle: 'Most Downloaded Renewable Disclosures & Specifications',
    downloads: [
      { title: 'Standardized Corporate Power Purchase Agreement (PPA) Term Sheet', baseDl: 3420, size: '3.4 MB' },
      { title: 'Utility-Scale Solar & BESS Grid Interconnection Feasibility Study', baseDl: 2180, size: '8.2 MB' },
      { title: 'Q2 2026 Carbon Abatement & Scope 2 Compliance Audit', baseDl: 1890, size: '4.6 MB' },
      { title: 'Solaris 500MW Renewable Generation Pipeline & Environmental Assessment', baseDl: 1430, size: '11.8 MB' }
    ],
    trafficTrend: [
      { day: 'Mon', viewsFactor: 1.1, dlFactor: 0.9 },
      { day: 'Tue', viewsFactor: 1.25, dlFactor: 1.15 },
      { day: 'Wed', viewsFactor: 1.4, dlFactor: 1.35 },
      { day: 'Thu', viewsFactor: 1.3, dlFactor: 1.2 },
      { day: 'Fri', viewsFactor: 1.15, dlFactor: 1.05 },
      { day: 'Sat', viewsFactor: 0.7, dlFactor: 0.5 },
      { day: 'Sun', viewsFactor: 0.65, dlFactor: 0.45 }
    ]
  },

  // 2. Telecommunications (Vodacom / Telco)
  telecom: {
    sectorTitle: 'Digital Services & Network Telemetry',
    sectorBadge: 'Enterprise & Mobile Dissemination',
    sectorDescription: 'Real-time telemetry measuring enterprise customer traffic, 5G spectrum roadmap disclosures, fintech (M-Pesa) investor updates, and regulatory filings.',
    stat1Label: 'Total Portal Page Views',
    stat1Base: 312450,
    stat1Trend: '+31.4% since Spectrum Auction Disclosure',
    stat2Label: 'Unique Enterprise Visitors',
    stat2Base: 89600,
    stat2Sub: 'Across 32 African & global connectivity markets',
    stat3Label: 'Financial & Analyst Downloads',
    stat3Base: 24890,
    stat3Sub: 'Interim booklets, spectrum maps & debt tables',
    stat4Label: 'Avg Sub-Second Speed',
    stat4Speed: '0.22s',
    stat4Sub: 'Direct peering via Teraco JNB & CPT IXPs',
    jurisdictionTitle: 'Audience Distribution by Telecommunications Market',
    jurisdictions: [
      { region: 'South Africa (Vodacom HQ & Enterprise Core)', pct: 44, color: 'bg-red-500' },
      { region: 'East Africa (Kenya & Tanzania Mobile Money Hubs)', pct: 26, color: 'bg-emerald-500' },
      { region: 'United Kingdom (Vodafone Group IR)', pct: 15, color: 'bg-blue-500' },
      { region: 'Central Africa (DRC & Mozambique Operations)', pct: 10, color: 'bg-purple-500' },
      { region: 'North America (ADR Institutional Investors)', pct: 5, color: 'bg-amber-500' }
    ],
    downloadsTitle: 'Most Downloaded Telecommunications Disclosures',
    downloads: [
      { title: 'FY2026 Interim Results Booklet & Operational Factbook', baseDl: 8940, size: '6.4 MB' },
      { title: 'African Digital Inclusion & Mobile Money Financial Summary', baseDl: 6120, size: '5.2 MB' },
      { title: '5G Infrastructure Rollout & High-Demand Spectrum Strategy', baseDl: 5410, size: '9.8 MB' },
      { title: 'ESG & Digital Literacy Foundation Social Impact Audit', baseDl: 4420, size: '3.7 MB' }
    ],
    trafficTrend: [
      { day: 'Mon', viewsFactor: 1.15, dlFactor: 1.0 },
      { day: 'Tue', viewsFactor: 1.35, dlFactor: 1.3 },
      { day: 'Wed', viewsFactor: 1.5, dlFactor: 1.45 },
      { day: 'Thu', viewsFactor: 1.4, dlFactor: 1.25 },
      { day: 'Fri', viewsFactor: 1.2, dlFactor: 1.1 },
      { day: 'Sat', viewsFactor: 0.8, dlFactor: 0.6 },
      { day: 'Sun', viewsFactor: 0.75, dlFactor: 0.55 }
    ]
  },

  // 3. Wealth & Financial Services (Apex Advisory Partners / Meridian / Valence)
  finance: {
    sectorTitle: 'Institutional Capital & Advisory Telemetry',
    sectorBadge: 'Private Equity & AUM Intelligence',
    sectorDescription: 'Real-time telemetry tracking sovereign wealth funds, family office inquiries, private market deal teasers, and quarterly macroeconomic briefs.',
    stat1Label: 'Qualified Deal Impressions',
    stat1Base: 64820,
    stat1Trend: '+19.2% since Q2 Strategic Outlook',
    stat2Label: 'Institutional Inquirers',
    stat2Base: 14750,
    stat2Sub: 'Across 36 Tier-1 financial centres',
    stat3Label: 'Prospectus & Mandate Downloads',
    stat3Base: 5840,
    stat3Sub: 'Deal teasers, PPM summaries & diligence packs',
    stat4Label: 'Avg Sub-Second Speed',
    stat4Speed: '0.28s',
    stat4Sub: 'Encrypted Low-Latency Edge (Sandton PoP)',
    jurisdictionTitle: 'Audience Distribution by Global Financial Capital',
    jurisdictions: [
      { region: 'South Africa (Sandton Financial District)', pct: 42, color: 'bg-indigo-500' },
      { region: 'United Kingdom (London City Institutional)', pct: 28, color: 'bg-blue-500' },
      { region: 'Switzerland (Zurich & Geneva Family Offices)', pct: 16, color: 'bg-emerald-500' },
      { region: 'United States (Wall Street Private Equity)', pct: 9, color: 'bg-purple-500' },
      { region: 'Singapore & UAE (APAC / Gulf Sovereign Wealth)', pct: 5, color: 'bg-amber-500' }
    ],
    downloadsTitle: 'Most Downloaded Financial & Mandate Disclosures',
    downloads: [
      { title: 'Q2 2026 Macroeconomic Strategy & Asset Allocation Outlook', baseDl: 2450, size: '4.2 MB' },
      { title: 'Pan-African Growth Equity Co-Investment Memorandum', baseDl: 1680, size: '5.8 MB' },
      { title: 'Multi-Family Office Wealth Structuring & Tax Governance Guide', baseDl: 980, size: '3.1 MB' },
      { title: 'Confidential Institutional Mandate Onboarding Terms', baseDl: 730, size: '1.9 MB' }
    ],
    trafficTrend: [
      { day: 'Mon', viewsFactor: 1.2, dlFactor: 1.1 },
      { day: 'Tue', viewsFactor: 1.45, dlFactor: 1.4 },
      { day: 'Wed', viewsFactor: 1.4, dlFactor: 1.35 },
      { day: 'Thu', viewsFactor: 1.3, dlFactor: 1.2 },
      { day: 'Fri', viewsFactor: 1.05, dlFactor: 0.9 },
      { day: 'Sat', viewsFactor: 0.5, dlFactor: 0.35 },
      { day: 'Sun', viewsFactor: 0.6, dlFactor: 0.4 }
    ]
  },

  // 4. Mining & Natural Resources (Gold Fields Limited)
  mining_resources: {
    sectorTitle: 'Audience & Regulatory Dissemination Telemetry',
    sectorBadge: 'Mining & JSE/NYSE Disclosures',
    sectorDescription: 'Real-time insight into investor traffic, regulatory document downloads, and geographical engagement across global mining jurisdictions.',
    stat1Label: 'Total Page Views',
    stat1Base: 148920,
    stat1Trend: '+18.4% since H1 2026 Results release',
    stat2Label: 'Unique Investors & Visitors',
    stat2Base: 42650,
    stat2Sub: 'Across 84 countries worldwide',
    stat3Label: 'Regulatory Report Downloads',
    stat3Base: 12480,
    stat3Sub: 'PDF booklets, SENS filings & resource tables',
    stat4Label: 'Avg Sub-Second Speed',
    stat4Speed: '0.31s',
    stat4Sub: 'Global 99.4% Edge Cache Hit',
    jurisdictionTitle: 'Audience Distribution by Mining Jurisdiction',
    jurisdictions: [
      { region: 'South Africa (JSE Focus & Corporate HQ)', pct: 42, color: 'bg-[#C99700]' },
      { region: 'Australia (Perth / Sydney Operations)', pct: 28, color: 'bg-emerald-500' },
      { region: 'Ghana (Accra / Tarkwa Assets)', pct: 14, color: 'bg-blue-500' },
      { region: 'North America (NYSE / GFI ADR Holders)', pct: 12, color: 'bg-purple-500' },
      { region: 'South America (Peru / Salares Norte)', pct: 4, color: 'bg-amber-500' }
    ],
    downloadsTitle: 'Most Downloaded Financial & Mineral Disclosures',
    downloads: [
      { title: 'H1 2026 Results Booklet & Financial Tables', baseDl: 4890, size: '4.8 MB' },
      { title: '2024 Mineral Resources & Reserves Statement', baseDl: 3120, size: '12.4 MB' },
      { title: '2024 Climate Change & Decarbonization Report', baseDl: 2450, size: '6.2 MB' },
      { title: 'South Deep Operational Profile & Technical Summary', baseDl: 1980, size: '3.1 MB' }
    ],
    trafficTrend: [
      { day: 'Mon', viewsFactor: 1.1, dlFactor: 1.0 },
      { day: 'Tue', viewsFactor: 1.35, dlFactor: 1.25 },
      { day: 'Wed', viewsFactor: 1.55, dlFactor: 1.5 },
      { day: 'Thu', viewsFactor: 1.3, dlFactor: 1.15 },
      { day: 'Fri', viewsFactor: 1.1, dlFactor: 1.0 },
      { day: 'Sat', viewsFactor: 0.65, dlFactor: 0.45 },
      { day: 'Sun', viewsFactor: 0.6, dlFactor: 0.4 }
    ]
  },

  // 5. Bastion Fleet Aggregation (All Clients Combined)
  fleet: {
    sectorTitle: 'Bastion Multi-Tenant Fleet Analytics',
    sectorBadge: 'Agency-Wide Telemetry',
    sectorDescription: 'Consolidated real-time traffic, edge invalidation throughput, and asset dissemination performance across all corporate client websites.',
    stat1Label: 'Aggregate Network Views',
    stat1Base: 609800,
    stat1Trend: '+28.3% across all managed client websites',
    stat2Label: 'Total Unique Enterprise Visitors',
    stat2Base: 172900,
    stat2Sub: 'Across 112 countries on Bastion edge',
    stat3Label: 'Consolidated Document Downloads',
    stat3Base: 52180,
    stat3Sub: 'Corporate PDF brochures, filings & decks',
    stat4Label: 'Network-Wide Edge Speed',
    stat4Speed: '0.24s',
    stat4Sub: '99.8% Combined Global Hit Rate',
    jurisdictionTitle: 'Global Traffic Distribution by Region',
    jurisdictions: [
      { region: 'Southern Africa (Johannesburg PoP)', pct: 45, color: 'bg-purple-600' },
      { region: 'Europe (London & Frankfurt PoPs)', pct: 25, color: 'bg-blue-500' },
      { region: 'East & West Africa (Nairobi & Lagos)', pct: 15, color: 'bg-emerald-500' },
      { region: 'North America (New York & Ashburn)', pct: 10, color: 'bg-amber-500' },
      { region: 'Asia-Pacific (Singapore & Sydney)', pct: 5, color: 'bg-indigo-500' }
    ],
    downloadsTitle: 'Top Downloaded Assets Across All Client Websites',
    downloads: [
      { title: 'Vodacom Group — FY2026 Interim Analyst Factbook', baseDl: 8940, size: '6.4 MB' },
      { title: 'Gold Fields — H1 2026 Results Booklet & Financial Tables', baseDl: 4890, size: '4.8 MB' },
      { title: 'Solaris Clean Energy — Standardized Corporate PPA Term Sheet', baseDl: 3420, size: '3.4 MB' },
      { title: 'Apex Advisory Partners — Q2 Macroeconomic Strategy Brief', baseDl: 2450, size: '4.2 MB' }
    ],
    trafficTrend: [
      { day: 'Mon', viewsFactor: 1.15, dlFactor: 1.05 },
      { day: 'Tue', viewsFactor: 1.35, dlFactor: 1.3 },
      { day: 'Wed', viewsFactor: 1.5, dlFactor: 1.45 },
      { day: 'Thu', viewsFactor: 1.35, dlFactor: 1.2 },
      { day: 'Fri', viewsFactor: 1.15, dlFactor: 1.0 },
      { day: 'Sat', viewsFactor: 0.75, dlFactor: 0.5 },
      { day: 'Sun', viewsFactor: 0.7, dlFactor: 0.45 }
    ]
  }
};

// Real-time visitor logs
const LIVE_VISITOR_FEED = [
  { time: 'Just now', country: '🇿🇦 ZA', city: 'Johannesburg', path: '/reports', status: 200, edge: '18ms (JNB-1)', device: 'Desktop' },
  { time: '1m ago', country: '🇬🇧 UK', city: 'London', path: '/sustainability', status: 200, edge: '42ms (LHR-1)', device: 'Desktop' },
  { time: '2m ago', country: '🇺🇸 US', city: 'New York', path: '/investors', status: 200, edge: '98ms (EWR-1)', device: 'Desktop' },
  { time: '4m ago', country: '🇩🇪 DE', city: 'Frankfurt', path: '/media', status: 200, edge: '44ms (FRA-1)', device: 'Mobile' },
  { time: '6m ago', country: '🇦🇺 AU', city: 'Perth', path: '/', status: 200, edge: '112ms (SYD-1)', device: 'Tablet' },
  { time: '9m ago', country: '🇰🇪 KE', city: 'Nairobi', path: '/about', status: 200, edge: '36ms (NBO-1)', device: 'Mobile' }
];

export default function AdminAnalyticsPage() {
  const { clients, activeClient, activeSite, setActiveClientId, portalViewMode } = useStudioWorkspace();
  const { primaryColor, accentColor } = useDashboardCustomizer();

  // Time range filter
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | '1y'>('30d');
  
  // Selected tenant in dropdown ('fleet' or client ID)
  const [selectedScope, setSelectedScope] = useState<string>(activeClient?.id || 'fleet');

  // Sync with activeClient when loaded
  React.useEffect(() => {
    if (portalViewMode === 'client' && activeClient?.id) {
      setSelectedScope(activeClient.id);
    }
  }, [activeClient?.id, portalViewMode]);

  // Determine current client object
  const currentClient = useMemo(() => {
    if (selectedScope === 'fleet') return null;
    return clients.find(c => c.id === selectedScope) || activeClient;
  }, [selectedScope, clients, activeClient]);

  // Determine which sector config to load
  const telemetry = useMemo(() => {
    if (selectedScope === 'fleet' && portalViewMode !== 'client') {
      return TELEMETRY_CONFIGS.fleet;
    }

    if (!currentClient) {
      return TELEMETRY_CONFIGS.fleet;
    }

    const id = currentClient.id.toLowerCase();
    const ind = (currentClient.industry || '').toLowerCase();
    const name = currentClient.name.toLowerCase();

    if (id.includes('gold') || ind.includes('mining') || name.includes('gold fields')) {
      return TELEMETRY_CONFIGS.mining_resources;
    }
    if (id.includes('solaris') || id.includes('swifter') || ind.includes('energy') || name.includes('clean energy')) {
      return TELEMETRY_CONFIGS.clean_energy;
    }
    if (id.includes('voda') || ind.includes('telecom') || name.includes('vodacom')) {
      return TELEMETRY_CONFIGS.telecom;
    }
    if (id.includes('apex') || id.includes('meridian') || id.includes('valence') || ind.includes('finance') || ind.includes('advisory')) {
      return TELEMETRY_CONFIGS.finance;
    }

    // Dynamic fallback for any newly added custom corporate client!
    return {
      sectorTitle: `${currentClient.name} Telemetry & Engagement`,
      sectorBadge: `${currentClient.name} Corporate Analytics`,
      sectorDescription: `Real-time analytics for ${currentClient.name} across web visits, digital document downloads, and multi-region engagement.`,
      stat1Label: 'Total Page Views',
      stat1Base: 92450,
      stat1Trend: '+21.2% this tracking period',
      stat2Label: 'Unique Visitors',
      stat2Base: 31200,
      stat2Sub: 'Global corporate audience',
      stat3Label: 'Document Downloads',
      stat3Base: 7640,
      stat3Sub: 'PDF brochures, annual packs & releases',
      stat4Label: 'Avg Sub-Second Speed',
      stat4Speed: '0.26s',
      stat4Sub: 'Global 99.8% Edge Cache Hit',
      jurisdictionTitle: `Audience Distribution by Key Markets`,
      jurisdictions: [
        { region: 'South Africa (Primary Market)', pct: 46, color: 'bg-purple-600' },
        { region: 'United Kingdom & Europe', pct: 24, color: 'bg-blue-500' },
        { region: 'North America', pct: 16, color: 'bg-emerald-500' },
        { region: 'Pan-African Markets', pct: 10, color: 'bg-amber-500' },
        { region: 'Rest of World', pct: 4, color: 'bg-teal-500' }
      ],
      downloadsTitle: `Most Downloaded Documents for ${currentClient.name}`,
      downloads: [
        { title: `${currentClient.name} Corporate Profile & Capabilities`, baseDl: 3120, size: '4.2 MB' },
        { title: `${currentClient.name} Annual Governance Statement`, baseDl: 2150, size: '5.1 MB' },
        { title: `${currentClient.name} Strategic Overview & Executive Summary`, baseDl: 1480, size: '3.6 MB' },
        { title: `${currentClient.name} Media & Press Kit`, baseDl: 890, size: '2.4 MB' }
      ],
      trafficTrend: [
        { day: 'Mon', viewsFactor: 1.1, dlFactor: 1.0 },
        { day: 'Tue', viewsFactor: 1.3, dlFactor: 1.2 },
        { day: 'Wed', viewsFactor: 1.45, dlFactor: 1.4 },
        { day: 'Thu', viewsFactor: 1.35, dlFactor: 1.25 },
        { day: 'Fri', viewsFactor: 1.15, dlFactor: 1.05 },
        { day: 'Sat', viewsFactor: 0.7, dlFactor: 0.5 },
        { day: 'Sun', viewsFactor: 0.65, dlFactor: 0.45 }
      ]
    };
  }, [selectedScope, currentClient, portalViewMode]);

  // Multiplier for selected time range
  const timeMultiplier = useMemo(() => {
    switch (timeRange) {
      case '24h': return 0.08;
      case '7d': return 0.28;
      case '30d': return 1.0;
      case '90d': return 2.75;
      case '1y': return 11.2;
    }
  }, [timeRange]);

  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case '24h': return 'Past 24 Hours';
      case '7d': return 'Past 7 Days';
      case '30d': return 'Past 30 Days';
      case '90d': return 'Past 90 Days';
      case '1y': return 'Past 12 Months';
    }
  }, [timeRange]);

  // Computed values
  const pageViews = Math.round(telemetry.stat1Base * timeMultiplier);
  const visitors = Math.round(telemetry.stat2Base * timeMultiplier);
  const downloads = Math.round(telemetry.stat3Base * timeMultiplier);

  // Generate Recharts timeline data
  const chartData = useMemo(() => {
    return telemetry.trafficTrend.map((t) => {
      const dailyViews = Math.round((pageViews / 7) * t.viewsFactor);
      const dailyDl = Math.round((downloads / 7) * t.dlFactor);
      return {
        day: t.day,
        pageviews: dailyViews,
        downloads: dailyDl
      };
    });
  }, [telemetry, pageViews, downloads]);

  const isClientPortal = portalViewMode === 'client';
  const effectiveClientName = currentClient?.name || (selectedScope === 'fleet' ? 'Bastion Multi-Tenant Fleet' : 'Client Property');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Header Toolbar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span style={{ color: primaryColor }}>{telemetry.sectorBadge}</span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Bastion Telemetry v2.6</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{effectiveClientName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Live Edge
            </span>
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {telemetry.sectorDescription}
          </p>
        </div>

        {/* Right Controls: Tenant Switcher & Time Period */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          {/* Client Selector (Visible if in agency mode or if multiple clients exist) */}
          {!isClientPortal && (
            <div className="relative">
              <select
                value={selectedScope}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedScope(val);
                  if (val !== 'fleet') {
                    setActiveClientId(val);
                  }
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#080D14] border border-slate-300 dark:border-[#1E2B3E] text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                <option value="fleet">🌐 Bastion Fleet (All Clients)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Range Filter Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-[#080D14] p-1 rounded-xl border border-slate-200 dark:border-[#1E2B3E]">
            {(['24h', '7d', '30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                style={timeRange === r ? { backgroundColor: primaryColor, color: '#FFFFFF' } : undefined}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition cursor-pointer ${
                  timeRange === r
                    ? 'shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Views */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">{telemetry.stat1Label}</span>
            <Users className="w-4 h-4" style={{ color: primaryColor }} />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
            {pageViews.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{telemetry.stat1Trend}</span>
          </div>
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">{telemetry.stat2Label}</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
            {visitors.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
            {telemetry.stat2Sub}
          </div>
        </div>

        {/* Card 3: Document Downloads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">{telemetry.stat3Label}</span>
            <Download className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
            {downloads.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate">
            {telemetry.stat3Sub}
          </div>
        </div>

        {/* Card 4: Edge Speed & Cache Hit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider">{telemetry.stat4Label}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
            {telemetry.stat4Speed}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{telemetry.stat4Sub}</span>
          </div>
        </div>
      </div>

      {/* 3. Traffic Velocity Chart (Recharts) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-4 h-4" style={{ color: primaryColor }} />
              <span>Traffic Velocity &amp; Document Dissemination Curve</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily distribution of page impressions versus verified downloads for {effectiveClientName} ({timeRangeLabel}).
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span className="text-slate-700 dark:text-slate-300">Page Impressions</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300">Document Downloads</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="dlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222C3D" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#070B12',
                  border: '1px solid #1E293B',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="pageviews"
                name="Page Views"
                stroke={primaryColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
              <Area
                type="monotone"
                dataKey="downloads"
                name="Downloads"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dlGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Two Column Grid: Sector Jurisdictions & Top Downloaded Disclosures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6: Jurisdictions & Geographic Focus */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] space-y-4 shadow-xs">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Globe className="w-4 h-4" style={{ color: primaryColor }} />
              <span>{telemetry.jurisdictionTitle}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Audience density and request origins tailored to {effectiveClientName}.
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {telemetry.jurisdictions.map((j) => (
              <div key={j.region} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate pr-2">{j.region}</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{j.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#080D14] rounded-full overflow-hidden border border-slate-200 dark:border-[#1A2536]">
                  <div className={`h-full ${j.color} rounded-full`} style={{ width: `${j.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6: Top Downloaded Files / Disclosures */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] space-y-4 shadow-xs">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>{telemetry.downloadsTitle}</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              High-value PDF publications, financial models, and disclosures downloaded by visitors.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#162030] pt-1">
            {telemetry.downloads.map((d) => {
              const scaledDl = Math.round(d.baseDl * timeMultiplier);
              return (
                <div key={d.title} className="py-3.5 flex items-center justify-between first:pt-1 last:pb-1">
                  <div className="overflow-hidden pr-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{d.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {d.size} &bull; Verified Authenticated PDF
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {scaledDl.toLocaleString()} dl
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Live Edge Request Stream (Real-Time Ingestion) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1C2638] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Edge Request Stream
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-100 dark:bg-[#131D2D] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#21324B]">
              Real-Time Ingestion
            </span>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Active PoP: <strong className="text-slate-900 dark:text-white">Johannesburg (JNB-1)</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1C2638] text-slate-400 uppercase text-[10px] font-bold">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Origin</th>
                <th className="pb-2">Target Property</th>
                <th className="pb-2">Route</th>
                <th className="pb-2">Device</th>
                <th className="pb-2">Edge Node</th>
                <th className="pb-2 text-right">HTTP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#162030]">
              {LIVE_VISITOR_FEED.map((req, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#121926] transition">
                  <td className="py-2.5 font-mono text-slate-500 dark:text-slate-400">{req.time}</td>
                  <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                    <span className="mr-1.5">{req.country}</span>
                    <span>{req.city}</span>
                  </td>
                  <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                    {effectiveClientName}
                  </td>
                  <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">{req.path}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{req.device}</td>
                  <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">{req.edge}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {req.status} OK
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
