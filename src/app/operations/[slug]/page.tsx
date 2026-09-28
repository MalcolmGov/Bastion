import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Globe,
  MapPin,
  Pickaxe,
  Zap,
  Users,
  ShieldCheck,
  TrendingUp,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Layers,
  History,
  CheckCircle2,
  Building,
  Compass
} from 'lucide-react';
import {
  getPublishedOperations,
  getPublishedOperationBySlug,
  getPublishedReports
} from '@/lib/server/content';
import { OPERATION_EXTENDED_DATA } from '@/lib/data/operationGeologyData';
import {
  OperationActionButtons,
  OperationQuestionsBox,
} from '@/components/operations/OperationActionButtons';
import { ReportItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata for SEO and page head
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const operation = await getPublishedOperationBySlug(slug);

  if (!operation) {
    return {
      title: 'Operation Not Found | Gold Fields',
    };
  }

  return {
    title: `${operation.name} Mine (${operation.country}) | Gold Fields Operations`,
    description: `${operation.overview.slice(0, 160)}...`,
  };
}

export default async function OperationDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const operation = await getPublishedOperationBySlug(slug, isDraft);

  if (!operation) {
    notFound();
  }

  const allOperations = await getPublishedOperations(isDraft);
  const allReports = await getPublishedReports(isDraft);
  const extendedData = OPERATION_EXTENDED_DATA[operation.slug];

  // Sibling operations in the same region
  const siblingOperations = allOperations.filter(
    (op) => op.region === operation.region && op.id !== operation.id
  );

  // Relevant reports for this asset
  const relatedReports: ReportItem[] = extendedData?.relatedReportIds
    ? extendedData.relatedReportIds
        .map((id) => allReports.find((r) => r.id === id))
        .filter((r): r is ReportItem => r !== undefined)
    : allReports.slice(0, 3);

  const isTransferred = operation.status === 'Transferred';
  const isProject = operation.status === 'Project';

  return (
    <div className="space-y-0 bg-editorial min-h-screen">
      {/* ============================================================ */}
      {/* 1. HERO BANNER                                               */}
      {/* ============================================================ */}
      <section className="relative min-h-[560px] lg:min-h-[620px] flex items-center bg-navy-dark overflow-hidden">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0">
          <Image
            src={operation.image}
            alt={`${operation.name} mining operation`}
            fill
            priority
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
          {/* Breadcrumb Navigation */}
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
              <li>
                <Link href="/operations" className="hover:text-gold transition-colors">
                  Operations
                </Link>
              </li>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-mist/40" />
              </li>
              <li className="text-gold font-medium">{operation.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold text-navy-dark">
                  {operation.type}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs ${
                    isTransferred
                      ? 'bg-amber-600/90 text-white border border-amber-400/40'
                      : isProject
                      ? 'bg-sky-600/90 text-white border border-sky-400/40'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  {operation.status}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-surface text-mist text-xs font-medium border border-mist/10">
                  <Globe className="w-3.5 h-3.5 text-gold" />
                  <span>{operation.country}</span>
                  <span className="text-mist/40">•</span>
                  <span>{operation.region} Region</span>
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-display">
                  {operation.name}
                </h1>
                <p className="text-xs sm:text-sm text-gold-light flex items-center gap-2 font-medium">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span>{operation.locationDetails}</span>
                </p>
              </div>

              {/* Overview Text */}
              <p className="text-sm sm:text-base text-mist/90 max-w-2xl font-normal leading-relaxed">
                {operation.overview}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <OperationActionButtons operation={operation} />

                {operation.officialUrl && (
                  <a
                    href={operation.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg bg-navy-surface hover:bg-navy-surface/80 text-mist hover:text-white text-xs font-semibold border border-mist/15 transition-colors"
                  >
                    <span>Official Webpage</span>
                    <ExternalLink className="w-3.5 h-3.5 text-mist/70" />
                  </a>
                )}
              </div>
            </div>

            {/* Right Production & Ownership Card */}
            <div className="lg:col-span-4">
              <div className="bg-navy/85 backdrop-blur-md rounded-2xl border border-mist/20 p-6 shadow-elevated text-white space-y-5">
                <div className="flex items-center justify-between border-b border-mist/10 pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gold" />
                    Asset Highlights
                  </span>
                  <span className="text-[10px] text-mist/60 bg-navy-surface px-2 py-0.5 rounded">
                    H1 2026 Disclosures
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-navy-surface/60 p-4 rounded-xl border border-mist/10 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block font-semibold">
                      Attributable Production (H1 2026)
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight block">
                      {operation.attributableProductionH1_2026}
                    </span>
                    <span className="text-[10px] text-mist/60 block">
                      Six months ended 30 June 2026
                    </span>
                  </div>

                  <div className="bg-navy-surface/60 p-4 rounded-xl border border-mist/10 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-mist/70 block font-semibold">
                      Ownership Structure
                    </span>
                    <span className="text-sm sm:text-base font-bold text-gold-light block">
                      {operation.ownership}
                    </span>
                    <span className="text-[10px] text-mist/60 block">
                      Operational Control & Governance
                    </span>
                  </div>
                </div>

                <div className="border-t border-mist/10 pt-3 flex items-center justify-between text-[11px] text-mist/70">
                  <span>Coordinates:</span>
                  <span className="font-mono text-white/90">
                    {operation.coordinates.lat.toFixed(2)}°, {operation.coordinates.lng.toFixed(2)}°
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DAMANG ASSET TRANSITION SPECIAL NOTICE                     */}
      {/* ============================================================ */}
      {isTransferred && (
        <section className="bg-amber-50 border-b border-amber-300 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl border-2 border-amber-400 bg-white p-6 md:p-8 shadow-card flex flex-col md:flex-row items-start gap-5">
              <div className="p-3 rounded-xl bg-amber-100 text-amber-900 shrink-0">
                <History className="w-8 h-8 text-amber-800" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                    Governance Handover Record
                  </span>
                  <h2 className="text-lg font-bold text-ink">
                    Damang Mine Ownership Transferred to Government of Ghana on 18 April 2026
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                  As disclosed in the official Gold Fields H1 2026 Review of Operations (published 25 August 2026), ownership and operational custody of the Damang mine in south-western Ghana was formally concluded and transferred in full to the Government of Ghana on 18 April 2026.
                </p>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Damang was operated by Gold Fields since 2002 and delivered more than 4 million ounces of gold over its operating life. This page is maintained strictly as an immutable public archive for corporate governance, ESG transition transparency, and environmental stewardship integrity.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span className="text-amber-900 bg-amber-100 px-3 py-1 rounded">
                    Transfer Date: 18 April 2026
                  </span>
                  <span className="text-ink-muted">
                    Source: H1 2026 Review of Operations (Page 14)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 3. KEY METRICS GRID                                          */}
      {/* ============================================================ */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-gold-dark" />
            <span>Operational Disclosures</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Key Operational & Workforce Metrics
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl">
            Sourced metrics from operational specifications, regional labor agreements, and H1 2026 published releases.
          </p>
        </div>

        {/* 4-Card Primary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Mining Method */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold">
                Mining Method
              </span>
              <div className="p-2 rounded-lg bg-navy/5 text-navy">
                <Pickaxe className="w-4 h-4 text-gold-dark" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-ink">
                {operation.keyMetrics.find((m) => m.label.includes('Method'))?.value ||
                  operation.type}
              </p>
              <span className="text-xs text-ink-muted block mt-1">
                {operation.keyMetrics.find((m) => m.label.includes('Method'))?.unit ||
                  `${operation.type} Extraction`}
              </span>
            </div>
            <div className="pt-2 border-t border-mist/50 text-[10px] text-ink-subtle">
              Source: Operational Specifications
            </div>
          </div>

          {/* 2. Workforce & Labor */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold">
                Workforce & Stability
              </span>
              <div className="p-2 rounded-lg bg-navy/5 text-navy">
                <Users className="w-4 h-4 text-navy" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-ink">
                {extendedData?.workforce.stability.split('(')[0] ||
                  operation.keyMetrics.find((m) => m.label.includes('Workforce') || m.label.includes('Procurement'))?.value ||
                  'Structured Union Bargaining'}
              </p>
              <span className="text-xs text-ink-muted block mt-1">
                {extendedData?.workforce.nationalShare || 'National & local community representation'}
              </span>
            </div>
            <div className="pt-2 border-t border-mist/50 text-[10px] text-ink-subtle">
              {extendedData?.workforce.safetyMilestone || 'Zero Harm Culture'}
            </div>
          </div>

          {/* 3. Attributable Production */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold">
                Attributable Production
              </span>
              <div className="p-2 rounded-lg bg-navy/5 text-navy">
                <TrendingUp className="w-4 h-4 text-gold-dark" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-ink">
                {operation.attributableProductionH1_2026}
              </p>
              <span className="text-xs text-ink-muted block mt-1">
                {operation.keyMetrics[0]?.period || 'H1 2026 Reporting Period'}
              </span>
            </div>
            <div className="pt-2 border-t border-mist/50 text-[10px] text-ink-subtle">
              {operation.keyMetrics[0]?.source || 'H1 2026 Review of Operations'}
            </div>
          </div>

          {/* 4. Renewables & Energy */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink-subtle font-semibold">
                Decarbonization / Power
              </span>
              <div className="p-2 rounded-lg bg-navy/5 text-navy">
                <Zap className="w-4 h-4 text-forest" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-forest">
                {extendedData?.renewables.capacity.split('(')[0] ||
                  operation.keyMetrics.find((m) => m.label.includes('Renewable') || m.label.includes('Tailings'))?.value ||
                  'Microgrid Integration'}
              </p>
              <span className="text-xs text-ink-muted block mt-1">
                {extendedData?.renewables.impact || 'Scope 1 & 2 carbon abatement'}
              </span>
            </div>
            <div className="pt-2 border-t border-mist/50 text-[10px] text-ink-subtle">
              {extendedData?.renewables.system || 'Clean Energy Infrastructure'}
            </div>
          </div>
        </div>

        {/* Additional Custom Key Metrics (if defined) */}
        {operation.keyMetrics.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {operation.keyMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="bg-editorial p-4 rounded-xl border border-mist/70 flex items-start justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink-subtle block font-semibold">
                    {metric.label}
                  </span>
                  <p className="text-base font-bold text-ink mt-0.5">
                    {metric.value} <span className="text-xs font-normal text-ink-muted">{metric.unit}</span>
                  </p>
                  <p className="text-[10px] text-ink-subtle mt-1">{metric.period}</p>
                </div>
                {metric.scope && (
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-mist text-ink-muted font-medium">
                    {metric.scope}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 4. OPERATIONAL HIGHLIGHTS & GEOLOGY                          */}
      {/* ============================================================ */}
      <section className="bg-white py-16 px-6 border-y border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Operational Highlights (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-semibold uppercase tracking-wider mb-2">
                  <Pickaxe className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Operations & Engineering</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
                  Operational Highlights
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">
                  Key execution milestones, safety records, and technical enhancements.
                </p>
              </div>

              <div className="space-y-4">
                {operation.operationalHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-editorial border border-mist flex items-start gap-3.5 hover:border-gold-mineral transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-navy text-gold shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                        {highlight}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Additional operational details */}
                <div className="p-5 rounded-xl bg-navy/5 border border-navy/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-forest" />
                    Safety & Governance Stewardship
                  </h4>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Operated under Gold Fields&apos; group safety framework with strict adherence to critical controls, automated proximity detection, and continuous health surveillance.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Technical Geology & Deposit Model (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold-dark text-xs font-semibold uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5 text-gold-dark" />
                  <span>Deposit Model & Mineral Reserve</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
                  Geological Setting
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-1">
                  Stratigraphy, structural fault corridors, and mineralisation characteristics.
                </p>
              </div>

              {extendedData?.geology ? (
                <div className="bg-editorial rounded-2xl border border-mist p-6 space-y-5">
                  <div className="border-b border-mist/70 pb-3">
                    <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-bold block">
                      Basin / Mineral Belt
                    </span>
                    <p className="text-base font-bold text-navy mt-0.5">
                      {extendedData.geology.basin}
                    </p>
                    <span className="text-xs text-gold-dark font-medium block">
                      {extendedData.geology.depositType}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed text-ink-muted">
                    <div>
                      <span className="font-bold text-ink block mb-0.5">
                        Stratigraphy & Host Lithology:
                      </span>
                      <p>{extendedData.geology.stratigraphy}</p>
                    </div>

                    <div>
                      <span className="font-bold text-ink block mb-0.5">
                        Mineralisation Style:
                      </span>
                      <p>{extendedData.geology.mineralization}</p>
                    </div>

                    <div>
                      <span className="font-bold text-ink block mb-0.5">
                        Structural Controls & Method:
                      </span>
                      <p>{extendedData.geology.structuralControls}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-mist/60 space-y-1">
                      <span className="font-bold text-navy block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-gold-dark" />
                        Near-Mine Exploration Status
                      </span>
                      <p className="text-[11px] text-ink-muted">
                        {extendedData.geology.explorationStatus}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-editorial rounded-2xl border border-mist p-6 text-xs text-ink-muted leading-relaxed">
                  Geological reserves and mineral resources conform to the SAMREC, JORC, and NI 43-101 international reporting codes under independent competent person supervision.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SUSTAINABILITY & COMMUNITY INVESTMENTS                    */}
      {/* ============================================================ */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-forest" />
            <span>ESG & Decarbonization</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
            Sustainability & Community Shared Value
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-2xl">
            Investing in enduring value through renewable energy microgrids, community trusts, host country procurement, and water stewardship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Decarbonization & Clean Energy */}
          <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle space-y-4 hover:border-forest/40 transition-colors">
            <div className="p-3 rounded-xl bg-forest-light text-forest w-fit">
              <Zap className="w-6 h-6 text-forest" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest block">
                Decarbonization Benchmark
              </span>
              <h4 className="text-base sm:text-lg font-bold text-ink mt-0.5">
                {extendedData?.renewables.system || 'Clean Power Infrastructure'}
              </h4>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {extendedData?.renewables.details ||
                'Deploying high-penetration renewables to transition toward group Net Zero emissions by 2050.'}
            </p>
            <div className="pt-3 border-t border-mist/60 bg-editorial -mx-6 -mb-6 p-4 rounded-b-2xl space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold block">
                Climate Impact
              </span>
              <p className="text-xs font-bold text-forest">
                {extendedData?.renewables.impact || 'Scope 1 & 2 Reduction'}
              </p>
            </div>
          </div>

          {/* Card 2: Host Community Trusts & Foundations */}
          <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle space-y-4 hover:border-gold-mineral transition-colors">
            <div className="p-3 rounded-xl bg-gold/10 text-gold-dark w-fit">
              <Building className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                Community Shared Value
              </span>
              <h4 className="text-base sm:text-lg font-bold text-ink mt-0.5">
                {extendedData?.community.primaryInitiative || 'Host Community Trusts'}
              </h4>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {extendedData?.community.description ||
                'Collaborating with local stakeholders to invest in education, healthcare, infrastructure, and enterprise incubation.'}
            </p>
            <div className="pt-3 border-t border-mist/60 bg-editorial -mx-6 -mb-6 p-4 rounded-b-2xl space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold block">
                Key Community Commitments
              </span>
              <ul className="text-[11px] text-ink-muted space-y-1">
                {extendedData?.community.keyMetrics.map((metric, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-gold font-bold">•</span>
                    <span>{metric}</span>
                  </li>
                )) || <li>Over 70% in-country procurement spend</li>}
              </ul>
            </div>
          </div>

          {/* Card 3: Water Stewardship & Tailings Safety (GISTM) */}
          <div className="bg-white rounded-2xl border border-mist p-6 shadow-subtle space-y-4 hover:border-navy/40 transition-colors">
            <div className="p-3 rounded-xl bg-navy/5 text-navy w-fit">
              <ShieldCheck className="w-6 h-6 text-navy" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-navy block">
                Environmental Stewardship
              </span>
              <h4 className="text-base sm:text-lg font-bold text-ink mt-0.5">
                Water & GISTM Tailings Safety
              </h4>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Operating closed-circuit water recycling and dry-stack filtered tailings technology. All Extreme and Very High consequence tailings facilities fully conform to the Global Industry Standard on Tailings Management (GISTM).
            </p>
            <div className="pt-3 border-t border-mist/60 bg-editorial -mx-6 -mb-6 p-4 rounded-b-2xl space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-ink-subtle font-semibold block">
                Water Performance
              </span>
              <p className="text-xs font-bold text-navy">
                &gt;75% - 85% water recycled across global processing circuits
              </p>
            </div>
          </div>
        </div>

        {/* Highlights Bulleted Row */}
        {operation.sustainabilityHighlights && operation.sustainabilityHighlights.length > 0 && (
          <div className="bg-editorial rounded-2xl border border-mist p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              Verified Sustainability Milestones ({operation.name})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {operation.sustainabilityHighlights.map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-mist/70 text-xs text-ink-muted leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. CONTEXTUAL AI ASSISTANT BOX                               */}
      {/* ============================================================ */}
      <section className="py-8 px-6 max-w-7xl mx-auto">
        <OperationQuestionsBox operation={operation} />
      </section>

      {/* ============================================================ */}
      {/* 7. RELATED REPORTS & DISCLOSURES                             */}
      {/* ============================================================ */}
      <section className="bg-white py-16 px-6 border-t border-mist">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy/5 border border-navy/10 text-navy text-xs font-semibold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 text-gold-dark" />
                <span>Regulatory Suite</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-display">
                Related Reports & Documents
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Audited financial and operational reviews covering {operation.name}.
              </p>
            </div>

            <Link
              href="/investors"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors self-start md:self-auto"
            >
              <span>Explore Investor Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedReports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl border border-mist bg-editorial hover:border-gold-mineral transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-ink-subtle uppercase tracking-wider font-semibold">
                    <span>{report.category}</span>
                    <span>{report.period}</span>
                  </div>
                  <h4 className="text-sm font-bold text-ink leading-snug line-clamp-2">
                    {report.title}
                  </h4>
                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                    {report.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-mist/70 flex items-center justify-between">
                  <span className="text-[11px] text-ink-subtle">
                    {report.fileFormat} • {report.fileSize}
                  </span>
                  <a
                    href={report.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. SIBLING OPERATIONS IN REGION / PORTFOLIO NAVIGATOR        */}
      {/* ============================================================ */}
      {siblingOperations.length > 0 && (
        <section className="py-16 px-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-ink font-display">
                Other Operations in {operation.region}
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Explore neighboring Gold Fields assets in the {operation.region} region.
              </p>
            </div>
            <Link
              href="/operations"
              className="text-xs font-bold text-navy hover:text-gold-dark flex items-center gap-1"
            >
              <span>All 9 Operations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {siblingOperations.map((sibling) => (
              <Link
                key={sibling.id}
                href={`/operations/${sibling.slug}`}
                className="p-5 rounded-2xl bg-white border border-mist hover:border-gold-mineral shadow-subtle hover:shadow-card transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gold-dark font-semibold block">
                    {sibling.type} • {sibling.country}
                  </span>
                  <h4 className="text-base font-bold text-ink group-hover:text-navy transition-colors">
                    {sibling.name}
                  </h4>
                  <span className="text-xs text-ink-muted block mt-0.5">
                    H1 2026: {sibling.attributableProductionH1_2026}
                  </span>
                </div>
                <div className="p-2 rounded-full bg-editorial group-hover:bg-navy group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
