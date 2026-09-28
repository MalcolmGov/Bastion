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
  RotateCcw
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance, DesignCollectionId } from '@/lib/studio/types';

function VisualWebsiteEditorContent() {
  const searchParams = useSearchParams();
  const siteSlugParam = searchParams.get('siteSlug') || searchParams.get('siteId');
  const { activeClient, activeSite } = useStudioWorkspace();

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

  // Fetch composition from API
  useEffect(() => {
    async function loadComposition() {
      try {
        const res = await fetch(`/api/admin/editor?siteId=${siteSlug}&pageSlug=${activePageSlug}`);
        if (res.ok) {
          const data = await res.json();
          setSiteData(data.site);
          setBrandKit(data.brandKit);

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

        {/* RIGHT PANEL: Selected Section Inspector & AI Assistant (340px) */}
        <div className="w-80 bg-[#0A0D14] border-l border-[#1E293B] flex flex-col justify-between shrink-0 overflow-y-auto">
          {selectedSection ? (
            <div className="p-4 space-y-6">
              <div>
                <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Block Inspector: {selectedSection.componentId.replace('_', ' ')}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Adjust section copy, design variants, and media tokens.
                </div>
              </div>

              {/* Layout Variant Dropdown */}
              {registeredComp?.variants && registeredComp.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold uppercase text-slate-400">
                    Component Layout Variant
                  </label>
                  <select
                    value={selectedSection.variant}
                    onChange={(e) => handleVariantChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs"
                  >
                    {registeredComp.variants.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Editable Fields */}
              <div className="space-y-4">
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

                {selectedSection.props.subtitle !== undefined && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                      Supporting Subtitle / Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={selectedSection.props.subtitle || ''}
                      onChange={(e) => handlePropChange('subtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                {selectedSection.props.primaryCta && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={selectedSection.props.primaryCta.label || ''}
                      onChange={(e) => handlePropChange('primaryCta', { ...selectedSection.props.primaryCta, label: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Targeted AI Actions */}
              <div className="p-4 rounded-xl bg-[#131A26] border border-[#222E42] space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Targeted AI Assistance</span>
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
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Select a section in the preview canvas to inspect its properties.
            </div>
          )}
        </div>
      </div>
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
