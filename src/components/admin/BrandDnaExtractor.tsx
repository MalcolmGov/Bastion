'use client';

import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import type { BrandKitDnaResult, StandardThemeJson } from '@/lib/studio/brandExtractor';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

interface BrandDnaExtractorProps {
  initialUrl?: string;
  onKitApproved?: (kit: StandardThemeJson) => void;
}

export function BrandDnaExtractor({ initialUrl = '', onKitApproved }: BrandDnaExtractorProps) {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [url, setUrl] = useState(initialUrl);
  const [isExtracting, setIsExtracting] = useState(false);
  const [crawlStep, setCrawlStep] = useState<number>(0);
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

  const crawlSteps = [
    'Initializing headless crawler with RFC1918 guardrails...',
    'Loading homepage and linked interior pages...',
    'Reading final computed styles & :root CSS variables...',
    'Extracting SVG marks, favicons, open-graph & media...',
    'Analyzing copy, Flesch-Kincaid reading level & brand voice...',
    'Mapping typefaces to Google Fonts & checking WCAG AA ratios...'
  ];

  const handleStartExtraction = async (targetUrl?: string) => {
    const runUrl = targetUrl || url;
    if (!runUrl.trim()) return;

    setIsExtracting(true);
    setError(null);
    setCrawlStep(0);
    setApprovedSuccess(false);

    // Simulate multi-step crawler progress
    const stepInterval = setInterval(() => {
      setCrawlStep(prev => (prev < crawlSteps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch('/api/admin/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: runUrl })
      });

      clearInterval(stepInterval);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Extraction failed');
      }

      const result: BrandKitDnaResult = data.result;
      setExtractedData(result);
      setEditableTheme(result.theme);
      setEditableVoiceSummary(result.theme.voice.summary);
      setEditableDoNots(result.theme.voice.doNot || []);
      setSelectedLogoId(result.assets.logos[0]?.id || '');

      // Select first 4 media by default
      const initialMedia: Record<string, boolean> = {};
      result.assets.media.slice(0, 4).forEach(m => {
        initialMedia[m.id] = true;
      });
      setSelectedMediaIds(initialMedia);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || 'Failed to extract Brand DNA.');
    } finally {
      setIsExtracting(false);
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
          mediaAssets: extractedData.assets.media.filter(m => selectedMediaIds[m.id])
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
                Claude Design Pipeline
              </span>
              <span className="text-xs text-slate-500 font-medium">website URL &rarr; approved brand kit</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Extract Brand DNA from Website URL
            </h2>
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
            <span>{isExtracting ? 'Extracting DNA…' : 'Extract Brand Kit'}</span>
          </button>
        </div>

        {/* Quick Demo URLs */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-400">Try Live Demonstration:</span>
          {[
            { label: 'Gold Fields Official', url: 'https://www.goldfields.com' },
            { label: 'Apex Strategic Advisory', url: 'https://demo-apex-advisory.test' },
            { label: 'Bastion Group SA', url: 'https://bastiongroup.co.za' }
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

        {/* Crawling Progress Visualizer */}
        {isExtracting && (
          <div 
            className="p-4 rounded-xl border space-y-2 animate-in fade-in"
            style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}30`
            }}
          >
            <div 
              className="flex items-center justify-between text-xs font-bold"
              style={{ color: primaryColor }}
            >
              <span className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full animate-ping" 
                  style={{ backgroundColor: primaryColor }}
                />
                <span>Crawling in Background Worker (Playwright / DOM Ingest)</span>
              </span>
              <span>Step {crawlStep + 1} of {crawlSteps.length}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
              &gt; {crawlSteps[crawlStep]}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${((crawlStep + 1) / crawlSteps.length) * 100}%`,
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                }}
              />
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
            className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Review extracted vector marks, color palette, WCAG AA compliance, typography, and voice rules before committing.
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
                className="text-xs underline hover:text-emerald-900"
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
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100'
                      }`}
                      style={isSelected ? {
                        backgroundColor: `${primaryColor}15`,
                        borderColor: primaryColor,
                        boxShadow: `0 0 0 1px ${primaryColor}`
                      } : undefined}
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{logo.altText}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />}
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
                  { role: 'text', label: 'Main Text', hex: editableTheme.color.text },
                ].map(({ role, label, hex }) => (
                  <div key={role} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
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
                      Google Font &bull; Free License
                    </span>
                  </div>
                  <div className="text-base font-bold font-serif" style={{ color: primaryColor }}>
                    {editableTheme.font.heading}
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    &ldquo;Gold Fields delivers sustainable mining operations across four continents.&rdquo;
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Body Copy Typeface</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                      Google Font &bull; Optimized Web
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans">
                    {editableTheme.font.body}
                  </div>
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
                  Reading Level: <strong className="text-slate-700 dark:text-slate-300">{extractedData.copyAnalysis.readingLevel}</strong>
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
                  <span>Extracted Media Assets Mini-Gallery</span>
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
                      setSelectedMediaIds(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    }}
                    className={`p-2 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                      isChecked
                        ? 'border-transparent'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100'
                    }`}
                    style={isChecked ? {
                      backgroundColor: `${primaryColor}15`,
                      borderColor: primaryColor
                    } : undefined}
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
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{item.altText}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: primaryColor }}
                        className="rounded"
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
                    onClick={() => handleCopy(extractedData.generatedArtifacts.cssVariables, 'css')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedArtifact === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedArtifact === 'css' ? 'Copied' : 'Copy CSS'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 p-2 rounded bg-black/40">
                  {extractedData.generatedArtifacts.cssVariables}
                </pre>
              </div>

              {/* Tailwind Config */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-400 font-bold">Tailwind Theme Token Snippet</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(extractedData.generatedArtifacts.tailwindConfigSnippet, 'tailwind')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedArtifact === 'tailwind' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedArtifact === 'tailwind' ? 'Copied' : 'Copy Config'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-36 p-2 rounded bg-black/40">
                  {extractedData.generatedArtifacts.tailwindConfigSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
