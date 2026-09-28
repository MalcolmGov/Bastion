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
  Check
} from 'lucide-react';

export default function AdminHealthPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadHealth = async () => {
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Infrastructure Telemetry &amp; Uptime</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Health &amp; Incident Monitoring</h1>
          <p className="text-xs text-gray-400 mt-1">
            Continuous operational verification for core database, edge caching, background schedulers, and public endpoints.
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#142033] hover:bg-[#1E2E48] border border-[#243754] text-xs text-gray-200 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C99700]" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 5 Core Subsystems Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.systems?.map((sys: any) => (
          <div key={sys.name} className="p-4 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{sys.name}</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Healthy</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono">
              <span>Response / Heartbeat</span>
              <span className="text-[#C99700]">{sys.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1C2638] flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Operational Incident Log &amp; Triage</span>
          </h2>
          <span className="text-[11px] text-gray-500">Total: {data?.incidents?.length || 0}</span>
        </div>

        <div className="divide-y divide-[#152030]">
          {data?.incidents && data.incidents.length > 0 ? (
            data.incidents.map((inc: any) => (
              <div key={inc.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0E1522] transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white">{inc.title}</span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        inc.severity === 'high'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : inc.severity === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Affected Routes: <code className="text-gray-300 font-mono text-[11px]">{inc.affected_routes}</code> • Created {new Date(inc.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {inc.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateIncident(inc.id, 'resolved')}
                      disabled={updatingId === inc.id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-xs font-semibold text-emerald-300 transition flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {inc.status === 'resolved' && (
                    <span className="text-[11px] font-mono text-gray-500">
                      Resolved at {new Date(inc.resolved_at || inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>Zero active incidents. All systems functioning optimally.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
