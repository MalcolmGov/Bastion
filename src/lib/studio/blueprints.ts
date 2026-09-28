/**
 * Move Studio — Website Blueprints
 * Defines structural architecture, required pages, modules, and target conversions for:
 * 1. Corporate
 * 2. Professional Services
 * 3. Hospitality & Lifestyle
 */

import type { BlueprintId, IndustryType } from './types';

export interface BlueprintDefinition {
  id: BlueprintId;
  name: string;
  tagline: string;
  description: string;
  recommendedIndustries: IndustryType[];
  defaultPages: Array<{
    slug: string;
    title: string;
    description: string;
    isPrimary: boolean;
  }>;
  coreModules: string[];
  optionalModules: string[];
  primaryConversionActions: string[];
}

export const BLUEPRINTS: Record<BlueprintId, BlueprintDefinition> = {
  corporate: {
    id: 'corporate',
    name: 'Corporate Flagship',
    tagline: 'Authoritative, multi-stakeholder corporate presence.',
    description: 'Designed for publicly traded and enterprise organizations requiring rigorous governance, investor disclosures, sustainability tracking, and global operations mapping.',
    recommendedIndustries: ['corporate', 'mining_resources', 'retail', 'general'],
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Executive hero, operational telemetry, strategic highlights, latest releases.', isPrimary: true },
      { slug: 'about', title: 'About & Governance', description: 'Corporate purpose, board of directors, executive committee, heritage.', isPrimary: true },
      { slug: 'operations', title: 'Operations & Assets', description: 'Global operations directory, interactive maps, regional profiles.', isPrimary: true },
      { slug: 'sustainability', title: 'Sustainability & ESG', description: '2030 targets, carbon reduction, environmental stewardship.', isPrimary: false },
      { slug: 'investors', title: 'Investor Relations', description: 'Financial results, SENS/SEC filings, share price tickers, reports.', isPrimary: false },
      { slug: 'media', title: 'Media & News', description: 'Press releases, corporate stories, executive remarks.', isPrimary: false },
      { slug: 'contact', title: 'Contact & Offices', description: 'Global office directory, IR desk, media enquiries.', isPrimary: true }
    ],
    coreModules: ['leadership', 'reports', 'news', 'contacts'],
    optionalModules: ['miningOperations', 'investorDisclosures', 'esgReporting', 'careers', 'suppliers', 'publicAssistant'],
    primaryConversionActions: ['Download Financial Report', 'Subscribe to Releases', 'Contact Corporate Affairs']
  },
  professional_services: {
    id: 'professional_services',
    name: 'Professional Services & Advisory',
    tagline: 'High-credibility advisory, agency, and consultancy flagship.',
    description: 'Tailored for law firms, management consultancies, M&A advisory, architecture, and technology agencies. Prioritizes partner credibility, structured practice areas, case studies, and confidential mandates.',
    recommendedIndustries: ['professional_services', 'technology', 'general'],
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Strategic positioning, key metrics, core capabilities, featured mandates.', isPrimary: true },
      { slug: 'services', title: 'Advisory Practice', description: 'Practice area overview, methodologies, deliverables, engagement models.', isPrimary: true },
      { slug: 'case-studies', title: 'Track Record & Impact', description: 'Verified transaction studies, outcome metrics, confidential case profiles.', isPrimary: true },
      { slug: 'about', title: 'Partners & Firm Ethos', description: 'Partner biographies, advisory philosophy, institutional credentials.', isPrimary: true },
      { slug: 'insights', title: 'Perspectives & Research', description: 'Thought leadership whitepapers, market commentaries, research briefings.', isPrimary: false },
      { slug: 'contact', title: 'Confidential Inquiry', description: 'Mandate submission form, partner contact details, global desks.', isPrimary: true }
    ],
    coreModules: ['servicesList', 'caseStudies', 'team', 'contactForm'],
    optionalModules: ['insights', 'careers', 'publicAssistant'],
    primaryConversionActions: ['Schedule Consultation', 'Submit Mandate Brief', 'Download Case Study']
  },
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality & Culinary Experiences',
    tagline: 'Sensory, experience-led presence for dining and boutique venues.',
    description: 'Crafted for fine dining restaurants, botanical tasting rooms, boutique hotels, and cultural venues. Focuses on immersive imagery, seasonal menu presentation, chef philosophy, cellar highlights, and reservation booking integration.',
    recommendedIndustries: ['hospitality', 'retail', 'health_wellness'],
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Full-bleed atmospheric hero, philosophy statement, menu preview, booking CTA.', isPrimary: true },
      { slug: 'menus', title: 'Menus & Pairings', description: 'Seasonal tasting menus, a la carte, wine and non-alcoholic pairings, dietary notes.', isPrimary: true },
      { slug: 'about', title: 'Philosophy & Terroir', description: 'Chef story, culinary heritage, ingredient provenance, local grower partnerships.', isPrimary: true },
      { slug: 'gallery', title: 'Atmosphere & Dishes', description: 'High-resolution photo gallery of culinary creations, dining room, and cellar.', isPrimary: false },
      { slug: 'private', title: 'Private Dining & Events', description: 'Cellar buyouts, intimate group bookings, corporate dining packages.', isPrimary: false },
      { slug: 'visit', title: 'Visit & Reservations', description: 'Location, parking, dress code, operating hours, OpenTable/Resy link.', isPrimary: true }
    ],
    coreModules: ['menusAndOfferings', 'gallery', 'reservationCta', 'contactForm'],
    optionalModules: ['events', 'privateDining', 'publicAssistant'],
    primaryConversionActions: ['Reserve Table', 'Inquire Private Dining', 'View Seasonal Menu']
  }
};
