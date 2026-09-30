'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, FileCode, Sparkles, Layers } from 'lucide-react';

interface CodeDiffViewerProps {
  filePath: string;
  startLine: number;
  endLine: number;
  originalCode: string;
  replacementCode: string;
  explanation?: string;
  confidence?: 'high' | 'medium' | 'low';
  riskLevel?: 'low' | 'medium' | 'high';
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  filePath,
  startLine,
  endLine,
  originalCode,
  replacementCode,
  explanation,
  confidence = 'high',
  riskLevel = 'low'
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  const origLines = (originalCode || '').split('\n');
  const replLines = (replacementCode || '').split('\n');

  return (
    <div className="space-y-4">
      {/* File & View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0E1522] border border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center space-x-2">
          <FileCode className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
            {filePath}
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            Lines {startLine}–{endLine}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg bg-slate-200/80 dark:bg-slate-800 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-[#152030] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-[#152030] text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unified Diff
            </button>
          </div>
        </div>
      </div>

      {/* Diff Presentation */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original Code */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/30 dark:bg-[#0e0406]/60 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-rose-100/50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Original Code</span>
              </span>
              <span className="text-[10px] font-mono text-rose-600/80 dark:text-rose-400/80">-{origLines.length} lines</span>
            </div>
            <pre className="p-4 text-xs font-mono text-rose-900 dark:text-rose-300 leading-relaxed overflow-x-auto max-h-[360px] divide-y divide-rose-100/40 dark:divide-rose-950/40">
              {origLines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-rose-100/30 dark:hover:bg-rose-950/30 px-1 py-0.5 rounded">
                  <span className="text-slate-400 select-none w-10 text-right pr-3 font-mono text-[11px] shrink-0">
                    {startLine + idx}
                  </span>
                  <span className="text-rose-500 select-none mr-2 font-bold">-</span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* AI Refactored Code */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-[#040d0e]/60 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 bg-emerald-100/50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Remediated Patch</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600/80 dark:text-emerald-400/80">+{replLines.length} lines</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-900 dark:text-emerald-300 leading-relaxed overflow-x-auto max-h-[360px] divide-y divide-emerald-100/40 dark:divide-emerald-950/40">
              {replLines.map((line, idx) => (
                <div key={idx} className="flex hover:bg-emerald-100/30 dark:hover:bg-emerald-950/30 px-1 py-0.5 rounded">
                  <span className="text-slate-400 select-none w-10 text-right pr-3 font-mono text-[11px] shrink-0">
                    {startLine + idx}
                  </span>
                  <span className="text-emerald-500 select-none mr-2 font-bold">+</span>
                  <span className="whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-900 text-slate-100 overflow-hidden text-xs font-mono">
          <div className="p-3 bg-slate-800/80 border-b border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Unified Diff Preview</span>
            <span>@@ -{startLine},{origLines.length} +{startLine},{replLines.length} @@</span>
          </div>
          <div className="p-4 overflow-x-auto max-h-[360px] space-y-0.5">
            {origLines.map((line, idx) => (
              <div key={`orig-${idx}`} className="flex bg-rose-950/40 text-rose-300 px-2 py-0.5 rounded">
                <span className="text-rose-500/60 select-none w-8 text-right pr-3 shrink-0">{startLine + idx}</span>
                <span className="text-rose-400 select-none mr-2 font-bold">-</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
            {replLines.map((line, idx) => (
              <div key={`repl-${idx}`} className="flex bg-emerald-950/40 text-emerald-300 px-2 py-0.5 rounded">
                <span className="text-emerald-500/60 select-none w-8 text-right pr-3 shrink-0">{startLine + idx}</span>
                <span className="text-emerald-400 select-none mr-2 font-bold">+</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Explanation & Assessment Strip */}
      {explanation && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B1019] border border-slate-200/80 dark:border-[#1C2638] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">AI Patch Rationale: </span>
              <span className="text-slate-600 dark:text-slate-300">{explanation}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Confidence: {confidence}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                riskLevel === 'high'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                  : riskLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300'
              }`}
            >
              Risk: {riskLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
