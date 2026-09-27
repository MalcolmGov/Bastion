'use client';

import React from 'react';
import {
  ShieldAlert,
  Heart,
  Users,
  Compass,
  Scale,
  Sparkles,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface CoreValuesSectionProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const CoreValuesSection: React.FC<CoreValuesSectionProps> = ({ onAskAI }) => {
  const values = [
    {
      id: 'safety',
      title: 'Safety',
      statement: 'If we cannot mine safely, we will not mine.',
      icon: ShieldAlert,
      iconColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description:
        'Safety is our foundational value and first priority in every decision, operational plan, and shift. We believe that all fatalities and serious injuries are preventable.',
      behaviors: [
        'Every worker has the absolute authority and duty to stop unsafe work immediately',
        'Courageous Safety Leadership embedded across executive, supervisory, and frontline teams',
        'Modern mechanization and tele-remote robotics removing personnel from active stoping faces',
        'Critical Control Management (CCM) audits conducted daily across high-risk hazards'
      ],
      aiPrompt: "Tell me about Gold Fields' core value of Safety: 'If we cannot mine safely, we will not mine.'"
    },
    {
      id: 'respect',
      title: 'Respect',
      statement: 'We treat each other with dignity and care.',
      icon: Heart,
      iconColor: 'text-rose-700 bg-rose-50 border-rose-200',
      description:
        'We value diversity, celebrate inclusion, and uphold human rights. We foster a psychological and physical working environment free from harassment, bullying, and prejudice.',
      behaviors: [
        'Strict zero-tolerance policy against workplace discrimination, bullying, and sexual harassment',
        'Targeting 30% female representation across our workforce and technical disciplines by 2030',
        'Adapted mining infrastructure, equipment ergonomics, and tailored PPE for female mineworkers',
        'Psychosocial support programs and dedicated employee wellbeing counseling services'
      ],
      aiPrompt: "How does Gold Fields put its core value of Respect into practice across its global workforce?"
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      statement: 'We work together to achieve shared value.',
      icon: Users,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200',
      description:
        'We forge meaningful, constructive relationships with organized labour unions, joint venture partners, host governments, indigenous traditional owners, and local suppliers.',
      behaviors: [
        'Concluded a landmark 5-year wage agreement at South Deep with NUM and UASA (July 2026)',
        'Managing successful Tier-1 joint ventures (Gruyere with Gold Road, Windfall with Osisko)',
        'Deep reconciliation partnerships and cultural heritage agreements with Traditional Owners',
        'Transparent multi-stakeholder dialogue on regional development and municipal infrastructure'
      ],
      aiPrompt: "How does Gold Fields collaborate with organized labour, joint ventures, and host communities?"
    },
    {
      id: 'responsibility',
      title: 'Responsibility',
      statement: 'We act with integrity and care for our communities and environment.',
      icon: Compass,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description:
        'We act as responsible stewards of shared water catchments, land, biodiversity, and regional economic prosperity, ensuring our footprint is restorative and enduring.',
      behaviors: [
        '34% of total procurement spend ($914M) directed to local host community business enterprises',
        '78% industrial water recycling rate across group operations with zero untreated discharges',
        '100% GISTM tailings conformance and state-of-the-art dry stack tailings at Salares Norte',
        '9 Host Community Trusts at South Deep funding schools, healthcare, and youth employment'
      ],
      aiPrompt: "What does the core value of Responsibility mean for Gold Fields' environmental and community stewardship?"
    },
    {
      id: 'integrity',
      title: 'Integrity',
      statement: 'We uphold the highest ethical standards.',
      icon: Scale,
      iconColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      description:
        'We are honest, transparent, and accountable. We conduct business with strict adherence to anti-bribery regulations, corporate governance codes, and regulatory disclosure standards.',
      behaviors: [
        'Zero tolerance for corruption, bribery, conflicts of interest, or financial irregularities',
        'Independent, confidential 24/7 Speak Up whistleblowing service managed by EthicsPoint',
        'Full compliance with King IV corporate governance standards and JSE/NYSE listing requirements',
        'Transparent tax and economic contributions disclosed publicly in our annual reporting suite'
      ],
      aiPrompt: "How does Gold Fields ensure ethical integrity and corporate governance across 6 jurisdictions?"
    }
  ];

  const handleAsk = (prompt: string, title: string) => {
    if (onAskAI) {
      onAskAI(prompt, `Core Value: ${title}`);
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
    <section id="values" className="py-20 bg-white border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-dark mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span>Guiding Principles</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Our Five Core Values
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
            Our values define who we are, how we treat one another, and how we conduct business across our global portfolio. They are non-negotiable principles that guide every operational decision, capital allocation, and community engagement.
          </p>
        </div>

        {/* 5 Values Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={v.id}
                className={`bg-editorial/60 rounded-2xl border border-mist p-7 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between ${
                  idx === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${v.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                      Value 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-navy mb-1 font-display">
                    {v.title}
                  </h3>

                  <p className="text-sm font-bold text-gold-dark italic mb-3">
                    &ldquo;{v.statement}&rdquo;
                  </p>

                  <p className="text-xs text-ink/80 leading-relaxed mb-6">
                    {v.description}
                  </p>

                  <div className="border-t border-mist/80 pt-4 mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle mb-3">
                      Demonstrated In Daily Practice
                    </h4>
                    <ul className="space-y-2">
                      {v.behaviors.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs text-ink leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-mist/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAsk(v.aiPrompt, v.title)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors group cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about {v.title}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
