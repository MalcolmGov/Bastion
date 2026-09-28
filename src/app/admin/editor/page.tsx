'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Undo2,
  Redo2,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Send,
  Layers,
  FileText,
  RotateCcw,
  Palette,
  Paintbrush,
  Droplet,
  Type,
  Grid,
  CircleDot,
  Sun,
  Star,
  Waves,
  Ban
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';
import { SectionLibraryDrawer } from '@/components/studio/SectionLibraryDrawer';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance, DesignCollectionId, BackgroundPatternType } from '@/lib/studio/types';

const SOLID_SWATCHES = [
  { name: 'Obsidian Noir', hex: '#09090B' },
  { name: 'Executive Slate', hex: '#0F172A' },
  { name: 'Royal Navy', hex: '#082B49' },
  { name: 'Deep Emerald', hex: '#062E25' },
  { name: 'Rich Plum', hex: '#1E112A' },
  { name: 'Warm Charcoal', hex: '#18181B' },
  { name: 'Editorial Sand', hex: '#FAF8F5' },
  { name: 'Pure White', hex: '#FFFFFF' }
];

const GRADIENT_PRESETS = [
  {
    name: 'Cosmic Noir',
    css: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #0F172A 100%)',
    from: '#09090B',
    to: '#0F172A'
  },
  {
    name: 'Royal Navy Depth',
    css: 'linear-gradient(135deg, #021226 0%, #082B49 50%, #0E3D66 100%)',
    from: '#021226',
    to: '#0E3D66'
  },
  {
    name: 'Emerald Depth',
    css: 'linear-gradient(135deg, #021F17 0%, #064E3B 50%, #02231B 100%)',
    from: '#021F17',
    to: '#064E3B'
  },
  {
    name: 'Carbon Gold',
    css: 'linear-gradient(135deg, #121214 0%, #23221C 50%, #3D3522 100%)',
    from: '#121214',
    to: '#3D3522'
  },
  {
    name: 'Cyber Indigo',
    css: 'linear-gradient(135deg, #0F172A 0%, #312E81 50%, #1E1B4B 100%)',
    from: '#0F172A',
    to: '#1E1B4B'
  },
  {
    name: 'Velvet Sunset',
    css: 'linear-gradient(135deg, #18092B 0%, #3B0764 50%, #0F172A 100%)',
    from: '#18092B',
    to: '#0F172A'
  },
  {
    name: 'Warm Champagne (Light)',
    css: 'linear-gradient(135deg, #FAF7F2 0%, #EFE8DC 50%, #E5DAC9 100%)',
    from: '#FAF7F2',
    to: '#E5DAC9'
  },
  {
    name: 'Ice Pearl (Light)',
    css: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)',
    from: '#FFFFFF',
    to: '#E2E8F0'
  }
];

const TEXT_COLOR_SWATCHES = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Slate Light', hex: '#F8FAFC' },
  { name: 'Muted Slate', hex: '#94A3B8' },
  { name: 'Warm Gold', hex: '#D4AF37' },
  { name: 'Sky Azure', hex: '#38BDF8' },
  { name: 'Dark Ink', hex: '#0F172A' }
];

