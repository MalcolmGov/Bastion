'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search as SearchIcon,
  X,
  FileText,
  Globe,
  Newspaper,
  Leaf,
  Download,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';

const SUGGESTED_SEARCHES = [
  'H1 2026',
  'South Deep',
  'Khanyisa Solar',
  'Salares Norte',
  'Water Recycling',
  'Tarkwa',
  'Decarbonization',
  'Coupa',
  'Wage Agreement',
  'ISO 55001',
];

type SearchCategoryTab = 'all' | 'operations' | 'reports' | 'news' | 'sustainability';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchCategoryTab>('all');

  // Synchronize with URL query parameter changes
  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    setQuery(currentQ);
  }, [searchParams]);

  // Execute grouped search via ContentRepository
  const searchResults = useMemo(() => {
    return ContentRepository.search(query);
  }, [query]);

  const totalResults =
    searchResults.operations.length +
    searchResults.reports.length +
    searchResults.news.length +
    searchResults.sustainability.length;

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    } else {
      params.delete('q');
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const handleSuggestedClick = (term: string) => {
    handleQueryChange(term);
  };

  const handleClear = () => {
    handleQueryChange('');
  };

  const handleAskAIWithQuery = () => {
    window.dispatchEvent(
      new CustomEvent('open-assistant', {
        detail: {
          prompt: query
            ? `Tell me what Gold Fields discloses regarding "${query}".`
            : 'What are the most recent operational and financial updates?',
          context: 'Search',
        },
      })
    );
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. SEARCH HEADER & INPUT                                     */}
      {/* ============================================================ */}
      <section className="bg-navy py-14 px-6 text-white border-b border-navy-surface">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-light">
              Corporate Knowledge Index
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
              Search Gold Fields
            </h1>
            <p className="text-xs sm:text-sm text-mist/80 max-w-xl">
              Search operations, financial reports, SENS announcements, sustainability targets, and supplier pre-qualification documents.
            </p>
          </div>

          {/* Search Box Input */}
          <div className="relative">
            <SearchIcon className="w-5 h-5 text-gold absolute left-4 top-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by mine, mineral, report period, or keyword (e.g., South Deep, H1 2026, Solar)..."
              className="w-full pl-12 pr-12 py-3.5 bg-white text-ink text-sm sm:text-base rounded-2xl border-2 border-transparent focus:border-gold focus:outline-none shadow-elevated placeholder:text-ink-subtle"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-3.5 text-ink-subtle hover:text-ink p-1 rounded-full hover:bg-mist transition-colors"
                aria-label="Clear search query"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Suggested Searches Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-mist/70 font-semibold flex items-center gap-1 mr-1">
              <span>Suggested:</span>
            </span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestedClick(term)}
                className={`px-3 py-1 rounded-full transition-all text-xs ${
                  query.toLowerCase() === term.toLowerCase()
                    ? 'bg-gold text-navy-dark font-bold shadow-subtle'
                    : 'bg-navy-surface text-mist hover:bg-navy-light hover:text-white border border-mist/10'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. RESULTS FILTER TABS & SUMMARY                            */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist py-4 px-6 shadow-subtle sticky top-20 z-20 backdrop-blur-md bg-white/95">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-navy text-white font-bold'
                  : 'text-ink-muted hover:text-navy hover:bg-mist-light'
              }`}
            >
              <span>All Results</span>
              {query && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current font-mono">
                  {totalResults}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('operations')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'operations'
                  ? 'bg-navy text-white font-bold'
                  : 'text-ink-muted hover:text-navy hover:bg-mist-light'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Operations</span>
              {query && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-mist text-ink-muted font-mono">
                  {searchResults.operations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-navy text-white font-bold'
                  : 'text-ink-muted hover:text-navy hover:bg-mist-light'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Reports</span>
              {query && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-mist text-ink-muted font-mono">
                  {searchResults.reports.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'news'
                  ? 'bg-navy text-white font-bold'
                  : 'text-ink-muted hover:text-navy hover:bg-mist-light'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News</span>
              {query && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-mist text-ink-muted font-mono">
                  {searchResults.news.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('sustainability')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'sustainability'
                  ? 'bg-navy text-white font-bold'
                  : 'text-ink-muted hover:text-navy hover:bg-mist-light'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Sustainability</span>
              {query && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-mist text-ink-muted font-mono">
                  {searchResults.sustainability.length}
                </span>
              )}
            </button>
          </div>

          {/* AI Trigger */}
          {query && (
            <button
              onClick={handleAskAIWithQuery}
              className="text-xs font-bold text-navy hover:text-gold-dark transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
              <span>Ask AI about &ldquo;{query}&rdquo;</span>
            </button>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SEARCH RESULTS OR EMPTY STATES                            */}
      {/* ============================================================ */}
      <section className="py-12 px-6 bg-editorial min-h-[500px]">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Case A: Query is empty */}
          {!query.trim() && (
            <div className="bg-white rounded-2xl border border-mist p-10 sm:p-12 text-center space-y-6 shadow-subtle">
              <div className="w-16 h-16 rounded-2xl bg-editorial mx-auto flex items-center justify-center text-ink-subtle">
                <SearchIcon className="w-8 h-8 stroke-1 text-gold-dark" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-navy">
                  Search Gold Fields Corporate Information
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Enter a keyword or click one of the suggested topics above to find verified operations, publications, SENS regulatory updates, and sustainability performance.
                </p>
              </div>

              {/* Quick links grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
                <Link
                  href="/operations"
                  className="p-4 rounded-xl bg-editorial hover:bg-mist/70 border border-mist transition-colors group"
                >
                  <Globe className="w-5 h-5 text-navy mb-2" />
                  <h4 className="text-xs font-bold text-navy group-hover:text-gold-dark">
                    Operations Portfolio
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Mines across South Africa, Australia, Ghana, Chile, Peru &amp; Canada.
                  </p>
                </Link>

                <Link
                  href="/reports"
                  className="p-4 rounded-xl bg-editorial hover:bg-mist/70 border border-mist transition-colors group"
                >
                  <FileText className="w-5 h-5 text-navy mb-2" />
                  <h4 className="text-xs font-bold text-navy group-hover:text-gold-dark">
                    Report Archive
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    H1 2026 Results, Annual Integrated Reports, and presentations.
                  </p>
                </Link>

                <Link
                  href="/sustainability"
                  className="p-4 rounded-xl bg-editorial hover:bg-mist/70 border border-mist transition-colors group"
                >
                  <Leaf className="w-5 h-5 text-forest mb-2" />
                  <h4 className="text-xs font-bold text-navy group-hover:text-gold-dark">
                    2030 ESG Targets
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Decarbonization, water recycling, and GISTM tailings safety.
                  </p>
                </Link>
              </div>
            </div>
          )}

          {/* Case B: Query entered but total results = 0 */}
          {query.trim() && totalResults === 0 && (
            <div className="bg-white rounded-2xl border border-mist p-10 sm:p-12 text-center space-y-6 shadow-subtle">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 mx-auto flex items-center justify-center text-amber-700">
                <Filter className="w-7 h-7 stroke-1" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-navy">
                  No matching results for &ldquo;{query}&rdquo;
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  We could not find an exact match across published operations, reports, or media releases.
                </p>
              </div>

              <div className="p-4 bg-editorial rounded-xl border border-mist max-w-md mx-auto text-xs text-left space-y-1.5 text-ink-muted">
                <span className="font-bold text-navy block text-[11px] uppercase tracking-wider">
                  Suggestions:
                </span>
                <p>• Check spelling or try using broader keywords like &quot;solar&quot;, &quot;wage&quot;, or &quot;Deep&quot;.</p>
                <p>• Search by country name: &quot;South Africa&quot;, &quot;Australia&quot;, &quot;Ghana&quot;, or &quot;Chile&quot;.</p>
                <p>• Or let our AI assistant analyze corporate sources for you.</p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleAskAIWithQuery}
                  className="px-5 py-2.5 rounded-lg bg-navy hover:bg-navy-light text-white font-bold text-xs transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Ask AI Assistant</span>
                </button>

                <button
                  onClick={handleClear}
                  className="px-5 py-2.5 rounded-lg bg-editorial hover:bg-mist text-ink font-semibold text-xs border border-mist transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Case C: Has results -> Grouped Results Display */}
          {query.trim() && totalResults > 0 && (
            <div className="space-y-10">
              {/* Group 1: Operations */}
              {(activeTab === 'all' || activeTab === 'operations') &&
                searchResults.operations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-mist">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-navy" />
                        <h3 className="text-base font-bold text-navy">
                          Operations &amp; Projects ({searchResults.operations.length})
                        </h3>
                      </div>
                      <Link
                        href="/operations"
                        className="text-xs text-navy font-semibold hover:text-gold-dark"
                      >
                        All Operations →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.operations.map((op) => (
                        <div
                          key={op.id}
                          className="p-5 rounded-2xl bg-white border border-mist hover:border-gold-mineral transition-colors shadow-subtle flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-gold-dark">
                                {op.country} • {op.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  op.status === 'Active'
                                    ? 'bg-forest-light text-forest'
                                    : 'bg-mist text-ink-muted'
                                }`}
                              >
                                {op.status}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-navy group-hover:text-gold-dark transition-colors">
                              {op.name}
                            </h4>

                            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                              {op.overview}
                            </p>

                            <div className="pt-2 text-xs text-ink-subtle">
                              <strong className="text-ink">H1 2026 Output:</strong>{' '}
                              {op.attributableProductionH1_2026}
                            </div>
                          </div>

                          <div className="pt-4 mt-3 border-t border-mist/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-ink-subtle">
                              {op.ownership}
                            </span>
                            <a
                              href={op.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Group 2: Reports */}
              {(activeTab === 'all' || activeTab === 'reports') &&
                searchResults.reports.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-mist">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-navy" />
                        <h3 className="text-base font-bold text-navy">
                          Reports &amp; Corporate Filings ({searchResults.reports.length})
                        </h3>
                      </div>
                      <Link
                        href="/reports"
                        className="text-xs text-navy font-semibold hover:text-gold-dark"
                      >
                        All Reports →
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {searchResults.reports.map((report) => (
                        <div
                          key={report.id}
                          className="p-5 rounded-2xl bg-white border border-mist hover:border-gold-mineral transition-colors shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                              <span className="font-semibold text-gold-dark uppercase tracking-wider">
                                {report.category}
                              </span>
                              <span>•</span>
                              <span>{report.period}</span>
                              <span>•</span>
                              <span>{report.date}</span>
                            </div>

                            <h4 className="text-base font-bold text-navy group-hover:text-gold-dark transition-colors">
                              {report.title}
                            </h4>

                            <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                              {report.summary}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-3">
                            <span className="text-[11px] text-ink-subtle">
                              {report.fileFormat} ({report.fileSize})
                            </span>
                            <a
                              href={report.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Group 3: News */}
              {(activeTab === 'all' || activeTab === 'news') &&
                searchResults.news.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-mist">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-navy" />
                        <h3 className="text-base font-bold text-navy">
                          News &amp; Media Releases ({searchResults.news.length})
                        </h3>
                      </div>
                      <Link
                        href="/media"
                        className="text-xs text-navy font-semibold hover:text-gold-dark"
                      >
                        All Media Releases →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.news.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl bg-white border border-mist hover:border-gold-mineral transition-colors shadow-subtle flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-ink-muted">
                              <span className="font-semibold text-gold-dark uppercase tracking-wider">
                                {item.category}
                              </span>
                              <span>{item.date}</span>
                            </div>

                            <h4 className="text-base font-bold text-navy group-hover:text-gold-dark transition-colors leading-snug">
                              {item.title}
                            </h4>

                            <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>

                          <div className="pt-4 mt-3 border-t border-mist/80 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-ink-subtle">
                              {item.readTime}
                            </span>
                            <Link
                              href={`/media/${item.slug}`}
                              className="font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                            >
                              <span>Read Full Article</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Group 4: Sustainability */}
              {(activeTab === 'all' || activeTab === 'sustainability') &&
                searchResults.sustainability.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-mist">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-forest" />
                        <h3 className="text-base font-bold text-navy">
                          Sustainability Commitments &amp; 2030 ESG Targets ({searchResults.sustainability.length})
                        </h3>
                      </div>
                      <Link
                        href="/sustainability"
                        className="text-xs text-navy font-semibold hover:text-gold-dark"
                      >
                        All ESG Targets →
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {searchResults.sustainability.map((target) => (
                        <div
                          key={target.id}
                          className="p-5 rounded-2xl bg-white border border-mist shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded bg-forest-light text-forest text-[10px] font-bold uppercase tracking-wider">
                                {target.pillar}
                              </span>
                              <span className="text-ink-muted text-[11px]">
                                Target Year: <strong>{target.targetYear}</strong>
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-navy">
                              {target.title}
                            </h4>

                            <p className="text-xs text-ink-muted leading-relaxed">
                              {target.description}
                            </p>

                            <div className="pt-1 text-xs text-ink-muted flex flex-wrap items-center gap-4">
                              <span>
                                Baseline ({target.baseline.year}):{' '}
                                <strong className="text-ink">{target.baseline.value} {target.baseline.unit}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Latest Actual ({target.latestActual.period}):{' '}
                                <strong className="text-forest">{target.latestActual.value} {target.latestActual.unit}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <span className="px-3 py-1.5 rounded-lg bg-editorial border border-mist text-xs font-bold text-navy inline-flex items-center gap-1">
                              <span>Status: {target.latestActual.status}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="min-h-[500px] flex items-center justify-center bg-editorial">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-ink-muted font-semibold">Loading search index...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
