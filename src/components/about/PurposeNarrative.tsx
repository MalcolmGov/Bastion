'use client';

import React from 'react';
import {
  Coins,
  Cpu,
  BrainCircuit,
  HeartHandshake,
  Users2,
  Trees,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PurposeNarrativeProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const PurposeNarrative: React.FC<PurposeNarrativeProps> = ({ onAskAI }) => {
  const capitals = [
    {
      title: 'Financial Capital',
      icon: Coins,
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
      description:
        'Disciplined capital allocation prioritizing investment-grade balance sheet resilience, organic growth funding, and rewarding shareholders with 30% to 45% of normalized earnings paid as dividends.',
      kpi: 'Disciplined Capital Allocation Framework'
    },
    {
      title: 'Manufactured Capital',
      icon: Cpu,
      accent: 'text-blue-700 bg-blue-50 border-blue-200',
      description:
        'Modern, highly mechanized deep-level and open-pit mining operations, high-recovery processing plants, and flagship utility-scale renewable microgrids like Agnew and Khanyisa.',
      kpi: '9 Global Tier-1 & Quality Operations'
    },
    {
      title: 'Intellectual Capital',
      icon: BrainCircuit,
      accent: 'text-purple-700 bg-purple-50 border-purple-200',
      description:
        'World-class geotechnical engineering in complex rock masses, ISO 55001 accredited asset management at South Deep, 3D structural geology modeling, and autonomous drill fleet integration.',
      kpi: 'Pioneering Tele-Remote Underground Mining'
    },
    {
      title: 'Human Capital',
      icon: HeartHandshake,
      accent: 'text-orange-700 bg-orange-50 border-orange-200',
      description:
        'Our workforce of over 20,000 employees and contractors. Guided by Courageous Safety Leadership, eliminating fatal risks, fostering psychological wellbeing, and driving gender diversity toward 30% by 2030.',
      kpi: 'Zero Fatalities H1 2026 • TRIFR 1.15'
    },
    {
      title: 'Social & Relationship Capital',
      icon: Users2,
      accent: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      description:
        'Deep trust and collaboration with host communities, organized labour unions, indigenous traditional owners, and governments, underpinned by $914M in local economic procurement spend.',
      kpi: '34% Host Community Spend • 9 Host Trusts'
    },
    {
      title: 'Natural Capital',
      icon: Trees,
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description:
        'Science-based environmental stewardship: 26.4% net Scope 1 & 2 carbon cuts, 78% industrial water recycling, 100% GISTM tailings conformance, and zero-discharge dry stack tailings at Salares Norte.',
      kpi: 'Net Zero by 2050 • 100% GISTM Conformance'
    }
  ];

  const handleAsk = () => {
    const prompt =
      "Explain Gold Fields' core corporate purpose 'Creating enduring value beyond mining' and how the Six Capitals framework guides strategic decision making.";
    const context = "Purpose Narrative & Six Capitals";

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
    <section className="py-20 bg-editorial border-b border-mist">
      <div className="max-w-7xl mx-auto px-6">
        {/* Purpose Anchor Callout */}
        <div className="bg-white rounded-3xl border border-mist p-8 lg:p-12 shadow-subtle mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark bg-gold-light/40 px-3 py-1 rounded-full border border-gold-mineral/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-mineral" />
                <span>Our Corporate Purpose</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy tracking-tight font-display">
                &ldquo;Creating enduring value beyond mining.&rdquo;
              </h2>

              <p className="text-base text-ink leading-relaxed">
                Mining involves the extraction of finite mineral reserves. Our responsibility is to ensure that the value generated from those reserves is infinite—creating enduring economic, human, and ecological vitality that outlives the life of our mines.
              </p>

              <p className="text-sm text-ink-muted leading-relaxed">
                This philosophy guides how we allocate capital, develop our people, engage host communities, and restore natural environments. We measure true success not solely by the gold we pour, but by the legacy of infrastructure, skills, community prosperity, and environmental integrity we leave behind for future generations.
              </p>
            </div>

            <div className="lg:col-span-4 bg-editorial p-6 rounded-2xl border border-mist space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-subtle">
                Core Strategic Mandate
              </h3>
              <ul className="space-y-3 text-xs text-ink">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>Prioritize safety as an uncompromising human right</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>Deliver consistent, high-margin shareholder returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>Equip host communities with diversified economic resilience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span>Pioneer decarbonization and closed-circuit conservation</span>
                </li>
              </ul>

              <div className="pt-2 border-t border-mist/80">
                <button
                  type="button"
                  onClick={handleAsk}
                  className="w-full py-2.5 px-3 rounded-lg bg-navy text-white text-xs font-bold hover:bg-navy-light transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Ask AI about our Purpose</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Six Capitals Value Creation Architecture */}
        <div>
          <div className="max-w-3xl mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy font-display">
              The Six Capitals Value Creation Framework
            </h3>
            <p className="mt-2 text-sm sm:text-base text-ink-muted leading-relaxed">
              In accordance with the International Integrated Reporting Framework (&lt;IR&gt;), Gold Fields measures value creation across six interdependent forms of capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capitals.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-mist p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-xl border ${cap.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
                        Capital {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-navy mb-2 font-display">
                      {cap.title}
                    </h4>

                    <p className="text-xs text-ink/80 leading-relaxed mb-4">
                      {cap.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-mist/60">
                    <span className="text-[11px] font-bold text-navy flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      <span>{cap.kpi}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