const ACCENT_SWATCHES = [
  { name: 'Sky Electric', hex: '#0284C7' },
  { name: 'Royal Gold', hex: '#D4AF37' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber Glow', hex: '#F59E0B' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Crimson', hex: '#E11D48' }
];

const PATTERN_OPTIONS: { id: BackgroundPatternType; label: string; desc: string; icon: any }[] = [
  { id: 'none', label: 'None', desc: 'Clean background', icon: Ban },
  { id: 'grid', label: 'Cyber Grid', desc: 'Architectural tech lines', icon: Grid },
  { id: 'dots', label: 'Radial Dots', desc: 'Precision matrix stipple', icon: CircleDot },
  { id: 'glow_orbs', label: 'Ambient Glow', desc: 'Luminous dual bloom', icon: Sun },
  { id: 'mesh', label: 'Conic Mesh', desc: 'Multi-hue aura blend', icon: Palette },
  { id: 'galaxy', label: 'Galaxy Stars', desc: 'Celestial starlight nodes', icon: Star },
  { id: 'aurora', label: 'Aurora Wave', desc: 'Prismatic kinetic waves', icon: Waves },
];

function VisualWebsiteEditorContent() {
  const searchParams = useSearchParams();
  const siteSlugParam = searchParams.get('siteSlug') || searchParams.get('siteId');
  const { activeClient, activeSite, setActiveClientId, setActiveSiteId } = useStudioWorkspace();

  const siteSlug = siteSlugParam || activeSite?.slug || 'apex-advisory';

  // Responsive Viewport: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Active page
  const [activePageSlug, setActivePageSlug] = useState('home');

  // Loaded site, brand kit, and compositions
  const [siteData, setSiteData] = useState<any>(null);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [sections, setSections] = useState<SectionInstance[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<SectionInstance[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // AI Assistant Panel state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Inspector Active Tab: 'content' | 'design' | 'ai'
  const [inspectorTab, setInspectorTab] = useState<'content' | 'design' | 'ai'>('content');

  // Gradient Custom Builder State
  const [customGradDir, setCustomGradDir] = useState('135deg');
  const [customGradFrom, setCustomGradFrom] = useState('#09090B');
  const [customGradTo, setCustomGradTo] = useState('#0F172A');

  // Fetch composition from API
  useEffect(() => {
    async function loadComposition() {
      try {
        const res = await fetch(`/api/admin/editor?siteId=${siteSlug}&pageSlug=${activePageSlug}`);
        if (res.ok) {
          const data = await res.json();
          setSiteData(data.site);
          setBrandKit(data.brandKit);

          if (data.site?.id && data.site?.clientId) {
            setActiveClientId(data.site.clientId);
            setActiveSiteId(data.site.id);
          }

          const comp = data.compositions?.find((c: any) => c.pageSlug === activePageSlug) || data.compositions?.[0];
          if (comp?.sections) {
            setSections(comp.sections);
            setHistory([comp.sections]);
            setHistoryIndex(0);
            if (comp.sections[0]) {
              setSelectedSectionId(comp.sections[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load editor composition:', err);
      }
    }
    loadComposition();
  }, [siteSlug, activePageSlug]);

  const updateSections = (newSections: SectionInstance[], recordHistory = true) => {
    setSections(newSections);
    setHasUnsavedChanges(true);
    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newSections);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setSections(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setSections(next);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    updateSections(reordered);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    updateSections(updated);
  };

  const handleDuplicateSection = (index: number) => {
    const item = sections[index];
    const clone: SectionInstance = {
      ...item,
      id: `sec_${Date.now()}`,
      props: JSON.parse(JSON.stringify(item.props))
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, clone);
    updateSections(updated);
    setSelectedSectionId(clone.id);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) return;
    const updated = sections.filter(s => s.id !== id);
    updateSections(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || null);
    }
  };

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleInsertSection = (componentId: string) => {
    const regComp = COMPONENT_REGISTRY[componentId];
    const newId = `sec_${siteSlug || 'site'}_${componentId}_${Date.now()}`;
    const newSection: SectionInstance = {
      id: newId,
      componentId,
      variant: regComp?.variants[0]?.id || 'default',
      visible: true,
      props: regComp ? JSON.parse(JSON.stringify(regComp.defaultProps)) : {},
      styles: {
        backgroundType: 'solid',
        backgroundColor: '#0A0D14',
        headingColor: '#FFFFFF',
        textColor: '#94A3B8',
        accentColor: '#38BDF8',
        paddingY: 'py-24'
      }
    };

    let insertIdx = sections.length;
    if (selectedSectionId) {
      const selIdx = sections.findIndex(s => s.id === selectedSectionId);
      if (selIdx !== -1) insertIdx = selIdx + 1;
    } else {
      const ftrIdx = sections.findIndex(s => s.componentId === 'footer');
      if (ftrIdx !== -1) insertIdx = ftrIdx;
    }

    const updated = [...sections.slice(0, insertIdx), newSection, ...sections.slice(insertIdx)];
    updateSections(updated);
    setSelectedSectionId(newId);
  };

  const handlePropChange = (field: string, val: any) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        props: {
          ...s.props,
          [field]: val
        }
      };
    });
    updateSections(updated);
  };

  const handleVariantChange = (variantId: string) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return { ...s, variant: variantId };
    });
    updateSections(updated);
  };

  const handleStyleChange = (field: string, val: any) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      const currentStyles = s.styles || {};
      const newStyles = { ...currentStyles, [field]: val };
      return {
        ...s,
        styles: newStyles
      };
    });
    updateSections(updated);
  };

  const handleApplyGradientPreset = (gradientStr: string, presetName: string, from?: string, to?: string) => {
    if (!selectedSectionId) return;
    if (from) setCustomGradFrom(from);
    if (to) setCustomGradTo(to);
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          ...s.styles,
          backgroundType: 'gradient' as const,
          gradient: gradientStr,
          gradientPreset: presetName,
          ...(from ? { gradientFrom: from } : {}),
          ...(to ? { gradientTo: to } : {})
        }
      };
    });
    updateSections(updated);
  };

  const handleUpdateCustomGradient = (dir: string, from: string, to: string) => {
    const grad = dir === 'radial'
      ? `radial-gradient(circle at center, ${from} 0%, ${to} 100%)`
      : `linear-gradient(${dir}, ${from} 0%, ${to} 100%)`;
    if (!selectedSectionId) return;
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          ...s.styles,
          backgroundType: 'gradient' as const,
          gradient: grad,
          gradientDirection: dir,
          gradientFrom: from,
          gradientTo: to
        }
      };
    });
    updateSections(updated);
  };

  const handleResetSectionStyles = () => {
    if (!selectedSectionId) return;
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          backgroundType: 'default' as const,
          backgroundColor: undefined,
          gradient: undefined,
          textColor: undefined,
          headingColor: undefined,
          accentColor: undefined,
          paddingY: undefined
        }
      };
    });
    updateSections(updated);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteData?.id || siteSlug,
          pageSlug: activePageSlug,
          sections,
          title: `${siteData?.name || 'Site'} — ${activePageSlug.toUpperCase()}`,
          status: 'draft'
        })
      });
      if (res.ok) {
        setSavedTime(new Date().toLocaleTimeString());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.warn('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIAction = async (action: string) => {
    if (!selectedSection) return;
    setAiLoading(true);
    setAiNotice(null);

    try {
      const res = await fetch('/api/admin/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          inputContent: selectedSection.props.title || selectedSection.props.quote || '',
          prompt: aiPrompt,
          context: {
            brandKit,
            componentId: selectedSection.componentId,
            currentVariant: selectedSection.variant,
            composition: { sections }
          }
        })
      });

      const data = await res.json();
      if (data.result && selectedSection.props.title) {
        handlePropChange('title', data.result);
      }
      if (data.suggestedVariant) {
        handleVariantChange(data.suggestedVariant);
      }
      if (data.reorderedSectionIds) {
        const reordered = data.reorderedSectionIds
          .map((id: string) => sections.find(s => s.id === id))
          .filter(Boolean) as SectionInstance[];
        if (reordered.length === sections.length) {
          updateSections(reordered);
        }
      }
      setAiNotice(`${data.explanation} (${data.providerNotice})`);
      setAiPrompt('');
    } catch (err: any) {
      setAiNotice(`AI execution notice: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const collection: DesignCollectionId = (siteData?.designCollectionId as any) || 'contemporary';
  const registeredComp = selectedSection ? COMPONENT_REGISTRY[selectedSection.componentId] : null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-[#070B12] -m-6 lg:-m-8 select-none">
      {/* Top Editor Toolbar */}
      <div className="h-14 bg-[#0A0D14] border-b border-[#1E293B] px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-wide">{siteData?.name || 'Move Studio Editor'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-sky-950 text-sky-400 border border-sky-800">
              {collection.toUpperCase()}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          {/* Page Selector Pill */}
          <div className="flex space-x-1 bg-[#141C2A] p-1 rounded-lg border border-[#232F42]">
            {['home', 'about', 'services', 'contact'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePageSlug(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition ${
                  activePageSlug === p
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Width Controls */}
        <div className="flex items-center space-x-1 bg-[#141C2A] p-1 rounded-xl border border-[#232F42]">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            title="Desktop Viewport (1440px)"
            className={`p-1.5 rounded-lg transition ${
              viewport === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            title="Tablet Viewport (768px)"
            className={`p-1.5 rounded-lg transition ${
              viewport === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            title="Mobile Viewport (375px)"
            className={`p-1.5 rounded-lg transition ${
              viewport === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo & Save Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              title="Undo change"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              title="Redo change"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {hasUnsavedChanges ? (
            <span className="text-[11px] text-amber-400 font-medium">Unsaved changes</span>
          ) : savedTime ? (
            <span className="text-[11px] text-slate-500 font-mono">Saved at {savedTime}</span>
          ) : null}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <a
            href={`/sites/${siteSlug}?preview=true`}
            target="_blank"
            title="Open live preview in new tab"
            className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3-Panel Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Sections Outline & Tree (260px) */}
        <div className="w-64 bg-[#0A0D14] border-r border-[#1E293B] flex flex-col justify-between shrink-0">
          <div className="p-3 border-b border-[#1E293B] flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Page Structure ({sections.length})
            </span>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500 border border-sky-400/30 hover:border-sky-400 text-sky-300 hover:text-white text-[10px] font-bold flex items-center space-x-1 transition shadow-xs"
              title="Add Section"
            >
              <Plus className="w-3 h-3" />
              <span>Add Block</span>
            </button>
          </div>

          <div className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {sections.map((sec, idx) => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-sky-950/70 border-sky-500 text-white ring-1 ring-sky-500'
                      : 'bg-[#141C2A] border-[#1E293B] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="font-mono text-[10px] text-slate-500">0{idx + 1}</span>
                    <span className="font-medium truncate capitalize">
                      {sec.componentId.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(sec.id); }}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                      className="p-1 hover:text-rose-400 text-slate-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Section Button */}
            <button
              type="button"
              onClick={() => setIsLibraryOpen(true)}
              className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section Block</span>
            </button>
          </div>
        </div>

        {/* CENTER CANVAS: Responsive Live Website Preview */}
        <div className="flex-1 bg-[#05070B] overflow-y-auto p-6 flex justify-center items-start">
          <div
            className={`transition-all duration-300 shadow-2xl bg-white text-slate-900 overflow-hidden rounded-xl border border-slate-700/60 ${
              viewport === 'desktop'
                ? 'w-full max-w-[1280px]'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-[375px]'
            }`}
          >
            {sections.map((sec) => (
              <StudioComponentRenderer
                key={sec.id}
                section={sec}
                collection={collection}
                isEditor={true}
                isSelected={sec.id === selectedSectionId}
                onSelectSection={(id) => setSelectedSectionId(id)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Selected Section Inspector & Design Studio (w-96, 384px) */}
        <div className="w-96 bg-[#0A0D14] border-l border-[#1E293B] flex flex-col justify-between shrink-0 overflow-y-auto">
          {selectedSection ? (
            <div className="p-4 space-y-5">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Block: {selectedSection.componentId.replace('_', ' ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetSectionStyles}
                    title="Reset styling to blueprint defaults"
                    className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-[10px] flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Customize content copy, layout variants, colors, and gradients.
                </div>
              </div>

              {/* Navigation Tabs: Content | Styles & Colors | AI Copilot */}
              <div className="flex p-1 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs">
                <button
                  type="button"
                  onClick={() => setInspectorTab('content')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                    inspectorTab === 'content'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Content</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('design')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                    inspectorTab === 'design'
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Colors & Style</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('ai')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
                    inspectorTab === 'ai'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Copilot</span>
                </button>
              </div>

              {/* TAB 1: CONTENT & COPY */}
              {inspectorTab === 'content' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Layout Variant Dropdown */}
                  {registeredComp?.variants && registeredComp.variants.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase text-slate-400">
                        Component Layout Variant
                      </label>
                      <select
                        value={selectedSection.variant}
                        onChange={(e) => handleVariantChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                      >
                        {registeredComp.variants.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Eyebrow / Badge */}
                  {(selectedSection.props.eyebrow !== undefined || selectedSection.props.badge !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Badge / Eyebrow Tag
                      </label>
                      <input
                        type="text"
                        value={selectedSection.props.eyebrow !== undefined ? (selectedSection.props.eyebrow || '') : (selectedSection.props.badge || '')}
                        onChange={(e) => {
                          if (selectedSection.props.eyebrow !== undefined) handlePropChange('eyebrow', e.target.value);
                          else handlePropChange('badge', e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {/* Section Headline */}
                  {selectedSection.props.title !== undefined && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Section Headline
                      </label>
                      <textarea
                        rows={3}
                        value={selectedSection.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {/* Section Subtitle */}
                  {(selectedSection.props.subtitle !== undefined || selectedSection.props.description !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Supporting Subtitle / Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={selectedSection.props.subtitle !== undefined ? (selectedSection.props.subtitle || '') : (selectedSection.props.description || '')}
                        onChange={(e) => {
                          if (selectedSection.props.subtitle !== undefined) handlePropChange('subtitle', e.target.value);
                          else handlePropChange('description', e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {/* Primary CTA */}
                  {selectedSection.props.primaryCta && (
                    <div className="space-y-2 p-3 rounded-xl bg-[#141C2A] border border-[#232F42]">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                        Primary CTA Button
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Button Label</label>
                        <input
                          type="text"
                          value={selectedSection.props.primaryCta.label || ''}
                          onChange={(e) => handlePropChange('primaryCta', { ...selectedSection.props.primaryCta, label: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Target Link (href)</label>
                        <input
                          type="text"
                          value={selectedSection.props.primaryCta.href || ''}
                          onChange={(e) => handlePropChange('primaryCta', { ...selectedSection.props.primaryCta, href: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Standalone ctaText (Header, CTA) */}
                  {selectedSection.props.ctaText !== undefined && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Action CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={selectedSection.props.ctaText || ''}
                        onChange={(e) => handlePropChange('ctaText', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {/* PRICING PLANS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'pricing' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                          Annual Savings Badge
                        </label>
                        <input
                          type="text"
                          value={selectedSection.props.annualSavingsNote || ''}
                          onChange={(e) => handlePropChange('annualSavingsNote', e.target.value)}
                          placeholder="e.g. Save 20% on annual billing"
                          className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold uppercase text-sky-400">
                          Pricing Tiers ({selectedSection.props.plans?.length || 0})
                        </label>
                        {(selectedSection.props.plans || []).map((plan: any, pIdx: number) => (
                          <div key={pIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{plan.name}</span>
                              <label className="flex items-center space-x-1.5 text-[10px] text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={plan.isPopular || false}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, isPopular: e.target.checked };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                                />
                                <span>Featured Tier</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Monthly</label>
                                <input
                                  type="text"
                                  value={plan.monthlyPrice || ''}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, monthlyPrice: e.target.value };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Annual</label>
                                <input
                                  type="text"
                                  value={plan.annualPrice || ''}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, annualPrice: e.target.value };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ ACCORDION COMPONENT FIELDS */}
                  {selectedSection.componentId === 'faq' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          FAQ Questions ({selectedSection.props.items?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = [
                              ...(selectedSection.props.items || []),
                              { question: 'New Question', answer: 'Provide comprehensive answer details here.' }
                            ];
                            handlePropChange('items', nextItems);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add FAQ</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.items || []).map((faq: any, fIdx: number) => (
                          <div key={fIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400">Q{fIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = selectedSection.props.items.filter((_: any, i: number) => i !== fIdx);
                                  handlePropChange('items', nextItems);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={faq.question || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[fIdx] = { ...faq, question: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Question headline..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[fIdx] = { ...faq, answer: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Answer explanation..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROCESS ROADMAP COMPONENT FIELDS */}
                  {selectedSection.componentId === 'process' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          Process Steps ({selectedSection.props.steps?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const count = (selectedSection.props.steps || []).length;
                            const nextSteps = [
                              ...(selectedSection.props.steps || []),
                              { number: `0${count + 1}`, title: `Step ${count + 1}`, description: 'Step description and key milestones.' }
                            ];
                            handlePropChange('steps', nextSteps);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Step</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.steps || []).map((step: any, sIdx: number) => (
                          <div key={sIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={step.number || `0${sIdx + 1}`}
                                onChange={(e) => {
                                  const nextSteps = [...selectedSection.props.steps];
                                  nextSteps[sIdx] = { ...step, number: e.target.value };
                                  handlePropChange('steps', nextSteps);
                                }}
                                className="w-12 px-1.5 py-0.5 rounded bg-[#0E1522] border border-[#222E42] text-sky-400 font-mono text-[10px] font-bold text-center"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextSteps = selectedSection.props.steps.filter((_: any, i: number) => i !== sIdx);
                                  handlePropChange('steps', nextSteps);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.title || ''}
                              onChange={(e) => {
                                const nextSteps = [...selectedSection.props.steps];
                                nextSteps[sIdx] = { ...step, title: e.target.value };
                                handlePropChange('steps', nextSteps);
                              }}
                              placeholder="Step title..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={step.description || ''}
                              onChange={(e) => {
                                const nextSteps = [...selectedSection.props.steps];
                                nextSteps[sIdx] = { ...step, description: e.target.value };
                                handlePropChange('steps', nextSteps);
                              }}
                              placeholder="Step description..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TESTIMONIALS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'testimonials' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          Reviews & Endorsements ({selectedSection.props.items?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = [
                              ...(selectedSection.props.items || []),
                              { quote: 'Outstanding execution and precision results.', author: 'Executive Name', role: 'Partner', company: 'Company LLC', rating: 5, verified: true }
                            ];
                            handlePropChange('items', nextItems);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Review</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.items || []).map((t: any, tIdx: number) => (
                          <div key={tIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white">{t.author || 'Reviewer'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = selectedSection.props.items.filter((_: any, i: number) => i !== tIdx);
                                  handlePropChange('items', nextItems);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={t.quote || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[tIdx] = { ...t, quote: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Testimonial quote..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-200 text-xs italic"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={t.author || ''}
                                onChange={(e) => {
                                  const nextItems = [...selectedSection.props.items];
                                  nextItems[tIdx] = { ...t, author: e.target.value };
                                  handlePropChange('items', nextItems);
                                }}
                                placeholder="Author name"
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-[11px]"
                              />
                              <input
                                type="text"
                                value={t.company || ''}
                                onChange={(e) => {
                                  const nextItems = [...selectedSection.props.items];
                                  nextItems[tIdx] = { ...t, company: e.target.value };
                                  handlePropChange('items', nextItems);
                                }}
                                placeholder="Company"
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-[11px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MAP & BUSINESS HOURS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'map_hours' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-sky-400">
                          Office Location & Contacts
                        </label>
                        <input
                          type="text"
                          value={selectedSection.props.city || ''}
                          onChange={(e) => handlePropChange('city', e.target.value)}
                          placeholder="City / Region"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                        />
                        <input
                          type="text"
                          value={selectedSection.props.address || ''}
                          onChange={(e) => handlePropChange('address', e.target.value)}
                          placeholder="Street Address"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={selectedSection.props.phone || ''}
                            onChange={(e) => handlePropChange('phone', e.target.value)}
                            placeholder="Phone Number"
                            className="w-full px-2 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                          />
                          <input
                            type="text"
                            value={selectedSection.props.email || ''}
                            onChange={(e) => handlePropChange('email', e.target.value)}
                            placeholder="Email Address"
                            className="w-full px-2 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-400">
                          Operating Hours
                        </label>
                        {(selectedSection.props.hours || []).map((h: any, hIdx: number) => (
                          <div key={hIdx} className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={h.day || ''}
                              onChange={(e) => {
                                const nextHours = [...selectedSection.props.hours];
                                nextHours[hIdx] = { ...h, day: e.target.value };
                                handlePropChange('hours', nextHours);
                              }}
                              className="px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs"
                            />
                            <input
                              type="text"
                              value={h.time || ''}
                              onChange={(e) => {
                                const nextHours = [...selectedSection.props.hours];
                                nextHours[hIdx] = { ...h, time: e.target.value };
                                handlePropChange('hours', nextHours);
                              }}
                              className="px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DESIGN & COLORS */}
              {inspectorTab === 'design' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Background Mode Toggle */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase text-slate-400">
                      Background Fill Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs">
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'solid')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          selectedSection.styles?.backgroundType === 'solid'
                            ? 'bg-sky-500 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'gradient')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          selectedSection.styles?.backgroundType === 'gradient'
                            ? 'bg-sky-500 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Gradient
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'default')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          !selectedSection.styles?.backgroundType || selectedSection.styles?.backgroundType === 'default'
                            ? 'bg-slate-700 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Default
                      </button>
                    </div>
                  </div>

                  {/* SOLID COLOR PICKER */}
                  {selectedSection.styles?.backgroundType === 'solid' && (
                    <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Section Background Color</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedSection.styles?.backgroundColor || '#09090B'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="w-7 h-7 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.backgroundColor || '#09090B'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[11px] uppercase"
                          />
                        </div>
                      </div>

                      {/* Luxury Palette Swatches */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Luxury Curated Swatches
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {SOLID_SWATCHES.map((sw, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleStyleChange('backgroundColor', sw.hex)}
                              title={`${sw.name} (${sw.hex})`}
                              className={`h-9 rounded-lg border transition transform hover:scale-105 flex flex-col justify-end p-1 text-[9px] font-mono ${
                                selectedSection.styles?.backgroundColor?.toLowerCase() === sw.hex.toLowerCase()
                                  ? 'ring-2 ring-sky-400 border-white'
                                  : 'border-white/10'
                              }`}
                              style={{ backgroundColor: sw.hex }}
                            >
                              <span className={`truncate ${sw.hex === '#FFFFFF' || sw.hex === '#FAF8F5' ? 'text-black font-bold' : 'text-white/80'}`}>
                                {sw.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GRADIENT BUILDER & PRESETS */}
                  {selectedSection.styles?.backgroundType === 'gradient' && (
                    <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-4">
                      {/* One-Click Presets */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">Luxury Gradient Presets</span>
                          <span className="text-[10px] text-sky-400 font-mono">1-Click Apply</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {GRADIENT_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyGradientPreset(p.css, p.name, p.from, p.to)}
                              className={`h-14 rounded-xl border p-2 text-left flex flex-col justify-between transition group transform hover:scale-[1.02] shadow-sm ${
                                selectedSection.styles?.gradient === p.css
                                  ? 'ring-2 ring-sky-400 border-white'
                                  : 'border-white/10'
                              }`}
                              style={{ background: p.css }}
                            >
                              <span className={`text-[10px] font-bold leading-tight ${p.name.includes('Light') ? 'text-slate-900' : 'text-white'}`}>
                                {p.name}
                              </span>
                              <span className={`text-[9px] font-mono opacity-70 ${p.name.includes('Light') ? 'text-slate-700' : 'text-white'}`}>
                                {p.from} → {p.to}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Dual-Color Builder */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Custom Gradient Builder
                        </div>

                        {/* Direction */}
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { label: 'Diagonal', val: '135deg' },
                            { label: 'Horizontal', val: 'to right' },
                            { label: 'Vertical', val: 'to bottom' },
                            { label: 'Radial', val: 'radial' }
                          ].map((d) => (
                            <button
                              key={d.val}
                              type="button"
                              onClick={() => {
                                setCustomGradDir(d.val);
                                handleUpdateCustomGradient(d.val, customGradFrom, customGradTo);
                              }}
                              className={`py-1 rounded border text-center transition ${
                                customGradDir === d.val
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>

                        {/* Color From & To */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Start Color</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="color"
                                value={customGradFrom}
                                onChange={(e) => {
                                  setCustomGradFrom(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, e.target.value, customGradTo);
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                              />
                              <input
                                type="text"
                                value={customGradFrom}
                                onChange={(e) => {
                                  setCustomGradFrom(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, e.target.value, customGradTo);
                                }}
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">End Color</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="color"
                                value={customGradTo}
                                onChange={(e) => {
                                  setCustomGradTo(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, customGradFrom, e.target.value);
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                              />
                              <input
                                type="text"
                                value={customGradTo}
                                onChange={(e) => {
                                  setCustomGradTo(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, customGradFrom, e.target.value);
                                }}
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live gradient output preview */}
                        {selectedSection.styles?.gradient && (
                          <div
                            className="h-6 w-full rounded-lg border border-white/20 shadow-inner mt-1"
                            style={{ background: selectedSection.styles.gradient }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* AMBIENT FX & BACKGROUND TEXTURES */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Ambient FX & Textures
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {selectedSection.styles?.backgroundPattern && selectedSection.styles.backgroundPattern !== 'none'
                          ? selectedSection.styles.backgroundPattern.replace('_', ' ')
                          : 'None'}
                      </span>
                    </div>

                    {/* Pattern Selection Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {PATTERN_OPTIONS.map((pat) => {
                        const Icon = pat.icon;
                        const isCurrent =
                          (!selectedSection.styles?.backgroundPattern && pat.id === 'none') ||
                          selectedSection.styles?.backgroundPattern === pat.id;
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => handleStyleChange('backgroundPattern', pat.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition group ${
                              isCurrent
                                ? 'bg-sky-950/60 border-sky-400 ring-1 ring-sky-400 text-white shadow-sm'
                                : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg border mt-0.5 ${
                              isCurrent
                                ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                                : 'bg-[#141C2A] border-[#222E42] text-slate-400 group-hover:text-white'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold truncate leading-tight">
                                {pat.label}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                {pat.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Opacity / Intensity Controls (active when a pattern is chosen) */}
                    {selectedSection.styles?.backgroundPattern && selectedSection.styles.backgroundPattern !== 'none' && (
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Texture Intensity</span>
                          <span className="text-sky-400 font-mono text-[11px] font-semibold">
                            {Math.round((selectedSection.styles?.patternOpacity ?? 0.35) * 100)}%
                          </span>
                        </div>

                        {/* Preset quick buttons */}
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { label: 'Subtle', val: 0.15 },
                            { label: 'Balanced', val: 0.35 },
                            { label: 'Vivid', val: 0.60 },
                            { label: 'Max', val: 0.90 }
                          ].map((op) => {
                            const currentVal = selectedSection.styles?.patternOpacity ?? 0.35;
                            const isMatch = Math.abs(currentVal - op.val) < 0.05;
                            return (
                              <button
                                key={op.label}
                                type="button"
                                onClick={() => handleStyleChange('patternOpacity', op.val)}
                                className={`py-1 rounded border text-center font-medium transition ${
                                  isMatch
                                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                    : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                                }`}
                              >
                                {op.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Continuous Precision Slider */}
                        <div className="flex items-center space-x-2 pt-0.5">
                          <input
                            type="range"
                            min="0.05"
                            max="1.0"
                            step="0.05"
                            value={selectedSection.styles?.patternOpacity ?? 0.35}
                            onChange={(e) => handleStyleChange('patternOpacity', parseFloat(e.target.value))}
                            className="w-full accent-sky-500 cursor-pointer h-1.5 bg-[#0E1522] rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TYPOGRAPHY COLORS: HEADINGS & BODY */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-4">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Text & Typography Colors
                    </div>

                    {/* Heading Color */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Headings (H1/H2)</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.headingColor || '#FFFFFF'}
                            onChange={(e) => handleStyleChange('headingColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.headingColor || '#FFFFFF'}
                            onChange={(e) => handleStyleChange('headingColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {TEXT_COLOR_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('headingColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Body Text Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Body & Paragraphs</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.textColor || '#CBD5E1'}
                            onChange={(e) => handleStyleChange('textColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.textColor || '#CBD5E1'}
                            onChange={(e) => handleStyleChange('textColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {TEXT_COLOR_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('textColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Accent & Button CTA</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.accentColor || '#0284C7'}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.accentColor || '#0284C7'}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {ACCENT_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('accentColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SPACING & VERTICAL PADDING */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
                    <label className="block text-[11px] font-semibold uppercase text-slate-400">
                      Block Vertical Padding
                    </label>
                    <div className="grid grid-cols-4 gap-1 text-[11px]">
                      {[
                        { label: 'Compact', val: 'py-12' },
                        { label: 'Balanced', val: 'py-20' },
                        { label: 'Spacious', val: 'py-28' },
                        { label: 'Epic', val: 'py-36' }
                      ].map((pad) => (
                        <button
                          key={pad.val}
                          type="button"
                          onClick={() => handleStyleChange('paddingY', pad.val)}
                          className={`py-1.5 rounded-lg border text-center transition ${
                            selectedSection.styles?.paddingY === pad.val
                              ? 'bg-sky-600 border-sky-400 text-white font-bold'
                              : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                          }`}
                        >
                          {pad.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI COPILOT */}
              {inspectorTab === 'ai' && (
                <div className="p-4 rounded-xl bg-[#131A26] border border-[#222E42] space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Targeted AI Copilot</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleAIAction('improve_headline')}
                      className="p-2 rounded-lg bg-[#0E1522] border border-[#222E42] text-[10px] font-semibold text-slate-300 hover:text-white hover:border-indigo-500 transition text-left"
                    >
                      ⚡ Improve Headline
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleAIAction('shorten_paragraph')}
                      className="p-2 rounded-lg bg-[#0E1522] border border-[#222E42] text-[10px] font-semibold text-slate-300 hover:text-white hover:border-indigo-500 transition text-left"
                    >
                      ✂️ Shorten Text
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleAIAction('rewrite_brand_voice')}
                      className="p-2 rounded-lg bg-[#0E1522] border border-[#222E42] text-[10px] font-semibold text-slate-300 hover:text-white hover:border-indigo-500 transition text-left"
                    >
                      🎯 Brand Voice Rewrite
                    </button>
                    <button
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleAIAction('suggest_layout_variant')}
                      className="p-2 rounded-lg bg-[#0E1522] border border-[#222E42] text-[10px] font-semibold text-slate-300 hover:text-white hover:border-indigo-500 transition text-left"
                    >
                      📐 Suggest Variant
                    </button>
                  </div>

                  {/* Natural Language Prompt */}
                  <div className="pt-2">
                    <div className="flex space-x-1.5">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Move case studies above contact..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-[11px] focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        disabled={aiLoading || !aiPrompt.trim()}
                        onClick={() => handleAIAction('natural_language_refine')}
                        className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {aiNotice && (
                    <div className="p-2.5 rounded-lg bg-indigo-950/50 border border-indigo-800 text-indigo-300 text-[10px] leading-relaxed">
                      {aiNotice}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a section in the preview canvas to inspect its properties.
            </div>
          )}
        </div>
      </div>

      {/* Section Library Drawer */}
      <SectionLibraryDrawer
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectComponent={handleInsertSection}
      />
    </div>
  );
}

export default function VisualWebsiteEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#080C14] text-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Loading Move Studio Editor...</span>
          </div>
        </div>
      }
    >
      <VisualWebsiteEditorContent />
    </Suspense>
  );
}
