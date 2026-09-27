'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  Download,
  Sparkles,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  BookmarkPlus,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface MarketData {
  jse: {
    ticker: string;
    price: string;
    currency: string;
    change: string;
    changePercent: string;
    isPositive: boolean;
    dayRange: string;
    yearRange: string;
    volume: string;
    marketCap: string;
    peRatio: string;
    dividendYield: string;
  };
  nyse: {
    ticker: string;
    price: string;
    currency: string;
    change: string;
    changePercent: string;
    isPositive: boolean;
    dayRange: string;
    yearRange: string;
    volume: string;
    marketCap: string;
    adrRatio: string;
    sharesOutstanding: string;
  };
}

const MARKET_DATA: MarketData = {
  jse: {
    ticker: 'JSE: GFI',
    price: '285.50',
    currency: 'ZAR',
    change: '+5.20',
    changePercent: '+1.85%',
    isPositive: true,
    dayRange: '281.00 – 287.90',
    yearRange: '195.40 – 312.00',
    volume: '1,420,500',
    marketCap: 'R 255.8 Bn',
    peRatio: '14.2x',
    dividendYield: '2.52%',
  },
  nyse: {
    ticker: 'NYSE: GFI',
    price: '16.20',
    currency: 'USD',
    change: '+0.23',
    changePercent: '+1.45%',
    isPositive: true,
    dayRange: '15.95 – 16.38',
    yearRange: '10.85 – 17.40',
    volume: '4,885,200',
    marketCap: '$14.5 Bn',
    adrRatio: '1 ADR : 1 Ordinary',
    sharesOutstanding: '896.2M',
  },
};

interface OperationRow {
  name: string;
  region: string;
  country: string;
  ownership: string;
  miningMethod: string;
  productionH1_2026: string;
  productionH1_2025: string;
  aisc: string;
  status: string;
  notes: string;
}

const OPERATIONS_DATA: OperationRow[] = [
  {
    name: 'South Deep',
    region: 'South Africa',
    country: 'South Africa',
    ownership: '100%',
    miningMethod: 'Bulk Mechanized Underground',
    productionH1_2026: '151.0 koz',
    productionH1_2025: '148.5 koz',
    aisc: '$1,410 /oz',
    status: 'Operational',
    notes: '5-year wage agreement secured; 50MW solar operational',
  },
  {
    name: 'Tarkwa',
    region: 'Ghana',
    country: 'Ghana',
    ownership: '90%',
    miningMethod: 'Multi-pit Open Pit (CIL)',
    productionH1_2026: '242.0 koz',
    productionH1_2025: '249.0 koz',
    aisc: '$1,290 /oz',
    status: 'Operational',
    notes: '90% attributable; strong plant throughput >94%',
  },
  {
    name: 'St Ives',
    region: 'Australia',
    country: 'Australia',
    ownership: '100%',
    miningMethod: 'Underground & Open Pit',
    productionH1_2026: '165.0 koz',
    productionH1_2025: '170.0 koz',
    aisc: '$1,320 /oz',
    status: 'Operational',
    notes: 'Invincible underground mine; Lefroy microgrid underway',
  },
  {
    name: 'Granny Smith',
    region: 'Australia',
    country: 'Australia',
    ownership: '100%',
    miningMethod: 'Deep Underground (Wallaby)',
    productionH1_2026: '135.0 koz',
    productionH1_2025: '132.5 koz',
    aisc: '$1,375 /oz',
    status: 'Operational',
    notes: 'Zone 110/120 development; gas-solar-battery microgrid',
  },
  {
    name: 'Gruyere (50%)',
    region: 'Australia',
    country: 'Australia',
    ownership: '50% JV',
    miningMethod: 'Open Pit Joint Venture',
    productionH1_2026: '130.0 koz',
    productionH1_2025: '128.0 koz',
    aisc: '$1,390 /oz',
    status: 'Operational',
    notes: 'Manager: Gold Fields; 50% attributable production',
  },
  {
    name: 'Agnew',
    region: 'Australia',
    country: 'Australia',
    ownership: '100%',
    miningMethod: 'Underground (New Holland)',
    productionH1_2026: '115.0 koz',
    productionH1_2025: '119.0 koz',
    aisc: '$1,365 /oz',
    status: 'Operational',
    notes: 'Global benchmark microgrid (>70% renewable penetration)',
  },
  {
    name: 'Cerro Corona',
    region: 'Americas',
    country: 'Peru',
    ownership: '99.5%',
    miningMethod: 'Open Pit (Cu-Au Porphyry)',
    productionH1_2026: '108.0 koz eq',
    productionH1_2025: '112.0 koz eq',
    aisc: '$1,180 /oz eq',
    status: 'Operational',
    notes: 'Gold equivalent; in-pit tailings transition planning',
  },
  {
    name: 'Salares Norte',
    region: 'Americas',
    country: 'Chile',
    ownership: '100%',
    miningMethod: 'High-Altitude Open Pit',
    productionH1_2026: '14.0 koz',
    productionH1_2025: '—',
    aisc: 'Ramping up',
    status: 'Commercial Ramp-up',
    notes: 'High Andes (~4,500m); dry stack filtered tailings',
  },
  {
    name: 'Windfall (50%)',
    region: 'Canada',
    country: 'Canada',
    ownership: '50% JV',
    miningMethod: 'Underground Exploration',
    productionH1_2026: '—',
    productionH1_2025: '—',
    aisc: 'Development',
    status: 'Development Project',
    notes: 'High-grade gold JV with Osisko Mining; permitting phase',
  },
];

