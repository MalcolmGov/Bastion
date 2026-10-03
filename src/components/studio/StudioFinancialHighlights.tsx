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

  const kpis: FinancialMetric[] = props.kpis || [];
  const tableRows: FinancialTableRow[] = props.financialTable?.rows || [];
  const esgKpis: SustainabilityMetric[] = props.sustainabilityKpis || [];

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
              Financial figures
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

        {activeTab === 'scorecard' && !kpis.length && <p className="rounded-xl border border-white/10 p-6 text-sm text-slate-400">No financial figures were extracted. Add values verified against the source report.</p>}
        {activeTab === 'table' && !tableRows.length && <p className="text-sm text-slate-400">No source table rows have been supplied.</p>}
        {activeTab === 'esg' && !esgKpis.length && <p className="text-sm text-slate-400">No verified sustainability figures have been supplied.</p>}
        {/* TAB 2: MULTI-YEAR COMPARISON TABLE */}
        {activeTab === 'table' && (
          <div className={`${borderRadiusClass} ${cardBgClass} overflow-hidden shadow-2xl`}>
            <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Financial performance summary</h3>
                <p className="text-xs text-slate-400">Confirm values, units, periods and source disclosures before publication.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  aria-disabled="true" title="Data download is not configured"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Export unavailable
                </a>
                <a
                  aria-disabled="true" title="Source PDF download is not configured"
                  style={{ backgroundColor: accentHex }}
                  className="px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-md transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF unavailable
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Metric / Performance Line Item</th>
                    <th className="py-4 px-6 text-right">{props.financialTable?.headers?.[1] || 'Current period'}</th>
                    <th className="py-4 px-6 text-right">{props.financialTable?.headers?.[2] || 'Prior period'}</th>
                    <th className="py-4 px-6 text-right">{props.financialTable?.headers?.[3] || 'Change'}</th>
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
                        <td className="py-4 px-6 text-xs text-slate-400">{row.note || 'Source verification required'}</td>
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
