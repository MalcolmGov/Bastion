'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Palette, ArrowRight, CheckCircle2, Sparkles, Building, Briefcase, Utensils } from 'lucide-react';
import { BLUEPRINTS } from '@/lib/studio/blueprints';
import { DESIGN_COLLECTIONS } from '@/lib/studio/collections';

export default function BlueprintsAndCollectionsPage() {
  const getBlueprintIcon = (id: string) => {
    switch (id) {
      case 'corporate': return <Building className="w-5 h-5 text-sky-400" />;
      case 'professional_services': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'hospitality': return <Utensils className="w-5 h-5 text-amber-400" />;
      default: return <Layers className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold font-mono uppercase text-sky-400">Move Studio Architecture</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Reusable Blueprint & Design Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Website Blueprints & Curated Collections
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
          Move Studio separates structural information architecture (Blueprints) from visual treatments (Collections), allowing any client site to assemble instantly with pre-verified responsive layouts.
        </p>
      </div>

      {/* Part 1: Three Blueprints */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              3 Reusable Blueprints
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Structural Information Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(BLUEPRINTS).map((bp) => (
            <div
              key={bp.id}
              className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-slate-700 transition flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#141C2A] border border-[#232F42] flex items-center justify-center">
                  {getBlueprintIcon(bp.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{bp.name}</h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{bp.tagline}</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {bp.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default Page Tree:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {bp.defaultPages.map((p) => (
                      <span key={p.slug} className="text-[10px] px-2 py-0.5 rounded bg-[#141C2A] text-slate-300 font-mono">
                        /{p.slug}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/create?blueprint=${bp.id}`}
                className="w-full py-2.5 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <span>Initialize with {bp.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Three Design Collections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              3 Curated Design Collections
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Visual Styling & Token Rules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(DESIGN_COLLECTIONS).map((col) => (
            <div
              key={col.id}
              className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-slate-700 transition flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{col.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-violet-950 text-violet-300 border border-violet-800">
                    Ratio {col.typography.scaleRatio}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium">{col.tagline}</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {col.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-[#1E293B] text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Heading Typography:</span>
                    <strong className="text-white font-mono text-[11px]">{col.typography.headingFont.split(',')[0]}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reading Typography:</span>
                    <strong className="text-white font-mono text-[11px]">{col.typography.bodyFont.split(',')[0]}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Framing & Aspect:</span>
                    <strong className="text-white font-mono text-[11px]">{col.imagery.aspectRatio}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] text-[11px] text-slate-400">
                <span className="text-sky-400 font-semibold">Treatment: </span>
                {col.imagery.treatment}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
