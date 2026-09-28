'use client';

import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Eye,
  Sliders,
  Type,
  FileCheck,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function BrandLibraryPage() {
  const { activeClient, activeSite } = useStudioWorkspace();

  const [activeLayer, setActiveLayer] = useState<'approved' | 'observed' | 'redesign'>('approved');
  const [lockedItems, setLockedItems] = useState<Record<string, boolean>>({
    primaryLogo: true,
    primaryColor: true,
    accentColor: true,
    toneOfVoice: true
  });

  const toggleLock = (key: string) => {
    setLockedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isGoldFields = activeClient?.id === 'client_goldfields';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono uppercase text-sky-400">Move Studio Brand Governance</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{activeClient?.name || 'Client Project'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Reviewed Brand Library
          </h1>
        </div>

        {/* 3-Layer Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-[#141C2A] border border-[#232F42] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveLayer('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeLayer === 'approved'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Approved Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('observed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeLayer === 'observed'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Observed Evidence
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('redesign')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeLayer === 'redesign'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Redesign Extensions
          </button>
        </div>
      </div>

      {/* Layer 1: Client-Approved Brand Rules */}
      {activeLayer === 'approved' && (
        <div className="space-y-6">
          {/* 1. Logos & Marks */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Approved Logo Assets & Variants
                </h2>
                <p className="text-xs text-slate-400">
                  Approved vector marks and light/dark alternates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLock('primaryLogo')}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
              >
                {lockedItems.primaryLogo ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockedItems.primaryLogo ? 'Locked (AI Protected)' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                <div className="h-16 bg-[#0A0D14] rounded-lg flex items-center justify-center p-3">
                  <span className="font-bold text-sky-400 text-sm">{activeClient?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Primary Vector Mark</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Approved
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                <div className="h-16 bg-white rounded-lg flex items-center justify-center p-3">
                  <span className="font-bold text-slate-900 text-sm">{activeClient?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Light Canvas Variant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Approved
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                <div className="h-16 bg-[#0A0D14] rounded-lg flex items-center justify-center p-3">
                  <div className="w-8 h-8 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {activeClient?.name?.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">Favicon & App Icon</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Color Palette */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Approved Color Palette Tokens
                </h2>
                <p className="text-xs text-slate-400">
                  WCAG 2.2 AA verified contrast tokens.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLock('primaryColor')}
                className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
              >
                {lockedItems.primaryColor ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockedItems.primaryColor ? 'Locked (AI Protected)' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                <div className="h-10 rounded-lg shadow-sm" style={{ backgroundColor: isGoldFields ? '#082B49' : '#0F172A' }} />
                <div className="text-xs font-bold text-white">{isGoldFields ? 'Deep Navy' : 'Obsidian Slate'}</div>
                <div className="text-[10px] font-mono text-slate-400">{isGoldFields ? '#082B49' : '#0F172A'}</div>
                <div className="text-[10px] text-slate-500">Primary Brand Surface</div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                <div className="h-10 rounded-lg shadow-sm" style={{ backgroundColor: isGoldFields ? '#00E5C0' : '#0284C7' }} />
                <div className="text-xs font-bold text-white">{isGoldFields ? 'Electric Turquoise' : 'Sky Azure'}</div>
                <div className="text-[10px] font-mono text-slate-400">{isGoldFields ? '#00E5C0' : '#0284C7'}</div>
                <div className="text-[10px] text-slate-500">High-Contrast Accent</div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                <div className="h-10 rounded-lg shadow-sm" style={{ backgroundColor: isGoldFields ? '#C8A064' : '#1E293B' }} />
                <div className="text-xs font-bold text-white">{isGoldFields ? 'Mineral Gold' : 'Deep Navy Gray'}</div>
                <div className="text-[10px] font-mono text-slate-400">{isGoldFields ? '#C8A064' : '#1E293B'}</div>
                <div className="text-[10px] text-slate-500">Secondary Hierarchy</div>
              </div>

              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                <div className="h-10 rounded-lg shadow-sm border border-slate-700" style={{ backgroundColor: isGoldFields ? '#F7F6F2' : '#F8FAFC' }} />
                <div className="text-xs font-bold text-white">{isGoldFields ? 'Editorial Canvas' : 'Off-White Canvas'}</div>
                <div className="text-[10px] font-mono text-slate-400">{isGoldFields ? '#F7F6F2' : '#F8FAFC'}</div>
                <div className="text-[10px] text-slate-500">Reading Background</div>
              </div>
            </div>
          </div>

          {/* 3. Typography & Voice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Typography Scale & Pairings
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Headline Display Font</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {isGoldFields ? 'Playfair Display (Serif)' : 'Plus Jakarta Sans (Geometric)'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Body Reading Font</div>
                  <div className="text-sm font-bold text-white mt-1">Inter (Neutral Sans-Serif)</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Tone of Voice & Guardrails
              </h2>
              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                <div className="text-xs font-bold text-sky-400">Approved Voice:</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isGoldFields
                    ? 'Authoritative, institutional, source-grounded corporate reporting.'
                    : 'Analytical, decisive, discreet, senior-partner advisory level.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer 2: Observed Evidence */}
      {activeLayer === 'observed' && (
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4 animate-fadeIn">
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            Original Observed Extraction Evidence
          </div>
          <p className="text-xs text-slate-400">
            Raw evidence collected during the automated website crawler ingestion.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs font-mono space-y-1">
              <div className="text-sky-400 font-bold">Provenance: Header Navigation Brand Anchor</div>
              <div className="text-slate-300">DOM selector: &lt;nav class=&quot;site-nav&quot;&gt; &gt; &lt;a class=&quot;brand&quot;&gt;</div>
              <div className="text-slate-500 text-[10px]">Extracted at 2026-09-28T13:40:00Z with 96% confidence score</div>
            </div>
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs font-mono space-y-1">
              <div className="text-sky-400 font-bold">Provenance: Computed Primary Palette</div>
              <div className="text-slate-300">CSS declaration: :root &#123; --color-primary: #0F172A; &#125;</div>
              <div className="text-slate-500 text-[10px]">Extracted at 2026-09-28T13:40:00Z via computed stylesheet analysis</div>
            </div>
          </div>
        </div>
      )}

      {/* Layer 3: Redesign Extensions */}
      {activeLayer === 'redesign' && (
        <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4 animate-fadeIn">
          <div className="text-sm font-bold text-white uppercase tracking-wider">
            Proposed Redesign Palette & Component Tokens
          </div>
          <p className="text-xs text-slate-400">
            Harmonized design collection extensions proposed to elevate contrast and digital readability.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
              <div className="text-xs font-bold text-white">Elevated Card Radius</div>
              <p className="text-xs text-slate-400">12px (md) with subtle hairline border</p>
            </div>
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
              <div className="text-xs font-bold text-white">Dark Surface Theme</div>
              <p className="text-xs text-slate-400">Obsidian `#0A0D14` with selective glow</p>
            </div>
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
              <div className="text-xs font-bold text-white">Sub-second LCP Assets</div>
              <p className="text-xs text-slate-400">Optimized WebP/AVIF vector derivatives</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
