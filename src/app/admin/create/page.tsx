'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Globe,
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Layers,
  Palette,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  Building,
  Target
} from 'lucide-react';
import { BLUEPRINTS } from '@/lib/studio/blueprints';
import { DESIGN_COLLECTIONS } from '@/lib/studio/collections';
import type { BlueprintId, DesignCollectionId, DiscoveredPage } from '@/lib/studio/types';

export default function WebsiteCreationWizardPage() {
  const router = useRouter();

  // Step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step A: Setup
  const [startPath, setStartPath] = useState<'import' | 'pack' | 'brief'>('import');
  const [clientName, setClientName] = useState('Meridian Strategic Capital');
  const [websiteName, setWebsiteName] = useState('Meridian Flagship');
  const [sourceUrl, setSourceUrl] = useState('https://demo.apexadvisory.com');
  const [industry, setIndustry] = useState('professional_services');
  const [targetAudience, setTargetAudience] = useState('Institutional fund managers and sovereign wealth');
  const [businessGoal, setBusinessGoal] = useState('High-value inbound mandate inquiries');
  const [conversionAction, setConversionAction] = useState('Schedule Confidential Discussion');
  const [designIntent, setDesignIntent] = useState<'conservative' | 'bold'>('bold');
  const [language, setLanguage] = useState('English (UK)');

  // Step B: Import Scope
  const [isExtracting, setIsExtracting] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Record<string, boolean>>({});
  const [extractError, setExtractError] = useState<string | null>(null);

  // Step C: Brand & Content Review
  const [extractedBrand, setExtractedBrand] = useState<any>(null);
  const [extractedContent, setExtractedContent] = useState<any>(null);
  const [provenanceData, setProvenanceData] = useState<any>({});
  const [approvedBrandTokens, setApprovedBrandTokens] = useState<Record<string, boolean>>({
    logo: true,
    colors: true,
    typography: true,
    facts: true
  });
  const [lockedTokens, setLockedTokens] = useState<Record<string, boolean>>({
    primaryColor: true,
    primaryLogo: true
  });

  // Step D: Design Selection
  const [selectedBlueprint, setSelectedBlueprint] = useState<BlueprintId>('professional_services');
  const [selectedCollection, setSelectedCollection] = useState<DesignCollectionId>('contemporary');
  const [previewDirection, setPreviewDirection] = useState<'direction_a' | 'direction_b'>('direction_a');

  // Step E: Assembly
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [assemblyResult, setAssemblyResult] = useState<any>(null);

  // Handle URL Extraction (Step A -> Step B)
  const handleStartExtraction = async () => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/admin/wizard/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceUrl,
          maxPages,
          excludedPaths: ['/admin', '/login', '/wp-admin']
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract website');

      const result = data.result;
      setDiscoveredPages(result.discoveredPages || []);
      setExtractedBrand(result.brandCandidates);
      setExtractedContent(result.content);
      setProvenanceData(result.provenance || {});

      // Auto-populate client and website name from real extracted brand candidate
      if (result.brandCandidates?.nameCandidate) {
        setClientName(result.brandCandidates.nameCandidate);
        setWebsiteName(`${result.brandCandidates.nameCandidate} Flagship`);
      }

      // Select all by default
      const initialMap: Record<string, boolean> = {};
      result.discoveredPages.forEach((p: DiscoveredPage) => {
        initialMap[p.url] = p.status !== 'excluded';
      });
      setSelectedUrls(initialMap);

      setCurrentStep(2);
    } catch (err: any) {
      setExtractError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Website Assembly (Step D -> Step E)
  const handleAssembleWebsite = async () => {
    setIsAssembling(true);
    setCurrentStep(5);
    setAssemblyProgress(20);

    const slug = clientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const clientId = `client_${slug.replace(/-/g, '_')}`;

    try {
      setTimeout(() => setAssemblyProgress(50), 300);
      setTimeout(() => setAssemblyProgress(80), 700);

      const res = await fetch('/api/admin/wizard/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientName,
          websiteName,
          websiteSlug: slug,
          blueprintId: selectedBlueprint,
          collectionId: selectedCollection,
          brandKit: {
            logos: {
              primary: extractedBrand?.logos?.[0] || { url: '/assets/logo-placeholder.svg', status: 'approved' }
            },
            colors: {
              primary: extractedBrand?.colors?.[0]
                ? { name: extractedBrand.colors[0].name, value: extractedBrand.colors[0].hex || (extractedBrand.colors[0] as any).value || '#0F172A', status: 'approved' }
                : { name: 'Slate', value: '#0F172A', status: 'approved' },
              secondary: extractedBrand?.colors?.[1]
                ? { name: extractedBrand.colors[1].name, value: extractedBrand.colors[1].hex || (extractedBrand.colors[1] as any).value || '#1E293B', status: 'approved' }
                : { name: 'Navy', value: '#1E293B', status: 'approved' },
              accent: extractedBrand?.colors?.[2]
                ? { name: extractedBrand.colors[2].name, value: extractedBrand.colors[2].hex || (extractedBrand.colors[2] as any).value || '#0284C7', status: 'approved' }
                : { name: 'Accent Sky', value: '#0284C7', status: 'approved' },
              background: { name: 'Canvas', value: selectedCollection === 'immersive' ? '#09090B' : '#F8FAFC', status: 'approved' },
              surface: { name: 'Surface', value: selectedCollection === 'immersive' ? '#18181B' : '#FFFFFF', status: 'approved' },
              textPrimary: { name: 'Text Dark', value: selectedCollection === 'immersive' ? '#FFFFFF' : '#0F172A', status: 'approved' },
              textMuted: { name: 'Text Muted', value: selectedCollection === 'immersive' ? '#A1A1AA' : '#64748B', status: 'approved' },
              hairline: { name: 'Border', value: selectedCollection === 'immersive' ? '#27272A' : '#E2E8F0', status: 'approved' }
            },
            typography: {
              headingFont: extractedBrand?.typography?.headingFont || 'Plus Jakarta Sans',
              bodyFont: extractedBrand?.typography?.bodyFont || 'Inter',
              headingWeight: '700',
              scaleRatio: 1.25,
              status: 'approved'
            },
            voiceAndMessaging: {
              toneOfVoice: extractedBrand?.toneOfVoice || 'Authoritative and decisive',
              approvedFacts: extractedBrand?.approvedFacts || [],
              tagline: extractedBrand?.taglineCandidate
            }
          },
          extractedContent: {
            tagline: extractedBrand?.taglineCandidate,
            services: extractedContent?.servicesFound,
            contactInfo: extractedContent?.contactInfoFound,
            businessSummary: extractedContent?.businessSummary,
            navigation: extractedContent?.navigationFound,
            socialLinks: extractedContent?.socialLinks,
            footerNavigation: extractedContent?.footerNavigation
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assembly error');

      setAssemblyProgress(100);
      setAssemblyResult(data);
      setTimeout(() => setCurrentStep(6), 400);
    } catch (err: any) {
      alert(`Assembly Error: ${err.message}`);
      setCurrentStep(4);
    } finally {
      setIsAssembling(false);
    }
  };

  const stepsHeader = [
    { num: 1, label: 'Setup' },
    { num: 2, label: 'Scope' },
    { num: 3, label: 'Brand & Facts' },
    { num: 4, label: 'Design' },
    { num: 5, label: 'Assembly' },
    { num: 6, label: 'Review' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Wizard Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase text-sky-400">Move Studio Creation Engine</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Guided Client Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Create Populated Client Website
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">Step {currentStep} of 6</span>
          </div>
        </div>

        {/* Stepper Bar */}
        <div className="grid grid-cols-6 gap-2 pt-2">
          {stepsHeader.map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  s.num < currentStep
                    ? 'bg-emerald-500'
                    : s.num === currentStep
                    ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                    : 'bg-[#1E293B]'
                }`}
              />
              <div className="flex items-center space-x-1 text-[10px] font-medium text-slate-400 truncate">
                <span className="font-mono">{s.num}.</span>
                <span className="truncate">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: PROJECT SETUP */}
      {currentStep === 1 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step A: Project Setup & Starting Path</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose how to initialize the client project. Existing-site import is the primary recommended workflow.
            </p>
          </div>

          {/* Starting Paths */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setStartPath('import')}
              className={`p-5 rounded-xl border text-left transition ${
                startPath === 'import'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <Globe className="w-6 h-6 text-sky-400 mb-3" />
              <div className="text-sm font-bold">1. Import Existing Site</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extract brand tokens, navigation, services, and copy from a public client URL.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStartPath('pack')}
              className={`p-5 rounded-xl border text-left transition ${
                startPath === 'pack'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <Upload className="w-6 h-6 text-indigo-400 mb-3" />
              <div className="text-sm font-bold">2. Brand & Content Pack</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload brand guidelines PDF, logo SVGs, and service copy briefs.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStartPath('brief')}
              className={`p-5 rounded-xl border text-left transition ${
                startPath === 'brief'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <FileText className="w-6 h-6 text-emerald-400 mb-3" />
              <div className="text-sm font-bold">3. Start from Business Brief</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Define client industry, core goals, and target audience from scratch.
              </div>
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1E293B]">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Client Organization Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Website Project Name
              </label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Existing Website URL (Source for Ingestion)
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5">
                Protected by SSRF security validation. Rejects internal IP ranges and loopbacks.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Industry Sector
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="professional_services">Professional Services & Advisory</option>
                <option value="corporate">Corporate Flagship</option>
                <option value="hospitality">Hospitality, Dining & Venues</option>
                <option value="technology">Technology & SaaS</option>
                <option value="retail">Commerce & Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Primary Conversion Action
              </label>
              <input
                type="text"
                value={conversionAction}
                onChange={(e) => setConversionAction(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {extractError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              disabled={isExtracting}
              onClick={handleStartExtraction}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Discovering Sitemap...</span>
                </>
              ) : (
                <>
                  <span>Continue to Scope Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: IMPORT SCOPE */}
      {currentStep === 2 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Step B: Import Scope & Discovered Pages</h2>
              <p className="text-xs text-slate-400 mt-1">
                Found {discoveredPages.length} public pages. Select which pages to include in the assembled website draft.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-mono">Limit:</span>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="px-2 py-1 rounded bg-[#141C2A] border border-[#232F42] text-white text-xs"
              >
                <option value={5}>5 pages</option>
                <option value={10}>10 pages</option>
                <option value={20}>20 pages</option>
              </select>
            </div>
          </div>

          <div className="border border-[#1E293B] rounded-xl overflow-hidden divide-y divide-[#1E293B]">
            {discoveredPages.map((p) => (
              <div
                key={p.url}
                className="p-4 bg-[#141C2A] flex items-center justify-between hover:bg-[#1A2333] transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!selectedUrls[p.url]}
                    onChange={(e) =>
                      setSelectedUrls({ ...selectedUrls, [p.url]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{p.path}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                    {p.pageType}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{p.wordCount || 0} words</span>
                  <span className="text-emerald-400 text-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              <span>Review Extracted Brand Tokens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BRAND & CONTENT REVIEW */}
      {currentStep === 3 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step C: Reviewed Brand Library & Provenance</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify observed brand tokens and client facts before generating compositions. Lock tokens to prevent accidental AI mutation.
            </p>
          </div>

          {/* 3-Layer Brand Inspection */}
          <div className="space-y-6">
            {/* 1. Logos */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Brand Logo Mark</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    Observed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLockedTokens({ ...lockedTokens, primaryLogo: !lockedTokens.primaryLogo })}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white"
                >
                  {lockedTokens.primaryLogo ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{lockedTokens.primaryLogo ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-[#0A0D14] border border-[#1E293B]">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center p-2">
                  <span className="font-bold text-xs text-sky-400">LOGO</span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-white">
                    {extractedBrand?.logos?.[0]?.label || 'Primary Brand SVG'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Evidence: {extractedBrand?.logos?.[0]?.evidence || 'Extracted from DOM nav bar'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Color Palette */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Observed Color Palette</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                    High Confidence
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {extractedBrand?.colors?.map((col: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E293B] space-y-2">
                    <div className="w-full h-8 rounded-md" style={{ backgroundColor: col.hex }} />
                    <div className="text-xs font-semibold text-white">{col.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{col.hex}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Approved Facts & Tone */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Tone of Voice & Verified Facts</span>
              <div className="p-3.5 rounded-lg bg-[#0A0D14] border border-[#1E293B] text-xs text-slate-300">
                <span className="font-semibold text-sky-400">Inferred Tone: </span>
                {extractedBrand?.toneOfVoice || 'Authoritative and customer-aligned.'}
              </div>

              <div className="space-y-2">
                {extractedBrand?.approvedFacts?.map((fact: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Contact Details & Social Channels */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Extracted Contact Details & Social Footprint
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Footer Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E293B] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Headquarters / Address</div>
                  <div className="text-white font-medium truncate">
                    {extractedContent?.contactInfoFound?.address || 'Not specified in DOM'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E293B] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Corporate Email</div>
                  <div className="text-white font-medium truncate">
                    {extractedContent?.contactInfoFound?.email || 'contact@client.com'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E293B] space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Direct Telephone</div>
                  <div className="text-white font-medium truncate">
                    {extractedContent?.contactInfoFound?.phone || 'Not detected in extraction'}
                  </div>
                </div>
              </div>

              {/* Social Channels Pills */}
              {extractedContent?.socialLinks && extractedContent.socialLinks.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                    Verified Social Channels ({extractedContent.socialLinks.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedContent.socialLinks.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#0A0D14] border border-[#1E293B] text-[11px] text-slate-300 flex items-center space-x-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="capitalize font-semibold text-white">{s.platform}</span>
                        {s.handle && <span className="text-slate-500 font-mono text-[10px]">{s.handle}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              <span>Continue to Design Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DESIGN SELECTION */}
      {currentStep === 4 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step D: Blueprint & Curated Design Collection</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select the foundational architecture and visual collection. Previews below are populated with the client's extracted material.
            </p>
          </div>

          {/* 1. Blueprint Selection */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Select Website Blueprint</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(BLUEPRINTS).map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedBlueprint(bp.id)}
                  className={`p-5 rounded-xl border text-left transition ${
                    selectedBlueprint === bp.id
                      ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                      : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{bp.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{bp.tagline}</div>
                  <div className="mt-3 text-[10px] font-mono text-sky-400">
                    {bp.defaultPages.length} Pages • {bp.coreModules.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Design Collection Selection */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Select Curated Design Collection</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(DESIGN_COLLECTIONS).map((dc) => (
                <button
                  key={dc.id}
                  type="button"
                  onClick={() => setSelectedCollection(dc.id)}
                  className={`p-5 rounded-xl border text-left transition ${
                    selectedCollection === dc.id
                      ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                      : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{dc.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{dc.tagline}</div>
                  <div className="mt-3 text-[10px] font-mono text-indigo-400">
                    {dc.typography.headingFont.split(',')[0]} + {dc.typography.bodyFont.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Populated Direction Switcher */}
          <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Populated Direction Previews</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewDirection('direction_a')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    previewDirection === 'direction_a'
                      ? 'bg-sky-500 text-white'
                      : 'bg-[#0A0D14] text-slate-400'
                  }`}
                >
                  Direction A (Structured Metrics)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDirection('direction_b')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    previewDirection === 'direction_b'
                      ? 'bg-sky-500 text-white'
                      : 'bg-[#0A0D14] text-slate-400'
                  }`}
                >
                  Direction B (Editorial Narrative)
                </button>
              </div>
            </div>

            {/* Mock Miniature Preview */}
            <div className="aspect-[16/8] bg-slate-900 rounded-lg border border-slate-800 p-6 flex flex-col justify-between overflow-hidden relative">
              <div className="space-y-3">
                <div className="w-20 h-2 bg-sky-400 rounded-full" />
                <div className="text-xl sm:text-2xl font-bold text-white max-w-md">
                  {clientName}: Strategic execution for defining corporate outcomes.
                </div>
                <div className="text-xs text-slate-400 max-w-sm line-clamp-2">
                  {extractedContent?.businessSummary || 'Advising market leaders with senior partner execution.'}
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-slate-800">
                <div className="px-4 py-1.5 rounded bg-sky-500 text-white text-xs font-semibold">
                  {conversionAction}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedCollection.toUpperCase()} • {selectedBlueprint.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleAssembleWebsite}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Assemble Populated Website</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ASSEMBLY IN PROGRESS */}
      {currentStep === 5 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-12 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mx-auto text-sky-400 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Assembling Website from Verified Components</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Mapping approved content into typed CMS records, applying {selectedCollection} tokens, and composing page trees...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${assemblyProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500">{assemblyProgress}% Complete</div>
          </div>
        </div>
      )}

      {/* STEP 6: COMPLETION & REFINE */}
      {currentStep === 6 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-8 space-y-8 animate-fadeIn">
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold text-white">Website Assembled & Ready for Refinement</h2>
              <p className="text-xs text-slate-400">
                Created draft website for {clientName}. All pages are populated and saved in the CMS database.
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/admin/editor?siteSlug=${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="p-6 rounded-xl bg-gradient-to-br from-sky-950 to-indigo-950 border border-sky-700/60 hover:border-sky-500 transition space-y-2 group shadow-md"
            >
              <div className="flex items-center justify-between text-white font-bold text-sm">
                <span>Open in 3-Panel Visual Editor</span>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition" />
              </div>
              <div className="text-xs text-slate-300 leading-relaxed">
                Refine headlines, swap photos from the media library, rearrange sections, and use targeted AI assistance.
              </div>
            </Link>

            <Link
              href={assemblyResult?.previewUrl || `/sites/${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              target="_blank"
              className="p-6 rounded-xl bg-[#141C2A] border border-[#1E293B] hover:border-slate-700 transition space-y-2 group"
            >
              <div className="flex items-center justify-between text-white font-bold text-sm">
                <span>View Private Live Preview</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Review the fully responsive multi-tenant rendered website in a clean browser window.
              </div>
            </Link>
          </div>

          {/* Content Gaps Report */}
          {assemblyResult?.gaps && assemblyResult.gaps.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Content Issues & Optimization Checklist</span>
              </div>
              <div className="space-y-2">
                {assemblyResult.gaps.map((g: any) => (
                  <div key={g.id} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-400 font-mono">•</span>
                    <div>
                      <strong className="text-white">{g.message}</strong> — {g.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <Link
              href="/admin/clients"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Return to Clients & Websites
            </Link>

            <Link
              href={`/admin/editor?siteSlug=${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              <span>Launch Visual Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
