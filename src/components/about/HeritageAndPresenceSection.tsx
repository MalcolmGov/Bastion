'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Globe2,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface HeritageAndPresenceSectionProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const HeritageAndPresenceSection: React.FC<HeritageAndPresenceSectionProps> = ({ onAskAI }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  const milestones = [
    {
      year: '1887',
      title: 'Foundation in South Africa',
      description:
        'Founded by Cecil John Rhodes and Charles Rudd as The Consolidated Gold Fields of South Africa, pioneering early deep-level gold exploration in the Witwatersrand Basin.'
    },
    {
      year: '1932',
      title: 'The West Wits Line Discovery',
      description:
        'Pioneered magnetometric geophysical exploration that revealed the buried West Wits Line, uncovering what became one of the greatest high-grade gold provinces on earth.'
    },
    {
      year: '1998',
      title: 'Modern Gold Fields Limited Formed',
      description:
        'Amalgamation of Gold Fields of South Africa and Gencor gold mining assets created modern Gold Fields Limited, listed on the Johannesburg and New York stock exchanges.'
    },
    {
      year: '2001–2010',
      title: 'Global Mining Expansion',
      description:
        'Strategic geographic diversification into Australia (acquiring St Ives, Agnew, and Granny Smith) and Ghana (Tarkwa), reducing single-jurisdiction risk.'
    },
    {
      year: '2013',
      title: 'Strategic Unbundling (Sibanye)',
      description:
        'Spun off conventional, labour-intensive South African deep-level mines into Sibanye Gold to concentrate exclusively on mechanized, modern, lower-risk global assets.'
    },
    {
      year: '2019–2022',
      title: 'Renewables & Microgrid Leadership',
      description:
        'Commissioned the world-first Agnew wind-solar-battery microgrid in Western Australia and constructed the landmark 50MW Khanyisa solar plant at South Deep.'
    },
    {
      year: '2024–2026',
      title: 'Modern Portfolio & 100% GISTM Conformance',
      description:
        'First gold poured and ramp-up at Salares Norte in Chile; Windfall 50/50 JV partnership in Canada; Damang responsibly transferred to the Ghana Government (April 2026); and full 100% GISTM tailings conformance achieved.'
    }
  ];

  const countries = [
    {
      name: 'South Africa',
      flag: '🇿🇦',
      region: 'South Africa Region',
      keyAsset: 'South Deep',
      type: 'Fully Mechanised Underground',
      productionH1: '151,000 oz',
      workforce: '~4,500 employees & contractors',
      image: '/assets/south-africa-ops-image.png',
      highlights: [
        'One of the world’s largest undeveloped gold mineral reserves',
        'Historic 5-year wage agreement concluded with NUM & UASA through 2031',
        '50MW Khanyisa Solar Plant abating ~110kt CO2e/year',
        'ISO 55001 accredited asset management excellence'
      ],
      linkUrl: '/operations/south-deep'
    },
    {
      name: 'Australia',
      flag: '🇦🇺',
      region: 'Australia Region',
      keyAsset: 'Agnew, Granny Smith, Gruyere (JV), St Ives',
      type: 'Underground & Open Pit Hubs',
      productionH1: '545,000 oz (Regional)',
      workforce: '~2,800 employees & contractors',
      image: '/assets/australia-ops-image.png',
      highlights: [
        'Four high-cash-flow operations across Western Australia',
        'Agnew pioneer microgrid: >70% renewable penetration (wind/solar/BESS)',
        'Gruyere 50/50 joint venture with Gold Road Resources',
        'Deep reconciliation partnerships with Traditional Owners'
      ],
      linkUrl: '/operations#australia'
    },
    {
      name: 'Ghana',
      flag: '🇬🇭',
      region: 'West Africa Region',
      keyAsset: 'Tarkwa',
      type: 'Premier Open Pit Complex',
      productionH1: '242,000 oz',
      workforce: '~3,200 employees & contractors',
      image: '/assets/ghana-ops-image.png',
      highlights: [
        '90% Gold Fields, 10% Government of Ghana ownership',
        '13.5 Mtpa CIL processing throughput capacity',
        'Damang transferred to Government of Ghana on 18 April 2026',
        'Gold Fields Ghana Foundation delivering local health & education'
      ],
      linkUrl: '/operations/tarkwa'
    },
    {
      name: 'Chile',
      flag: '🇨🇱',
      region: 'Americas Region',
      keyAsset: 'Salares Norte',
      type: 'High-Altitude Open Pit (Gold & Silver)',
      productionH1: 'Commercial Ramp-up',
      workforce: '~1,200 employees & contractors',
      image: '/assets/chile-ops-image.png',
      highlights: [
        'Situated at 3,900m to 4,700m elevation in the High Andes',
        'State-of-the-art dry stack filtered tailings (zero liquid discharge)',
        'Targeting ~350,000 oz Au-Eq annual production at full capacity',
        'Colla indigenous community collaboration agreements'
      ],
      linkUrl: '/operations/salares-norte'
    },
    {
      name: 'Peru',
      flag: '🇵🇪',
      region: 'Americas Region',
      keyAsset: 'Cerro Corona',
      type: 'Copper-Gold Porphyry Open Pit',
      productionH1: '108,000 oz Au-Eq',
      workforce: '~1,800 employees & contractors',
      image: '/assets/peru-ops-image.png',
      highlights: [
        'High-grade copper-gold concentrate production in Cajamarca',
        'In-pit tailings deposition strategy minimizing land disturbance',
        'Over 90% workforce recruited from local Cajamarca communities',
        'Provides potable water supply to neighbouring Hualgayoc'
      ],
      linkUrl: '/operations#cerro-corona'
    },
    {
      name: 'Canada',
      flag: '🇨🇦',
      region: 'Americas Region',
      keyAsset: 'Windfall Project',
      type: '50/50 JV High-Grade Underground Development',
      productionH1: 'Development Stage',
      workforce: '~400 project personnel',
      image: '/assets/canada-ops-image.png',
      highlights: [
        '50/50 joint venture partnership with Osisko Mining',
        'Located in the Abitibi greenstone belt in Eeyou Istchee James Bay, Quebec',
        'Tier-1 high-grade deposit in a premier mining jurisdiction',
        'Comprehensive collaboration agreement with the Cree First Nation of Waswanipi'
      ],
      linkUrl: '/operations#windfall'
    }
  ];

  const handleAsk = (query?: string) => {
    const prompt =
      query ||
      "Tell me about Gold Fields' 135+ year heritage and our operating presence across South Africa, Australia, Ghana, Chile, Peru, and Canada.";
    const context = "Heritage & Global Footprint";

    if (onAskAI) {
      onAskAI(prompt, context);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context,
          },
        })
      );
    }
  };

  const filteredCountries =
    selectedCountry === 'All'
      ? countries
      : countries.filter((c) => c.name === selectedCountry);

  return (
    <section id="heritage" className="py-20 bg-editorial border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* ============================================================ */}
        {/* A. 135+ YEAR HERITAGE TIMELINE                               */}
        {/* ============================================================ */}
        <div className="mb-20">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-3">
              <Calendar className="w-3.5 h-3.5 text-gold-mineral" />
              <span>Historical Legacy</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
              135+ Years of Mining Heritage (1887 &ndash; Present)
            </h2>
            <p className="mt-3 text-base text-ink-muted leading-relaxed">
              From our origin on the Witwatersrand Basin in 1887 to our position today as an innovative, globally diversified gold producer, Gold Fields has consistently pioneered new methods in exploration, deep-level mechanization, and renewable energy.
            </p>
          </div>

          {/* Timeline Cards */}
          <div className="relative border-l-2 border-mist ml-4 md:ml-6 pl-6 md:pl-8 space-y-10">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] md:-left-[39px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gold-dark group-hover:bg-gold group-hover:scale-125 transition-all" />

                <div className="bg-white rounded-xl border border-mist p-6 shadow-subtle hover:shadow-card transition-all">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-extrabold text-gold-dark bg-gold-light/40 px-2.5 py-0.5 rounded border border-gold-mineral/30 tabular-nums">
                      {m.year}
                    </span>
                    <h3 className="text-lg font-bold text-navy font-display">
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-xs text-ink/80 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* B. GLOBAL PRESENCE ACROSS 6 COUNTRIES                        */}
        {/* ============================================================ */}
        <div id="countries" className="scroll-mt-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest mb-3">
                <Globe2 className="w-3.5 h-3.5 text-forest" />
                <span>Global Operating Reach</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
                Presence Across 6 Mining Jurisdictions
              </h2>
              <p className="mt-3 text-base text-ink-muted leading-relaxed">
                Operating in Tier-1 and established mining jurisdictions with high environmental and legal standards. Our diversified portfolio ensures resilient cash generation and operational flexibility.
              </p>
            </div>

            {/* Country Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCountry('All')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCountry === 'All'
                    ? 'bg-navy text-white'
                    : 'bg-white text-ink hover:bg-mist-light border border-mist'
                }`}
              >
                All (6)
              </button>
              {countries.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedCountry(c.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedCountry === c.name
                      ? 'bg-navy text-white'
                      : 'bg-white text-ink hover:bg-mist-light border border-mist'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Countries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCountries.map((c) => (
              <div
                key={c.name}
                className="bg-white rounded-2xl border border-mist overflow-hidden shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-44 w-full">
                    <Image
                      src={c.image}
                      alt={`${c.name} mining landscape`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{c.flag}</span>
                        <h3 className="font-bold text-base">{c.name}</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gold-light bg-navy/80 px-2 py-0.5 rounded">
                        {c.region}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block">
                        Assets &amp; Operations
                      </span>
                      <h4 className="text-sm font-bold text-navy mt-0.5">
                        {c.keyAsset}
                      </h4>
                      <span className="text-xs text-ink-muted">
                        {c.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-editorial p-3 rounded-lg border border-mist text-xs">
                      <div>
                        <span className="text-[10px] text-ink-subtle block uppercase font-semibold">
                          Attributable Output
                        </span>
                        <span className="font-extrabold text-navy tabular-nums block mt-0.5">
                          {c.productionH1}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-subtle block uppercase font-semibold">
                          Regional Team
                        </span>
                        <span className="font-medium text-ink block mt-0.5">
                          {c.workforce}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block mb-1">
                        Operational Highlights
                      </span>
                      {c.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start gap-2 text-xs text-ink">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-mist/80 mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAsk(`Tell me about Gold Fields operations and performance in ${c.name}.`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold-dark transition-colors cursor-pointer group"
                  >
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span>Ask AI about {c.name}</span>
                  </button>

                  <a
                    href={c.linkUrl}
                    className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                  >
                    <span>View asset</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
