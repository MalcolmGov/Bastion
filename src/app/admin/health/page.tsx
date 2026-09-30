'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  Check,
  Globe,
  ExternalLink,
  Lock,
  Wifi,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function AdminHealthPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadHealth = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch('/api/admin/health');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleUpdateIncident = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/health', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        loadHealth();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-sky-600 dark:text-sky-400 uppercase font-bold tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Infrastructure Telemetry &amp; Uptime Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Health &amp; Web Monitoring</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time active verification for core database, edge caching, client production websites, and public endpoints.
          </p>
        </div>

        <button
          onClick={() => loadHealth(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#142033] dark:hover:bg-[#1E2E48] border border-slate-200 dark:border-[#243754] text-xs font-semibold text-slate-700 dark:text-gray-200 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Probing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MONITORED CLIENT PRODUCTION WEBSITES */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-sky-500" />
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Live Monitored Web Properties &amp; Client Endpoints
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Continuous Polling
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data?.monitoredSites?.map((site: any) => (
            <div
              key={site.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-sm">
                    MD
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{site.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        HTTP {site.httpCode}
                      </span>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1 font-mono mt-0.5"
                    >
                      <span>{site.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-right">
                    <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Status</span>
                    <strong className="text-xs font-mono text-emerald-800 dark:text-emerald-300 uppercase">Operational</strong>
                  </div>
                </div>
              </div>

              {/* Telemetry Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-500" />
                    Round-Trip TTFB
                  </span>
                  <strong className="text-sm font-mono font-bold text-slate-900 dark:text-white">{site.latency}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Server className="w-3 h-3 text-indigo-500" />
                    Edge Server &amp; PoP
                  </span>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white">{site.server}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    SSL Certificate
                  </span>
                  <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{site.sslStatus}</strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-amber-500" />
                    Uptime SLA (30d)
                  </span>
                  <strong className="text-sm font-mono font-bold text-slate-900 dark:text-white">{site.uptime}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Last verified at: <strong className="font-mono text-slate-600 dark:text-slate-300">{new Date(site.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">SSL Valid through {site.sslExpires}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5 CORE SUBSYSTEMS STATUS */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
          Core Subsystems Telemetry
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.systems?.map((sys: any) => (
            <div key={sys.name} className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{sys.name}</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 font-mono">
                <span>Response / Heartbeat</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{sys.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* INCIDENTS TABLE */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-[#1C2638] flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-gray-400 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Operational Incident Log &amp; Triage</span>
          </h2>
          <span className="text-[11px] text-slate-400">Total: {data?.incidents?.length || 0}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#152030]">
          {data?.incidents && data.incidents.length > 0 ? (
            data.incidents.map((inc: any) => (
              <div key={inc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#0E1522] transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{inc.title}</span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        inc.severity === 'high'
                          ? 'bg-rose-50 text-rose-700 dark:bg-red-950 dark:text-red-300 border border-rose-200 dark:border-red-800'
                          : inc.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-sky-50 text-sky-700 dark:bg-blue-950 dark:text-blue-300 border border-sky-200 dark:border-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-gray-400">
                    Affected Routes: <code className="text-slate-700 dark:text-gray-300 font-mono text-[11px]">{inc.affected_routes}</code> • Created {new Date(inc.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {inc.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateIncident(inc.id, 'resolved')}
                      disabled={updatingId === inc.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {inc.status === 'resolved' && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Resolved at {new Date(inc.resolved_at || inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 dark:text-gray-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Zero active incidents. All systems functioning optimally.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
