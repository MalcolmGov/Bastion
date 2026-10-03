'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Compass, Layers, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';
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

interface ProcessStep {
  number: string;
  icon?: string;
  title: string;
  description: string;
}

interface StudioProcessProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    steps?: ProcessStep[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  CheckCircle2: <CheckCircle2 className="w-5 h-5" />
};

export const StudioProcess: React.FC<StudioProcessProps> = ({
  props,
  styles,
  collection,
  variant = 'horizontal_numbered',
  isEditor = false
}) => {
  const eyebrow = props.eyebrow || 'Our Workflow';
  const title = props.title || 'A simple, proven process engineered for precision.';
  const subtitle = props.subtitle || 'From initial consultation to production launch, we eliminate friction and accelerate time-to-value.';
  const steps = props.steps || [];

  const defaultFont = collection === 'editorial' ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl lg:text-5xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const cardRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-2xl');
  const badgeRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {
    ...glowStyle,
    ...frostedGlassStyle,
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
  };

  if (styles?.backgroundType === 'solid' && styles.backgroundColor) {
    inlineStyle.backgroundColor = styles.backgroundColor;
  } else if (styles?.backgroundType === 'gradient' && styles.gradient) {
    inlineStyle.background = styles.gradient;
  } else {
    inlineStyle.backgroundColor = collection === 'editorial' ? '#070A12' : '#07090F';
  }

  const headingStyle: React.CSSProperties = styles?.headingColor ? { color: styles.headingColor } : {};
  const textStyle: React.CSSProperties = styles?.textColor ? { color: styles.textColor } : {};
  const accentColor = styles?.accentColor || '#38BDF8';

  return (
    <section className={`relative overflow-hidden ${paddingClass}`} style={inlineStyle}>
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={accentColor}
      />
      <div className={`${containerWidthClass} mx-auto px-6 sm:px-8 lg:px-12 relative z-10`}>
        {/* Header */}
        <div className={`max-w-3xl space-y-4 mb-16 ${alignClass.container}`}>
          {eyebrow && (
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
              <span>{eyebrow}</span>
            </div>
          )}
          <h2
            className={`${fontFamilyClass} ${headingScaleClass} font-extrabold ${trackingClass} text-white ${alignClass.text}`}
            style={headingStyle}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`text-base sm:text-lg text-slate-300 leading-relaxed font-light ${alignClass.text}`} style={textStyle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = (step.icon && ICON_MAP[step.icon]) || <Compass className="w-5 h-5" />;

            return (
              <div
                key={idx}
                className={`relative ${cardRadiusClass} bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all group`}
                style={{
                  ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
                  ...frostedGlassStyle,
                }}
              >
                <div>
                  {/* Step Top Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-2xl font-black font-mono tracking-tighter"
                      style={{ color: accentColor }}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`w-9 h-9 ${badgeRadiusClass} flex items-center justify-center bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:scale-110 transition-transform`}
                      style={{ color: accentColor }}
                    >
                      {Icon}
                    </div>
                  </div>

                  <h3 className={`text-base font-bold text-white mb-2 tracking-tight ${fontFamilyClass}`}>
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-light" style={textStyle}>
                    {step.description}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Phase {idx + 1} of {steps.length}</span>
                  {idx < steps.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden lg:block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
