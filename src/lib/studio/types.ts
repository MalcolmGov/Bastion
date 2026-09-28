/**
 * Move Studio — Core Multi-Tenant Platform Types
 * Hierarchy: Agency Workspace -> Client -> Website -> Environment (Draft / Published)
 */

export type IndustryType =
  | 'corporate'
  | 'professional_services'
  | 'hospitality'
  | 'technology'
  | 'health_wellness'
  | 'retail'
  | 'mining_resources'
  | 'general';

export type BlueprintId =
  | 'corporate'
  | 'professional_services'
  | 'hospitality';

export type DesignCollectionId =
  | 'editorial'
  | 'contemporary'
  | 'immersive';

export type PublishStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'changes_requested'
  | 'scheduled'
  | 'published'
  | 'archived';

export type BrandAttributeStatus =
  | 'observed'
  | 'inferred'
  | 'approved'
  | 'needs_review';

export interface Client {
  id: string;
  name: string;
  slug: string;
  industry: IndustryType;
  logoUrl?: string;
  primaryContact?: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  enabledModules: {
    miningOperations?: boolean;
    investorDisclosures?: boolean;
    esgReporting?: boolean;
    caseStudies?: boolean;
    servicesList?: boolean;
    menusAndOfferings?: boolean;
    careers?: boolean;
    suppliers?: boolean;
    publicAssistant?: boolean;
  };
  navigation: {
    utilityLinks?: Array<{ label: string; url: string; isExternal?: boolean }>;
    mainNav: Array<{ label: string; href: string; children?: Array<{ label: string; href: string; description?: string }> }>;
    primaryCta?: { label: string; href: string };
  };
  footer: {
    copyright: string;
    officeAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
    legalLinks?: Array<{ label: string; href: string }>;
  };
  integrations?: {
    analytics?: { provider: 'plausible' | 'ga4' | 'custom' | 'none'; status: 'connected' | 'not_configured' | 'demo'; trackingId?: string };
    assistant?: { provider: 'anthropic' | 'deterministic'; status: 'connected' | 'not_configured' | 'demo'; assistantName?: string };
    booking?: { provider: 'opentable' | 'resy' | 'custom' | 'none'; bookingUrl?: string };
  };
}

export interface Website {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  blueprintId: BlueprintId;
  designCollectionId: DesignCollectionId;
  status: PublishStatus;
  primaryDomain?: string;
  publishedRevisionId?: string;
  currentDraftRevisionId?: string;
  settings: WebsiteSettings;
  createdAt: string;
  updatedAt: string;
}

export interface BrandColorToken {
  name: string;
  value: string;
  status: BrandAttributeStatus;
  evidence?: string;
}

export interface BrandTypographyScale {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  scaleRatio: number; // e.g. 1.25 (Major Third) or 1.333 (Perfect Fourth)
  status: BrandAttributeStatus;
}

export interface BrandKit {
  id: string;
  siteId: string;
  version: number;
  status: BrandAttributeStatus;
  logos: {
    primary: { url: string; status: BrandAttributeStatus; evidence?: string };
    alt?: { url: string; status: BrandAttributeStatus };
    lightVariant?: { url: string; status: BrandAttributeStatus };
    darkVariant?: { url: string; status: BrandAttributeStatus };
    favicon?: { url: string; status: BrandAttributeStatus };
  };
  colors: {
    primary: BrandColorToken;
    secondary: BrandColorToken;
    accent: BrandColorToken;
    background: BrandColorToken;
    surface: BrandColorToken;
    textPrimary: BrandColorToken;
    textMuted: BrandColorToken;
    hairline: BrandColorToken;
  };
  typography: BrandTypographyScale;
  componentRules: {
    radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle: 'solid' | 'outline' | 'pill' | 'underlined';
    shadows: 'subtle' | 'crisp' | 'elevated' | 'none';
    imageryDirection: string;
  };
  voiceAndMessaging: {
    toneOfVoice: string; // e.g. "Authoritative, institutional, measured" or "Approachable, expert"
    approvedFacts: string[];
    tagline?: string;
    missionStatement?: string;
  };
  lockedAttributes: string[]; // List of keys that AI cannot mutate without explicit unlock
  createdAt: string;
  updatedAt: string;
}

export interface SectionInstance {
  id: string;
  componentId: string; // matches registered component ID in componentRegistry
  variant: string;
  visible: boolean;
  props: Record<string, any>;
  contentRef?: {
    collection?: string;
    recordId?: string;
  };
}

export interface PageComposition {
  id: string;
  siteId: string;
  pageSlug: string;
  title: string;
  layoutCollection: DesignCollectionId;
  sections: SectionInstance[];
  meta?: {
    description?: string;
    ogImage?: string;
    keywords?: string[];
  };
  version: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredPage {
  url: string;
  path: string;
  title: string;
  pageType: 'home' | 'about' | 'services' | 'service_detail' | 'news' | 'contact' | 'legal' | 'custom';
  status: 'pending' | 'extracted' | 'excluded' | 'failed';
  headingsCount?: number;
  wordCount?: number;
  hasImages?: boolean;
}

export interface WebsiteImport {
  id: string;
  clientId: string;
  siteId?: string;
  sourceUrl: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  step: 'setup' | 'scope' | 'extract' | 'review' | 'design' | 'assemble' | 'refine';
  scopeConfig: {
    maxPages: number;
    excludedPaths: string[];
    includeMedia: boolean;
  };
  discoveredPages: DiscoveredPage[];
  extractedData: {
    brandCandidates: Partial<BrandKit>;
    servicesFound: Array<{ title: string; description: string; url?: string }>;
    contactInfoFound?: { email?: string; phone?: string; address?: string };
    navigationFound?: Array<{ label: string; url: string }>;
    imagesFound?: Array<{ url: string; alt?: string; width?: number; height?: number }>;
    businessSummary?: string;
    provenance: Record<string, { sourceUrl: string; extractedAt: string; method: string; evidence: string }>;
  };
  reviewState: {
    approvedLogos?: boolean;
    approvedColors?: boolean;
    approvedTypography?: boolean;
    approvedPages?: string[];
    userOverrides?: Record<string, any>;
  };
  errorLog?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteRelease {
  id: string;
  siteId: string;
  versionLabel: string;
  compositionSnapshot: Record<string, PageComposition>;
  brandKitSnapshot: BrandKit;
  publishedBy: string;
  publishedAt: string;
  notes?: string;
}

export interface ContentGapItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  pageSlug: string;
  field: string;
  message: string;
  suggestedAction: string;
}
