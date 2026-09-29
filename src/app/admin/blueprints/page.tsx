'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Palette,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building,
  Briefcase,
  Utensils,
  Pickaxe,
  TrendingUp,
  SunMedium,
  Cpu,
  HeartPulse,
  Scale,
  Compass,
  X,
  Eye,
  FileText,
  Check
} from 'lucide-react';
import { BLUEPRINTS, BlueprintDefinition } from '@/lib/studio/blueprints';
import { DESIGN_COLLECTIONS } from '@/lib/studio/collections';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';

export default function BlueprintsAndCollectionsPage() {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [inspectBlueprint, setInspectBlueprint] = useState<BlueprintDefinition | null>(null);

  const getBlueprintIcon = (id: string) => {
    switch (id) {
      case 'corporate':
        return <Building className="w-5 h-5 text-sky-400" />;
      case 'mining_resources':
        return <Pickaxe className="w-5 h-5 text-amber-400" />;
      case 'wealth_private_equity':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'renewable_energy':
        return <SunMedium className="w-5 h-5 text-teal-400" />;
      case 'enterprise_tech':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'healthcare':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'legal_advisory':
        return <Scale className="w-5 h-5 text-blue-400" />;
      case 'hospitality_living':
        return <Compass className="w-5 h-5 text-amber-300" />;
      default:
        return <Layers className="w-5 h-5 text-purple-400" />;
    }
  };

  const sectorFilters = [
    { id: 'all', label: 'All Templates (8)' },
    { id: 'mining_resources', label: 'Mining & Resources' },
    { id: 'wealth_private_equity', label: 'Private Equity & Wealth' },
    { id: 'renewable_energy', label: 'Renewable Energy' },
    { id: 'enterprise_tech', label: 'Enterprise Tech & AI' },
    { id: 'healthcare', label: 'Healthcare & Life Sciences' },
    { id: 'legal_advisory', label: 'Institutional Legal' },
    { id: 'hospitality_living', label: 'Luxury Living & Hospitality' },
    { id: 'corporate', label: 'Corporate Flagship' }
  ];

  const allBlueprints = Object.values(BLUEPRINTS);
  const filteredBlueprints =
    selectedSector === 'all'
      ? allBlueprints
      : allBlueprints.filter((bp) => bp.id === selectedSector);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              borderColor: `${primaryColor}40`
            }}
          >
            Bastion Studio Enterprise Architecture
          </span>
          <span className="text-slate-400 dark:text-slate-600">&bull;</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Pre-Built Corporate Website Templates &amp; Curated Collections
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5">
          Enterprise Website Blueprints &amp; Templates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Bastion Studio decouples structural information architecture (Blueprints) from visual treatments (Collections).
          Select any verified sector template to generate a complete corporate website with live regulatory tables,
          executive leadership structures, ESG telemetry, and verified responsive layouts.
        </p>
      </div>

      {/* Sector Filter Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex-wrap gap-1">
            {sectorFilters.map((tab) => {
              const isActive = selectedSector === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSector(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          borderLeft: `2px solid ${primaryColor}`
                        }
                      : undefined
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredBlueprints.length} of {allBlueprints.length} Templates
          </span>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((bp) => (
            <div
              key={bp.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                {/* Header Icon + Sector Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex items-center justify-center">
                    {getBlueprintIcon(bp.id)}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${bp.accentColor}15`,
                      color: bp.accentColor,
                      borderColor: `${bp.accentColor}40`
                    }}
                  >
                    {bp.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{bp.name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {bp.tagline}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {bp.description}
                </p>

                {/* Sample Stats Preview Pills */}
                {bp.sampleStats && bp.sampleStats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                    {bp.sampleStats.slice(0, 2).map((st, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42]"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {st.value}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{st.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default Page Tree */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Page Architecture ({bp.defaultPages.length} Pages)</span>
                    <span className="font-mono text-purple-500 dark:text-purple-400">
                      {bp.coreModules.length} Modules
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bp.defaultPages.slice(0, 5).map((p) => (
                      <span
                        key={p.slug}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141C2A] text-slate-700 dark:text-slate-300 font-mono"
                      >
                        /{p.slug}
                      </span>
                    ))}
                    {bp.defaultPages.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141C2A] text-slate-400 font-mono">
                        +{bp.defaultPages.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectBlueprint(bp)}
                  className="w-full py-2 rounded-xl bg-slate-50 dark:bg-[#141C2A] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Architecture</span>
                </button>

                <Link
                  href={`/admin/create?blueprint=${bp.id}`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                  }}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs hover:opacity-95"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Design Collections */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-violet-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3 Curated Design Collections
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Visual Styling &amp; Token Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(DESIGN_COLLECTIONS).map((dc) => (
            <div
              key={dc.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-4 shadow-xs"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{dc.name}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {dc.tagline}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Typography System:</div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  <span className="font-bold">{dc.typography.headingFont.split(',')[0]}</span> (Heading) +{' '}
                  <span className="font-bold">{dc.typography.bodyFont.split(',')[0]}</span> (Body)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Visual Tokens &amp; Surfaces:</div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {dc.imagery.aspectRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    Ratio {dc.typography.scaleRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {dc.imagery.roundedCorner}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 italic">
                  {dc.imagery.treatment}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspect Blueprint Architecture Modal */}
      {inspectBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex items-center justify-center">
                  {getBlueprintIcon(inspectBlueprint.id)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {inspectBlueprint.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${inspectBlueprint.accentColor}15`,
                      color: inspectBlueprint.accentColor,
                      borderColor: `${inspectBlueprint.accentColor}40`
                    }}
                  >
                    {inspectBlueprint.badge}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectBlueprint(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Sample Hero */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {inspectBlueprint.description}
              </p>

              {inspectBlueprint.sampleHero && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Sample Hero Layout &bull; {inspectBlueprint.sampleHero.badge}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    &ldquo;{inspectBlueprint.sampleHero.title}&rdquo;
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    {inspectBlueprint.sampleHero.subtitle}
                  </div>
                </div>
              )}
            </div>

            {/* Default Page Tree Detailed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>Default Information Architecture ({inspectBlueprint.defaultPages.length} Pages)</span>
              </h4>
              <div className="space-y-2">
                {inspectBlueprint.defaultPages.map((page) => (
                  <div
                    key={page.slug}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="font-mono text-purple-500 dark:text-purple-400">
                          /{page.slug}
                        </span>
                        <span>&bull;</span>
                        <span>{page.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{page.description}</div>
                    </div>
                    {page.isPrimary && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Core Modules & Conversion Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Core Functional Modules:</div>
                <div className="flex flex-wrap gap-1">
                  {inspectBlueprint.coreModules.map((mod) => (
                    <span
                      key={mod}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Primary Conversion Actions:</div>
                <div className="space-y-1">
                  {inspectBlueprint.primaryConversionActions.map((action, i) => (
                    <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setInspectBlueprint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/create?blueprint=${inspectBlueprint.id}`}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                }}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition hover:opacity-95"
              >
                <span>Initialize with {inspectBlueprint.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
