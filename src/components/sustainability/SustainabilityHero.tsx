'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface SustainabilityHeroProps {
  onAskAI?: (prompt?: string, context?: string) => void;
}

export const SustainabilityHero: React.FC<SustainabilityHeroProps> = ({ onAskAI }) => {
  const handleTriggerAI = (prompt?: string) => {
    const textPrompt = prompt || "What are Gold Fields' 2030 ESG targets and sustainability commitments?";
    const context = "Sustainability & 2030 ESG Targets";
    if (onAskAI) {
      onAskAI(textPrompt, context);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt: textPrompt,
            context: context,
          },
        })
      );
    }
  };

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-navy-dark overflow-hidden">
      {/* Background Image with Deep Gradient Protection */}
      <div className="absolute inset-0">
        <Image
          src="/assets/home-climate.png"
          alt="Renewable solar array and environmental landscape at Gold Fields"
          fill
          priority
          className="object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/75 lg:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-light/10 border border-forest/40 text-forest-light text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span>Gold Fields ESG Framework</span>
            <span className="text-mist/40">•</span>
            <span>2030 Science-Based Targets</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Responsible Mining. <br />
            <span className="text-gold-light font-normal italic">
              Measured Commitments.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-mist/90 font-normal leading-relaxed max-w-2xl">
            At Gold Fields, sustainability is embedded into capital allocation, daily operational governance, and long-term shareholder value creation. We are delivering tangible progress toward our 2030 targets and Net Zero 2050 ambition.
          </p>

          {/* Action Row & Contextual Trigger */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleTriggerAI()}
              className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-navy-dark transition-transform group-hover:rotate-12" />
              <span>Ask AI about sustainability commitments</span>
            </button>

            <a
              href="#targets"
              className="px-5 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-2"
            >
              <span>Explore 2030 Targets</span>
              <ArrowDown className="w-4 h-4 text-mist" />
            </a>
          </div>
        </div>

        {/* 5 Highlights Quick KPI Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 border-t border-mist/15 pt-8 text-white">
          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Decarbonization
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gold-light tabular-nums mt-1">
              -26.4%
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Net Scope 1 & 2 vs 2016
            </span>
          </div>

          <div className="bg-navy/70 border border-turquoise/30 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-turquoise block">
              Water Recycled
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-turquoise tabular-nums mt-1">
              78%
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Targeting 80%+ by 2030
            </span>
          </div>

          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              GISTM Conformance
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 tabular-nums mt-1">
              100%
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Extreme / Very High TSFs
            </span>
          </div>

          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Safety Record
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums mt-1">
              0 Fatalities
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              H1 2026 (TRIFR 1.15)
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Host Community Spend
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gold-light tabular-nums mt-1">
              $914M
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              34% in-country spend
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
