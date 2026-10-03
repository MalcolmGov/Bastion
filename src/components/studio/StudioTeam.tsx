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

interface TeamProps {
  props: {
    eyebrow?: string;
    title: string;
    members?: Array<{
      name: string;
      role: string;
      bio?: string;
      image?: string;
    }>;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioTeam({ props, styles, collection = 'contemporary', variant = 'portrait_grid' }: TeamProps) {
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
  const borderRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-xl');
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {props.members?.map((m, idx) => (
            <div
              key={idx}
              className={`p-6 ${borderRadiusClass} transition ${
                isImmersive
                  ? 'bg-[#141416] border border-[#27272A]'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80 shadow-xs'
              }`}
              style={{
                ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
                ...frostedGlassStyle,
              }}
            >
              <div className={`aspect-[4/5] bg-slate-200 ${borderRadiusClass} overflow-hidden mb-6 relative`}>
                <img
                  src={m.image || `https://images.unsplash.com/photo-${1534528741775 + idx}?auto=format&fit=crop&w=600&q=80`}
                  alt={m.name}
                  className="w-full h-full object-cover filter grayscale contrast-115"
                />
              </div>
              <h3
                style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                className={`text-xl font-bold ${fontFamilyClass} ${
                  isEditorial || isImmersive ? 'font-normal' : 'text-slate-900 dark:text-white'
                }`}
              >
                {m.name}
              </h3>
              <div
                style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                className={`text-xs font-semibold uppercase tracking-wider mt-1 mb-3 ${
                  styles?.accentColor ? '' : isImmersive ? 'text-amber-400' : 'text-sky-600'
                }`}
              >
                {m.role}
              </div>
              {m.bio && (
                <p
                  style={styles?.textColor ? { color: styles.textColor } : undefined}
                  className={`text-xs leading-relaxed ${isImmersive ? 'text-zinc-400' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {m.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
