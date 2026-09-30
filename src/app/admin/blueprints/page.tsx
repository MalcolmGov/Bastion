'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Palette,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building,
  Briefcase,
  Utensils,
  Pickaxe,
  TrendingUp,
  SunMedium,
  Cpu,
  HeartPulse,
  Scale,
  Compass,
  X,
  Eye,
  FileText,
  Check,
  GitBranch,
  GitCommit,
  GitPullRequest,
  UploadCloud,
  DownloadCloud,
  Code2,
  Terminal,
  RefreshCw,
  Copy,
  FileCode,
  Download
} from 'lucide-react';
import { BLUEPRINTS, BlueprintDefinition } from '@/lib/studio/blueprints';
import { DESIGN_COLLECTIONS } from '@/lib/studio/collections';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';

export default function BlueprintsAndCollectionsPage() {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [inspectBlueprint, setInspectBlueprint] = useState<BlueprintDefinition | null>(null);

  // Git Schema Sync State
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [loadingSync, setLoadingSync] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPushModal, setShowPushModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaBundle, setSchemaBundle] = useState<any>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'json' | 'ts' | 'config'>('json');
  const [commitMessage, setCommitMessage] = useState('feat(schema): sync Bastion enterprise blueprints and dynamic zones');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchGitStatus = async () => {
    try {
      const res = await fetch('/api/admin/schema/git-sync');
      const data = await res.json();
      if (data.success && data.status) {
        setGitStatus(data.status);
      }
    } catch (e) {
      console.error('Failed to load git status:', e);
    }
  };

  useEffect(() => {
    fetchGitStatus();
  }, []);

  const handlePushGit = async () => {
    setLoadingSync(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/admin/schema/git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'push', commitMessage })
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback({
          type: 'success',
          message: `Pushed schema successfully! Commit: ${data.commitSha.substring(0, 7)}`
        });
        setShowPushModal(false);
        await fetchGitStatus();
      } else {
        setSyncFeedback({ type: 'error', message: data.error || 'Failed to push schema' });
      }
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: err.message || 'Network error pushing schema' });
    } finally {
      setLoadingSync(false);
    }
  };

  const handlePullGit = async () => {
    setLoadingSync(true);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/admin/schema/git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pull' })
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback({
          type: 'success',
          message: `Pulled latest schema into Bastion CMS database (${data.blueprintCount} blueprints synced)`
        });
        await fetchGitStatus();
      } else {
        setSyncFeedback({ type: 'error', message: data.error || 'Failed to pull schema' });
      }
    } catch (err: any) {
      setSyncFeedback({ type: 'error', message: err.message || 'Network error pulling schema' });
    } finally {
      setLoadingSync(false);
    }
  };

  const handleOpenSchemaModal = async () => {
    setLoadingSync(true);
    try {
      const res = await fetch('/api/admin/schema/git-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export' })
      });
      const data = await res.json();
      if (data.success && data.bundle) {
        setSchemaBundle(data.bundle);
        setShowSchemaModal(true);
      }
    } catch (err) {
      console.error('Failed to export schema:', err);
    } finally {
      setLoadingSync(false);
    }
  };

  const handleCopyCode = () => {
    if (!schemaBundle) return;
    let textToCopy = '';
    if (activeSchemaTab === 'json') {
      textToCopy = JSON.stringify(schemaBundle.jsonSchema, null, 2);
    } else if (activeSchemaTab === 'ts') {
      textToCopy = schemaBundle.typeScriptDefs;
    } else {
      textToCopy = schemaBundle.configFile;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!schemaBundle) return;
    let content = '';
    let filename = '';
    let type = '';

    if (activeSchemaTab === 'json') {
      content = JSON.stringify(schemaBundle.jsonSchema, null, 2);
      filename = 'bastion-schema.json';
      type = 'application/json';
    } else if (activeSchemaTab === 'ts') {
      content = schemaBundle.typeScriptDefs;
      filename = 'bastion-cms.d.ts';
      type = 'text/typescript';
    } else {
      content = schemaBundle.configFile;
      filename = 'bastion.config.ts';
      type = 'text/typescript';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getBlueprintIcon = (id: string) => {
    switch (id) {
      case 'corporate':
        return <Building className="w-5 h-5 text-sky-400" />;
      case 'mining_resources':
        return <Pickaxe className="w-5 h-5 text-amber-400" />;
      case 'wealth_private_equity':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'renewable_energy':
        return <SunMedium className="w-5 h-5 text-teal-400" />;
      case 'enterprise_tech':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'healthcare':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'legal_advisory':
        return <Scale className="w-5 h-5 text-blue-400" />;
      case 'hospitality_living':
        return <Compass className="w-5 h-5 text-amber-300" />;
      default:
        return <Layers className="w-5 h-5 text-purple-400" />;
    }
  };

  const sectorFilters = [
    { id: 'all', label: 'All Templates (8)' },
    { id: 'mining_resources', label: 'Mining & Resources' },
    { id: 'wealth_private_equity', label: 'Private Equity & Wealth' },
    { id: 'renewable_energy', label: 'Renewable Energy' },
    { id: 'enterprise_tech', label: 'Enterprise Tech & AI' },
    { id: 'healthcare', label: 'Healthcare & Life Sciences' },
    { id: 'legal_advisory', label: 'Institutional Legal' },
    { id: 'hospitality_living', label: 'Luxury Living & Hospitality' },
    { id: 'corporate', label: 'Corporate Flagship' }
  ];

  const allBlueprints = Object.values(BLUEPRINTS);
  const filteredBlueprints =
    selectedSector === 'all'
      ? allBlueprints
      : allBlueprints.filter((bp) => bp.id === selectedSector);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
              borderColor: `${primaryColor}40`
            }}
          >
            Bastion Studio Enterprise Architecture
          </span>
          <span className="text-slate-400 dark:text-slate-600">&bull;</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Pre-Built Corporate Website Templates &amp; Curated Collections
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1.5">
          Enterprise Website Blueprints &amp; Templates
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
          Bastion Studio decouples structural information architecture (Blueprints) from visual treatments (Collections).
          Select any verified sector template to generate a complete corporate website with live regulatory tables,
          executive leadership structures, ESG telemetry, and verified responsive layouts.
        </p>
      </div>

      {/* Two-Way Git Schema Sync Card (Pillar 2 Parity) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] shadow-sm relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <GitBranch className="w-3 h-3" />
                <span>Two-Way Git Schema Sync</span>
              </span>
              <span className="text-slate-400 dark:text-slate-600">&bull;</span>
              <span className="text-xs font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {gitStatus?.isClean ? 'Working Tree Synced' : 'Active Git Repository'}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Git Schema Synchronization &amp; Code Generator</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                  v3.0.0
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-1 leading-relaxed">
                Bi-directional sync between Bastion Studio blueprints and your Git codebase. Automatically exports
                strict JSON Schema (<code className="text-purple-400">bastion-schema.json</code>), TypeScript declarations (<code className="text-purple-400">types/bastion-cms.d.ts</code>), and engine configurations.
              </p>
            </div>

            {/* Git Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{gitStatus?.repo || 'MalcolmGov/Goldfields'}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300">
                <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono text-[11px]">{gitStatus?.branch || 'main'}</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300">
                <GitCommit className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono text-[11px]">
                  {gitStatus?.lastCommitSha ? gitStatus.lastCommitSha.substring(0, 7) : 'HEAD'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">3 Tracked Schemas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenSchemaModal}
              disabled={loadingSync}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#141C2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Inspect Schema Code</span>
            </button>

            <button
              type="button"
              onClick={handlePullGit}
              disabled={loadingSync}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#141C2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud className={`w-4 h-4 text-sky-400 ${loadingSync ? 'animate-bounce' : ''}`} />
              <span>Pull from Git</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPushModal(true)}
              disabled={loadingSync}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
              }}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm hover:opacity-95 cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${loadingSync ? 'animate-spin' : ''}`} />
              <span>Push Schema to Git</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {syncFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sector Filter Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex-wrap gap-1">
            {sectorFilters.map((tab) => {
              const isActive = selectedSector === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSector(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  style={
                    isActive
                      ? {
                          borderLeft: `2px solid ${primaryColor}`
                        }
                      : undefined
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredBlueprints.length} of {allBlueprints.length} Templates
          </span>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlueprints.map((bp) => (
            <div
              key={bp.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md"
            >
              <div className="space-y-4">
                {/* Header Icon + Sector Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex items-center justify-center">
                    {getBlueprintIcon(bp.id)}
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${bp.accentColor}15`,
                      color: bp.accentColor,
                      borderColor: `${bp.accentColor}40`
                    }}
                  >
                    {bp.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{bp.name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {bp.tagline}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {bp.description}
                </p>

                {/* Sample Stats Preview Pills */}
                {bp.sampleStats && bp.sampleStats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                    {bp.sampleStats.slice(0, 2).map((st, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42]"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {st.value}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{st.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default Page Tree */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E293B]">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>Page Architecture ({bp.defaultPages.length} Pages)</span>
                    <span className="font-mono text-purple-500 dark:text-purple-400">
                      {bp.coreModules.length} Modules
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {bp.defaultPages.slice(0, 5).map((p) => (
                      <span
                        key={p.slug}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#141C2A] text-slate-700 dark:text-slate-300 font-mono"
                      >
                        /{p.slug}
                      </span>
                    ))}
                    {bp.defaultPages.length > 5 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141C2A] text-slate-400 font-mono">
                        +{bp.defaultPages.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInspectBlueprint(bp)}
                  className="w-full py-2 rounded-xl bg-slate-50 dark:bg-[#141C2A] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Architecture</span>
                </button>

                <Link
                  href={`/admin/create?blueprint=${bp.id}`}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                  }}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs hover:opacity-95"
                >
                  <span>Use This Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2: Design Collections */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-[#1E293B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-violet-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3 Curated Design Collections
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Visual Styling &amp; Token Rules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(DESIGN_COLLECTIONS).map((dc) => (
            <div
              key={dc.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-4 shadow-xs"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{dc.name}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {dc.tagline}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Typography System:</div>
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  <span className="font-bold">{dc.typography.headingFont.split(',')[0]}</span> (Heading) +{' '}
                  <span className="font-bold">{dc.typography.bodyFont.split(',')[0]}</span> (Body)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Visual Tokens &amp; Surfaces:</div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {dc.imagery.aspectRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    Ratio {dc.typography.scaleRatio}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {dc.imagery.roundedCorner}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 italic">
                  {dc.imagery.treatment}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inspect Blueprint Architecture Modal */}
      {inspectBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] flex items-center justify-center">
                  {getBlueprintIcon(inspectBlueprint.id)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {inspectBlueprint.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${inspectBlueprint.accentColor}15`,
                      color: inspectBlueprint.accentColor,
                      borderColor: `${inspectBlueprint.accentColor}40`
                    }}
                  >
                    {inspectBlueprint.badge}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectBlueprint(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Sample Hero */}
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {inspectBlueprint.description}
              </p>

              {inspectBlueprint.sampleHero && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Sample Hero Layout &bull; {inspectBlueprint.sampleHero.badge}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    &ldquo;{inspectBlueprint.sampleHero.title}&rdquo;
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed">
                    {inspectBlueprint.sampleHero.subtitle}
                  </div>
                </div>
              )}
            </div>

            {/* Default Page Tree Detailed */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-500" />
                <span>Default Information Architecture ({inspectBlueprint.defaultPages.length} Pages)</span>
              </h4>
              <div className="space-y-2">
                {inspectBlueprint.defaultPages.map((page) => (
                  <div
                    key={page.slug}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span className="font-mono text-purple-500 dark:text-purple-400">
                          /{page.slug}
                        </span>
                        <span>&bull;</span>
                        <span>{page.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{page.description}</div>
                    </div>
                    {page.isPrimary && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Core Modules & Conversion Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Core Functional Modules:</div>
                <div className="flex flex-wrap gap-1">
                  {inspectBlueprint.coreModules.map((mod) => (
                    <span
                      key={mod}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-100 dark:border-[#232F42] space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Primary Conversion Actions:</div>
                <div className="space-y-1">
                  {inspectBlueprint.primaryConversionActions.map((action, i) => (
                    <div key={i} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setInspectBlueprint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
              <Link
                href={`/admin/create?blueprint=${inspectBlueprint.id}`}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                }}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition hover:opacity-95"
              >
                <span>Initialize with {inspectBlueprint.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Push Schema to Git Modal */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Push Schema to Git</h3>
                  <div className="text-xs text-slate-500">Commit blueprints &amp; types to repository</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                <div className="text-[10px] font-bold uppercase text-slate-400">Target Git Repository</div>
                <div className="flex items-center space-x-2 font-mono text-slate-800 dark:text-slate-200">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span className="font-bold">{gitStatus?.repo || 'MalcolmGov/Goldfields'}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-sky-400">{gitStatus?.branch || 'main'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400">Files to be Synchronized &amp; Committed</div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>bastion-schema.json</span>
                    <span className="text-slate-400 text-[10px] ml-auto">JSON Schema 2020-12</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>types/bastion-cms.d.ts</span>
                    <span className="text-slate-400 text-[10px] ml-auto">TypeScript Definitions</span>
                  </div>
                  <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>bastion.config.ts</span>
                    <span className="text-slate-400 text-[10px] ml-auto">Engine Config</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400">Git Commit Message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  placeholder="feat(schema): sync Bastion enterprise blueprints"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePushGit}
                disabled={loadingSync}
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                }}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${loadingSync ? 'animate-spin' : ''}`} />
                <span>{loadingSync ? 'Pushing...' : 'Commit & Push'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Schema Modal */}
      {showSchemaModal && schemaBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bastion Schema Code Inspector
                  </h3>
                  <div className="text-xs text-slate-500">
                    Live generated JSON Schema &amp; TypeScript definition pack
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Selector & Action Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                    activeSchemaTab === 'json'
                      ? 'bg-white dark:bg-[#1E293B] text-purple-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  bastion-schema.json
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('ts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                    activeSchemaTab === 'ts'
                      ? 'bg-white dark:bg-[#1E293B] text-sky-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  bastion-cms.d.ts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSchemaTab('config')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                    activeSchemaTab === 'config'
                      ? 'bg-white dark:bg-[#1E293B] text-emerald-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  bastion.config.ts
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141C2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#141C2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-auto rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                {activeSchemaTab === 'json' && JSON.stringify(schemaBundle.jsonSchema, null, 2)}
                {activeSchemaTab === 'ts' && schemaBundle.typeScriptDefs}
                {activeSchemaTab === 'config' && schemaBundle.configFile}
              </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#1E293B] text-xs text-slate-500">
              <span>Schema Version: 3.0.0 &bull; Auto-generated from Studio Blueprints</span>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
