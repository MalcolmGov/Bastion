'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';

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
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioHero({ props, styles, collection = 'contemporary', variant = 'contemporary_bold', isEditor }: HeroProps) {
  const isEditorial = collection === 'editorial';
  const isImmersive = collection === 'immersive';

  // Resolve custom styles & dark theme
  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    (styles as any)?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B' ||
    styles?.backgroundColor === '#070B12' ||
    styles?.backgroundColor === '#05080F'
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? '#070B12' : undefined);
  const effectiveTextColor = styles?.textColor || (isDarkMode ? '#F8FAFC' : undefined);

  // Custom inline styles resolution
  const heroStyle: React.CSSProperties = {
    ...(effectiveBg ? { backgroundColor: effectiveBg } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(effectiveTextColor ? { color: effectiveTextColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : (isDarkMode ? { borderColor: 'rgba(255, 255, 255, 0.08)' } : {})),
  };

  const hasCustomBg = Boolean(effectiveBg || styles?.backgroundType === 'gradient');
  const paddingClass = styles?.paddingY || (variant === 'immersive_full' || isImmersive ? 'py-28' : 'py-20 md:py-28');

  if (variant === 'immersive_full' || isImmersive) {
    return (
      <section
        style={heroStyle}
        className={`relative min-h-[85vh] flex items-center justify-center ${!hasCustomBg ? 'bg-[#09090B]' : ''} text-white px-6 ${paddingClass} overflow-hidden`}
      >
        <StudioBackgroundFx
          pattern={styles?.backgroundPattern}
          opacity={styles?.patternOpacity}
          accentColor={styles?.accentColor}
        />
        {/* Ambient atmospheric backdrop */}
        {!hasCustomBg && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#09090B] z-10" />
        )}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition duration-1000 opacity-30"
          style={{
            backgroundImage: `url(${props.bgImage || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=80'})`
          }}
        />

        <div className="relative z-20 max-w-4xl mx-auto text-center space-y-8">
          {props.badge && (
            <div
              style={styles?.accentColor ? { borderColor: styles.accentColor, color: styles.accentColor } : undefined}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs font-medium tracking-wide uppercase backdrop-blur-xs"
            >
              <span>{props.badge}</span>
            </div>
          )}

          <h1
            style={styles?.headingColor ? { color: styles.headingColor } : undefined}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.12] tracking-normal text-white"
          >
            {props.title}
          </h1>

          {props.subtitle && (
            <p
              style={styles?.textColor ? { color: styles.textColor } : undefined}
              className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {props.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {props.primaryCta && (
              <a
                href={props.primaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                style={styles?.accentColor ? { backgroundColor: styles.accentColor, borderColor: styles.accentColor, color: '#FFFFFF' } : undefined}
                className={`inline-flex items-center space-x-2 px-7 py-3.5 rounded-md font-medium transition shadow-lg text-sm ${
                  styles?.accentColor ? '' : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600'
                }`}
              >
                <span>{props.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {props.secondaryCta && (
              <a
                href={props.secondaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-md border border-white/20 text-zinc-300 hover:text-white hover:border-white/40 transition text-sm font-medium"
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
      <section
        style={heroStyle}
        className={`${!hasCustomBg ? 'bg-[#F7F6F2] text-[#172C3D]' : ''} ${paddingClass} px-6 border-b border-black/10 relative overflow-hidden`}
      >
        <StudioBackgroundFx
          pattern={styles?.backgroundPattern}
          opacity={styles?.patternOpacity}
          accentColor={styles?.accentColor}
        />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            {props.badge && (
              <div
                style={styles?.accentColor ? { borderColor: styles.accentColor, color: styles.accentColor } : undefined}
                className="inline-block px-3 py-1 bg-white/40 border border-current text-xs font-semibold tracking-wider uppercase"
              >
                {props.badge}
              </div>
            )}
            <h1
              style={styles?.headingColor ? { color: styles.headingColor } : undefined}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.14] tracking-tight"
            >
              {props.title}
            </h1>
            {props.subtitle && (
              <p
                style={styles?.textColor ? { color: styles.textColor } : undefined}
                className="text-lg font-sans leading-relaxed max-w-xl opacity-85"
              >
                {props.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {props.primaryCta && (
                <a
                  href={props.primaryCta.href || '#'}
                  onClick={isEditor ? (e) => e.preventDefault() : undefined}
                  style={styles?.accentColor ? { backgroundColor: styles.accentColor, color: '#FFFFFF' } : undefined}
                  className={`px-7 py-3.5 font-medium transition text-sm shadow-sm inline-flex items-center space-x-2 ${
                    styles?.accentColor ? 'hover:brightness-110' : 'bg-[#082B49] text-white hover:bg-[#003068]'
                  }`}
                >
                  <span>{props.primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              {props.secondaryCta && (
                <a
                  href={props.secondaryCta.href || '#'}
                  onClick={isEditor ? (e) => e.preventDefault() : undefined}
                  className="px-6 py-3.5 border border-current opacity-80 hover:opacity-100 transition text-sm font-medium"
                >
                  <span>{props.secondaryCta.label}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-gray-200 overflow-hidden shadow-md rounded-lg">
              <img
                src={props.bgImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'}
                alt={props.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white text-xs">
                <span className="font-serif italic">Verified Practice Profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Contemporary Bold
  return (
    <section
      style={heroStyle}
      className={`${!hasCustomBg ? (isDarkMode ? 'bg-[#070B12] text-[#F8FAFC]' : 'bg-[#F8FAFC] text-[#0F172A]') : ''} ${paddingClass} px-6 ${isDarkMode ? 'border-b border-white/10' : 'border-b border-black/10'} relative overflow-hidden`}
    >
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={styles?.accentColor}
      />
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        <div className="max-w-4xl space-y-6">
          {props.badge && (
            <div
              style={styles?.accentColor ? { borderColor: styles.accentColor, color: styles.accentColor } : undefined}
              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                isDarkMode ? 'bg-white/10 border border-white/20 text-slate-200' : 'bg-white/70 border border-current text-xs'
              } text-xs font-semibold tracking-wide`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{props.badge}</span>
            </div>
          )}

          <h1
            style={styles?.headingColor ? { color: styles.headingColor } : (isDarkMode ? { color: '#FFFFFF' } : undefined)}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.12]"
          >
            {props.title}
          </h1>

          {props.subtitle && (
            <p
              style={styles?.textColor ? { color: styles.textColor } : (isDarkMode ? { color: '#CBD5E1' } : undefined)}
              className="text-lg md:text-xl font-normal leading-relaxed max-w-3xl opacity-85"
            >
              {props.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {props.primaryCta && (
              <a
                href={props.primaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                style={styles?.accentColor ? { backgroundColor: styles.accentColor, color: '#FFFFFF' } : undefined}
                className={`px-6 py-3 rounded-lg font-semibold transition text-sm shadow-sm inline-flex items-center space-x-2 ${
                  styles?.accentColor ? 'hover:brightness-110 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <span>{props.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {props.secondaryCta && (
              <a
                href={props.secondaryCta.href || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className={`px-5 py-3 rounded-lg border transition text-sm font-semibold ${
                  isDarkMode
                    ? 'border-white/20 text-slate-200 hover:text-white hover:border-white/40 hover:bg-white/5'
                    : 'border-current opacity-80 hover:opacity-100 hover:bg-black/5'
                }`}
              >
                <span>{props.secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>

        {/* 4-Pillar Metric Strip */}
        {props.stats && props.stats.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t ${isDarkMode ? 'border-white/10' : 'border-current/10'}`}>
            {props.stats.map((st, idx) => (
              <div
                key={idx}
                className={`${
                  isDarkMode
                    ? 'bg-white/[0.04] border border-white/10 backdrop-blur-md'
                    : 'bg-white/80 border border-current/10 backdrop-blur-xs'
                } p-5 rounded-xl shadow-xs`}
              >
                <div
                  style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                  className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {st.value}
                </div>
                <div className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
