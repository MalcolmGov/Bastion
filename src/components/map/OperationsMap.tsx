'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, List, ArrowRight, Sparkles, CheckCircle2, Compass } from 'lucide-react';
import { Operation } from '@/lib/types';
import { Real3DGlobe } from './Real3DGlobe';

interface OperationsMapProps {
  operations: Operation[];
  onOpenAssistantWithContext?: (prompt: string, context: string) => void;
  initialRegion?: string;
  initialType?: string;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  operations,
  onOpenAssistantWithContext,
  initialRegion = 'All',
  initialType = 'All',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedOpId, setSelectedOpId] = useState<string>('south-deep');
  // Explicitly default to 'list' view as requested
  const [viewMode, setViewMode] = useState<'list' | '3d' | 'map'>('list');

  const regions = ['All', 'South Africa', 'Australia', 'Ghana', 'Americas', 'Canada'];
  const types = ['All', 'Underground', 'Open Pit', 'Joint Venture', 'Development'];

  const filteredOps = operations.filter((op) => {
    const matchesRegion = selectedRegion === 'All' || op.region === selectedRegion;
    const matchesType = selectedType === 'All' || op.type === selectedType;
    return matchesRegion && matchesType;
  });

  const activeOp = filteredOps.find((op) => op.id === selectedOpId) || filteredOps[0] || operations[0];

  const handleAskAI = (op: Operation) => {
    const prompt = `Tell me about ${op.name} operations, attributable production (${op.attributableProductionH1_2026}), and ESG performance.`;
    const context = `${op.name} (${op.country})`;
    if (onOpenAssistantWithContext) {
      onOpenAssistantWithContext(prompt, context);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: { prompt, context },
        })
      );
    }
  };

  return (
    <section className="bg-navy-dark text-white py-14 sm:py-20 px-4 sm:px-6 border-y border-navy-surface relative overflow-hidden">
      {/* Background Topographic lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#B79855_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-mist/10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/30 text-gold-light text-xs font-semibold uppercase tracking-wider mb-3">
              <Globe className="w-3.5 h-3.5 text-gold" />
              Global Footprint • 9 Mines & Projects
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
              Explore Our Global Operations
            </h2>
            <p className="text-sm text-mist/70 mt-2 max-w-2xl font-normal">
              Diversified high-quality assets across six premier mining jurisdictions with world-class ESG standards.
            </p>
          </div>

          {/* View Mode Toggle — Fully scrollable on mobile without overflow */}
          <div className="w-full md:w-auto overflow-x-auto pb-1 scrollbar-none">
            <div className="bg-navy p-1 rounded-xl border border-turquoise/30 inline-flex items-center shadow-card shrink-0">
              {/* 1. List View (Default) */}
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 text-navy-dark shadow-[0_0_15px_rgba(0,229,192,0.4)] font-extrabold'
                    : 'text-mist/70 hover:text-turquoise-bright hover:bg-navy-surface'
                }`}
              >
                <List className="w-4 h-4 shrink-0" />
                <span>List View ({filteredOps.length})</span>
              </button>

              {/* 2. Real 3D Globe */}
              <button
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 text-navy-dark shadow-[0_0_15px_rgba(0,229,192,0.4)] font-extrabold'
                    : 'text-mist/70 hover:text-turquoise-bright hover:bg-navy-surface'
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Real 3D Globe</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-navy-dark/30 text-navy-dark font-mono uppercase font-bold">
                  3D
                </span>
              </button>

              {/* 3. 2D Planar Map */}
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 text-navy-dark shadow-[0_0_15px_rgba(0,229,192,0.4)] font-extrabold'
                    : 'text-mist/70 hover:text-turquoise-bright hover:bg-navy-surface'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <span>2D Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar: Regions and Asset Types */}
        <div className="space-y-4 mb-8 bg-navy/60 p-3 sm:p-4 rounded-xl border border-turquoise/20">
          {/* Region Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs uppercase tracking-wider text-turquoise-bright font-bold mr-1 sm:mr-2 min-w-[60px] sm:min-w-[70px]">
              Region:
            </span>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedRegion === region
                    ? 'bg-turquoise-bright text-navy-dark font-extrabold shadow-[0_0_12px_rgba(0,229,192,0.45)]'
                    : 'bg-navy/70 hover:bg-navy-surface text-mist hover:text-turquoise-bright border border-turquoise/20'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Asset Type Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-mist/10">
            <span className="text-xs uppercase tracking-wider text-turquoise-bright font-bold mr-1 sm:mr-2 min-w-[60px] sm:min-w-[70px]">
              Asset Type:
            </span>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedType === type
                    ? 'bg-turquoise-light text-turquoise-dark font-extrabold border border-turquoise/50 shadow-xs'
                    : 'bg-navy/70 hover:bg-navy-surface text-mist hover:text-turquoise-bright border border-mist/10'
                }`}
              >
                {type}
              </button>
            ))}
            {(selectedRegion !== 'All' || selectedType !== 'All') && (
              <button
                onClick={() => {
                  setSelectedRegion('All');
                  setSelectedType('All');
                }}
                className="text-[11px] text-turquoise-bright hover:underline ml-2 font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* VIEW MODE 1: LIST VIEW (DEFAULT)                           */}
        {/* ========================================================== */}
        {viewMode === 'list' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {filteredOps.length === 0 ? (
              <div className="bg-navy/60 rounded-xl p-12 text-center border border-mist/10">
                <p className="text-sm font-semibold text-white">No operations match your filter criteria.</p>
                <button
                  onClick={() => {
                    setSelectedRegion('All');
                    setSelectedType('All');
                  }}
                  className="mt-4 px-4 py-2 bg-gold text-navy-dark text-xs font-bold rounded-lg"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOps.map((op) => (
                  <div
                    key={op.id}
                    className="bg-navy rounded-2xl border border-mist/10 overflow-hidden shadow-card flex flex-col justify-between hover:border-gold-mineral transition-all duration-200 group"
                  >
                    <div className="relative h-48 w-full bg-navy-dark overflow-hidden">
                      <Image
                        src={op.image}
                        alt={op.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold text-navy-dark shadow-subtle">
                          {op.type}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                          {op.status}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4">
                        <p className="text-xs text-gold-light font-medium tracking-wide">
                          {op.country} • {op.region}
                        </p>
                        <h3 className="text-xl font-bold text-white font-display">
                          {op.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-mist/80 leading-relaxed line-clamp-3">
                        {op.overview}
                      </p>

                      {/* Key Metric Highlights */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mist/10">
                        <div className="bg-navy-surface/50 p-2.5 rounded-lg border border-mist/5">
                          <span className="text-[10px] text-mist/60 block uppercase tracking-wider">
                            Attributable H1 2026
                          </span>
                          <span className="text-sm font-bold text-white tabular-nums">
                            {op.attributableProductionH1_2026}
                          </span>
                        </div>
                        <div className="bg-navy-surface/50 p-2.5 rounded-lg border border-mist/5">
                          <span className="text-[10px] text-mist/60 block uppercase tracking-wider">
                            Ownership
                          </span>
                          <span className="text-xs font-semibold text-white truncate block">
                            {op.ownership}
                          </span>
                        </div>
                      </div>

                      {/* Sourced Highlight */}
                      {op.sustainabilityHighlights && op.sustainabilityHighlights[0] && (
                        <div className="text-[11px] text-mist/75 flex items-start gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{op.sustainabilityHighlights[0]}</span>
                        </div>
                      )}

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-mist/10 flex items-center justify-between gap-2">
                        <Link
                          href={`/operations/${op.slug}`}
                          className="flex-1 py-2 px-3 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Explore Asset</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleAskAI(op)}
                          className="py-2 px-3 rounded-lg bg-navy-surface hover:bg-navy-surface/80 text-mist text-xs font-medium border border-mist/10 transition-colors inline-flex items-center gap-1"
                          title="Ask AI about this operation"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold" />
                          <span className="hidden sm:inline">Ask AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW MODE 2: REAL 3D GLOBE                                 */}
        {/* ========================================================== */}
        {viewMode === '3d' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Real3DGlobe
              operations={operations}
              selectedOpId={activeOp?.id || 'south-deep'}
              onSelectOp={setSelectedOpId}
              onOpenAssistantWithContext={onOpenAssistantWithContext}
            />
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW MODE 3: 2D PLANAR MAP                                 */}
        {/* ========================================================== */}
        {viewMode === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-300">
            {/* Interactive World Map SVG (8 cols) */}
            <div className="lg:col-span-8 bg-navy/80 rounded-2xl border border-mist/10 p-4 md:p-8 relative shadow-elevated overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <svg
                  viewBox="0 0 1000 500"
                  className="w-full h-full text-slate/20"
                  fill="currentColor"
                >
                  {/* Subtle simplified world continents */}
                  {/* North America */}
                  <path
                    d="M 120,60 Q 220,50 300,100 Q 320,160 260,200 Q 220,180 180,180 Q 140,220 160,260 Q 120,240 100,180 Z"
                    className="fill-navy-surface/80 stroke-mist/20 stroke-[0.8]"
                  />
                  {/* South America */}
                  <path
                    d="M 230,220 Q 320,240 330,310 Q 320,420 260,450 Q 240,360 230,270 Z"
                    className="fill-navy-surface/80 stroke-mist/20 stroke-[0.8]"
                  />
                  {/* Europe & North Asia */}
                  <path
                    d="M 450,70 Q 560,40 700,70 Q 820,90 850,160 Q 750,180 620,150 Q 520,160 480,120 Z"
                    className="fill-navy-surface/80 stroke-mist/20 stroke-[0.8]"
                  />
                  {/* Africa */}
                  <path
                    d="M 440,160 Q 540,160 570,230 Q 560,330 520,380 Q 480,330 450,230 Z"
                    className="fill-navy-surface/80 stroke-mist/20 stroke-[0.8]"
                  />
                  {/* Australia */}
                  <path
                    d="M 740,300 Q 840,290 860,340 Q 840,410 760,390 Q 730,340 740,300 Z"
                    className="fill-navy-surface/80 stroke-mist/20 stroke-[0.8]"
                  />

                  {/* Operation Pin Markers */}
                  {operations.map((op) => {
                    const isSelected = op.id === activeOp?.id;
                    const matchesRegion =
                      selectedRegion === 'All' || op.region === selectedRegion;
                    const matchesType =
                      selectedType === 'All' || op.type === selectedType;
                    const isVisible = matchesRegion && matchesType;
                    if (!isVisible || !op.coordinates.svgX || !op.coordinates.svgY)
                      return null;

                    return (
                      <g
                        key={op.id}
                        className="cursor-pointer transition-transform duration-200"
                        onClick={() => setSelectedOpId(op.id)}
                      >
                        {/* Selected pulse ring */}
                        {isSelected && (
                          <circle
                            cx={op.coordinates.svgX}
                            cy={op.coordinates.svgY}
                            r="14"
                            className="fill-gold/20 animate-ping"
                          />
                        )}
                        {/* Outer ring */}
                        <circle
                          cx={op.coordinates.svgX}
                          cy={op.coordinates.svgY}
                          r={isSelected ? "9" : "6"}
                          className={`transition-all ${
                            isSelected
                              ? 'fill-gold stroke-white stroke-2'
                              : 'fill-gold-mineral/80 hover:fill-gold stroke-navy-dark stroke-1'
                          }`}
                        />
                        {/* Center core */}
                        <circle
                          cx={op.coordinates.svgX}
                          cy={op.coordinates.svgY}
                          r={isSelected ? "4" : "2"}
                          className="fill-navy-dark"
                        />
                        {/* Label */}
                        <text
                          x={op.coordinates.svgX}
                          y={op.coordinates.svgY - 12}
                          textAnchor="middle"
                          className={`text-[9px] font-bold tracking-wider uppercase transition-opacity ${
                            isSelected
                              ? 'fill-white opacity-100 font-semibold'
                              : 'fill-mist/70 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {op.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Legend */}
                <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-navy-dark/90 backdrop-blur-md px-3 py-2 rounded-lg border border-mist/10 text-[10px] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" />
                    <span className="text-mist/80">Active Mine / Project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate/40 inline-block" />
                    <span className="text-mist/60">Transferred / Historical</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Operation Preview Card (4 cols) */}
            <div className="lg:col-span-4 bg-navy rounded-2xl border border-mist/15 overflow-hidden shadow-elevated flex flex-col">
              <div className="relative h-48 w-full bg-navy-dark">
                <Image
                  src={activeOp.image}
                  alt={activeOp.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold text-navy-dark">
                    {activeOp.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white backdrop-blur-xs">
                    {activeOp.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-xs text-gold font-medium">{activeOp.country}</p>
                  <h3 className="text-2xl font-bold text-white">{activeOp.name}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-mist/80 leading-relaxed">
                  {activeOp.overview}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mist/10">
                  <div className="bg-navy-surface/50 p-2.5 rounded border border-mist/5">
                    <span className="text-[10px] uppercase tracking-wider text-mist/60 block">
                      H1 2026 Production
                    </span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {activeOp.attributableProductionH1_2026}
                    </span>
                  </div>
                  <div className="bg-navy-surface/50 p-2.5 rounded border border-mist/5">
                    <span className="text-[10px] uppercase tracking-wider text-mist/60 block">
                      Ownership
                    </span>
                    <span className="text-xs font-semibold text-white truncate block">
                      {activeOp.ownership}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                {activeOp.sustainabilityHighlights && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-gold-light font-semibold block">
                      Key Highlights:
                    </span>
                    <p className="text-[11px] text-mist/80 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{activeOp.sustainabilityHighlights[0]}</span>
                    </p>
                  </div>
                )}

                {/* Card Actions */}
                <div className="pt-3 border-t border-mist/10 flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/operations/${activeOp.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold transition-colors"
                  >
                    <span>View Operation Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleAskAI(activeOp)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-navy-surface hover:bg-navy-surface/80 text-mist text-xs font-medium border border-mist/10 transition-colors"
                    title="Ask AI about this operation"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
