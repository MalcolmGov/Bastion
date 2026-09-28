'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { Compass, Layers, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

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

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {};

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

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = (step.icon && ICON_MAP[step.icon]) || <Compass className="w-5 h-5" />;

            return (
              <div
                key={idx}
                className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all group"
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
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:scale-110 transition-transform"
                      style={{ color: accentColor }}
                    >
                      {Icon}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 tracking-tight">
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
