'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import {
  getFontFamilyClass,
  getHeadingScaleClass,
  getTrackingClass,
  getAlignmentClasses,
  getContainerWidthClass,
  getBorderRadiusClass,
  getGlowEffectStyles
} from '@/lib/studio/styleResolver';

interface ServicesProps {
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    services?: Array<{
      title: string;
      description: string;
      metrics?: string;
      href?: string;
    }>;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioServices({ props, styles, collection = 'contemporary', variant = 'cards_3col' }: ServicesProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    (styles as any)?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B' ||
    styles?.backgroundColor === '#070B12' ||
    styles?.backgroundColor === '#05080F'
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? '#090D16' : undefined);
  const effectiveTextColor = styles?.textColor || (isDarkMode ? '#F8FAFC' : undefined);

  // Resolve visual controls tokens
  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'left');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const cardBorderRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-2xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle: React.CSSProperties = styles?.frostedGlass || styles?.glassBlurPx ? {
    backdropFilter: `blur(${styles?.glassBlurPx ?? 16}px)`,
    WebkitBackdropFilter: `blur(${styles?.glassBlurPx ?? 16}px)`,
  } : {};

  const sectionStyle: React.CSSProperties = {
    ...(effectiveBg ? { backgroundColor: effectiveBg } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(effectiveTextColor ? { color: effectiveTextColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : (isDarkMode ? { borderColor: 'rgba(255, 255, 255, 0.08)' } : {})),
    ...glowStyle,
    ...frostedGlassStyle,
  };

  const hasCustomBg = Boolean(effectiveBg || styles?.backgroundType === 'gradient');
  const paddingClass = styles?.paddingY || 'py-20 md:py-28';

  const defaultBgClass = isDarkMode
    ? 'bg-[#090D16] text-[#F8FAFC] border-b border-white/10'
    : isImmersive
    ? 'bg-[#09090B] text-white border-b border-[#27272A]'
    : isEditorial
    ? 'bg-[#F7F6F2] text-[#172C3D] border-b border-[#E2E7EA]'
    : 'bg-white text-slate-900 border-b border-slate-200';

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
          {props.description && (
            <p
              style={styles?.textColor ? { color: styles.textColor } : undefined}
              className={`text-base leading-relaxed opacity-80 ${alignClass.text}`}
            >
              {props.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.services?.map((svc, idx) => (
            <div
              key={idx}
              className={`p-7 ${cardBorderRadiusClass} flex flex-col justify-between transition group ${
                hasCustomBg || isDarkMode
                  ? 'bg-white/[0.04] border border-white/10 hover:border-white/25 hover:bg-white/[0.08] text-white shadow-sm'
                  : isImmersive
                  ? 'bg-[#141416] border border-[#27272A] hover:border-amber-600/50 text-white'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] rounded-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                    className="text-xs font-mono font-bold opacity-75"
                  >
                    0{idx + 1}
                  </span>
                  <ArrowUpRight
                    style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                    className="w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-60 group-hover:opacity-100"
                  />
                </div>
                <h3
                  style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                  className={`text-xl font-bold ${fontFamilyClass}`}
                >
                  {svc.title}
                </h3>
                <p
                  style={styles?.textColor ? { color: styles.textColor } : undefined}
                  className="text-sm leading-relaxed opacity-75"
                >
                  {svc.description}
                </p>
              </div>

              {svc.metrics && (
                <div
                  style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                  className="mt-6 pt-4 border-t border-current/10 text-xs font-semibold"
                >
                  {svc.metrics}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
