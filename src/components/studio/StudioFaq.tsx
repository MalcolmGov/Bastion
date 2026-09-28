'use client';

import React, { useState } from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface StudioFaqProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    items?: FaqItem[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export const StudioFaq: React.FC<StudioFaqProps> = ({
  props,
  styles,
  collection,
  variant = 'accordion_centered',
  isEditor = false
}) => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleItem = (idx: number) => {
    setOpenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const eyebrow = props.eyebrow || 'Common Inquiries';
  const title = props.title || 'Frequently Asked Questions';
  const subtitle = props.subtitle || 'Everything you need to know about our platform, onboarding timeline, and institutional compliance.';
  const items = props.items || [];

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {};

  if (styles?.backgroundType === 'solid' && styles.backgroundColor) {
    inlineStyle.backgroundColor = styles.backgroundColor;
  } else if (styles?.backgroundType === 'gradient' && styles.gradient) {
    inlineStyle.background = styles.gradient;
  } else {
    inlineStyle.backgroundColor = collection === 'editorial' ? '#090E17' : '#080B12';
  }

  const headingStyle: React.CSSProperties = styles?.headingColor ? { color: styles.headingColor } : {};
  const textStyle: React.CSSProperties = styles?.textColor ? { color: styles.textColor } : {};
  const accentColor = styles?.accentColor || '#38BDF8';

  return (
    <section className={`relative overflow-hidden ${paddingClass}`} style={inlineStyle}>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          {eyebrow && (
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
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
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light max-w-2xl mx-auto" style={textStyle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOpen = openIndices.includes(idx);

            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/80 border-slate-700 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left space-x-4 focus:outline-none"
                >
                  <span className="text-base font-semibold text-white tracking-tight">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-slate-800 text-sky-400' : 'text-slate-400 bg-slate-900'
                    }`}
                    style={isOpen ? { color: accentColor } : {}}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 font-light" style={textStyle}>
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Help Desk Card */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center" style={{ color: accentColor }}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Still have questions?</h4>
              <p className="text-xs text-slate-400">Our enterprise solutions engineers are available for technical briefings.</p>
            </div>
          </div>
          <a
            href="/contact"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white border border-slate-700 hover:bg-slate-800 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};
