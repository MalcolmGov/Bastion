'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Check,
  Sparkles,
  Sliders,
  RotateCcw,
  LayoutGrid,
  CheckSquare,
  Square,
  Eye,
  SlidersHorizontal,
  Activity,
  Layers,
  Calendar,
  Send,
  ShieldCheck,
  Globe,
  Compass,
  FileSpreadsheet,
  Newspaper,
  Leaf
} from 'lucide-react';
import { useStudioWorkspace } from './StudioWorkspaceProvider';

export interface DashboardPreferences {
  primaryColor: string;
  accentColor: string;
  colorPresetId: string;
  kpis: {
    totalWebsites: boolean;
    liveWebsites: boolean;
    upcomingSens: boolean;
    awaitingSignoff: boolean;
    draftRevisions: boolean;
    edgeLatency: boolean;
    // Client CMS Specific KPIs
    clientMiningOps?: boolean;
    clientSensReleases?: boolean;
    clientFinancialReports?: boolean;
    clientEsgTargets?: boolean;
    clientPendingSignoff?: boolean;
    clientLiveSla?: boolean;
  };
  sections: {
    heroComposer: boolean;
    managedCards: boolean;
    calendarPipeline: boolean;
    brandDnaExtractor: boolean;
    edgeNetworkStatus: boolean;
    // Client CMS Specific Sections
    clientReviewAlert?: boolean;
    clientDiagnosticsBar?: boolean;
    clientActionCards?: boolean;
    clientRecentFeed?: boolean;
  };
  layoutMode: 'standard' | 'compact' | 'focus';
}

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  primaryColor: '#7C3AED',
  accentColor: '#9333EA',
  colorPresetId: 'bastion-purple',
  kpis: {
    totalWebsites: true,
    liveWebsites: true,
    upcomingSens: true,
    awaitingSignoff: true,
    draftRevisions: true,
    edgeLatency: true,
    clientMiningOps: true,
    clientSensReleases: true,
    clientFinancialReports: true,
    clientEsgTargets: true,
    clientPendingSignoff: true,
    clientLiveSla: true
  },
  sections: {
    heroComposer: true,
    managedCards: true,
    calendarPipeline: true,
    brandDnaExtractor: true,
    edgeNetworkStatus: true,
    clientReviewAlert: true,
    clientDiagnosticsBar: true,
    clientActionCards: true,
    clientRecentFeed: true
  },
  layoutMode: 'standard'
};

export const COLOR_PRESETS = [
  {
    id: 'bastion-purple',
    name: 'Bastion Royal Purple (Zara CareerOS)',
    clientExample: 'Flagship Platform Default',
    primary: '#7C3AED',
    accent: '#9333EA'
  },
  {
    id: 'goldfields-gold',
    name: 'Gold Fields Sovereign Gold',
    clientExample: 'Mining, Resources & Institutional Flagship',
    primary: '#C99700',
    accent: '#EAB308'
  },
  {
    id: 'sapphire-corporate',
    name: 'Sapphire Corporate',
    clientExample: 'Discovery Bank & Institutional Advisory',
    primary: '#2563EB',
    accent: '#38BDF8'
  },
  {
    id: 'emerald-wealth',
    name: 'Emerald Wealth & ESG',
    clientExample: 'Sustainability, 2030 ESG & Green Capital',
    primary: '#059669',
    accent: '#10B981'
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    clientExample: 'Energy, Logistics & African Infrastructure',
    primary: '#EA580C',
    accent: '#F97316'
  },
  {
    id: 'cyber-violet',
    name: 'Cyberpunk Violet',
    clientExample: 'AI Labs & Autonomous Systems',
    primary: '#9333EA',
    accent: '#C084FC'
  },
  {
    id: 'obsidian-slate',
    name: 'Obsidian Minimal',
    clientExample: 'Private Equity & Boardroom Governance',
    primary: '#334155',
    accent: '#64748B'
  }
];

interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: DashboardPreferences;
  onSavePreferences: (prefs: DashboardPreferences) => void;
}

