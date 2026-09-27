'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ChevronDown, Sparkles, ExternalLink, Search } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
  onOpenAssistant: (prompt?: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
  onOpenAssistant,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-mist flex items-center justify-between bg-editorial">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/gold-fields-logo.svg"
              alt="Gold Fields"
              width={140}
              height={85}
              className="h-12 w-auto object-contain"
            />
            <span className="text-xs font-extrabold tracking-wider text-navy font-display">
              GOLD FIELDS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-navy rounded-full hover:bg-mist transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: Ask Gold Fields */}
        <div className="p-4 border-b border-mist bg-navy text-white">
          <button
            onClick={() => {
              onClose();
              onOpenAssistant();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded bg-gold-dark hover:bg-gold-mineral text-white font-medium text-xs transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-light" />
              Ask Gold Fields Assistant
            </span>
            <span className="text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
              Demo
            </span>
          </button>
        </div>

        {/* Mobile Search Button */}
        <div className="p-4 border-b border-mist">
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 bg-mist-light hover:bg-mist rounded text-ink-muted text-xs transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search operations, reports, news...</span>
          </button>
        </div>

        {/* Navigation Accordion */}
        <div className="flex-1 px-4 py-2 space-y-1">
          {/* About */}
          <div>
            <button
              onClick={() => toggleSection('about')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold text-ink hover:text-navy"
            >
              <span>About Gold Fields</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSection === 'about' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSection === 'about' && (
              <div className="pl-4 pb-3 space-y-2 text-xs border-l-2 border-gold-mineral my-1">
                <Link href="/about" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  This is Gold Fields & Purpose
                </Link>
                <Link href="/about#values" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Core Values
                </Link>
                <Link href="/about#strategy" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Our Strategy
                </Link>
                <Link href="/about#leadership" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Board & Executive Committee
                </Link>
              </div>
            )}
          </div>

          {/* Operations */}
          <div>
            <button
              onClick={() => toggleSection('operations')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold text-ink hover:text-navy"
            >
              <span>Our Operations</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSection === 'operations' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSection === 'operations' && (
              <div className="pl-4 pb-3 space-y-2 text-xs border-l-2 border-gold-mineral my-1">
                <Link href="/operations" onClick={onClose} className="block py-1 font-medium text-navy">
                  View Full Map & Portfolio
                </Link>
                <Link href="/operations/south-deep" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  South Deep (South Africa)
                </Link>
                <Link href="/operations/tarkwa" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Tarkwa (Ghana)
                </Link>
                <Link href="/operations/salares-norte" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Salares Norte (Chile)
                </Link>
              </div>
            )}
          </div>

          {/* Sustainability */}
          <div>
            <button
              onClick={() => toggleSection('sustainability')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold text-ink hover:text-navy"
            >
              <span>Sustainability</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSection === 'sustainability' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSection === 'sustainability' && (
              <div className="pl-4 pb-3 space-y-2 text-xs border-l-2 border-gold-mineral my-1">
                <Link href="/sustainability" onClick={onClose} className="block py-1 font-medium text-navy">
                  Overview & ESG Pillars
                </Link>
                <Link href="/sustainability#targets" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  2030 ESG Target Tracker
                </Link>
                <Link href="/sustainability#tailings" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Tailings Management (GISTM)
                </Link>
                <Link href="/sustainability#decarbonization" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Renewable Energy & Microgrids
                </Link>
              </div>
            )}
          </div>

          {/* Investors & Media */}
          <div>
            <button
              onClick={() => toggleSection('investors')}
              className="w-full flex items-center justify-between py-3 text-sm font-semibold text-ink hover:text-navy"
            >
              <span>Investors & Media</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedSection === 'investors' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSection === 'investors' && (
              <div className="pl-4 pb-3 space-y-2 text-xs border-l-2 border-gold-mineral my-1">
                <Link href="/investors" onClick={onClose} className="block py-1 font-medium text-navy">
                  H1 2026 Results Center
                </Link>
                <Link href="/reports" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Report Library & Pack Builder
                </Link>
                <Link href="/media" onClick={onClose} className="block py-1 text-ink-muted hover:text-navy">
                  Media Releases & News
                </Link>
              </div>
            )}
          </div>

          {/* Direct Secondary Links */}
          <div className="pt-4 border-t border-mist space-y-2">
            <Link
              href="/careers"
              onClick={onClose}
              className="block py-2 text-xs font-semibold text-ink hover:text-navy"
            >
              Careers & Opportunities
            </Link>
            <Link
              href="/suppliers"
              onClick={onClose}
              className="block py-2 text-xs font-semibold text-ink hover:text-navy"
            >
              Suppliers & Prequalification
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="block py-2 text-xs font-semibold text-ink hover:text-navy"
            >
              Regional Contacts
            </Link>
            <a
              href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between py-2 text-xs font-semibold text-gold-dark hover:text-navy"
            >
              <span>Speak Up (Whistleblowing)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Official Social Media Channels — In Original Brand Colors */}
            <div className="pt-3 border-t border-mist/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block">
                Official Social Channels
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/company/gold-fields/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white shadow-sm"
                  aria-label="Gold Fields on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/GoldFields_LTD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#000000] border border-mist/20 flex items-center justify-center text-white shadow-sm"
                  aria-label="Gold Fields on X"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/GoldFieldsLTD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white shadow-sm"
                  aria-label="Gold Fields on Facebook"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/goldfields_ltd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white shadow-sm"
                  aria-label="Gold Fields on Instagram"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@GoldFieldsLtd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center text-white shadow-sm"
                  aria-label="Gold Fields on YouTube"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-mist bg-editorial text-center">
          <p className="text-[11px] text-ink-muted">
            Gold Fields Concept Prototype • JSE/NYSE: GFI
          </p>
        </div>
      </div>
    </div>
  );
};
