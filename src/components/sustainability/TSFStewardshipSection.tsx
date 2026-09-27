'use client';

import React from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Mountain
} from 'lucide-react';

interface TSFStewardshipSectionProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const TSFStewardshipSection: React.FC<TSFStewardshipSectionProps> = ({ onAskAI }) => {
  const handleTriggerAI = (customPrompt?: string) => {
    const prompt =
      customPrompt ||
      "Explain Gold Fields' Tailings Storage Facility (TSF) stewardship, 100% GISTM conformance, and dry stack tailings at Salares Norte.";
    const context = "TSF Stewardship & GISTM";

    if (onAskAI) {
      onAskAI(prompt, context);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context,
          },
        })
      );
    }
  };

  const governanceLevels = [
    {
      role: 'Accountable Executive',
      description: 'Designated executive committee members answerable directly to the Board of Directors for all tailings facility integrity.'
    },
    {
      role: 'Engineer of Record (EoR)',
      description: 'Accredited international geotechnical consulting engineering firms appointed to oversee design, construction, and daily operational safety.'
    },
    {
      role: 'Independent DSRP',
      description: 'Independent Dam Safety Review Panels composed of recognized global tailings experts conducting comprehensive annual and triennial audits.'
    },
    {
      role: 'InSAR Satellite Radar',
      description: 'High-frequency satellite interferometry measuring millimetric surface displacement across all dam crests and embankments in real time.'
    }
  ];

  return (
    <section id="tailings" className="py-20 bg-editorial border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Zero Compromise Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Tailings Storage Facility (TSF) Stewardship & GISTM
          </h2>
          <p className="mt-3 text-base sm:text-lg text-ink-muted leading-relaxed">
            Gold Fields treats tailings safety as a paramount moral and engineering imperative. We manage all 37 tailings facilities across our global portfolio with rigorous oversight, meeting and exceeding international best practices.
          </p>
        </div>

        {/* 100% GISTM Conformance Banner */}
        <div className="bg-navy-dark text-white rounded-2xl p-8 mb-12 border border-mist/20 shadow-elevated relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited Milestone</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                100% Conformance with the Global Industry Standard on Tailings Management (GISTM)
              </h3>
              <p className="text-sm text-mist/90 leading-relaxed max-w-2xl">
                All Gold Fields Tailings Storage Facilities classified with ‘Extreme’ or ‘Very High’ potential consequence ratings have achieved verified conformance with the ICMM-mandated GISTM standard. Independent Dam Safety Review Panels (DSRP) have inspected and verified our facility management, emergency response preparedness, and transparent public reporting.
              </p>
            </div>

            <div className="lg:col-span-4 bg-navy-surface/80 rounded-xl p-6 border border-mist/10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light block">
                Audited Conformance Rate
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tabular-nums">
                100%
              </div>
              <p className="text-xs text-mist/80">
                Verified across all extreme and very high consequence facilities in South Africa, Australia, Ghana, and the Americas.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.goldfields.com/our-tsfs.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-gold hover:text-gold-light inline-flex items-center gap-1.5"
                >
                  <span>Access Public TSF Inventory Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive: Salares Norte Dry Stack Tailings Spotlight */}
        <div className="bg-white rounded-2xl border border-mist p-8 lg:p-10 shadow-card mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden border border-mist shadow-sm">
                <Image
                  src="/assets/salaresnorte-trucks-in-pit-2025.png"
                  alt="Salares Norte High Andes mining operation and dry stack infrastructure"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-light bg-navy-dark/80 px-2 py-0.5 rounded backdrop-blur-xs">
                    Chile • High Andes (~4,500m)
                  </span>
                  <p className="text-xs text-mist font-medium mt-1">
                    Dry stack tailings eliminates conventional wet slurry dams
                  </p>
                </div>
              </div>

              {/* Stat Callouts */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-editorial p-3 rounded-lg border border-mist">
                  <span className="text-ink-subtle block font-semibold text-[10px] uppercase">Solids Content</span>
                  <span className="text-lg font-bold text-navy tabular-nums">&gt;85% Dry Cake</span>
                </div>
                <div className="bg-editorial p-3 rounded-lg border border-mist">
                  <span className="text-ink-subtle block font-semibold text-[10px] uppercase">Liquid Discharge</span>
                  <span className="text-lg font-bold text-forest tabular-nums">Zero Discharge</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-dark">
                <Mountain className="w-4 h-4 text-gold-mineral" />
                <span>Pioneering Engineering at High Altitude</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-navy font-display">
                Dry Stack Filtered Tailings at Salares Norte
              </h3>

              <p className="text-sm text-ink leading-relaxed">
                Located in the high Andes of the Atacama region at extreme altitudes between 3,900m and 4,700m above sea level, **Salares Norte** implemented state-of-the-art **dry stack filtered tailings technology** instead of a conventional wet slurry tailings dam.
              </p>

              <div className="space-y-3 text-xs text-ink/90">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy">Elimination of Dam Breach Risks:</strong>{' '}
                    Process slurry is passed through high-capacity filter presses that mechanically extract water, producing an unsaturated dry cake with over 85% solids content. Because there is no ponded water or fluid tailings, catastrophic dam breach or liquefaction risk is eliminated.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy">High-Altitude Seismic Resilience:</strong>{' '}
                    Chile is one of the world’s most seismically active zones. Mechanically compacted dry stack tailings provide structural stability under high-magnitude earthquake loading that surpasses conventional earthen dams.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy">Extreme Water Conservation in the Atacama:</strong>{' '}
                    Extracting water at the plant recovers more than 85% of process water for immediate closed-circuit recycling, dramatically reducing freshwater withdrawal from delicate high-altitude Andean aquifers.
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleTriggerAI(
                      "How does dry stack tailings work at Salares Norte, and what are its environmental and seismic advantages?"
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Ask AI about Salares Norte dry stack tailings</span>
                </button>

                <a
                  href="/operations/salares-norte"
                  className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                >
                  <span>Explore Salares Norte Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Tier Governance Architecture Cards */}
        <div className="border-t border-mist/80 pt-10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-subtle mb-6 text-center">
            Multi-Layered Global TSF Governance Model
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {governanceLevels.map((lvl, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-xl border border-mist shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-forest bg-forest-light px-2 py-0.5 rounded">
                    Layer {index + 1}
                  </span>
                  <h5 className="font-bold text-navy text-sm mt-2 mb-1.5">
                    {lvl.role}
                  </h5>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {lvl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
