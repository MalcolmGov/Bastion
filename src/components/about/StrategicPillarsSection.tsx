'use client';

import React from 'react';
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface StrategicPillarsSectionProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const StrategicPillarsSection: React.FC<StrategicPillarsSectionProps> = ({ onAskAI }) => {
  const pillars = [
    {
      id: 'quality-portfolio',
      title: 'Quality Portfolio',
      subtitle: 'Long-life, high-margin assets in Tier-1 jurisdictions',
      icon: Layers,
      iconColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description:
        'We continuously high-grade and optimize our global asset portfolio, focusing capital on low-cost, long-life gold assets in stable mining jurisdictions across Australia, the Americas, Ghana, and South Africa.',
      initiatives: [
        'Salares Norte commercial ramp-up delivering high-grade Andean gold-silver production',
        'Windfall Project 50/50 joint venture partnership with Osisko Mining in Quebec, Canada',
        'Aggressive brownfields reserve expansion and life-of-mine extensions at St Ives and South Deep',
        'Proactive portfolio rationalization: Transferred mature Damang mine to Ghana Government (April 2026)'
      ],
      aiPrompt: 'Explain Gold Fields\' Quality Portfolio strategic pillar and its key growth assets.'
    },
    {
      id: 'safety-culture',
      title: 'Safety & Culture',
      subtitle: 'Courageous leadership, zero harm, and inclusive workplaces',
      icon: ShieldCheck,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description:
        'Zero harm is our foundational moral imperative. We combine Courageous Safety Leadership with tele-remote underground mechanization and an inclusive, diverse workplace culture where every individual is empowered to thrive.',
      initiatives: [
        'Zero fatalities recorded across all global operations during the H1 2026 reporting period',
        'Tele-remote drill rigs and automated loaders removing mineworkers from hazardous sub-surface zones',
        '30% female representation targeted across total workforce by 2030 (26.2% achieved in H1 2026)',
        'Extensive psychosocial safety and psychological wellbeing support across all regional operations'
      ],
      aiPrompt: 'How does Gold Fields implement its Safety & Culture strategic pillar to achieve zero harm?'
    },
    {
      id: 'capital-allocation',
      title: 'Capital Allocation',
      subtitle: 'Disciplined capital hierarchy and reliable shareholder returns',
      icon: TrendingUp,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200',
      description:
        'We follow a disciplined capital allocation framework that balances investment-grade balance sheet resilience, sustaining capex, decarbonization self-generation, and generous dividend distributions.',
      initiatives: [
        'Disciplined policy paying out 30% to 45% of normalized earnings as cash dividends',
        'Targeting net debt to adjusted EBITDA ratio strictly below 1.0x throughout commodity cycles',
        'Rigorous capital hurdle rates (>15% IRR) required for all growth and microgrid investments',
        'Self-funded renewable decarbonization (Khanyisa 50MW solar and Agnew hybrid microgrid)'
      ],
      aiPrompt: 'Explain Gold Fields\' disciplined capital allocation framework and dividend policy.'
    }
  ];

  const handleAsk = (prompt: string, title: string) => {
    if (onAskAI) {
      onAskAI(prompt, `Strategic Pillar: ${title}`);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context: `About Gold Fields: ${title}`,
          },
        })
      );
    }
  };

  return (
    <section id="strategy" className="py-20 bg-editorial border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-navy" />
            <span>Strategic Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Three Strategic Pillars
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
            Our corporate strategy is organized around three clear, mutually reinforcing priorities that guide executive execution, ensure operational excellence, and deliver sustainable value for all stakeholders.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="bg-white rounded-2xl border border-mist p-8 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl border ${pillar.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-navy bg-editorial px-2.5 py-1 rounded border border-mist">
                      Pillar 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-navy mb-1 font-display">
                    {pillar.title}
                  </h3>

                  <p className="text-xs font-semibold text-gold-dark mb-4">
                    {pillar.subtitle}
                  </p>

                  <p className="text-xs text-ink/80 leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="border-t border-mist/80 pt-4 mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-3">
                      Core Strategic Actions
                    </h4>
                    <ul className="space-y-2.5">
                      {pillar.initiatives.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2 text-xs text-ink leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-mist/80">
                  <button
                    type="button"
                    onClick={() => handleAsk(pillar.aiPrompt, pillar.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors group cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about {pillar.title}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Capital Allocation Hierarchy Flowchart / Visualizer */}
        <div className="bg-navy-dark text-white rounded-3xl p-8 lg:p-10 border border-mist/20 shadow-elevated">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-light block mb-2">
              Disciplined Governance
            </span>
            <h3 className="text-2xl font-bold font-display">
              Capital Allocation Framework &amp; Cash Priority Hierarchy
            </h3>
            <p className="text-xs text-mist/80 mt-1">
              How operational cash flows are methodically prioritized to ensure balance sheet resilience, safety, and superior shareholder returns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-navy/80 p-5 rounded-xl border border-mist/10 space-y-2">
              <span className="text-[10px] font-bold text-gold-light bg-gold-dark/40 px-2 py-0.5 rounded uppercase">
                Priority 1
              </span>
              <h4 className="text-sm font-bold text-white">Sustaining Capital &amp; Safety</h4>
              <p className="text-xs text-mist/70">
                Asset integrity, ore reserve development, underground ventilation, and 100% GISTM tailings safety compliance.
              </p>
            </div>

            <div className="bg-navy/80 p-5 rounded-xl border border-mist/10 space-y-2">
              <span className="text-[10px] font-bold text-gold-light bg-gold-dark/40 px-2 py-0.5 rounded uppercase">
                Priority 2
              </span>
              <h4 className="text-sm font-bold text-white">Balance Sheet Health</h4>
              <p className="text-xs text-mist/70">
                Maintaining investment-grade ratings with net debt / adjusted EBITDA comfortably below 1.0x through the gold cycle.
              </p>
            </div>

            <div className="bg-navy/80 p-5 rounded-xl border border-mist/10 space-y-2">
              <span className="text-[10px] font-bold text-gold-light bg-gold-dark/40 px-2 py-0.5 rounded uppercase">
                Priority 3
              </span>
              <h4 className="text-sm font-bold text-white">Shareholder Dividends</h4>
              <p className="text-xs text-mist/70">
                Returning 30% to 45% of normalized earnings directly to shareholders as consistent cash dividends.
              </p>
            </div>

            <div className="bg-navy/80 p-5 rounded-xl border border-mist/10 space-y-2">
              <span className="text-[10px] font-bold text-gold-light bg-gold-dark/40 px-2 py-0.5 rounded uppercase">
                Priority 4
              </span>
              <h4 className="text-sm font-bold text-white">Growth &amp; Decarbonization</h4>
              <p className="text-xs text-mist/70">
                Funding high-return growth assets (Salares Norte, Windfall JV) and renewable microgrids with strict IRR hurdles (&gt;15%).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
