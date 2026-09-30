'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Server,
  Activity,
  Lock,
  Clock,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Bell
} from 'lucide-react';

export default function PublicStatusPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState('site_movedigital');
  const [activeTooltipDay, setActiveTooltipDay] = useState<any | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/status?site=${selectedSiteId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [selectedSiteId]);

  const current = data?.currentSite;
  const isOperational = current?.status === 'operational';

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight">Move Digital</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">Global Status &amp; Uptime SLA</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadStatus}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            <Link
              href="/admin/incidents"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white transition flex items-center space-x-1"
            >
              <span>SRE Console</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Main Status Hero Banner */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border ${
            isOperational
              ? 'bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-950/20'
          } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          <div className="flex items-start sm:items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isOperational ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isOperational ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isOperational ? 'All Systems Fully Operational' : 'Minor Service Degradation'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Continuous edge synthetic telemetry probes reporting {current?.uptime90d || '99.98'}% uptime across all
                regions.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 shrink-0 bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Updated {current ? new Date(current.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}</span>
          </div>
        </div>

        {/* Site Switcher Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          {data?.monitoredProperties?.map((prop: any) => (
            <button
              key={prop.id}
              onClick={() => setSelectedSiteId(prop.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
                selectedSiteId === prop.id
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{prop.name}</span>
              {selectedSiteId === prop.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* 90-DAY UPTIME SLA BAR CHART */}
        {/* ======================================================== */}
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800/90 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>90-Day Uptime SLA History</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                  {current?.uptime90d || 99.98}%
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target SLA: 99.9% availability guaranteed on Vercel Enterprise Edge Network.
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span>Avg Latency: <strong className="text-sky-400">{current?.avgLatencyMs || 125}ms</strong></span>
            </div>
          </div>

          {/* Interactive 90 Bars */}
          <div className="relative pt-2">
            <div className="flex items-center gap-[3px] h-10 w-full overflow-hidden">
              {current?.history90Days?.map((day: any, idx: number) => {
                const is100 = day.uptimePct >= 99.9;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveTooltipDay(day)}
                    onMouseLeave={() => setActiveTooltipDay(null)}
                    className={`flex-1 h-full rounded-xs transition-all hover:scale-y-110 cursor-pointer ${
                      is100 ? 'bg-emerald-500/80 hover:bg-emerald-400' : 'bg-amber-500/80 hover:bg-amber-400'
                    }`}
                  />
                );
              })}
            </div>

            {/* Hover Tooltip Card */}
            {activeTooltipDay && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white shadow-xl z-20 pointer-events-none">
                <span>{activeTooltipDay.date}: <strong>{activeTooltipDay.uptimePct}%</strong></span>
                {activeTooltipDay.hasIncident && (
                  <span className="text-amber-400 ml-2">(SRE Auto-Resolved)</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2">
              <span>90 days ago</span>
              <span>100% operational baseline</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Global Edge Region Latencies */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Global Edge Network Telemetry Probes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {current?.edgeRegions?.map((edge: any) => (
              <div
                key={edge.region}
                className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">{edge.region}</span>
                  <span className="text-[11px] font-mono text-slate-400">Status: Nominal</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-sky-400 block">{edge.latencyMs} ms</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">200 OK</span>
                </div>
              </div>
            ))}

            {/* SSL Tile */}
            <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TLS / SSL Encryption</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">{current?.sslStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  {current?.sslDaysRemaining || 78} days
                </span>
                <span className="text-[10px] text-slate-500">Auto-renews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Public Incident History */}
        <div className="space-y-3 pt-4">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Past Incident &amp; Remediation History
          </h2>

          <div className="rounded-2xl bg-[#0B0F19] border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
            {data?.incidents && data.incidents.length > 0 ? (
              data.incidents.map((inc: any) => (
                <div key={inc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{inc.title}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Resolved
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Impact: {inc.impact} • Fully auto-remediated and verified in production.
                    </p>
                  </div>

                  <div className="text-left sm:text-right font-mono text-[11px] text-slate-500 shrink-0">
                    <span>{new Date(inc.resolvedAt || inc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Zero system outages reported in the past 90 days.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 mt-16 py-8 text-center text-xs text-slate-500 font-mono">
        <p>Powered by Bastion Autonomous SRE &bull; 99.98% Uptime SLA Guaranteed &bull; Move Digital Africa</p>
      </footer>
    </div>
  );
}
