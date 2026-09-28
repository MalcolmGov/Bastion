'use client';

import React, { useState } from 'react';
import {
  Filter,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { SustainabilityTarget } from '@/lib/types';
import sustainabilityData from '@/content/sustainability.json';

interface ESGTargetTrackerProps {
  initialTargets?: SustainabilityTarget[];
  onAskAI?: (prompt: string, context: string) => void;
}

export const ESGTargetTracker: React.FC<ESGTargetTrackerProps> = ({ initialTargets, onAskAI }) => {
  const targets = (initialTargets && initialTargets.length > 0) ? initialTargets : (sustainabilityData as SustainabilityTarget[]);
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const pillarsList = [
    'All',
    'Decarbonization',
    'Water Stewardship',
    'Tailings Safety (GISTM)',
    'Safety & Health',
    'Community Shared Value',
    'Gender Diversity'
  ];

  const filteredTargets = targets.filter((t) => {
    const matchesPillar = selectedPillar === 'All' || t.pillar === selectedPillar;
    const matchesStatus = statusFilter === 'All' || t.latestActual.status === statusFilter;
    return matchesPillar && matchesStatus;
  });

  const handleAskAboutTarget = (target: SustainabilityTarget) => {
    const prompt = `Tell me about Gold Fields' ${target.pillar} commitment: "${target.title}". What is the baseline, current progress, and 2030 target?`;
    const context = `Target: ${target.pillar}`;

    if (onAskAI) {
      onAskAI(prompt, context);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context,
          },
        })
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Achieved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Achieved
          </span>
        );
      case 'On Track':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-forest bg-forest-light border border-forest/30 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
            On Track
          </span>
        );
    }
  };

  return (
    <section id="targets" className="py-20 bg-white border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
              <span>Quantitative Disclosures</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
              2030 ESG Target Tracker
            </h2>
            <p className="mt-3 text-base text-ink-muted leading-relaxed">
              Transparent, measurable progress against verified historical baselines. All target trajectories are audited against internationally accepted methodologies and published in our Annual Sustainability Reporting suite.
            </p>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex items-center gap-4 bg-editorial p-4 rounded-xl border border-mist text-xs">
            <div>
              <span className="text-ink-subtle block font-semibold">Active Targets</span>
              <span className="text-lg font-bold text-navy tabular-nums">{targets.length} Core Metrics</span>
            </div>
            <div className="h-8 w-px bg-mist" />
            <div>
              <span className="text-ink-subtle block font-semibold">Target Milestone</span>
              <span className="text-lg font-bold text-forest tabular-nums">2030 Horison</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-mist/80 mb-10">
          {/* Pillar Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {pillarsList.map((p) => {
              const isActive = selectedPillar === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPillar(p)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-navy text-white shadow-subtle'
                      : 'bg-editorial text-ink hover:bg-mist-light border border-mist/60'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
            <span className="text-ink-subtle font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-editorial border border-mist text-ink text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-navy"
            >
              <option value="All">All Statuses</option>
              <option value="On Track">On Track</option>
              <option value="Achieved">Achieved</option>
            </select>
          </div>
        </div>

        {/* Targets Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTargets.map((target) => (
            <div
              key={target.id}
              className="bg-editorial/60 rounded-2xl border border-mist p-7 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                        target.pillar === 'Water Stewardship'
                          ? 'text-turquoise-dark bg-turquoise-light border-turquoise/30'
                          : 'text-forest bg-forest-light border-forest/20'
                      }`}
                    >
                      {target.pillar}
                    </span>
                    <h3 className="text-xl font-bold text-navy mt-2 font-display">
                      {target.title}
                    </h3>
                  </div>
                  <div>{getStatusBadge(target.latestActual.status)}</div>
                </div>

                <p className="text-xs text-ink/80 leading-relaxed mb-6">
                  {target.description}
                </p>

                {/* 3 Metrics Comparator Grid: Baseline vs Latest Actual vs Target */}
                <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-mist mb-6 shadow-xs">
                  {/* Baseline Column */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block">
                      Baseline ({target.baseline.year})
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-navy block tabular-nums">
                      {target.baseline.value}
                    </span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      {target.baseline.unit}
                    </span>
                  </div>

                  {/* Latest Actual Column */}
                  <div className="space-y-1 border-x border-mist px-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        target.pillar === 'Water Stewardship' ? 'text-turquoise-dark' : 'text-forest'
                      }`}
                    >
                      Actual ({target.latestActual.period})
                    </span>
                    <span
                      className={`text-sm sm:text-base font-extrabold block tabular-nums ${
                        target.pillar === 'Water Stewardship' ? 'text-turquoise-dark' : 'text-forest'
                      }`}
                    >
                      {target.latestActual.value}
                    </span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      {target.latestActual.unit}
                    </span>
                  </div>

                  {/* Target Year Column */}
                  <div className="space-y-1 pl-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                      Target Year
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-gold-dark block tabular-nums">
                      {target.targetYear}
                    </span>
                    <span className="text-[10px] text-ink-muted block leading-tight">
                      Audited Goal
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Document Citation & Action Trigger */}
              <div className="pt-4 border-t border-mist/80 space-y-3">
                {/* Citation */}
                <div className="flex items-start gap-2 text-[11px] text-ink-muted bg-white/70 p-2.5 rounded-lg border border-mist/50">
                  <BookOpen className="w-3.5 h-3.5 text-ink-subtle shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-ink">Source Document: </span>
                    <a
                      href={target.sourceDocument.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>{target.sourceDocument.title}</span>
                      <ExternalLink className="w-3 h-3 text-ink-subtle" />
                    </a>
                    <span className="block text-ink-subtle text-[10px] mt-0.5">
                      Section: {target.sourceDocument.section}
                    </span>
                  </div>
                </div>

                {/* AI Interactive Trigger Button */}
                <button
                  type="button"
                  onClick={() => handleAskAboutTarget(target)}
                  className="w-full py-2.5 px-4 rounded-lg bg-navy/5 hover:bg-navy/10 text-navy text-xs font-bold border border-navy/15 flex items-center justify-center gap-2 transition-colors cursor-pointer group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                  <span>Ask AI about this commitment</span>
                  <ChevronRight className="w-3.5 h-3.5 text-navy group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
