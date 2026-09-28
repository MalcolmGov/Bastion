'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ExternalLink,
  ShieldCheck,
  Sliders,
  Code,
  Layers,
  FileText,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';

interface ColorToken {
  name: string;
  tailwindClass: string;
  hex: string;
  role: string;
  contrast: string;
  textColor: string;
  bgHex: string;
}

const COLOR_GROUPS: { groupName: string; tokens: ColorToken[] }[] = [
  {
    groupName: 'Navy Palette (Primary Brand & Structure)',
    tokens: [
      {
        name: 'navy-dark',
        tailwindClass: 'bg-navy-dark',
        hex: '#061D32',
        bgHex: '#061D32',
        role: 'Cinematic hero backgrounds, dark overlays, midnight surfaces',
        contrast: '> 14:1 (AAA against white)',
        textColor: 'text-white'
      },
      {
        name: 'navy (PRIMARY)',
        tailwindClass: 'bg-navy',
        hex: '#082B49',
        bgHex: '#082B49',
        role: 'Primary brand headers, mega menu, corporate CTAs',
        contrast: '> 12:1 (AAA against white)',
        textColor: 'text-white'
      },
      {
        name: 'navy-light',
        tailwindClass: 'bg-navy-light',
        hex: '#003068',
        bgHex: '#003068',
        role: 'Hover states, accent strokes, interactive focus states',
        contrast: '> 10:1 (AAA against white)',
        textColor: 'text-white'
      },
      {
        name: 'navy-surface',
        tailwindClass: 'bg-navy-surface',
        hex: '#0A355A',
        bgHex: '#0A355A',
        role: 'Subtle dark cards, telemetry data containers',
        contrast: '> 8:1 (AAA against white)',
        textColor: 'text-white'
      }
    ]
  },
  {
    groupName: 'Gold Mineral Palette (Accents & Highlights)',
    tokens: [
      {
        name: 'gold-mineral',
        tailwindClass: 'bg-gold-mineral',
        hex: '#B79855',
        bgHex: '#B79855',
        role: 'Restrained mineral gold borders, map telemetry pins, focus rings',
        contrast: '4.6:1 (AA against navy-dark)',
        textColor: 'text-black'
      },
      {
        name: 'gold (DEFAULT)',
        tailwindClass: 'bg-gold',
        hex: '#C8A064',
        bgHex: '#C8A064',
        role: 'Site accent gold for primary badges & high-visibility buttons',
        contrast: 'Pair with dark ink text (#061D32)',
        textColor: 'text-black'
      },
      {
        name: 'gold-dark',
        tailwindClass: 'bg-gold-dark',
        hex: '#76571F',
        bgHex: '#76571F',
        role: 'Accessible gold text on light surfaces and category titles',
        contrast: '4.8:1 (AA for normal text on white)',
        textColor: 'text-white'
      },
      {
        name: 'gold-light',
        tailwindClass: 'bg-gold-light',
        hex: '#F0E4CE',
        bgHex: '#F0E4CE',
        role: 'Subtle gold background for badges, pill tags, and callouts',
        contrast: 'Subtle highlight background',
        textColor: 'text-gold-dark'
      }
    ]
  },
  {
    groupName: 'Horizon Turquoise & Technology (Renewables & Innovation)',
    tokens: [
      {
        name: 'turquoise-bright',
        tailwindClass: 'bg-turquoise-bright',
        hex: '#00E5C0',
        bgHex: '#00E5C0',
        role: 'Solar microgrid highlights, hero glowing accents, live telemetry dots',
        contrast: 'High-visibility fluorescent accent against navy',
        textColor: 'text-black'
      },
      {
        name: 'turquoise',
        tailwindClass: 'bg-turquoise',
        hex: '#00B398',
        bgHex: '#00B398',
        role: 'ESG targets, water stewardship accents, interactive tags',
        contrast: '4.5:1 against dark backgrounds',
        textColor: 'text-black'
      },
      {
        name: 'turquoise-dark',
        tailwindClass: 'bg-turquoise-dark',
        hex: '#007A68',
        bgHex: '#007A68',
        role: 'Readable turquoise text on light editorial backgrounds',
        contrast: '4.7:1 (AA text against white)',
        textColor: 'text-white'
      }
    ]
  },
  {
    groupName: 'Editorial & Text Tokens (Reading Comfort)',
    tokens: [
      {
        name: 'editorial',
        tailwindClass: 'bg-editorial',
        hex: '#F7F6F2',
        bgHex: '#F7F6F2',
        role: 'Warm white canvas for long-form reading and editorial panels',
        contrast: 'Base page canvas background',
        textColor: 'text-black'
      },
      {
        name: 'mist',
        tailwindClass: 'bg-mist',
        hex: '#EAE8E3',
        bgHex: '#EAE8E3',
        role: 'Subtle divider rules, border outlines, input strokes',
        contrast: 'Structural perimeter boundary',
        textColor: 'text-black'
      },
      {
        name: 'ink',
        tailwindClass: 'bg-ink',
        hex: '#1D2530',
        bgHex: '#1D2530',
        role: 'Deep slate primary body copy across white/editorial pages',
        contrast: '> 13:1 (AAA against editorial)',
        textColor: 'text-white'
      },
      {
        name: 'forest',
        tailwindClass: 'bg-forest',
        hex: '#1F6E43',
        bgHex: '#1F6E43',
        role: 'ESG compliance, decarbonization metrics, verified milestones',
        contrast: '4.9:1 (AA against white)',
        textColor: 'text-white'
      }
    ]
  }
];

