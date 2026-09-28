'use client';

import React from 'react';
import { Award, TrendingUp, CheckCircle } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface CaseStudiesProps {
  props: {
    eyebrow?: string;
    title: string;
    caseStudies?: Array<{
      headline: string;
      client: string;
      outcome: string;
      tag?: string;
    }>;
  };
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioCaseStudies({ props, collection = 'contemporary', variant = 'impact_cards' }: CaseStudiesProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <section className={`py-20 md:py-28 px-6 ${isImmersive ? 'bg-[#0E0E10] text-white border-b border-[#27272A]' : isEditorial ? 'bg-[#F0EFE9] text-[#172C3D] border-b border-[#E2E7EA]' : 'bg-slate-50 text-slate-900 border-b border-slate-200'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="max-w-3xl space-y-4">
          {props.eyebrow && (
            <div className={`text-xs font-bold uppercase tracking-wider ${isImmersive ? 'text-amber-400' : isEditorial ? 'text-[#76571F]' : 'text-sky-600'}`}>
              {props.eyebrow}
            </div>
          )}
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans'}`}>
            {props.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {props.caseStudies?.map((cs, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-2xl flex flex-col justify-between space-y-6 ${
                isImmersive
                  ? 'bg-[#18181B] border border-[#27272A]'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] rounded-none shadow-sm'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {cs.tag && (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${isImmersive ? 'bg-amber-950 text-amber-300' : 'bg-slate-100 text-slate-700'}`}>
                      {cs.tag}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-mono">Verified Mandate</span>
                </div>
                <h3 className={`text-2xl font-bold leading-snug ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans text-slate-900'}`}>
                  {cs.headline}
                </h3>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Client: {cs.client}
                </div>
              </div>

              <div className={`p-4 rounded-xl border text-sm leading-relaxed ${isImmersive ? 'bg-[#141416] border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
                <div className="font-semibold text-xs mb-1 uppercase tracking-wider text-slate-400">Transaction Outcome</div>
                {cs.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
