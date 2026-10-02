'use client';

import React from 'react';
import { MapPin, Mail, Phone, ArrowUp, Globe, Clock, ShieldCheck } from 'lucide-react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';

interface FooterLink {
  label: string;
  url?: string;
  href?: string;
}

interface FooterColumn {
  title?: string;
  category?: string;
  links: FooterLink[];
}

interface SocialLinkItem {
  platform: string;
  url: string;
  handle?: string;
}

interface FooterProps {
  props: {
    brandName?: string;
    logoUrl?: string;
    tagline?: string;
    copyright?: string;
    officeAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks?: SocialLinkItem[];
    privacyHref?: string;
    termsHref?: string;
    columns?: FooterColumn[];
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === 'twitter' || p === 'x') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="X (formerly Twitter)">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (p === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="LinkedIn">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    );
  }
  if (p === 'github') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="GitHub">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    );
  }
  if (p === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="YouTube">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  if (p === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="Instagram">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (p === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-label="Facebook">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }
  return <Globe className="w-4 h-4" />;
}

export function StudioFooter({ props, styles, collection = 'contemporary', variant = 'multi_column' }: FooterProps) {
  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const brandName = props.brandName || 'Brand';
  const copyright = props.copyright || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;

  // Custom inline styles resolution
  const footerStyle: React.CSSProperties = {
    ...(styles?.backgroundType === 'solid' && styles.backgroundColor ? { backgroundColor: styles.backgroundColor } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(styles?.textColor ? { color: styles.textColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
  };

  const defaultBgClass = isImmersive
    ? 'bg-[#050508] border-t border-[#1F1F24] text-zinc-400'
    : isEditorial
    ? 'bg-[#082B49] border-t border-[#0F3C63] text-gray-300'
    : 'bg-[#0B0F19] border-t border-slate-800 text-slate-400';

  const hasCustomBg = styles?.backgroundType === 'solid' || styles?.backgroundType === 'gradient';
  const paddingClass = styles?.paddingY || 'py-16 md:py-24';

  const columns = props.columns && props.columns.length > 0 ? props.columns : [
    {
      title: 'Capabilities',
      links: [
        { label: 'Platform Architecture', url: '/services' },
        { label: 'Core Capabilities', url: '/services' },
        { label: 'Integration Protocols', url: '/services' }
      ]
    },
    {
      title: 'Organization',
      links: [
        { label: 'About Executive Team', url: '/about' },
        { label: 'Practice Philosophy', url: '/about' },
        { label: 'Client Mandates', url: '/about' }
      ]
    },
    {
      title: 'Governance',
      links: [
        { label: 'Privacy Disclosures', url: '/privacy' },
        { label: 'Terms of Engagement', url: '/terms' },
        { label: 'Security Architecture', url: '/security' }
      ]
    }
  ];

  const socialLinks = props.socialLinks && props.socialLinks.length > 0 ? props.socialLinks : [
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'twitter', url: 'https://x.com' }
  ];

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={footerStyle}
      className={`px-6 transition-colors ${!hasCustomBg ? defaultBgClass : ''} ${paddingClass}`}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Tier: Brand Identity & Social Links Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center space-x-3">
              {props.logoUrl ? (
                <img
                  src={props.logoUrl}
                  alt={brandName}
                  className="h-9 max-h-9 w-auto max-w-[190px] object-contain brightness-110"
                />
              ) : (
                <div className="flex items-center space-x-2.5">
                  <div
                    style={styles?.accentColor ? { backgroundColor: styles.accentColor } : undefined}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                      styles?.accentColor ? 'text-white' : (isImmersive ? 'bg-amber-500 text-black' : isEditorial ? 'bg-[#D4AF37] text-black' : 'bg-sky-500 text-white')
                    }`}
                  >
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                    className={`text-xl font-bold tracking-tight text-white ${isEditorial ? 'font-serif' : 'font-sans'}`}
                  >
                    {brandName}
                  </span>
                </div>
              )}
            </div>

            {props.tagline && (
              <p className="text-xs sm:text-sm text-slate-400 font-light leading-relaxed max-w-lg">
                {props.tagline}
              </p>
            )}
          </div>

          {/* Social Media Pill Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${brandName} on ${s.platform}`}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-slate-300 hover:text-white flex items-center justify-center transition shadow-xs group"
              >
                <span className="transform group-hover:scale-110 transition duration-150">
                  <SocialIcon platform={s.platform} />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Middle Tier: Multi-Column Navigation & Contact Information Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Categorized Link Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <div
                  style={styles?.headingColor ? { color: styles.headingColor } : undefined}
                  className="text-xs font-bold uppercase tracking-wider text-white/90 font-mono"
                >
                  {col.title || col.category || `Section ${idx + 1}`}
                </div>
                <ul className="space-y-2.5 text-xs font-medium">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.url || link.href || '#'}
                        className="transition hover:text-white hover:underline underline-offset-4 opacity-75 hover:opacity-100"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact & Physical Address Block */}
          <div className="md:col-span-4 space-y-5 bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Direct Inquiries</span>
            </div>

            {props.officeAddress && (
              <div className="flex items-start space-x-3 text-xs leading-relaxed text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{props.officeAddress}</span>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
              {props.contactEmail && (
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <a
                    href={`mailto:${props.contactEmail}`}
                    className="hover:text-white transition underline-offset-2 hover:underline truncate"
                  >
                    {props.contactEmail}
                  </a>
                </div>
              )}

              {props.contactPhone && (
                <div className="flex items-center space-x-3 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${props.contactPhone}`}
                    className="hover:text-white transition font-mono"
                  >
                    {props.contactPhone}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Dedicated Partner Response SLA: &lt; 24h</span>
            </div>
          </div>
        </div>

        {/* Bottom Tier: Copyright, Move Studio Attribution, Back to Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>{copyright}</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
              Bastion Studio Powered
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <a href={props.privacyHref || "/privacy"} className="hover:text-white transition opacity-75 hover:opacity-100">
              Privacy Notice
            </a>
            <a href={props.termsHref || "/terms"} className="hover:text-white transition opacity-75 hover:opacity-100">
              Terms
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              title="Scroll back to top"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition flex items-center space-x-1"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold hidden sm:inline">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
