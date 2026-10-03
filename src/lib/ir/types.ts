/**
 * Browser-safe and server-safe shared types and constants for JSE SENS & Financial Calendar.
 */

// SENS Announcements
export type SensType =
  | 'trading_statement'
  | 'results'
  | 'dividend'
  | 'directorate'
  | 'esg_tailings'
  | 'general';

export interface SensAnnouncement {
  id: string;
  clientId: string;
  siteId: string;
  headline: string;
  announcementType: SensType;
  jseCode: string;
  isinCode?: string;
  releasedAt: string;
  bodyHtml: string;
  summary?: string;
  pdfUrl?: string;
  isPriceSensitive: boolean;
  status: 'draft' | 'embargoed' | 'published';
  sponsor: string;
  embargoUntil?: string;
  createdAt: string;
  updatedAt: string;
  /** Who wrote it. Absent on announcements that predate the approval workflow or came from the exchange wire. */
  createdBy?: string;
  /** Who signed it off, and when. An announcement can only be published once someone other than its author has. */
  approvedBy?: string;
  approvedAt?: string;
  /** Hash of the content at sign-off; an approval no longer counts if the content has since changed. */
  approvedContentHash?: string;
}

export const SENS_TYPE_LABELS: Record<SensType, string> = {
  results: 'Financial & Operating Results',
  trading_statement: 'JSE Trading Statement',
  dividend: 'Dividend Declaration',
  directorate: 'Changes to Board & Directorate',
  esg_tailings: 'ESG, GISTM & Tailings Disclosure',
  general: 'General Corporate Announcement',
};

export const SENS_TYPE_COLORS: Record<SensType, { bg: string; text: string; border: string }> = {
  results: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  trading_statement: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  dividend: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  directorate: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  esg_tailings: { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  general: { bg: 'bg-slate-50 dark:bg-slate-900/40', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800' },
};

// Financial Calendar Events
export type CalendarEventType =
  | 'results_announcement'
  | 'agm'
  | 'capital_markets_day'
  | 'dividend_dates'
  | 'webcast';

export interface FinancialCalendarEvent {
  id: string;
  clientId: string;
  siteId: string;
  title: string;
  eventType: CalendarEventType;
  eventDate: string; // YYYY-MM-DD
  timeSast: string; // e.g. "10:00 SAST"
  location?: string;
  webcastUrl?: string;
  description?: string;
  dividendRateCents?: number;
  dividendCurrency: string;
  dwtApplicable: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  results_announcement: 'Financial Results Announcement',
  agm: 'Annual General Meeting (AGM)',
  capital_markets_day: 'Capital Markets & Investor Day',
  dividend_dates: 'Dividend Declaration & Payment Dates',
  webcast: 'Executive Live Webcast / Audio Call',
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; text: string; border: string }> = {
  results_announcement: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  agm: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  capital_markets_day: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  dividend_dates: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  webcast: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
};

/**
 * Calculates South African Dividend Withholding Tax (Section 64E of Income Tax Act).
 * Statutory DWT is 20.0% for South African individual tax residents.
 */
export function calculateDividendTax(
  centsPerShare: number,
  sharesHeld: number,
  dwtRate = 0.20
): {
  grossDividendRands: number;
  dwtTaxRands: number;
  netDividendRands: number;
  dwtRatePct: number;
} {
  const grossDividendRands = (centsPerShare * sharesHeld) / 100;
  const dwtTaxRands = grossDividendRands * dwtRate;
  const netDividendRands = grossDividendRands - dwtTaxRands;

  return {
    grossDividendRands: Math.round(grossDividendRands * 100) / 100,
    dwtTaxRands: Math.round(dwtTaxRands * 100) / 100,
    netDividendRands: Math.round(netDividendRands * 100) / 100,
    dwtRatePct: Math.round(dwtRate * 100),
  };
}

// Investor Reports & Publications
export type ReportType =
  | 'integrated_annual_report'
  | 'interim_results'
  | 'mineral_resources'
  | 'climate_report'
  | 'esg_report'
  | 'factsheet';

export interface InvestorReport {
  id: string;
  clientId: string;
  siteId: string;
  title: string;
  fiscalYear: number;
  period: string;
  reportType: ReportType;
  pdfUrl: string;
  filesizeBytes: number;
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  integrated_annual_report: 'Integrated Annual Report',
  interim_results: 'Interim Financial Results',
  mineral_resources: 'Mineral Resources & Reserves',
  climate_report: 'Climate & TCFD Disclosure',
  esg_report: 'Sustainability & ESG Report',
  factsheet: 'Quarterly Factsheet',
};
