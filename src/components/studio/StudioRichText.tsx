'use client';

import React from 'react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface RichTextProps {
  props: {
    quote: string;
    author?: string;
    role?: string;
  };
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioRichText({ props, collection = 'contemporary', variant = 'editorial_quote' }: RichTextProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <section className={`py-24 md:py-32 px-6 ${isImmersive ? 'bg-[#09090B] text-white border-b border-[#27272A]' : isEditorial ? 'bg-[#F7F6F2] text-[#172C3D] border-b border-[#E2E7EA]' : 'bg-slate-900 text-white border-b border-slate-800'}`}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed tracking-normal italic text-slate-100">
          {props.quote}
        </blockquote>

        {(props.author || props.role) && (
          <div className="space-y-1">
            {props.author && (
              <div className="text-base font-semibold tracking-wide text-white">
                {props.author}
              </div>
            )}
            {props.role && (
              <div className={`text-xs font-mono uppercase tracking-wider ${isImmersive ? 'text-amber-400' : 'text-sky-400'}`}>
                {props.role}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
