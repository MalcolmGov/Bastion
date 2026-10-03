'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Check, X, Sparkles } from 'lucide-react';
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

interface ComparisonPlan {
  name: string;
  badge?: string;
  isPopular?: boolean;
}

interface ComparisonFeature {
  name: string;
  values: (string | boolean)[];
}

interface StudioComparisonProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    plans?: ComparisonPlan[];
    features?: ComparisonFeature[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export const StudioComparison: React.FC<StudioComparisonProps> = ({
  props,
  styles,
  collection,
  variant = 'feature_matrix',
  isEditor = false
}) => {
  const eyebrow = props.eyebrow || 'Deep Dive Comparison';
  const title = props.title || 'Detailed capability breakdown side-by-side.';
  const subtitle = props.subtitle || 'Compare architecture, SLAs, and dedicated resources across our engagement models.';
  const plans = props.plans || [
    { name: 'Core' },
    { name: 'Enterprise', badge: 'Standard', isPopular: true },
    { name: 'Sovereign' }
  ];
  const features = props.features || [];

  const defaultFont = collection === 'editorial' ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl lg:text-5xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-6xl');
  const cardRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-2xl');
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
    inlineStyle.backgroundColor = collection === 'editorial' ? '#080C16' : '#07090F';
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
      <div className={`${containerWidthClass} mx-auto px-6 sm:px-8 relative z-10`}>
        {/* Header */}
        <div className={`max-w-3xl space-y-4 mb-14 ${alignClass.container}`}>
          {eyebrow && (
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
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

        {/* Comparison Table */}
        <div
          className={`overflow-x-auto ${cardRadiusClass} border border-slate-800 bg-slate-950/60 shadow-xl`}
          style={{
            ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
            ...frostedGlassStyle,
          }}
        >
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/3">
                  Capabilities & SLA
                </th>
                {plans.map((p, idx) => (
                  <th
                    key={idx}
                    className={`py-5 px-6 text-center font-bold text-base ${
                      p.isPopular ? 'text-white bg-slate-900/60' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className={fontFamilyClass}>{p.name}</span>
                      {p.badge && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-950"
                          style={{ backgroundColor: accentColor }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {features.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`hover:bg-slate-900/40 transition ${
                    rIdx % 2 === 1 ? 'bg-slate-900/20' : 'bg-transparent'
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-slate-300 text-xs sm:text-sm">
                    {row.name}
                  </td>
                  {row.values.map((val, vIdx) => {
                    const plan = plans[vIdx];
                    const isColPopular = plan?.isPopular;

                    return (
                      <td
                        key={vIdx}
                        className={`py-4 px-6 text-center text-xs sm:text-sm ${
                          isColPopular ? 'bg-slate-900/40 font-semibold' : ''
                        }`}
                      >
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check
                              className="w-4 h-4 mx-auto"
                              style={{ color: accentColor }}
                            />
                          ) : (
                            <X className="w-4 h-4 mx-auto text-slate-600" />
                          )
                        ) : (
                          <span className="text-slate-300">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
