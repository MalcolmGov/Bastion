'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import {
  getFontFamilyClass,
  getHeadingScaleClass,
  getTrackingClass,
  getAlignmentClasses,
  getContainerWidthClass,
  getGlowEffectStyles,
  getFrostedGlassStyle,
} from '@/lib/studio/styleResolver';
import { StudioBackgroundFx } from './StudioBackgroundFx';

interface RichTextProps {
  props: {
    quote: string;
    author?: string;
    role?: string;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioRichText({ props, styles, collection = 'contemporary', variant = 'editorial_quote' }: RichTextProps) {
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
  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-serif';

  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-2xl sm:text-3xl md:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-normal');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-4xl');
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
  const paddingClass = styles?.paddingY || 'py-24 md:py-32';

  const defaultBgClass = isDarkMode
    ? 'bg-[#090D16] text-[#F8FAFC] border-b border-white/10'
    : isImmersive
    ? 'bg-[#09090B] text-white border-b border-[#27272A]'
    : isEditorial
    ? 'bg-[#F7F6F2] text-[#172C3D] border-b border-[#E2E7EA]'
    : 'bg-slate-900 text-white border-b border-slate-800';

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
      <div className={`${containerWidthClass} mx-auto ${alignClass.container} space-y-8 relative z-10`}>
        <blockquote
          style={styles?.textColor ? { color: styles.textColor } : undefined}
          className={`${fontFamilyClass} ${headingScaleClass} font-normal leading-relaxed ${trackingClass} italic ${alignClass.text}`}
        >
          {props.quote}
        </blockquote>

        {(props.author || props.role) && (
          <div className={`space-y-1 ${alignClass.text}`}>
            {props.author && (
              <div
                style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                className="text-base font-semibold tracking-wide"
              >
                {props.author}
              </div>
            )}
            {props.role && (
              <div
                style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                className={`text-xs font-mono uppercase tracking-wider ${
                  styles?.accentColor ? '' : isImmersive ? 'text-amber-400' : 'text-sky-400'
                }`}
              >
                {props.role}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
