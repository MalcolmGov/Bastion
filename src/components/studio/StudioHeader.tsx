'use client';

import React, { useState } from 'react';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';

interface HeaderProps {
  props: {
    brandName: string;
    logoUrl?: string;
    links?: Array<{ label: string; href: string }>;
    allLinks?: Array<{ label: string; href: string }>;
    ctaText?: string;
    ctaHref?: string;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioHeader({ props, styles, collection = 'contemporary', variant = 'standard_glass', isEditor }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  // Curate links: top 5 for bar, remaining for "More" dropdown
  const allNavItems = props.allLinks && props.allLinks.length > 0 ? props.allLinks : (props.links || []);
  const primaryLinks = (props.links && props.links.length > 0 ? props.links : allNavItems).slice(0, 5);
  const overflowLinks = allNavItems.filter(item => !primaryLinks.some(p => p.label.toLowerCase() === item.label.toLowerCase()));

  // Resolve custom styles & dark theme
  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    (styles as any)?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B'
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? 'rgba(5, 8, 15, 0.85)' : undefined);
  const effectiveTextColor = styles?.textColor || (styles as any)?.brandTextColor || (isDarkMode ? '#F8FAFC' : undefined);
  const effectiveLogo = (isDarkMode && (props as any)?.logoDarkUrl) ? (props as any).logoDarkUrl : props.logoUrl;

  const headerStyle: React.CSSProperties = {
    ...(effectiveBg ? { backgroundColor: effectiveBg } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(effectiveTextColor ? { color: effectiveTextColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...((styles as any)?.backdropBlur ? { backdropFilter: `blur(${(styles as any).backdropBlur})` } : {}),
  };

  const defaultBgClass = isDarkMode
    ? 'bg-[#05080F]/90 border-b border-white/10 text-white'
    : isImmersive
    ? 'bg-[#09090B]/90 border-b border-[#27272A] text-white'
    : isEditorial
    ? 'bg-[#F7F6F2]/95 border-b border-[#E2E7EA] text-[#082B49]'
    : 'bg-white/95 border-b border-slate-200 text-slate-900';

  const hasCustomBg = Boolean(effectiveBg || styles?.gradient || isDarkMode);

  return (
    <header
      style={headerStyle}
      className={`sticky top-0 z-40 transition-colors backdrop-blur-md relative ${!hasCustomBg ? defaultBgClass : 'border-b border-white/10'}`}
    >
      {(styles as any)?.bottomAccentLine && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: (styles as any).bottomAccentLine }}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo / Title */}
        <div className="flex items-center space-x-3 shrink-0">
          {effectiveLogo ? (
            <img
              src={effectiveLogo}
              alt={props.brandName}
              className="h-9 max-h-9 w-auto max-w-[190px] object-contain transition group-hover:opacity-90"
            />
          ) : (
            <div className="flex items-center space-x-2.5">
              <div
                style={styles?.accentColor ? { backgroundColor: styles.accentColor } : undefined}
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                  styles?.accentColor ? 'text-white' : (isImmersive ? 'bg-amber-500 text-black' : isEditorial ? 'bg-[#082B49] text-white' : 'bg-slate-900 text-white')
                }`}
              >
                {props.brandName.substring(0, 2).toUpperCase()}
              </div>
              <span className={`text-lg font-bold tracking-tight ${isEditorial ? 'font-serif' : 'font-sans'}`}>
                {props.brandName}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
          {primaryLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              className="whitespace-nowrap transition opacity-80 hover:opacity-100 hover:text-sky-400"
            >
              {link.label}
            </a>
          ))}

          {/* Overflow "More" Dropdown Menu */}
          {overflowLinks.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className="inline-flex items-center space-x-1 whitespace-nowrap opacity-80 hover:opacity-100 text-sm font-medium focus:outline-none transition py-1"
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setMoreDropdownOpen(false)}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800">
                    Additional Pages
                  </div>
                  <div className="py-1">
                    {overflowLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.href}
                        onClick={isEditor ? (e) => e.preventDefault() : undefined}
                        className="block px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition truncate"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Desktop Primary CTA Button */}
        <div className="hidden md:flex items-center space-x-4 shrink-0">
          {props.ctaText && (
            <a
              href={props.ctaHref || '#'}
              onClick={isEditor ? (e) => e.preventDefault() : undefined}
              style={styles?.accentColor ? { backgroundColor: styles.accentColor, color: '#FFFFFF' } : undefined}
              className={`px-5 py-2.5 text-xs font-semibold transition shadow-sm inline-flex items-center space-x-1.5 ${
                styles?.accentColor
                  ? 'rounded-lg hover:brightness-110'
                  : isImmersive
                  ? 'rounded-md bg-amber-600 text-white hover:bg-amber-500'
                  : isEditorial
                  ? 'bg-[#082B49] text-white hover:bg-[#003068] rounded-none'
                  : 'rounded-lg bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <span>{props.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white focus:outline-none"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Slide-Over / Dropdown */}
      {mobileOpen && (
        <div className="md:hidden px-6 py-6 border-t border-slate-800/80 bg-[#090D16] text-white space-y-4 shadow-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </div>
          <div className="space-y-2">
            {allNavItems.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                className="block text-sm font-medium py-1.5 text-slate-300 hover:text-white transition"
              >
                {link.label}
              </a>
            ))}
          </div>

          {props.ctaText && (
            <div className="pt-4 border-t border-slate-800">
              <a
                href={props.ctaHref || '#'}
                onClick={isEditor ? (e) => e.preventDefault() : undefined}
                style={styles?.accentColor ? { backgroundColor: styles.accentColor } : undefined}
                className={`block text-center w-full py-3 rounded-xl font-semibold text-xs text-white shadow-md ${
                  styles?.accentColor ? '' : 'bg-sky-600 hover:bg-sky-500'
                }`}
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
