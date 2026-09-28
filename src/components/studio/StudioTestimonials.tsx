'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Star, ShieldCheck, Quote } from 'lucide-react';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating?: number;
  verified?: boolean;
}

interface StudioTestimonialsProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    items?: TestimonialItem[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export const StudioTestimonials: React.FC<StudioTestimonialsProps> = ({
  props,
  styles,
  collection,
  variant = 'cards_grid',
  isEditor = false
}) => {
  const eyebrow = props.eyebrow || 'Client Endorsements';
  const title = props.title || 'Trusted by leaders who demand excellence.';
  const subtitle = props.subtitle || 'Read how our partners have accelerated growth and scaled mission-critical infrastructure.';
  const items = props.items || [];

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {};

  if (styles?.backgroundType === 'solid' && styles.backgroundColor) {
    inlineStyle.backgroundColor = styles.backgroundColor;
  } else if (styles?.backgroundType === 'gradient' && styles.gradient) {
    inlineStyle.background = styles.gradient;
  } else {
    inlineStyle.backgroundColor = collection === 'editorial' ? '#070913' : '#06080F';
  }

  const headingStyle: React.CSSProperties = styles?.headingColor ? { color: styles.headingColor } : {};
  const textStyle: React.CSSProperties = styles?.textColor ? { color: styles.textColor } : {};
  const accentColor = styles?.accentColor || '#38BDF8';

  return (
    <section className={`relative overflow-hidden ${paddingClass}`} style={inlineStyle}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          {eyebrow && (
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const rating = item.rating || 5;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 flex flex-col justify-between hover:border-slate-700/80 transition shadow-lg"
              >
                <div>
                  {/* Star Rating & Quote Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className={`w-4 h-4 ${
                            sIdx < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <Quote className="w-5 h-5 text-slate-700" />
                  </div>

                  {/* Quote Body */}
                  <p className="text-sm text-slate-200 leading-relaxed font-light italic mb-8" style={textStyle}>
                    “{item.quote}”
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <span>{item.author}</span>
                      {item.verified && (
                        <span title="Verified Client" className="text-sky-400">
                          <ShieldCheck className="w-3.5 h-3.5 inline" style={{ color: accentColor }} />
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {item.role} • <span className="text-slate-300 font-medium">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
