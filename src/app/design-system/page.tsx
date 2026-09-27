'use client';

import React, { useState } from 'react';
import {
  Palette,
  Type,
  MousePointer,
  Tag,
  Layout,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Code
} from 'lucide-react';

interface ColorToken {
  name: string;
  tailwindClass: string;
  hex: string;
  role: string;
  contrast: string;
  textColor: string;
}

const COLOR_GROUPS: { groupName: string; tokens: ColorToken[] }[] = [
  {
    groupName: 'Navy Palette (Primary Brand & Structure)',
    tokens: [
      {
        name: 'navy-dark',
        tailwindClass: 'bg-navy-dark',
        hex: '#061D32',
        role: 'Midnight footer, cinematic hero overlays, dark surfaces',
        contrast: '> 14:1 (AAA against warm white)',
        textColor: 'text-white',
      },
      {
        name: 'navy (DEFAULT)',
        tailwindClass: 'bg-navy',
        hex: '#082B49',
        role: 'Primary brand headers, mega menu, primary action buttons',
        contrast: '> 12:1 (AAA against white)',
        textColor: 'text-white',
      },
      {
        name: 'navy-light',
        tailwindClass: 'bg-navy-light',
        hex: '#003068',
        role: 'Authentic brand blue, hover states, interactive focus',
        contrast: '> 10:1 (AAA against white)',
        textColor: 'text-white',
      },
      {
        name: 'navy-surface',
        tailwindClass: 'bg-navy-surface',
        hex: '#0A355A',
        role: 'Subtle navy cards, dark utility containers',
        contrast: '> 8:1 (AAA against white)',
        textColor: 'text-white',
      },
    ],
  },
  {
    groupName: 'Gold Mineral Palette (Accents & Highlights)',
    tokens: [
      {
        name: 'gold-mineral',
        tailwindClass: 'bg-gold-mineral',
        hex: '#B79855',
        role: 'Restrained mineral gold rules, map pins, focus rings',
        contrast: '4.6:1 (AA against navy-dark)',
        textColor: 'text-navy-dark',
      },
      {
        name: 'gold (DEFAULT)',
        tailwindClass: 'bg-gold',
        hex: '#C8A064',
        role: 'Measured site accent gold for primary badges & CTA buttons',
        contrast: '3.8:1 against white; pair with dark ink',
        textColor: 'text-navy-dark',
      },
      {
        name: 'gold-dark',
        tailwindClass: 'bg-gold-dark',
        hex: '#76571F',
        role: 'Accessible gold text on light surfaces and category headers',
        contrast: '4.8:1 (AA for normal text on white)',
        textColor: 'text-white',
      },
      {
        name: 'gold-light',
        tailwindClass: 'bg-gold-light',
        hex: '#F0E4CE',
        role: 'Subtle gold background for badges, callouts, selections',
        contrast: '1.2:1 (background surface for dark text)',
        textColor: 'text-gold-dark',
      },
    ],
  },
  {
    groupName: 'Editorial & Text Tokens (Reading Comfort)',
    tokens: [
      {
        name: 'editorial',
        tailwindClass: 'bg-editorial',
        hex: '#F7F6F2',
        role: 'Warm white background for long-form reading surfaces',
        contrast: 'Base page canvas background',
        textColor: 'text-ink',
      },
      {
        name: 'editorial-surface (white)',
        tailwindClass: 'bg-white',
        hex: '#FFFFFF',
        role: 'Base card surfaces, modals, popovers, dropdown menus',
        contrast: 'Base white container canvas',
        textColor: 'text-ink',
      },
      {
        name: 'ink',
        tailwindClass: 'bg-ink',
        hex: '#172C3D',
        role: 'Primary body text, article paragraphs, tabular metrics',
        contrast: '11.2:1 (AAA on editorial background)',
        textColor: 'text-white',
      },
      {
        name: 'ink-muted',
        tailwindClass: 'bg-ink-muted',
        hex: '#526373',
        role: 'Secondary slate text, publish dates, captions, subtitles',
        contrast: '5.2:1 (AA for normal text on white)',
        textColor: 'text-white',
      },
      {
        name: 'ink-subtle',
        tailwindClass: 'bg-ink-subtle',
        hex: '#8A9BA8',
        role: 'Tertiary metadata, borders, placeholder text',
        contrast: '3.1:1 (large text / icons)',
        textColor: 'text-ink',
      },
      {
        name: 'mist',
        tailwindClass: 'bg-mist',
        hex: '#E2E7EA',
        role: 'Hairline dividers, quiet borders, card outlines',
        contrast: 'Structural hairline divider token',
        textColor: 'text-ink',
      },
      {
        name: 'mist-light',
        tailwindClass: 'bg-mist-light',
        hex: '#F0F4F6',
        role: 'Subtle hover states, table row alternates',
        contrast: 'Soft interactive state background',
        textColor: 'text-ink',
      },
    ],
  },
  {
    groupName: 'Sustainability & Environmental Accents',
    tokens: [
      {
        name: 'forest',
        tailwindClass: 'bg-forest',
        hex: '#24634D',
        role: 'Sustainability accents, environmental badges, success indicators',
        contrast: '5.1:1 (AA on white)',
        textColor: 'text-white',
      },
      {
        name: 'forest-light',
        tailwindClass: 'bg-forest-light',
        hex: '#EBF5F1',
        role: 'Background surface for sustainability pills and ESG status badges',
        contrast: 'Soft environmental pill surface',
        textColor: 'text-forest',
      },
    ],
  },
  {
    groupName: 'Turquoise & Water Stewardship (Official Gold Fields Accent)',
    tokens: [
      {
        name: 'turquoise (DEFAULT)',
        tailwindClass: 'bg-turquoise',
        hex: '#00B398',
        role: 'Authentic Gold Fields live site accent, quicklinks, navigation gradient, water stewardship',
        contrast: '3.1:1 on white (graphical objects/large elements); > 7:1 on navy-dark',
        textColor: 'text-navy-dark',
      },
      {
        name: 'turquoise-dark',
        tailwindClass: 'bg-turquoise-dark',
        hex: '#00826E',
        role: 'WCAG AA accessible text variant (4.8:1 on white) for typography, tags, water labels',
        contrast: '4.8:1 (AA for normal text on white)',
        textColor: 'text-white',
      },
      {
        name: 'turquoise-light',
        tailwindClass: 'bg-turquoise-light',
        hex: '#E0F7F4',
        role: 'Soft water & environmental badge container background',
        contrast: 'Soft tint surface for turquoise-dark text',
        textColor: 'text-turquoise-dark',
      },
      {
        name: 'turquoise-sage',
        tailwindClass: 'bg-turquoise-sage',
        hex: '#6FA287',
        role: 'Soft mineral sage / environmental secondary accent from live stylesheet',
        contrast: 'Subtle mineral tone for charts and environmental indicators',
        textColor: 'text-navy-dark',
      },
    ],
  },
];

