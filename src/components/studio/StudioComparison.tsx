'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Check, X, Sparkles } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';

interface ComparisonPlan {
  name: string;
  isPopular?: boolean;
  badge?: string;
}

interface ComparisonFeature {
  name: string;
  values: Array<boolean | string>;
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
  variant = 'table_matrix',
  isEditor = false
}) => {
  const eyebrow = props.eyebrow || 'Side-by-Side Comparison';
  const title = props.title || 'Compare Platform Capabilities';
  const subtitle = props.subtitle || 'Select the exact level of capability, compliance automation, and dedicated engineering support you need.';
  const plans = props.plans || [
    { name: 'Starter', isPopular: false },
    { name: 'Professional', isPopular: true, badge: 'Recommended' },
    { name: 'Enterprise', isPopular: false }
  ];
  const features = props.features || [];

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {};

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
      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
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
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
            style={headingStyle}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light" style={textStyle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-xl">
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
                      <span>{p.name}</span>
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
