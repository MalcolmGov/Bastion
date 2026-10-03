/**
 * Bastion Enterprise CMS — Document & Annual Report Ingestion Engine
 * 
 * Ingests unstructured corporate documents (PDF Annual Reports, ESG disclosures,
 * SENS announcements, and financial circulars) and automatically synthesizes
 * brand-aligned, responsive Bastion CMS section instances
 * and editable page drafts for human source verification.
 */

import crypto from 'crypto';
import type { SectionInstance } from '@/lib/studio/types';

export interface FinancialTableRow {
  metric: string;
  current: string;
  prior: string;
  variance: string;
  trend?: 'up' | 'down' | 'neutral';
  note?: string;
}

export interface SustainabilityMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  icon?: string;
}

export interface ExtractedReportInsights {
  companyName: string;
  reportingPeriod: string;
  theme: string;
  badge?: string;
  sector?: 'banking' | 'mining' | 'energy' | 'retail' | 'healthcare' | 'technology' | 'general';
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
  };
  executiveMessage: {
    speaker: string;
    title: string;
    quote: string;
    fullLetterSnippet?: string;
    image?: string;
  };
  kpis: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    subtext?: string;
  }>;
  financialTable?: {
    headers: string[];
    rows: FinancialTableRow[];
  };
  sustainabilityKpis?: SustainabilityMetric[];
  strategicPillars: Array<{
    title: string;
    category: string;
    description: string;
    outcome?: string;
    tag?: string;
  }>;
  boardOrLeadership: Array<{
    name: string;
    role: string;
    bio: string;
    image?: string;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  rawSummary: string;
}

export interface GeneratedPageDraft {
  expectedVersion?: number;
  pageSlug: string;
  slug: string;
  title: string;
  layoutCollection?: string;
  sections: SectionInstance[];
}

export interface IngestDocumentOptions {
  buffer?: Buffer | Uint8Array | ArrayBuffer;
  text?: string;
  sampleId?: string;
  brandKit?: any;
  provider?: string;
  apiKey?: string;
  targetPageSlug?: string;
  saveToWebsite?: boolean;
}

export interface IngestionResult {
  success: boolean;
  insights: ExtractedReportInsights;
  sections: SectionInstance[]; // active page sections (home)
  pages: GeneratedPageDraft[]; // complete multi-page web draft
  summary: string;
  extractedWordsCount: number;
}

/**
 * Pre-loaded high-fidelity corporate report demo samples for instantaneous presentations.
 */
