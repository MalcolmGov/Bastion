'use client';

import React from 'react';
import { Sparkles, MessageSquare, Share2 } from 'lucide-react';
import { Operation } from '@/lib/types';

interface OperationActionButtonsProps {
  operation: Operation;
}

export const OperationActionButtons: React.FC<OperationActionButtonsProps> = ({ operation }) => {
  const handleAskAI = (prompt: string, context?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt,
            context: context || `${operation.name} (${operation.country})`,
          },
        })
      );
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: `${operation.name} | Gold Fields Operations`,
          text: `Explore ${operation.name} in ${operation.country} - Gold Fields global mining portfolio.`,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Operation link copied to clipboard!');
      }
    }
  };

  const defaultPrompt = `Tell me about ${operation.name} in ${operation.country}: attributable production (${operation.attributableProductionH1_2026}), mining methods, geology, and key ESG initiatives.`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Primary Ask AI Trigger Button */}
      <button
        onClick={() => handleAskAI(defaultPrompt)}
        className="px-5 py-3 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card hover:shadow-elevated transition-all flex items-center gap-2 group cursor-pointer"
        title={`Ask Gold Fields Assistant about ${operation.name}`}
      >
        <Sparkles className="w-4 h-4 text-navy-dark group-hover:rotate-12 transition-transform" />
        <span>Ask about this operation</span>
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
        title="Share this operation"
      >
        <Share2 className="w-3.5 h-3.5 text-mist" />
        <span className="hidden sm:inline">Share</span>
      </button>
    </div>
  );
};

export const OperationQuestionsBox: React.FC<{ operation: Operation }> = ({ operation }) => {
  const handleAsk = (query: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-assistant', {
          detail: {
            prompt: query,
            context: `${operation.name} Profile`,
          },
        })
      );
    }
  };

  const sampleQuestions = [
    `What was ${operation.name}'s attributable production in H1 2026?`,
    `What mining method and processing flowsheets are used at ${operation.name}?`,
    `What renewable energy or decarbonization initiatives operate at ${operation.name}?`,
    `What host community investments and trusts exist around ${operation.name}?`,
  ];

  return (
    <div className="bg-gradient-to-br from-navy to-navy-surface rounded-2xl p-6 sm:p-8 text-white space-y-5 border border-mist/20 shadow-elevated">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gold/20 text-gold border border-gold/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base sm:text-lg font-bold text-white">
            Ask AI about {operation.name}
          </h4>
          <p className="text-xs text-mist/70">
            Click any question below or launch the Ask Gold Fields assistant for verified disclosures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {sampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleAsk(q)}
            className="p-3 rounded-xl bg-navy-dark/60 hover:bg-gold hover:text-navy-dark text-mist text-left text-xs border border-mist/10 transition-all flex items-start gap-2.5 group cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gold group-hover:text-navy-dark shrink-0 mt-0.5" />
            <span className="leading-snug">&ldquo;{q}&rdquo;</span>
          </button>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-mist/10 text-xs text-mist/60">
        <span>Verified against official H1 2026 financial and sustainability reports.</span>
        <button
          onClick={() =>
            handleAsk(
              `Provide a complete operational and ESG executive summary for ${operation.name}.`
            )
          }
          className="text-gold hover:text-gold-light font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Ask Custom Question</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
};
