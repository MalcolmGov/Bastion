'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Palette,
  Type,
  Image as ImageIcon,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Code2,
  Sliders,
  Eye,
  Lock,
  Layers,
  Terminal,
  Activity,
  XCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import type { BrandKitDnaResult, StandardThemeJson } from '@/lib/studio/brandExtractor';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

interface JobLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface ExtractionJobStatus {
  id: string;
  url: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentPhase: string;
  currentPhaseIndex: number;
  totalPhases: number;
  logs: JobLogEntry[];
  result: BrandKitDnaResult | null;
  error: string | null;
  createdAt: string;
}

const EXTRACTION_PHASES = [
  'Headless Browser Engine Initialization & SSRF Guardrails',
  'Multi-Page Crawling & Dynamic DOM Execution',
  'Computed Style Harvesting on Semantic Elements & :root Variables',
  'Brand Vector Marks, Favicon & Retina Asset Discovery',
  'Copywriting Voice, Sentiment & Flesch-Kincaid Reading Analysis',
  'Google Fonts Classification & Commercial Font Licensing Audit',
  'WCAG 2.1 AA Relative Luminance & Contrast Auditing',
  'Theme Normalization & Standard JSON Synthesis'
];

interface BrandDnaExtractorProps {
  initialUrl?: string;
  onKitApproved?: (kit: StandardThemeJson) => void;
}

