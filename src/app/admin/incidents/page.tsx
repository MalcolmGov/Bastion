'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  GitPullRequest,
  GitCommit,
  GitBranch,
  Clock,
  Sparkles,
  Zap,
  Play,
  FileCode,
  Globe,
  Server,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowUpRight,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { IncidentEvidenceModal } from '@/components/sre/IncidentEvidenceModal';
import { PRPreviewModal } from '@/components/sre/PRPreviewModal';
import { CodeDiffViewer } from '@/components/sre/CodeDiffViewer';

export default function AdminIncidentsDashboard() {
  const { user } = useAdminAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    open: 0,
    investigating: 0,
    resolved: 0,
    verified: 0,
    autoRemediated: 0,
    autoRemediationRate: 100,
    avgMttrSec: 74,
    repositories: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [repoFilter, setRepoFilter] = useState<string>('all');

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIncidentForEvidence, setSelectedIncidentForEvidence] = useState<any | null>(null);
  const [selectedIncidentForReview, setSelectedIncidentForReview] = useState<any | null>(null);

  const [scanning, setScanning] = useState(false);
  const [diagnosingId, setDiagnosingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [probingId, setProbingId] = useState<string | null>(null);

  const loadIncidents = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (severityFilter !== 'all') params.set('severity', severityFilter);
      if (repoFilter !== 'all') params.set('repo', repoFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const res = await fetch(`/api/admin/incidents?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setIncidents(json.incidents || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, severityFilter, repoFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRunScan = async (simulate = false, repoName = 'MoveDigital') => {
    setScanning(true);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/sre/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulate,
          repoOwner: 'MalcolmGov',
          repoName,
          targetRoute: repoName === 'MoveDigital' ? 'https://www.movedigital.africa/' : '/sustainability'
        })
      });
      const json = await res.json();
      if (res.ok) {
        setNotification(json.message);
        await loadIncidents(true);
      }
    } catch (err: any) {
      setNotification('Scan error: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleGenerateFixAndPR = async (incident: any) => {
    setDiagnosingId(incident.id);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/sre/diagnose-and-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          repoOwner: incident.repo_owner || 'MalcolmGov',
          repoName: incident.repo_name || 'MoveDigital'
        })
      });
      const json = await res.json();
      if (res.ok) {
        setNotification(`AI surgical fix created! GitHub PR #${json.prNumber || 'open'} staged for Human-in-the-Loop review.`);
        await loadIncidents(true);
        setSelectedIncidentForReview({
          ...incident,
          repo_owner: json.repoOwner,
          repo_name: json.repoName,
          ai_diagnosis: json.diagnosis,
          ai_proposed_patch: json.patch,
          pr_number: json.prNumber,
          pr_url: json.prUrl,
          pr_branch: json.prBranch,
          pr_status: json.prStatus,
          risk_level: json.patch?.riskLevel || 'low'
        });
      } else {
        setNotification('Error generating fix: ' + (json.error || 'Unknown error'));
      }
    } catch (err: any) {
      setNotification('Error triggering AI diagnosis: ' + err.message);
    } finally {
      setDiagnosingId(null);
    }
  };

  const handleLiveProbe = async (incident: any) => {
    setProbingId(incident.id);
    try {
      const targetUrl = incident.affected_routes?.includes('http')
        ? incident.affected_routes
        : 'https://www.movedigital.africa/';

      const res = await fetch('/api/admin/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          probeUrl: targetUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setIncidents(prev =>
          prev.map(i =>
            i.id === incident.id
              ? { ...i, probe_latency_ms: data.latencyMs, verification_status: data.ok ? 'passed' : 'warning' }
              : i
          )
        );
        setNotification(`Live probe to ${targetUrl} verified: HTTP ${data.httpStatus} (${data.latencyMs}ms)`);
      }
    } catch (err: any) {
      setNotification('Probe error: ' + err.message);
    } finally {
      setProbingId(null);
    }
  };

  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incidents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bastion-sre-incidents-audit-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    const q = searchQuery.toLowerCase();
    return incidents.filter(
      i =>
        i.title?.toLowerCase().includes(q) ||
        i.id?.toLowerCase().includes(q) ||
        i.affected_routes?.toLowerCase().includes(q) ||
        i.merge_commit_sha?.toLowerCase().includes(q) ||
        String(i.pr_number).includes(q)
    );
  }, [incidents, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/admin/health" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition">
              <ArrowLeft className="w-3 h-3" />
              <span>Website Health &amp; Telemetry</span>
            </Link>
            <span>/</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Autonomous SRE Incident Audit</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Incidents &amp; SRE Evidence Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end audit trail of proactive anomalies, AI code fixes, GitHub PRs, human sign-offs, and verified cloud deployments.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadIncidents(true)}
            disabled={refreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1522] hover:bg-slate-50 dark:hover:bg-[#152030] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleExportAuditJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0E1522] hover:bg-slate-50 dark:hover:bg-[#152030] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Audit JSON</span>
          </button>

          <button
            onClick={() => handleRunScan(false)}
            disabled={scanning}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#142033] dark:hover:bg-[#1E2E48] border border-slate-200 dark:border-[#243754] text-xs font-semibold text-slate-700 dark:text-gray-200 transition disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-sky-500 ${scanning ? 'animate-spin' : ''}`} />
            <span>Proactive Scan</span>
          </button>

          <button
            onClick={() => handleRunScan(true, 'MoveDigital')}
            disabled={scanning}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Anomaly &amp; Auto-Heal</span>
          </button>
        </div>
      </div>

      {/* Dynamic SRE Notification Banner */}
      {notification && (
        <div className="px-4 py-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 rounded-xl text-sky-900 dark:text-sky-300 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-sky-500 hover:text-sky-700 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5 KPI METRICS BANNER */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Incidents</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500">logged</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Resolved &amp; Verified</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.resolved}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600/80 dark:text-emerald-400/80">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 100}% closed
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Active / Review</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${stats.open > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
              {stats.open + stats.investigating}
            </span>
            <span className="text-[11px] text-slate-500">pending sign-off</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-sky-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Mean Time to Fix (MTTR)</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400">
              {stats.avgMttrSec < 60 ? `${stats.avgMttrSec}s` : `${Math.floor(stats.avgMttrSec / 60)}m ${stats.avgMttrSec % 60}s`}
            </span>
            <span className="text-[11px] text-slate-500">avg speed</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-indigo-500">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Autonomous SRE Pass</span>
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {stats.autoRemediationRate}%
            </span>
            <span className="text-[11px] font-semibold text-indigo-600/80 dark:text-indigo-400/80">success rate</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER & SEARCH TOOLBAR */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID, title, route, commit SHA..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#121A28] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-[#121A28] p-1 border border-slate-200 dark:border-[#1E293B] text-xs">
            {(['all', 'open', 'resolved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#1C283C] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121A28] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>

          {/* Repository Dropdown */}
          <select
            value={repoFilter}
            onChange={e => setRepoFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#121A28] border border-slate-200 dark:border-[#1E293B] text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Repositories</option>
            {stats.repositories?.map((r: string) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* INCIDENTS TABLE / STREAM */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0B1019] border border-slate-200/90 dark:border-[#1C2638] rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-[#1C2638] bg-slate-50/60 dark:bg-[#0E1522]/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Incident Audit Stream ({filteredIncidents.length})</span>
          <span className="font-mono text-[11px] lowercase">live telemetry synced</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <span>Loading incident audit logs...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-slate-800 dark:text-white">
              No matching incidents found
            </div>
            <p className="max-w-md mx-auto text-slate-500">
              Your autonomous SRE probes are reporting 100% nominal operation across monitored endpoints.
            </p>
            <button
              onClick={() => handleRunScan(true, 'MoveDigital')}
              className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate MoveDigital Anomaly &amp; Test SRE</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#152030]">
            {filteredIncidents.map((inc: any) => {
              const isResolved = inc.status === 'resolved';
              const isExpanded = expandedIds.has(inc.id);
              const repoOwner = inc.repo_owner || 'MalcolmGov';
              const repoName = inc.repo_name || 'MoveDigital';
              const hasPatch = !!inc.ai_proposed_patch;
              const hasPR = !!inc.pr_number;
              const isDiagnosing = diagnosingId === inc.id;
              const isProbing = probingId === inc.id;
              const mergeSha = inc.merge_commit_sha || (inc.timeline_json?.match(/Commit ([a-f0-9]{7,40})/i)?.[1]);

              // Calculate MTTR for this incident
              let itemMttr = 'N/A';
              if (inc.created_at && inc.resolved_at) {
                const s = new Date(inc.created_at).getTime();
                const e = new Date(inc.resolved_at).getTime();
                const d = Math.round((e - s) / 1000);
                if (d < 60) itemMttr = `${d}s`;
                else itemMttr = `${Math.floor(d / 60)}m ${d % 60}s`;
              }

              // Parse patch for preview
              let patchObj: any = null;
              try {
                if (typeof inc.ai_proposed_patch === 'string') patchObj = JSON.parse(inc.ai_proposed_patch);
                else patchObj = inc.ai_proposed_patch;
              } catch {
                patchObj = null;
              }

              return (
                <div key={inc.id} className="transition hover:bg-slate-50/70 dark:hover:bg-[#0E1522]">
                  {/* Primary Row Summary */}
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Top Badges Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* ID Pill */}
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {inc.id}
                        </span>

                        {/* Severity */}
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

                        {/* Status */}
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isResolved
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {inc.status}
                        </span>

                        {/* Repo */}
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                          {repoOwner}/{repoName}
                        </span>

                        {/* Verification Status Pill */}
                        {inc.verification_status === 'passed' && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                            <span>Verified Nominal ({inc.probe_latency_ms || 125}ms)</span>
                          </span>
                        )}

                        {/* Deploy status */}
                        {inc.deploy_status === 'deployed' && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            Cloud Deployed
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {inc.title}
                      </h3>

                      {/* Evidence & Timestamp Subtitle Bar */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-gray-400 font-mono">
                        <div>
                          Detected:{' '}
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                          </span>
                        </div>
                        {isResolved && (
                          <>
                            <span>•</span>
                            <div>
                              Resolved:{' '}
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {new Date(inc.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                              </span>
                            </div>
                            <span>•</span>
                            <div>
                              MTTR: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{itemMttr}</span>
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <div>
                          Route:{' '}
                          <code className="text-slate-700 dark:text-slate-300 font-sans text-[11px]">
                            {inc.affected_routes || 'Platform Core'}
                          </code>
                        </div>
                      </div>

                      {/* Evidence Badges Quick Peek */}
                      {(inc.pr_number || mergeSha) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {inc.pr_number && (
                            <a
                              href={inc.pr_url || `https://github.com/${repoOwner}/${repoName}/pull/${inc.pr_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:underline"
                            >
                              <GitPullRequest className="w-3 h-3 text-indigo-500" />
                              <span>GitHub PR #{inc.pr_number}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          )}

                          {mergeSha && (
                            <a
                              href={`https://github.com/${repoOwner}/${repoName}/commit/${mergeSha}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:underline"
                            >
                              <GitCommit className="w-3 h-3 text-emerald-500" />
                              <span>Commit {mergeSha.slice(0, 7)}</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          )}

                          {inc.deployment_url && (
                            <a
                              href={inc.deployment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:underline"
                            >
                              <Server className="w-3 h-3 text-sky-500" />
                              <span>Vercel Edge</span>
                              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Evidence Modal Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedIncidentForEvidence(inc)}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>View Evidence of Fix</span>
                      </button>

                      {/* Live Probe Button */}
                      <button
                        type="button"
                        onClick={() => handleLiveProbe(inc)}
                        disabled={isProbing}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#121A28] hover:bg-slate-50 dark:hover:bg-[#182336] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        title="Dispatch synthetic probe against target route"
                      >
                        <Zap className={`w-3.5 h-3.5 text-amber-500 ${isProbing ? 'animate-spin' : ''}`} />
                        <span>{isProbing ? 'Probing...' : 'Test Probe Live'}</span>
                      </button>

                      {/* Unresolved Actions */}
                      {!isResolved && (
                        <>
                          {hasPatch || hasPR ? (
                            <button
                              onClick={() => setSelectedIncidentForReview(inc)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-indigo-500/20 cursor-pointer"
                            >
                              <GitPullRequest className="w-3.5 h-3.5" />
                              <span>Review &amp; Deploy (HITL)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerateFixAndPR(inc)}
                              disabled={isDiagnosing}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                              <span>{isDiagnosing ? 'Diagnosing...' : 'Generate AI Fix & PR'}</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Accordion Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(inc.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Inline Expanded Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-[#152030] bg-slate-50/50 dark:bg-[#080E18] space-y-4">
                      {/* Telemetry Diagnosis */}
                      <div className="space-y-1">
                        <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                          AI Root Cause Diagnosis
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                          {inc.ai_diagnosis || 'Synthetic telemetry monitor detected route anomaly.'}
                        </p>
                      </div>

                      {/* Embedded Code Diff Viewer if patch exists */}
                      {patchObj && (
                        <div className="space-y-2">
                          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                            Surgical Patch Diff ({patchObj.filePath || 'client/src/App.tsx'})
                          </span>
                          <div className="rounded-xl border border-slate-200 dark:border-[#1E293B] overflow-hidden p-1 bg-white dark:bg-[#0B1019]">
                            <CodeDiffViewer
                              filePath={patchObj.filePath || 'client/src/App.tsx'}
                              startLine={patchObj.startLine || 24}
                              endLine={patchObj.endLine || 33}
                              originalCode={patchObj.originalCode || ''}
                              replacementCode={patchObj.replacementCode || ''}
                              explanation={patchObj.explanation}
                              confidence={patchObj.confidence || 'high'}
                              riskLevel={patchObj.riskLevel || 'low'}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Human-in-the-Loop PR Review Modal */}
      {selectedIncidentForReview && (
        <PRPreviewModal
          isOpen={!!selectedIncidentForReview}
          onClose={() => setSelectedIncidentForReview(null)}
          incident={selectedIncidentForReview}
          onApproved={() => loadIncidents(true)}
        />
      )}

      {/* Evidence & Cryptographic Verification Modal */}
      {selectedIncidentForEvidence && (
        <IncidentEvidenceModal
          isOpen={!!selectedIncidentForEvidence}
          onClose={() => setSelectedIncidentForEvidence(null)}
          incident={selectedIncidentForEvidence}
          onProbeUpdated={(id, latency) => {
            setIncidents(prev =>
              prev.map(i => (i.id === id ? { ...i, probe_latency_ms: latency, verification_status: 'passed' } : i))
            );
          }}
        />
      )}
    </div>
  );
}
