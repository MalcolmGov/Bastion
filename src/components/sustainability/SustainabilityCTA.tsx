'use client';

import React from 'react';
import {
  Sparkles,
  Download,
  FileText,
  ArrowRight
} from 'lucide-react';

interface SustainabilityCTAProps {
  onAskAI?: (prompt: string, context: string) => void;
}

export const SustainabilityCTA: React.FC<SustainabilityCTAProps> = ({ onAskAI }) => {
  const suggestedQuestions = [
    {
      label: 'Decarbonization Roadmap',
      prompt: 'What is Gold Fields\' plan to achieve a 30% net emissions reduction by 2030 and Net Zero by 2050?'
    },
    {
      label: 'Salares Norte Dry Stack',
      prompt: 'How does dry stack tailings at Salares Norte conserve water and mitigate seismic hazards in Chile?'
    },
    {
      label: 'Agnew vs Khanyisa',
      prompt: 'Compare the Agnew renewable hybrid microgrid in Australia with the Khanyisa 50MW solar plant at South Deep.'
    },
    {
      label: 'Water Recycling Performance',
      prompt: 'How much water does Gold Fields recycle, and what is the progress toward the 80% 2030 water target?'
    }
  ];

  const handleTrigger = (prompt: string) => {
    if (onAskAI) {
      onAskAI(prompt, 'Sustainability Commitments');
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context: 'Sustainability Commitments',
          },
        })
      );
    }
  };

  const reports = [
    {
      title: '2024 Climate Change & Environment Report',
      format: 'PDF (8.5 MB)',
      url: 'https://www.goldfields.com/pdf/investors/integrated-annual-reports/2024/gold-fields-ccr-report-2024.pdf'
    },
    {
      title: '2025 Report to Stakeholders',
      format: 'PDF (5.1 MB)',
      url: 'https://www.goldfields.com/pdf/investors/integrated-annual-reports/2025/gold-fields-report-to-stakeholders-2025.pdf'
    },
    {
      title: 'TSF Conformance & GISTM Disclosures',
      format: 'Interactive Portal',
      url: 'https://www.goldfields.com/our-tsfs.php'
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-turquoise/15 border border-turquoise/40 text-turquoise-bright text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,192,0.2)]">
                <Sparkles className="w-3.5 h-3.5 text-turquoise-bright" />
                <span>Contextual Corporate Intelligence</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Ask AI about sustainability commitments
              </h2>

              <p className="text-sm sm:text-base text-mist/90 leading-relaxed max-w-xl">
                Explore Gold Fields&apos; environmental disclosures, verified metrics, GISTM audit status, and regional community investments using our integrated corporate intelligence assistant.
              </p>

              {/* Main Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleTrigger(
                      'What are Gold Fields\' primary sustainability commitments and how are they tracked against 2030 targets?'
                    )
                  }
                  className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-turquoise via-turquoise-bright to-emerald-400 hover:brightness-110 text-navy-dark font-extrabold text-sm shadow-[0_0_20px_rgba(0,229,192,0.45)] hover:shadow-[0_0_30px_rgba(0,229,192,0.65)] transition-all flex items-center gap-2.5 cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-navy-dark group-hover:rotate-12 transition-transform" />
                  <span>Ask AI about sustainability commitments</span>
                  <ArrowRight className="w-4 h-4 text-navy-dark group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Suggested Query Chips */}
              <div className="pt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-turquoise-bright block mb-3">
                  Or select a specific inquiry:
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrigger(q.prompt)}
                      className="text-xs bg-navy-surface hover:bg-turquoise/15 text-mist hover:text-turquoise-bright px-3.5 py-2 rounded-lg border border-turquoise/25 hover:border-turquoise transition-colors text-left cursor-pointer"
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
                  <span>Verified Publications</span>
                </h3>
                <span className="text-[10px] text-gold-light uppercase tracking-wider font-semibold">
                  Official Suites
                </span>
              </div>

              <div className="space-y-3">
                {reports.map((report, idx) => (
                  <a
                    key={idx}
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-navy/60 hover:bg-navy border border-mist/5 hover:border-gold/30 transition-all flex items-center justify-between group block"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-gold-light transition-colors">
                        {report.title}
                      </h4>
                      <span className="text-[10px] text-mist/60 block mt-0.5">
                        {report.format}
                      </span>
                    </div>
                    <Download className="w-4 h-4 text-mist/60 group-hover:text-gold transition-colors shrink-0 ml-3" />
                  </a>
                ))}
              </div>

              <p className="text-[11px] text-mist/60 leading-relaxed pt-2">
                All sustainability disclosures follow the Global Reporting Initiative (GRI) Standards and the International Council on Mining and Metals (ICMM) Mining Principles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
