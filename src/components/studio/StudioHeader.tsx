'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface HeaderProps {
  props: {
    brandName: string;
    logoUrl?: string;
    links?: Array<{ label: string; href: string }>;
    ctaText?: string;
    ctaHref?: string;
  };
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioHeader({ props, collection = 'contemporary', variant = 'standard_glass', isEditor }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${
        isImmersive
          ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A] text-white'
          : isEditorial
          ? 'bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E2E7EA] text-[#082B49]'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo / Title */}
        <div className="flex items-center space-x-3">
          {props.logoUrl ? (
            <img src={props.logoUrl} alt={props.brandName} className="h-8 w-auto object-contain" />
          ) : (
            <div className="flex items-center space-x-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isImmersive ? 'bg-amber-500 text-black' : isEditorial ? 'bg-[#082B49] text-white' : 'bg-slate-900 text-white'
              }`}>
                {props.brandName.substring(0, 2).toUpperCase()}
              </div>
              <span className={`text-lg font-bold tracking-tight ${isEditorial || isImmersive ? 'font-serif' : 'font-sans'}`}>
                {props.brandName}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {props.links?.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              className={`transition ${
                isImmersive
                  ? 'text-zinc-300 hover:text-white'
                  : isEditorial
                  ? 'text-gray-700 hover:text-[#082B49]'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          {props.ctaText && (
            <a
              href={props.ctaHref || '#'}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              className={`px-5 py-2.5 text-xs font-semibold transition ${
                isImmersive
                  ? 'rounded-md bg-amber-600 text-white hover:bg-amber-500'
                  : isEditorial
                  ? 'bg-[#082B49] text-white hover:bg-[#003068] rounded-none'
                  : 'rounded-lg bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {props.ctaText}
            </a>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className={`md:hidden px-6 py-6 border-t ${isImmersive ? 'bg-[#09090B] border-[#27272A]' : 'bg-white border-slate-200'} space-y-4`}>
          {props.links?.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              className="block text-base font-medium py-1"
            >
              {link.label}
            </a>
          ))}
          {props.ctaText && (
            <div className="pt-2">
              <a
                href={props.ctaHref || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="block text-center w-full py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm"
              >
                {props.ctaText}
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
