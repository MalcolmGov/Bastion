'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const BrandFooter: React.FC = () => {
  return (
    <footer className="bg-navy-dark text-mist border-t border-navy-surface pt-16 pb-12 relative overflow-hidden">
      {/* Authentic Gold Fields Radiant Turquoise Gradient Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 shadow-[0_0_15px_rgba(0,229,192,0.4)]" />
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-mist/10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/gold-fields-logo.svg"
                alt="Gold Fields"
                width={160}
                height={98}
                className="h-16 w-auto object-contain brightness-0 invert"
              />
              <div className="flex flex-col border-l border-mist/30 pl-3">
                <span className="text-sm font-extrabold tracking-[0.16em] text-white uppercase font-display">
                  GOLD FIELDS
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-gold-light uppercase">
                  CREATING ENDURING VALUE
                </span>
              </div>
            </div>
            <p className="text-xs text-mist/80 leading-relaxed max-w-sm pt-2">
              <strong>Gold Fields</strong> is a globally diversified producer of gold with operating mines and development projects in Australia, Canada, Chile, Ghana, Peru, and South Africa.
            </p>
            <div className="pt-2 text-xs text-mist/60 space-y-1">
              <p>Corporate Office: 150 Helen Road, Sandown, Sandton, 2196, South Africa</p>
              <p>Primary Listings: JSE Limited (GFI) • NYSE (GFI)</p>
            </div>

            {/* Whistleblowing Highlight */}
            <div className="pt-3">
              <a
                href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded bg-navy-surface hover:bg-navy border border-mist/20 text-xs font-medium text-gold-light hover:text-white transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-gold" />
                <span>Speak Up Anonymous Whistleblowing</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            {/* Official Social Media Channels — In Their Original Brand Colors */}
            <div className="pt-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-mist/75 block">
                Official Social Channels
              </span>
              <div className="flex items-center gap-2.5">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/gold-fields/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#0A66C2] hover:bg-[#004182] flex items-center justify-center text-white shadow-[0_0_12px_rgba(10,102,194,0.35)] hover:scale-110 hover:shadow-[0_0_16px_rgba(10,102,194,0.6)] transition-all duration-200"
                  aria-label="Gold Fields on LinkedIn"
                  title="LinkedIn • Gold Fields Limited"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com/GoldFields_LTD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#000000] hover:bg-[#1f1f1f] border border-mist/20 flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,255,255,0.1)] hover:scale-110 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] transition-all duration-200"
                  aria-label="Gold Fields on X (formerly Twitter)"
                  title="X (Twitter) • @GoldFields_LTD"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/GoldFieldsLTD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#1877F2] hover:bg-[#0c63d4] flex items-center justify-center text-white shadow-[0_0_12px_rgba(24,119,242,0.35)] hover:scale-110 hover:shadow-[0_0_16px_rgba(24,119,242,0.6)] transition-all duration-200"
                  aria-label="Gold Fields on Facebook"
                  title="Facebook • @GoldFieldsLTD"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/goldfields_ltd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 flex items-center justify-center text-white shadow-[0_0_12px_rgba(220,39,67,0.35)] hover:scale-110 hover:shadow-[0_0_18px_rgba(220,39,67,0.6)] transition-all duration-200"
                  aria-label="Gold Fields on Instagram"
                  title="Instagram • @goldfields_ltd"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@GoldFieldsLtd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FF0000] hover:bg-[#cc0000] flex items-center justify-center text-white shadow-[0_0_12px_rgba(255,0,0,0.35)] hover:scale-110 hover:shadow-[0_0_18px_rgba(255,0,0,0.6)] transition-all duration-200"
                  aria-label="Gold Fields on YouTube"
                  title="YouTube • Gold Fields Limited"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column: Operations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Operations
            </h4>
            <ul className="space-y-2.5 text-xs text-mist/80">
              <li>
                <Link href="/operations/south-deep" className="hover:text-gold transition-colors">
                  South Deep (South Africa)
                </Link>
              </li>
              <li>
                <Link href="/operations/tarkwa" className="hover:text-gold transition-colors">
                  Tarkwa (Ghana)
                </Link>
              </li>
              <li>
                <Link href="/operations/salares-norte" className="hover:text-gold transition-colors">
                  Salares Norte (Chile)
                </Link>
              </li>
              <li>
                <Link href="/operations#cerro-corona" className="hover:text-gold transition-colors">
                  Cerro Corona (Peru)
                </Link>
              </li>
              <li>
                <Link href="/operations#australia" className="hover:text-gold transition-colors">
                  Australia Mines (Agnew, Granny Smith, St Ives, Gruyere)
                </Link>
              </li>
              <li>
                <Link href="/operations#windfall" className="hover:text-gold transition-colors">
                  Windfall Project (Canada)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Investors & Media */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Investors & Reports
            </h4>
            <ul className="space-y-2.5 text-xs text-mist/80">
              <li>
                <Link href="/investors" className="hover:text-gold transition-colors">
                  H1 2026 Results Portal
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-gold transition-colors">
                  Integrated Annual Reports
                </Link>
              </li>
              <li>
                <Link href="/reports?pack=true" className="hover:text-gold transition-colors">
                  My Report Pack Shortlist
                </Link>
              </li>
              <li>
                <Link href="/investors#calendar" className="hover:text-gold transition-colors">
                  Financial Reporting Calendar
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-gold transition-colors">
                  Media Releases & Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Governance & Stakeholders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Stakeholders
            </h4>
            <ul className="space-y-2.5 text-xs text-mist/80">
              <li>
                <Link href="/sustainability" className="hover:text-gold transition-colors">
                  Sustainability & 2030 Targets
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-gold transition-colors">
                  Careers at Gold Fields
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="hover:text-gold transition-colors">
                  Supplier Prequalification
                </Link>
              </li>
              <li>
                <Link href="/about#governance" className="hover:text-gold transition-colors">
                  Corporate Governance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Regional Contact Directory
                </Link>
              </li>
              <li>
                <a
                  href="https://www.goldfields.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-gold-light hover:text-white transition-colors"
                >
                  <span>Official goldfields.com</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Concept Prototype & Legal Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-mist/60 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-gold-dark/40 text-gold-light border border-gold-mineral/40">
              Concept Prototype
            </span>
            <p className="text-[11px]">
              Proposed digital flagship redesign for demonstration purposes only. Not an authorized Gold Fields release.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <Link href="/about#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/about#terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="/about#accessibility" className="hover:text-white transition-colors">
              Accessibility (WCAG 2.2 AA)
            </Link>
            <span className="text-mist/40">|</span>
            <p>© {new Date().getFullYear()} Gold Fields Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
