'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Wand2,
  FileCheck,
  Scale,
  Leaf,
  Lock,
  ArrowRight,
  ExternalLink,
  X
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import {
  auditCanvasCompliance,
  applyComplianceRemedy,
  applyAllComplianceRemedies,
  type ComplianceAuditReport,
  type ComplianceIssue,
  type ComplianceCategory,
} from '@/lib/studio/editor/complianceGuardian';

interface ComplianceGuardianPanelProps {
  sections: SectionInstance[];
  siteId: string;
  pageSlug: string;
  onRemediate: (updatedSections: SectionInstance[], message: string) => void;
  onClose?: () => void;
}

export function ComplianceGuardianPanel({
  sections,
  siteId,
  pageSlug,
  onRemediate,
  onClose,
}: ComplianceGuardianPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<ComplianceCategory | 'all'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  // Run real-time audit across canvas
  const report: ComplianceAuditReport = useMemo(() => {
    return auditCanvasCompliance(sections, { siteId, pageSlug });
  }, [sections, siteId, pageSlug]);

  const filteredIssues = useMemo(() => {
    if (selectedCategory === 'all') return report.issues;
    return report.issues.filter((i) => i.category === selectedCategory);
  }, [report.issues, selectedCategory]);

  const handleRemediateSingle = (issue: ComplianceIssue) => {
    setRemediatingId(issue.id);
    const updated = applyComplianceRemedy(sections, issue.remedyPatch);
    onRemediate(
      updated,
      `Remediated ${issue.ruleTitle} on ${issue.sectionTitle}`
    );
    setTimeout(() => setRemediatingId(null), 400);
  };

  const handleRemediateAll = () => {
    setIsScanning(true);
    const updated = applyAllComplianceRemedies(sections, report.issues);
    onRemediate(
      updated,
      `Successfully resolved all ${report.issues.length} compliance findings across canvas.`
    );
    setTimeout(() => setIsScanning(false), 500);
  };

  const scoreColor =
    report.score >= 90
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : report.score >= 75
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const categoryCounts = {
    all: report.issues.length,
    jse_regulatory: report.issues.filter((i) => i.category === 'jse_regulatory').length,
    esg_greenwashing: report.issues.filter((i) => i.category === 'esg_greenwashing').length,
    popia_privacy: report.issues.filter((i) => i.category === 'popia_privacy').length,
    brand_integrity: report.issues.filter((i) => i.category === 'brand_integrity').length,
  };

  return (
    <div className="h-full flex flex-col bg-[#070B12] text-slate-200 border-l border-white/10 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0B132B]/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Compliance Guardian
              </h3>
              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded uppercase">
                JSE &bull; King IV
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time regulatory &amp; greenwashing auditor
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Audit Score & Summary Card */}
      <div className="p-4 border-b border-white/10 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-xl border font-mono font-black text-lg ${scoreColor}`}>
              {report.score}/100
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                Grade {report.grade} &bull;{' '}
                {report.status === 'clean'
                  ? 'Audit Ready'
                  : report.status === 'advisories'
                  ? 'Advisories Present'
                  : 'Action Required'}
              </div>
              <div className="text-[11px] text-slate-400">
                {report.checksRun} regulatory rules evaluated across {sections.length} sections
              </div>
            </div>
          </div>

          {report.issues.length > 0 && (
            <button
              onClick={handleRemediateAll}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Fix All ({report.issues.length})
            </button>
          )}
        </div>

        {/* Status Breakdown Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <span className="font-bold">{report.criticalCount}</span> Critical
          </div>
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <span className="font-bold">{report.warningCount}</span> Warnings
          </div>
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <span className="font-bold">{report.advisoryCount}</span> Advisories
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-4 py-2 border-b border-white/5 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({categoryCounts.all})
        </button>
        <button
          onClick={() => setSelectedCategory('jse_regulatory')}
          className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 flex items-center gap-1 ${
            selectedCategory === 'jse_regulatory'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3 h-3" />
          JSE Rules ({categoryCounts.jse_regulatory})
        </button>
        <button
          onClick={() => setSelectedCategory('esg_greenwashing')}
          className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 flex items-center gap-1 ${
            selectedCategory === 'esg_greenwashing'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Leaf className="w-3 h-3" />
          Greenwashing ({categoryCounts.esg_greenwashing})
        </button>
        <button
          onClick={() => setSelectedCategory('popia_privacy')}
          className={`px-2.5 py-1 rounded-md font-semibold transition shrink-0 flex items-center gap-1 ${
            selectedCategory === 'popia_privacy'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3 h-3" />
          POPIA ({categoryCounts.popia_privacy})
        </button>
      </div>

      {/* Issues List or Clean State */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredIssues.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">All Clear &bull; 100% Compliant</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                No forward-looking guarantees, unverified greenwashing claims, or POPIA issues detected on this page.
              </p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Approved for Institutional Release
            </div>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isCritical = issue.severity === 'critical';
            const isWarning = issue.severity === 'warning';

            return (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 transition hover:border-slate-700"
              >
                {/* Header Line */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {issue.sectionTitle}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">
                      {issue.ruleTitle}
                    </h5>
                  </div>

                  <button
                    onClick={() => handleRemediateSingle(issue)}
                    disabled={remediatingId === issue.id}
                    className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3 h-3" />
                    Auto-Remediate
                  </button>
                </div>

                {/* Statutory Reference & Explanation */}
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1 text-[11px]">
                  <div className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {issue.statutoryReference}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {issue.explanation}
                  </p>
                </div>

                {/* Diff Box: Flagged vs Remedy */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] leading-relaxed">
                    <span className="text-[9px] font-bold uppercase text-rose-400 block mb-0.5">
                      Flagged Text:
                    </span>
                    <del className="line-through">{issue.flaggedText}</del>
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px] leading-relaxed">
                    <span className="text-[9px] font-bold uppercase text-emerald-400 block mb-0.5">
                      Compliant Statutory Remedy:
                    </span>
                    <span>{issue.suggestedFix}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