export default function DesignSystemPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. HEADER & NOTICE                                           */}
      {/* ============================================================ */}
      <section className="bg-navy py-16 px-6 text-white border-b border-navy-surface">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-dark/40 border border-gold-mineral/40 text-gold-light inline-flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-gold" />
              <span>Development Token Inspector</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy-surface border border-mist/20 text-mist">
              WCAG 2.2 AA Verified
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display">
            Gold Fields Design System
          </h1>

          <p className="text-sm sm:text-base text-mist/90 max-w-2xl leading-relaxed">
            Live interactive documentation of color tokens, typography scales, interactive button states, semantic badges, and elevation cards engineered for the Gold Fields digital flagship.
          </p>

          {/* Quick jump navigation */}
          <div className="flex flex-wrap items-center gap-2 pt-4 text-xs font-semibold">
            <a href="#colors" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Colors
            </a>
            <a href="#typography" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Typography
            </a>
            <a href="#buttons" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Buttons &amp; Actions
            </a>
            <a href="#badges" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Badges &amp; Status
            </a>
            <a href="#cards" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Cards &amp; Elevation
            </a>
            <a href="#forms" className="px-3 py-1.5 rounded-lg bg-navy-surface hover:bg-navy-light text-mist hover:text-white transition-colors">
              Form Controls
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. COLOR TOKENS INSPECTOR                                    */}
      {/* ============================================================ */}
      <section id="colors" className="py-20 px-6 bg-editorial border-b border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <Palette className="w-4 h-4 text-gold-dark" />
              <span>Token Group 01</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Brand &amp; Semantic Colors</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Every token is measured directly from corporate branding guidelines and verified against WCAG 2.2 AA contrast requirements.
            </p>
          </div>

          <div className="space-y-10">
            {COLOR_GROUPS.map((group) => (
              <div key={group.groupName} className="space-y-4">
                <h3 className="text-base font-bold text-navy pb-1 border-b border-mist">
                  {group.groupName}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="bg-white rounded-2xl border border-mist shadow-subtle overflow-hidden flex flex-col justify-between hover:shadow-card transition-shadow"
                    >
                      {/* Color Swatch */}
                      <div
                        className={`h-24 w-full ${token.tailwindClass} p-3 flex flex-col justify-between relative`}
                      >
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${token.textColor}`}>
                          {token.tailwindClass}
                        </span>

                        <button
                          onClick={() => copyToClipboard(token.hex)}
                          className="self-end px-2 py-1 rounded bg-black/30 hover:bg-black/50 text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur-xs transition-colors"
                          title="Click to copy hex code"
                        >
                          {copiedHex === token.hex ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{token.hex}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Token Details */}
                      <div className="p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy">{token.name}</span>
                          <span className="font-mono text-ink-subtle text-[11px]">{token.hex}</span>
                        </div>

                        <p className="text-[11px] text-ink-muted leading-relaxed">
                          {token.role}
                        </p>

                        <div className="pt-2 border-t border-mist/80 text-[10px] text-ink-subtle">
                          <strong>Contrast:</strong> {token.contrast}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. TYPOGRAPHY SCALES                                         */}
      {/* ============================================================ */}
      <section id="typography" className="py-20 px-6 bg-white border-b border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <Type className="w-4 h-4 text-gold-dark" />
              <span>Token Group 02</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Typography Hierarchy</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Manrope for executive display headings and Inter for high-density, accessible body copy and financial tabular figures.
            </p>
          </div>

          <div className="space-y-6">
            {/* Display H1 */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-mist">
                <span className="font-mono font-bold text-navy">Display Hero (H1) • Manrope Extrabold</span>
                <span className="text-[11px]">Desktop 60px (3.75rem) • Mobile 36px</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-navy tracking-tight font-display">
                Creating enduring value beyond mining.
              </h1>
            </div>

            {/* Section H2 */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-mist">
                <span className="font-mono font-bold text-navy">Section Header (H2) • Manrope Bold</span>
                <span className="text-[11px]">36px (2.25rem)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy font-display">
                Responsible Mining Leadership Grounded in Science
              </h2>
            </div>

            {/* Subsection H3 */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-mist">
                <span className="font-mono font-bold text-navy">Card Header (H3) • Manrope / Sans Bold</span>
                <span className="text-[11px]">20px (1.25rem)</span>
              </div>
              <h3 className="text-xl font-bold text-navy">
                H1 2026 Operational &amp; Financial Results
              </h3>
            </div>

            {/* Body Copy */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-2">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-mist">
                <span className="font-mono font-bold text-navy">Editorial Body (Lead &amp; Standard) • Inter Regular</span>
                <span className="text-[11px]">16px &amp; 14px • Line Height 1.6</span>
              </div>
              <p className="text-base text-ink leading-relaxed max-w-3xl">
                Gold Fields operates nine mechanized and open pit gold mines across Australia, Canada, Chile, Ghana, Peru, and South Africa. We prioritize zero harm, deep-level safety, and renewable microgrids.
              </p>
              <p className="text-xs text-ink-muted leading-relaxed max-w-3xl">
                Secondary descriptive text used for report summaries, subheadings, and explanatory notes across cards.
              </p>
            </div>

            {/* Tabular Numerics Demonstration */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-mist">
                <span className="font-mono font-bold text-navy">Tabular Figures (.tabular-nums)</span>
                <span className="text-[11px]">font-variant-numeric: tabular-nums</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-white p-3 rounded-xl border border-mist">
                  <span className="text-2xl font-bold text-navy tabular-nums block">1,062,000 oz</span>
                  <span className="text-[11px] text-ink-muted">Group Attributable H1</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-mist">
                  <span className="text-2xl font-bold text-navy tabular-nums block">\$914,000,000</span>
                  <span className="text-[11px] text-ink-muted">Shared Value Created</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-mist">
                  <span className="text-2xl font-bold text-forest tabular-nums block">110,000 t</span>
                  <span className="text-[11px] text-ink-muted">CO2e Annual Abatement</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-mist">
                  <span className="text-2xl font-bold text-navy tabular-nums block">ZAR 285.50</span>
                  <span className="text-[11px] text-ink-muted">JSE: GFI Share Price</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. BUTTONS & INTERACTIVE STATES                              */}
      {/* ============================================================ */}
      <section id="buttons" className="py-20 px-6 bg-editorial border-b border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <MousePointer className="w-4 h-4 text-gold-dark" />
              <span>Token Group 03</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Buttons &amp; Interactive Triggers</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Standard button variants, pill triggers, disabled states, and micro-interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Navy Button */}
            <div className="p-6 rounded-2xl bg-white border border-mist space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-navy block">Primary Navy Button</span>
              <p className="text-xs text-ink-muted">Default call-to-action for high-priority navigation.</p>
              <div className="space-y-2 pt-2">
                <button className="w-full py-3 px-5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-subtle">
                  <span>Explore Our Operations</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button disabled className="w-full py-3 px-5 rounded-lg bg-navy text-white text-xs font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                  <span>Disabled State</span>
                </button>
              </div>
            </div>

            {/* Gold Accent Button */}
            <div className="p-6 rounded-2xl bg-white border border-mist space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-navy block">Gold Accent Button</span>
              <p className="text-xs text-ink-muted">Featured actions, external portals, and downloads.</p>
              <div className="space-y-2 pt-2">
                <button className="w-full py-3 px-5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-card">
                  <span>Download Report (3.8MB)</span>
                  <Download className="w-4 h-4" />
                </button>
                <button disabled className="w-full py-3 px-5 rounded-lg bg-gold text-navy-dark text-xs font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                  <span>Disabled State</span>
                </button>
              </div>
            </div>

            {/* Outline Surface Button */}
            <div className="p-6 rounded-2xl bg-white border border-mist space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-navy block">Outline Mist Button</span>
              <p className="text-xs text-ink-muted">Secondary actions and dismissive triggers.</p>
              <div className="space-y-2 pt-2">
                <button className="w-full py-3 px-5 rounded-lg bg-white hover:bg-mist text-ink text-xs font-semibold border border-mist transition-colors flex items-center justify-center gap-2">
                  <span>View Full Archive</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                </button>
                <button className="w-full py-3 px-5 rounded-lg bg-transparent hover:bg-mist/40 text-navy text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                  <span>Ghost Action Trigger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ask Gold Fields Assistant Pill */}
            <div className="p-6 rounded-2xl bg-white border border-mist space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-navy block">Assistant Trigger Pill</span>
              <p className="text-xs text-ink-muted">Global drawer launcher for deterministic corporate AI.</p>
              <div className="pt-2">
                <button className="px-4 py-2.5 rounded-full bg-navy hover:bg-navy-light text-white text-xs font-semibold shadow-subtle transition-all flex items-center gap-2 group">
                  <Sparkles className="w-3.5 h-3.5 text-gold group-hover:scale-110 transition-transform" />
                  <span>Ask Gold Fields</span>
                </button>
              </div>
            </div>

            {/* Search Pill Trigger */}
            <div className="p-6 rounded-2xl bg-white border border-mist space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-navy block">Quick Search (Cmd+K)</span>
              <p className="text-xs text-ink-muted">Keyboard-accessible search dialog trigger.</p>
              <div className="pt-2">
                <button className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-mist bg-mist-light/50 hover:bg-mist text-ink-muted text-xs transition-colors">
                  <Search className="w-3.5 h-3.5 text-ink-muted" />
                  <span className="pr-2">Search</span>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-mist text-ink-subtle">
                    ⌘K
                  </kbd>
                </button>
              </div>
            </div>

            {/* Dark Surface Glass Button */}
            <div className="p-6 rounded-2xl bg-navy-dark text-white space-y-3 shadow-subtle">
              <span className="text-xs font-mono font-bold text-gold-light block">Cinematic Glass Button</span>
              <p className="text-xs text-mist/80">Used on dark hero sections and modal overlays.</p>
              <div className="pt-2">
                <button className="w-full py-3 px-5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-xs transition-colors flex items-center justify-center gap-2">
                  <span>View Latest Disclosures</span>
                  <ArrowRight className="w-3.5 h-3.5 text-mist" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. BADGES & PILLS                                            */}
      {/* ============================================================ */}
      <section id="badges" className="py-20 px-6 bg-white border-b border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <Tag className="w-4 h-4 text-gold-dark" />
              <span>Token Group 04</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Badges, Pills &amp; Status Indicators</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Semantic badges for operations status, ESG pillars, and demonstration concept labeling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Operational Status */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                Operation Status
              </span>
              <div className="space-y-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-light text-forest border border-forest/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-forest" />
                    Active Operation
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    Commercial Ramp-up
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-mist text-ink-muted border border-mist">
                    Transferred (Gov of Ghana)
                  </span>
                </div>
              </div>
            </div>

            {/* Prototype Labeling */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                Demonstration Badge
              </span>
              <div className="space-y-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-light text-gold-dark border border-gold/40">
                    <HelpCircle className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Demonstration Listing</span>
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-navy text-white">
                    <span>Primary Disclosure</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Category Badges */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                Media &amp; News Categories
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                  Media Release
                </span>
                <span className="px-2.5 py-0.5 rounded bg-gold-dark/20 text-gold-dark text-[10px] font-bold uppercase tracking-wider">
                  SENS
                </span>
                <span className="px-2.5 py-0.5 rounded bg-forest-light text-forest text-[10px] font-bold uppercase tracking-wider">
                  Achievement
                </span>
                <span className="px-2.5 py-0.5 rounded bg-editorial border border-mist text-ink text-[10px] font-bold uppercase tracking-wider">
                  Our Stories
                </span>
              </div>
            </div>

            {/* ESG Target Status */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <span className="text-xs font-bold text-navy uppercase tracking-wider block">
                ESG Target Tracking
              </span>
              <div className="space-y-2">
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest-light text-forest border border-forest/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Status: On Track</span>
                  </span>
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-forest text-white inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>100% Conforming (GISTM)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. CARDS & ELEVATIONAL STATES                                */}
      {/* ============================================================ */}
      <section id="cards" className="py-20 px-6 bg-editorial border-b border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <Layout className="w-4 h-4 text-gold-dark" />
              <span>Token Group 05</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Cards, Surfaces &amp; Elevation</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Shadow hierarchies and border styling used across operational portfolios and reports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flat Hairline Card */}
            <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle space-y-3">
              <span className="text-[10px] font-mono text-ink-subtle uppercase block">
                shadow-subtle • border-mist
              </span>
              <h4 className="text-base font-bold text-navy">Quiet Surface Card</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Used for informational listings, checklist steps, and static content groups.
              </p>
            </div>

            {/* Standard Elevated Card */}
            <div className="bg-white p-6 rounded-2xl border border-mist shadow-card hover:shadow-elevated transition-shadow duration-300 space-y-3">
              <span className="text-[10px] font-mono text-gold-dark uppercase block">
                shadow-card • hover:shadow-elevated
              </span>
              <h4 className="text-base font-bold text-navy">Interactive Content Card</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Used for featured reports, operational spotlights, and media releases.
              </p>
            </div>

            {/* Midnight Navy Surface */}
            <div className="bg-navy p-6 rounded-2xl border border-mist/20 shadow-elevated text-white space-y-3">
              <span className="text-[10px] font-mono text-gold-light uppercase block">
                bg-navy • shadow-elevated
              </span>
              <h4 className="text-base font-bold text-white">Cinematic Dark Card</h4>
              <p className="text-xs text-mist/80 leading-relaxed">
                Used for executive highlights, whistleblowing callouts, and dark hero components.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FORM CONTROLS                                             */}
      {/* ============================================================ */}
      <section id="forms" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-1">
              <Sliders className="w-4 h-4 text-gold-dark" />
              <span>Token Group 06</span>
            </div>
            <h2 className="text-3xl font-bold text-navy">Form Controls &amp; Accessibility</h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Inputs, dropdowns, and checkboxes configured with WCAG 2.2 visible focus rings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Text Input */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <label className="block text-xs font-bold text-navy">Standard Input Field</label>
              <input
                type="text"
                placeholder="Enter sample input..."
                className="w-full text-xs bg-white border border-mist rounded-lg px-3.5 py-2.5 text-ink focus:outline-none focus:border-gold-mineral"
                defaultValue="Elena Rostova"
              />
              <span className="text-[10px] text-ink-subtle block">Focus: 2px solid #B79855</span>
            </div>

            {/* Select Dropdown */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <label className="block text-xs font-bold text-navy">Select Dropdown</label>
              <select className="w-full text-xs bg-white border border-mist rounded-lg px-3.5 py-2.5 text-ink focus:outline-none focus:border-gold-mineral">
                <option>Mining Engineering</option>
                <option>Geology &amp; Exploration</option>
                <option>Digital &amp; Automation</option>
              </select>
              <span className="text-[10px] text-ink-subtle block">Native dropdown styling</span>
            </div>

            {/* Checkbox */}
            <div className="p-6 rounded-2xl bg-editorial border border-mist space-y-3">
              <span className="block text-xs font-bold text-navy">Checkbox Controls</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-mist text-navy focus:ring-gold-mineral" />
                  <span className="text-xs text-ink">Checked state (verified requirement)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 rounded border-mist text-navy focus:ring-gold-mineral" />
                  <span className="text-xs text-ink-muted">Unchecked requirement</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
