'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  ArrowDown,
  Award
} from 'lucide-react';

interface AboutHeroProps {
  onAskAI?: (prompt?: string, context?: string) => void;
}

export const AboutHero: React.FC<AboutHeroProps> = ({ onAskAI }) => {
  const handleTriggerAI = (customPrompt?: string) => {
    const prompt =
      customPrompt ||
      "Provide an overview of Gold Fields: our purpose 'Creating enduring value beyond mining', 135+ year heritage, core values, and global presence across 6 countries.";
    const context = "About Gold Fields Overview";

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

  return (
    <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center bg-navy-dark overflow-hidden">
      {/* Background Image with Deep Gradient Protection */}
      <div className="absolute inset-0">
        <Image
          src="/assets/nav1.jpg"
          alt="Gold Fields 135+ year mining heritage and global operations"
          fill
          priority
          className="object-cover object-center opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/80 lg:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold-light text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
            <Award className="w-3.5 h-3.5 text-gold" />
            <span>Est. 1887 • 135+ Years of Mining Heritage</span>
            <span className="text-mist/40">•</span>
            <span>JSE & NYSE: GFI</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
            Creating enduring value <br />
            <span className="text-gold-light font-normal italic">
              beyond mining.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-mist/90 font-normal leading-relaxed max-w-2xl">
            Gold Fields is a globally diversified gold producer with an attributable annual production profile, operating nine tier-1 and quality mines and projects across six countries on four continents. Grounded in our core values, we deliver sustainable shareholder returns, environmental stewardship, and enduring community prosperity.
          </p>

          {/* Action Row & Contextual Trigger */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleTriggerAI()}
              className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-navy-dark transition-transform group-hover:rotate-12" />
              <span>Ask AI about Gold Fields</span>
            </button>

            <a
              href="#values"
              className="px-5 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-2"
            >
              <span>Our Core Values</span>
              <ArrowDown className="w-4 h-4 text-mist" />
            </a>
          </div>
        </div>

        {/* 5 Fast Facts KPI Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 border-t border-mist/15 pt-8 text-white">
          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Continuous Heritage
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gold-light tabular-nums mt-1">
              135+ Years
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Founded 1887 in South Africa
            </span>
          </div>

          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Global Footprint
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gold-light tabular-nums mt-1">
              6 Countries
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Across 4 Continents
            </span>
          </div>

          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Portfolio Assets
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums mt-1">
              9 Mines & Projects
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Tier-1 & Quality Focus
            </span>
          </div>

          <div className="bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Global Workforce
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums mt-1">
              &gt;20,000
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Employees & Contractors
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 bg-navy/70 border border-mist/10 rounded-xl p-4 backdrop-blur-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-mist/70 block">
              Primary Listings
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-gold-light tabular-nums mt-1">
              JSE &amp; NYSE
            </div>
            <span className="text-[11px] text-mist/80 block mt-0.5">
              Ticker Symbol: GFI
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
