'use client';

import React from 'react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface TeamProps {
  props: {
    eyebrow?: string;
    title: string;
    members?: Array<{
      name: string;
      role: string;
      bio?: string;
      image?: string;
    }>;
  };
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioTeam({ props, collection = 'contemporary', variant = 'portrait_grid' }: TeamProps) {
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {props.members?.map((m, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl transition ${
                isImmersive
                  ? 'bg-[#141416] border border-[#27272A]'
                  : isEditorial
                  ? 'bg-white border border-[#E2E7EA] rounded-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80'
              }`}
            >
              <div className="aspect-[4/5] bg-slate-200 rounded-lg overflow-hidden mb-6 relative">
                <img
                  src={m.image || `https://images.unsplash.com/photo-${1534528741775 + idx}?auto=format&fit=crop&w=600&q=80`}
                  alt={m.name}
                  className="w-full h-full object-cover filter grayscale contrast-115"
                />
              </div>
              <h3 className={`text-xl font-bold ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans text-slate-900'}`}>
                {m.name}
              </h3>
              <div className={`text-xs font-semibold uppercase tracking-wider mt-1 mb-3 ${isImmersive ? 'text-amber-400' : 'text-sky-600'}`}>
                {m.role}
              </div>
              {m.bio && (
                <p className={`text-xs leading-relaxed ${isImmersive ? 'text-zinc-400' : 'text-slate-600'}`}>
                  {m.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
