'use client';

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Code2,
  ChevronDown,
  ChevronUp,
  Check,
  Grid,
  FileText,
  CreditCard,
  HelpCircle,
  MessageSquareQuote,
  Scale,
  Briefcase,
  Users,
  Compass,
  Activity,
  Globe,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';

interface DynamicZonesBuilderProps {
  sections: SectionInstance[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onUpdateSections: (sections: SectionInstance[]) => void;
  onOpenLibrary: () => void;
  onOpenContentAgent?: (sectionId: string) => void;
}

// Category tags and colors for dynamic zone blocks
const COMPONENT_CATEGORY_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  hero: { label: 'Hero & Intro', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Zap },
  kpis: { label: 'Telemetry & KPIs', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Activity },
  operations_map: { label: 'Global Assets', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: Globe },
  services_grid: { label: 'Core Capabilities', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30', icon: Grid },
  case_studies: { label: 'Track Record & ESG', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30', icon: TrendingUp },
  pricing: { label: 'Commerce & Plans', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: CreditCard },
  testimonials: { label: 'Social Proof', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: MessageSquareQuote },
  team: { label: 'Governance & Board', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Users },
  faq: { label: 'Inquiries & FAQ', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: HelpCircle },
  comparison: { label: 'Matrix & Audit', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30', icon: Scale },
  process: { label: 'Operations Roadmap', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30', icon: Compass },
  contact: { label: 'Conversion & CTA', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldCheck }
};

export function DynamicZonesBuilder({
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSections,
  onOpenLibrary,
  onOpenContentAgent
}: DynamicZonesBuilderProps) {
  const [showDevSchema, setShowDevSchema] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'content' | 'telemetry' | 'conversion'>('all');

  // Move section up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateSections(reordered);
  };

  // Duplicate an existing block with a new unique ID
  const handleDuplicate = (sec: SectionInstance, index: number) => {
    const duplicated: SectionInstance = {
      ...JSON.parse(JSON.stringify(sec)),
      id: `${sec.componentId}-${Date.now().toString(36)}`,
      props: {
        ...sec.props,
        title: sec.props.title ? `${sec.props.title} (Copy)` : undefined
      }
    };
    const updated = [...sections.slice(0, index + 1), duplicated, ...sections.slice(index + 1)];
    onUpdateSections(updated);
    onSelectSection(duplicated.id);
  };

  // Toggle block visibility
  const handleToggleVisibility = (id: string) => {
    const updated = sections.map(s => {
      if (s.id !== id) return s;
      return { ...s, visible: !s.visible };
    });
    onUpdateSections(updated);
  };

  // Delete a block
  const handleDelete = (id: string) => {
    if (sections.length <= 1) {
      alert('A page composition must have at least one block.');
      return;
    }
    const updated = sections.filter(s => s.id !== id);
    onUpdateSections(updated);
    if (selectedSectionId === id) {
      onSelectSection(updated[0]?.id || '');
    }
  };

  // Change layout variant directly on the block card
  const handleVariantChange = (sectionId: string, variantId: string) => {
    const updated = sections.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, variant: variantId };
    });
    onUpdateSections(updated);
  };

