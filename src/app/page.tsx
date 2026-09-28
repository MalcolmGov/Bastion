import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Download,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Briefcase,
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';
import { OperationsMap } from '@/components/map/OperationsMap';

export default function HomePage() {
  const operations = ContentRepository.getOperations();
  const reports = ContentRepository.getReports();
  const news = ContentRepository.getNews();

  const h1Report = reports.find((r) => r.id === 'h1-2026-booklet') || reports[0];
  const primaryNews = news[0];
  const secondaryNews = news.slice(1, 3);

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* A. CINEMATIC HERO SECTION                                     */}
      {/* ============================================================ */}
      <section className="relative min-h-[680px] lg:min-h-[760px] flex items-center bg-navy-dark overflow-hidden">
        {/* Authentic Background Hero Image */}
        <div className="absolute inset-0">
          <Image
            src="/assets/goldfields-3d-mining-hero.jpg"
            alt="Gold Fields 3D Sustainable Mining Flagship Landscape"
            fill
            priority
            className="object-cover object-center opacity-95"
          />
          {/* Controlled Navy Gradient Overlay (protects text on left, leaves landscape clear on right) */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/80 via-40% to-transparent lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-transparent to-black/20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-28 relative z-10 w-full">
          <div className="max-w-2xl lg:max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy/80 border border-turquoise/40 text-turquoise-bright text-xs font-semibold uppercase tracking-widest backdrop-blur-xs shadow-[0_0_15px_rgba(0,229,192,0.2)]">
              <span className="w-2 h-2 rounded-full bg-turquoise-bright animate-pulse" />
              <span>Gold Fields Flagship</span>
              <span className="text-white/40">•</span>
              <span>Global Production</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] max-w-2xl font-display">
              Creating enduring value <br />
              <span className="text-turquoise-bright font-normal italic">beyond mining.</span>
            </h1>

            <p className="text-base sm:text-lg text-mist/90 max-w-xl font-normal leading-relaxed">
              Discover our globally diversified operations, our workforce of over 20,000 people, and the sustainable economic value we generate across six mining jurisdictions.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/operations"
                className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 hover:brightness-110 text-navy-dark font-extrabold text-sm shadow-[0_0_25px_rgba(0,229,192,0.4)] hover:shadow-[0_0_35px_rgba(0,229,192,0.6)] transition-all duration-200 flex items-center gap-2 group"
              >
                <span>Explore our operations</span>
                <ArrowRight className="w-4 h-4 text-navy-dark group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/investors"
                className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-turquoise/30 hover:border-turquoise backdrop-blur-xs transition-colors flex items-center gap-2"
              >
                <span>View latest results</span>
                <ChevronRight className="w-4 h-4 text-turquoise-bright" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* B. MARKET & REPORTING STRIP                                   */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist py-3.5 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          {/* Ticker Snapshot */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy">JSE: GFI</span>
              <span className="font-mono text-ink tabular-nums font-semibold">ZAR 285.50</span>
              <span className="text-forest text-[11px] font-semibold">+1.85%</span>
            </div>
            <span className="text-mist hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-navy">NYSE: GFI</span>
              <span className="font-mono text-ink tabular-nums font-semibold">USD 16.20</span>
              <span className="text-forest text-[11px] font-semibold">+1.45%</span>
            </div>
            <span className="text-[10px] text-ink-subtle italic hidden lg:inline">
              *Illustrative market data for concept demonstration
            </span>
          </div>

          {/* Direct Quick Shortcuts */}
          <div className="flex items-center space-x-6 text-xs text-ink-muted">
            <Link href="/investors" className="hover:text-navy transition-colors font-medium">
              Financial Calendar
            </Link>
            <Link href="/reports" className="hover:text-navy transition-colors font-medium">
              Annual Report Suite
            </Link>
            <Link
              href="/sustainability#targets"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-turquoise-light text-turquoise-dark font-bold border border-turquoise/30 hover:bg-turquoise hover:text-white transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
              <span>2030 ESG Targets</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* C. PURPOSE IN ACTION (EDITORIAL SPLIT)                       */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-editorial">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Text (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
                <span>Responsible Mining Leadership</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight leading-tight">
                A sustainable future built on safety, integrity, and shared stakeholder value.
              </h2>

              <p className="text-sm text-ink-muted leading-relaxed">
                At Gold Fields, mining is the catalyst for broader societal transformation. We invest in renewable microgrids, host community supplier development, education trusts, and closed-loop water stewardship to ensure our operations leave lasting prosperity.
              </p>

              {/* 3 Source-Backed Facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-mist">
                <div className="bg-white p-4 rounded-xl border border-mist shadow-subtle">
                  <span className="text-2xl font-bold text-navy block tabular-nums">\$914M</span>
                  <span className="text-xs text-ink-muted mt-1 block">
                    Shared value created for host communities in 2025
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-mist shadow-subtle">
                  <span className="text-2xl font-bold text-navy block tabular-nums">78%</span>
                  <span className="text-xs text-ink-muted mt-1 block">
                    Water recycled across group operations (H1 2026)
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-mist shadow-subtle">
                  <span className="text-2xl font-bold text-navy block tabular-nums">110k t</span>
                  <span className="text-xs text-ink-muted mt-1 block">
                    Annual CO2e abated by South Deep Khanyisa Solar
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center text-xs font-bold text-navy hover:text-gold-dark transition-colors gap-1.5"
                >
                  <span>Explore our purpose, strategy and governance</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Substantial Authentic Photography (6 cols) */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-[440px] w-full rounded-2xl overflow-hidden shadow-elevated border border-mist">
                <Image
                  src="/assets/home-stakeholders.png"
                  alt="Gold Fields Community & Workplace Partnership"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Verified Badge */}
              <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-xl shadow-card border border-mist max-w-xs hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-light text-forest flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy">Zero Fatalities (H1 2026)</h4>
                    <p className="text-[11px] text-ink-muted">
                      Courageous safety leadership across all operations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* D. EXPLORE OUR GLOBAL PORTFOLIO (SVG MAP COMPONENT)          */}
      {/* ============================================================ */}
      <OperationsMap operations={operations} />

      {/* ============================================================ */}
      {/* E. LATEST RESULTS & REPORTING SUITE                          */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-mist">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
                Financial Disclosures
              </span>
              <h2 className="text-3xl font-bold text-navy">
                Latest Results & Corporate Reporting
              </h2>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-navy hover:text-gold-dark inline-flex items-center gap-1 mt-4 md:mt-0"
            >
              <span>View complete report archive</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Executive Results Disclosure Spotlight Card (Moved from Hero) */}
            <div className="lg:col-span-5 bg-navy rounded-2xl border border-turquoise/30 p-6 sm:p-8 shadow-elevated text-white flex flex-col justify-between shadow-[0_0_30px_rgba(0,179,152,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400" />
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-mist/10 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-turquoise-bright flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-turquoise-bright" />
                    Latest Corporate Disclosure
                  </span>
                  <span className="text-[10px] text-mist/70 bg-navy-surface px-2.5 py-1 rounded font-medium">
                    25 Aug 2026
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white leading-snug">
                    H1 2026 Financial & Operational Results
                  </h3>
                  <p className="text-xs text-mist/85 mt-2 leading-relaxed">
                    Six months ended 30 June 2026: 1.06Moz attributable gold production, stable South Deep output, and disciplined capital allocation.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-mist/10 text-xs">
                  <div className="bg-navy-surface/80 p-3 rounded-xl border border-mist/10">
                    <span className="text-[10px] text-mist/70 block uppercase tracking-wider">Group Output</span>
                    <span className="text-lg font-bold text-white tabular-nums">1.06 Moz</span>
                  </div>
                  <div className="bg-navy-surface/80 p-3 rounded-xl border border-mist/10">
                    <span className="text-[10px] text-mist/70 block uppercase tracking-wider">South Deep</span>
                    <span className="text-lg font-bold text-white tabular-nums">151 koz</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-mist/10 flex items-center justify-between text-xs">
                <Link
                  href="/investors"
                  className="font-bold text-turquoise-bright hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Full H1 Overview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href="https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist hover:text-white inline-flex items-center gap-1 text-[11px] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF (3.8MB)</span>
                </a>
              </div>
            </div>

            {/* Primary Feature Report (7 cols) */}
            <div className="lg:col-span-7 bg-editorial rounded-2xl border border-mist p-6 sm:p-8 shadow-card flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-navy text-white">
                    Primary Disclosure
                  </span>
                  <span className="text-xs text-ink-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Published 25 August 2026
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-navy">
                  {h1Report.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {h1Report.summary}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-navy block">Key Disclosures:</span>
                  <ul className="space-y-1.5 text-xs text-ink-muted">
                    {h1Report.keyHighlights.slice(0, 3).map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-mist flex flex-wrap items-center gap-3">
                <a
                  href={h1Report.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report ({h1Report.fileSize})</span>
                </a>

                <Link
                  href="/investors"
                  className="px-4 py-2.5 rounded-lg bg-white hover:bg-mist text-ink text-xs font-semibold border border-mist transition-colors"
                >
                  Investor Presentation
                </Link>
              </div>
            </div>
          </div>

          {/* Related Reporting Documents below (3-column layout) */}
          <div className="mt-8 pt-8 border-t border-mist">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
              Related Reporting Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reports.slice(1, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-xl bg-white border border-mist hover:border-gold-mineral transition-colors shadow-subtle group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-ink-muted mb-2">
                      <span className="font-semibold text-gold-dark uppercase tracking-wider">
                        {r.category}
                      </span>
                      <span>{r.date}</span>
                    </div>
                    <h5 className="text-sm font-bold text-ink group-hover:text-navy transition-colors">
                      {r.title}
                    </h5>
                    <p className="text-xs text-ink-muted line-clamp-2 mt-2 leading-relaxed">
                      {r.summary}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-mist/50 text-xs">
                    <span className="text-[11px] text-ink-subtle">
                      {r.fileFormat} • {r.fileSize}
                    </span>
                    <a
                      href={r.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                    >
                      <span>Access</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* F. SUSTAINABILITY & SHARED VALUE (EDITORIAL MOSAIC)           */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-editorial border-t border-mist">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-forest block mb-2">
              Environmental, Social & Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              Sustainability Grounded in Science & Accountability
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Our 2030 ESG targets represent verifiable commitments to climate resilience, community prosperity, water stewardship, and workforce safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tile 1: Decarbonization */}
            <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-xl overflow-hidden">
                  <Image
                    src="/assets/home-climate.png"
                    alt="Renewable Energy Decarbonization"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                    Decarbonization
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy">
                  30% Net Emission Reduction by 2030
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Transitioning to clean microgrids. As of H1 2026, absolute Scope 1 and 2 emissions stand at 1.28 Mt CO2e (26.4% reduction against 2016 baseline).
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist flex items-center justify-between text-xs">
                <span className="text-forest font-semibold">Status: On Track</span>
                <Link href="/sustainability#decarbonization" className="font-bold text-navy hover:text-gold-dark">
                  Details →
                </Link>
              </div>
            </div>

            {/* Tile 2: Water Stewardship (Authentic Turquoise Accent) */}
            <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card hover:border-turquoise/40 transition-all">
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-xl overflow-hidden">
                  <Image
                    src="/assets/chile-ops-image.png"
                    alt="Water Stewardship and Dry Stack Tailings at Salares Norte"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-turquoise-dark text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Water Stewardship
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy">
                  80%+ Recycled Water by 2030
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Closed-circuit catchment recycling and zero untreated water discharge. 78% of group water recycled or reused in H1 2026 across water-stressed regions.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist flex items-center justify-between text-xs">
                <span className="text-turquoise-dark font-semibold">Status: 78% Achieved</span>
                <Link href="/sustainability#water" className="font-bold text-turquoise-dark hover:underline">
                  Details →
                </Link>
              </div>
            </div>

            {/* Tile 3: Tailings Stewardship */}
            <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-xl overflow-hidden">
                  <Image
                    src="/assets/home-esg.png"
                    alt="Tailings Storage Management"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                    Tailings Safety (GISTM)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy">
                  Global Tailings Standard Conformance
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  100% of extreme and very high consequence Tailings Storage Facilities (TSFs) independently audited and conforming to the Global Industry Standard on Tailings Management.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist flex items-center justify-between text-xs">
                <span className="text-forest font-semibold">Status: 100% Conforming</span>
                <Link href="/sustainability#tailings" className="font-bold text-navy hover:text-gold-dark">
                  Details →
                </Link>
              </div>
            </div>

            {/* Tile 4: Host Communities */}
            <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-xl overflow-hidden">
                  <Image
                    src="/assets/home-employee.png"
                    alt="Host Community Shared Value"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                    Community Value
                  </span>
                </div>
                <h3 className="text-lg font-bold text-navy">
                  Host Community Spend Exceeding 34%
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Prioritizing local enterprise development, youth employment, and educational trusts across Westonaria, Tarkwa, and remote Western Australia.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist flex items-center justify-between text-xs">
                <span className="text-forest font-semibold">34% In-Country Spend</span>
                <Link href="/sustainability#community" className="font-bold text-navy hover:text-gold-dark">
                  Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* G. NEWS & PERSPECTIVES                                       */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-white border-t border-mist">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-mist">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
                Corporate Announcements
              </span>
              <h2 className="text-3xl font-bold text-navy">
                News, Media Releases & Insights
              </h2>
            </div>
            <Link
              href="/media"
              className="text-xs font-semibold text-navy hover:text-gold-dark inline-flex items-center gap-1 mt-4 md:mt-0"
            >
              <span>View all media releases</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary Feature Story (7 cols) */}
            <div className="lg:col-span-7 bg-editorial rounded-2xl border border-mist overflow-hidden shadow-card flex flex-col justify-between">
              <div className="relative h-64 w-full">
                <Image
                  src={primaryNews.image}
                  alt={primaryNews.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                  {primaryNews.category}
                </span>
              </div>
              <div className="p-6 sm:p-8 space-y-3">
                <span className="text-xs text-ink-muted">{primaryNews.date} • {primaryNews.readTime}</span>
                <h3 className="text-2xl font-bold text-navy leading-snug">
                  {primaryNews.title}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {primaryNews.summary}
                </p>
                <div className="pt-4">
                  <Link
                    href={`/media/${primaryNews.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors"
                  >
                    <span>Read full article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Secondary Stories (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {secondaryNews.map((article) => (
                <div
                  key={article.id}
                  className="p-5 rounded-2xl bg-editorial border border-mist hover:border-gold-mineral transition-colors shadow-subtle flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span className="font-semibold text-gold-dark uppercase tracking-wider">
                        {article.category}
                      </span>
                      <span>{article.date}</span>
                    </div>
                    <h4 className="text-base font-bold text-navy leading-snug">
                      {article.title}
                    </h4>
                    <p className="text-xs text-ink-muted line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-mist/60">
                    <Link
                      href={`/media/${article.slug}`}
                      className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                    >
                      <span>Read article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* H. PEOPLE & PARTNERSHIPS (CAREERS & SUPPLIERS DUAL BLOCKS)     */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-editorial border-t border-mist">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Careers Block */}
            <div className="bg-white rounded-2xl border border-mist p-8 shadow-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold-dark flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="text-2xl font-bold text-navy">
                  Careers & Workplace Culture
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Join a global community of innovators, engineers, and geologists working across mechanized underground operations, renewable microgrids, and advanced mineral processing.
                </p>
                <div className="space-y-2 pt-2 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    <span>Equal opportunity employer with 26.2% female workforce representation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    <span>Global talent development and mechanized skills academies</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-mist flex flex-col sm:flex-row gap-3">
                <Link
                  href="/careers"
                  className="px-5 py-2.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold text-center transition-colors"
                >
                  Explore Careers & Vacancies
                </Link>
              </div>
            </div>

            {/* Suppliers Block */}
            <div className="bg-white rounded-2xl border border-mist p-8 shadow-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
                  <Layers className="w-6 h-6 text-navy" />
                </div>
                <h3 className="text-2xl font-bold text-navy">
                  Suppliers & Transparent Procurement
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  We foster competitive, ethical, and transparent commercial partnerships. Prospective vendors can review localized prequalification checklists and compliance requirements across South Africa, Ghana, Australia, and the Americas.
                </p>
                <div className="space-y-2 pt-2 text-xs text-ink-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    <span>Rigorous adherence to anti-bribery and mining safety standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest" />
                    <span>Prioritizing registered host community suppliers</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-mist flex flex-col sm:flex-row gap-3">
                <Link
                  href="/suppliers"
                  className="px-5 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold text-center transition-colors"
                >
                  Supplier Guidelines & Checklist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* I. CLOSING CORPORATE PURPOSE STATEMENT                       */}
      {/* ============================================================ */}
      <section className="bg-navy py-16 px-6 text-white text-center border-t border-navy-surface">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-light">
            Enduring Value Beyond Mining
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            “If we cannot mine safely, we will not mine.”
          </h2>
          <p className="text-xs text-mist/80 max-w-xl mx-auto leading-relaxed">
            Safety, integrity, responsibility, and collaboration remain the foundation of every ton mined and every partnership formed across Gold Fields.
          </p>
        </div>
      </section>
    </div>
  );
}
