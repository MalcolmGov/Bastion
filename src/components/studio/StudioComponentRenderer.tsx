'use client';

import React from 'react';
import type { SectionInstance, DesignCollectionId } from '@/lib/studio/types';
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
  onSelectSection?: (sectionId: string) => void;
  isSelected?: boolean;
}

export function StudioComponentRenderer({
  section,
  collection,
  isEditor = false,
  onSelectSection,
  isSelected = false
}: RendererProps) {
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

  if (isEditor) {
    return (
      <div
        onClick={() => onSelectSection?.(section.id)}
        className={`relative transition cursor-pointer ${
          isSelected
            ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900 z-10'
            : 'hover:ring-1 hover:ring-sky-300'
        } ${!section.visible ? 'opacity-40 grayscale' : ''}`}
      >
        {isSelected && (
          <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-sky-600 text-white font-mono text-[10px] uppercase font-bold shadow-md">
            Active Block: {section.componentId}
          </div>
        )}
        {renderedContent}
      </div>
    );
  }

  return <>{renderedContent}</>;
}