export default function AdminDesignSystemPage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'typography' | 'buttons' | 'badges' | 'blocks'>('tokens');
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 sm:p-4">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] flex items-center justify-center text-black font-bold shadow-md shadow-[#C99700]/20">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono text-[#C99700] tracking-wider font-semibold">
                Design System &amp; Brand Tokens
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Gold Fields Component &amp; Token Library
              </h1>
            </div>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            The authoritative visual source of truth for the Gold Fields digital brand. Click any token or class to copy it directly to your clipboard for use in page content, marketing copy, and Page Builder blocks.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-2">
          <Link
            href="/admin/pages"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#142033] hover:bg-[#1E2E48] border border-[#243754] text-xs font-semibold text-[#E6C657] transition"
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Open Page Builder</span>
          </Link>

          <Link
            href="/design-system"
            target="_blank"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1B293C] hover:bg-[#253952] border border-[#2F4766] text-xs font-semibold text-gray-200 hover:text-white transition"
          >
            <span>Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Copied Toast Notification */}
      {copiedValue && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Copied &ldquo;{copiedValue}&rdquo; to clipboard!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#1C2638] bg-[#0E1522] rounded-2xl overflow-hidden p-1 gap-1">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'tokens'
              ? 'bg-[#C99700] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#151F2E]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Brand Color Tokens</span>
        </button>

        <button
          onClick={() => setActiveTab('typography')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'typography'
              ? 'bg-[#C99700] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#151F2E]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Typography Scale</span>
        </button>

        <button
          onClick={() => setActiveTab('buttons')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'buttons'
              ? 'bg-[#C99700] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#151F2E]'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Buttons &amp; CTAs</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'badges'
              ? 'bg-[#C99700] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#151F2E]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Badges &amp; Tags</span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'blocks'
              ? 'bg-[#C99700] text-black shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#151F2E]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Page Builder Blocks</span>
        </button>
      </div>

      {/* Tab 1: Color Tokens */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {COLOR_GROUPS.map((group) => (
            <div key={group.groupName} className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#C99700]">
                {group.groupName}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.tokens.map((token) => (
                  <div
                    key={token.name}
                    className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] hover:border-[#C99700]/50 transition space-y-3 group cursor-pointer"
                    onClick={() => copyToClipboard(token.hex)}
                    title="Click to copy HEX code"
                  >
                    <div
                      className="h-20 w-full rounded-lg shadow-inner flex items-end justify-between p-2.5 border border-white/10"
                      style={{ backgroundColor: token.bgHex }}
                    >
                      <span className={`text-xs font-mono font-bold ${token.textColor}`}>
                        {token.hex}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(token.hex);
                        }}
                        className="p-1 rounded bg-black/40 text-white hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
                        title="Copy HEX"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono">{token.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(token.tailwindClass);
                          }}
                          className="text-[10px] text-gray-500 hover:text-[#C99700] font-mono"
                          title="Copy Tailwind class"
                        >
                          {token.tailwindClass}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">{token.role}</p>
                      <div className="pt-2 border-t border-[#162030] text-[10px] text-emerald-400 font-mono">
                        {token.contrast}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Typography Scale */}
      {activeTab === 'typography' && (
        <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Editorial Typography &amp; Scale</h2>
            <p className="text-xs text-gray-400">
              Gold Fields utilizes an authoritative, institutional typographic hierarchy pairing heavy display headlines with crisp, highly legible body copy.
            </p>
          </div>

          <div className="space-y-6 divide-y divide-[#1A2536]">
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-mono text-[#C99700] uppercase font-bold">
                Hero Display Headline — text-4xl sm:text-5xl lg:text-6xl font-extrabold
              </span>
              <div className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Creating enduring value beyond mining.
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <span className="text-[10px] font-mono text-[#C99700] uppercase font-bold">
                Section Title (H2) — text-3xl sm:text-4xl font-extrabold
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                A sustainable future built on safety, integrity, and shared value.
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <span className="text-[10px] font-mono text-[#C99700] uppercase font-bold">
                Card / Subsection Heading (H3) — text-xl sm:text-2xl font-bold
              </span>
              <div className="text-xl sm:text-2xl font-bold text-white">
                H1 2026 Financial &amp; Operational Results
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <span className="text-[10px] font-mono text-[#C99700] uppercase font-bold">
                Lead Subtitle / Sub-headline — text-base sm:text-lg text-gray-300
              </span>
              <div className="text-base text-gray-300 max-w-3xl leading-relaxed">
                Discover our globally diversified operations, our workforce of over 20,000 people, and the sustainable economic value we generate across six mining jurisdictions.
              </div>
            </div>

            <div className="pt-6 space-y-2">
              <span className="text-[10px] font-mono text-[#C99700] uppercase font-bold">
                Telemetry Metric Figures — font-mono tabular-nums font-bold
              </span>
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-white font-mono">1.06 Moz</div>
                  <div className="text-xs text-gray-400 mt-1">Group Attributable Production</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#E6C657] font-mono">$1,385</div>
                  <div className="text-xs text-gray-400 mt-1">All-In Sustaining Costs (/oz)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">78%</div>
                  <div className="text-xs text-gray-400 mt-1">Recycled Water Proportion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Buttons & CTAs */}
      {activeTab === 'buttons' && (
        <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Interactive Buttons &amp; Action Calls</h2>
            <p className="text-xs text-gray-400">
              Interactive action states designed for clear tactile hierarchy, contrast safety, and executive elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Action Button */}
            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <span className="text-xs font-bold text-white uppercase font-mono">Primary Gold Action</span>
              <div className="py-2">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-extrabold text-xs shadow-md shadow-[#C99700]/20 flex items-center space-x-2 transition"
                >
                  <span>Explore Mining Operations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Used for primary page conversion triggers and live publishing.</p>
            </div>

            {/* Glowing Turquoise Technological CTA */}
            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <span className="text-xs font-bold text-white uppercase font-mono">Horizon Turquoise Innovation</span>
              <div className="py-2">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#00B398] via-[#00E5C0] to-emerald-400 text-[#061D32] font-extrabold text-xs shadow-[0_0_20px_rgba(0,229,192,0.35)] flex items-center space-x-2 transition"
                >
                  <span>2030 ESG Target Tracker</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Used for flagship technological, solar microgrid, and ESG calls.</p>
            </div>

            {/* Outline Secondary Navy CTA */}
            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <span className="text-xs font-bold text-white uppercase font-mono">Dark Navy Glass Outline</span>
              <div className="py-2">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-[#0F1726] hover:bg-[#1A2538] border border-[#243550] text-white font-semibold text-xs transition flex items-center space-x-2"
                >
                  <span>View Latest Financial Results</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#00E5C0]" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Secondary navigation buttons on dark cinematic canvases.</p>
            </div>

            {/* Download / Regulatory Report Button */}
            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <span className="text-xs font-bold text-white uppercase font-mono">Report Download Button</span>
              <div className="py-2">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-lg bg-[#082B49] hover:bg-[#003068] text-white text-xs font-bold transition flex items-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#C99700]" />
                  <span>Download Annual Booklet (PDF 3.8MB)</span>
                </button>
              </div>
              <p className="text-xs text-gray-400">Used across corporate reporting archives and regulatory disclosures.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Badges & Tags */}
      {activeTab === 'badges' && (
        <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Badges, Pills &amp; Status Indicators</h2>
            <p className="text-xs text-gray-400">
              High-context indicators for regulatory disclosures, workflow approvals, and verified corporate milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Live Published Status</span>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Published Live</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">In Compliance Review</span>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  <span>In Review (2-Person Rule)</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Flagship Hero Tag</span>
              <div>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#082B49]/80 border border-[#00B398]/50 text-[#00E5C0] text-xs font-semibold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-[#00E5C0] animate-pulse" />
                  <span>Global Production</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Mineral Gold Accent Badge</span>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C99700]/20 text-[#E6C657] border border-[#C99700]/40">
                  <span>JSE: GFI • NYSE: GFI</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">ESG Target Status</span>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1F6E43]/20 text-emerald-400 font-bold border border-emerald-700/40 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Status: 78% Achieved</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-2">
              <span className="text-[10px] font-mono text-gray-400 uppercase">SENS Stock Announcement</span>
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                  SENS Announcement
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Page Builder Blocks */}
      {activeTab === 'blocks' && (
        <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Page Builder Modular Section Blueprints</h2>
            <p className="text-xs text-gray-400">
              Each block below can be inserted, reordered, edited in-place, and published directly inside the Visual Page Builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C99700] uppercase font-mono">1. Hero Block</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">type: &quot;hero&quot;</span>
              </div>
              <p className="text-xs text-gray-300">
                Cinematic banner with authentic background imagery, headline, lead paragraph, animated pill badge, and primary action links.
              </p>
              <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-[#162030]">
                Fields: title, subtitle, badge, bgImage, ctaText, ctaLink
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C99700] uppercase font-mono">2. Telemetry Metrics Block</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">type: &quot;metrics&quot;</span>
              </div>
              <p className="text-xs text-gray-300">
                Audited operational indicators (production koz, AISC /oz, free cash flow, renewable energy percentage).
              </p>
              <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-[#162030]">
                Fields: title, subtitle, badge, 4 metric cards
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C99700] uppercase font-mono">3. Corporate Reporting Block</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">type: &quot;reporting&quot;</span>
              </div>
              <p className="text-xs text-gray-300">
                Feature spotlight card highlighting latest financial results booklets with verified disclosures and direct PDF access.
              </p>
              <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-[#162030]">
                Fields: title, subtitle, badge, key disclosures
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#080D14] border border-[#1A2536] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#C99700] uppercase font-mono">4. ESG Sustainability Block</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">type: &quot;sustainability&quot;</span>
              </div>
              <p className="text-xs text-gray-300">
                Science-based 2030 targets overview spanning carbon abatement, water stewardship, tailings safety, and workforce diversity.
              </p>
              <div className="text-[11px] font-mono text-gray-500 pt-2 border-t border-[#162030]">
                Fields: title, subtitle, badge, target items
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
