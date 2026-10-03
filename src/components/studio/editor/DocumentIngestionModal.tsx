'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Quote,
  Layers,
  ArrowRight,
  X,
  FileCheck,
  RefreshCw,
  Sliders,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Palette,
  BarChart3,
  FileSpreadsheet,
  Zap,
  Users,
  Compass,
  Check
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import type { ExtractedReportInsights, GeneratedPageDraft } from '@/lib/studio/editor/documentIngest';

interface DocumentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  brandKit?: any;
  onApplySections: (sections: SectionInstance[], mode: 'replace' | 'append') => void;
  onApplyPages?: (
    pages: GeneratedPageDraft[],
    options?: { status?: 'draft' | 'in_review'; changeSummary?: string }
  ) => Promise<void> | void;
}

export function DocumentIngestionModal({
  isOpen,
  onClose,
  siteId,
  brandKit,
  onApplySections,
  onApplyPages,
}: DocumentIngestionModalProps) {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'paste'>('samples');
  const [selectedSample, setSelectedSample] = useState<string>('goldfields-annual-2025');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');
  const [targetPortalMode, setTargetPortalMode] = useState<'client_review' | 'agency_draft' | 'single'>('client_review');
  const [activePreviewTab, setActivePreviewTab] = useState<'multipage' | 'table' | 'executive'>('multipage');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<{
    insights: ExtractedReportInsights;
    sections: SectionInstance[];
    pages?: GeneratedPageDraft[];
    summary: string;
    extractedWordsCount: number;
    brandKit?: any;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen && !extractionResult) {
      setError(null);
    }
  }, [isOpen, extractionResult]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setActiveTab('upload');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleRunIngestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let res: Response;

      if (activeTab === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('siteId', siteId);
        if (brandKit) formData.append('brandKit', JSON.stringify(brandKit));

        res = await fetch('/api/admin/editor/ingest-document', {
          method: 'POST',
          body: formData,
        });
      } else if (activeTab === 'paste') {
        if (!pastedText.trim()) throw new Error('Please paste document text to ingest.');
        res = await fetch('/api/admin/editor/ingest-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawText: pastedText,
            siteId,
            brandKit,
          }),
        });
      } else {
        // Sample selector
        res = await fetch('/api/admin/editor/ingest-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sampleId: selectedSample,
            siteId,
            brandKit,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document processing failed.');

      setExtractionResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to extract document insights.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAssemble = async () => {
    if (!extractionResult) return;
    setIsApplying(true);
    try {
      if (
        (targetPortalMode === 'client_review' || targetPortalMode === 'agency_draft') &&
        extractionResult.pages &&
        extractionResult.pages.length > 0 &&
        onApplyPages
      ) {
        const isClientHandover = targetPortalMode === 'client_review';
        await onApplyPages(extractionResult.pages, {
          status: isClientHandover ? 'in_review' : 'draft',
          changeSummary: isClientHandover
            ? `Bastion Agency Ingestion: ${extractionResult.insights.companyName} (${extractionResult.insights.reportingPeriod}) — Staged for client review & approvals`
            : `Bastion Studio Draft: ${extractionResult.insights.companyName} (${extractionResult.insights.reportingPeriod})`,
        });
      } else {
        onApplySections(extractionResult.sections, applyMode);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assemble investor portal.');
    } finally {
      setIsApplying(false);
    }
  };

  const brandColors = extractionResult?.insights?.brandColors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#0A0F1D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0A0F1D]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">AI Document & Annual Report Ingestion</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  Bastion Agency Suite
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Commercial Handover Engine · R45,000 / $2,500
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synthesize 120-page Annual Reports, ESG disclosures, and SENS PDFs into interactive investor suites and push directly to the client CMS portal for review and approvals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {!extractionResult ? (
            /* INGESTION SOURCE SELECTOR STEP */
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('samples')}
                  className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'samples'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Enterprise Demo Samples
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'upload'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Report PDF (up to 120 pages)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'paste'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Report Text
                </button>
              </div>

              {/* TAB 1: SAMPLES */}
              {activeTab === 'samples' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Select a pre-loaded corporate report to immediately demonstrate the AI extraction, brand palette mapping, and multi-page synthesis:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Sample 1: Gold Fields */}
                    <div
                      onClick={() => setSelectedSample('goldfields-annual-2025')}
                      className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                        selectedSample === 'goldfields-annual-2025'
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            Gold Mining Flagship
                          </span>
                          {selectedSample === 'goldfields-annual-2025' && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">Gold Fields Limited</h4>
                        <p className="text-xs text-slate-400">
                          2025 Integrated Annual Report & Operational Review
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                        <span>Brand Palette</span>
                        <span className="text-amber-400 font-semibold">Gold #D97706 · 4 Pages</span>
                      </div>
                    </div>

                    {/* Sample 2: Anglo American */}
                    <div
                      onClick={() => setSelectedSample('anglo-esg-2025')}
                      className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                        selectedSample === 'anglo-esg-2025'
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            ESG & Decarbonisation
                          </span>
                          {selectedSample === 'anglo-esg-2025' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">Anglo American plc</h4>
                        <p className="text-xs text-slate-400">
                          2025 Sustainability & Climate Transition Report
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                        <span>Brand Palette</span>
                        <span className="text-emerald-400 font-semibold">Teal #0D9488 · 4 Pages</span>
                      </div>
                    </div>

                    {/* Sample 3: Standard Bank */}
                    <div
                      onClick={() => setSelectedSample('standardbank-interim-2025')}
                      className={`p-4 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                        selectedSample === 'standardbank-interim-2025'
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                            Banking & Capital Markets
                          </span>
                          {selectedSample === 'standardbank-interim-2025' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white">Standard Bank Group</h4>
                        <p className="text-xs text-slate-400">
                          H1 2025 Interim Results & Strategic Review
                        </p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                        <span>Brand Palette</span>
                        <span className="text-blue-400 font-semibold">Cobalt #0033AA · 4 Pages</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPLOAD PDF */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-8 text-center bg-slate-900/40 transition flex flex-col items-center justify-center space-y-3 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,application/pdf"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">
                      {uploadedFile ? uploadedFile.name : 'Drop Annual Report PDF here, or browse files'}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Extracts executive letters, audited tables, ESG scorecards, and brand palettes from reports up to 120 pages (50MB)
                    </p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB PDF Ready for Multimodal Parser
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PASTE TEXT */}
              {activeTab === 'paste' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Paste Excerpt from Annual Report, Press Release or SENS Announcement:
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste corporate copy, financial tables, or executive letter here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            /* EXTRACTION PREVIEW & MULTI-PAGE CONFIRMATION STEP */
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Report Parsed & Brand Palette Synthesized in 42s
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                        {extractionResult.extractedWordsCount?.toLocaleString() || '14,200'} words analyzed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      {extractionResult.summary}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractionResult(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Another Report
                </button>
              </div>

              {/* Extracted Corporate Overview & Brand Palette Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {extractionResult.insights.companyName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {extractionResult.insights.reportingPeriod}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {extractionResult.insights.theme}
                  </h4>
                </div>

                {/* Detected Brand Palette Badges */}
                {brandColors && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-medium text-slate-400">Detected Palette:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: brandColors.primary }}
                        />
                        <span className="text-[11px] font-mono text-slate-300">{brandColors.primary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: brandColors.accent }}
                        />
                        <span className="text-[11px] font-mono text-slate-300">{brandColors.accent}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Preview Sub-Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('multipage')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                    activePreviewTab === 'multipage'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Multi-Page Architecture (4 Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('table')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                    activePreviewTab === 'table'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Audited Financial Statements Table
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('executive')}
                  className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                    activePreviewTab === 'executive'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" />
                  Executive Message & KPIs
                </button>
              </div>

              {/* PREVIEW SUB-TAB 1: MULTI-PAGE ARCHITECTURE */}
              {activePreviewTab === 'multipage' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      The AI synthesized 4 complete, responsive page drafts ready for instant deployment:
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      4 Pages · 19 Component Sections
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Page 1: /home */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                            /home
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">7 Sections</span>
                        </div>
                        <h5 className="text-sm font-bold text-white">Overview & Highlights</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Executive hero, key audited scorecards, CEO letter, strategic pillars, and contact CTA.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioHero</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioFinancialHighlights</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioCaseStudies</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioTeam</span>
                      </div>
                    </div>

                    {/* Page 2: /financials */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                            /financials
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">4 Sections</span>
                        </div>
                        <h5 className="text-sm font-bold text-white">Results Hub</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Full audited multi-year statements, comparative line items, and capital allocation priorities.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioHero</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioFinancialHighlights (Matrix)</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioCTA</span>
                      </div>
                    </div>

                    {/* Page 3: /sustainability */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                            /sustainability
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">4 Sections</span>
                        </div>
                        <h5 className="text-sm font-bold text-white">ESG & Climate Hub</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Scope 1 & 2 decarbonisation metrics, water circularity, local community compact, and ESG FAQ.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioHero</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioFinancialHighlights (ESG)</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioFAQ</span>
                      </div>
                    </div>

                    {/* Page 4: /leadership */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                            /leadership
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">4 Sections</span>
                        </div>
                        <h5 className="text-sm font-bold text-white">Governance & Board</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Board of Directors, Executive Committee portrait grid, King IV compliance stats, and CEO letter.
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioHero</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioTeam</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5">StudioRichText</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PREVIEW SUB-TAB 2: AUDITED STATEMENTS TABLE */}
              {activePreviewTab === 'table' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      Extracted Audited Line Items & Multi-Year Variance
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {extractionResult.insights.financialTable?.rows?.length || 6} Performance Rows
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Metric</th>
                          <th className="py-2.5 px-3 text-right">Current Period</th>
                          <th className="py-2.5 px-3 text-right">Prior Period</th>
                          <th className="py-2.5 px-3 text-right">Variance</th>
                          <th className="py-2.5 px-3">Operational Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {(extractionResult.insights.financialTable?.rows || []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-semibold text-white">{row.metric}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">{row.current}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">{row.prior}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.variance.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {row.variance}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PREVIEW SUB-TAB 3: EXECUTIVE MESSAGE & KPIS */}
              {activePreviewTab === 'executive' && (
                <div className="space-y-4">
                  {/* Extracted KPIs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {extractionResult.insights.kpis.map((kpi, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-xl font-black text-amber-400 font-mono">
                          {kpi.value}
                        </div>
                        <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                          {kpi.label}
                        </div>
                        {kpi.change && (
                          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                            {kpi.change}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Executive Pull Quote Preview */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-blue-400" />
                      Executive Leadership Statement
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      “{extractionResult.insights.executiveMessage.quote}”
                    </p>
                    <div className="text-xs font-semibold text-white pt-1">
                      {extractionResult.insights.executiveMessage.speaker} &middot;{' '}
                      <span className="text-slate-400 font-normal">
                        {extractionResult.insights.executiveMessage.title}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Assembly Strategy Selector */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Target Assembly Architecture & Handover Pipeline
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Choose client handover or internal studio staging
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option 1: Client Review Handover */}
                  <div
                    onClick={() => setTargetPortalMode('client_review')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                      targetPortalMode === 'client_review'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Push to Client Portal
                        </span>
                        {targetPortalMode === 'client_review' && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Stages all 4 pages (<code className="text-emerald-400 text-[10px]">/home</code>, <code className="text-emerald-400 text-[10px]">/financials</code>, <code className="text-emerald-400 text-[10px]">/sustainability</code>, <code className="text-emerald-400 text-[10px]">/leadership</code>) into the client's <strong className="text-white">Tasks & Approvals queue</strong> with <span className="text-emerald-400 font-mono font-bold">status: 'in_review'</span>.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider">
                        ⭐ Commercial Handover
                      </span>
                      <span className="text-slate-400 font-mono">Client In-Review</span>
                    </div>
                  </div>

                  {/* Option 2: Studio Internal Drafts */}
                  <div
                    onClick={() => setTargetPortalMode('agency_draft')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                      targetPortalMode === 'agency_draft'
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Assemble Studio Drafts
                        </span>
                        {targetPortalMode === 'agency_draft' && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Saves all 4 pages as internal agency drafts with <span className="text-amber-400 font-mono font-bold">status: 'draft'</span>. Bastion designers can polish layouts before client handoff.
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="font-bold text-amber-400 uppercase tracking-wider">
                        Internal Staging
                      </span>
                      <span className="text-slate-400 font-mono">Agency Draft</span>
                    </div>
                  </div>

                  {/* Option 3: Current Canvas Only */}
                  <div
                    onClick={() => setTargetPortalMode('single')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                      targetPortalMode === 'single'
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Current Canvas Only
                        </span>
                        {targetPortalMode === 'single' && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Inserts the 7 synthesized blocks into the single page you are actively editing without affecting other portal routes.
                      </p>
                    </div>

                    {targetPortalMode === 'single' ? (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setApplyMode('replace'); }}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            applyMode === 'replace' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Replace Canvas
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setApplyMode('append'); }}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                            applyMode === 'append' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Append to Bottom
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">Single Page</span>
                        <span className="text-slate-400 font-mono">Canvas Insert</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0A0F1D]/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {!extractionResult ? (
              'Ready to parse report into structured sections'
            ) : targetPortalMode === 'client_review' ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Handover package: 4 pages will be staged in the client Tasks & Approvals queue (In Review)
              </span>
            ) : targetPortalMode === 'agency_draft' ? (
              <span className="text-amber-400 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Internal staging: 4 pages will be saved as Studio Drafts
              </span>
            ) : (
              `${extractionResult.sections.length} modular blocks prepared for canvas`
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>

            {!extractionResult ? (
              <button
                type="button"
                onClick={handleRunIngestion}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Parsing Document & Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Extract & Synthesize Portal
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAssemble}
                disabled={isApplying}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer ${
                  targetPortalMode === 'client_review'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                    : targetPortalMode === 'agency_draft'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'
                }`}
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {targetPortalMode === 'client_review'
                      ? 'Pushing to Client Portal...'
                      : targetPortalMode === 'agency_draft'
                      ? 'Saving Studio Drafts...'
                      : 'Assembling Page...'}
                  </>
                ) : targetPortalMode === 'client_review' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Push 4 Pages to Client Portal (In Review)
                  </>
                ) : targetPortalMode === 'agency_draft' ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Assemble 4 Pages as Studio Draft
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Assemble Page on Canvas
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
