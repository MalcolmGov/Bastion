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
  Globe
} from 'lucide-react';

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
  };
  sections: {
    heroComposer: boolean;
    managedCards: boolean;
    calendarPipeline: boolean;
    brandDnaExtractor: boolean;
    edgeNetworkStatus: boolean;
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
    edgeLatency: true
  },
  sections: {
    heroComposer: true,
    managedCards: true,
    calendarPipeline: true,
    brandDnaExtractor: true,
    edgeNetworkStatus: true
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
    setLocalPrefs(DEFAULT_DASHBOARD_PREFERENCES);
    onSavePreferences(DEFAULT_DASHBOARD_PREFERENCES);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: localPrefs.primaryColor }}
            >
              <SlidersHorizontal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Customize Dashboard &amp; Theme</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailor corporate colors, KPI visibility, layout modules &amp; card preferences
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-white dark:bg-[#0F141C] gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Brand &amp; Accent Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kpis')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'kpis'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>KPI Metric Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sections'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard Sections</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'layout'
                ? 'border-[#7C3AED] text-[#7C3AED] dark:text-purple-400'
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
                        className={`p-3 rounded-xl border text-left transition relative flex items-center gap-3 ${
                          isSelected
                            ? 'bg-purple-50/50 dark:bg-purple-950/40 border-[#7C3AED] ring-1 ring-[#7C3AED]'
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
                          <Check className="w-4 h-4 text-[#7C3AED] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#7C3AED]" />
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
                Select which operational metrics appear in your top intelligence strip:
              </p>
              <div className="space-y-2">
                {[
                  { key: 'totalWebsites', label: 'Total Websites Count', desc: 'Number of active hosted corporate websites across all client tenants' },
                  { key: 'liveWebsites', label: 'Live & Healthy Status', desc: 'Websites successfully cached on edge with active SSL' },
                  { key: 'upcomingSens', label: 'Upcoming SENS Regulatory Release', desc: 'Scheduled regulatory publishing countdown for Gold Fields' },
                  { key: 'awaitingSignoff', label: 'Awaiting Sign-Off Count', desc: 'Revisions submitted by client editors pending agency approval' },
                  { key: 'draftRevisions', label: 'Active Draft Revisions', desc: 'Unpublished drafts currently being edited in visual studio' },
                  { key: 'edgeLatency', label: 'Edge Latency & Network Speed', desc: 'Real-time global edge node round-trip time in milliseconds' }
                ].map(({ key, label, desc }) => {
                  const isChecked = localPrefs.kpis[key as keyof DashboardPreferences['kpis']];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleKpi(key as keyof DashboardPreferences['kpis'])}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-50/40 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{label}</span>
                          {isChecked && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                      </div>
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-[#7C3AED] text-white flex items-center justify-center">
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
                Toggle main overview dashboard panels and workflow modules:
              </p>
              <div className="space-y-2">
                {[
                  { key: 'heroComposer', label: 'Signature Search & Voice Composer Hero', desc: 'Executive greeting, voice search, and instant keyword filter pill' },
                  { key: 'managedCards', label: 'Managed Corporate Properties Grid', desc: 'Interactive client website cards with edge status and direct edit buttons' },
                  { key: 'calendarPipeline', label: 'Publishing Pipeline Calendar Card', desc: 'Upcoming scheduled releases and regulatory sign-off approvals' },
                  { key: 'brandDnaExtractor', label: 'Brand DNA Quick Launch Module', desc: 'One-click website crawler and design system generator' },
                  { key: 'edgeNetworkStatus', label: 'Global Edge Network Nodes', desc: 'Live round-trip latency across Johannesburg, London, and Frankfurt' }
                ].map(({ key, label, desc }) => {
                  const isChecked = localPrefs.sections[key as keyof DashboardPreferences['sections']];
                  return (
                    <div
                      key={key}
                      onClick={() => toggleSection(key as keyof DashboardPreferences['sections'])}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-50/40 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
                      </div>
                      <div className="shrink-0">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-[#7C3AED] text-white flex items-center justify-center">
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

          {/* TAB 4: Layout & Density */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Dashboard View Density
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
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-purple-50/50 dark:bg-purple-950/40 border-[#7C3AED] ring-1 ring-[#7C3AED]'
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
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: localPrefs.primaryColor }}
            className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md transition hover:opacity-90"
          >
            Done Customizing
          </button>
        </div>
      </div>
    </div>
  );
}
