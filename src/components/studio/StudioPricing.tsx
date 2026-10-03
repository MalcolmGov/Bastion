'use client';

import React, { useState } from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
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

interface PricingPlan {
  name: string;
  badge?: string;
  monthlyPrice: string;
  annualPrice?: string;
  period?: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  isPopular?: boolean;
}

interface StudioPricingProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    annualSavingsNote?: string;
    plans?: PricingPlan[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export const StudioPricing: React.FC<StudioPricingProps> = ({
  props,
  styles,
  collection,
  variant = '3_tier_cards',
  isEditor = false
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const eyebrow = props.eyebrow || 'Predictable Investment';
  const title = props.title || 'Transparent pricing built for every stage of growth.';
  const subtitle = props.subtitle || 'Choose the tier that matches your transaction volume and operational scale.';
  const annualSavingsNote = props.annualSavingsNote || 'Save 20% on annual commitments';
  const plans = props.plans || [];

  const defaultFont = collection === 'editorial' ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl lg:text-5xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const cardRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-2xl');
  const buttonRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-xl');
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
    inlineStyle.backgroundColor = collection === 'editorial' ? '#070D18' : '#06080F';
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
        {/* Section Header */}
        <div className={`max-w-3xl space-y-4 mb-12 ${alignClass.container}`}>
          {eyebrow && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase" style={{ color: accentColor }}>
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

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center space-x-3">
            <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-800 p-1 flex items-center transition border border-slate-700 focus:outline-none"
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6 bg-sky-400' : 'translate-x-0 bg-slate-400'
                }`}
                style={billingCycle === 'annual' ? { backgroundColor: accentColor } : {}}
              />
            </button>
            <span className={`text-xs font-medium flex items-center space-x-1.5 ${billingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              <span>Annual Billing</span>
              {annualSavingsNote && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  {annualSavingsNote}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {plans.map((plan, idx) => {
            const isPopular = plan.isPopular;
            const price = billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={idx}
                className={`relative ${cardRadiusClass} flex flex-col justify-between transition-all duration-300 p-8 ${
                  isPopular
                    ? 'bg-slate-900/90 border-2 shadow-2xl scale-105 z-20'
                    : 'bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80'
                }`}
                style={{
                  ...(isPopular
                    ? {
                        borderColor: accentColor,
                        boxShadow: `0 20px 40px -15px ${accentColor}25`
                      }
                    : (styles?.borderColor ? { borderColor: styles.borderColor } : {})),
                  ...frostedGlassStyle,
                }}
              >
                {/* Popular Ribbon */}
                {isPopular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-slate-950 shadow-md flex items-center space-x-1"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{plan.badge || 'Most Popular'}</span>
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold text-white ${fontFamilyClass}`}>{plan.name}</h3>
                    {!isPopular && plan.badge && (
                      <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-6 min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline space-x-1.5 pb-6 mb-6 border-b border-slate-800/80">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {price}
                    </span>
                    {plan.period && (
                      <span className="text-xs font-medium text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: accentColor }}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <a
                  href={plan.ctaHref || '/contact'}
                  className={`w-full py-3 px-4 ${buttonRadiusClass} font-semibold text-xs tracking-wide transition flex items-center justify-center space-x-2 shadow-sm ${
                    isPopular
                      ? 'text-slate-950 hover:brightness-110 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                  style={isPopular ? { backgroundColor: accentColor } : {}}
                >
                  <span>{plan.ctaText || 'Get Started'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
