'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sun,
  Wind,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface RenewableCaseStudiesProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const RenewableCaseStudies: React.FC<RenewableCaseStudiesProps> = ({ onAskAI }) => {
  const handleTriggerAI = (prompt: string, context: string) => {
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

  return (
    <section className="py-20 bg-white border-b border-mist">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Title */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            <span>Decarbonization in Action</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Flagship Renewable Energy Case Studies
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
            Gold Fields is leading the global mining sector in the deployment of utility-scale renewable microgrids. By pairing utility-scale wind and solar with dynamic battery storage, we decrease operating costs, ensure grid security, and permanently decouple production from fossil fuels.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="space-y-16">
          {/* ============================================================ */}
          {/* CASE STUDY 1: KHANYISA 50MW SOLAR PLANT (SOUTH AFRICA)       */}
          {/* ============================================================ */}
          <div className="bg-editorial/60 rounded-3xl border border-mist p-8 lg:p-12 shadow-subtle hover:shadow-card transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Visual & KPIs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-mist shadow-xs">
                  <Image
                    src="/assets/home-climate.png"
                    alt="Khanyisa 50MW Solar Plant at South Deep"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/30 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light bg-navy px-2.5 py-1 rounded">
                      South Africa • Westonaria
                    </span>
                    <h3 className="text-xl font-bold mt-2">
                      50MW Khanyisa Solar Plant
                    </h3>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">Capacity</span>
                    <span className="text-lg font-extrabold text-navy tabular-nums block mt-0.5">50 MW</span>
                    <span className="text-[10px] text-ink-muted block">Direct Grid</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">Annual Output</span>
                    <span className="text-lg font-extrabold text-forest tabular-nums block mt-0.5">120 GWh</span>
                    <span className="text-[10px] text-ink-muted block">Clean Power</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">CO2 Abated</span>
                    <span className="text-lg font-extrabold text-emerald-700 tabular-nums block mt-0.5">110 kt/yr</span>
                    <span className="text-[10px] text-ink-muted block">Scope 2 Cuts</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Case Narrative */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>South Deep Operation • Commissioned & Operating</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-navy font-display">
                  Pioneering Commercial Renewable Self-Generation in South Africa
                </h3>

                <p className="text-sm text-ink leading-relaxed">
                  The **Khanyisa Solar Plant** (meaning <em>&ldquo;Light&rdquo;</em> in isiZulu) at our South Deep deep-level mechanized gold mine was one of the first utility-scale solar photovoltaic projects commissioned by a mining house in South Africa. Spanning 118 hectares with over 100,000 bifacial solar panels, Khanyisa represents a benchmark in self-generation.
                </p>

                <div className="space-y-3 text-xs text-ink/90">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">Mine Power Demand Coverage:</strong>{' '}
                      Generates over 24% of South Deep’s total electricity consumption, reducing reliance on the carbon-heavy national grid.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">Financial Savings & Tariff Hedge:</strong>{' '}
                      Shields the mine from steep domestic electricity tariff hikes, generating an estimated ZAR 120M+ in annual cost savings that directly support South Deep’s long-term commercial sustainability.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">Community Socio-Economic Impact:</strong>{' '}
                      Over 240 local community members were employed during construction, and ongoing operations and vegetation management are contracted to host community business enterprises.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerAI(
                        "Tell me about the 50MW Khanyisa solar plant at South Deep, its carbon abatement, and commercial impact.",
                        "Khanyisa Solar Case Study"
                      )
                    }
                    className="px-4 py-2.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-2 cursor-pointer group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about Khanyisa Solar Plant</span>
                  </button>

                  <a
                    href="/operations/south-deep"
                    className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                  >
                    <span>View South Deep Operation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* CASE STUDY 2: AGNEW RENEWABLE MICROGRID (AUSTRALIA)          */}
          {/* ============================================================ */}
          <div className="bg-editorial/60 rounded-3xl border border-mist p-8 lg:p-12 shadow-subtle hover:shadow-card transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Visual & KPIs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-mist shadow-xs">
                  <Image
                    src="/assets/australia-ops-image.png"
                    alt="Agnew Renewable Hybrid Microgrid with Wind Turbines and Solar"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/30 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light bg-navy px-2.5 py-1 rounded">
                      Australia • Northern Goldfields
                    </span>
                    <h3 className="text-xl font-bold mt-2">
                      Agnew Renewable Hybrid Microgrid
                    </h3>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">Wind Power</span>
                    <span className="text-lg font-extrabold text-navy tabular-nums block mt-0.5">18 MW</span>
                    <span className="text-[10px] text-ink-muted block">5 Turbines</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">Solar + BESS</span>
                    <span className="text-lg font-extrabold text-forest tabular-nums block mt-0.5">4MW / 13MW</span>
                    <span className="text-[10px] text-ink-muted block">Battery Storage</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-mist shadow-xs">
                    <span className="text-[10px] text-ink-subtle uppercase font-bold block">Renewable Share</span>
                    <span className="text-lg font-extrabold text-cyan-700 tabular-nums block mt-0.5">&gt;70%</span>
                    <span className="text-[10px] text-ink-muted block">Up to 100% Peak</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Case Narrative */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold border border-cyan-200">
                  <Wind className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Global Mining Industry Benchmark • Clean Energy Award Winner</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-navy font-display">
                  World-First Wind, Solar, and Battery Microgrid for Underground Mining
                </h3>

                <p className="text-sm text-ink leading-relaxed">
                  Located in the remote Northern Goldfields of Western Australia, the **Agnew Microgrid** is recognized internationally as a breakthrough blueprint for clean mining. It integrates 18MW of wind generation (five 110m rotor diameter turbines), 4MW of solar PV, a 13MW/4MWh lithium-ion battery system (BESS), and an advanced microgrid controller with gas generation backup.
                </p>

                <div className="space-y-3 text-xs text-ink/90">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">Up to 100% Renewable Peak Penetration:</strong>{' '}
                      During favorable wind and solar conditions, Agnew regularly runs on 100% renewable power, idling its gas engines and supplying zero-carbon energy to deep underground stopes and surface mills.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">46,400 Tonnes Annual CO2e Reduction:</strong>{' '}
                      The hybrid plant abates roughly 46,400 tonnes of greenhouse gas emissions annually, while drastically reducing diesel hauling costs across the remote Western Australian outback.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">Underground Fleet Electrification Testbed:</strong>{' '}
                      Agnew serves as Gold Fields&apos; testbed for zero-emission mining, trialling battery-electric underground light vehicles and charging infrastructure powered directly by green microgrid electrons.
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleTriggerAI(
                        "How does the Agnew wind-solar-battery hybrid microgrid work in Western Australia, and what awards has it won?",
                        "Agnew Microgrid Case Study"
                      )
                    }
                    className="px-4 py-2.5 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center gap-2 cursor-pointer group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about Agnew Hybrid Microgrid</span>
                  </button>

                  <a
                    href="/operations#agnew"
                    className="text-xs font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                  >
                    <span>View Agnew Operation Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
