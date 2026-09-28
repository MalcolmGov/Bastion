'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, Menu, ExternalLink, ChevronDown } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';

interface BrandHeaderProps {
  onOpenAssistant: (prompt?: string) => void;
  onOpenSearch: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  onOpenAssistant,
  onOpenSearch,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-40 transition-all duration-300">
      {/* Top Utility Bar (Quiet) */}
      <div className="bg-navy-dark text-mist text-[11px] border-b border-navy-surface/40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-mist/70 font-mono tracking-wider">
              JSE / NYSE: <strong className="text-white font-semibold">GFI</strong>
            </span>
            <span className="hidden sm:inline-block text-mist/40">•</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-mist/90 text-[10px] px-2.5 py-0.5 rounded-full bg-navy-surface/90 border border-turquoise/40">
              <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
              Creating enduring value beyond mining
            </span>
          </div>

          {/* Desktop utility links */}
          <div className="hidden sm:flex items-center space-x-5">
            <Link
              href="/careers"
              className="text-mist hover:text-white transition-colors"
            >
              Careers
            </Link>
            <Link
              href="/suppliers"
              className="text-mist hover:text-white transition-colors"
            >
              Suppliers
            </Link>
            <Link
              href="/contact"
              className="text-mist hover:text-white transition-colors"
            >
              Contact
            </Link>
            <a
              href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold-light hover:text-gold transition-colors font-semibold"
            >
              <span>Speak Up</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile utility link (Speak Up only to avoid horizontal overflow) */}
          <div className="flex sm:hidden items-center">
            <a
              href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold-light hover:text-gold transition-colors font-semibold text-[10px]"
            >
              <span>Speak Up</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`relative w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-mist'
            : 'bg-white/95 backdrop-blur-md border-b border-mist/60 shadow-subtle'
        }`}
      >
        <div
          className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16 sm:h-18 lg:h-20' : 'h-20 sm:h-24 lg:h-26'
          }`}
        >
          {/* Authentic Vector Logo — Proportional & Compact */}
          <Link href="/" className="relative flex items-center gap-2 sm:gap-3 group focus:outline-none shrink-0 py-2">
            <div className="relative h-9 sm:h-11 lg:h-12 w-auto flex items-center">
              <Image
                src="/assets/gold-fields-logo.svg"
                alt="Gold Fields Corporate Logo"
                width={140}
                height={85}
                priority
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            <div className="hidden 2xl:flex flex-col border-l-2 border-gold-mineral/40 pl-3 py-0.5">
              <span className="text-xs font-extrabold tracking-[0.16em] text-navy uppercase font-display leading-tight">
                GOLD FIELDS
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-gold-dark uppercase mt-0.5">
                GLOBAL MINING FLAGSHIP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Responsive Spacing to Guarantee Zero Clipping */}
          <div className="hidden lg:flex items-center gap-3.5 lg:gap-5 xl:gap-7 2xl:gap-8 text-xs xl:text-[13px] font-semibold text-ink shrink-0">
            <div
              className="relative py-2.5 cursor-pointer"
              onMouseEnter={() => setActiveMenu('about')}
            >
              <button
                className={`flex items-center gap-1 transition-colors hover:text-gold-dark ${
                  activeMenu === 'about' ? 'text-gold-dark' : 'text-ink'
                }`}
              >
                <span>About</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            <div
              className="relative py-2.5 cursor-pointer"
              onMouseEnter={() => setActiveMenu('operations')}
            >
              <button
                className={`flex items-center gap-1 transition-colors hover:text-gold-dark ${
                  activeMenu === 'operations' ? 'text-gold-dark' : 'text-ink'
                }`}
              >
                <span>Operations</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            <div
              className="relative py-2.5 cursor-pointer"
              onMouseEnter={() => setActiveMenu('sustainability')}
            >
              <button
                className={`flex items-center gap-1 transition-colors hover:text-gold-dark ${
                  activeMenu === 'sustainability' ? 'text-gold-dark' : 'text-ink'
                }`}
              >
                <span>Sustainability</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            <div
              className="relative py-2.5 cursor-pointer"
              onMouseEnter={() => setActiveMenu('investors')}
            >
              <button
                className={`flex items-center gap-1 transition-colors hover:text-gold-dark ${
                  activeMenu === 'investors' ? 'text-gold-dark' : 'text-ink'
                }`}
              >
                <span>Investors & Media</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>

            <Link
              href="/reports"
              className="py-2.5 hover:text-gold-dark transition-colors text-ink"
              onMouseEnter={() => setActiveMenu(null)}
            >
              Reports
            </Link>
          </div>

          {/* Right Action Controls: Search & Ask Gold Fields */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 shrink-0">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-full border border-mist bg-mist-light/50 hover:bg-mist text-ink-muted text-xs transition-colors shrink-0"
              aria-label="Search website (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-ink-muted" />
              <span className="pr-1 font-medium">Search</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-mist text-ink-subtle font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Ask Gold Fields Assistant Pill — Vibrant Turquoise Secondary Color */}
            <button
              onClick={() => onOpenAssistant()}
              className="flex items-center gap-2 px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-full bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 hover:brightness-110 text-navy-dark text-xs font-extrabold shadow-[0_0_16px_rgba(0,229,192,0.45)] hover:shadow-[0_0_24px_rgba(0,229,192,0.65)] transition-all duration-200 group cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-navy-dark group-hover:rotate-12 transition-transform shrink-0" />
              <span>Ask Gold Fields AI</span>
            </button>
          </div>

          {/* Mobile Actions: Search, Assistant, Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 sm:p-2.5 rounded-lg border border-mist/80 text-ink-muted hover:text-navy hover:bg-mist transition-colors"
              aria-label="Search website"
            >
              <Search className="w-4 h-4 text-ink" />
            </button>

            <button
              onClick={() => onOpenAssistant()}
              className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-turquoise to-turquoise-bright text-navy-dark text-xs font-bold shadow-[0_0_12px_rgba(0,229,192,0.5)] active:scale-95 transition-transform"
              aria-label="Ask Gold Fields AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-navy-dark" />
            </button>

            <button
              onClick={() => setMobileNavOpen(true)}
              className="p-2 sm:p-2.5 rounded-lg border border-mist/80 text-ink hover:bg-mist transition-colors"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5 text-ink" />
            </button>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <MegaMenu activeMenu={activeMenu} onClose={() => setActiveMenu(null)} />

        {/* Authentic Gold Fields Turquoise-to-Navy Gradient Accent Bar */}
        <div className="w-full h-[2.5px] bg-gradient-to-r from-navy via-turquoise to-gold-mineral" />
      </nav>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenSearch={onOpenSearch}
        onOpenAssistant={onOpenAssistant}
      />
    </header>
  );
};