export function DashboardCustomizeModal({
  isOpen,
  onClose,
  preferences,
  onSavePreferences
}: DashboardCustomizeModalProps) {
  const { portalViewMode, activeClient } = useStudioWorkspace();
  const isClientMode = portalViewMode === 'client';
  const isGoldFields = activeClient?.id === 'client_goldfields';

  const [localPrefs, setLocalPrefs] = useState<DashboardPreferences>(preferences);
  const [activeTab, setActiveTab] = useState<'theme' | 'kpis' | 'sections' | 'layout'>('theme');

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    const updated = {
      ...localPrefs,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      colorPresetId: preset.id
    };
    setLocalPrefs(updated);
    onSavePreferences(updated);
  };

  const handleCustomColor = (key: 'primaryColor' | 'accentColor', val: string) => {
    const updated = {
      ...localPrefs,
      [key]: val,
      colorPresetId: 'custom'
    };
    setLocalPrefs(updated);
    onSavePreferences(updated);
  };

  const toggleKpi = (key: keyof DashboardPreferences['kpis']) => {
    const updated = {
      ...localPrefs,
      kpis: {
        ...localPrefs.kpis,
        [key]: !localPrefs.kpis[key]
      }
    };
    setLocalPrefs(updated);
    onSavePreferences(updated);
  };

  const toggleSection = (key: keyof DashboardPreferences['sections']) => {
    const updated = {
      ...localPrefs,
      sections: {
        ...localPrefs.sections,
        [key]: !localPrefs.sections[key]
      }
    };
    setLocalPrefs(updated);
    onSavePreferences(updated);
  };

  const handleReset = () => {
    if (isClientMode && isGoldFields) {
      const gfDefault: DashboardPreferences = {
        ...DEFAULT_DASHBOARD_PREFERENCES,
        primaryColor: '#C99700',
        accentColor: '#EAB308',
        colorPresetId: 'goldfields-gold'
      };
      setLocalPrefs(gfDefault);
      onSavePreferences(gfDefault);
    } else {
      setLocalPrefs(DEFAULT_DASHBOARD_PREFERENCES);
      onSavePreferences(DEFAULT_DASHBOARD_PREFERENCES);
    }
  };

  const primaryCol = localPrefs.primaryColor || '#7C3AED';
  const accentCol = localPrefs.accentColor || '#9333EA';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{
                background: `linear-gradient(135deg, ${primaryCol}, ${accentCol})`,
                boxShadow: `0 4px 12px ${primaryCol}40`
              }}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isClientMode ? `Customize ${activeClient?.name || 'Corporate'} CMS Portal` : 'Customize Dashboard & Platform'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isClientMode 
                  ? `Tailor ${activeClient?.name || 'Corporate'} brand identity colors, client KPI visibility & modules` 
                  : 'Tailor platform colors, operational KPIs, layout modules & card preferences'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-white dark:bg-[#0F141C] gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            style={activeTab === 'theme' ? { borderBottomColor: primaryCol, color: primaryCol } : undefined}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'theme'
                ? ''
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Brand &amp; Accent Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            style={activeTab === 'kpis' ? { borderBottomColor: primaryCol, color: primaryCol } : undefined}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'kpis'
                ? ''
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isClientMode ? 'Portal KPI Cards' : 'KPI Metric Cards'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            style={activeTab === 'sections' ? { borderBottomColor: primaryCol, color: primaryCol } : undefined}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'sections'
                ? ''
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isClientMode ? 'Portal Modules' : 'Dashboard Sections'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            style={activeTab === 'layout' ? { borderBottomColor: primaryCol, color: primaryCol } : undefined}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'layout'
                ? ''
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Layout &amp; Density</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: Theme & Colors */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Highlight Client's Official Identity if in Client Mode */}
              {isClientMode && isGoldFields && (
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/40 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C99700] text-white flex items-center justify-center font-black text-sm shadow-md">
                      GF
                    </div>
                    <div>
                      <div className="font-black text-sm text-amber-950 dark:text-amber-200">
                        Official Gold Fields Corporate Brand
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        Sovereign Gold (#C99700) &bull; Deep Gold (#EAB308)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset({
                      id: 'goldfields-gold',
                      name: 'Gold Fields Sovereign Gold',
                      clientExample: 'Mining, Resources & Institutional Flagship',
                      primary: '#C99700',
                      accent: '#EAB308'
                    })}
                    className="px-3.5 py-2 rounded-xl bg-[#C99700] hover:bg-[#B38600] text-white font-black text-xs transition shadow-sm cursor-pointer shrink-0"
                  >
                    Apply Gold Fields Brand
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Curated Corporate Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = localPrefs.colorPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        style={isSelected ? {
                          borderColor: primaryCol,
                          boxShadow: `0 0 0 1px ${primaryCol}`
                        } : undefined}
                        className={`p-3 rounded-xl border text-left transition relative flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-50 dark:bg-slate-800/80 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex -space-x-1 shrink-0">
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0F141C] shadow-xs" 
                            style={{ backgroundColor: preset.primary }} 
                          />
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-white dark:border-[#0F141C] shadow-xs" 
                            style={{ backgroundColor: preset.accent }} 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{preset.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{preset.clientExample}</div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 shrink-0" style={{ color: primaryCol }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: primaryCol }} />
                  <span>Custom Hex Colors</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Primary Brand Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localPrefs.primaryColor}
                        onChange={(e) => handleCustomColor('primaryColor', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={localPrefs.primaryColor}
                        onChange={(e) => handleCustomColor('primaryColor', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Secondary Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={localPrefs.accentColor}
                        onChange={(e) => handleCustomColor('accentColor', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={localPrefs.accentColor}
                        onChange={(e) => handleCustomColor('accentColor', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KPI Metrics */}
          {activeTab === 'kpis' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {isClientMode 
                  ? `Select which ${activeClient?.name || 'corporate'} metric tiles and indicators appear in your CMS:`
                  : 'Select which operational metrics appear in your agency intelligence strip:'}
              </p>

              <div className="space-y-2">
                {(isClientMode ? [
                  { key: 'clientMiningOps', label: isGoldFields ? 'Mining Operations & Projects (10 Mines)' : 'Core Services & Operations', desc: 'Active production sites, operational status, and team figures' },
                  { key: 'clientSensReleases', label: isGoldFields ? 'SENS Announcements & Regulatory Filings' : 'News & Announcements', desc: 'Upcoming scheduled releases and regulatory publishing countdown' },
                  { key: 'clientFinancialReports', label: isGoldFields ? 'Integrated Financial Reports & Results Packs' : 'Reports & Downloads', desc: 'Investor pack downloads, quarterly statements, and annual reports' },
                  { key: 'clientEsgTargets', label: isGoldFields ? '2030 ESG Sustainability & Safety Targets' : 'Company Highlights & Credentials', desc: 'Environmental, safety, and sustainable mining goals' },
                  { key: 'clientPendingSignoff', label: 'Draft Revisions Awaiting Sign-Off', desc: 'Alert banner when content has been prepared for executive approval' },
                  { key: 'clientLiveSla', label: 'Production Live Status & CDN Cache (<500ms)', desc: 'Real-time CDN cache validation and SSL certificate status' }
                ] : [
                  { key: 'totalWebsites', label: 'Total Websites Count', desc: 'Number of active hosted corporate websites across all client tenants' },
                  { key: 'liveWebsites', label: 'Live & Healthy Status', desc: 'Websites successfully cached on edge with active SSL' },
                  { key: 'upcomingSens', label: 'Upcoming SENS Regulatory Release', desc: 'Scheduled regulatory publishing countdown for Gold Fields' },
                  { key: 'awaitingSignoff', label: 'Awaiting Sign-Off Count', desc: 'Revisions submitted by client editors pending agency approval' },
                  { key: 'draftRevisions', label: 'Active Draft Revisions', desc: 'Unpublished drafts currently being edited in visual studio' },
                  { key: 'edgeLatency', label: 'Edge Latency & Network Speed', desc: 'Real-time global edge node round-trip time in milliseconds' }
                ]).map(({ key, label, desc }) => {
                  const isChecked = !!localPrefs.kpis[key as keyof DashboardPreferences['kpis']];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleKpi(key as keyof DashboardPreferences['kpis'])}
                      style={isChecked ? {
                        borderColor: `${primaryCol}50`,
                        backgroundColor: `${primaryCol}08`
                      } : undefined}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? ''
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{label}</span>
                          {isChecked && (
                            <span 
                              style={{
                                backgroundColor: `${primaryCol}20`,
                                color: primaryCol
                              }}
                              className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                            >
                              Visible
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                      </div>
                      <div className="shrink-0">
                        {isChecked ? (
                          <div 
                            style={{ backgroundColor: primaryCol }}
                            className="w-5 h-5 rounded-md text-white flex items-center justify-center shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Dashboard Sections */}
          {activeTab === 'sections' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                {isClientMode
                  ? `Toggle visibility for ${activeClient?.name || 'corporate'} CMS workspace modules:`
                  : 'Toggle main overview dashboard panels and workflow modules:'}
              </p>

              <div className="space-y-2">
                {(isClientMode ? [
                  { key: 'clientReviewAlert', label: 'Draft Revisions Awaiting Sign-Off Alert Panel', desc: 'Prominent attention card for pending executive approvals' },
                  { key: 'clientDiagnosticsBar', label: 'SSL, CDN & Bastion Sync Diagnostics Bar', desc: 'Domain verification and edge cache round-trip time' },
                  { key: 'clientActionCards', label: 'Action Cards: What Would You Like to Update?', desc: 'Visual cards linking to Pages, Editor, Announcements, Operations and Media' },
                  { key: 'clientRecentFeed', label: 'Recent Publishing Timeline & Audit Feed', desc: 'Chronological list of recent live website publications' }
                ] : [
                  { key: 'heroComposer', label: 'Signature Search & Voice Composer Hero', desc: 'Executive greeting, voice search, and instant keyword filter pill' },
                  { key: 'managedCards', label: 'Managed Corporate Properties Grid', desc: 'Interactive client website cards with edge status and direct edit buttons' },
                  { key: 'calendarPipeline', label: 'Publishing Pipeline Calendar Card', desc: 'Upcoming scheduled releases and regulatory sign-off approvals' },
                  { key: 'brandDnaExtractor', label: 'Brand DNA Quick Launch Module', desc: 'One-click website crawler and design system generator' },
                  { key: 'edgeNetworkStatus', label: 'Global Edge Network Nodes', desc: 'Live round-trip latency across Johannesburg, London, and Frankfurt' }
                ]).map(({ key, label, desc }) => {
                  const isChecked = !!localPrefs.sections[key as keyof DashboardPreferences['sections']];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleSection(key as keyof DashboardPreferences['sections'])}
                      style={isChecked ? {
                        borderColor: `${primaryCol}50`,
                        backgroundColor: `${primaryCol}08`
                      } : undefined}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? ''
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                      </div>
                      <div className="shrink-0">
                        {isChecked ? (
                          <div 
                            style={{ backgroundColor: primaryCol }}
                            className="w-5 h-5 rounded-md text-white flex items-center justify-center shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Layout Density */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {isClientMode ? 'Corporate Portal Spacing & Density' : 'Dashboard View Density'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'standard', name: 'Standard (Zara CareerOS)', desc: 'Comfortable spacing, 2-column split (8/4)' },
                  { id: 'compact', name: 'Compact Dense', desc: 'Tighter cards for high-density multi-tenant monitoring' },
                  { id: 'focus', name: 'Focus Single Rail', desc: 'Full width cards prioritizing content editing' }
                ].map(({ id, name, desc }) => {
                  const isSelected = localPrefs.layoutMode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        const updated = { ...localPrefs, layoutMode: id as any };
                        setLocalPrefs(updated);
                        onSavePreferences(updated);
                      }}
                      style={isSelected ? {
                        borderColor: primaryCol,
                        boxShadow: `0 0 0 1px ${primaryCol}`
                      } : undefined}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-50 dark:bg-slate-800/80 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">{name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isClientMode && isGoldFields ? 'Reset to Gold Fields Brand' : 'Reset to Defaults'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: `linear-gradient(135deg, ${primaryCol}, ${accentCol})`,
              boxShadow: `0 4px 12px ${primaryCol}30`
            }}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition hover:opacity-90 cursor-pointer"
          >
            Done Customizing
          </button>
        </div>
      </div>
    </div>
  );
}
