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
  ArrowUpRight,
  GitPullRequest,
  GitBranch,
  Terminal,
  ShieldAlert,
  Code2,
  Play
} from 'lucide-react';
import { PRPreviewModal } from '@/components/sre/PRPreviewModal';

export default function AdminHealthPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [selectedIncidentForReview, setSelectedIncidentForReview] = useState<any | null>(null);
  const [sreMessage, setSreMessage] = useState<string | null>(null);

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

  const handleRunScan = async (simulate = false) => {
    setScanning(true);
    setSreMessage(null);
    try {
      const res = await fetch('/api/admin/sre/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate })
      });
      const json = await res.json();
      if (res.ok) {
        setSreMessage(json.message);
        await loadHealth();
      }
    } catch (err: any) {
      setSreMessage('Error running anomaly scan: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateFixAndPR = async (incident: any) => {
    setDiagnosingId(incident.id);
    setSreMessage(null);
    try {
      const res = await fetch('/api/admin/sre/diagnose-and-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id })
      });
      const json = await res.json();
      if (res.ok) {
        setSreMessage(`AI fix generated! GitHub PR #${json.prNumber || 'open'} staged for Human-in-the-Loop review.`);
        await loadHealth();
        // Automatically open review modal for the incident
        setSelectedIncidentForReview({
          ...incident,
          ai_diagnosis: json.diagnosis,
          ai_proposed_patch: json.patch,
          pr_number: json.prNumber,
          pr_url: json.prUrl,
          pr_branch: json.prBranch,
          pr_status: json.prStatus,
          risk_level: json.patch?.riskLevel || 'low'
        });
      } else {
        setSreMessage('Error generating fix: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      setSreMessage('Error triggering AI diagnosis: ' + err.message);
    } finally {
      setDiagnosingId(null);
    }
  };

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
      {/* ======================================================== */}
      {/* AUTONOMOUS SRE & SELF-HEALING PIPELINE */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] rounded-2xl overflow-hidden shadow-sm">
        {/* SRE Banner Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-[#0E1522]/50">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Autonomous SRE & Self-Healing Pipeline</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Proactive Bug Detection, AI Code Remediation & HITL Approvals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuously probes endpoints, generates surgical code patches, opens GitHub PRs, and gates production deployment behind human verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleRunScan(false)}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#142033] dark:hover:bg-[#1E2E48] border border-slate-200 dark:border-[#243754] text-xs font-semibold text-slate-700 dark:text-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Proactive Anomaly Scan'}</span>
            </button>

            <button
              onClick={() => handleRunScan(true)}
              disabled={scanning}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Anomaly &amp; Auto-Heal</span>
            </button>
          </div>
        </div>

        {/* Dynamic SRE Notification Toast */}
        {sreMessage && (
          <div className="px-5 py-3 bg-sky-50 dark:bg-sky-950/40 border-b border-sky-100 dark:border-sky-900/40 text-sky-900 dark:text-sky-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
              <span>{sreMessage}</span>
            </div>
            <button
              onClick={() => setSreMessage(null)}
              className="text-sky-500 hover:text-sky-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Incidents & SRE Triage Stream */}
        <div className="divide-y divide-slate-100 dark:divide-[#152030]">
          {data?.incidents && data.incidents.length > 0 ? (
            data.incidents.map((inc: any) => {
              const isResolved = inc.status === 'resolved';
              const hasPatch = !!inc.ai_proposed_patch;
              const hasPR = !!inc.pr_number;
              const isDiagnosing = diagnosingId === inc.id;

              return (
                <div
                  key={inc.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-[#0E1522] transition"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {inc.title}
                      </span>

                      {/* Severity Badge */}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          inc.severity === 'high'
                            ? 'bg-rose-50 text-rose-700 dark:bg-red-950 dark:text-red-300 border border-rose-200 dark:border-red-800'
                            : inc.severity === 'medium'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-sky-50 text-sky-700 dark:bg-blue-950 dark:text-blue-300 border border-sky-200 dark:border-blue-800'
                        }`}
                      >
                        {inc.severity}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {inc.status}
                      </span>

                      {/* SRE Risk Level Pill */}
                      {inc.risk_level && (
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Risk: {inc.risk_level}
                        </span>
                      )}

                      {/* GitHub PR Pill if created */}
                      {hasPR && (
                        <a
                          href={inc.pr_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:underline"
                        >
                          <GitPullRequest className="w-3 h-3 text-indigo-500" />
                          <span>PR #{inc.pr_number} on GitHub</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-gray-400">
                      <div>
                        Affected Routes:{' '}
                        <code className="text-slate-700 dark:text-gray-300 font-mono text-[11px]">
                          {inc.affected_routes || 'Platform Core'}
                        </code>
                      </div>
                      <span>•</span>
                      <div>
                        Detected: {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {inc.ai_diagnosis && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            AI SRE Analysis Ready
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SRE Controls & HITL Review Action */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!isResolved && (
                      <>
                        {hasPatch || hasPR ? (
                          <button
                            onClick={() => setSelectedIncidentForReview(inc)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-indigo-500/20"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>Review AI Fix & Approve (HITL)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateFixAndPR(inc)}
                            disabled={isDiagnosing}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition flex items-center space-x-1.5"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                            <span>{isDiagnosing ? 'Diagnosing...' : 'Generate AI Fix & PR'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleUpdateIncident(inc.id, 'resolved')}
                          disabled={updatingId === inc.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}

                    {isResolved && (
                      <div className="flex items-center space-x-2">
                        {inc.approval_status === 'approved' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Auto-Remediated &amp; Verified</span>
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">
                          {inc.resolved_at
                            ? `Resolved at ${new Date(inc.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Resolved'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-500 dark:text-gray-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Zero active incidents. Autonomous SRE probes running nominal.</span>
            </div>
          )}
        </div>
      </div>

      {/* Human-in-the-Loop PR Review Modal */}
      {selectedIncidentForReview && (
        <PRPreviewModal
          isOpen={!!selectedIncidentForReview}
          onClose={() => setSelectedIncidentForReview(null)}
          incident={selectedIncidentForReview}
          onApproved={loadHealth}
        />
      )}
    </div>
  );
}
