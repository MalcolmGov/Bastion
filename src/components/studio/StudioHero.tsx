'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface HeroProps {
  props: {
    badge?: string;
    title: string;
    subtitle?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    bgImage?: string;
    stats?: Array<{ value: string; label: string }>;
  };
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioHero({ props, collection = 'contemporary', variant = 'contemporary_bold', isEditor }: HeroProps) {
  const isEditorial = collection === 'editorial';
  const isImmersive = collection === 'immersive';

  if (variant === 'immersive_full' || isImmersive) {
    return (
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#09090B] text-white px-6 py-28 overflow-hidden">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#09090B] z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition duration-1000 opacity-40"
          style={{
            backgroundImage: `url(${props.bgImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=80'})`
          }}
        />

        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-8">
          {props.badge && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-700/40 text-amber-300 text-xs font-medium tracking-wide uppercase">
              <span>{props.badge}</span>
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.12] tracking-normal text-white">
            {props.title}
          </h1>

          {props.subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed">
              {props.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {props.primaryCta && (
              <a
                href={props.primaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-md bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium hover:from-amber-500 hover:to-amber-600 transition shadow-lg text-sm"
              >
                <span>{props.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {props.secondaryCta && (
              <a
                href={props.secondaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition text-sm font-medium"
              >
                <span>{props.secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'editorial_split' || isEditorial) {
    return (
      <section className="bg-[#F7F6F2] text-[#172C3D] py-20 md:py-28 px-6 border-b border-[#E2E7EA]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {props.badge && (
              <div className="inline-block px-3 py-1 bg-[#F0E4CE] text-[#76571F] border border-[#C8A064]/30 text-xs font-semibold tracking-wider uppercase">
                {props.badge}
              </div>
            )}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.14] tracking-tight text-[#082B49]">
              {props.title}
            </h1>
            {props.subtitle && (
              <p className="text-lg text-gray-700 font-sans leading-relaxed max-w-xl">
                {props.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {props.primaryCta && (
                <a
                  href={props.primaryCta.href || '#'}
                  onClick={isEditor ? (e) => e.preventDefault() : undefined}
                  className="px-7 py-3.5 bg-[#082B49] text-white font-medium hover:bg-[#003068] transition text-sm shadow-sm inline-flex items-center space-x-2"
                >
                  <span>{props.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A064]" />
                </a>
              )}
              {props.secondaryCta && (
                <a
                  href={props.secondaryCta.href || '#'}
                  onClick={isEditor ? (e) => e.preventDefault() : undefined}
                  className="px-6 py-3.5 border border-[#082B49] text-[#082B49] hover:bg-[#082B49]/5 transition text-sm font-medium"
                >
                  <span>{props.secondaryCta.label}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden shadow-md">
              <img
                src={props.bgImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'}
                alt={props.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#082B49]/80 to-transparent p-6 text-white text-xs">
                <span className="font-serif italic">Verified Practice Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Contemporary Bold (Default for professional services / tech)
  return (
    <section className="bg-[#F8FAFC] text-[#0F172A] py-20 md:py-28 px-6 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="max-w-4xl space-y-6">
          {props.badge && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
              <span>{props.badge}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
            {props.title}
          </h1>

          {props.subtitle && (
            <p className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl">
              {props.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {props.primaryCta && (
              <a
                href={props.primaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition text-sm shadow-sm inline-flex items-center space-x-2"
              >
                <span>{props.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </a>
            )}
            {props.secondaryCta && (
              <a
                href={props.secondaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="px-5 py-3 rounded-lg border border-slate-300 text-slate-800 hover:bg-white transition text-sm font-semibold"
              >
                <span>{props.secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>

        {/* 4-Pillar Metric Strip */}
        {props.stats && props.stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
            {props.stats.map((st, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
                  {st.value}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
