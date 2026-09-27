import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Mail,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';

export function generateStaticParams() {
  const articles = ContentRepository.getNews();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ContentRepository.getNewsBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found — Gold Fields',
    };
  }

  return {
    title: `${article.title} — Gold Fields Media`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [article.image],
    },
  };
}

export default async function MediaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ContentRepository.getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const allNews = ContentRepository.getNews();
  const relatedNews = allNews
    .filter((n) => n.slug !== article.slug)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-editorial">
      {/* ============================================================ */}
      {/* 1. ARTICLE HEADER & BREADCRUMBS                              */}
      {/* ============================================================ */}
      <section className="bg-navy text-white pt-12 pb-16 px-6 border-b border-navy-surface">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Breadcrumb nav */}
          <nav className="flex items-center space-x-2 text-xs text-mist/70">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/media" className="hover:text-white transition-colors">
              Media &amp; News
            </Link>
            <span>/</span>
            <span className="text-gold-light truncate max-w-xs">{article.category}</span>
          </nav>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-mist/80">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-mineral/20 text-gold-light border border-gold-mineral/40">
              {article.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>Published {article.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gold" />
              <span>{article.readTime}</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.18] font-display">
            {article.title}
          </h1>

          {/* Lead Summary paragraph */}
          <p className="text-base sm:text-lg text-mist/95 font-normal leading-relaxed pt-2">
            {article.summary}
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURED IMAGE & EDITORIAL BODY                           */}
      {/* ============================================================ */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Featured Image */}
          <div className="relative h-[340px] sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-elevated border border-mist">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-navy-dark/80 backdrop-blur-xs px-3 py-1.5 rounded-lg text-[11px] text-mist/90">
              Gold Fields Operational Asset Archive
            </div>
          </div>

          {/* Main Article Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Body paragraphs (8 cols) */}
            <div className="lg:col-span-8 space-y-6 text-sm sm:text-base text-ink leading-relaxed">
              {article.content.map((paragraph, idx) => (
                <p key={idx} className="font-normal text-ink/90">
                  {paragraph}
                </p>
              ))}

              {/* Verified Source Citation Card */}
              <div className="mt-8 p-6 rounded-2xl bg-white border border-mist shadow-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest">
                  <ShieldCheck className="w-4 h-4 text-forest" />
                  <span>Verified Corporate Source</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This release reflects authenticated regulatory disclosures issued by Gold Fields Limited. Content has been cross-referenced against Johannesburg Stock Exchange (JSE) and New York Stock Exchange (NYSE) regulatory filings.
                </p>
                <div className="pt-2">
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors"
                  >
                    <span>View original release on official portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Media Contact Card */}
              <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                  Media Enquiries
                </span>
                <h3 className="text-sm font-bold text-navy">Corporate Affairs Office</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  For broadcast inquiries, executive interviews, or supplementary photographic assets:
                </p>

                <div className="space-y-2 pt-2 border-t border-mist/80 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <Mail className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                    <a href="mailto:media@goldfields.com" className="font-semibold hover:underline">
                      media@goldfields.com
                    </a>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Tel: +27 11 562 9763
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="block w-full text-center py-2 px-3 rounded-lg bg-editorial hover:bg-mist text-ink text-xs font-semibold border border-mist transition-colors"
                >
                  Regional Directory
                </Link>
              </div>

              {/* Key Verification Facts */}
              <div className="bg-navy p-6 rounded-2xl text-white space-y-3 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold text-gold-light uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-gold" />
                  <span>Gold Fields Limited</span>
                </div>
                <div className="text-xs text-mist/90 space-y-2 pt-1 border-t border-navy-surface">
                  <div className="flex justify-between">
                    <span className="text-mist/60">Stock Tickers:</span>
                    <span className="font-semibold text-white">JSE: GFI | NYSE: GFI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist/60">Headquarters:</span>
                    <span className="font-semibold text-white">Sandton, South Africa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist/60">Active Mines:</span>
                    <span className="font-semibold text-white">9 Mines &amp; Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. RELATED RELEASES                                          */}
      {/* ============================================================ */}
      <section className="py-16 px-6 bg-white border-t border-mist">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-mist">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-1">
                More Releases
              </span>
              <h2 className="text-2xl font-bold text-navy">Related Media Releases</h2>
            </div>

            <Link
              href="/media"
              className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all releases</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedNews.map((rel) => (
              <div
                key={rel.id}
                className="p-5 rounded-2xl bg-editorial border border-mist hover:border-gold-mineral transition-colors shadow-subtle flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">
                    {rel.category} • {rel.date}
                  </span>
                  <h3 className="text-sm font-bold text-navy group-hover:text-gold-dark transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-ink-muted line-clamp-3 leading-relaxed">
                    {rel.summary}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-mist/80">
                  <Link
                    href={`/media/${rel.slug}`}
                    className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                  >
                    <span>Read Release</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