const CALENDAR_EVENTS = [
  {
    date: '7 May 2026',
    title: 'Q1 2026 Operational Update',
    category: 'Quarterly Results',
    status: 'Completed',
    description: 'First quarter production and cost review; reaffirmed FY 2026 guidance (2.20 – 2.30 Moz).',
    linkUrl: 'https://www.goldfields.com/quarterly-financial-reports.php',
    linkLabel: 'View Announcement',
  },
  {
    date: '28 May 2026',
    title: '2026 Annual General Meeting (AGM)',
    category: 'Governance',
    status: 'Completed',
    description: 'Virtual and physical shareholder gathering at Sandton Corporate Office, Johannesburg.',
    linkUrl: 'https://www.goldfields.com/annual-general-meetings.php',
    linkLabel: 'AGM Resolutions',
  },
  {
    date: '25 August 2026',
    title: 'H1 2026 Financial & Operational Results',
    category: 'Interim Results',
    status: 'Completed',
    description: 'Results for the six months ended 30 June 2026; declaration of 300 SA cents interim dividend.',
    linkUrl: 'https://www.goldfields.com/reports/q2-2026/index.php',
    linkLabel: 'Results Centre',
  },
  {
    date: '15 September 2026',
    title: 'H1 2026 Interim Dividend Payment Date',
    category: 'Shareholder Return',
    status: 'Completed',
    description: 'Payment of gross cash dividend of 300 SA cents per ordinary share to registered holders.',
    linkUrl: '#dividends',
    linkLabel: 'Dividend Timetable',
  },
  {
    date: '5 November 2026',
    title: 'Q3 2026 Operational & Cost Update',
    category: 'Quarterly Results',
    status: 'Upcoming',
    description: 'Third quarter operational metrics, unit costs, and regional progress towards FY 2026 targets.',
    linkUrl: 'https://www.goldfields.com/quarterly-financial-reports.php',
    linkLabel: 'Webcast Registration',
  },
  {
    date: '18 February 2027',
    title: 'FY 2026 Preliminary Annual Results & Final Dividend',
    category: 'Annual Results',
    status: 'Upcoming',
    description: 'Full-year audited group financial statements, 2027 operational guidance, and final dividend announcement.',
    linkUrl: 'https://www.goldfields.com/annual-financial-reports.php',
    linkLabel: 'Calendar Reminder',
  },
];

