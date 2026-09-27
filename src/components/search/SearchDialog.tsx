'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, MapPin, FileText, Newspaper, Leaf, ArrowRight } from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof ContentRepository.search>>({
    operations: [],
    reports: [],
    news: [],
    sustainability: [],
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled externally or trigger custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim()) {
      setResults(ContentRepository.search(query));
    } else {
      setResults({ operations: [], reports: [], news: [], sustainability: [] });
    }
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.operations.length +
    results.reports.length +
    results.news.length +
    results.sustainability.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-elevated overflow-hidden z-10 border border-mist animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-mist bg-editorial/60">
          <Search className="w-5 h-5 text-ink-muted mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search operations, results, sustainability, announcements..."
            className="flex-1 bg-transparent text-sm text-ink placeholder-ink-subtle focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-ink-muted hover:text-ink mr-2 text-xs"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-mist transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-ink-muted">
              <p className="font-semibold text-ink mb-1">Quick Search Across Gold Fields</p>
              <p>Type keywords like <span className="font-mono text-navy font-medium">South Deep</span>, <span className="font-mono text-navy font-medium">H1 2026</span>, <span className="font-mono text-navy font-medium">Decarbonization</span>, or <span className="font-mono text-navy font-medium">Tarkwa</span>.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-ink-muted">
              <p className="font-semibold text-ink text-sm mb-1">No matching results found</p>
              <p>Try searching for operational regions, financial periods, or ESG topics.</p>
            </div>
          ) : (
            <>
              {/* Operations Results */}
              {results.operations.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gold-dark" />
                    Operations ({results.operations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.operations.map((op) => (
                      <Link
                        key={op.id}
                        href={`/operations/${op.slug}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-mist-light border border-transparent hover:border-mist transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink group-hover:text-navy">
                            {op.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {op.country} • {op.type} • Attributable H1: {op.attributableProductionH1_2026}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-navy transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Results */}
              {results.reports.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-navy" />
                    Reports & Results ({results.reports.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.reports.map((report) => (
                      <Link
                        key={report.id}
                        href="/reports"
                        onClick={onClose}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-mist-light border border-transparent hover:border-mist transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink group-hover:text-navy">
                            {report.title}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {report.period} • {report.category} • {report.fileFormat}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-navy transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sustainability Results */}
              {results.sustainability.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-forest" />
                    Sustainability Targets ({results.sustainability.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.sustainability.map((target) => (
                      <Link
                        key={target.id}
                        href="/sustainability"
                        onClick={onClose}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-mist-light border border-transparent hover:border-mist transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink group-hover:text-navy">
                            {target.title}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {target.pillar} • 2030 Target • Actual: {target.latestActual.value}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-navy transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* News Results */}
              {results.news.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-ink-muted" />
                    News & Releases ({results.news.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.news.map((item) => (
                      <Link
                        key={item.id}
                        href={`/media/${item.slug}`}
                        onClick={onClose}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-mist-light border border-transparent hover:border-mist transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink group-hover:text-navy">
                            {item.title}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {item.category} • {item.date}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-navy transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-editorial border-t border-mist flex items-center justify-between text-[11px] text-ink-muted">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-mist rounded text-[10px]">Esc</kbd> to exit</span>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="font-medium text-navy hover:text-gold-dark inline-flex items-center gap-1"
          >
            Open full search page <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
