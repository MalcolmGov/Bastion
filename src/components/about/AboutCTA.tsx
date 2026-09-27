'use client';

import React from 'react';
import {
  Sparkles,
  Download,
  FileText,
  ArrowRight
} from 'lucide-react';

interface AboutCTAProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const AboutCTA: React.FC<AboutCTAProps> = ({ onAskAI }) => {
  const suggestedQueries = [
    {
      label: 'Leadership & ExCo',
      prompt: 'Who is the CEO of Gold Fields, and what is the composition of the Executive Committee and Board?'
    },
    {
      label: '5 Core Values in Action',
      prompt: 'Explain how Gold Fields lives its core values: Safety, Respect, Collaboration, Responsibility, and Integrity.'
    },
    {
      label: 'Capital Allocation Hierarchy',
      prompt: 'How does Gold Fields prioritize cash flow between sustaining capital, dividends, and growth projects?'
    },
    {
      label: '135+ Year Heritage',
      prompt: 'Summarize Gold Fields\' 135+ year history from its 1887 founding in South Africa to its global operations today.'
    }
  ];

  const handleTrigger = (prompt: string) => {
    if (onAskAI) {
      onAskAI(prompt, 'About Gold Fields');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context: 'About Gold Fields',
          },
        })
      );
    }
  };

  const publications = [
    {
      title: '2025 Integrated Annual Report',
      format: 'PDF (14.2 MB)',
      url: 'https://www.goldfields.com/reports/annual-report-2025/index.php'
    },
    {
      title: 'Code of Conduct & Ethics Charter',
      format: 'PDF (2.4 MB)',
      url: 'https://www.goldfields.com/code-of-conduct/index.php'
    },
    {
      title: 'H1 2026 Operational & Financial Booklet',
      format: 'PDF (3.8 MB)',
      url: 'https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf'
    }
  ];

  return (
    <section className="py-20 bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-navy border border-mist/20 rounded-3xl p-8 lg:p-14 shadow-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left AI Interaction Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-light text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Conversational Corporate Knowledge</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Ask AI about Gold Fields leadership, values, or strategy
              </h2>

              <p className="text-sm sm:text-base text-mist/90 leading-relaxed max-w-xl">
                Inquire about our Board of Directors, executive governance, three strategic pillars, or 135+ year corporate evolution.
              </p>

              {/* Main Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleTrigger(
                      'Give me a comprehensive overview of Gold Fields: our leadership team, 5 core values, strategic pillars, and global operations.'
                    )
                  }
                  className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card hover:shadow-elevated transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-navy-dark group-hover:rotate-12 transition-transform" />
                  <span>Ask AI about Gold Fields</span>
                  <ArrowRight className="w-4 h-4 text-navy-dark group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Suggested Query Chips */}
              <div className="pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-mist/60 block mb-3">
                  Or select a specific inquiry:
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedQueries.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrigger(q.prompt)}
                      className="text-xs bg-navy-surface hover:bg-navy-light text-mist/90 hover:text-white px-3.5 py-2 rounded-lg border border-mist/10 transition-colors text-left cursor-pointer"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Download Disclosures */}
            <div className="lg:col-span-5 bg-navy-surface/90 border border-mist/10 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between border-b border-mist/10 pb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold" />
                  <span>Corporate Governance Documents</span>
                </h3>
                <span className="text-[10px] text-gold-light uppercase tracking-wider font-semibold">
                  Official Suites
                </span>
              </div>

              <div className="space-y-3">
                {publications.map((pub, idx) => (
                  <a
                    key={idx}
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-navy/60 hover:bg-navy border border-mist/5 hover:border-gold/30 transition-all flex items-center justify-between group block"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-gold-light transition-colors">
                        {pub.title}
                      </h4>
                      <span className="text-[10px] text-mist/60 block mt-0.5">
                        {pub.format}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-mist/60 group-hover:text-gold transition-colors shrink-0 ml-3" />
                  </a>
                ))}
              </div>

              <p className="text-[11px] text-mist/60 leading-relaxed pt-2">
                Gold Fields complies with the South African King IV Report on Corporate Governance and the Sarbanes-Oxley Act of 2002 requirements applicable to foreign private issuers on the NYSE.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
