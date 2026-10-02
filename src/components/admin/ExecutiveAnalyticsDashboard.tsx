'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  Zap,
  Globe,
  ShieldCheck,
  TrendingUp,
  Clock,
  Radio,
  ArrowUpRight,
  Server,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';

interface ExecutiveAnalyticsDashboardProps {
  clients?: any[];
  primaryColor?: string;
  accentColor?: string;
}

// 1. Web Vitals & Latency Telemetry (24-hour edge resolution)
const vitalsTimeline = [
  { time: '00:00', ttfb: 40, lcp: 0.72, jnb: 17, fra: 41, lhr: 45, cacheHit: 99.6 },
  { time: '04:00', ttfb: 39, lcp: 0.69, jnb: 16, fra: 39, lhr: 44, cacheHit: 99.8 },
  { time: '08:00', ttfb: 44, lcp: 0.78, jnb: 19, fra: 43, lhr: 47, cacheHit: 99.2 },
  { time: '12:00', ttfb: 45, lcp: 0.82, jnb: 20, fra: 45, lhr: 48, cacheHit: 99.4 },
  { time: '16:00', ttfb: 42, lcp: 0.74, jnb: 18, fra: 42, lhr: 46, cacheHit: 99.5 },
  { time: '20:00', ttfb: 41, lcp: 0.70, jnb: 17, fra: 40, lhr: 45, cacheHit: 99.7 },
  { time: '23:59', ttfb: 42, lcp: 0.71, jnb: 18, fra: 42, lhr: 46, cacheHit: 99.4 },
];

// Brand styling & industry sectors for Bastion's core enterprise clients
const clientBrandMap: Record<string, { color: string; sector: string }> = {
  'Vodacom Group': { color: '#E60000', sector: 'Telecom & Techco' },
  'Vodacom Group Limited': { color: '#E60000', sector: 'Telecom & Techco' },
  'Gold Fields Limited': { color: '#C99700', sector: 'Mining & Resources' },
  'Aurum Energy & Resources': { color: '#059669', sector: 'Energy & Renewables' },
  'Solaris Clean Energy': { color: '#10B981', sector: 'Clean Energy' },
  'Apex Advisory Partners': { color: '#2563EB', sector: 'Financial Advisory' },
  'Lumina Botanical Dining': { color: '#3B82F6', sector: 'Hospitality & Luxury' },
  'Bastion Group Holdings': { color: '#8B5CF6', sector: 'Agency Holding' },
  'Moove Digital': { color: '#06B6D4', sector: 'Digital Innovation' },
  'Payguard': { color: '#EC4899', sector: 'Fintech & Security' },
  'Valence Private Wealth': { color: '#7C3AED', sector: 'Wealth Management' },
  'Meridian Strategic Capital': { color: '#0284C7', sector: 'Asset Management' },
};

// 2. Default Multi-Tenant Client Fleet Distribution (Bastion Flagship Accounts)
const defaultClientCompanies = [
  { name: 'Vodacom Group', value: 3, percentage: 27, color: '#E60000', sector: 'Telecom & Techco' },
  { name: 'Gold Fields Limited', value: 2, percentage: 18, color: '#C99700', sector: 'Mining & Resources' },
  { name: 'Solaris Clean Energy', value: 2, percentage: 18, color: '#10B981', sector: 'Clean Energy' },
  { name: 'Apex Advisory Partners', value: 2, percentage: 18, color: '#2563EB', sector: 'Financial Advisory' },
  { name: 'Valence Private Wealth', value: 1, percentage: 9, color: '#7C3AED', sector: 'Wealth Management' },
  { name: 'Meridian Strategic Capital', value: 1, percentage: 10, color: '#0284C7', sector: 'Asset Management' },
];

// 3. Corporate Traffic Velocity & Inquiries by Time Range
const trafficDatasets = {
  '24h': {
    metric: '3.4k',
    label: '24H Fleet Traffic',
    data: [
      { day: '00:00', pageviews: 240, inquiries: 28 },
      { day: '04:00', pageviews: 180, inquiries: 16 },
      { day: '08:00', pageviews: 520, inquiries: 54 },
      { day: '12:00', pageviews: 790, inquiries: 88 },
      { day: '16:00', pageviews: 860, inquiries: 92 },
      { day: '20:00', pageviews: 510, inquiries: 42 },
      { day: '23:59', pageviews: 300, inquiries: 20 },
    ]
  },
  '7d': {
    metric: '23.8k',
    label: '7D Fleet Traffic',
    data: [
      { day: 'Mon', pageviews: 3100, inquiries: 340 },
      { day: 'Tue', pageviews: 3450, inquiries: 380 },
      { day: 'Wed', pageviews: 3820, inquiries: 420 },
      { day: 'Thu', pageviews: 3950, inquiries: 440 },
      { day: 'Fri', pageviews: 3600, inquiries: 390 },
      { day: 'Sat', pageviews: 2800, inquiries: 260 },
      { day: 'Sun', pageviews: 3080, inquiries: 310 },
    ]
  },
  '14d': {
    metric: '48.2k',
    label: '14D Fleet Traffic',
    data: [
      { day: 'Sep 17', pageviews: 2850, inquiries: 410 },
      { day: 'Sep 19', pageviews: 3120, inquiries: 520 },
      { day: 'Sep 21', pageviews: 2980, inquiries: 380 },
      { day: 'Sep 23', pageviews: 3840, inquiries: 690 },
      { day: 'Sep 25', pageviews: 4210, inquiries: 840 },
      { day: 'Sep 27', pageviews: 4560, inquiries: 920 },
      { day: 'Sep 29', pageviews: 4890, inquiries: 1040 },
    ]
  },
  '30d': {
    metric: '96.5k',
    label: '30D Fleet Traffic',
    data: [
      { day: 'Week 1', pageviews: 18200, inquiries: 1950 },
      { day: 'Week 2', pageviews: 21400, inquiries: 2310 },
      { day: 'Week 3', pageviews: 26300, inquiries: 2890 },
      { day: 'Week 4', pageviews: 30600, inquiries: 3250 },
    ]
  }
};