export const CORPORATE_REPORT_SAMPLES: Record<string, ExtractedReportInsights> = {
  'goldfields-annual-2025': {
    companyName: 'Gold Fields Limited',
    reportingPeriod: '2025 Integrated Annual Report & Operational Review',
    theme: 'Disciplined Capital Allocation & Sustainable Production Across Tier-1 Assets',
    badge: 'JSE: GFI · NYSE: GFI · Audited Annual Results',
    sector: 'mining',
    brandColors: {
      primary: '#D97706',
      secondary: '#B45309',
      accent: '#F59E0B',
      background: '#070B12',
      cardBg: '#0F172A',
    },
    executiveMessage: {
      speaker: 'Mike Fraser',
      title: 'Chief Executive Officer',
      quote:
        'Our disciplined operational execution, aggressive decarbonisation, and unwavering focus on capital discipline have positioned Gold Fields to generate resilient free cash flow throughout commodity cycles while building enduring value for host communities.',
      fullLetterSnippet:
        'Fellow stakeholders: 2025 represented a milestone year for Gold Fields. With the successful commercial commissioning of Salares Norte and mechanised efficiency gains at South Deep, our group delivered 2.30 Moz of attributable gold production at an AISC of $1,280/oz, returning $920 million in free cash flow.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    kpis: [
      {
        label: 'Attributable Gold Produced',
        value: '2.30 Moz',
        change: '+4.2% YoY',
        trend: 'up',
        subtext: 'Supported by Salares Norte ramp-up and South Deep mechanisation',
      },
      {
        label: 'All-In Sustaining Costs (AISC)',
        value: '$1,280 /oz',
        change: '-3.5% vs budget',
        trend: 'down',
        subtext: 'Rigorous operational cost control across 8 global mines',
      },
      {
        label: 'Adjusted Free Cash Flow',
        value: '$920 Million',
        change: '+28% Operating Margin',
        trend: 'up',
        subtext: 'Strong leverage to elevated spot gold pricing environment',
      },
      {
        label: 'Renewable Electricity Share',
        value: '52% Grid',
        change: '+14% Decarbonisation',
        trend: 'up',
        subtext: '50MW Khanyisa solar plant and wind storage commissioned',
      },
    ],
    financialTable: {
      headers: ['Financial / Operational Metric', 'Extracted value', 'Prior period (verify)', 'Change (verify)', 'Source context'],
      rows: [
        { metric: 'Revenue / Gold Sales', current: '$4.52 Billion', prior: '$3.89 Billion', variance: '+16.2%', trend: 'up', note: 'Higher average realized gold price and Salares Norte ramp-up' },
        { metric: 'Adjusted EBITDA', current: '$2.14 Billion', prior: '$1.72 Billion', variance: '+24.4%', trend: 'up', note: 'Robust operating cash generation across core global assets' },
        { metric: 'Adjusted Free Cash Flow', current: '$920 Million', prior: '$718 Million', variance: '+28.1%', trend: 'up', note: 'Strong operational cash conversion after sustaining capex' },
        { metric: 'All-In Sustaining Costs (AISC)', current: '$1,280 /oz', prior: '$1,326 /oz', variance: '-3.5%', trend: 'down', note: 'Disciplined supply chain procurement and mechanized stoping' },
        { metric: 'Total Normalized Earnings', current: '$1.08 Billion', prior: '$832 Million', variance: '+29.8%', trend: 'up', note: '45% ordinary dividend payout ratio sustained' },
        { metric: 'Net Debt / EBITDA Ratio', current: '0.28x', prior: '0.42x', variance: '-0.14x', trend: 'down', note: 'Conservative investment-grade balance sheet flexibility' },
      ],
    },
    sustainabilityKpis: [
      { label: 'Scope 1 & 2 Decarbonisation', value: '-24%', change: 'vs 2018 baseline', trend: 'down', subtext: 'Displacing grid coal with 50MW solar microgrids', icon: 'zap' },
      { label: 'Renewable Electricity Mix', value: '52% Total', change: '+14% YoY', trend: 'up', subtext: 'Targeting 70% renewable penetration by 2030', icon: 'zap' },
      { label: 'Process Water Recycled', value: '84% Recycled', change: '+6% Stewardship', trend: 'up', subtext: 'Closed-loop dry-stack tailings filtration active', icon: 'droplet' },
      { label: 'Host Community Procurement', value: 'R14.8 Billion', change: '74% of Total Spend', trend: 'up', subtext: 'Direct local procurement and youth enterprise incubation', icon: 'handshake' },
    ],
    strategicPillars: [
      {
        title: 'Safe Operational Delivery & Mechanisation',
        category: 'Mining Operations',
        description:
          'Deep mechanisation and autonomous fleet integration at South Deep and Tarkwa delivered zero fatal incidents and improved bulk stoping throughput by 12%.',
        outcome: 'Zero Lost-Time Fatalities & 12% mechanized tonnage increase',
        tag: 'Operational Rigour',
      },
      {
        title: 'Decarbonisation & Water Stewardship',
        category: 'ESG & Climate Action',
        description:
          'Commissioned 50MW solar and battery microgrids, reducing Scope 1 and 2 emissions by 240,000 tonnes CO₂e while recycling 84% of process water.',
        outcome: '84% Process Water Recycled across all African operations',
        tag: 'Decarbonisation',
      },
      {
        title: 'Balanced Shareholder Distributions',
        category: 'Capital Allocation',
        description:
          'Returned 45% of normalized earnings through progressive base dividends while reducing net debt to EBITDA ratio to a conservative 0.28x.',
        outcome: '45% Dividend Payout Ratio & Net Debt / EBITDA of 0.28x',
        tag: 'Financial Discipline',
      },
      {
        title: 'Shared Value for Host Communities',
        category: 'Social Impact',
        description:
          'Directed 74% of total procurement spend to host community and local suppliers, investing over R850 million in education, healthcare, and water access.',
        outcome: 'R850M+ direct community and local enterprise investment',
        tag: 'Community Prosperity',
      },
    ],
    boardOrLeadership: [
      {
        name: 'Mike Fraser',
        role: 'Chief Executive Officer',
        bio: 'Over 28 years mining and operational leadership experience across global precious and base metal enterprises.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Paul Schmidt',
        role: 'Chief Financial Officer',
        bio: 'Spearheads group capital allocation, debt syndication, treasury operations, and investor relations.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Yunus Suleman',
        role: 'Independent Chairperson',
        bio: 'Chartered accountant with deep governance, audit committee, and King IV compliance expertise.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
      },
    ],
    faqItems: [
      {
        question: 'What is Gold Fields’ capital allocation framework for 2026?',
        answer:
          'Our capital framework prioritises sustaining and decarbonisation capital, followed by maintaining our target 0.2x–0.5x net debt-to-EBITDA ratio, with 40%–50% of normalized earnings paid out via ordinary dividends.',
      },
      {
        question: 'When will the full audited financial statements and Notice of AGM be available?',
        answer:
          'The complete suite of reporting publications—including the Audited Annual Financial Statements, Mineral Resources and Reserves Report, and Notice of AGM—are published on the JSE SENS and our investor portal on 31 March 2026.',
      },
      {
        question: 'How is Gold Fields mitigating South African energy grid volatility?',
        answer:
          'South Deep operates with a dedicated 50MW solar microgrid, battery storage buffering, and long-term wheeling agreements that insulate over 60% of continuous operational load from grid interruptions.',
      },
      {
        question: 'What is the production guidance for the upcoming financial year?',
        answer:
          'Group attributable gold production is guided between 2.35Moz and 2.45Moz at an AISC of $1,250/oz to $1,320/oz, reflecting the full commercial steady-state of Salares Norte.',
      },
    ],
    rawSummary:
      'Gold Fields Limited 2025 Integrated Annual Report reveals record free cash flow of $920M, gold production of 2.30Moz, and 52% renewable power penetration with zero fatalities.',
  },

  'standardbank-interim-2025': {
    companyName: 'Standard Bank Group',
    reportingPeriod: 'H1 2025 Interim Results & Strategic Review',
    theme: 'Driving Africa’s Growth with Strong Capital Adequacy and Digital Expansion',
    badge: 'JSE: SBK · Tier-1 African Banking Group',
    sector: 'banking',
    brandColors: {
      primary: '#0033AA',
      secondary: '#1D4ED8',
      accent: '#0089FF',
      background: '#040915',
      cardBg: '#09152D',
    },
    executiveMessage: {
      speaker: 'Sim Tshabalala',
      title: 'Group Chief Executive',
      quote:
        'Africa is our home and we drive her growth. Our diversified business portfolio, resilient credit books, and digital platform scale continue to generate high-quality earnings across our 20 presence markets.',
      fullLetterSnippet:
        'Standard Bank delivered another period of excellent financial and operational delivery. Headline earnings grew 12.4% to R22.4 billion, supported by strong revenue growth in corporate trade financing and disciplined cost management resulting in positive operating jaws.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    },
    kpis: [
      {
        label: 'Headline Earnings',
        value: 'R22.4 Billion',
        change: '+12.4% YoY',
        trend: 'up',
        subtext: 'Record performance driven by corporate and trade financing',
      },
      {
        label: 'Total Group Revenue',
        value: 'R104.5 Billion',
        change: '+16.0% YoY',
        trend: 'up',
        subtext: 'Double-digit revenue growth across banking operations',
      },
      {
        label: 'Return on Equity (ROE)',
        value: '18.8%',
        change: '+80 bps',
        trend: 'up',
        subtext: 'Within medium-term target guidance of 17%–20%',
      },
      {
        label: 'Cost-to-Income Ratio',
        value: '50.6%',
        change: 'Operating positive jaws',
        trend: 'down',
        subtext: 'Disciplined cost management paired with 16% revenue growth',
      },
    ],
    financialTable: {
      headers: ['Financial / Banking Metric', 'H1 2025 (Current)', 'H1 2024 (Prior)', 'Variance', 'Strategic Context'],
      rows: [
        { metric: 'Total Group Revenue / Turnover', current: 'R104.5 Billion', prior: 'R90.1 Billion', variance: '+16.0%', trend: 'up', note: 'Strong net interest income and transactional banking growth' },
        { metric: 'Headline Earnings', current: 'R22.4 Billion', prior: 'R19.9 Billion', variance: '+12.4%', trend: 'up', note: 'Record earnings delivery with positive operating jaws' },
        { metric: 'Return on Equity (ROE)', current: '18.8%', prior: '18.0%', variance: '+80 bps', trend: 'up', note: 'Delivering within 17%–20% medium-term guidance target' },
        { metric: 'Cost-to-Income Ratio', current: '50.6%', prior: '51.8%', variance: '-120 bps', trend: 'down', note: 'Operating positive jaws through platform automation' },
        { metric: 'Credit Loss Ratio', current: '98 bps', prior: '96 bps', variance: '+2 bps', trend: 'up', note: 'Comfortably within through-the-cycle target range of 70 to 100 bps' },
        { metric: 'Interim Dividend Per Share', current: '740 cents', prior: '680 cents', variance: '+8.8%', trend: 'up', note: '55% ordinary dividend payout ratio declared' },
      ],
    },
    sustainabilityKpis: [
      { label: 'Sustainable Infrastructure Lending', value: 'R55 Billion', change: '+22% YoY', trend: 'up', subtext: 'Financed African solar, wind, and municipal water grids', icon: 'zap' },
      { label: 'Digital Transaction Share', value: '88% Mobile', change: '+5% digital shift', trend: 'up', subtext: 'Accelerating financial inclusion across 20 countries', icon: 'zap' },
      { label: 'SME & Inclusive Business Credit', value: 'R34.2 Billion', change: '+18% growth', trend: 'up', subtext: 'Supporting women-led and emerging regional enterprises', icon: 'handshake' },
      { label: 'Climate Transition Finance Ratio', value: '28% Portfolio', change: 'Ahead of target', trend: 'up', subtext: 'Aligning corporate lending with Paris Agreement guidelines', icon: 'droplet' },
    ],
    strategicPillars: [
      {
        title: 'Cross-Border Intra-Africa Trade Corridors',
        category: 'Corporate & Investment Banking',
        description:
          'Structured over $4.2B in AfCFTA-aligned trade corridors, connecting South African, East African, and West African commercial enterprises.',
        outcome: '$4.2B structured AfCFTA trade flow volume',
        tag: 'Trade Finance',
      },
      {
        title: 'Sustainable Infrastructure & Green Bonds',
        category: 'Climate Finance',
        description:
          'Mobilised R55 billion in sustainable finance for wind, solar, and municipal water infrastructure across Sub-Saharan Africa.',
        outcome: 'R55 Billion mobilized for African renewable energy projects',
        tag: 'Sustainable Lending',
      },
      {
        title: 'Digital Platform Scale & Frictionless Payments',
        category: 'Digital Innovation',
        description:
          'Processed over 1.2 billion instant cloud payment transactions with 99.99% system availability across mobile ecosystems.',
        outcome: '1.2B transactions processed with 99.99% core availability',
        tag: 'Platform Scale',
      },
    ],
    boardOrLeadership: [
      {
        name: 'Sim Tshabalala',
        role: 'Group Chief Executive',
        bio: 'Over two decades executive leadership across retail, investment, and cross-border African banking.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Arno Daehnke',
        role: 'Chief Finance & Value Officer',
        bio: 'Directs group financial strategy, capital allocation, and prudential liquidity management.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Nonkululeko Nyembezi',
        role: 'Chairman of the Board',
        bio: 'Distinguished industrial and corporate governance leader with extensive multinational board experience.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      },
    ],
    faqItems: [
      {
        question: 'What is the interim dividend declared for H1 2025?',
        answer:
          'The Board declared an interim gross ordinary dividend of 740 cents per share, representing a dividend payout ratio of 55%.',
      },
      {
        question: 'How is Standard Bank managing credit risk in an elevated interest rate climate?',
        answer:
          'Our credit impairment charges remained stable at an annualized credit loss ratio of 98 bps, well within our through-the-cycle target range of 70 to 100 bps.',
      },
      {
        question: 'What is Standard Bank’s Tier-1 capital adequacy ratio?',
        answer:
          'The group’s Tier-1 capital adequacy ratio stood at 13.4%, well above South African Reserve Bank prudential regulatory requirements.',
      },
    ],
    rawSummary:
      'Standard Bank H1 2025 interim results show R22.4B headline earnings (+12.4%), R104.5B revenue, 18.8% ROE, and R55B green infrastructure funding.',
  },

  'anglo-esg-2025': {
    companyName: 'Anglo American plc',
    reportingPeriod: '2025 Sustainability & Climate Transition Report',
    theme: 'Future-Smart Mining: Decarbonisation, Clean Energy & Community Resilience',
    badge: 'JSE: AGL · LSE: AAL · Sustainability Accounting Standards',
    sector: 'mining',
    brandColors: {
      primary: '#00205B',
      secondary: '#0F3074',
      accent: '#0D9488',
      background: '#060B14',
      cardBg: '#0F1A2E',
    },
    executiveMessage: {
      speaker: 'Duncan Wanblad',
      title: 'Chief Executive Officer',
      quote:
        'The materials we supply are the essential building blocks of the global green transition. Our responsibility is to extract and refine them with the lightest environmental footprint and maximum social value.',
      fullLetterSnippet:
        'Our Future-Smart Mining roadmap is transforming our operations. In 2025 we achieved a 38% reduction in Scope 1 and 2 GHG emissions, while directing R18.4 billion to host community procurement and suppliers.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    },
    kpis: [
      {
        label: 'Scope 1 & 2 GHG Reduction',
        value: '-38%',
        change: 'vs 2018 baseline',
        trend: 'down',
        subtext: 'Accelerating toward 100% renewable power contracts',
      },
      {
        label: 'Fresh Water Abstraction',
        value: '-45% Intensity',
        change: 'Ahead of 2030 target',
        trend: 'down',
        subtext: 'Zero-water closed loop dry tailings deployed',
      },
      {
        label: 'Local Community Spend',
        value: 'R18.4 Billion',
        change: '+16% Local Content',
        trend: 'up',
        subtext: 'Direct local procurement and enterprise development',
      },
      {
        label: 'BEE Ownership Equity',
        value: '34.2%',
        change: 'Level 1 Contributor',
        trend: 'up',
        subtext: 'Exceeding South African Mining Charter III requirements',
      },
    ],
    financialTable: {
      headers: ['Sustainability & Operational Metric', 'FY 2025 (Current)', 'FY 2024 (Prior)', 'Variance', 'ESG Baseline'],
      rows: [
        { metric: 'Scope 1 & 2 Carbon Emissions', current: '11.2 Mt CO2e', prior: '13.8 Mt CO2e', variance: '-18.8%', trend: 'down', note: 'Renewable energy power contracts in South Africa and Chile' },
        { metric: 'Fresh Water Extraction Intensity', current: '0.42 m3/t', prior: '0.58 m3/t', variance: '-27.5%', trend: 'down', note: 'Closed-loop tailings water recovery systems' },
        { metric: 'Local Supplier Procurement', current: 'R18.4 Billion', prior: 'R15.8 Billion', variance: '+16.4%', trend: 'up', note: 'Direct economic stimulation in host mining communities' },
        { metric: 'Total Recordable Injury Frequency (TRIFR)', current: '1.45', prior: '1.82', variance: '-20.3%', trend: 'down', note: 'Zero operational fatalities across managed operations' },
      ],
    },
    sustainabilityKpis: [
      { label: 'Scope 1 & 2 GHG Reduction', value: '-38%', change: 'vs baseline', trend: 'down', subtext: 'Accelerating toward 100% renewable power contracts', icon: 'zap' },
      { label: 'Fresh Water Abstraction', value: '-45% Intensity', change: 'Ahead of target', trend: 'down', subtext: 'Zero-water closed loop dry tailings deployed', icon: 'droplet' },
      { label: 'Local Community Spend', value: 'R18.4 Billion', change: '+16% Local Content', trend: 'up', subtext: 'Direct local procurement and enterprise development', icon: 'handshake' },
      { label: 'BEE Ownership Equity', value: '34.2%', change: 'Level 1 Contributor', trend: 'up', subtext: 'Exceeding South African Mining Charter requirements', icon: 'handshake' },
    ],
    strategicPillars: [
      {
        title: 'Decarbonised Fleet & Hydrogen Haulage',
        category: 'Clean Technology',
        description:
          'Operational rollout of hydrogen fuel cell ultra-class haul trucks, replacing 2,000 litres of diesel per truck per day.',
        outcome: 'Hydrogen haulage pilot displaced 1.2M litres of diesel',
        tag: 'Zero-Emissions Fleet',
      },
      {
        title: 'Water-Less Closed-Loop Processing',
        category: 'Water Stewardship',
        description:
          'Dry-stack tailings technology commissioned across arid operations in South Africa and South America to protect regional water tables.',
        outcome: '45% net reduction in fresh groundwater extraction',
        tag: 'Water Security',
      },
      {
        title: 'Local Health & Inclusive Livelihoods',
        category: 'Community Empowerment',
        description:
          'Partnered with local health departments to provide primary clinic access to 140,000 residents adjacent to our operations.',
        outcome: '140,000 residents provided subsidized clinic care',
        tag: 'Social Compact',
      },
    ],
    boardOrLeadership: [
      {
        name: 'Duncan Wanblad',
        role: 'Chief Executive',
        bio: 'Leads Anglo American’s portfolio transformation and sustainability roadmap.',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Matt Daley',
        role: 'Group Technical Director',
        bio: 'Oversees engineering innovation, hydrogen truck integration, and water stewardship programs.',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      },
    ],
    faqItems: [
      {
        question: 'What is Anglo American’s target date for operational carbon neutrality?',
        answer:
          'We have committed to achieving carbon neutrality across our Scope 1 and 2 greenhouse gas emissions by 2040, with our electricity supply in South America already 100% renewable.',
      },
      {
        question: 'How are biodiversity conservation targets verified?',
        answer:
          'Every Anglo American managed asset is audited annually by independent ecologists to ensure a verified Net Positive Impact (NPI) on biodiversity across our landholdings.',
      },
    ],
    rawSummary:
      'Anglo American Sustainability Report highlights 38% GHG reduction, zero-water tailings processing, and R18.4B local supplier spend in South Africa.',
  },
};

/**
 * Safely converts Buffer, Uint8Array, or ArrayBuffer into an unpolluted,
 * non-Buffer Uint8Array slice acceptable by pdfjs-dist in Node.js environments.
 */
export function toCleanUint8Array(data: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  if (Buffer.isBuffer(data) || (data instanceof Uint8Array && data.constructor.name !== 'Uint8Array')) {
    return new Uint8Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
  }
  if (data instanceof Uint8Array) {
    return data;
  }
  return new Uint8Array(data);
}

function cleanTitleCase(str: string): string {
  const acronyms = new Set([
    'JSE', 'NYSE', 'LSE', 'ESG', 'CEO', 'CFO', 'USD', 'ZAR', 'IFRS', 'AGM',
    'TRIFR', 'EBITDA', 'NAV', 'PGM', 'AISC', 'ROE', 'HEPS', 'BEE', 'AfCFTA'
  ]);
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      const upper = w.toUpperCase();
      if (acronyms.has(upper)) return upper;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Extracts plain text from a PDF Buffer, Uint8Array, or ArrayBuffer.
 * Traverses up to 80 pages of large corporate reports (120-page annual reports).
 */
export async function extractTextFromPdfBuffer(data: Buffer | Uint8Array | ArrayBuffer): Promise<string> {
  const cleanUint8 = toCleanUint8Array(data);

  // Validate PDF magic header (%PDF-)
  const isPdf =
    cleanUint8.length >= 4 &&
    cleanUint8[0] === 0x25 && // %
    cleanUint8[1] === 0x50 && // P
    cleanUint8[2] === 0x44 && // D
    cleanUint8[3] === 0x46;   // F

  if (!isPdf) {
    // If not a PDF, check if it's plain text or markdown
    const textCandidate = Buffer.from(cleanUint8).toString('utf-8');
    if (/^[\x20-\x7E\t\r\n\u00A0-\u024F\u2010-\u2026]+$/.test(textCandidate.slice(0, 100))) {
      return textCandidate;
    }
    throw new Error('Uploaded file is not a valid PDF or plain text document.');
  }

  try {
    // Prefer legacy build for Node.js environments
    let pdfjs: any;
    try {
      pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    } catch {
      pdfjs = await import('pdfjs-dist');
    }

    let standardFontDataUrl: string | undefined;
    try {
      const path = await import('path');
      const fs = await import('fs');
      const localFonts = path.resolve(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts');
      if (fs.existsSync(localFonts)) {
        standardFontDataUrl = localFonts.endsWith('/') ? localFonts : localFonts + '/';
      }
    } catch {
      // Ignore font path resolution if not accessible
    }

    const loadingTask = pdfjs.getDocument({
      data: cleanUint8,
      useSystemFonts: true,
      disableFontFace: true,
      standardFontDataUrl,
      isEvalSupported: false,
    });

    const pdfDoc = await loadingTask.promise;
    const pageTexts: string[] = [];

    // Extract every page within the explicit resource limit.
    if (pdfDoc.numPages > 200) { await loadingTask.destroy(); throw new Error('Reports over 200 pages must be split before ingestion.'); }
    const numPages = pdfDoc.numPages;
    try {
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        let pageStr = '';
        for (const item of textContent.items as any[]) {
          if (item && typeof item.str === 'string') {
            pageStr += item.str;
            if (item.hasEOL) {
              pageStr += '\n';
            } else {
              pageStr += ' ';
            }
          }
        }
        if (pageStr.trim()) {
          pageTexts.push(`--- Page ${i} ---\n${pageStr.trim()}`);
        }
      } catch (pageErr) {
        throw new Error(`Could not extract page ${i}; no partial report was generated.`);
      }
    }

    const fullText = pageTexts.join('\n\n').trim();
    if (!fullText || fullText.replace(/--- Page \d+ ---/g, '').trim().length < 40) {
      throw new Error(
        'This PDF appears to be a scanned image or contains no selectable digital text layer. Please upload a digital PDF report with embedded text or paste the report text directly.'
      );
    }

    return fullText;
    } finally { await loadingTask.destroy(); }
  } catch (error: any) {
    console.error('[PDF Extractor] Error parsing PDF with pdfjs-dist:', error);
    throw new Error(error?.message || 'Failed to extract text from PDF document.');
  }
}

/**
 * Intelligent heuristics parser to extract structured corporate insights, financial tables,
 * executive statements, and sustainability stats from raw report text.
 */
export function extractInsightsFromTextHeuristics(
  text: string,
  fallbackClientName: string = 'Corporate Enterprise'
): ExtractedReportInsights {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Detect Company Name & Sector
  let companyName = '';
  let sector: ExtractedReportInsights['sector'] = 'general';

  const knownEntities: Array<{ name: string; sector: ExtractedReportInsights['sector'] }> = [
    { name: 'Standard Bank Group', sector: 'banking' },
    { name: 'Gold Fields Limited', sector: 'mining' },
    { name: 'Anglo American plc', sector: 'mining' },
    { name: 'Merafe Resources Limited', sector: 'mining' },
    { name: 'Discovery Limited', sector: 'banking' },
    { name: 'Sasol Limited', sector: 'energy' },
    { name: 'Vodacom Group', sector: 'technology' },
    { name: 'MTN Group', sector: 'technology' },
    { name: 'Sanlam Limited', sector: 'banking' },
    { name: 'Nedbank Group', sector: 'banking' },
    { name: 'Absa Group', sector: 'banking' },
    { name: 'Impala Platinum', sector: 'mining' },
    { name: 'Sibanye-Stillwater', sector: 'mining' },
    { name: 'Kumba Iron Ore', sector: 'mining' },
    { name: 'Exxaro Resources', sector: 'mining' },
    { name: 'Northam Platinum', sector: 'mining' },
    { name: 'Shoprite Holdings', sector: 'retail' },
    { name: 'Woolworths Holdings', sector: 'retail' },
    { name: 'Pick n Pay Stores', sector: 'retail' },
    { name: 'Bidvest Group', sector: 'general' },
    { name: 'Capitec Bank', sector: 'banking' },
    { name: 'FirstRand Limited', sector: 'banking' },
  ];

  for (const entity of knownEntities) {
    const escaped = entity.name.replace(/\s+/g, '\\s+');
    if (new RegExp(escaped, 'i').test(lines.slice(0,30).join('\n'))) {
      companyName = entity.name;
      sector = entity.sector;
      break;
    }
  }

  if (!companyName) {
    for (const line of lines.slice(0, 30)) {
      const lineMatch =
        line.match(/^([A-Z0-9\s&,.]{2,45}(?:LIMITED|LTD|PLC|GROUP|HOLDINGS|RESOURCES|CORPORATION))\b/i) ||
        line.match(/(?:Company|Group|Corporation)[:\s]+([A-Z][A-Za-z0-9\s&]+)/i);
      if (lineMatch) {
        const candidate = lineMatch[1].replace(/^[^\w]+/, '').trim();
        if (candidate.length >= 3) {
          companyName = cleanTitleCase(candidate);
          break;
        }
      }
    }
  }

  if (!companyName) {
    companyName = fallbackClientName;
  }

  // Infer sector from vocabulary if not matched
  if (sector === 'general') {
    if (/bank|banking|credit|deposit|loans|interest\s+income|repo\s+rate|npl/i.test(text)) {
      sector = 'banking';
    } else if (/mine|mining|gold|ferrochrome|chrome|tailings|ounces|moz|kt\b|aisc/i.test(text)) {
      sector = 'mining';
    } else if (/chemical|refinery|synthetic|gas|fuels|energy|crude/i.test(text)) {
      sector = 'energy';
    } else if (/retail|stores|supermarket|merchandise|sales\s+growth/i.test(text)) {
      sector = 'retail';
    }
  }

  // 2. Map Signature Brand Palette
  let brandColors = {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#0EA5E9',
    background: '#070B12',
    cardBg: '#0F172A',
  };

  if (companyName.includes('Standard Bank')) {
    brandColors = {
      primary: '#0033AA',
      secondary: '#1D4ED8',
      accent: '#0089FF',
      background: '#040915',
      cardBg: '#09152D',
    };
  } else if (companyName.includes('Gold Fields')) {
    brandColors = {
      primary: '#D97706',
      secondary: '#B45309',
      accent: '#F59E0B',
      background: '#070B12',
      cardBg: '#0F172A',
    };
  } else if (companyName.includes('Anglo American')) {
    brandColors = {
      primary: '#00205B',
      secondary: '#0F3074',
      accent: '#0D9488',
      background: '#060B14',
      cardBg: '#0F1A2E',
    };
  } else if (companyName.includes('Discovery')) {
    brandColors = {
      primary: '#EA580C',
      secondary: '#C2410C',
      accent: '#F97316',
      background: '#090B14',
      cardBg: '#151824',
    };
  } else if (companyName.includes('Merafe')) {
    brandColors = {
      primary: '#BE123C',
      secondary: '#9F1239',
      accent: '#EAB308',
      background: '#0A0A0C',
      cardBg: '#141418',
    };
  } else if (companyName.includes('Sasol')) {
    brandColors = {
      primary: '#0284C7',
      secondary: '#0369A1',
      accent: '#38BDF8',
      background: '#060F1E',
      cardBg: '#0E1B33',
    };
  } else if (sector === 'mining') {
    brandColors = {
      primary: '#D97706',
      secondary: '#B45309',
      accent: '#F59E0B',
      background: '#070B12',
      cardBg: '#0F172A',
    };
  } else if (sector === 'banking') {
    brandColors = {
      primary: '#0033AA',
      secondary: '#1D4ED8',
      accent: '#0089FF',
      background: '#040915',
      cardBg: '#09152D',
    };
  }

  // 3. Detect Reporting Period
  let reportingPeriod = 'Reporting period not extracted';
  const periodMatch =
    text.match(/(?:SUMMARISED\s+CONSOLIDATED\s+FINANCIAL\s+STATEMENTS[^\n]*|INTEGRATED\s+ANNUAL\s+REPORT[^\n]*|ANNUAL\s+REPORT[^\n]*|INTERIM\s+RESULTS[^\n]*|SUSTAINABILITY\s+REPORT[^\n]*|FINANCIAL\s+STATEMENTS[^\n]*FOR\s+THE\s+YEAR\s+ENDED\s+[\d\s\w]+)/i) ||
    text.match(/(Integrated Annual Report|Annual Report|Interim Results|Sustainability Report|Financial Results|Q[1-4]\sResults)\s*(?:20\d\d)?/i);

  if (periodMatch) {
    const cleanedPeriod = periodMatch[0]
      .replace(/^[^\w]+/, '')
      .replace(/[,\.;\s]+$/, '')
      .trim()
      .slice(0, 80);
    reportingPeriod = cleanTitleCase(cleanedPeriod);
  }

  // 4. Detect Theme / Slogan
  let theme = 'Report overview';
  const themeMatch =
    text.match(/(?:Delivering today\.[^\n]*|Investing in tomorrow[^\n]*)/i) ||
    text.match(/(?:Driving Africa’s Growth[^\n]*|Future-Smart Mining[^\n]*)/i) ||
    text.match(/(?:Theme|Title|Strategic Vision|Focus)[:\s]+([^\n\.\!]{15,90})/i);

  if (themeMatch) {
    theme = themeMatch[1] ? themeMatch[1].trim() : themeMatch[0].trim();
  }

  // Only capture an explicitly labelled value on the same line. Never infer a
  // previous period, variance, assurance, unit, or favourable trend.
  const kpis: ExtractedReportInsights['kpis'] = [];
  const tableRows: FinancialTableRow[] = [];
  const metrics = [
    ['Headline Earnings', /(?:headline earnings|headline profit)\s*(?:of|to|at|:)\s*([R$]\s*(?:\d{1,3}(?:[ ,]\d{3})+(?:\.\d+)?|\d+(?:[.,]\d+)?)(?:\s*(?:billion|million|thousand|[KMB]\b))?(?![\d,.]|\s*\d))/i],
    ['Revenue', /(?:total revenue|group revenue|revenue|turnover)\s*(?:of|to|at|:)\s*([R$]\s*(?:\d{1,3}(?:[ ,]\d{3})+(?:\.\d+)?|\d+(?:[.,]\d+)?)(?:\s*(?:billion|million|thousand|[KMB]\b))?(?![\d,.]|\s*\d))/i],
    ['Return on Equity', /(?:return on equity|ROE)\s*(?:of|to|at|:)\s*(\d+(?:\.\d+)?%)/i],
    ['Dividend Per Share', /(?:ordinary dividend|interim dividend|final dividend|cash dividend)\s*(?:of|to|declared|:)\s*(\d+(?:\.\d+)?\s*(?:cents|cps))/i],
  ] as const;
  for (const [label, pattern] of metrics) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (!match) continue;
      const value = match[1].trim();
      kpis.push({ label, value, trend: 'neutral', subtext: `Source excerpt: ${line.slice(0, 240)}` });
      tableRows.push({ metric: label, current: value, prior: 'Not extracted', variance: 'Not extracted', trend: 'neutral', note: `Source excerpt: ${line.slice(0, 240)}` });
      break;
    }
  }

  // Real uploads never borrow demo values, biographies, quotes or assurance claims.
  const sustainabilityKpis: SustainabilityMetric[] = [];
  let speaker = '';
  let title = '';
  let quote = '';
  const ceoMatch = text.match(/Chief Executive Officer[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (ceoMatch) { speaker = ceoMatch[1].trim(); title = 'Chief Executive Officer'; }
  const quoteMatch = text.match(/["“]([^"”]{50,300})["”]/);
  // Quotes require explicit attribution; do not attach an arbitrary quotation to a CEO.
  const strategicPillars: ExtractedReportInsights['strategicPillars'] = [];

  return {
    companyName,
    reportingPeriod,
    theme,
    badge: `Report draft · ${reportingPeriod}`,
    sector,
    brandColors,
    executiveMessage: {
      speaker,
      title,
      quote,
      fullLetterSnippet: quote,
    },
    kpis,
    financialTable: {
      headers: ['Financial / Operational Metric', 'Extracted value', 'Prior period (verify)', 'Change (verify)', 'Source context'],
      rows: tableRows,
    },
    sustainabilityKpis,
    strategicPillars,
    boardOrLeadership: speaker ? [{ name: speaker, role: title, bio: '', image: '' }] : [],
    faqItems: [],
    rawSummary: `Extracted ${kpis.length} candidate metrics and ${tableRows.length} candidate table rows. Compare every value with the source before approval. Leadership, sustainability and assurance details require source verification.`,

  };
}

/**
 * Synthesizes strongly-typed, schema-valid Bastion SectionInstance[] objects
 * for the primary flagship page from extracted corporate report insights.
 */
export function synthesizeSectionsFromInsights(
  insights: ExtractedReportInsights,
  brandKit?: any
): SectionInstance[] {
  const hex = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  const colors = insights.brandColors || {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#0EA5E9',
    background: '#070B12',
    cardBg: '#0F172A',
  };

  const accentColor = brandKit?.colors?.accent?.hex || colors.accent;
  const darkBgColor = colors.background;
  const cardBgColor = colors.cardBg;
  const headingColor = '#FFFFFF';
  const textColor = '#CBD5E1';

  const baseStyles = {
    theme: 'dark' as const,
    backgroundColor: darkBgColor,
    headingColor: headingColor,
    textColor: textColor,
    accentColor: accentColor,
    paddingY: 'py-24' as const,
    containerWidth: 'wide' as const,
    headingScale: 'normal' as const,
    fontFamily: 'sans' as const,
  };

  // Section 1: Hero Showcase with Integrated KPIs
  const heroSection: SectionInstance = {
    id: hex('hero'),
    componentId: 'hero',
    variant: 'contemporary_bold',
    visible: true,
    props: {
      badge: `${insights.companyName} · ${insights.reportingPeriod}`,
      title: insights.theme || 'Delivering Sustainable Value, Operational Discipline & Capital Growth',
      subtitle: `Key performance disclosures, strategic delivery, and executive review for ${insights.companyName}. Candidate figures require comparison with the original ${insights.reportingPeriod}.`,
      primaryCta: { label: 'Review Financials', href: '/financials' },
      secondaryCta: { label: 'Financial performance', href: '/financials' },
      stats: insights.kpis.map((kpi) => ({
        value: kpi.value,
        label: kpi.label,
      })),
    },
    styles: {
      ...baseStyles,
      backgroundType: 'gradient',
      gradient: `linear-gradient(180deg, ${colors.background} 0%, ${colors.cardBg} 100%)`,
      gradientFrom: colors.background,
      gradientTo: colors.cardBg,
    },
  };

  // Section 2: StudioFinancialHighlights (Executive Scorecard + Multi-Year Statement Table)
  const financialHighlightsSection: SectionInstance = {
    id: hex('financial_highlights'),
    componentId: 'financial_highlights',
    variant: 'scorecard_table',
    visible: true,
    props: {
      eyebrow: 'Report figures · source review required',
      title: 'Financial performance',
      subtitle: `Comprehensive performance indicators, comparative statement line items, and sustainability accounting extracted from the ${insights.reportingPeriod}.`,
      reportingPeriod: insights.reportingPeriod,
      kpis: insights.kpis,
      financialTable: insights.financialTable,
      sustainabilityKpis: insights.sustainabilityKpis,
      primaryCta: { label: 'Review financial figures', href: '/financials' },
      secondaryCta: { label: 'Explore Segmental Breakdown', href: '#segments' },
    },
    styles: {
      ...baseStyles,
      backgroundColor: colors.background,
    },
  };

  // Section 3: Executive Leadership Pull Quote
  const quoteSection: SectionInstance = {
    id: hex('quote'),
    componentId: 'rich_text',
    variant: 'editorial_quote',
    visible: true,
    props: {
      quote: `“${insights.executiveMessage.quote.replace(/^["“]|["”]$/g, '')}”`,
      author: insights.executiveMessage.speaker,
      role: `${insights.executiveMessage.title} — ${insights.companyName}`,
    },
    styles: {
      ...baseStyles,
      backgroundColor: cardBgColor,
      borderTop: true,
      borderBottom: true,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
  };

  // Section 4: Leadership Team & Governance Grid (StudioTeam)
  const teamSection: SectionInstance = {
    id: hex('team'),
    componentId: 'team',
    variant: 'portrait_grid',
    visible: true,
    props: {
      eyebrow: 'Executive Governance & Stewardship',
      title: 'Experienced Leadership. Transparent Stewardship.',
      members: insights.boardOrLeadership,
    },
    styles: {
      ...baseStyles,
      backgroundColor: colors.background,
    },
  };

  // Section 5: Case Studies / Strategic Operational Pillars (StudioCaseStudies)
  const pillarsSection: SectionInstance = {
    id: hex('pillars'),
    componentId: 'case_studies',
    variant: 'impact_cards',
    visible: true,
    props: {
      eyebrow: 'Strategic Execution & Track Record',
      title: 'Transforming strategic objectives into measurable operational delivery.',
      caseStudies: insights.strategicPillars.map((p) => ({
        headline: p.title,
        client: p.category,
        outcome: p.description + (p.outcome ? ` [Result: ${p.outcome}]` : ''),
        tag: p.tag || p.category,
      })),
    },
    styles: {
      ...baseStyles,
      backgroundColor: cardBgColor,
    },
  };

  // Section 6: Shareholder FAQ & Disclosures
  const faqSection: SectionInstance = {
    id: hex('faq'),
    componentId: 'faq',
    variant: 'accordion_centered',
    visible: true,
    props: {
      eyebrow: 'Market Disclosures & Governance',
      title: 'Frequently asked investor questions & regulatory disclosures',
      subtitle: `Essential shareholder information, compliance frameworks, and key reporting deadlines for ${insights.companyName}.`,
      items: insights.faqItems.map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    },
    styles: {
      ...baseStyles,
      backgroundColor: colors.background,
    },
  };

  return [
    heroSection,
    financialHighlightsSection,
    ...(insights.executiveMessage.quote ? [quoteSection] : []),
    ...(insights.boardOrLeadership.length ? [teamSection] : []),
    ...(insights.strategicPillars.length ? [pillarsSection] : []),
    ...(insights.faqItems.length ? [faqSection] : []),
  ];
}

/**
 * Synthesizes a complete 4-page responsive investor web draft from extracted report insights:
 * 1. Home (Executive Flagship Overview)
 * 2. Financials (Performance & Results Hub with full comparative tables)
 * 3. Sustainability (ESG, Decarbonisation & Social Compact Hub)
 * 4. Leadership (Board Governance & Executive Annual Letter Hub)
 */
export function synthesizeMultiPageFromInsights(
  insights: ExtractedReportInsights,
  brandKit?: any
): GeneratedPageDraft[] {
  const hex = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const colors = insights.brandColors || {
    primary: '#2563EB',
    secondary: '#1D4ED8',
    accent: '#0EA5E9',
    background: '#070B12',
    cardBg: '#0F172A',
  };
  const accentColor = brandKit?.colors?.accent?.hex || colors.accent;

  const baseStyles = {
    theme: 'dark' as const,
    backgroundColor: colors.background,
    headingColor: '#FFFFFF',
    textColor: '#CBD5E1',
    accentColor: accentColor,
    paddingY: 'py-24' as const,
    containerWidth: 'wide' as const,
    headingScale: 'normal' as const,
    fontFamily: 'sans' as const,
  };

  // 1. PAGE: HOME
  const homeSections = synthesizeSectionsFromInsights(insights, brandKit);

  // Empty categories remain explicit editorial shells, never invented disclosures.
  const makeHero = (slug: string, title: string, subtitle: string): SectionInstance => ({
    id: hex(slug), componentId: 'hero', variant: 'contemporary_bold', visible: true,
    props: { badge: insights.companyName, title, subtitle, stats: [] }, styles: baseStyles,
  });
  const financialsSections = [makeHero('financials', 'Financial performance', 'Candidate figures extracted from the source. Verify values, periods and disclosures before publication.'),
    ...homeSections.filter(section => section.componentId === 'financial_highlights').map(section => ({ ...section, id: hex('financials') }))];
  const sustainabilitySections = [makeHero('sustainability', 'Sustainability', 'No sustainability disclosures have been extracted for this page. Add verified source content before submitting for approval.')];
  const leadershipSections = [makeHero('leadership', 'Leadership', 'Review names and roles against the source report before publication.'),
    ...homeSections.filter(section => ['team', 'rich_text'].includes(section.componentId)).map(section => ({ ...section, id: hex('leadership') }))];
  return [
    { pageSlug: 'home', slug: 'home', title: `${insights.companyName} — Overview`, layoutCollection: 'contemporary', sections: homeSections },
    { pageSlug: 'financials', slug: 'financials', title: 'Financial performance', layoutCollection: 'contemporary', sections: financialsSections },
    { pageSlug: 'sustainability', slug: 'sustainability', title: 'Sustainability — editorial draft', layoutCollection: 'contemporary', sections: sustainabilitySections },
    { pageSlug: 'leadership', slug: 'leadership', title: 'Leadership — editorial draft', layoutCollection: 'contemporary', sections: leadershipSections },
  ];
}

/**
 * Main Ingestion Pipeline: Ingests PDF / Text / Sample and outputs full multi-page composition.
 */
export async function ingestCorporateDocument(options: IngestDocumentOptions): Promise<IngestionResult> {
  let insights: ExtractedReportInsights;
  let wordCount = 0;

  if (options.sampleId && !CORPORATE_REPORT_SAMPLES[options.sampleId]) throw new Error('Unknown demo sample.');
  if (options.text && options.text.length > 2_000_000) throw new Error('Report text exceeds the 2 MB limit.');
  // Option A: Explicit fictional demo sample
  if (options.sampleId && CORPORATE_REPORT_SAMPLES[options.sampleId]) {
    insights = JSON.parse(JSON.stringify(CORPORATE_REPORT_SAMPLES[options.sampleId]));
    insights.companyName = `[DEMO — fictional] ${insights.companyName}`;
    wordCount = 2850;
  }
  // Option B: Buffer (PDF)
  else if (options.buffer) {
    const extractedText = await extractTextFromPdfBuffer(options.buffer);
    wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    insights = extractInsightsFromTextHeuristics(extractedText, 'Corporate Enterprise');
  }
  // Option C: Raw Text
  else if (options.text && options.text.trim()) {
    wordCount = options.text.split(/\s+/).filter(Boolean).length;
    insights = extractInsightsFromTextHeuristics(options.text, 'Corporate Enterprise');
  }
  // No implicit demo fallback
  else {
    throw new Error('Choose an explicit demo sample or supply a report.');
  }

  // Synthesize Section instances for active page (Home)
  const sections = synthesizeSectionsFromInsights(insights, options.brandKit);

  // Synthesize Complete Multi-Page Web Draft (Home, Financials, Sustainability, Leadership)
  const pages = synthesizeMultiPageFromInsights(insights, options.brandKit);

  return {
    success: true,
    insights,
    sections,
    pages,
    summary: `Prepared 4 editorial page drafts; verify source content before approval (${pages.map((p) => p.pageSlug).join(', ')}) with ${sections.length} core sections for ${insights.companyName} (${insights.reportingPeriod}).`,
    extractedWordsCount: wordCount,
  };
}
