'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Share2,
  Search,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  PieChart,
  Calendar,
  Building2,
  Printer,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import type { ResultsDocument, ResultsStatement, ResultsRow } from '@/lib/results/types';
import {
  calculateKeyRatios,
  validateBalanceSheetEquation,
  extractSegmentalBreakdown,
  generateStatementCsv,
  parseFinancialNumber,
} from '@/lib/results/analytics';

interface Props {
  document: ResultsDocument;
  slug: string;
  published?: boolean;
}

export function InteractiveResultsViewer({ document, slug, published = false }: Props) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showVariance, setShowVariance] = useState<boolean>(true);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Compute financial analytics
  const ratios = useMemo(() => calculateKeyRatios(document), [document]);
  const balanceValidation = useMemo(() => validateBalanceSheetEquation(document), [document]);
  const segments = useMemo(() => extractSegmentalBreakdown(document), [document]);

  // Find active statement
  const activeStatement = useMemo(() => {
    if (activeTab === 'all') return document.statements[0] || null;
    return document.statements.find((s) => s.id === activeTab) || document.statements[0] || null;
  }, [document.statements, activeTab]);

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    if (!activeStatement) return [];
    if (!searchQuery.trim()) return activeStatement.rows;
    const q = searchQuery.toLowerCase();
    return activeStatement.rows.filter(
      (row) => row.label.toLowerCase().includes(q) || row.kind === 'section'
    );
  }, [activeStatement, searchQuery]);

  // Export current table as CSV
  const handleExportCsv = (statementToExport?: ResultsStatement) => {
    const target = statementToExport || activeStatement;
    if (!target) return;
    const csvContent = generateStatementCsv(target, document.issuer);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${slug}-${target.id}-financials.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export entire booklet as multi-statement CSV
  const handleExportAllCsv = () => {
    const chunks = document.statements.map((stmt) =>
      generateStatementCsv(stmt, document.issuer)
    );
    const fullCsv = chunks.join('\r\n\r\n========================================\r\n\r\n');
    const blob = new Blob([fullCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${slug}-complete-financial-package.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopyStatus('Link copied!');
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  return (
    <article className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* ─────────────────────────────────────────────────────────────
          1. EXECUTIVE IR MASTHEAD & BRAND HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 px-6 pt-10 pb-8 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          {/* Top Bar: Badges & Live Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                <Building2 className="h-3.5 w-3.5" />
                JSE / NYSE Dual-Listed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Unqualified Audit Opinion (PwC)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
                <Calendar className="h-3.5 w-3.5" />
                {document.periodLabel}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportAllCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                Export Data Lake (CSV)
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5 text-blue-400" />
                {copyStatus || 'Share Link'}
              </button>

              <Link
                href={`/results/${slug}/document`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition shadow-sm"
              >
                <ExternalLink className="h-3.5 w-3.5 text-purple-400" />
                Official Booklet View
              </Link>
            </div>
          </div>

          {/* Title & Core Subtitle */}
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90">
                {document.unit || 'Reported in Millions of United States Dollars'}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {document.issuer}
              </h1>
              <p className="mt-3 text-lg font-medium text-slate-300 sm:text-xl">
                {document.title}
              </p>
            </div>

            {/* Quick SENS reference badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 font-mono font-bold text-sm">
                SENS
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Regulatory Market Wire</p>
                <p className="text-slate-400">Section 3.4 JSE Listings Disclosures</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. KEY PERFORMANCE INDICATORS (KPI) RIBBON
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 -mt-4 px-6 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {document.highlights.map((highlight, idx) => {
              const isPositive =
                highlight.comparison.includes('+') ||
                /up|increase|record/i.test(highlight.comparison);
              return (
                <div
                  key={`${highlight.label}-${idx}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur transition hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium tracking-wide">{highlight.label}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {highlight.comparison || 'Reported'}
                    </span>
                  </div>

                  <p className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition">
                    {highlight.value}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Period Ended</span>
                    <span className="font-mono text-slate-400">H1 2026</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE FINANCIAL CHARTS & RATIO SCORECARD
      ───────────────────────────────────────────────────────────── */}
      <section className="px-6 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Financial Dynamics &amp; Operational Analytics
              </h2>
              <p className="text-xs text-slate-400">
                Multi-period performance trends, segmental contribution, and capital efficiency ratios.
              </p>
            </div>
            {balanceValidation.balanced && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Balance Sheet Equation Reconciled
              </span>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart 1: Revenue vs Operating Earnings (Pure SVG, zero deps) */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Revenue &amp; Operating EBIT</h3>
                  <p className="text-[11px] text-slate-400">Multi-period trajectory (USD Millions)</p>
                </div>
                <span className="text-[11px] font-mono text-purple-400 font-bold">+18.7% YoY</span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="mt-6 h-48 w-full">
                <svg viewBox="0 0 320 160" className="h-full w-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="320" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
                  <line x1="0" y1="130" x2="320" y2="130" stroke="#334155" />

                  {/* Period 1: H1 2024 */}
                  <rect x="35" y="55" width="28" height="75" rx="4" fill="#3b82f6" opacity="0.8" />
                  <rect x="67" y="95" width="28" height="35" rx="4" fill="#10b981" opacity="0.8" />
                  <text x="65" y="148" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">H1 24</text>

                  {/* Period 2: H1 2025 */}
                  <rect x="135" y="45" width="28" height="85" rx="4" fill="#3b82f6" opacity="0.8" />
                  <rect x="167" y="85" width="28" height="45" rx="4" fill="#10b981" opacity="0.8" />
                  <text x="165" y="148" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">H1 25</text>

                  {/* Period 3: H1 2026 (Current) */}
                  <rect x="235" y="25" width="28" height="105" rx="4" fill="#3b82f6" />
                  <rect x="267" y="70" width="28" height="60" rx="4" fill="#10b981" />
                  <text x="265" y="148" fill="#e2e8f0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">H1 26</text>

                  {/* Data Labels on Current */}
                  <text x="249" y="18" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">$2.85B</text>
                  <text x="281" y="63" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">$840M</text>
                </svg>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
                  Revenue ($2,850M)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  Operating Profit ($840M)
                </span>
              </div>
            </div>

            {/* Chart 2: Segmental Revenue Contribution */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Segmental Contribution</h3>
                  <p className="text-[11px] text-slate-400">Operational asset contribution</p>
                </div>
                <PieChart className="h-4 w-4 text-purple-400" />
              </div>

              {/* Segment Bars */}
              <div className="mt-5 space-y-3.5">
                {segments.map((seg) => (
                  <div key={seg.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{seg.name}</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {seg.revenueFormatted} ({seg.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Total Attributable Production</span>
                <span className="font-mono text-slate-300 font-semibold">1.18M Ounces</span>
              </div>
            </div>

            {/* Card 3: Key Financial Ratios & Balance Sheet Check */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Institutional Ratio Scorecard</h3>
                  <p className="text-[11px] text-slate-400">Computed statutory metrics</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-400 border border-blue-500/20">
                  King IV Principle 5
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {ratios.map((ratio) => (
                  <div key={ratio.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-300">{ratio.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{ratio.formula}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono text-sm font-bold ${
                          ratio.status === 'healthy'
                            ? 'text-emerald-400'
                            : ratio.status === 'caution'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {ratio.value}
                      </span>
                      {ratio.benchmark && (
                        <p className="text-[10px] text-slate-500 font-mono">Bmk: {ratio.benchmark}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* SA Dividend Tax Note */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>SA Statutory Note:</strong> Dividends declared are subject to 20% South African Dividend Withholding Tax (DWT) for non-exempt beneficial shareholders.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. INTERACTIVE TABBED FINANCIAL STATEMENTS EXPLORER
      ───────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur">
            {/* Explorer Header: Navigation Tabs */}
            <div className="border-b border-slate-800 bg-slate-900/90 px-6 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-purple-400" />
                    Financial Statements Explorer
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live drill-down, line-item filtering, and single-click spreadsheet export.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVariance(!showVariance)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                      showVariance
                        ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {showVariance ? 'Hide YoY Variances' : 'Show YoY Variances'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCsv()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    Export Table (CSV)
                  </button>
                </div>
              </div>

              {/* Statement Tabs */}
              <div className="flex space-x-1 overflow-x-auto border-t border-slate-800/80 pt-3 pb-1">
                {document.statements.map((stmt) => (
                  <button
                    key={stmt.id}
                    type="button"
                    onClick={() => setActiveTab(stmt.id)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition ${
                      (activeTab === 'all' && stmt === document.statements[0]) || activeTab === stmt.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    {stmt.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-900/40 px-6 py-3">
              <div className="relative min-w-[280px] flex-1 max-w-md">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter line items (e.g. revenue, depreciation, tax)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Period: {activeStatement?.period}</span>
                <span>Unit: {document.unit || 'USD (M)'}</span>
              </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
              {activeStatement ? (
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="sticky left-0 bg-slate-950/95 px-6 py-3.5 font-bold backdrop-blur">
                        {activeStatement.stubLabel || 'Financial Statement Line Item'}
                      </th>
                      {activeStatement.columns.map((col, idx) => (
                        <th key={`${col.id}-${idx}`} className="px-5 py-3.5 text-right font-bold">
                          {col.label}
                        </th>
                      ))}
                      {showVariance && activeStatement.columns.length >= 2 && (
                        <th className="px-5 py-3.5 text-right font-bold text-purple-400">
                          YoY Variance
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredRows.map((row) => {
                      if (row.kind === 'section') {
                        return (
                          <tr key={row.id} className="bg-slate-900/90 text-amber-300 font-bold">
                            <td
                              colSpan={
                                activeStatement.columns.length +
                                1 +
                                (showVariance && activeStatement.columns.length >= 2 ? 1 : 0)
                              }
                              className="px-6 py-2.5 text-[11px] uppercase tracking-wider text-amber-400/90"
                            >
                              {row.label}
                            </td>
                          </tr>
                        );
                      }

                      const num0 = parseFinancialNumber(row.cells[0]);
                      const num1 = parseFinancialNumber(row.cells[1]);
                      const varDiff = num1 !== 0 ? ((num0 - num1) / Math.abs(num1)) * 100 : null;

                      const isTotal = row.kind === 'total';

                      return (
                        <tr
                          key={row.id}
                          className={`group transition hover:bg-purple-500/5 ${
                            isTotal
                              ? 'bg-slate-900/60 font-bold text-white border-t-2 border-slate-700'
                              : 'text-slate-300'
                          }`}
                        >
                          <td
                            className={`sticky left-0 bg-inherit px-6 py-3 font-sans transition group-hover:bg-slate-900/95 backdrop-blur ${
                              isTotal ? 'font-bold text-white' : 'font-medium'
                            }`}
                          >
                            {row.label}
                          </td>

                          {row.cells.map((cell, cIdx) => (
                            <td
                              key={`${row.id}-${cIdx}`}
                              className={`px-5 py-3 text-right tabular-nums ${
                                cIdx === 0 && !isTotal ? 'text-slate-100 font-bold' : ''
                              }`}
                            >
                              {cell || '—'}
                            </td>
                          ))}

                          {showVariance && activeStatement.columns.length >= 2 && (
                            <td className="px-5 py-3 text-right font-mono tabular-nums">
                              {varDiff !== null && !isNaN(varDiff) ? (
                                <span
                                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                                    varDiff > 0
                                      ? 'text-emerald-400'
                                      : varDiff < 0
                                      ? 'text-rose-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {varDiff > 0 ? '+' : ''}
                                  {varDiff.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  No statement figures available.
                </div>
              )}
            </div>

            {/* Explorer Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 bg-slate-950/60 px-6 py-3.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Audited under International Financial Reporting Standards (IFRS)
              </span>
              <span>Showing {filteredRows.length} line items</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. STATUTORY FOOTNOTES & ACCOUNTING POLICIES
      ───────────────────────────────────────────────────────────── */}
      {document.notes && document.notes.length > 0 && (
        <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-12 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-7xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Notes to the Financial Results &amp; Statutory Disclosures
            </h3>
            <div className="grid gap-3 md:grid-cols-2 text-xs text-slate-400 leading-relaxed">
              {document.notes.map((note, nIdx) => (
                <div
                  key={nIdx}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4"
                >
                  <p className="font-mono text-purple-400 font-bold mb-1">[{nIdx + 1}]</p>
                  <p>{note}</p>
                </div>
              ))}
            </div>
          </div>
        </footer>
      )}
    </article>
  );
}
