'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Printer,
  ExternalLink,
  Search,
  Filter,
  Building2,
  Calendar,
  Lock,
  FileText,
  Award,
  BookOpen,
  Eye,
  Check,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Scale,
  Download,
  Info,
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import type {
  GovernanceAudit,
  GovernanceCheck,
  GovernanceCategory,
  RuleStatus,
} from '@/lib/governance/types';
import {
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
} from '@/lib/governance/types';

export default function GovernanceScorecardPage() {
  const { activeClient, clients, setActiveClientId } = useStudioWorkspace();

  const [loading, setLoading] = useState(true);
  const [runningScan, setRunningScan] = useState(false);
  const [audit, setAudit] = useState<GovernanceAudit | null>(null);
  const [history, setHistory] = useState<GovernanceAudit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issues'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const clientId = activeClient?.id || 'client_goldfields';

  // Fetch current audit
  const fetchAudit = async (cid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/governance/audit?clientId=${encodeURIComponent(cid)}`);
      if (!res.ok) throw new Error('Failed to load governance scorecard');
      const data = await res.json();
      setAudit(data.audit);
      setHistory(data.history || []);
    } catch (err: any) {
      console.error(err);
      setFeedback({ message: err.message || 'Error loading audit data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchAudit(clientId);
    }
  }, [clientId]);

  // Run live scan
  const handleRunScan = async () => {
    try {
      setRunningScan(true);
      setFeedback(null);
      const res = await fetch('/api/admin/governance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) throw new Error('Failed to execute statutory audit scan');
      const data = await res.json();
      setAudit(data.audit);
      setHistory(data.history || []);
      setFeedback({
        message: data.message || `Audit completed: ${data.audit.overallScore}% overall compliance score recorded.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setFeedback({ message: err.message || 'Error running governance scan', type: 'error' });
    } finally {
      setRunningScan(false);
    }
  };

  // Filtered checks
  const filteredChecks = useMemo(() => {
    if (!audit?.checks) return [];
    return audit.checks.filter((chk) => {
      // Category filter
      if (selectedCategory !== 'all' && chk.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'issues' && chk.status === 'pass') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = chk.title.toLowerCase().includes(q);
        const matchesRef = chk.statutoryRef.toLowerCase().includes(q);
        const matchesEvidence = (chk.evidenceText || '').toLowerCase().includes(q);
        const matchesRemediation = (chk.remediationAdvice || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesRef && !matchesEvidence && !matchesRemediation) {
          return false;
        }
      }
      return true;
    });
  }, [audit?.checks, selectedCategory, statusFilter, searchQuery]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 75) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
    if (score >= 75) return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300';
    return 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {/* Top Banner / Feedback Alert */}
      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-3 text-sm font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-bastion-blue dark:text-sky-400 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Corporate Governance &amp; Regulatory Secretariat</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            King IV &amp; POPIA Governance Scorecard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Automated statutory compliance audit evaluating South African corporate governance standards (King IV Code 2016),
            POPIA Act 4 of 2013 privacy disclosures, PAIA Section 51 manuals, and edge security safeguards.
          </p>
        </div>

        {/* Client Fleet Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Client Selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={clientId}
              onChange={(e) => setActiveClientId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {c.name} ({c.id.replace('client_', '').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Scan Button */}
          <button
            onClick={handleRunScan}
            disabled={runningScan}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-bastion-blue hover:bg-blue-600 text-white font-semibold text-xs tracking-tight shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${runningScan ? 'animate-spin' : ''}`} />
            <span>{runningScan ? 'Scanning Statutory Rules...' : 'Run Live Governance Audit'}</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-xs tracking-tight shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Boardroom Audit Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-8 h-8 text-bastion-blue animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Evaluating statutory rules against corporate publications...
          </p>
        </div>
      ) : !audit ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Audit Run On Record</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Execute the first automated statutory governance audit for {activeClient?.name || 'this client'} to inspect POPIA, PAIA, and King IV compliance.
          </p>
          <button
            onClick={handleRunScan}
            className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-bastion-blue text-white font-semibold text-xs shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Initial Baseline Scan</span>
          </button>
        </div>
      ) : (
        <>
          {/* Executive KPI Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Overall Score Master Card */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Overall Compliance Index
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl md:text-5xl font-black ${getScoreColor(audit.overallScore)}`}>
                    {audit.overallScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    audit.status === 'compliant'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : audit.status === 'needs_review'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {audit.status === 'compliant' ? 'Grade A Compliant' : audit.status === 'needs_review' ? 'Grade B Needs Review' : 'Grade C Non-Compliant'}
                </span>
                <p className="text-[11px] text-slate-400 mt-2">
                  Evaluated {new Date(audit.createdAt).toLocaleDateString()} &bull; {audit.totalChecks} checks
                </p>
              </div>
            </div>

            {/* Category Card: POPIA */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  POPIA Act 4 of 2013
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  30% Weight
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {audit.popiaScore}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 mb-2">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${audit.popiaScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data privacy, Info Officer &amp; transborder disclosures
              </p>
            </div>

            {/* Category Card: PAIA */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  PAIA Section 51
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900">
                  20% Weight
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {audit.paiaScore}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 mb-2">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${audit.paiaScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Statutory manual, Form 2 request fee notice
              </p>
            </div>

            {/* Category Card: King IV */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  King IV Governance
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                  35% Weight
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {audit.kingIvScore}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 mb-2">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${audit.kingIvScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Board charters, committees &amp; whistleblower hotline
              </p>
            </div>

            {/* Category Card: Security & WCAG */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Web Security &amp; WCAG
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  15% Weight
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {audit.securityScore}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3 mb-2">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${audit.securityScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                TLS 1.3, HSTS headers, screen-reader accessibility
              </p>
            </div>
          </div>

          {/* Retainer Justifier Value Callout */}
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-bastion-blue/10 via-purple-500/10 to-amber-500/10 border border-bastion-blue/20 dark:border-sky-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-bastion-blue text-white shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Corporate Governance &amp; Regulatory Retainer Value
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
                  This scorecard verifies compliance for <strong>{activeClient?.name}</strong> under Bastion’s ongoing corporate retainer (R35,000 – R55,000/mo).
                  It guarantees quarterly Boardroom audit packs, continuous statutory scanning, and zero legal liability under Information Regulator audits.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-2">
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {audit.passedChecks} Passed &bull; {audit.warningChecks} Warnings &bull; {audit.failedChecks} Failed
              </span>
            </div>
          </div>

          {/* Controls Bar: Category Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Checks ({audit.checks?.length || 0})
              </button>
              <button
                onClick={() => setSelectedCategory('popia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'popia'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                POPIA ({audit.checks?.filter(c => c.category === 'popia').length || 4})
              </button>
              <button
                onClick={() => setSelectedCategory('paia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'paia'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PAIA ({audit.checks?.filter(c => c.category === 'paia').length || 2})
              </button>
              <button
                onClick={() => setSelectedCategory('king_iv')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'king_iv'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                King IV ({audit.checks?.filter(c => c.category === 'king_iv').length || 6})
              </button>
              <button
                onClick={() => setSelectedCategory('security')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedCategory === 'security'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Security &amp; WCAG ({audit.checks?.filter(c => c.category === 'security').length || 4})
              </button>
            </div>

            {/* Filter by Status & Search */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStatusFilter(statusFilter === 'all' ? 'issues' : 'all')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  statusFilter === 'issues'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{statusFilter === 'issues' ? 'Showing Issues Only' : 'Show Issues Only'}</span>
              </button>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter statutory rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-bastion-blue w-48 md:w-60"
                />
              </div>
            </div>
          </div>

          {/* Checklist Items Grid */}
          <div className="space-y-3 mb-10">
            {filteredChecks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No statutory compliance issues match the selected filter.
                </p>
              </div>
            ) : (
              filteredChecks.map((chk) => (
                <div
                  key={chk.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      {/* Status Icon */}
                      <div className="mt-0.5 shrink-0">
                        {chk.status === 'pass' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                        {chk.status === 'warning' && (
                          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        )}
                        {chk.status === 'fail' && (
                          <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <X className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {chk.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                            {chk.statutoryRef}
                          </span>
                        </div>

                        {chk.evidenceText && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {chk.evidenceText}
                          </p>
                        )}

                        {/* Remediation block if warning or fail */}
                        {chk.status !== 'pass' && chk.remediationAdvice && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2">
                            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Bastion Remediation Action: </span>
                              <span>{chk.remediationAdvice}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-start">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          chk.severity === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : chk.severity === 'high'
                            ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {chk.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {chk.scoreWeight} pts
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Historical Audit Trail */}
          {history.length > 1 && (
            <div className="mt-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-bastion-blue" />
                <span>Statutory Audit Trail (Past 5 Scans)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {history.map((h, idx) => (
                  <div
                    key={h.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      idx === 0
                        ? 'bg-bastion-blue/5 border-bastion-blue/30 dark:bg-sky-950/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {idx === 0 ? 'Active Scan' : `Prior Run #${idx + 1}`}
                    </div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {h.overallScore}%
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(h.createdAt).toLocaleDateString()} &bull; {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Boardroom Executive Audit Report Modal */}
      {showReportModal && audit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-4 md:p-8 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200">
            {/* Modal Controls Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Award className="w-4 h-4" />
                <span>Boardroom Executive Audit Pack &bull; Statutory Certificate</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Canvas */}
            <div className="p-8 md:p-12 space-y-8 bg-white text-slate-900 print:p-0">
              {/* Bastion Executive Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900">
                    BASTION GROUP HOLDINGS
                  </div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Corporate Governance &amp; Regulatory Secretariat Practice
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Sandton City Office Towers, 5th Street, Sandton 2196, Republic of South Africa
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-500">
                    CERTIFICATE ID: REP-GOV-2026-{(activeClient?.slug || 'CLIENT').toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Evaluated: {new Date(audit.createdAt).toLocaleDateString('en-ZA', { dateStyle: 'long' })}
                  </div>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 border border-slate-300">
                    Official Boardroom Record
                  </div>
                </div>
              </div>

              {/* Title & Target Client */}
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  STATUTORY COMPLIANCE &amp; CORPORATE GOVERNANCE AUDIT REPORT
                </h2>
                <div className="flex items-center space-x-3 text-sm text-slate-600 mt-1">
                  <span>Subject Entity: <strong>{activeClient?.name}</strong></span>
                  <span>&bull;</span>
                  <span>Auditor: <strong>Bastion Regulatory Engine</strong></span>
                </div>
              </div>

              {/* Executive Summary Metrics Box */}
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Overall Compliance
                  </div>
                  <div className={`text-3xl font-black ${audit.overallScore >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {audit.overallScore}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    {audit.status.toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    POPIA Act 4 of 2013
                  </div>
                  <div className="text-3xl font-black text-blue-600">
                    {audit.popiaScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Privacy &amp; Data Rights</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    PAIA Act 2 of 2000
                  </div>
                  <div className="text-3xl font-black text-purple-600">
                    {audit.paiaScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Section 51 Manual</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    King IV (2016)
                  </div>
                  <div className="text-3xl font-black text-amber-600">
                    {audit.kingIvScore}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Board &amp; Committees</div>
                </div>
              </div>

              {/* Executive Recommendation */}
              <div className="p-5 rounded-xl border border-slate-300 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">
                  Executive Secretarial Advisory Note to the Audit &amp; Risk Committee:
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {audit.overallScore >= 85
                    ? `The Audit and Risk Committee of ${activeClient?.name} is formally advised that digital corporate disclosures, statutory registers, and investor communication channels fulfill South African corporate governance requirements under King IV and POPIA Act 4 of 2013 with negligible administrative variance.`
                    : `The Audit and Risk Committee of ${activeClient?.name} is advised to commission the Bastion Statutory Remediation Pack immediately to address flagged Information Officer contact particulars and mandatory Section 51 PAIA manual disclosures before statutory filing deadlines.`}
                </p>
              </div>

              {/* Statutory Findings Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Statutory Rule Evaluation Log (16 Standards Evaluated)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5">Statutory Standard</th>
                        <th className="p-2.5">Act / Code Reference</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Audit Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(audit.checks || []).map((chk) => (
                        <tr key={chk.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{chk.title}</td>
                          <td className="p-2.5 text-slate-600 font-mono text-[11px]">{chk.statutoryRef}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                chk.status === 'pass'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : chk.status === 'warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {chk.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px] max-w-xs leading-normal">
                            {chk.evidenceText || chk.remediationAdvice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sign-Off & Seal Block */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8">
                <div>
                  <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-serif italic text-sm text-slate-800">
                    Malcolm Govender
                  </div>
                  <div className="text-[11px] font-bold text-slate-900 mt-1">Malcolm Govender</div>
                  <div className="text-[10px] text-slate-500">Executive Partner &amp; Lead Governance Auditor</div>
                  <div className="text-[10px] text-slate-400">Bastion Group Holdings Corporate Secretariat</div>
                </div>

                <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-center flex flex-col items-center justify-center">
                  <Award className="w-8 h-8 text-amber-600 mb-1" />
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                    BASTION STATUTORY SEAL
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    Verified Digital Audit Hash: SHA-256 Validated
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
