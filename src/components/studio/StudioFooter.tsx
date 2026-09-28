'use client';

import React from 'react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface FooterProps {
  props: {
    copyright: string;
    officeAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  collection?: DesignCollectionId;
  variant?: string;
}

export function StudioFooter({ props, collection = 'contemporary', variant = 'multi_column' }: FooterProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <footer
      className={`py-16 px-6 ${
        isImmersive
          ? 'bg-[#050507] border-t border-[#27272A] text-zinc-400'
          : isEditorial
          ? 'bg-[#082B49] text-gray-300'
          : 'bg-slate-900 text-slate-400'
      }`}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-6 space-y-4">
          <div className="text-white font-bold text-lg tracking-tight">
            Corporate Disclosures & Contact
          </div>
          {props.officeAddress && (
            <p className="text-xs leading-relaxed max-w-sm">
              {props.officeAddress}
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-xs">
            {props.contactEmail && (
              <span>Email: <strong className="text-white font-medium">{props.contactEmail}</strong></span>
            )}
            {props.contactPhone && (
              <span>Tel: <strong className="text-white font-medium">{props.contactPhone}</strong></span>
            )}
          </div>
        </div>

        <div className="md:col-span-6 flex flex-col justify-between items-start md:items-end space-y-4">
          <div className="text-xs text-slate-500">
            Engineered with Move Studio • Single Multi-Tenant Platform
          </div>
          <div className="text-xs text-slate-400">
            {props.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
