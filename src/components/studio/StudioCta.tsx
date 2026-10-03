'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';
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

interface CtaProps {
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    ctaText: string;
    ctaHref: string;
    contactDetails?: {
      phone?: string;
      london?: string;
      email?: string;
    };
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioCta({ props, styles, collection = 'contemporary', variant = 'split_card', isEditor }: CtaProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'left');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-6xl');
  const cardRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-3xl');
  const buttonRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  const sectionStyle: React.CSSProperties = {
    ...(styles?.backgroundType === 'solid' && styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(styles?.textColor ? { color: styles.textColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
    ...glowStyle,
    ...frostedGlassStyle,
  };

  const hasCustomBg = styles?.backgroundType === 'solid' || styles?.backgroundType === 'gradient';
  const paddingClass = styles?.paddingY || 'py-20 md:py-28';

  const defaultBgClass = isImmersive
    ? 'bg-[#0E0E10] text-white'
    : isEditorial
    ? 'bg-[#F0EFE9] text-[#172C3D]'
    : 'bg-slate-50 text-slate-900';

  return (
    <section
      style={sectionStyle}
      className={`relative overflow-hidden ${paddingClass} px-6 transition-colors ${!hasCustomBg ? defaultBgClass : ''}`}
    >
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={styles?.accentColor}
      />
      <div className={`${containerWidthClass} mx-auto relative z-10`}>
        <div
          className={`p-10 md:p-14 ${cardRadiusClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-10 shadow-2xl transition ${
            hasCustomBg
              ? 'bg-white/[0.06] border border-white/15 backdrop-blur-md text-white'
              : isImmersive
              ? 'bg-[#18181B] border border-[#27272A] text-white'
              : isEditorial
              ? 'bg-[#082B49] text-white shadow-lg'
              : 'bg-slate-900 text-white shadow-xl'
          }`}
          style={{
            ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
            ...frostedGlassStyle,
          }}
        >
          <div className={`max-w-2xl space-y-4 ${alignClass.container}`}>
            {props.eyebrow && (
              <div
                style={styles?.accentColor ? { color: styles.accentColor } : undefined}
                className={`text-xs font-bold uppercase tracking-wider ${
                  styles?.accentColor ? '' : isImmersive ? 'text-amber-400' : 'text-sky-400'
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
                className={`text-sm sm:text-base leading-relaxed opacity-80 ${alignClass.text}`}
              >
                {props.description}
              </p>
            )}
            {props.contactDetails && (
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs opacity-75">
                {(props.contactDetails.phone || props.contactDetails.london) && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{props.contactDetails.phone || props.contactDetails.london}</span>
                  </div>
                )}
                {props.contactDetails.email && (
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>{props.contactDetails.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <a
              href={props.ctaHref || '#'}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              style={styles?.accentColor ? { backgroundColor: styles.accentColor, color: '#FFFFFF' } : undefined}
              className={`inline-flex items-center space-x-2 px-8 py-4 font-semibold text-sm transition shadow-lg ${buttonRadiusClass} ${
                styles?.accentColor
                  ? 'hover:brightness-110 text-white'
                  : isImmersive
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500'
                  : isEditorial
                  ? 'bg-[#C8A064] text-[#082B49] hover:bg-[#D4AF37]'
                  : 'bg-sky-500 text-white hover:bg-sky-400'
              }`}
            >
              <span>{props.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
