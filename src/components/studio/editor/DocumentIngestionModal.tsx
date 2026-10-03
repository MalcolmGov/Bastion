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
  HelpCircle
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import type { ExtractedReportInsights } from '@/lib/studio/editor/documentIngest';

interface DocumentIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  brandKit?: any;
  onApplySections: (sections: SectionInstance[], mode: 'replace' | 'append') => void;
}

export function DocumentIngestionModal({
  isOpen,
  onClose,
  siteId,
  brandKit,
  onApplySections,
}: DocumentIngestionModalProps) {
  const [activeTab, setActiveTab] = useState<'samples' | 'upload' | 'paste'>('samples');
  const [selectedSample, setSelectedSample] = useState<string>('goldfields-annual-2025');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<{
    insights: ExtractedReportInsights;
    sections: SectionInstance[];
    summary: string;
    extractedWordsCount: number;
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

  const handleConfirmAssemble = () => {
    if (!extractionResult) return;
    onApplySections(extractionResult.sections, applyMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">AI Document & Report Ingestion</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  Instant Web Generator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform Annual Reports, ESG disclosures, and SENS PDFs into interactive, brand-aligned web layouts in seconds.
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
                  Upload Report PDF
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
                    Select a pre-loaded corporate report to immediately demonstrate the AI extraction and synthesis capabilities:
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
                        <span>4 Key Metrics</span>
                        <span className="text-amber-400 font-semibold">2.30Moz · $920M FCF</span>
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
                        <span>Scope 1 & 2 Targets</span>
                        <span className="text-emerald-400 font-semibold">-38% GHG · R18.4B</span>
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
                        <span>Financial Highlights</span>
                        <span className="text-blue-400 font-semibold">R22.4B Earnings · 18.8% ROE</span>
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
                      Supports Integrated Annual Reports, Sustainability Disclosures & Results Circulars up to 50MB
                    </p>
                  </div>
                  {uploadedFile && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB PDF Ready for Ingestion
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
            /* EXTRACTION PREVIEW & CONFIRMATION STEP */
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Report Ingestion Completed Successfully
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
                  Try Different Document
                </button>
              </div>

              {/* Extracted Corporate Overview Card */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {extractionResult.insights.companyName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {extractionResult.insights.reportingPeriod}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {extractionResult.insights.theme}
                </h4>
              </div>

              {/* Extracted KPIs Grid */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  Extracted Financial & Operational KPIs (4 Cards Generated)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {extractionResult.insights.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-lg font-black text-amber-400 font-mono">
                        {kpi.value}
                      </div>
                      <div className="text-xs font-medium text-slate-200 mt-0.5 truncate">
                        {kpi.label}
                      </div>
                      {kpi.change && (
                        <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                          {kpi.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Executive Pull Quote Preview */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-blue-400" />
                  Executive Leadership Statement
                </div>
                <p className="text-xs text-slate-300 italic">
                  “{extractionResult.insights.executiveMessage.quote}”
                </p>
                <div className="text-xs font-semibold text-white">
                  {extractionResult.insights.executiveMessage.speaker} &middot;{' '}
                  <span className="text-slate-400 font-normal">
                    {extractionResult.insights.executiveMessage.title}
                  </span>
                </div>
              </div>

              {/* Synthesis Layout Mode Options */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white">Page Insertion Strategy</div>
                  <div className="text-xs text-slate-400">
                    Choose how to apply the 5 synthesized sections to your live canvas:
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyMode('replace')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      applyMode === 'replace'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Replace Entire Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyMode('append')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      applyMode === 'append'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Append to Bottom
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {!extractionResult
              ? 'Ready to parse report into structured sections'
              : `${extractionResult.sections.length} modular blocks prepared for canvas`}
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
                    Extract & Synthesize Page
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmAssemble}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Assemble Page on Canvas
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
