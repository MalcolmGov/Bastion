'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface ServicesProps {
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    services?: Array<{
      title: string;
      description: string;
      metrics?: string;
      href?: string;
    }>;
  };
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioServices({ props, collection = 'contemporary', variant = 'cards_3col' }: ServicesProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <section className={`py-20 md:py-28 px-6 ${isImmersive ? 'bg-[#09090B] text-white border-b border-[#27272A]' : isEditorial ? 'bg-[#F7F6F2] text-[#172C3D] border-b border-[#E2E7EA]' : 'bg-white text-slate-900 border-b border-slate-200'}`}>
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
          {props.description && (
            <p className={`text-base leading-relaxed ${isImmersive ? 'text-zinc-400' : 'text-slate-600'}`}>
              {props.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {props.services?.map((svc, idx) => (
            <div
              key={idx}
              className={`p-7 rounded-xl flex flex-col justify-between transition group ${
                isImmersive
                  ? 'bg-[#141416] border border-[#27272A] hover:border-amber-600/50'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] rounded-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-bold ${isImmersive ? 'text-amber-400/80' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <ArrowUpRight className={`w-4 h-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isImmersive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-900'}`} />
                </div>
                <h3 className={`text-xl font-bold ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans text-slate-900'}`}>
                  {svc.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isImmersive ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {svc.description}
                </p>
              </div>

              {svc.metrics && (
                <div className={`mt-6 pt-4 border-t text-xs font-semibold ${isImmersive ? 'border-zinc-800 text-amber-300' : 'border-slate-200 text-slate-700'}`}>
                  {svc.metrics}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
