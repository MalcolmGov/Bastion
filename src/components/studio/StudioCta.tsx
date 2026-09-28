'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface CtaProps {
  props: {
    eyebrow?: string;
    title: string;
    description?: string;
    ctaText: string;
    ctaHref: string;
    contactDetails?: {
      phone?: string;
      london?: string;
      email?: string;
    };
  };
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioCta({ props, collection = 'contemporary', variant = 'split_card', isEditor }: CtaProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <section className={`py-20 md:py-28 px-6 ${isImmersive ? 'bg-[#0E0E10] text-white' : isEditorial ? 'bg-[#F0EFE9] text-[#172C3D]' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div
          className={`p-10 md:p-14 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-10 ${
            isImmersive
              ? 'bg-[#18181B] border border-[#27272A]'
              : isEditorial
              ? 'bg-[#082B49] text-white rounded-none shadow-lg'
              : 'bg-slate-900 text-white shadow-xl'
          }`}
        >
          <div className="max-w-2xl space-y-4">
            {props.eyebrow && (
              <div className={`text-xs font-bold uppercase tracking-wider ${isImmersive ? 'text-amber-400' : 'text-sky-400'}`}>
                {props.eyebrow}
              </div>
            )}
            <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans'}`}>
              {props.title}
            </h2>
            {props.description && (
              <p className={`text-sm sm:text-base leading-relaxed ${isImmersive ? 'text-zinc-400' : 'text-slate-300'}`}>
                {props.description}
              </p>
            )}
            {props.contactDetails && (
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
                {(props.contactDetails.phone || props.contactDetails.london) && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    <span>{props.contactDetails.phone || props.contactDetails.london}</span>
                  </div>
                )}
                {props.contactDetails.email && (
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>{props.contactDetails.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <a
              href={props.ctaHref || '#'}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              className={`inline-flex items-center space-x-2 px-8 py-4 font-semibold text-sm transition shadow-lg ${
                isImmersive
                  ? 'rounded-md bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500'
                  : isEditorial
                  ? 'bg-[#C8A064] text-[#082B49] hover:bg-[#D4AF37] rounded-none'
                  : 'rounded-lg bg-sky-500 text-white hover:bg-sky-400'
              }`}
            >
              <span>{props.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