  // Filter sections if category filter is active
  const filteredSections = sections.filter(sec => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'telemetry') return ['kpis', 'operations_map', 'case_studies'].includes(sec.componentId);
    if (categoryFilter === 'conversion') return ['pricing', 'contact', 'faq'].includes(sec.componentId);
    if (categoryFilter === 'content') return !['kpis', 'operations_map', 'pricing', 'contact'].includes(sec.componentId);
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0A0D14] text-white">
      {/* Dynamic Zone Top Toolbar */}
      <div className="p-3.5 border-b border-[#1E293B] bg-[#0E1522]/80 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Dynamic Zones</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">
                  {sections.length} blocks
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Strapi & Sanity Block Model</div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setShowDevSchema(!showDevSchema)}
              title="View Dynamic Zone Schema definition"
              className={`p-1.5 rounded-lg border text-xs transition flex items-center space-x-1 ${
                showDevSchema
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-[#141C2A] border-[#222E42] text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenLibrary}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-[11px] flex items-center space-x-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 text-[10px] overflow-x-auto pb-0.5">
          {(['all', 'content', 'telemetry', 'conversion'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setCategoryFilter(tab)}
              className={`px-2 py-0.5 rounded-md font-medium capitalize transition ${
                categoryFilter === tab
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Developer Schema Preview Modal/Drawer if opened */}
      {showDevSchema && (
        <div className="p-3 bg-[#05070B] border-b border-indigo-900/50 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono text-indigo-400 font-bold">DynamicZone Contract Schema</span>
            <span className="text-[10px] text-slate-500">JSON-RPC / REST Ready</span>
          </div>
          <pre className="text-[10px] font-mono p-2 rounded bg-[#0A0D14] border border-[#1E293B] text-sky-300 max-h-36 overflow-y-auto">
{JSON.stringify({
  zone: 'page_composition',
  blockCount: sections.length,
  components: sections.map(s => ({
    id: s.id,
    component: s.componentId,
    variant: s.variant,
    visible: s.visible,
    dataFields: Object.keys(s.props)
  }))
}, null, 2)}
          </pre>
        </div>
      )}

      {/* Visual Block Stack List */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {filteredSections.map((sec, idx) => {
          const isSelected = sec.id === selectedSectionId;
          const regMeta = COMPONENT_REGISTRY[sec.componentId as keyof typeof COMPONENT_REGISTRY];
          const catMeta = COMPONENT_CATEGORY_META[sec.componentId] || {
            label: 'Custom Block',
            color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
            icon: Grid
          };
          const CatIcon = catMeta.icon;

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden group ${
                isSelected
                  ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-400 shadow-md shadow-sky-950/50'
                  : 'bg-[#121824] border-[#1E293B] hover:border-slate-600 hover:bg-[#151D2C]'
              } ${!sec.visible ? 'opacity-50' : ''}`}
            >
              {/* Block Card Header */}
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg border mt-0.5 shrink-0 ${catMeta.color}`}>
                    <CatIcon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        0{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-white truncate">
                        {regMeta?.name || sec.componentId.replace('_', ' ')}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wider ${catMeta.color}`}>
                        {catMeta.label}
                      </span>
                    </div>

                    {/* Headline excerpt preview */}
                    <div className="text-[11px] text-slate-400 truncate mt-1 max-w-[200px]">
                      {sec.props.title || sec.props.eyebrow || sec.props.quote || 'Standard modular section'}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-0.5 shrink-0">
                  {onOpenContentAgent && (
                    <button
                      type="button"
                      title="AI Content Agent Refinement"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSection(sec.id);
                        onOpenContentAgent(sec.id);
                      }}
                      className="p-1 rounded text-indigo-400 hover:text-white hover:bg-indigo-600/30 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    title={sec.visible ? 'Hide section' : 'Show section'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(sec.id);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                </div>
              </div>

              {/* Block Card Sub-bar: Variant selector & Position controls */}
              <div className="px-3 py-2 bg-[#0B101A] border-t border-[#1C2536] flex items-center justify-between text-xs">
                {/* Variant Switcher */}
                {regMeta?.variants && regMeta.variants.length > 0 ? (
                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Variant:</span>
                    <select
                      value={sec.variant}
                      onChange={(e) => handleVariantChange(sec.id, e.target.value)}
                      className="px-2 py-0.5 rounded bg-[#141C2A] border border-[#232F42] text-[10px] text-sky-300 font-medium focus:outline-none focus:border-sky-500"
                    >
                      {regMeta.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500">Default Variant</span>
                )}

                {/* Micro Actions: Up, Down, Duplicate, Delete */}
                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    title="Move up"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Duplicate block"
                    onClick={() => handleDuplicate(sec, idx)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    title="Delete block"
                    onClick={() => handleDelete(sec.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Big Add Block Card at the Bottom */}
        <button
          type="button"
          onClick={onOpenLibrary}
          className="w-full py-4 px-4 rounded-xl border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 transition group shadow-sm"
        >
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition">
            <Plus className="w-4 h-4" />
          </div>
          <span>Insert New Dynamic Zone Block</span>
        </button>
      </div>
    </div>
  );
}
