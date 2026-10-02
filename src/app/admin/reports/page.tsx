'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';
import {
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Leaf,
  DollarSign,
  Download,
  Code2,
  Plus,
  Check,
  Layers,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';

interface MetricPoint {
  period: string;
  value: number;
  secondaryValue?: number;
  variancePct?: number;
}

interface MetricWidget {
  id: string;
  title: string;
  category: 'production' | 'financial' | 'esg' | 'safety';
  unit: string;
  currentValue: string;
  varianceLabel: string;
  isPositiveTrend: boolean;
  points: MetricPoint[];
  description: string;
}

const DEFAULT_METRIC_WIDGETS: MetricWidget[] = [
  {
    id: 'w_gold_prod',
    title: 'Group Gold Equivalent Production',
    category: 'production',
    unit: 'koz (Thousand Ounces)',
    currentValue: '615 koz',
    varianceLabel: '+4.2% vs Q2 2026',
    isPositiveTrend: true,
    description: 'Quarterly attributable gold production across South African, Australian, and Ghanaian operations.',
    points: [
      { period: 'Q4 2025', value: 585, variancePct: 1.2 },
      { period: 'Q1 2026', value: 578, variancePct: -1.2 },
      { period: 'Q2 2026', value: 590, variancePct: 2.1 },
      { period: 'Q3 2026', value: 615, variancePct: 4.2 },
    ]
  },
  {
    id: 'w_aisc',
    title: 'All-In Sustaining Costs (AISC)',
    category: 'financial',
    unit: 'USD / oz',
    currentValue: '$1,190 / oz',
    varianceLabel: '-2.1% Cost Optimization',
    isPositiveTrend: true,
    description: 'Disciplined cost curve maintaining top-quartile global capital efficiency.',
    points: [
      { period: 'Q4 2025', value: 1240, variancePct: -0.8 },
      { period: 'Q1 2026', value: 1225, variancePct: -1.2 },
      { period: 'Q2 2026', value: 1215, variancePct: -0.8 },
      { period: 'Q3 2026', value: 1190, variancePct: -2.1 },
    ]
  },
  {
    id: 'w_renewable_mix',
    title: 'Renewable Electricity Consumption',
    category: 'esg',
    unit: '% of Total Power',
    currentValue: '42.0%',
    varianceLabel: '+8.5% YoY Progress',
    isPositiveTrend: true,
    description: 'Solar microgrids and wind hybrid generation advancing toward 2030 50% target.',
    points: [
      { period: '2023', value: 24, variancePct: 4.0 },
      { period: '2024', value: 29, variancePct: 5.0 },
      { period: '2025', value: 36, variancePct: 7.0 },
      { period: '2026 YTD', value: 42, variancePct: 8.5 },
    ]
  },
  {
    id: 'w_safety_ltifr',
    title: 'Lost-Time Injury Frequency Rate (LTIFR)',
    category: 'safety',
    unit: 'Per Million Hours',
    currentValue: '1.05',
    varianceLabel: '-16% Incident Reduction',
    isPositiveTrend: true,
    description: 'Zero Harm culture benchmarked against ICMM global safety leadership standards.',
    points: [
      { period: '2023', value: 1.45, variancePct: -5.0 },
      { period: '2024', value: 1.30, variancePct: -10.3 },
      { period: '2025', value: 1.25, variancePct: -3.8 },
      { period: '2026 YTD', value: 1.05, variancePct: -16.0 },
    ]
  }
];

export default function AdminReportsPage() {
  const { activeClient } = useStudioWorkspace();
  const { primaryColor } = useDashboardCustomizer();

  const [activeTab, setActiveTab] = useState<'widgets' | 'publications'>('widgets');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<MetricWidget[]>(DEFAULT_METRIC_WIDGETS);
  const [selectedWidget, setSelectedWidget] = useState<MetricWidget>(DEFAULT_METRIC_WIDGETS[0]);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
        const res = await fetch(`/api/admin/content/reports${query}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeClient?.id]);

  // Export CSV for analysts
  const handleExportCsv = (widget: MetricWidget) => {
    const headers = ['Period', `Value (${widget.unit})`, 'YoY Variance (%)'];
    const rows = widget.points.map((p) => [p.period, p.value, p.variancePct ? `${p.variancePct}%` : 'N/A']);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${widget.title.replace(/[^a-zA-Z0-9]/g, '_')}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy React / HTML embed snippet
  const handleCopyEmbed = (widget: MetricWidget) => {
    const snippet = `<CorporateMetricCard title="${widget.title}" value="${widget.currentValue}" unit="${widget.unit}" trend="${widget.varianceLabel}" />`;
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(widget.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="p-6 md:p-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0A0D14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div 
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold shadow-xs"
              >
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Financial Results &amp; Corporate Metrics Hub
                </h1>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Publish Integrated Annual Reports (PDF) and build interactive, branded financial &amp; ESG metric widgets.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-slate-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('widgets')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'widgets'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
              <span>Interactive Metric Widgets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('publications')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'publications'
                  ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>Annual Reports &amp; Booklets ({records.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'widgets' ? (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
          {/* Top 4 Spotlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {widgets.map((w) => {
              const isSelected = selectedWidget.id === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWidget(w)}
                  className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-50/90 dark:bg-[#151D2E] border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                      : 'bg-white dark:bg-[#0D121B] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      {w.category}
                    </span>
                    {w.isPositiveTrend ? (
                      <span className="text-emerald-500 flex items-center font-bold text-[11px]">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {w.varianceLabel}
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center font-bold text-[11px]">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {w.varianceLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {w.currentValue}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {w.title}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    Unit: {w.unit}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Chart Simulator & Code Builder Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0D121B] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Live Data Visualizer
                  </span>
                  <span className="text-xs text-slate-400">&bull; {selectedWidget.unit}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedWidget.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedWidget.description}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => handleExportCsv(selectedWidget)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#141C2A] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyEmbed(selectedWidget)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center space-x-1.5 transition hover:opacity-90 cursor-pointer shadow-xs"
                >
                  {copiedCodeId === selectedWidget.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Snippet!</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Copy Embed Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive SVG Bar & Trend Chart */}
            <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-[#070B10] border border-slate-200/60 dark:border-slate-800/80">
              <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4">
                {selectedWidget.points.map((pt, idx) => {
                  const maxVal = Math.max(...selectedWidget.points.map((p) => p.value));
                  const heightPct = Math.round((pt.value / (maxVal * 1.15)) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md font-mono whitespace-nowrap">
                        {pt.value} {selectedWidget.unit}
                      </div>

                      {/* Bar Container */}
                      <div className="w-full max-w-[70px] bg-slate-200/80 dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col justify-end h-full">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full rounded-xl bg-gradient-to-t from-sky-600 to-sky-400 group-hover:from-sky-500 group-hover:to-cyan-300 transition-all duration-300 shadow-sm"
                        />
                      </div>

                      <div className="text-center pt-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {pt.period}
                        </span>
                        <div className="text-[11px] font-mono text-slate-500">
                          {pt.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Data Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Reporting Period</th>
                    <th className="py-2.5 px-3">Audited Metric ({selectedWidget.unit})</th>
                    <th className="py-2.5 px-3">YoY Variance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {selectedWidget.points.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {pt.period}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {pt.value}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {pt.variancePct ? `+${pt.variancePct}%` : 'Baseline'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          Audited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Publications & Integrated Reports Tab */
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <DataTable
              title="Corporate Reports & Financial Results"
              collection="reports"
              description="Quarterly booklets, audited annual financial statements, climate reports, and mineral resource disclosures subject to strict compliance review and two-person sign-off."
              records={records}
              createUrl="/admin/reports/new"
            />
          )}
        </div>
      )}
    </div>
  );
}
