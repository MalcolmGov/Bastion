'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  Download,
  BookmarkPlus,
  CheckCircle2,
  LayoutGrid,
  List,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Filter,
  BookOpen
} from 'lucide-react';
import { ReportCategory, ReportItem } from '@/lib/types';

const CATEGORIES: { label: string; value: ReportCategory | 'All' }[] = [
  { label: 'All Disclosures', value: 'All' },
  { label: 'Financial Results', value: 'Financial Results' },
  { label: 'Integrated Annual', value: 'Integrated Annual' },
  { label: 'Sustainability & ESG', value: 'Sustainability & ESG' },
  { label: 'SENS Announcements', value: 'SENS Announcement' },
  { label: 'Investor Presentations', value: 'Investor Presentation' },
];

const YEARS: (number | 'All')[] = ['All', 2026, 2025, 2024];

interface ReportsClientProps {
  initialReports: ReportItem[];
}

export default function ReportsClient({ initialReports }: ReportsClientProps) {
  const allReports = initialReports;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'All'>('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [packIds, setPackIds] = useState<string[]>([]);

  // Initialize and synchronize report pack from localStorage
  useEffect(() => {
    const syncPack = () => {
      try {
        const stored = localStorage.getItem('gf_report_pack');
        if (stored) {
          setPackIds(JSON.parse(stored));
        } else {
          setPackIds([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    syncPack();

    // Check if ?pack=true is present in the query string
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('pack') === 'true') {
        window.dispatchEvent(new CustomEvent('open-report-pack'));
      }
    }

    window.addEventListener('storage', syncPack);
    return () => window.removeEventListener('storage', syncPack);
  }, []);

  const handleTogglePack = (reportId: string) => {
    let updated: string[];
    const isAdding = !packIds.includes(reportId);

    if (isAdding) {
      updated = [...packIds, reportId];
    } else {
      updated = packIds.filter((id) => id !== reportId);
    }

    setPackIds(updated);
    try {
      localStorage.setItem('gf_report_pack', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Open drawer on add or remove
    window.dispatchEvent(new CustomEvent('open-report-pack'));
  };

  const handleOpenPackDrawer = () => {
    window.dispatchEvent(new CustomEvent('open-report-pack'));
  };

  const handleTriggerAI = (promptText?: string, contextText?: string) => {
    window.dispatchEvent(
      new CustomEvent('open-assistant', {
        detail: {
          prompt: promptText || 'Where can I find published Gold Fields reports and sustainability filings?',
          context: contextText || 'Reports Library',
        },
      })
    );
  };

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      // Category filter
      if (selectedCategory !== 'All' && report.category !== selectedCategory) {
        return false;
      }
      // Year filter
      if (selectedYear !== 'All' && report.year !== selectedYear) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = report.title.toLowerCase().includes(q);
        const matchesSummary = report.summary.toLowerCase().includes(q);
        const matchesPeriod = report.period.toLowerCase().includes(q);
        const matchesCategory = report.category.toLowerCase().includes(q);
        const matchesHighlights = report.keyHighlights?.some((h) =>
          h.toLowerCase().includes(q)
        );
        return (
          matchesTitle ||
          matchesSummary ||
          matchesPeriod ||
          matchesCategory ||
          Boolean(matchesHighlights)
        );
      }
      return true;
    });
  }, [allReports, selectedCategory, selectedYear, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allReports.length };
    for (const r of allReports) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [allReports]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedYear('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedYear !== 'All';

  const getCategoryBadgeClass = (category: ReportCategory) => {
    switch (category) {
      case 'Financial Results':
        return 'bg-gold-light/60 text-gold-dark border-gold-mineral/30';
      case 'Integrated Annual':
        return 'bg-navy/10 text-navy border-navy/20';
      case 'Sustainability & ESG':
        return 'bg-forest-light text-forest border-forest/20';
      case 'SENS Announcement':
        return 'bg-mist text-ink border-mist';
      case 'Investor Presentation':
        return 'bg-navy-light/10 text-navy-light border-navy-light/20';
      default:
        return 'bg-mist text-ink';
    }
  };

  return (
    <div className="space-y-0 pb-20">
      {/* ============================================================ */}
      {/* 1. CINEMATIC LIBRARY HERO HEADER                              */}
      {/* ============================================================ */}
      <section className="bg-navy-dark text-white border-b border-navy-surface/50 py-16 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/40 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest backdrop-blur-xs">
            <span>Corporate Disclosure Library</span>
            <span className="text-white/40">•</span>
            <span>Annual Suite & Archive</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
                Reports & Presentations
              </h1>
              <p className="text-base sm:text-lg text-mist/90 max-w-2xl font-normal leading-relaxed">
                Access verified integrated annual reports, half-year and quarterly results booklets, ESG disclosures, JSE SENS filings, and executive investor presentations.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={handleOpenPackDrawer}
                className="w-full py-3.5 px-5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4 text-navy-dark" />
                  <span>My Report Pack Shortlist</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-navy-dark text-white text-[11px] font-bold">
                  {packIds.length}
                </span>
              </button>

              <button
                onClick={() => handleTriggerAI()}
                className="w-full py-3 px-5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Ask about any report or data point</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FILTER & SEARCH CONTROL CONSOLE                            */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist sticky top-16 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
          {/* Top Bar: Search Input, Year Selector & View Toggle */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, key term, mine, or disclosure..."
                className="w-full pl-10 pr-9 py-2 rounded-lg bg-editorial border border-mist text-xs text-ink placeholder:text-ink-subtle focus:bg-white focus:border-gold-mineral transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right controls: Year filter & View Mode */}
            <div className="flex items-center gap-3">
              {/* Year Select Buttons */}
              <div className="flex items-center bg-editorial p-1 rounded-lg border border-mist text-xs">
                <span className="text-[11px] font-bold text-ink-muted px-2 hidden sm:inline">
                  Year:
                </span>
                {YEARS.map((y) => (
                  <button
                    key={String(y)}
                    onClick={() => setSelectedYear(y)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      selectedYear === y
                        ? 'bg-navy text-white shadow-subtle'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {y === 'All' ? 'All Years' : y}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-editorial p-1 rounded-lg border border-mist text-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-navy text-white shadow-subtle'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-navy text-white shadow-subtle'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-gold-dark" />
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] || 0;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-subtle'
                      : 'bg-white text-ink-muted border-mist hover:border-navy/40 hover:text-ink'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-mist text-ink-muted'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ACTIVE FILTERS & STATUS BAR                                */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-muted pb-4 border-b border-mist">
          <div>
            Showing <strong className="text-navy">{filteredReports.length}</strong> of{' '}
            <strong>{allReports.length}</strong> verified corporate documents
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center gap-1 text-gold-dark font-medium">
                (filtered)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-gold-dark hover:text-navy font-bold flex items-center gap-1 self-start sm:self-auto transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. MAIN REPORTS LIBRARY: GRID OR LIST VIEW                    */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-6">
        {filteredReports.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white rounded-2xl border border-mist p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-ink-subtle mx-auto stroke-1" />
            <h3 className="text-lg font-bold text-navy">No publications match your criteria</h3>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              We couldn&apos;t find any documents matching your current search term or filter selection. Try resetting filters or searching with different keywords.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors"
              >
                Reset filters
              </button>
              <button
                onClick={() => handleTriggerAI(`Where can I find disclosures about "${searchQuery}"?`)}
                className="px-4 py-2 rounded-lg bg-editorial text-navy border border-mist text-xs font-bold hover:bg-mist transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                <span>Ask Gold Fields Assistant</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const isInPack = packIds.includes(report.id);
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-mist shadow-subtle hover:shadow-card hover:border-gold-mineral/40 transition-all flex flex-col justify-between group overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Top Row: Category Badge + Year + Specs */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                          report.category
                        )}`}
                      >
                        {report.category}
                      </span>
                      <span className="text-[11px] text-ink-subtle font-semibold">
                        {report.year}
                      </span>
                    </div>

                    {/* Title & Period */}
                    <div>
                      <h3 className="font-extrabold text-base text-navy group-hover:text-gold-dark transition-colors leading-snug">
                        {report.title}
                      </h3>
                      <p className="text-[11px] text-ink-muted mt-1 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold-dark shrink-0" />
                        <span>{report.period}</span>
                        <span className="text-mist">•</span>
                        <span>{report.date}</span>
                      </p>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                      {report.summary}
                    </p>

                    {/* Key Highlights Bullet points */}
                    {report.keyHighlights && report.keyHighlights.length > 0 && (
                      <div className="pt-2 border-t border-mist/60 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block">
                          Key Disclosures:
                        </span>
                        <ul className="space-y-1 text-[11px] text-ink">
                          {report.keyHighlights.slice(0, 2).map((h, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <span className="text-gold-dark font-bold">•</span>
                              <span className="line-clamp-2">{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Add to Pack + Download */}
                  <div className="p-4 bg-editorial border-t border-mist flex items-center justify-between gap-2">
                    <span className="text-[11px] text-ink-subtle font-medium">
                      {report.fileFormat} • {report.fileSize}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePack(report.id)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-1 transition-colors ${
                          isInPack
                            ? 'bg-forest text-white border-forest'
                            : 'bg-white text-navy border-mist hover:bg-mist hover:text-navy'
                        }`}
                        title={isInPack ? 'Remove from report pack' : 'Add to report pack'}
                      >
                        {isInPack ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>In Pack</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5 text-gold-dark" />
                            <span>+ Add</span>
                          </>
                        )}
                      </button>

                      <a
                        href={report.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-navy hover:bg-navy-light text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-subtle"
                        title="Download official file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="bg-white rounded-xl border border-mist shadow-subtle overflow-hidden divide-y divide-mist">
            {filteredReports.map((report) => {
              const isInPack = packIds.includes(report.id);
              return (
                <div
                  key={report.id}
                  className="p-5 hover:bg-editorial transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                          report.category
                        )}`}
                      >
                        {report.category}
                      </span>
                      <span className="text-xs font-semibold text-navy">
                        {report.period} ({report.year})
                      </span>
                      <span className="text-mist">•</span>
                      <span className="text-[11px] text-ink-subtle">{report.date}</span>
                    </div>

                    <h3 className="font-bold text-base text-navy group-hover:text-gold-dark transition-colors">
                      {report.title}
                    </h3>

                    <p className="text-xs text-ink-muted leading-relaxed max-w-3xl">
                      {report.summary}
                    </p>

                    {report.keyHighlights && report.keyHighlights.length > 0 && (
                      <p className="text-[11px] text-ink-subtle">
                        <strong className="text-ink">Highlights:</strong>{' '}
                        {report.keyHighlights.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col md:flex-row items-center gap-2 self-start md:self-center shrink-0">
                    <span className="text-[11px] text-ink-subtle font-medium mr-2">
                      {report.fileFormat} • {report.fileSize}
                    </span>

                    <button
                      onClick={() => handleTogglePack(report.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border flex items-center gap-1 transition-colors ${
                        isInPack
                          ? 'bg-forest text-white border-forest'
                          : 'bg-editorial text-navy border-mist hover:bg-white'
                      }`}
                    >
                      {isInPack ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>In Pack</span>
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="w-3.5 h-3.5 text-gold-dark" />
                          <span>Add to Pack</span>
                        </>
                      )}
                    </button>

                    <a
                      href={report.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded bg-navy hover:bg-navy-light text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. REPORT PACK CALLOUT STRIP                                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="bg-editorial p-6 sm:p-8 rounded-2xl border border-mist shadow-subtle flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5 text-gold-dark" />
              <h3 className="font-bold text-lg text-navy">Need to synthesize multiple documents?</h3>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted max-w-2xl leading-relaxed">
              Queue any corporate disclosures into your local <strong>Report Pack</strong>. You can view your curated collection anytime and export a clean text index with verified links.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenPackDrawer}
              className="py-3 px-5 rounded-lg bg-navy hover:bg-navy-light text-white font-bold text-xs shadow-subtle flex items-center gap-2 transition-colors"
            >
              <span>View Report Pack ({packIds.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. REGULATORY & ARCHIVE DISCLOSURE NOTE                       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        <div className="p-5 rounded-xl bg-white border border-mist text-xs text-ink-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-navy block">Regulatory Reporting Compliance</span>
            <p className="text-[11px] text-ink-subtle">
              Gold Fields Limited is listed on the Johannesburg Stock Exchange (JSE) and the New York Stock Exchange (NYSE). Full historical archives dating back to 1998 are available on the corporate portal.
            </p>
          </div>

          <a
            href="https://www.goldfields.com/archive.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-navy hover:text-gold-dark flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Visit Official Historical Archives</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