export default function InvestorsPage() {
  const [packIds, setPackIds] = useState<string[]>([]);
  const [selectedMarketTab, setSelectedMarketTab] = useState<'jse' | 'nyse'>('jse');
  const [productionView, setProductionView] = useState<'all' | 'regional'>('all');

  // Sync localStorage report pack
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gf_report_pack');
      if (stored) {
        setPackIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }

    const handlePackUpdate = () => {
      try {
        const stored = localStorage.getItem('gf_report_pack');
        if (stored) setPackIds(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handlePackUpdate);
    return () => window.removeEventListener('storage', handlePackUpdate);
  }, []);

  const handleTogglePack = (reportId: string) => {
    let updated: string[];
    if (packIds.includes(reportId)) {
      updated = packIds.filter((id) => id !== reportId);
    } else {
      updated = [...packIds, reportId];
    }
    setPackIds(updated);
    try {
      localStorage.setItem('gf_report_pack', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    window.dispatchEvent(new CustomEvent('open-report-pack'));
  };

  const handleTriggerAI = (promptText?: string, contextText?: string) => {
    window.dispatchEvent(
      new CustomEvent('open-assistant', {
        detail: {
          prompt: promptText || 'Tell me about the H1 2026 financial and operational results',
          context: contextText || 'H1 2026 Results',
        },
      })
    );
  };

  return (
    <div className="space-y-0 pb-20">
      {/* ============================================================ */}
      {/* 1. CINEMATIC INVESTOR HERO SECTION                            */}
      {/* ============================================================ */}
      <section className="relative min-h-[480px] lg:min-h-[540px] flex items-center bg-navy-dark overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/gold-fields-releases-h1-2026.jpg"
            alt="Gold Fields Investor Centre"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/70 lg:w-4/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/40 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest backdrop-blur-xs">
              <span>Investor Centre</span>
              <span className="text-white/40">•</span>
              <span>JSE & NYSE: GFI</span>
              <span className="text-white/40">•</span>
              <span>H1 2026 Disclosures</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
              Resilient delivery, <br />
              <span className="text-gold-light font-normal italic">disciplined capital allocation.</span>
            </h1>

            <p className="text-base sm:text-lg text-mist/90 max-w-2xl font-normal leading-relaxed">
              Explore Gold Fields&apos; H1 2026 financial and operational performance, multi-region production metrics, dividend policy, capital allocation framework, and official stock exchange filings.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#h1-results"
                className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card hover:shadow-elevated transition-all flex items-center gap-2"
              >
                <span>H1 2026 Results Suite</span>
                <ChevronRight className="w-4 h-4 text-navy-dark" />
              </a>

              <button
                onClick={() => handleTriggerAI()}
                className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <span>Ask about H1 2026 results</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. JSE & NYSE MARKET CONTEXT (EXPLICITLY LABELED ILLUSTRATIVE) */}
      {/* ============================================================ */}
      <section id="market-context" className="bg-white border-b border-mist py-8 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
                  Listing & Market Context
                </span>
                <span className="px-2 py-0.5 rounded bg-mist text-[11px] font-medium text-ink-muted">
                  Illustrative Snapshot
                </span>
              </div>
              <h2 className="text-xl font-bold text-navy mt-1">
                JSE & NYSE Dual Listing Performance
              </h2>
            </div>

            <div className="flex items-center gap-2 bg-mist-light p-1 rounded-lg border border-mist">
              <button
                onClick={() => setSelectedMarketTab('jse')}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                  selectedMarketTab === 'jse'
                    ? 'bg-navy text-white shadow-subtle'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                JSE (GFI) • ZAR
              </button>
              <button
                onClick={() => setSelectedMarketTab('nyse')}
                className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${
                  selectedMarketTab === 'nyse'
                    ? 'bg-navy text-white shadow-subtle'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                NYSE (GFI) • USD ADR
              </button>
            </div>
          </div>

          {/* Market Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedMarketTab === 'jse' ? (
              <>
                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">Share Price (JSE)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-navy tabular-nums">
                      R {MARKET_DATA.jse.price}
                    </span>
                    <span className="text-xs font-bold text-forest flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      {MARKET_DATA.jse.change} ({MARKET_DATA.jse.changePercent})
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">Day Range: {MARKET_DATA.jse.dayRange}</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">Market Capitalisation</span>
                  <div className="text-2xl font-extrabold text-navy tabular-nums mt-1">
                    {MARKET_DATA.jse.marketCap}
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">52-Week Range: {MARKET_DATA.jse.yearRange}</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">Daily Volume</span>
                  <div className="text-2xl font-extrabold text-navy tabular-nums mt-1">
                    {MARKET_DATA.jse.volume}
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">JSE Ordinary Trading Volume</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">Valuation & Yield</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-2xl font-extrabold text-navy tabular-nums">
                      {MARKET_DATA.jse.peRatio}
                    </span>
                    <span className="text-xs font-semibold text-ink-muted">P/E</span>
                    <span className="text-mist">|</span>
                    <span className="text-lg font-bold text-gold-dark tabular-nums">
                      {MARKET_DATA.jse.dividendYield}
                    </span>
                    <span className="text-xs font-semibold text-ink-muted">Yield</span>
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">Based on trailing dividends</span>
                </div>
              </>
            ) : (
              <>
                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">ADR Price (NYSE)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-navy tabular-nums">
                      $ {MARKET_DATA.nyse.price}
                    </span>
                    <span className="text-xs font-bold text-forest flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                      {MARKET_DATA.nyse.change} ({MARKET_DATA.nyse.changePercent})
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">Day Range: ${MARKET_DATA.nyse.dayRange}</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">US Market Capitalisation</span>
                  <div className="text-2xl font-extrabold text-navy tabular-nums mt-1">
                    {MARKET_DATA.nyse.marketCap}
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">52-Week Range: ${MARKET_DATA.nyse.yearRange}</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">ADR Volume</span>
                  <div className="text-2xl font-extrabold text-navy tabular-nums mt-1">
                    {MARKET_DATA.nyse.volume}
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">NYSE Composite Volume</span>
                </div>

                <div className="bg-editorial p-5 rounded-xl border border-mist">
                  <span className="text-xs text-ink-muted block uppercase tracking-wider">Capital Structure</span>
                  <div className="text-2xl font-extrabold text-navy tabular-nums mt-1">
                    {MARKET_DATA.nyse.sharesOutstanding}
                  </div>
                  <span className="text-[11px] text-ink-subtle mt-2 block">{MARKET_DATA.nyse.adrRatio}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-start gap-2 bg-mist-light/50 px-4 py-3 rounded-lg border border-mist text-xs text-ink-muted">
            <Info className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
            <span>
              <strong>Market Data Disclaimer:</strong> Share quotes and trading statistics displayed above are illustrative delayed concept data for digital prototype evaluation. For real-time execution quotes, please consult the Johannesburg Stock Exchange (JSE) and New York Stock Exchange (NYSE) authorized feeds.
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CONTEXTUAL AI ASSISTANT BANNER                            */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy p-6 sm:p-8 rounded-2xl border border-mist/20 text-white shadow-elevated relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-semibold border border-gold/30">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Contextual Executive Assistant</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Have questions about the H1 2026 results?
              </h3>
              <p className="text-sm text-mist/90 max-w-xl leading-relaxed">
                Query attributable production across operations, regional all-in sustaining costs (AISC), cash flow, interim dividend details, or Salares Norte ramp-up progress using our verified source assistant.
              </p>

              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'Attributable production by mine',
                  'Interim dividend & timetable',
                  'South Deep 5-year wage agreement',
                  'Salares Norte ramp-up status',
                  'Capital allocation framework',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleTriggerAI(chip, 'H1 2026 Results')}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white transition-colors"
                  >
                    &ldquo;{chip}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <button
                onClick={() => handleTriggerAI('Provide a full executive summary of the H1 2026 financial and operational results', 'H1 2026 Results')}
                className="w-full py-3.5 px-6 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-navy-dark" />
                <span>Ask about H1 2026 results</span>
              </button>
              <Link
                href="/reports"
                className="w-full py-3 px-6 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-colors flex items-center justify-center gap-2 text-center"
              >
                <FileText className="w-4 h-4 text-mist" />
                <span>Open Full Report Library</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. RESULTS CENTER: H1 2026 & Q1 2026 SPOTLIGHT                */}
      {/* ============================================================ */}
      <section id="h1-results" className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        <div className="border-b border-mist pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark">
            <TrendingUp className="w-4 h-4 text-gold-dark" />
            <span>2026 Financial Results Suite</span>
          </div>
          <h2 className="text-3xl font-extrabold text-navy tracking-tight mt-1">
            Results Center
          </h2>
          <p className="text-sm text-ink-muted mt-1 max-w-2xl">
            Gold Fields released its H1 2026 interim results on 25 August 2026 and Q1 2026 operational update on 7 May 2026. Review key financial metrics, downloads, and presentations below.
          </p>
        </div>

        {/* Primary Featured: H1 2026 Results */}
        <div className="bg-white rounded-2xl border border-mist shadow-card overflow-hidden">
          <div className="bg-navy p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded bg-gold-dark/40 text-gold-light text-xs font-bold uppercase tracking-wider border border-gold-mineral/30 mb-2">
                  Primary Highlight • Published 25 August 2026
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  H1 2026 Financial & Operational Results
                </h3>
                <p className="text-xs sm:text-sm text-mist/80 mt-1">
                  For the six months ended 30 June 2026 (Published 25 August 2026, 07:05 SAST)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold flex items-center gap-1.5 transition-colors shadow-subtle"
                >
                  <Download className="w-4 h-4" />
                  <span>Booklet (3.8 MB)</span>
                </a>
                <button
                  onClick={() => handleTogglePack('h1-2026-booklet')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    packIds.includes('h1-2026-booklet')
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                  title="Add to My Report Pack"
                >
                  {packIds.includes('h1-2026-booklet') ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>In Pack</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-gold-light" />
                      <span>Add to Pack</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Key KPI Scorecard Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">Group Production</span>
                <div className="text-2xl font-black text-white tabular-nums mt-1">1.06 Moz</div>
                <span className="text-[10px] text-mist/60 mt-1 block">Attributable gold</span>
              </div>

              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">All-in Sustaining (AISC)</span>
                <div className="text-2xl font-black text-white tabular-nums mt-1">$1,385</div>
                <span className="text-[10px] text-forest mt-1 block font-medium">Within FY guidance</span>
              </div>

              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">Normalized Earnings</span>
                <div className="text-2xl font-black text-white tabular-nums mt-1">$585 M</div>
                <span className="text-[10px] text-mist/60 mt-1 block">Strong profitability</span>
              </div>

              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">Free Cash Flow</span>
                <div className="text-2xl font-black text-white tabular-nums mt-1">$412 M</div>
                <span className="text-[10px] text-mist/60 mt-1 block">From operations</span>
              </div>

              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">Interim Dividend</span>
                <div className="text-2xl font-black text-gold tabular-nums mt-1">300 c</div>
                <span className="text-[10px] text-mist/60 mt-1 block">SA cents / share</span>
              </div>

              <div className="bg-navy-surface/70 p-4 rounded-xl border border-white/10">
                <span className="text-[11px] text-mist/70 block uppercase tracking-wider">Net Debt / EBITDA</span>
                <div className="text-2xl font-black text-white tabular-nums mt-1">0.45x</div>
                <span className="text-[10px] text-forest mt-1 block font-medium">Well below 1.0x target</span>
              </div>
            </div>
          </div>

          {/* Operational Highlights & Document Links */}
          <div className="p-6 sm:p-8 bg-editorial-surface grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-ink-muted">
                Key Strategic & Operational Developments
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-ink leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>South Deep Stability:</strong> Produced 151,000 oz attributable gold with a historic five-year wage agreement secured with organized labour in July 2026, extending labour peace through 2031.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Salares Norte Ramp-up:</strong> The high-altitude Chilean operation continues its commercial commissioning ramp-up toward steady-state production of ~350 koz/yr.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Damang Portfolio Optimization:</strong> As formally reported in the Review of Operations, ownership of Damang was transferred to the Government of Ghana on 18 April 2026.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>
                    <strong>Windfall JV (Canada):</strong> Advancing environmental permitting and technical optimization in partnership with Osisko Mining.
                  </span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5 bg-editorial p-5 rounded-xl border border-mist space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gold-dark" />
                H1 2026 Disclosure Library
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-white border border-mist flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink block">H1 2026 Results Booklet</span>
                    <span className="text-[11px] text-ink-muted">PDF • 3.8 MB • Full Statements</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href="https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-mist text-navy"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-mist flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink block">Executive Presentation</span>
                    <span className="text-[11px] text-ink-muted">PDF • 6.2 MB • Deck by CEO & CFO</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href="https://www.goldfields.com/reports/q2-2026/pdf/presentation.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-mist text-navy"
                      title="Download Presentation"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-mist flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink block">SENS Announcement</span>
                    <span className="text-[11px] text-ink-muted">PDF • 620 KB • Regulatory Filing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href="https://www.goldfields.com/pdf/investors/sens/2026/gold-fields-h1-results-sens.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-mist text-navy"
                      title="Download SENS"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <a
                  href="https://www.goldfields.com/reports/q2-2026/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1 transition-colors"
                >
                  <span>Access official webcasts & audio replays</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Card: Q1 2026 Operational Update */}
        <div id="q1-results" className="bg-editorial p-6 sm:p-8 rounded-2xl border border-mist shadow-subtle">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-mist text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Quarterly Update • Released 7 May 2026
                </span>
                <span className="text-xs text-ink-muted">Three months ended 31 March 2026</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-navy">
                Q1 2026 Operational Update & Guidance Reaffirmation
              </h3>

              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                During the first quarter of 2026, Gold Fields generated attributable gold production of <strong>518 koz</strong> at an AISC of <strong>$1,392/oz</strong>. The group reaffirmed its full-year 2026 guidance of <strong>2.20 – 2.30 Moz</strong> at AISC between <strong>$1,350 and $1,420/oz</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="bg-white p-3 rounded-lg border border-mist">
                  <span className="text-[10px] text-ink-muted block uppercase">Q1 Production</span>
                  <span className="text-lg font-bold text-navy tabular-nums">518 koz</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-mist">
                  <span className="text-[10px] text-ink-muted block uppercase">Q1 AISC</span>
                  <span className="text-lg font-bold text-navy tabular-nums">$1,392 /oz</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-mist">
                  <span className="text-[10px] text-ink-muted block uppercase">FY26 Production Guidance</span>
                  <span className="text-lg font-bold text-navy tabular-nums">2.20 – 2.30 Moz</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-mist">
                  <span className="text-[10px] text-ink-muted block uppercase">FY26 Cost Guidance</span>
                  <span className="text-lg font-bold text-navy tabular-nums">$1,350 – $1,420 /oz</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href="https://www.goldfields.com/quarterly-financial-reports.php"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-lg bg-white hover:bg-mist-light text-navy text-xs font-bold border border-mist shadow-subtle flex items-center justify-between transition-colors"
              >
                <span>Download Q1 2026 Booklet (PDF)</span>
                <Download className="w-4 h-4 text-ink-muted" />
              </a>

              <a
                href="https://www.goldfields.com/pdf/investors/sens/2026/gold-fields-q1-results-sens.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-lg bg-white hover:bg-mist-light text-navy text-xs font-bold border border-mist shadow-subtle flex items-center justify-between transition-colors"
              >
                <span>Q1 2026 SENS Announcement</span>
                <ExternalLink className="w-4 h-4 text-ink-muted" />
              </a>

              <button
                onClick={() => handleTogglePack('q1-2026-results')}
                className="w-full py-2.5 px-4 rounded-lg bg-mist hover:bg-mist-light text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4 text-gold-dark" />
                <span>{packIds.includes('q1-2026-results') ? 'In Report Pack' : 'Add Q1 to Pack'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PRODUCTION & COST BREAKDOWN TABLES                         */}
      {/* ============================================================ */}
      <section id="production-costs" className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-mist pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Operational Performance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-1">
              Production & Cost Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              Verified operational statistics across Gold Fields&apos; active mining assets for the six months ended 30 June 2026.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setProductionView('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                productionView === 'all'
                  ? 'bg-navy text-white'
                  : 'bg-mist text-ink hover:bg-mist-light'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setProductionView('regional')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                productionView === 'regional'
                  ? 'bg-navy text-white'
                  : 'bg-mist text-ink hover:bg-mist-light'
              }`}
            >
              Regional Totals
            </button>
          </div>
        </div>

        {/* Detailed Table */}
        {productionView === 'all' ? (
          <div className="bg-white rounded-xl border border-mist shadow-subtle overflow-x-auto">
            <table className="w-full text-left text-xs text-ink border-collapse">
              <thead>
                <tr className="bg-editorial border-b border-mist text-ink-muted uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">Operation</th>
                  <th className="py-3.5 px-4 font-bold">Region</th>
                  <th className="py-3.5 px-4 font-bold">Ownership</th>
                  <th className="py-3.5 px-4 font-bold">Mining Method</th>
                  <th className="py-3.5 px-4 font-bold text-right">H1 2026 Output</th>
                  <th className="py-3.5 px-4 font-bold text-right">H1 2025 Output</th>
                  <th className="py-3.5 px-4 font-bold text-right">AISC ($/oz)</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {OPERATIONS_DATA.map((row) => (
                  <tr key={row.name} className="hover:bg-mist-light/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy">
                      {row.name}
                      <span className="block text-[10px] text-ink-subtle font-normal">{row.notes}</span>
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted">{row.region}</td>
                    <td className="py-3.5 px-4 font-medium">{row.ownership}</td>
                    <td className="py-3.5 px-4 text-ink-muted">{row.miningMethod}</td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-navy">{row.productionH1_2026}</td>
                    <td className="py-3.5 px-4 text-right tabular-nums text-ink-muted">{row.productionH1_2025}</td>
                    <td className="py-3.5 px-4 text-right font-bold tabular-nums text-gold-dark">{row.aisc}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        row.status === 'Operational'
                          ? 'bg-forest-light text-forest'
                          : row.status === 'Commercial Ramp-up'
                          ? 'bg-gold-light text-gold-dark'
                          : 'bg-mist text-ink-muted'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Group Total Row */}
                <tr className="bg-editorial font-bold border-t-2 border-navy/20">
                  <td className="py-4 px-4 text-navy uppercase tracking-wider" colSpan={4}>
                    Group Attributable Total / Weighted Average
                  </td>
                  <td className="py-4 px-4 text-right text-navy text-sm tabular-nums">1,060.0 koz (1.06 Moz)</td>
                  <td className="py-4 px-4 text-right text-ink-muted tabular-nums">1,079.0 koz</td>
                  <td className="py-4 px-4 text-right text-gold-dark text-sm tabular-nums">$1,385 /oz</td>
                  <td className="py-4 px-4 text-forest text-[11px]">FY Guidance Reaffirmed</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Regional Summary Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-navy">Australia Region</span>
                <span className="text-[10px] bg-forest-light text-forest px-2 py-0.5 rounded font-bold">51.4% Share</span>
              </div>
              <div className="text-2xl font-black text-navy tabular-nums">545.0 koz</div>
              <div className="text-xs text-ink-muted space-y-1">
                <p>AISC: <strong>$1,360 /oz</strong> (avg)</p>
                <p>Assets: St Ives, Granny Smith, Gruyere (50%), Agnew</p>
                <p className="text-[11px] text-ink-subtle">Renewables microgrid penetration expanding across assets.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-navy">Ghana Region</span>
                <span className="text-[10px] bg-forest-light text-forest px-2 py-0.5 rounded font-bold">22.8% Share</span>
              </div>
              <div className="text-2xl font-black text-navy tabular-nums">242.0 koz</div>
              <div className="text-xs text-ink-muted space-y-1">
                <p>AISC: <strong>$1,290 /oz</strong></p>
                <p>Asset: Tarkwa (90% attributable)</p>
                <p className="text-[11px] text-slate italic">Damang transferred to Gov of Ghana on 18 Apr 2026.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-navy">South Africa</span>
                <span className="text-[10px] bg-forest-light text-forest px-2 py-0.5 rounded font-bold">14.2% Share</span>
              </div>
              <div className="text-2xl font-black text-navy tabular-nums">151.0 koz</div>
              <div className="text-xs text-ink-muted space-y-1">
                <p>AISC: <strong>$1,410 /oz</strong></p>
                <p>Asset: South Deep (100%)</p>
                <p className="text-[11px] text-ink-subtle">5-year wage agreement concluded; Khanyisa 50MW solar live.</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-navy">Americas Region</span>
                <span className="text-[10px] bg-forest-light text-forest px-2 py-0.5 rounded font-bold">11.6% Share</span>
              </div>
              <div className="text-2xl font-black text-navy tabular-nums">122.0 koz eq</div>
              <div className="text-xs text-ink-muted space-y-1">
                <p>AISC: <strong>$1,180 /oz eq</strong> (Cerro Corona)</p>
                <p>Assets: Cerro Corona (Peru), Salares Norte (Chile)</p>
                <p className="text-[11px] text-ink-subtle">Salares Norte commercial ramp-up underway in High Andes.</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-[11px] text-ink-subtle italic">
          *Note on Damang: Ownership was transferred to the Government of Ghana on 18 April 2026. Attributable production from 1 January 2026 to transfer date is accounted under discontinued/divested portfolio items.
        </p>
      </section>

      {/* ============================================================ */}
      {/* 6. CAPITAL ALLOCATION & DIVIDEND POLICY                       */}
      {/* ============================================================ */}
      <section id="capital-allocation" className="bg-editorial py-16 px-6 border-y border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Financial Discipline & Shareholder Returns
            </span>
            <h2 className="text-3xl font-extrabold text-navy tracking-tight mt-1">
              Capital Allocation Framework & Dividend Policy
            </h2>
            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              Gold Fields maintains a disciplined, value-accretive capital allocation framework designed to balance balance sheet strength, safe sustaining operational investment, shareholder returns, and value-adding growth.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h4 className="font-bold text-navy text-base mb-2">Balance Sheet Strength</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Target net debt to adjusted EBITDA ratio of less than <strong>1.0x</strong> through the commodity cycle. Current leverage stands at <strong>0.45x</strong> with over $1.8 billion in available liquidity headroom.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-mist text-[11px] text-forest font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Investment grade ratings: BBB- / Baa3</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h4 className="font-bold text-navy text-base mb-2">Sustaining & ESG Capital</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Non-negotiable reinvestment into safety, asset integrity, and 2030 ESG targets. This includes 50MW Khanyisa solar plant, Agnew hybrid microgrid, and 100% GISTM conformance on tailings facilities.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-mist text-[11px] text-forest font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero fatalities in H1 2026</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-gold/20 text-gold-dark flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h4 className="font-bold text-navy text-base mb-2">Dividend Policy</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Policy to pay out <strong>30% to 45% of normalized earnings</strong> as cash dividends. For H1 2026, an interim dividend of <strong>300 SA cents/share</strong> was declared (~35% normalized payout ratio).
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-mist text-[11px] text-gold-dark font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span>300c interim dividend paid 15 Sept 2026</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center font-bold text-lg mb-4">
                  4
                </div>
                <h4 className="font-bold text-navy text-base mb-2">Disciplined Growth</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Selective allocation toward high-return brownfields reserve extensions and Tier 1 development projects (Salares Norte ramp-up, Windfall 50% JV in Canada, and Lefroy exploration).
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-mist text-[11px] text-ink-muted font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Focus on margin over absolute volume</span>
              </div>
            </div>
          </div>

          {/* Dividend Track Record Table */}
          <div id="dividends" className="bg-white p-6 rounded-xl border border-mist shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-navy text-base">Recent Dividend Track Record</h4>
                <p className="text-xs text-ink-muted">Historical cash dividend distributions to ordinary shareholders.</p>
              </div>
              <span className="text-xs font-semibold text-gold-dark">
                Target Payout: 30% – 45% Normalized Earnings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-editorial border-b border-mist text-ink-muted uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-4 font-bold">Financial Period</th>
                    <th className="py-2.5 px-4 font-bold">Dividend Type</th>
                    <th className="py-2.5 px-4 font-bold text-right">Gross Amount</th>
                    <th className="py-2.5 px-4 font-bold">Currency</th>
                    <th className="py-2.5 px-4 font-bold">Payment Date</th>
                    <th className="py-2.5 px-4 font-bold">Payout Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  <tr className="hover:bg-mist-light/40">
                    <td className="py-3 px-4 font-bold text-navy">H1 2026</td>
                    <td className="py-3 px-4">Interim Dividend</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-gold-dark">300.00 c</td>
                    <td className="py-3 px-4">ZAR</td>
                    <td className="py-3 px-4">15 September 2026</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-light text-forest">Paid</span></td>
                  </tr>
                  <tr className="hover:bg-mist-light/40">
                    <td className="py-3 px-4 font-bold text-navy">FY 2025</td>
                    <td className="py-3 px-4">Final Dividend</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-gold-dark">420.00 c</td>
                    <td className="py-3 px-4">ZAR</td>
                    <td className="py-3 px-4">25 March 2026</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-light text-forest">Paid</span></td>
                  </tr>
                  <tr className="hover:bg-mist-light/40">
                    <td className="py-3 px-4 font-bold text-navy">H1 2025</td>
                    <td className="py-3 px-4">Interim Dividend</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-gold-dark">300.00 c</td>
                    <td className="py-3 px-4">ZAR</td>
                    <td className="py-3 px-4">16 September 2025</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-light text-forest">Paid</span></td>
                  </tr>
                  <tr className="hover:bg-mist-light/40">
                    <td className="py-3 px-4 font-bold text-navy">FY 2024</td>
                    <td className="py-3 px-4">Final Dividend</td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums text-gold-dark">390.00 c</td>
                    <td className="py-3 px-4">ZAR</td>
                    <td className="py-3 px-4">27 March 2025</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-forest-light text-forest">Paid</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FINANCIAL CALENDAR                                         */}
      {/* ============================================================ */}
      <section id="calendar" className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="border-b border-mist pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
              Important Corporate Dates
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-1">
              Financial Calendar 2026–2027
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
              Key dates for results announcements, shareholder meetings, dividend payments, and quarterly market updates.
            </p>
          </div>
          <span className="text-xs text-ink-subtle">
            All announcements issued on JSE SENS & NYSE feeds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CALENDAR_EVENTS.map((evt, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                evt.status === 'Upcoming'
                  ? 'bg-white border-gold/40 shadow-card'
                  : 'bg-editorial border-mist shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-dark" />
                    {evt.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.status === 'Upcoming'
                        ? 'bg-gold-light text-gold-dark border border-gold/30'
                        : 'bg-forest-light text-forest'
                    }`}
                  >
                    {evt.status}
                  </span>
                </div>

                <div className="text-sm font-bold text-navy mb-1">{evt.date}</div>
                <h4 className="font-extrabold text-base text-ink mb-2">{evt.title}</h4>
                <p className="text-xs text-ink-muted leading-relaxed">{evt.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-mist">
                <a
                  href={evt.linkUrl}
                  target={evt.linkUrl.startsWith('http') ? '_blank' : undefined}
                  rel={evt.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1 transition-colors"
                >
                  <span>{evt.linkLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. EXECUTIVE PRESENTATIONS & REGULATORY FILINGS               */}
      {/* ============================================================ */}
      <section id="filings" className="bg-editorial py-16 px-6 border-t border-mist">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-mist pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark">
                Official Shareholder Documents
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-1">
                Executive Presentations & SENS Filings
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xl">
                Direct access to high-resolution executive presentations, regulatory SENS filings, and annual disclosures.
              </p>
            </div>

            <Link
              href="/reports"
              className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1 transition-colors"
            >
              <span>Explore all {`11+`} archived publications in Report Centre</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: H1 2026 Presentation */}
            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between group hover:border-gold/40 transition-colors">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block mb-1">
                  Investor Presentation • 2026
                </span>
                <h4 className="font-bold text-base text-ink group-hover:text-navy transition-colors mb-2">
                  H1 2026 Results Executive Presentation
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed mb-4">
                  Delivered by CEO and CFO covering health & safety, operational progress, financial review, and FY 2026 guidance.
                </p>
              </div>

              <div className="pt-4 border-t border-mist flex items-center justify-between">
                <span className="text-[11px] text-ink-subtle">Presentation • 6.2 MB</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePack('h1-2026-presentation')}
                    className="p-1.5 rounded hover:bg-mist text-ink-muted hover:text-navy transition-colors"
                    title="Add to Report Pack"
                  >
                    <BookmarkPlus className="w-4 h-4 text-gold-dark" />
                  </button>
                  <a
                    href="https://www.goldfields.com/reports/q2-2026/pdf/presentation.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: H1 2026 SENS */}
            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between group hover:border-gold/40 transition-colors">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block mb-1">
                  SENS Announcement • 2026
                </span>
                <h4 className="font-bold text-base text-ink group-hover:text-navy transition-colors mb-2">
                  SENS Announcement: H1 2026 Financial Results
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed mb-4">
                  Official regulatory announcement published on the JSE SENS and NYSE feeds containing headline earnings and dividend declarations.
                </p>
              </div>

              <div className="pt-4 border-t border-mist flex items-center justify-between">
                <span className="text-[11px] text-ink-subtle">PDF • 620 KB</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePack('h1-2026-sens')}
                    className="p-1.5 rounded hover:bg-mist text-ink-muted hover:text-navy transition-colors"
                    title="Add to Report Pack"
                  >
                    <BookmarkPlus className="w-4 h-4 text-gold-dark" />
                  </button>
                  <a
                    href="https://www.goldfields.com/pdf/investors/sens/2026/gold-fields-h1-results-sens.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: 2025 Integrated Annual Report */}
            <div className="bg-white p-6 rounded-xl border border-mist shadow-subtle flex flex-col justify-between group hover:border-gold/40 transition-colors">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block mb-1">
                  Integrated Annual • 2025
                </span>
                <h4 className="font-bold text-base text-ink group-hover:text-navy transition-colors mb-2">
                  2025 Integrated Annual Report
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed mb-4">
                  Holistic disclosure of value creation across financial, manufactured, human, social, and natural capitals.
                </p>
              </div>

              <div className="pt-4 border-t border-mist flex items-center justify-between">
                <span className="text-[11px] text-ink-subtle">PDF • 14.2 MB</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePack('iar-2025')}
                    className="p-1.5 rounded hover:bg-mist text-ink-muted hover:text-navy transition-colors"
                    title="Add to Report Pack"
                  >
                    <BookmarkPlus className="w-4 h-4 text-gold-dark" />
                  </button>
                  <a
                    href="https://www.goldfields.com/reports/annual-report-2025/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
