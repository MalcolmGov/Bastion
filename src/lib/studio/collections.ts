/**
 * Move Studio — Curated Design Collections
 * Governs the visual design language, typography rules, surface styles, and component variant mappings for:
 * 1. Editorial
 * 2. Contemporary
 * 3. Immersive
 */

import type { DesignCollectionId } from './types';

export interface DesignCollectionDefinition {
  id: DesignCollectionId;
  name: string;
  tagline: string;
  description: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    headingStyle: string;
    bodyStyle: string;
    scaleRatio: number;
    recommendedMaxHeadlineChars: number;
  };
  surfaces: {
    backgroundClass: string;
    cardClass: string;
    borderClass: string;
    hairlineClass: string;
    badgeClass: string;
  };
  buttons: {
    primaryClass: string;
    secondaryClass: string;
    pillClass: string;
  };
  spacing: {
    sectionPadding: string;
    containerWidth: string;
    gridGap: string;
  };
  imagery: {
    aspectRatio: string;
    roundedCorner: string;
    treatment: string;
  };
}

export const DESIGN_COLLECTIONS: Record<DesignCollectionId, DesignCollectionDefinition> = {
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Refined, spacious, and typographic prestige.',
    description: 'Inspired by leading architectural monographs and financial journalism. Features commanding serif display headings, generous margins, restrained borders, and warm reading surfaces.',
    typography: {
      headingFont: 'Playfair Display, Georgia, serif',
      bodyFont: 'Plus Jakarta Sans, Inter, sans-serif',
      headingStyle: 'font-serif tracking-tight font-normal leading-[1.15]',
      bodyStyle: 'font-sans font-normal leading-relaxed text-gray-700',
      scaleRatio: 1.333,
      recommendedMaxHeadlineChars: 65
    },
    surfaces: {
      backgroundClass: 'bg-[#F7F6F2] text-[#172C3D]',
      cardClass: 'bg-white border border-[#E2E7EA] shadow-sm',
      borderClass: 'border-[#E2E7EA]',
      hairlineClass: 'border-b border-[#E2E7EA]',
      badgeClass: 'bg-[#F0E4CE] text-[#76571F] border border-[#C8A064]/30'
    },
    buttons: {
      primaryClass: 'bg-[#082B49] text-white hover:bg-[#003068] transition font-medium px-6 py-3 rounded-none shadow-sm',
      secondaryClass: 'border border-[#082B49] text-[#082B49] hover:bg-[#082B49]/5 transition font-medium px-6 py-3 rounded-none',
      pillClass: 'rounded-full px-4 py-1.5 text-xs font-semibold'
    },
    spacing: {
      sectionPadding: 'py-20 md:py-28',
      containerWidth: 'max-w-6xl mx-auto px-6',
      gridGap: 'gap-8 md:gap-12'
    },
    imagery: {
      aspectRatio: 'aspect-[16/10]',
      roundedCorner: 'rounded-none',
      treatment: 'Warm natural grading with subtle film curve'
    }
  },
  contemporary: {
    id: 'contemporary',
    name: 'Contemporary',
    tagline: 'Crisp, structural, and precision-engineered.',
    description: 'Engineered for high-performing modern technology and advisory practices. Features high-contrast sans-serif geometry, crisp card outlines, electric accent badges, and structural data hierarchy.',
    typography: {
      headingFont: 'Plus Jakarta Sans, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingStyle: 'font-sans font-bold tracking-tight leading-[1.12]',
      bodyStyle: 'font-sans text-slate-600 leading-relaxed',
      scaleRatio: 1.25,
      recommendedMaxHeadlineChars: 55
    },
    surfaces: {
      backgroundClass: 'bg-[#F8FAFC] text-[#0F172A]',
      cardClass: 'bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition',
      borderClass: 'border-[#E2E8F0]',
      hairlineClass: 'border-b border-[#E2E8F0]',
      badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200'
    },
    buttons: {
      primaryClass: 'bg-[#0F172A] text-white hover:bg-slate-800 transition font-semibold px-5 py-2.5 rounded-lg shadow-sm',
      secondaryClass: 'border border-slate-300 text-slate-800 hover:bg-slate-50 transition font-semibold px-5 py-2.5 rounded-lg',
      pillClass: 'rounded-full px-3 py-1 text-xs font-bold'
    },
    spacing: {
      sectionPadding: 'py-16 md:py-24',
      containerWidth: 'max-w-7xl mx-auto px-6',
      gridGap: 'gap-6 md:gap-8'
    },
    imagery: {
      aspectRatio: 'aspect-[16/9]',
      roundedCorner: 'rounded-xl',
      treatment: 'High-contrast, sharp architectural framing'
    }
  },
  immersive: {
    id: 'immersive',
    name: 'Immersive',
    tagline: 'Sensory, cinematic, and atmospheric depth.',
    description: 'Designed for experience-led brands, luxury dining, and cultural showcases. Features deep obsidian and dark zinc surfaces, warm amber or gold illumination, full-bleed visual canvases, and poetic typography.',
    typography: {
      headingFont: 'Playfair Display, Cormorant Garamond, serif',
      bodyFont: 'Plus Jakarta Sans, Inter, sans-serif',
      headingStyle: 'font-serif tracking-normal font-normal leading-[1.18] text-white',
      bodyStyle: 'font-sans text-zinc-300 leading-relaxed',
      scaleRatio: 1.333,
      recommendedMaxHeadlineChars: 70
    },
    surfaces: {
      backgroundClass: 'bg-[#09090B] text-[#FAFAFA]',
      cardClass: 'bg-[#141416] border border-[#27272A] shadow-xl',
      borderClass: 'border-[#27272A]',
      hairlineClass: 'border-b border-[#27272A]',
      badgeClass: 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
    },
    buttons: {
      primaryClass: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-500 hover:to-amber-600 transition font-medium px-6 py-3 rounded-md shadow-md',
      secondaryClass: 'border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white transition font-medium px-6 py-3 rounded-md',
      pillClass: 'rounded-full px-4 py-1 text-xs font-medium tracking-wider'
    },
    spacing: {
      sectionPadding: 'py-24 md:py-32',
      containerWidth: 'max-w-6xl mx-auto px-6',
      gridGap: 'gap-8 md:gap-12'
    },
    imagery: {
      aspectRatio: 'aspect-[4/3] md:aspect-[16/10]',
      roundedCorner: 'rounded-md',
      treatment: 'Moody cinematic chiaroscuro with warm highlight bloom'
    }
  }
};
