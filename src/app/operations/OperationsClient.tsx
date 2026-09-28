'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Globe,
  Pickaxe,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  History,
  Info
} from 'lucide-react';
import { OperationsMap } from '@/components/map/OperationsMap';
import { AssetType, Operation } from '@/lib/types';

const REGIONS = ['All', 'South Africa', 'Australia', 'Ghana', 'Americas', 'Canada'] as const;
const ASSET_TYPES: ('All' | AssetType)[] = ['All', 'Underground', 'Open Pit', 'Joint Venture', 'Development'];

interface OperationsClientProps {
  initialOperations: Operation[];
}

export default function OperationsClient({ initialOperations }: OperationsClientProps) {
  const allOperations = initialOperations;
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sourced transferred operation note
  const transferredOperation = useMemo(
    () => allOperations.find((op) => op.slug === 'damang'),
    [allOperations]
  );

  // Filtered operations based on UI state
  const filteredOperations = useMemo(() => {
    return allOperations.filter((op) => {
      const matchRegion = selectedRegion === 'All' || op.region === selectedRegion;
      const matchType = selectedType === 'All' || op.type === selectedType;
      const matchQuery =
        searchQuery.trim() === '' ||
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.type.toLowerCase().includes(searchQuery.toLowerCase());

      return matchRegion && matchType && matchQuery;
    });
  }, [allOperations, selectedRegion, selectedType, searchQuery]);

  // Dispatch open-assistant event with pre-filled prompt and context
  const handleAskAI = (prompt: string, context: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: { prompt, context },
        })
      );
    }
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. CINEMATIC PORTFOLIO HERO                                   */}
      {/* ============================================================ */}
      <section className="relative min-h-[520px] lg:min-h-[580px] flex items-center bg-navy-dark overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/gold-fields-releases-h1-2026.jpg"
            alt="Gold Fields Global Mining Footprint"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-xs text-mist/70">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-mist/40" />
              </li>
              <li className="text-gold font-medium">Operations</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/40 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
                <Globe className="w-3.5 h-3.5 text-gold" />
                <span>Global Mining Portfolio</span>
                <span className="text-white/40">•</span>
                <span>9 Active Mines & Growth Projects</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
                World-Class Assets. <br />
                <span className="text-gold-light font-normal italic">
                  Enduring Global Value.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-mist/90 max-w-2xl font-normal leading-relaxed">
                Gold Fields operates nine high-quality, long-life assets across six premier mining jurisdictions in South Africa, Australia, Ghana, Chile, Peru, and Canada. Our portfolio is anchored by bulk mechanization, disciplined capital allocation, and benchmark decarbonization microgrids.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#operations-explorer"
                  className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-2 group"
                >
                  <span>Explore operations</span>
                  <ArrowRight className="w-4 h-4 text-navy-dark group-hover:translate-x-1 transition-transform" />
                </a>

                <button
                  onClick={() =>
                    handleAskAI(
                      'Give me an overview of Gold Fields global operations, attributable production by region, and key ESG initiatives in 2026.',
                      'Global Operations Portfolio'
                    )
                  }
                  className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-gold" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>
            </div>

            {/* Right Portfolio Fact Sheet Card */}
            <div className="lg:col-span-4">
              <div className="bg-navy/85 backdrop-blur-md rounded-2xl border border-mist/20 p-6 shadow-elevated text-white space-y-4">
                <div className="flex items-center justify-between border-b border-mist/10 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gold" />
                    Portfolio Highlights (H1 2026)
                  </span>
                  <span className="text-[10px] text-mist/60 bg-navy-surface px-2 py-0.5 rounded">
                    Sourced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-surface/60 p-3 rounded-lg border border-mist/10">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block">
                      Attributable Output
                    </span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      1.06 Moz
                    </span>
                    <span className="text-[10px] text-mist/60 block mt-0.5">
                      H1 2026 Results
                    </span>
                  </div>

                  <div className="bg-navy-surface/60 p-3 rounded-lg border border-mist/10">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block">
                      Active Operations
                    </span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      9 Mines
                    </span>
                    <span className="text-[10px] text-mist/60 block mt-0.5">
                      4 Continents
                    </span>
                  </div>

                  <div className="bg-navy-surface/60 p-3 rounded-lg border border-mist/10">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block">
                      Renewable Solar
                    </span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      50 MW
                    </span>
                    <span className="text-[10px] text-mist/60 block mt-0.5">
                      Khanyisa Plant
                    </span>
                  </div>

                  <div className="bg-navy-surface/60 p-3 rounded-lg border border-mist/10">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block">
                      Microgrid Bench
                    </span>
                    <span className="text-xl font-bold text-white tracking-tight">
                      70%+
                    </span>
                    <span className="text-[10px] text-mist/60 block mt-0.5">
                      Agnew Wind/Solar
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-mist/60 leading-relaxed border-t border-mist/10 pt-3">
                  Verified against the Gold Fields H1 2026 Financial & Operational Results (released 25 August 2026).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DAMANG ASSET TRANSITION NOTICE (HISTORICAL GOVERNANCE)     */}
      {/* ============================================================ */}
      {transferredOperation && (
        <section className="bg-editorial border-b border-mist/60 py-6 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
                  <History className="w-5 h-5 text-amber-800" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                      Portfolio Stewardship Transition
                    </span>
                    <span className="text-xs font-semibold text-ink">
                      Damang Operation Transferred to Government of Ghana (18 April 2026)
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed max-w-4xl">
                    In accordance with the official H1 2026 Review of Operations disclosure, ownership and operational custody of the Damang mine was formally concluded and transferred to the Government of Ghana on 18 April 2026. Damang is retained in our disclosures for historical continuity, regulatory compliance, and environmental stewardship transparency.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <Link
                  href="/operations/damang"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-subtle"
                >
                  <span>View Damang Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. INTERACTIVE SVG WORLD MAP & REGIONAL EXPLORER             */}
      {/* ============================================================ */}
      <div id="operations-explorer">
        <OperationsMap
          operations={allOperations}
          initialRegion={selectedRegion}
          initialType={selectedType}
          onOpenAssistantWithContext={(prompt, context) => handleAskAI(prompt, context)}
        />
      </div>

      {/* ============================================================ */}
      {/* 4. COMPREHENSIVE OPERATIONS PORTFOLIO DIRECTORY              */}
      {/* ============================================================ */}
      <section className="bg-editorial py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-mist">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-semibold uppercase tracking-wider mb-2">
                <Pickaxe className="w-3.5 h-3.5 text-gold-dark" />
                <span>Asset Directory</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink font-display">
                Global Operations & Projects
              </h2>
              <p className="text-sm text-ink-muted mt-2 max-w-2xl">
                Explore operational profiles, attributable production, mechanization methods, and environmental performance across all assets.
              </p>
            </div>

            {/* Live Count Badge */}
            <div className="flex items-center gap-2 text-xs font-medium text-ink-muted bg-white px-3.5 py-2 rounded-lg border border-mist shadow-subtle">
              <span>Showing:</span>
              <span className="font-bold text-navy">{filteredOperations.length}</span>
              <span>of {allOperations.length} operations</span>
            </div>
          </div>

          {/* Interactive Filter Toolbar */}
          <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search operation by name, country, or method..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-mist bg-editorial/50 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-subtle hover:text-ink font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Reset All Filters */}
              {(selectedRegion !== 'All' || selectedType !== 'All' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedRegion('All');
                    setSelectedType('All');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-gold-dark hover:text-navy underline self-end md:self-center"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Region Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-mist/50">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted mr-2 flex items-center gap-1.5 min-w-[70px]">
                <Globe className="w-3.5 h-3.5 text-navy" />
                Region:
              </span>
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedRegion === region
                      ? 'bg-navy text-white font-bold shadow-subtle'
                      : 'bg-editorial text-ink hover:bg-mist/70 border border-mist'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Asset Type Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-mist/50">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted mr-2 flex items-center gap-1.5 min-w-[70px]">
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold-dark" />
                Method:
              </span>
              {ASSET_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedType === type
                      ? 'bg-gold text-navy-dark font-bold shadow-subtle'
                      : 'bg-editorial text-ink hover:bg-mist/70 border border-mist'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Operations Grid */}
          {filteredOperations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-mist p-12 text-center space-y-4">
              <Info className="w-10 h-10 mx-auto text-ink-subtle stroke-1" />
              <h3 className="text-base font-bold text-ink">No operations found</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                No mining operations match the selected combination of region, method, or search query.
              </p>
              <button
                onClick={() => {
                  setSelectedRegion('All');
                  setSelectedType('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-surface transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOperations.map((operation) => {
                const isTransferred = operation.status === 'Transferred';
                const isProject = operation.status === 'Project';

                return (
                  <article
                    key={operation.id}
                    className={`bg-white rounded-2xl border ${
                      isTransferred
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-mist hover:border-gold-mineral'
                    } overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between group`}
                  >
                    {/* Top Image Banner */}
                    <div className="relative h-52 w-full bg-navy-dark overflow-hidden">
                      <Image
                        src={operation.image}
                        alt={`${operation.name} - ${operation.country}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold text-navy-dark">
                          {operation.type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium backdrop-blur-xs ${
                            isTransferred
                              ? 'bg-amber-600 text-white'
                              : isProject
                              ? 'bg-sky-700 text-white'
                              : 'bg-black/60 text-white'
                          }`}
                        >
                          {operation.status}
                        </span>
                      </div>

                      {/* Title & Location */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="text-xs font-semibold text-gold tracking-wide">
                          {operation.country} • {operation.region}
                        </p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">
                          {operation.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                          {operation.overview}
                        </p>

                        {/* Attributable Production & Ownership Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-mist/70">
                          <div className="bg-editorial p-2.5 rounded-lg border border-mist/50">
                            <span className="text-[10px] uppercase tracking-wider text-ink-subtle block font-semibold">
                              Attributable Output
                            </span>
                            <span className="text-xs font-bold text-navy truncate block mt-0.5">
                              {operation.attributableProductionH1_2026}
                            </span>
                          </div>

                          <div className="bg-editorial p-2.5 rounded-lg border border-mist/50">
                            <span className="text-[10px] uppercase tracking-wider text-ink-subtle block font-semibold">
                              Ownership
                            </span>
                            <span className="text-xs font-semibold text-navy truncate block mt-0.5">
                              {operation.ownership}
                            </span>
                          </div>
                        </div>

                        {/* Top Sustainability / ESG Milestone */}
                        {operation.sustainabilityHighlights && operation.sustainabilityHighlights[0] && (
                          <div className="bg-forest-light/60 p-2.5 rounded-lg border border-forest/20 space-y-1">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-forest block flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-forest" />
                              ESG Benchmark
                            </span>
                            <p className="text-[11px] text-ink-muted leading-snug line-clamp-2">
                              {operation.sustainabilityHighlights[0]}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-4 border-t border-mist flex flex-col sm:flex-row items-center gap-2">
                        <Link
                          href={`/operations/${operation.slug}`}
                          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors"
                        >
                          <span>Explore Operation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() =>
                            handleAskAI(
                              `Tell me about ${operation.name} in ${operation.country}, its attributable production, mining method, and ESG performance.`,
                              `${operation.name} (${operation.country})`
                            )
                          }
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-editorial hover:bg-mist text-ink text-xs font-medium border border-mist transition-colors"
                          title={`Ask AI about ${operation.name}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                          <span className="sm:hidden">Ask AI</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. REGIONAL HUBS & GEOLOGICAL SETTINGS                       */}
      {/* ============================================================ */}
      <section className="bg-white py-20 px-6 border-t border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-bold uppercase tracking-wider">
              Geological & Geographic Diversity
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink font-display">
              Five Resilient Mining Hubs
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Operating across prominent geological belts—from South Africa&apos;s Witwatersrand Basin to the Western Australian Greenstone belts, Ghana&apos;s Tarkwaian system, the High Andes of South America, and the Abitibi greenstone belt of Canada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* South Africa */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                South Africa Region
              </span>
              <h3 className="text-lg font-bold text-ink">South Deep Mine</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Operating in the Witwatersrand Basin near Westonaria at depths between 2,400m and 3,000m. A bulk, fully mechanised long-hole stoping underground gold mine possessing one of the world&apos;s largest gold mineral reserves.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>50 MW Khanyisa Solar</span>
                <span className="text-ink-subtle">151 koz H1 2026</span>
              </div>
            </div>

            {/* Australia */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                Australia Region
              </span>
              <h3 className="text-lg font-bold text-ink">St Ives, Granny Smith, Agnew, Gruyere</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Four foundational assets in Western Australia featuring pioneering microgrids. Agnew benchmark integrates wind, solar, and batteries; Granny Smith operates Wallaby deep orebody; Gruyere delivers Tier-1 bulk open-pit output.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>Benchmark Decarbonization</span>
                <span className="text-ink-subtle">545 koz H1 2026</span>
              </div>
            </div>

            {/* Ghana */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                Ghana Region
              </span>
              <h3 className="text-lg font-bold text-ink">Tarkwa Open Pit</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                A cornerstone producer in West Africa exploiting the paleoplacer Banket series quartz conglomerates across the Tarkwaian basin. Features a 13.5 Mtpa CIL processing facility with high recovery and over 70% host community procurement.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>Gold Fields Ghana Foundation</span>
                <span className="text-ink-subtle">242 koz H1 2026</span>
              </div>
            </div>

            {/* Chile */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                Americas Region (Chile)
              </span>
              <h3 className="text-lg font-bold text-ink">Salares Norte Mine</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Newly commissioned, high-grade open-pit gold-silver mine situated at 3,900m to 4,700m in the High Andes. Features dry-stack filtered tailings ensuring zero liquid discharge, water recovery exceeding 86%, and Chinchilla preservation.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>Filtered Dry-Stack Tailings</span>
                <span className="text-ink-subtle">Commercial Ramp-up</span>
              </div>
            </div>

            {/* Peru */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                Americas Region (Peru)
              </span>
              <h3 className="text-lg font-bold text-ink">Cerro Corona Operation</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Located in the Hualgayoc district in northern Peru at ~3,800m elevation. Producing clean copper-gold concentrate with 100% GISTM tailings safety compliance and award-winning community potable water provision.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>GISTM Certified Tailings</span>
                <span className="text-ink-subtle">108 koz Au-Eq H1 2026</span>
              </div>
            </div>

            {/* Canada */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3 hover:border-gold-mineral transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                Canada Region
              </span>
              <h3 className="text-lg font-bold text-ink">Windfall Project (JV)</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                High-grade underground gold deposit in the Abitibi greenstone belt of Quebec, operated in 50/50 joint venture with Osisko Mining. Designed for zero-emission hydroelectric power from the Quebec grid and Cree First Nation partnership.
              </p>
              <div className="pt-2 text-xs font-semibold text-navy flex items-center justify-between border-t border-mist/70">
                <span>Quebec Clean Hydro Grid</span>
                <span className="text-ink-subtle">Advanced Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. ESG & OPERATIONAL GOVERNANCE STANDARDS                    */}
      {/* ============================================================ */}
      <section className="bg-navy-dark text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Safety & Zero Harm</h4>
              </div>
              <p className="text-xs text-mist/70 leading-relaxed">
                Safety is our foremost value. Zero fatalities achieved across multiple operating complexes in H1 2026, reinforced by vital behaviors and courageous leadership.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <Zap className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Decarbonization</h4>
              </div>
              <p className="text-xs text-mist/70 leading-relaxed">
                Committed to a 30% net cut in Scope 1 & 2 carbon emissions by 2030 (vs 2016 baseline) through solar, wind, and battery microgrid deployments across SA and Australia.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <Globe className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">GISTM Conformance</h4>
              </div>
              <p className="text-xs text-mist/70 leading-relaxed">
                100% of Extreme and Very High consequence Tailings Storage Facilities conform to the Global Industry Standard on Tailings Management (GISTM) with independent third-party reviews.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gold">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider">Shared Community Value</h4>
              </div>
              <p className="text-xs text-mist/70 leading-relaxed">
                Targeting over 70% in-country host community procurement and substantial social investment through trusts and foundations across all host jurisdictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. ASK GOLD FIELDS ASSISTANT INTERACTIVE CALLOUT             */}
      {/* ============================================================ */}
      <section className="bg-editorial py-16 px-6 border-t border-mist">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-navy to-navy-surface rounded-2xl p-8 md:p-10 shadow-elevated text-white text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center mx-auto text-gold">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-display">
              Have Questions About Our Operations?
            </h3>
            <p className="text-xs md:text-sm text-mist/80">
              Ask our interactive Gold Fields Assistant for verified operational metrics, geology, decarbonization case studies, and regulatory disclosures.
            </p>
          </div>

          {/* Quick Query Suggestion Chips */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              'Compare South Deep and Tarkwa H1 2026 production',
              'How does the Agnew wind-solar microgrid operate?',
              'What is the status of Salares Norte ramp-up in Chile?',
              'Explain the Damang asset transition to Ghana',
            ].map((query) => (
              <button
                key={query}
                onClick={() => handleAskAI(query, 'Operations Enquiry')}
                className="px-3.5 py-2 rounded-lg bg-navy-dark/60 hover:bg-gold hover:text-navy-dark text-mist text-xs border border-mist/15 transition-all text-left"
              >
                &ldquo;{query}&rdquo;
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() =>
                handleAskAI(
                  'Summarize Gold Fields operational performance and production across all regions.',
                  'Operations Overview'
                )
              }
              className="px-6 py-3 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-navy-dark" />
              <span>Launch Ask Gold Fields Assistant</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
