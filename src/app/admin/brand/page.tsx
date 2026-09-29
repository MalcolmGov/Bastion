'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Building,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { BrandDnaExtractor } from '@/components/admin/BrandDnaExtractor';

function BrandLibraryContent() {
  const { activeClient, activeSite } = useStudioWorkspace();
  const searchParams = useSearchParams();
  const initialUrlFromQuery = searchParams.get('url') || '';

  const [activeLayer, setActiveLayer] = useState<'extractor' | 'approved' | 'observed' | 'redesign'>(
    initialUrlFromQuery ? 'extractor' : 'extractor'
  );
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-purple-400">
              Bastion Brand Intelligence &amp; Governance
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">{activeClient?.name || 'Client Project'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Brand DNA &amp; Reviewed Library
          </h1>
        </div>

        {/* Layer Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] self-start sm:self-auto flex-wrap gap-0.5">
          <button
            type="button"
            onClick={() => setActiveLayer('extractor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeLayer === 'extractor'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand DNA Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayer === 'approved'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Approved Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('observed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayer === 'observed'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Observed Evidence
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('redesign')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeLayer === 'redesign'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Redesign Extensions
          </button>
        </div>
      </div>

      {/* Layer 0: Brand DNA Pipeline (URL -> Approved Brand Kit) */}
      {activeLayer === 'extractor' && (
        <BrandDnaExtractor initialUrl={initialUrlFromQuery} />
      )}

      {/* Layer 1: Client-Approved Brand Rules */}
      {activeLayer === 'approved' && (
        <div className="space-y-6">
          {/* 1. Logos & Marks */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Approved Logo Assets &amp; Variants
                </h2>
                <p className="text-xs text-slate-500">
                  Approved vector marks and light/dark alternates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLock('primaryLogo')}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {lockedItems.primaryLogo ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockedItems.primaryLogo ? 'Locked (AI Protected)' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-3">
                <div className="h-16 bg-white dark:bg-[#0A0D14] rounded-lg flex items-center justify-center p-3 border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-[#7C3AED] text-sm">{activeClient?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-white">Primary Vector Mark</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                    Approved
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-3">
                <div className="h-16 bg-[#0B0F19] rounded-lg flex items-center justify-center p-3 border border-slate-800">
                  <span className="font-bold text-amber-400 text-sm">{activeClient?.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-white">Reverse / Dark Background</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                    Approved
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-3">
                <div className="h-16 bg-white dark:bg-[#0A0D14] rounded-lg flex items-center justify-center p-3 border border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white flex items-center justify-center font-bold text-xs">
                    {activeClient?.name ? activeClient.name.substring(0, 2).toUpperCase() : 'GF'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-white">Monogram / Favicon</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Color Palette */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Brand Color Tokens
                </h2>
                <p className="text-xs text-slate-500">
                  Approved hex tokens for buttons, surfaces, and contrast compliance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleLock('primaryColor')}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {lockedItems.primaryColor ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockedItems.primaryColor ? 'Locked (AI Protected)' : 'Unlocked'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                <div className="h-12 rounded-lg bg-[#0B3A66] shadow-xs" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Primary Brand</span>
                  <span className="font-mono text-[10px] text-slate-500">#0B3A66</span>
                </div>
                <div className="text-[10px] text-slate-500">Buttons, links &amp; headers</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                <div className="h-12 rounded-lg bg-[#E8793A] shadow-xs" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">CTA Accent</span>
                  <span className="font-mono text-[10px] text-slate-500">#E8793A</span>
                </div>
                <div className="text-[10px] text-slate-500">Primary call-to-actions</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                <div className="h-12 rounded-lg bg-[#F8FAFC] border border-slate-300 shadow-xs" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Surface / Card</span>
                  <span className="font-mono text-[10px] text-slate-500">#F8FAFC</span>
                </div>
                <div className="text-[10px] text-slate-500">Module cards &amp; elevation</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                <div className="h-12 rounded-lg bg-[#0F172A] shadow-xs" />
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">Text / Foreground</span>
                  <span className="font-mono text-[10px] text-slate-500">#0F172A</span>
                </div>
                <div className="text-[10px] text-slate-500">Headings &amp; body copy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer 2: Observed Evidence */}
      {activeLayer === 'observed' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Observed Web Evidence</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every token in this brand system is accompanied by cryptographic or source provenance (DOM locator, stylesheet URI, and extraction timestamp) to ensure strict corporate compliance.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-600 dark:text-slate-300">
            <div>source_url: {activeSite?.primaryDomain || 'https://www.goldfields.com'}</div>
            <div>provenance_engine: Bastion Playwright / Ingest v2.0</div>
            <div>status: Verified &amp; Cached (42ms)</div>
          </div>
        </div>
      )}

      {/* Layer 3: Redesign Extensions */}
      {activeLayer === 'redesign' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#7C3AED]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Proposed Redesign Extensions</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            AI-suggested secondary tints, accessible dark-mode elevations, and responsive typography scales derived from your primary brand DNA.
          </p>
        </div>
      )}
    </div>
  );
}

export default function BrandLibraryPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading brand library...</div>}>
      <BrandLibraryContent />
    </React.Suspense>
  );
}
