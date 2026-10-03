'use client';

import React, { useState } from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import {
  getFontFamilyClass,
  getHeadingScaleClass,
  getTrackingClass,
  getAlignmentClasses,
  getContainerWidthClass,
  getBorderRadiusClass,
  getGlowEffectStyles,
  getFrostedGlassStyle,
} from '@/lib/studio/styleResolver';
import { StudioBackgroundFx } from './StudioBackgroundFx';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  Zap,
  Droplet,
  HeartHandshake,
  BarChart3,
  Calendar,
  Layers
} from 'lucide-react';

export interface FinancialMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
}

export interface FinancialTableRow {
  metric: string;
  current: string;
  prior: string;
  variance: string;
  trend?: 'up' | 'down' | 'neutral';
  note?: string;
}

export interface SustainabilityMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon?: string;
}

export interface FinancialHighlightsProps {
  props: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    reportingPeriod?: string;
    kpis?: FinancialMetric[];
    financialTable?: {
      headers?: string[];
      rows?: FinancialTableRow[];
    };
    sustainabilityKpis?: SustainabilityMetric[];
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioFinancialHighlights({
  props,
  styles,
  collection = 'contemporary',
  variant = 'scorecard_table',
}: FinancialHighlightsProps) {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'table' | 'esg'>('scorecard');

  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B' ||
    styles?.backgroundColor === '#070B12' ||
    styles?.backgroundColor === '#05080F' ||
    styles?.backgroundColor === '#0B132B' ||
    !styles?.backgroundColor
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? '#070B12' : '#F8FAFC');
  const effectiveTextColor = styles?.textColor || (isDarkMode ? '#F8FAFC' : '#0F172A');
  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-sans';

  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'left');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const borderRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-2xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  const accentHex = styles?.accentColor || (isImmersive ? '#F59E0B' : isEditorial ? '#92400E' : '#2563EB');

  const sectionStyle: React.CSSProperties = {
    backgroundColor: effectiveBg,
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    color: effectiveTextColor,
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
    ...glowStyle,
    ...frostedGlassStyle,
  };

  const paddingClass = styles?.paddingY || 'py-20 md:py-28';

  // Fallback KPIs if none provided
  const kpis: FinancialMetric[] =
    props.kpis && props.kpis.length > 0
      ? props.kpis
      : [
          { label: 'Attributable Production', value: '2.30 Moz', change: '+4.2% YoY', trend: 'up', subtext: 'Record operational mine delivery' },
          { label: 'Headline Earnings', value: 'R22.4 Billion', change: '+12.4% YoY', trend: 'up', subtext: 'Driven by corporate trade finance' },
          { label: 'Return on Equity (ROE)', value: '18.8%', change: '+80 bps', trend: 'up', subtext: 'Within 17%–20% medium-term target' },
          { label: 'All-In Sustaining Costs', value: '$1,280 /oz', change: '-3.5% vs budget', trend: 'down', subtext: 'Disciplined capital execution' },
        ];

  // Fallback table rows if none provided
  const tableRows: FinancialTableRow[] =
    props.financialTable?.rows && props.financialTable.rows.length > 0
      ? props.financialTable.rows
      : [
          { metric: 'Revenue / Turnover', current: 'R184.2 Billion', prior: 'R162.8 Billion', variance: '+13.1%', trend: 'up', note: 'Strong operational volume growth' },
          { metric: 'Headline Earnings', current: 'R42.9 Billion', prior: 'R38.2 Billion', variance: '+12.3%', trend: 'up', note: 'Operating positive jaws across divisions' },
          { metric: 'Operating Margin / EBITDA', current: '42.6%', prior: '39.8%', variance: '+280 bps', trend: 'up', note: 'Group cost-to-income improvement' },
          { metric: 'Adjusted Free Cash Flow', current: '$920 Million', prior: '$718 Million', variance: '+28.1%', trend: 'up', note: 'Elevated commodity and pricing realization' },
          { metric: 'Ordinary Dividend Per Share', current: '740 cps', prior: '680 cps', variance: '+8.8%', trend: 'up', note: '55% progressive payout ratio' },
          { metric: 'Net Debt to EBITDA', current: '0.28x', prior: '0.42x', variance: '-0.14x', trend: 'down', note: 'Prudent balance sheet de-leveraging' },
        ];

  // Fallback ESG KPIs
  const esgKpis: SustainabilityMetric[] =
    props.sustainabilityKpis && props.sustainabilityKpis.length > 0
      ? props.sustainabilityKpis
      : [
          { label: 'Scope 1 & 2 GHG Reduction', value: '-38%', change: 'vs baseline', trend: 'down', subtext: 'On track for 2040 net zero operational target', icon: 'zap' },
          { label: 'Renewable Power Share', value: '52% Grid', change: '+14% Decarbonisation', trend: 'up', subtext: '50MW solar microgrid and storage active', icon: 'zap' },
          { label: 'Process Water Recycled', value: '84% Volume', change: '+6% efficiency', trend: 'up', subtext: 'Zero-water dry tailings processing', icon: 'droplet' },
          { label: 'Local Host Community Spend', value: 'R18.4 Billion', change: '+16% local content', trend: 'up', subtext: 'Direct local procurement and enterprise funding', icon: 'handshake' },
        ];

  const cardBgClass = isDarkMode
    ? 'bg-[#0B132B]/80 border border-white/10 text-white shadow-xl shadow-black/20'
    : 'bg-white border border-slate-200 text-slate-900 shadow-sm';

  const innerPillBgClass = isDarkMode
    ? 'bg-white/5 border border-white/10 text-slate-300'
    : 'bg-slate-50 border border-slate-100 text-slate-700';

  return (
    <section
      style={sectionStyle}
      className={`relative overflow-hidden ${paddingClass} px-6 transition-colors border-b ${
        isDarkMode ? 'border-white/10' : 'border-slate-200'
      }`}
    >
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={accentHex}
      />

      <div className={`${containerWidthClass} mx-auto space-y-12 relative z-10`}>
        {/* Header Block */}
        <div className={`max-w-3xl space-y-4 ${alignClass.container}`}>
          <div className="flex flex-wrap items-center gap-3">
            {props.eyebrow && (
              <span
                style={{ color: accentHex, borderColor: `${accentHex}33` }}
                className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-white/5"
              >
                {props.eyebrow}
              </span>
            )}
            {props.reportingPeriod && (
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {props.reportingPeriod}
              </span>
            )}
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Audited Financials
            </span>
          </div>

          <h2
            style={styles?.headingColor ? { color: styles.headingColor } : undefined}
            className={`${fontFamilyClass} ${headingScaleClass} font-bold ${trackingClass} ${alignClass.text}`}
          >
            {props.title}
          </h2>

          {props.subtitle && (
            <p
              style={styles?.textColor ? { color: styles.textColor } : undefined}
              className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {props.subtitle}
            </p>
          )}

          {/* Interactive Mode Tabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('scorecard')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'scorecard'
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Key Scorecards
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'table'
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Multi-Year Statement Table
            </button>
            <button
              onClick={() => setActiveTab('esg')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'esg'
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              ESG & Decarbonisation
            </button>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE KPI SCORECARDS */}
        {activeTab === 'scorecard' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => {
              const isUp = kpi.trend === 'up';
              const isDown = kpi.trend === 'down';
              return (
                <div
                  key={idx}
                  className={`p-6 ${borderRadiusClass} ${cardBgClass} flex flex-col justify-between space-y-4 transition hover:border-white/20`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium tracking-wide uppercase text-[11px]">{kpi.label}</span>
                      {kpi.change && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isDown
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {kpi.change}
                        </span>
                      )}
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: styles?.headingColor || '#FFFFFF' }}>
                      {kpi.value}
                    </div>
                  </div>

                  {kpi.subtext && (
                    <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${innerPillBgClass}`}>
                      {kpi.subtext}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: MULTI-YEAR COMPARISON TABLE */}
        {activeTab === 'table' && (
          <div className={`${borderRadiusClass} ${cardBgClass} overflow-hidden shadow-2xl`}>
            <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Audited Financial Performance Summary</h3>
                <p className="text-xs text-slate-400">Comparative figures reported in accordance with IFRS and JSE Listing Requirements.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="#export-data"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Excel Data Book
                </a>
                <a
                  href="#download-pdf"
                  style={{ backgroundColor: accentHex }}
                  className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Audited PDF
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Metric / Performance Line Item</th>
                    <th className="py-4 px-6 text-right">FY 2025 (Current)</th>
                    <th className="py-4 px-6 text-right">FY 2024 (Prior)</th>
                    <th className="py-4 px-6 text-right">YoY Variance</th>
                    <th className="py-4 px-6">Operational Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tableRows.map((row, idx) => {
                    const isUp = row.variance.startsWith('+') || row.trend === 'up';
                    const isDown = row.variance.startsWith('-') || row.trend === 'down';
                    return (
                      <tr key={idx} className="hover:bg-white/[0.03] transition">
                        <td className="py-4 px-6 font-semibold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentHex }} />
                          {row.metric}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-white">{row.current}</td>
                        <td className="py-4 px-6 text-right font-mono text-slate-400">{row.prior}</td>
                        <td className="py-4 px-6 text-right font-mono">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              isUp
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isDown
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-500/10 text-slate-300'
                            }`}
                          >
                            {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : null}
                            {row.variance}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">{row.note || 'Audited group financial line item'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ESG & SUSTAINABILITY SCORECARD */}
        {activeTab === 'esg' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {esgKpis.map((esg, idx) => {
              return (
                <div
                  key={idx}
                  className={`p-6 ${borderRadiusClass} ${cardBgClass} flex flex-col justify-between space-y-4 transition`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        {esg.icon === 'droplet' ? (
                          <Droplet className="w-4 h-4" />
                        ) : esg.icon === 'handshake' ? (
                          <HeartHandshake className="w-4 h-4" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {esg.change}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{esg.label}</div>
                      <div className="text-3xl font-extrabold text-white mt-1">{esg.value}</div>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg text-xs leading-relaxed ${innerPillBgClass}`}>
                    {esg.subtext}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Bar */}
        {(props.primaryCta || props.secondaryCta) && (
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {props.primaryCta && (
              <a
                href={props.primaryCta.href}
                style={{ backgroundColor: accentHex }}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg shadow-black/20 hover:opacity-95 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {props.primaryCta.label}
              </a>
            )}
            {props.secondaryCta && (
              <a
                href={props.secondaryCta.href}
                className="px-6 py-3 rounded-xl font-bold text-sm text-slate-200 border border-white/10 hover:bg-white/5 transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                {props.secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
