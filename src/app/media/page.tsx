'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  ExternalLink,
  Mail,
  Phone,
  FileDown,
  Sparkles
} from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';

const CATEGORIES = [
  'All',
  'Media Release',
  'SENS Announcement',
  'Achievement',
  'Our Stories',
];

export default function MediaListPage() {
  const allArticles = useMemo(() => ContentRepository.getNews(), []);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchCategory =
        selectedCategory === 'All' || article.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [allArticles, selectedCategory, searchQuery]);

  const featuredArticle = allArticles[0]; // South Deep wage agreement or H1 results
  const otherArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  const handleAskAIAboutNews = () => {
    window.dispatchEvent(
      new CustomEvent('open-assistant', {
        detail: {
          prompt: 'Summarize the latest media releases and announcements from Gold Fields.',
          context: 'Media & Announcements',
        },
      })
    );
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. HERO HEADER                                               */}
      {/* ============================================================ */}
      <section className="bg-navy py-16 px-6 text-white border-b border-navy-surface">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest">
            <Newspaper className="w-3.5 h-3.5 text-gold" />
            <span>Newsroom &amp; Media Centre</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
            Media Releases &amp; Announcements
          </h1>

          <p className="text-sm sm:text-base text-mist/90 max-w-2xl leading-relaxed">
            Stay informed with verified operational announcements, financial results, labor agreements, renewable energy milestones, and corporate governance updates.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. MEDIA SPOKESPERSON & CONTACT BAR                          */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist py-4 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between text-xs gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-bold text-navy">Media Spokesperson:</span>
            <div className="flex items-center gap-1.5 text-ink">
              <Mail className="w-3.5 h-3.5 text-gold-dark" />
              <a href="mailto:media@goldfields.com" className="font-semibold hover:underline">
                media@goldfields.com
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Phone className="w-3.5 h-3.5 text-ink-subtle" />
              <span>+27 11 562 9763 (Sven Lunsche)</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold text-ink-muted">
            <button
              onClick={handleAskAIAboutNews}
              className="text-navy hover:text-gold-dark inline-flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
              <span>Ask AI to Summarize Releases</span>
            </button>
            <span className="text-mist">|</span>
            <Link href="/reports" className="hover:text-navy">
              Report Suite
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CATEGORY FILTERS & SEARCH BAR                             */}
      {/* ============================================================ */}
      <section className="py-6 px-6 bg-editorial border-b border-mist">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-navy text-white shadow-subtle'
                    : 'bg-white text-ink-muted hover:text-navy border border-mist'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px] sm:w-80">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search media releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-mist rounded-lg text-ink focus:outline-none focus:border-gold-mineral placeholder:text-ink-subtle"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-ink-subtle hover:text-ink font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ARTICLES LIST / GRID                                      */}
      {/* ============================================================ */}
      <section className="py-16 px-6 bg-editorial min-h-[500px]">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Featured Headline Story (When filter is All and search is empty) */}
          {selectedCategory === 'All' && !searchQuery.trim() && featuredArticle && (
            <div className="bg-white rounded-3xl border border-mist overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-12 gap-0 group">
              <div className="lg:col-span-7 relative min-h-[320px] lg:min-h-[420px]">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                  Featured {featuredArticle.category}
                </span>
              </div>

              <div className="lg:col-span-5 p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{featuredArticle.date}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-dark" />
                      <span>{featuredArticle.readTime}</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-navy leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed line-clamp-4">
                    {featuredArticle.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-mist/80 flex items-center justify-between">
                  <Link
                    href={`/media/${featuredArticle.slug}`}
                    className="px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-subtle transition-all inline-flex items-center gap-2 group-hover:shadow-card"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={featuredArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ink-muted hover:text-navy inline-flex items-center gap-1"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Other Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-mist">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                {selectedCategory === 'All' && !searchQuery.trim()
                  ? 'All Corporate Releases & Operational Milestones'
                  : `Filtered Releases (${filteredArticles.length})`}
              </span>
              <span className="text-xs text-ink-subtle">
                Showing {filteredArticles.length} publications
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-mist p-12 text-center space-y-3">
                <Newspaper className="w-12 h-12 text-ink-subtle mx-auto stroke-1" />
                <h3 className="text-lg font-bold text-navy">No articles match your criteria</h3>
                <p className="text-xs text-ink-muted">
                  Try adjusting your search query or selecting &quot;All&quot; categories.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedCategory === 'All' && !searchQuery.trim()
                  ? otherArticles
                  : filteredArticles
                ).map((article) => (
                  <div
                    key={article.id}
                    className="p-0 rounded-2xl bg-white border border-mist hover:border-gold-mineral overflow-hidden shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="relative h-48 w-full overflow-hidden bg-navy">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                        {article.category}
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-ink-muted">
                          <span>{article.date}</span>
                          <span>{article.readTime}</span>
                        </div>

                        <h3 className="text-base font-bold text-navy group-hover:text-gold-dark transition-colors leading-snug line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-mist/80 flex items-center justify-between text-xs">
                        <Link
                          href={`/media/${article.slug}`}
                          className="font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1.5"
                        >
                          <span>Read Full Release</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. MEDIA ASSETS & ACCREDITATION FOOTER                       */}
      {/* ============================================================ */}
      <section className="py-14 px-6 bg-white border-t border-mist">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-navy">
              Journalist &amp; Media Asset Downloads
            </h3>
            <p className="text-xs text-ink-muted max-w-xl">
              Access high-resolution vector logos, executive leadership portraits, and certified operational photography under corporate press guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-lg bg-editorial hover:bg-mist text-ink text-xs font-semibold border border-mist transition-colors"
            >
              Contact Press Office
            </Link>

            <a
              href="/assets/gold-fields-logo.svg"
              download
              className="px-5 py-2.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download Brand Kit (SVG)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
