export type AssetType = 'Underground' | 'Open Pit' | 'Joint Venture' | 'Development' | 'Solar';
export type AssetStatus = 'Active' | 'Project' | 'Transferred' | 'Renewable Facility';

export interface OperationMetric {
  label: string;
  value: string;
  unit: string;
  period: string;
  source: string;
  scope?: string;
}

export interface Operation {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: 'South Africa' | 'Australia' | 'Ghana' | 'Americas' | 'Canada';
  type: AssetType;
  status: AssetStatus;
  ownership: string;
  attributableProductionH1_2026: string;
  overview: string;
  locationDetails: string;
  coordinates: {
    lat: number;
    lng: number;
    svgX?: number; // relative SVG coordinates for responsive map
    svgY?: number;
  };
  image: string;
  keyMetrics: OperationMetric[];
  sustainabilityHighlights: string[];
  operationalHighlights: string[];
  officialUrl: string;
}

export type ReportCategory = 
  | 'Financial Results' 
  | 'Integrated Annual' 
  | 'Sustainability & ESG' 
  | 'SENS Announcement' 
  | 'Investor Presentation';

export interface ReportItem {
  id: string;
  title: string;
  period: string;
  year: number;
  category: ReportCategory;
  date: string;
  fileFormat: 'PDF' | 'Interactive Web' | 'Presentation';
  fileSize: string;
  downloadUrl: string;
  coverImage?: string;
  summary: string;
  keyHighlights: string[];
  sourceUrl: string;
}

export interface SustainabilityTarget {
  id: string;
  pillar: 'Decarbonization' | 'Water Stewardship' | 'Tailings Safety (GISTM)' | 'Safety & Health' | 'Community Shared Value' | 'Gender Diversity';
  title: string;
  targetYear: number;
  baseline: {
    year: number;
    value: string;
    unit: string;
  };
  latestActual: {
    period: string;
    value: string;
    unit: string;
    status: 'On Track' | 'Achieved' | 'In Progress';
  };
  description: string;
  sourceDocument: {
    title: string;
    url: string;
    section: string;
  };
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Media Release' | 'SENS Announcement' | 'Our Stories' | 'Achievement';
  date: string;
  readTime: string;
  summary: string;
  content: string[];
  image: string;
  sourceUrl: string;
}

export interface JobListing {
  id: string;
  title: string;
  discipline: 'Mining Engineering' | 'Geology & Exploration' | 'Metallurgy & Processing' | 'Health, Safety & Environment' | 'Finance & Supply Chain' | 'Digital & Automation';
  country: string;
  location: string;
  employmentType: 'Full-Time' | 'Fixed-Term' | 'Graduate Programme';
  isDemonstrationListing: boolean;
  summary: string;
  keyResponsibilities: string[];
  officialPortalUrl: string;
}

export interface SupplierGuidance {
  countryCode: string;
  country: string;
  title: string;
  overview: string;
  officialPortalName: string;
  officialPortalUrl: string;
  preQualificationChecklist: string[];
  complianceRequirements: string[];
  localContentPolicy: string;
  contactEmail: string;
  speakUpUrl: string;
}

export interface SourceCitation {
  title: string;
  url: string;
  date?: string;
  section?: string;
}

export interface AssistantActionCard {
  type: 'operation' | 'report' | 'checklist' | 'jobs' | 'contact';
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  meta?: Record<string, string>;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextBadge?: string;
  sources?: SourceCitation[];
  actionCard?: AssistantActionCard;
  isUnsupportedBoundary?: boolean;
}
