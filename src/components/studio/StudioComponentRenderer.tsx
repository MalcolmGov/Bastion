'use client';

import React, { useState } from 'react';
import {
  Edit3,
  Sparkles,
  MoveUp,
  MoveDown,
  Copy,
  Trash2,
  Sliders,
  Check,
  Eye,
  CornerDownRight,
  AlignLeft,
  AlignCenter,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import type { SectionInstance, DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { StudioHeader } from './StudioHeader';
import { StudioHero } from './StudioHero';
import { StudioServices } from './StudioServices';
import { StudioCaseStudies } from './StudioCaseStudies';
import { StudioTeam } from './StudioTeam';
import { StudioRichText } from './StudioRichText';
import { StudioCta } from './StudioCta';
import { StudioContactForm } from './StudioContactForm';
import { StudioFooter } from './StudioFooter';
import { StudioPricing } from './StudioPricing';
import { StudioFaq } from './StudioFaq';
import { StudioProcess } from './StudioProcess';
import { StudioComparison } from './StudioComparison';
import { StudioTestimonials } from './StudioTestimonials';
import { StudioMap } from './StudioMap';

interface RendererProps {
  section: SectionInstance;
  collection: DesignCollectionId;
  isEditor?: boolean;
  minimalEditorControls?: boolean;
  onSelectSection?: (sectionId: string) => void;
  onSelectField?: (sectionId: string, fieldPath: string) => void;
  onMoveUp?: (sectionId: string) => void;
  onMoveDown?: (sectionId: string) => void;
  onDuplicate?: (sectionId: string) => void;
  onDelete?: (sectionId: string) => void;
  onAiPolish?: (sectionId: string) => void;
  onQuickStyleChange?: (sectionId: string, key: keyof SectionStyles, val: any) => void;
  onOpenDesignTab?: (sectionId: string) => void;
  isSelected?: boolean;
  focusedFieldPath?: string | null;
}

export function StudioComponentRenderer({
  section,
  collection,
  isEditor = false,
  minimalEditorControls = false,
  onSelectSection,
  onSelectField,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAiPolish,
  onQuickStyleChange,
  onOpenDesignTab,
  isSelected = false,
  focusedFieldPath
}: RendererProps) {
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  if (!section.visible && !isEditor) {
    return null;
  }

  let renderedContent: React.ReactNode = null;

  switch (section.componentId) {
    case 'header':
      renderedContent = <StudioHeader props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'hero':
      renderedContent = <StudioHero props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'services_grid':
      renderedContent = <StudioServices props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} />;
      break;
    case 'case_studies':
      renderedContent = <StudioCaseStudies props={section.props as any} collection={collection} variant={section.variant} />;
      break;
    case 'team':
      renderedContent = <StudioTeam props={section.props as any} collection={collection} variant={section.variant} />;
      break;
    case 'rich_text':
      renderedContent = <StudioRichText props={section.props as any} collection={collection} variant={section.variant} />;
      break;
    case 'cta':
      renderedContent = <StudioCta props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'contact_form':
      renderedContent = <StudioContactForm props={section.props as any} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'footer':
      renderedContent = <StudioFooter props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} />;
      break;
    case 'pricing':
      renderedContent = <StudioPricing props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'faq':
      renderedContent = <StudioFaq props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'process':
      renderedContent = <StudioProcess props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'comparison':
      renderedContent = <StudioComparison props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'testimonials':
      renderedContent = <StudioTestimonials props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    case 'map_hours':
      renderedContent = <StudioMap props={section.props as any} styles={section.styles} collection={collection} variant={section.variant} isEditor={isEditor} />;
      break;
    default:
      renderedContent = (
        <div className="p-8 text-center bg-slate-100 border border-dashed border-slate-300 text-slate-500 text-xs font-mono">
          [Component: {section.componentId} (Variant: {section.variant})]
        </div>
      );
  }

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectSection?.(section.id);

    const target = e.target as HTMLElement;
    const cmsFieldElement = target.closest('[data-cms-field]') as HTMLElement;
    if (cmsFieldElement) {
      const field = cmsFieldElement.getAttribute('data-cms-field');
      if (field) {
        onSelectField?.(section.id, field);
        return;
      }
    }

    const tag = target.tagName.toLowerCase();
    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || target.closest('h1, h2, h3')) {
      onSelectField?.(section.id, 'title');
    } else if (tag === 'p' || target.closest('p')) {
      onSelectField?.(section.id, 'subtitle');
    } else if (tag === 'button' || tag === 'a' || target.closest('button, a')) {
      onSelectField?.(section.id, 'primaryCta');
    } else if (tag === 'img' || target.closest('img')) {
      onSelectField?.(section.id, 'image');
    } else {
      onSelectField?.(section.id, 'title');
    }
  };

  if (isEditor) {
    return (
      <div
        onClick={handleElementClick}
        className={`relative transition duration-200 group/block ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-inset z-10'
            : 'hover:ring-1 hover:ring-sky-400/80 cursor-pointer'
        } ${!section.visible ? 'opacity-40 grayscale' : ''}`}
      >
        {/* Floating Executive Quick Action Toolbar on Active Block */}
        {isSelected && !minimalEditorControls && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
            {/* Left Block Pill */}
            <div className="flex items-center space-x-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl border border-sky-500/50 shadow-xl backdrop-blur-md text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="uppercase tracking-wider">Block: {section.componentId.replace('_', ' ')}</span>
              {focusedFieldPath && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-sky-300 font-mono text-[10px] flex items-center gap-1">
                    <Edit3 className="w-3 h-3 text-sky-400" />
                    {focusedFieldPath}
                  </span>
                </>
              )}
            </div>

            {/* Right Quick Actions Bar */}
            <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-md text-white text-xs">
              {/* Alignment Quick-Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextAlign = section.styles?.alignment === 'center' ? 'left' : 'center';
                  onQuickStyleChange?.(section.id, 'alignment', nextAlign);
                }}
                title={`Text Alignment: ${section.styles?.alignment || 'left'} (Click to toggle)`}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-sky-400 transition cursor-pointer"
              >
                {section.styles?.alignment === 'center' ? (
                  <AlignCenter className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <AlignLeft className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Theme Quick-Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const isDark = section.styles?.theme === 'dark';
                  onQuickStyleChange?.(section.id, 'theme', isDark ? 'light' : 'dark');
                }}
                title={`Theme: ${section.styles?.theme || 'light'} (Click to toggle)`}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition cursor-pointer"
              >
                {section.styles?.theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
              </button>

              {/* Design Tab Shortcut */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDesignTab?.(section.id);
                }}
                title="Open Design & Spacing Inspector"
                className="px-2 py-1 rounded-lg bg-sky-950/80 border border-sky-500/30 hover:bg-sky-900/80 text-sky-300 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
              >
                <Palette className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">Design</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAiPolish?.(section.id);
                }}
                title="AI Polish Copy with Bastion Content Agent"
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center space-x-1 transition shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-200" />
                <span>AI Polish</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectField?.(section.id, 'title');
                }}
                title="Jump to Content Inspector"
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center space-x-1 transition cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-sky-400" />
                <span className="hidden sm:inline">Fields</span>
              </button>

              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.(section.id);
                }}
                title="Move Block Up"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <MoveUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.(section.id);
                }}
                title="Move Block Down"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <MoveDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(section.id);
                }}
                title="Duplicate Block"
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(section.id);
                }}
                title="Delete Block"
                className="p-1 rounded-lg hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {renderedContent}
      </div>
    );
  }

  return <>{renderedContent}</>;
}
