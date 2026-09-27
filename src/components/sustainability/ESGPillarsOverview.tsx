'use client';

import React from 'react';
import {
  Flame,
  Droplets,
  ShieldAlert,
  HardHat,
  Users2,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface ESGPillarsOverviewProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const ESGPillarsOverview: React.FC<ESGPillarsOverviewProps> = ({ onAskAI }) => {
  const pillars = [
    {
      id: 'decarbonization',
      title: 'Decarbonization & Climate Action',
      badge: 'Target: 30% Net Cut by 2030',
      icon: Flame,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
      summary:
        'Targeting a 30% net reduction in Scope 1 & 2 carbon emissions by 2030 against our 2016 baseline, accelerating toward Net Zero by 2050.',
      narrative:
        'Mining is energy intensive, and transitioning our global energy supply from heavy fossil fuels to renewables is central to both environmental stewardship and operating cost resilience. Our roadmap couples multi-megawatt solar and wind generation with battery storage, alongside electrification of underground mobile machinery and energy efficiency initiatives.',
      keyMilestones: [
        '26.4% net Scope 1 & 2 reduction achieved to date (FY25/H1 2026)',
        'South Deep 50MW Khanyisa Solar Plant abating ~110,000 tonnes CO2e annually',
        'Agnew renewable microgrid achieving >70% annual renewable penetration',
        'St Ives 42MW wind and 35MW solar microgrid expansion underway'
      ],
      aiPrompt: 'How is Gold Fields achieving its 30% net decarbonization target by 2030?'
    },
    {
      id: 'water',
      title: 'Water Stewardship',
      badge: 'Target: 80%+ Recycled Water',
      icon: Droplets,
      iconColor: 'text-turquoise-dark bg-turquoise-light border-turquoise/30',
      summary:
        'Securing catchment water security, maximizing industrial recycling, and ensuring zero untreated discharges into surrounding ecological systems.',
      narrative:
        'Water is a shared, precious natural resource. Across water-stressed environments such as the Atacama Desert in Chile and the Western Australian Goldfields, Gold Fields prioritizes closed-circuit recycling, tailings dewatering, and community water infrastructure. We manage water catchments collaboratively with regional authorities and host communities.',
      keyMilestones: [
        '78% group water recycled or reused in H1 2026 (target: 80%+ by 2030)',
        'Zero high-severity environmental water discharge incidents',
        'Salares Norte dry stack tailings recovering over 85% of process water',
        'Community potable water supply projects supported in Hualgayoc, Peru'
      ],
      aiPrompt: 'What is Gold Fields\' water stewardship strategy and recycling performance?'
    },
    {
      id: 'tailings',
      title: 'Tailings Safety (GISTM)',
      badge: '100% Conformance Achieved',
      icon: ShieldAlert,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      summary:
        'Full compliance across all operational Tailings Storage Facilities (TSFs) with the Global Industry Standard on Tailings Management (GISTM).',
      narrative:
        'Tailings management is a zero-compromise engineering discipline. We have subjected all extreme and very high consequence facilities to independent third-party Dam Safety Review Panels (DSRP) and appointed qualified Engineers of Record (EoR). Advanced satellite InSAR radar continuously tracks ground stability across every facility globally.',
      keyMilestones: [
        '100% GISTM conformance on extreme and very high consequence facilities',
        'Dry stack filtered tailings deployed at high-altitude Salares Norte',
        'In-pit tailings deposition strategy at Cerro Corona avoiding surface footprint',
        'Publicly disclosed TSF inventory portal with transparent consequence classifications'
      ],
      aiPrompt: 'How does Gold Fields ensure GISTM compliance and tailings dam safety?'
    },
    {
      id: 'safety',
      title: 'Safety, Health & Wellbeing',
      badge: 'Zero Harm Imperative',
      icon: HardHat,
      iconColor: 'text-orange-700 bg-orange-50 border-orange-200',
      summary:
        'Anchored in our foundational core value: "If we cannot mine safely, we will not mine." Eliminating fatal risks and safeguarding mental health.',
      narrative:
        'Every individual working at Gold Fields has the absolute authority and obligation to stop work in unsafe conditions. We have modernized deep-level and underground operations through mechanization and tele-remote technology, removing personnel from active stoping faces. Our Courageous Safety Leadership program empowers psychological and physical safety across every team.',
      keyMilestones: [
        'Zero fatalities recorded across all global operations in H1 2026',
        'Total Recordable Injury Frequency Rate (TRIFR) improved to 1.15',
        'Mechanized tele-remote drilling active at South Deep and Australian operations',
        'Comprehensive psychological wellness and anti-harassment training across all sites'
      ],
      aiPrompt: 'What is Gold Fields\' Courageous Safety Leadership philosophy?'
    },
    {
      id: 'community',
      title: 'Community Shared Value',
      badge: '34% Host Community Spend',
      icon: Users2,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200',
      summary:
        'Creating enduring prosperity for host communities through local enterprise development, preferential procurement, and community trust funds.',
      narrative:
        'Mining must generate sustainable economic vitality that endures long after mine closure. Gold Fields requires that a minimum of 30% of total procurement spend is awarded to local businesses operating in the immediate vicinity of our mines. We partner with local schools, technical colleges, and healthcare facilities to build resilient community foundations.',
      keyMilestones: [
        '$914 million total value distributed to host communities in FY 2025',
        '34% of total procurement spend directed to host community businesses',
        '9 Host Community Trusts active at South Deep investing in health and education',
        'Formal partnership and reconciliation agreements with Australian Traditional Owners'
      ],
      aiPrompt: 'How does Gold Fields create shared value for local host communities?'
    },
    {
      id: 'gender-diversity',
      title: 'Gender Diversity & Inclusion',
      badge: 'Target: 30% Women by 2030',
      icon: Sparkles,
      iconColor: 'text-purple-700 bg-purple-50 border-purple-200',
      summary:
        'Building an inclusive, equitable workplace that attracts, develops, and retains women across all operational, technical, and executive roles.',
      narrative:
        'Historically, deep-level and underground mining faced severe gender imbalances. Gold Fields has systematically redesigned underground equipment ergonomics, facilities, and personal protective equipment (PPE) while establishing transparent recruitment and executive sponsorship pathways to ensure equal opportunity and equitable remuneration across all operating regions.',
      keyMilestones: [
        'Female representation expanded to 26.2% of total group workforce in H1 2026 (from 15% baseline in 2016)',
        '30% female representation targeted across managerial and engineering bands by 2030',
        'Women in Mining mentoring and leadership accelerator programs established',
        'Strict equal-pay-for-equal-work audits conducted annually across all operating regions'
      ],
      aiPrompt: 'What is Gold Fields\' roadmap for gender diversity and women in mining?'
    }
  ];

  const handleAsk = (prompt: string, id: string) => {
    if (onAskAI) {
      onAskAI(prompt, `ESG Pillar: ${id}`);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context: `Sustainability & ESG: ${id}`,
          },
        })
      );
    }
  };

  return (
    <section className="py-20 bg-editorial border-b border-mist">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            <span>Strategic ESG Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Six Pillars of Sustainable Stewardship
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ink-muted leading-relaxed">
            Our ESG strategy addresses our most material environmental, operational, and social impacts. Each pillar is governed by defined quantitative metrics, transparent executive accountability, and independent verification.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.id}
                id={pillar.id}
                className="bg-white rounded-2xl border border-mist p-7 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon and Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className={`p-3 rounded-xl border ${pillar.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        pillar.id === 'water'
                          ? 'text-turquoise-dark bg-turquoise-light border-turquoise/40'
                          : 'text-forest bg-forest-light border-forest/20'
                      }`}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-navy leading-snug mb-2 font-display">
                    {pillar.title}
                  </h3>

                  <p className="text-sm font-semibold text-ink-muted mb-4">
                    {pillar.summary}
                  </p>

                  <p className="text-xs text-ink/80 leading-relaxed mb-6">
                    {pillar.narrative}
                  </p>

                  {/* Key Milestones List */}
                  <div className="border-t border-mist/60 pt-4 mb-6">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle mb-3">
                      Verified Progress Highlights
                    </h4>
                    <ul className="space-y-2">
                      {pillar.keyMilestones.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-ink leading-snug">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              pillar.id === 'water' ? 'text-turquoise-dark' : 'text-forest'
                            }`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Contextual AI Trigger */}
                <div className="pt-4 border-t border-mist flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleAsk(pillar.aiPrompt, pillar.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors group cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about this pillar</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <a
                    href="#targets"
                    className="text-[11px] text-ink-subtle hover:text-ink font-medium"
                  >
                    View target data
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
