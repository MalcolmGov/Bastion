'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LeadershipGovernanceSectionProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const LeadershipGovernanceSection: React.FC<LeadershipGovernanceSectionProps> = ({ onAskAI }) => {
  const [activeTab, setActiveTab] = useState<'exco' | 'board'>('exco');

  const excoMembers = [
    {
      name: 'Mike Fraser',
      role: 'Chief Executive Officer & Executive Director',
      location: 'Johannesburg, South Africa',
      background:
        'Appointed CEO on 1 January 2024. Over 25 years of global mining leadership experience, previously serving as COO at South32 with responsibility for global alumina, aluminium, bauxite, and energy operations across Australia, southern Africa, and South America.',
      tag: 'Executive Leadership'
    },
    {
      name: 'Alex Dall',
      role: 'Chief Financial Officer & Executive Director',
      location: 'Johannesburg, South Africa',
      background:
        'Oversees group financial reporting, capital allocation, treasury, investor relations, tax strategy, and balance sheet risk management across Gold Fields’ international jurisdictions.',
      tag: 'Finance & Treasury'
    },
    {
      name: 'Francois Swanepoel',
      role: 'Chief Operating Officer',
      location: 'Global Operations',
      background:
        'Leads group operational performance, health and safety, mechanization, production planning, and cost discipline across our nine tier-1 and quality mining operations.',
      tag: 'Operations'
    },
    {
      name: 'Jason Sander',
      role: 'Acting Chief Technical Officer',
      location: 'Technical Services',
      background:
        'Directs global mining technical standards, geotechnical engineering, processing plant metallurgy, reserve estimation, and Tailings Storage Facility (TSF) governance.',
      tag: 'Technical & Engineering'
    },
    {
      name: 'Kelly Carter',
      role: 'Executive Vice President: Legal and Governance',
      location: 'Perth, Australia / Sandton',
      background:
        'Manages group legal affairs, corporate compliance, ethics charter, King IV governance alignment, and company secretarial functions globally.',
      tag: 'Legal & Governance'
    },
    {
      name: 'Chris Gratias',
      role: 'Executive Vice President: Strategy and Corporate Development',
      location: 'Global Strategy',
      background:
        'Leads long-term portfolio optimization, mergers and acquisitions, divestments, and strategic joint venture partnerships including Windfall (Canada) and Gruyere (Australia).',
      tag: 'Strategy & M&A'
    },
    {
      name: 'Jongisa Magagula',
      role: 'Executive Vice President: External Affairs',
      location: 'Johannesburg, South Africa',
      background:
        'Responsible for global government relations, investor communications, public policy, host community shared value, and corporate brand management.',
      tag: 'External Affairs'
    },
    {
      name: 'Mariette Steyn',
      role: 'Executive Vice President: People and Sustainability',
      location: 'Johannesburg, South Africa',
      background:
        'Leads human resources, diversity and inclusion, health, safety, environmental stewardship, decarbonization execution, and ESG disclosures.',
      tag: 'People & Sustainability'
    },
    {
      name: 'Benford Mokoatle',
      role: 'Executive Vice President: South Africa',
      location: 'Westonaria, South Africa',
      background:
        'Leads the South Deep mechanized underground operation, organized labour relations (securing the 5-year wage agreement through 2031), and the 50MW Khanyisa solar plant.',
      tag: 'Regional Leadership'
    }
  ];

  const boardMembers = [
    {
      name: 'John MacKenzie',
      role: 'Non-Executive Chairperson of the Board',
      details:
        'Appointed as Chair of the Board and Chair of the Nomination and Governance Committee in May 2026. Highly experienced global mining executive with deep international corporate governance expertise.',
      committee: 'Nomination & Governance (Chair)'
    },
    {
      name: 'Jacqueline E. McGill',
      role: 'Lead Independent Non-Executive Director',
      details:
        'Over 30 years in the mining and resource sector. Serves as Lead Independent Director and chairs the Remuneration Committee, ensuring executive performance alignment with long-term shareholder value.',
      committee: 'Remuneration Committee (Chair)'
    },
    {
      name: 'Michael Rawlinson',
      role: 'Independent Non-Executive Director',
      details:
        'Appointed August 2025. Extensive international investment banking, corporate finance, and natural resources background, bringing strong financial oversight to the Board.',
      committee: 'Audit • Remuneration • Strategy & Investment'
    },
    {
      name: 'Cristina Bitar',
      role: 'Independent Non-Executive Director',
      details:
        'Senior advisor with extensive Latin American public policy, governance, and stakeholder relations background. Contributes strategic perspective on Americas operations.',
      committee: 'SHSD • Strategy & Investment • Nomination'
    },
    {
      name: 'Mike Fraser',
      role: 'Chief Executive Officer & Executive Director',
      details:
        'Executive Director representing the executive leadership team on the Board, steering group strategy and daily operational execution.',
      committee: 'Executive Director'
    },
    {
      name: 'Alex Dall',
      role: 'Chief Financial Officer & Executive Director',
      details:
        'Executive Director presenting financial statements, treasury risk evaluations, and capital allocation frameworks directly to the Board.',
      committee: 'Executive Director'
    }
  ];

  const boardCommittees = [
    {
      name: 'Audit Committee',
      scope: 'Financial reporting integrity, internal controls, external audit independence, and risk management systems.'
    },
    {
      name: 'Remuneration Committee',
      scope: 'Executive remuneration benchmarking, STI/LTI performance criteria, and fair wage structures.'
    },
    {
      name: 'Safety, Health & Sustainable Development (SHSD)',
      scope: 'Zero harm progress, GISTM tailings safety assurance, decarbonization roadmap, and water security.'
    },
    {
      name: 'Nomination & Governance Committee',
      scope: 'Board composition, director independence, succession planning, and King IV corporate governance.'
    },
    {
      name: 'Strategy & Investment Committee',
      scope: 'Evaluating major capital expenditure projects, exploration allocations, M&A transactions, and joint ventures.'
    }
  ];

  const handleAsk = (query?: string) => {
    const prompt =
      query ||
      "Who leads Gold Fields? Explain the roles of the Board of Directors, CEO Mike Fraser, and the Executive Committee structure.";
    const context = "Leadership & Governance Structure";

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
    <section id="leadership" className="py-20 bg-white border-b border-mist scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-navy mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-navy" />
              <span>Corporate Governance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
              Leadership &amp; Governance
            </h2>
            <p className="mt-3 text-base text-ink-muted leading-relaxed">
              Gold Fields is governed by an independent Board of Directors and steered by an experienced Executive Committee committed to ethical leadership, King IV compliance, and sustainable value creation.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 bg-editorial p-1.5 rounded-xl border border-mist self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('exco')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'exco'
                  ? 'bg-navy text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Executive Committee ({excoMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'board'
                  ? 'bg-navy text-white shadow-subtle'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Board of Directors ({boardMembers.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Executive Committee */}
        {activeTab === 'exco' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {excoMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-editorial/60 rounded-2xl border border-mist p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-navy bg-white px-2 py-0.5 rounded border border-mist">
                        {member.tag}
                      </span>
                      <span className="text-[10px] text-ink-subtle">
                        {member.location}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-navy font-display">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold text-gold-dark mt-0.5 mb-3">
                      {member.role}
                    </p>

                    <p className="text-xs text-ink/80 leading-relaxed">
                      {member.background}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-mist/80 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleAsk(`Tell me about ${member.name}, ${member.role} at Gold Fields.`)}
                      className="text-navy font-bold hover:text-gold-dark inline-flex items-center gap-1 group cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-gold" />
                      <span>Ask AI about {member.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Board of Directors */}
        {activeTab === 'board' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-editorial/60 rounded-2xl border border-mist p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark bg-gold-light/40 px-2 py-0.5 rounded border border-gold-mineral/30">
                        Board Member
                      </span>
                      <span className="text-[10px] text-ink-subtle">
                        Gold Fields Ltd
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-navy font-display">
                      {member.name}
                    </h3>
                    <p className="text-xs font-bold text-navy mt-0.5 mb-3">
                      {member.role}
                    </p>

                    <p className="text-xs text-ink/80 leading-relaxed mb-4">
                      {member.details}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-mist/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle block">
                      Committee Mandate
                    </span>
                    <span className="text-xs font-semibold text-navy">
                      {member.committee}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Board Committees Overview */}
            <div className="bg-editorial rounded-2xl border border-mist p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-4">
                Five Standing Board Committees
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {boardCommittees.map((comm, cIdx) => (
                  <div key={cIdx} className="bg-white p-4 rounded-xl border border-mist/80 shadow-xs">
                    <h4 className="text-sm font-bold text-navy mb-1">{comm.name}</h4>
                    <p className="text-xs text-ink-muted leading-relaxed">{comm.scope}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Governance CTA Trigger */}
        <div className="mt-12 p-6 rounded-2xl bg-navy/5 border border-navy/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-navy text-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy">Have questions about Gold Fields leadership?</h4>
              <p className="text-xs text-ink-muted">Ask our AI assistant about board committees, executive track records, or corporate governance charters.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAsk()}
            className="px-4 py-2.5 rounded-lg bg-navy hover:bg-navy-light text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>Ask AI about leadership</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
