'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import {
  getFontFamilyClass,
  getHeadingScaleClass,
  getTrackingClass,
  getAlignmentClasses,
  getContainerWidthClass,
  getBorderRadiusClass,
  getGlowEffectStyles,
  getFrostedGlassStyle,
} from '@/lib/studio/styleResolver';
import { StudioBackgroundFx } from './StudioBackgroundFx';

interface CaseStudiesProps {
  props: {
    eyebrow?: string;
    title: string;
    caseStudies?: Array<{
      headline: string;
      client: string;
      outcome: string;
      tag?: string;
    }>;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioCaseStudies({ props, styles, collection = 'contemporary', variant = 'impact_cards' }: CaseStudiesProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B' ||
    styles?.backgroundColor === '#070B12' ||
    styles?.backgroundColor === '#05080F'
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? '#070B12' : undefined);
  const effectiveTextColor = styles?.textColor || (isDarkMode ? '#F8FAFC' : undefined);
  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-sans';

  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'left');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const borderRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-2xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  const sectionStyle: React.CSSProperties = {
    ...(effectiveBg ? { backgroundColor: effectiveBg } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(effectiveTextColor ? { color: effectiveTextColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
    ...glowStyle,
    ...frostedGlassStyle,
  };

  const hasCustomBg = Boolean(effectiveBg || styles?.backgroundType === 'gradient');
  const paddingClass = styles?.paddingY || 'py-20 md:py-28';

  const defaultBgClass = isDarkMode
    ? 'bg-[#090D16] text-[#F8FAFC] border-b border-white/10'
    : isImmersive
    ? 'bg-[#0E0E10] text-white border-b border-[#27272A]'
    : isEditorial
    ? 'bg-[#F0EFE9] text-[#172C3D] border-b border-[#E2E7EA]'
    : 'bg-slate-50 text-slate-900 border-b border-slate-200';

  return (
    <section
      style={sectionStyle}
      className={`relative overflow-hidden ${paddingClass} px-6 transition-colors ${!hasCustomBg ? defaultBgClass : (isDarkMode ? 'border-b border-white/10' : 'border-b border-slate-200')}`}
    >
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={styles?.accentColor}
      />
      <div className={`${containerWidthClass} mx-auto space-y-12 relative z-10`}>
        <div className={`max-w-3xl space-y-4 ${alignClass.container}`}>
          {props.eyebrow && (
            <div
              style={styles?.accentColor ? { color: styles.accentColor } : undefined}
              className={`text-xs font-bold uppercase tracking-wider ${
                styles?.accentColor ? '' : isImmersive ? 'text-amber-400' : isEditorial ? 'text-[#76571F]' : 'text-sky-600'
              }`}
            >
              {props.eyebrow}
            </div>
          )}
          <h2
            style={styles?.headingColor ? { color: styles.headingColor } : undefined}
            className={`${fontFamilyClass} ${headingScaleClass} font-bold ${trackingClass} ${alignClass.text}`}
          >
            {props.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {props.caseStudies?.map((cs, idx) => (
            <div
              key={idx}
              className={`p-8 ${borderRadiusClass} flex flex-col justify-between space-y-6 transition ${
                isImmersive
                  ? 'bg-[#18181B] border border-[#27272A]'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] shadow-sm'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
              style={{
                ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
                ...frostedGlassStyle,
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {cs.tag && (
                    <span
                      style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                        styles?.accentColor ? 'bg-sky-500/10' : isImmersive ? 'bg-amber-950 text-amber-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cs.tag}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">Verified Mandate</span>
                </div>
                <h3
                  style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                  className={`text-2xl font-bold leading-snug ${fontFamilyClass} ${
                    isEditorial || isImmersive ? 'font-normal' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {cs.headline}
                </h3>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Client: {cs.client}
                </div>
              </div>

              <div
                className={`p-4 rounded-xl border text-sm leading-relaxed ${
                  isImmersive ? 'bg-[#141416] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-100 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs mb-1 uppercase tracking-wider text-slate-400">Transaction Outcome</div>
                {cs.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