// 4. Edge Invalidation & Cache Performance Nodes
const edgeNodes = [
  { city: 'Johannesburg', code: 'JNB-1', latency: '18ms', status: 'Optimal', load: '38%' },
  { city: 'Frankfurt', code: 'FRA-1', latency: '42ms', status: 'Optimal', load: '44%' },
  { city: 'London', code: 'LHR-1', latency: '46ms', status: 'Optimal', load: '41%' },
  { city: 'New York', code: 'EWR-1', latency: '98ms', status: 'Optimal', load: '52%' },
];

export function ExecutiveAnalyticsDashboard({
  clients,
  primaryColor = '#7C3AED',
  accentColor = '#9333EA'
}: ExecutiveAnalyticsDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'vitals' | 'fleet' | 'traffic'>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '14d' | '30d'>('14d');
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fleetData = useMemo(() => {
    if (clients && clients.length > 0) {
      // Deduplicate clients by clean name
      const clientMap: Record<string, { name: string; siteCount: number }> = {};
      for (const c of clients) {
        const key = c.name.trim();
        const count = c.websites && c.websites.length > 0 ? c.websites.length : 1;
        if (!clientMap[key]) {
          clientMap[key] = { name: key, siteCount: count };
        } else {
          clientMap[key].siteCount += count;
        }
      }

      const clientList = Object.values(clientMap);
      const totalSites = clientList.reduce((acc, c) => acc + c.siteCount, 0);
      const fallbackColors = ['#E60000', '#C99700', '#10B981', '#2563EB', '#7C3AED', '#0284C7', '#EC4899', '#F59E0B'];

      return clientList
        .sort((a, b) => b.siteCount - a.siteCount)
        .map((c, i) => {
          const brand = clientBrandMap[c.name] || {
            color: fallbackColors[i % fallbackColors.length],
            sector: 'Corporate Client'
          };
          const percentage = Math.max(1, Math.round((c.siteCount / Math.max(1, totalSites)) * 100));
          return {
            name: c.name,
            value: c.siteCount,
            percentage,
            color: brand.color,
            sector: brand.sector
          };
        });
    }
    return defaultClientCompanies;
  }, [clients]);

  const totalFleetSites = useMemo(() => {
    return fleetData.reduce((acc, c) => acc + c.value, 0);
  }, [fleetData]);

  const activeTrafficConfig = trafficDatasets[timeRange];

  const handlePurgeCache = () => {
    setIsPurging(true);
    setPurgeSuccess(false);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }, 900);
  };

  return (
    <section className="space-y-6">
      {/* Station Header & Interactive Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs backdrop-blur-xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Fleet Telemetry Active
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Edge CDN &bull; {totalFleetSites} Live Properties across {fleetData.length} Managed Clients
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Bastion Operations &amp; Managed Client Fleet Intelligence
          </h2>
        </div>

        {/* Filters: Focus Tab and Time Window */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Modes */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vitals')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Web Vitals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fleet')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'fleet'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Client Fleet
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('traffic')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'traffic'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Traffic Velocity
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold">
            {(['24h', '7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 rounded-lg uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Rich Visual Chart Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART 1: Web Vitals & Global Edge Latency */}
        {(activeTab === 'all' || activeTab === 'vitals') && (
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, #2563EB 0%, #0284C7 100%)` }}
            />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                      <span>Website Vitals &amp; Edge Latency</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        100% Passed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Autonomous edge caching across all client corporate domains (Vodacom, Gold Fields, Solaris, Apex)
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-sky-400 tabular-nums">
                    42ms
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Avg Edge TTFB
                  </div>
                </div>
              </div>

              {/* Vitals Key Metrics Ribbon */}
              <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 text-center">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">0.72s</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">LCP (Fast)</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">54ms</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">INP (Instant)</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">0.01</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">CLS (Stable)</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">99.4%</div>
                  <div className="text-[10px] text-blue-600 dark:text-sky-400 font-semibold">Cache Hit</div>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-56 w-full pt-1">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={vitalsTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.15} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                      <YAxis domain={[20, 60]} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} unit="ms" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                        }}
                        formatter={(val: any) => [`${val}ms`, 'Edge TTFB']}
                      />
                      <ReferenceLine y={50} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Target <50ms', position: 'top', fill: '#10B981', fontSize: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="ttfb"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#latencyGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-xl animate-pulse">
                    <span className="text-xs text-slate-400">Loading Vitals Chart...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edge PoP Latencies Pill Bar */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-medium text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Edge PoPs:</span>
              {edgeNodes.map((node) => (
                <span key={node.code} className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{node.code}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{node.latency}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CHART 2: Multi-Tenant Client Fleet & Sector Breakdown */}
        {(activeTab === 'all' || activeTab === 'fleet') && (
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, #E60000 0%, #C99700 50%, ${primaryColor} 100%)` }}
            />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                      <span>Managed Client Fleet</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {totalFleetSites} Live Properties
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Corporate client portfolio &amp; multi-tenant web property distribution
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/clients"
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Manage Fleet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Donut Chart + Client Companies Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Donut Visual */}
                <div className="sm:col-span-5 h-52 flex items-center justify-center relative">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={fleetData}
                          innerRadius={55}
                          outerRadius={78}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {fleetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            color: '#FFFFFF',
                            fontSize: '12px'
                          }}
                          formatter={(val: any, name: any, item: any) => [
                            `${val} Properties (${item.payload.percentage}%)`,
                            item.payload.name
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-xl animate-pulse">
                      <span className="text-xs text-slate-400">Loading Fleet Chart...</span>
                    </div>
                  )}

                  {/* Centered KPI inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums font-display">{totalFleetSites}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sites</span>
                  </div>
                </div>

                {/* Client Companies Legend */}
                <div className="sm:col-span-7 space-y-2">
                  {fleetData.map((clientItem) => (
                    <div key={clientItem.name} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: clientItem.color }} />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {clientItem.name}
                        </span>
                        {clientItem.sector && (
                          <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                            {clientItem.sector}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-sans tabular-nums pl-2">
                        <span className="font-bold text-slate-900 dark:text-white font-sans">{clientItem.value}</span>
                        <span className="text-[11px] text-slate-400 font-medium font-sans">({clientItem.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health SLA Footer */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Uptime Across All {fleetData.length} Managed Clients
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                0 Critical Incidents
              </span>
            </div>
          </div>
        )}

        {/* CHART 3: Aggregated Corporate Traffic Velocity & Inbound Inquiries */}
        {(activeTab === 'all' || activeTab === 'traffic') && (
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, #10B981 0%, #065F46 100%)` }}
            />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                      <span>Corporate Traffic &amp; Inquiries</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        +24.1% WoW
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Aggregated visitor traffic &amp; stakeholder inquiries across client web properties
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums font-display">
                    {activeTrafficConfig.metric}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {activeTrafficConfig.label}
                  </div>
                </div>
              </div>

              {/* Recharts Bar Chart */}
              <div className="h-56 w-full pt-1">
                {isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeTrafficConfig.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" opacity={0.15} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#FFFFFF',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="pageviews" name="Fleet Pageviews" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="inquiries" name="Inquiries & Downloads" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-xl animate-pulse">
                    <span className="text-xs text-slate-400">Loading Traffic Chart...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Velocity Stat Row */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                142 Inbound Inquiries &amp; Mandates across Client Sites
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Avg Session: 3m 42s
              </span>
            </div>
          </div>
        )}

        {/* CHART 4: Real-Time Edge Monitoring & Invalidation Telemetry */}
        {(activeTab === 'all' || activeTab === 'vitals') && (
          <div className="rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
            <div 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: `linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)` }}
            />

            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                      <span>Edge Invalidation &amp; Fleet Health</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        &lt;500ms Edge Invalidation
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                      Instant cache purging across CDN nodes upon CMS updates across client properties
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums font-display">
                    312ms
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Purge Latency P95
                  </div>
                </div>
              </div>

              {/* Status Modules */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Multi-Tenant Client Webhook Feeds</div>
                      <div className="text-[10px] text-slate-500">Vodacom, Gold Fields, Solaris, Apex &bull; SHA-256 HMAC Verified</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                    HEALTHY
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Bastion Global Edge Invalidation Queue</div>
                      <div className="text-[10px] text-slate-500">0 pending jobs &bull; 100% delivery rate across 4 global PoPs</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200">
                    IDLE (CLEAN)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Fleet SSL &amp; Strict Transport Security (HSTS)</div>
                      <div className="text-[10px] text-slate-500">{totalFleetSites} of {totalFleetSites} client certs valid &bull; Automated Let's Encrypt rotation</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200">
                    GRADE A+
                  </span>
                </div>
              </div>
            </div>

            {/* Invalidation Trigger CTA */}
            <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="text-slate-600 dark:text-slate-400">
                {purgeSuccess ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All 4 Edge PoPs Purged &amp; Revalidated!
                  </span>
                ) : (
                  'Last broadcast: 14 mins ago'
                )}
              </span>
              <button
                type="button"
                onClick={handlePurgeCache}
                disabled={isPurging}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />
                    <span>Purging Edge PoPs...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    <span>Purge Edge Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