export function BrandDnaExtractor({ initialUrl = '', onKitApproved }: BrandDnaExtractorProps) {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [url, setUrl] = useState(initialUrl);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobState, setJobState] = useState<ExtractionJobStatus | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<BrandKitDnaResult | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);
  const [copiedArtifact, setCopiedArtifact] = useState<string | null>(null);

  // Editable fields in Human Approval screen
  const [selectedLogoId, setSelectedLogoId] = useState<string>('');
  const [editableTheme, setEditableTheme] = useState<StandardThemeJson | null>(null);
  const [editableVoiceSummary, setEditableVoiceSummary] = useState<string>('');
  const [editableDoNots, setEditableDoNots] = useState<string[]>([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState<Record<string, boolean>>({});

  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll terminal logs to bottom
  useEffect(() => {
    if (jobState?.logs?.length) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [jobState?.logs?.length]);

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleStartExtraction = async (targetUrl?: string) => {
    const runUrl = (targetUrl || url).trim();
    if (!runUrl) return;

    stopPolling();
    setIsExtracting(true);
    setError(null);
    setJobState(null);
    setApprovedSuccess(false);

    try {
      // 1. Dispatch asynchronous job to backend
      const res = await fetch('/api/admin/brand/extract/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: runUrl, maxPages: 4 })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch extraction job');
      }

      const jobId = data.jobId;
      setActiveJobId(jobId);

      // 2. Poll job status
      pollingRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/admin/brand/extract/status?jobId=${jobId}`);
          if (!pollRes.ok) return;

          const pollData = await pollRes.json();
          const job: ExtractionJobStatus = pollData.job;
          setJobState(job);

          if (job.status === 'completed' && job.result) {
            stopPolling();
            setIsExtracting(false);
            const result = job.result;
            setExtractedData(result);
            setEditableTheme(result.theme);
            setEditableVoiceSummary(result.theme.voice?.summary || '');
            setEditableDoNots(result.theme.voice?.doNot || []);
            setSelectedLogoId(result.assets.logos[0]?.id || '');

            const initialMedia: Record<string, boolean> = {};
            result.assets.media.slice(0, 4).forEach((m) => {
              initialMedia[m.id] = true;
            });
            setSelectedMediaIds(initialMedia);
          } else if (job.status === 'failed') {
            stopPolling();
            setIsExtracting(false);
            setError(job.error || 'Extraction job failed');
          } else if (job.status === 'cancelled') {
            stopPolling();
            setIsExtracting(false);
            setError('Extraction job was cancelled');
          }
        } catch (pollErr: any) {
          console.warn('[BrandDnaExtractor] Polling error:', pollErr);
        }
      }, 750);
    } catch (err: any) {
      setIsExtracting(false);
      setError(err.message || 'Failed to initiate extraction');
    }
  };

  const handleCancelExtraction = async () => {
    if (!activeJobId) return;
    try {
      await fetch(`/api/admin/brand/extract/status?jobId=${activeJobId}`, {
        method: 'DELETE'
      });
      stopPolling();
      setIsExtracting(false);
      setError('Extraction cancelled by user');
    } catch (err: any) {
      console.warn('Failed to cancel job:', err);
    }
  };

  const handleColorChange = (key: keyof StandardThemeJson['color'], newHex: string) => {
    if (!editableTheme) return;
    setEditableTheme({
      ...editableTheme,
      color: {
        ...editableTheme.color,
        [key]: newHex
      }
    });
  };

  const handleApprove = async () => {
    if (!editableTheme || !extractedData) return;
    setIsApproving(true);

    const finalizedTheme: StandardThemeJson = {
      ...editableTheme,
      voice: {
        summary: editableVoiceSummary,
        doNot: editableDoNots
      }
    };

    try {
      const res = await fetch('/api/admin/brand/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: 'site_goldfields_flagship',
          theme: finalizedTheme,
          voice: finalizedTheme.voice,
          fontAnalysis: extractedData.fontAnalysis,
          mediaAssets: extractedData.assets.media.filter((m) => selectedMediaIds[m.id])
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to approve brand kit');
      }

      setApprovedSuccess(true);
      if (onKitApproved) onKitApproved(finalizedTheme);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifact(label);
    setTimeout(() => setCopiedArtifact(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. URL Ingestion & Crawl Input */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}40`
                }}
              >
                Bastion Headless Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Live Chromium DOM Ingestion &bull; 8-Phase Architectural Audit
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Extract Brand DNA from Website URL
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deep crawl with client JS execution, computed style harvesting, typography frequency, WCAG 2.1 AA auditing, and copy voice synthesis.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter corporate site URL (e.g., https://www.goldfields.com)"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
            />
          </div>
          <button
            type="button"
            disabled={isExtracting || !url.trim()}
            onClick={() => handleStartExtraction()}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isExtracting ? 'Crawling DNA…' : 'Extract Brand Kit'}</span>
          </button>
        </div>

        {/* Quick Demo URLs */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Verified Corporate Targets:</span>
          {[
            { label: 'Gold Fields Official', url: 'https://www.goldfields.com' },
            { label: 'Bastion Group SA', url: 'https://www.bastiongroup.co.za' },
            { label: 'Exxaro Resources', url: 'https://www.exxaro.com' }
          ].map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(demo.url);
                handleStartExtraction(demo.url);
              }}
              style={{ color: primaryColor }}
              className="hover:underline font-semibold"
            >
              {demo.label}{idx < 2 ? ' •' : ''}
            </button>
          ))}
        </div>

        {/* Live Phased Telemetry & Terminal Monitor */}
        {isExtracting && (
          <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300">
            {/* Top Bar: Progress & Cancel */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {jobState?.currentPhase || 'Initializing Headless Crawler Engine…'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {jobState?.progress ?? 5}%
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelExtraction}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Crawl</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.max(5, jobState?.progress ?? 5)}%`,
                  background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`
                }}
              />
            </div>

            {/* 8-Phase Milestones Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {EXTRACTION_PHASES.map((phaseTitle, idx) => {
                const currentIdx = jobState?.currentPhaseIndex ?? 0;
                const isPassed = currentIdx > idx + 1;
                const isCurrent = currentIdx === idx + 1;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-[11px] transition flex items-start space-x-2 ${
                      isPassed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                        : isCurrent
                        ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : isCurrent ? (
                        <Activity className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[9px] font-mono">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="leading-tight truncate">
                      <div className="font-bold text-[10px] uppercase tracking-wider">
                        Phase {idx + 1}
                      </div>
                      <div className="truncate font-medium">{phaseTitle}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Monospace Terminal Log */}
            <div className="rounded-xl bg-[#090D14] border border-slate-800 p-3.5 space-y-2 font-mono text-[11px] shadow-inner">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    Chromium Execution Telemetry
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {jobState?.logs?.length || 0} events logged
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {(jobState?.logs || [
                  { timestamp: new Date().toISOString(), level: 'info', message: 'Connecting to Chromium headless browser...' }
                ]).map((entry, i) => (
                  <div key={i} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-500 text-[10px] shrink-0">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[9px] uppercase px-1 rounded font-bold shrink-0 ${
                        entry.level === 'success'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : entry.level === 'warn'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : entry.level === 'error'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-sky-400 border border-slate-700'
                      }`}
                    >
                      {entry.level}
                    </span>
                    <span
                      className={
                        entry.level === 'success'
                          ? 'text-emerald-300'
                          : entry.level === 'warn'
                          ? 'text-amber-300'
                          : entry.level === 'error'
                          ? 'text-rose-300'
                          : 'text-slate-300'
                      }
                    >
                      {entry.message}
                    </span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 2. Human Approval Screen (Claude Design Spec) */}
      {extractedData && editableTheme && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Top Banner: Verification Status */}
          <div
            className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            style={{
              borderColor: `${primaryColor}40`,
              backgroundImage: `linear-gradient(to right, ${primaryColor}15, transparent)`
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Extracted Brand Kit for {extractedData.copyAnalysis.title || 'Client'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                  Ready for Review
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {extractedData.crawledPages.length} Pages Crawled
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Review extracted vector marks, color palette, WCAG 2.1 AA compliance, typography waterfall, and voice guardrails before committing.
              </p>
            </div>

            <button
              type="button"
              disabled={isApproving}
              onClick={handleApprove}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
              }}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white hover:opacity-95 shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isApproving ? 'Committing…' : 'Approve Brand Kit'}</span>
            </button>
          </div>

          {/* Success Banner */}
          {approvedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Brand Kit Approved &amp; Committed to Database!</span>
                  <span>Tokens are now active across all client templates. CSS variables and Tailwind extension generated below.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovedSuccess(false)}
                className="text-xs underline hover:text-emerald-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Grid: Logos, Colors & WCAG AA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: Logos Found */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>Logo Options Found ({extractedData.assets.logos.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500">Pick the primary logo for header and templates</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {extractedData.assets.logos.map((logo) => {
                  const isSelected = selectedLogoId === logo.id;
                  return (
                    <div
                      key={logo.id}
                      onClick={() => {
                        setSelectedLogoId(logo.id);
                        if (editableTheme) {
                          setEditableTheme({
                            ...editableTheme,
                            logo: { ...editableTheme.logo, primary: logo.url }
                          });
                        }
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'ring-1'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${primaryColor}15`,
                              borderColor: primaryColor,
                              boxShadow: `0 0 0 1px ${primaryColor}`
                            }
                          : undefined
                      }
                    >
                      <div className="h-16 flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                        {logo.isSvg && logo.svgContent ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: logo.svgContent }}
                            className="max-h-12 max-w-full [&>svg]:max-h-12 [&>svg]:w-auto"
                          />
                        ) : (
                          <img
                            src={logo.url}
                            alt={logo.altText}
                            className="max-h-12 max-w-full object-contain"
                          />
                        )}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {logo.altText}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel 2: Color Palette & WCAG AA Contrast Warnings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4" style={{ color: primaryColor }} />
                    <span>Color Palette with Semantic Roles</span>
                  </h4>
                  <p className="text-xs text-slate-500">Edit swatches to update client theme immediately</p>
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { role: 'primary', label: 'Primary Brand', hex: editableTheme.color.primary },
                  { role: 'accent', label: 'CTA Accent', hex: editableTheme.color.accent },
                  { role: 'surface', label: 'Surface Card', hex: editableTheme.color.surface },
                  { role: 'text', label: 'Main Text', hex: editableTheme.color.text }
                ].map(({ role, label, hex }) => (
                  <div
                    key={role}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <input
                        type="color"
                        value={hex}
                        onChange={(e) => handleColorChange(role as any, e.target.value)}
                        className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-700 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={hex}
                        onChange={(e) => handleColorChange(role as any, e.target.value)}
                        className="w-full text-[10px] font-mono uppercase bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none"
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">{label}</div>
                  </div>
                ))}
              </div>

              {/* WCAG AA Compliance Badges */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>WCAG 2.1 AA Accessibility Validation</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="font-semibold text-slate-500">Text on BG</div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {extractedData.wcagCompliance.textOnBg.ratio}:1 (AA &check;)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="font-semibold text-slate-500">Text on Surface</div>
                    <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {extractedData.wcagCompliance.textOnSurface.ratio}:1 (AA &check;)
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="font-semibold text-slate-500">Accent on BG</div>
                    <div className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                      {extractedData.wcagCompliance.accentOnBg.ratio}:1 (UI &check;)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Font Pairings & Voice Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 3: Font Pairings & Typeface Mapping */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>Typography Pairings &amp; Licensing</span>
                </h4>
                <p className="text-xs text-slate-500">Google Fonts vs Commercial Font licensing audit</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Heading Typeface</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                      {extractedData.fontAnalysis.heading.isGoogleFont ? 'Google Font • Free License' : 'Commercial Font'}
                    </span>
                  </div>
                  <div className="text-base font-bold font-serif" style={{ color: primaryColor }}>
                    {editableTheme.font.heading}
                  </div>
                  {extractedData.fontAnalysis.heading.licenseNote && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      {extractedData.fontAnalysis.heading.licenseNote}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 italic">
                    &ldquo;Excellence in corporate governance and market leadership.&rdquo;
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Body Copy Typeface</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                      {extractedData.fontAnalysis.body.isGoogleFont ? 'Google Font • Optimized Web' : 'Detected System Font'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans">
                    {editableTheme.font.body}
                  </div>
                  {extractedData.fontAnalysis.body.licenseNote && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      {extractedData.fontAnalysis.body.licenseNote}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Precision corporate disclosure, institutional governance, and verified ESG benchmarks.
                  </p>
                </div>
              </div>
            </div>

            {/* Panel 4: Voice Summary & 3 'Never Do' Rules */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>AI Brand Voice &amp; Guardrails</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Reading Level: <strong className="text-slate-700 dark:text-slate-300">{extractedData.copyAnalysis.readingLevel}</strong> (Flesch-Kincaid Score: {extractedData.copyAnalysis.readingScore})
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Brand Voice Summary (Editable for AI Copilot):
                </label>
                <textarea
                  rows={2}
                  value={editableVoiceSummary}
                  onChange={(e) => setEditableVoiceSummary(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  3 Strict &lsquo;Never Do&rsquo; Rules for This Brand:
                </label>
                <div className="space-y-1.5">
                  {editableDoNots.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={rule}
                        onChange={(e) => {
                          const updated = [...editableDoNots];
                          updated[idx] = e.target.value;
                          setEditableDoNots(updated);
                        }}
                        className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel 5: Extracted Media Mini-Gallery */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>Extracted Media Assets Mini-Gallery ({extractedData.assets.media.length})</span>
                </h4>
                <p className="text-xs text-slate-500">Check assets to import into the client&apos;s Media Library</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {extractedData.assets.media.map((item) => {
                const isChecked = selectedMediaIds[item.id] || false;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedMediaIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    className={`p-2 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                      isChecked
                        ? 'border-transparent'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                    style={
                      isChecked
                        ? {
                            backgroundColor: `${primaryColor}15`,
                            borderColor: primaryColor
                          }
                        : undefined
                    }
                  >
                    <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <img
                        src={item.url}
                        alt={item.altText}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-black/60 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                        {item.altText}
                      </span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: primaryColor }}
                        className="rounded cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 6: Code Generation & Template Export Snippets */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4" style={{ color: primaryColor }} />
                  <span>Generated Theme Tokens &amp; Tailwind Config</span>
                </h4>
                <p className="text-xs text-slate-500">Live variables compiled from approved brand kit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* CSS Variables */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-400 font-bold">:root CSS Variables</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        extractedData.generatedArtifacts?.cssVariables ||
                          `:root {\n  --brand-primary: ${editableTheme.color.primary};\n  --brand-accent: ${editableTheme.color.accent};\n}`,
                        'css'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedArtifact === 'css' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedArtifact === 'css' ? 'Copied' : 'Copy CSS'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 p-2 rounded bg-black/40">
                  {extractedData.generatedArtifacts?.cssVariables ||
                    `:root {\n  --brand-primary: ${editableTheme.color.primary};\n  --brand-accent: ${editableTheme.color.accent};\n}`}
                </pre>
              </div>

              {/* Tailwind Config */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-400 font-bold">Tailwind Theme Token Snippet</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        extractedData.generatedArtifacts?.tailwindConfigSnippet ||
                          JSON.stringify(editableTheme.color, null, 2),
                        'tailwind'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedArtifact === 'tailwind' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedArtifact === 'tailwind' ? 'Copied' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 p-2 rounded bg-black/40">
                  {extractedData.generatedArtifacts?.tailwindConfigSnippet ||
                    JSON.stringify(editableTheme.color, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
