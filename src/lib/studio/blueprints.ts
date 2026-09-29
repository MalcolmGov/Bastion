/**
 * Bastion Studio — Enterprise Website Blueprints & Templates Catalog
 * 
 * Comprehensive pre-built corporate templates across key commercial sectors:
 * 1. corporate — Corporate Flagship & Conglomerate (Remgro, Bidvest, Naspers)
 * 2. mining_resources — Mining & Natural Resources (Gold Fields, Exxaro, Impala)
 * 3. wealth_private_equity — Sovereign Wealth & Private Equity (Meridian, Valen Wealth)
 * 4. renewable_energy — Renewable Energy & Infrastructure (Solaris, Swifter Energy)
 * 5. enterprise_tech — Enterprise Technology & AI Platforms (CloudScale, Telkom Enterprise)
 * 6. healthcare — Healthcare & Life Sciences (Discovery Health, Netcare)
 * 7. legal_advisory — Institutional Legal & M&A Advisory (Bowmans, ENSafrica)
 * 8. hospitality_living — Luxury Living & Boutique Hospitality (Steyn City, Franschhoek Cellars)
 */

import type { BlueprintId, IndustryType } from './types';

export interface BlueprintDefinition {
  id: BlueprintId;
  name: string;
  tagline: string;
  description: string;
  recommendedIndustries: IndustryType[];
  badge: string;
  accentColor: string;
  defaultPages: Array<{
    slug: string;
    title: string;
    description: string;
    isPrimary: boolean;
  }>;
  coreModules: string[];
  optionalModules: string[];
  primaryConversionActions: string[];
  sampleStats: Array<{ value: string; label: string }>;
  sampleHero: {
    badge: string;
    title: string;
    subtitle: string;
  };
}

export const BLUEPRINTS: Record<BlueprintId, BlueprintDefinition> = {
  corporate: {
    id: 'corporate',
    name: 'Corporate Flagship & Conglomerate',
    badge: 'JSE Top 40 Standard',
    accentColor: '#1E293B',
    tagline: 'Authoritative, multi-stakeholder corporate governance presence.',
    description: 'Engineered for publicly listed holdings, diversified industrial groups, and enterprise conglomerates requiring rigorous board governance, regulatory disclosures, share telemetry, and global operations reporting.',
    recommendedIndustries: ['corporate', 'general'],
    sampleStats: [
      { value: '42+', label: 'Global Operating Jurisdictions' },
      { value: 'R84.6B', label: 'Market Capitalization' },
      { value: '14,200', label: 'Workforce Strength' },
      { value: 'AAA', label: 'Governance & ESG Rating' }
    ],
    sampleHero: {
      badge: 'Corporate Overview & Governance',
      title: 'Decisive stewardship creating enduring generational enterprise value.',
      subtitle: 'Guiding market-leading industrial, financial, and digital operating subsidiaries across international markets with unmatched governance discipline.'
    },
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
    optionalModules: ['investorDisclosures', 'esgReporting', 'careers', 'suppliers', 'publicAssistant'],
    primaryConversionActions: ['Download Annual Report', 'Subscribe to SENS Alerts', 'Contact Corporate Affairs']
  },

  mining_resources: {
    id: 'mining_resources',
    name: 'Mining & Natural Resources',
    badge: 'ICMM & King IV Compliant',
    accentColor: '#C99700',
    tagline: 'SENS disclosures, operational telemetry, and 2030 ESG targets.',
    description: 'Purpose-built for precious metals, bulk commodities, and exploration houses. Features real-time SENS market announcements, deep environmental compliance, tailings governance, safety milestones, and interactive mine asset maps.',
    recommendedIndustries: ['mining_resources', 'corporate'],
    sampleStats: [
      { value: '2.34M oz', label: 'Annual Attributable Production' },
      { value: '0.00', label: 'Fatal Injury Frequency Rate' },
      { value: 'R1,420/oz', label: 'All-In Sustaining Costs' },
      { value: '-38%', label: 'Scope 1 & 2 Carbon Reduction' }
    ],
    sampleHero: {
      badge: 'Sustainable Mining & Metallurgy',
      title: 'Unlocking natural resource value with uncompromising safety and ESG discipline.',
      subtitle: 'Operating globally diversified gold, platinum, and strategic mineral assets with cutting-edge mechanized edge technology and zero-harm commitments.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Operational telemetry, mine safety stats, share price, SENS stream.', isPrimary: true },
      { slug: 'operations', title: 'Mines & Processing Facilities', description: 'Regional assets, processing plants, reserves & resources declarations.', isPrimary: true },
      { slug: 'sustainability', title: 'Decarbonization & Tailings', description: '2030 emissions goals, water recycling, community trust funds.', isPrimary: true },
      { slug: 'investors', title: 'Shareholders & Regulatory SENS', description: 'Quarterly operational results, integrated annual report, JSE/NYSE filings.', isPrimary: true },
      { slug: 'suppliers', title: 'Procurement & Local Content', description: 'Vendor registration portal, BEE compliance, ethics hotline.', isPrimary: false },
      { slug: 'contact', title: 'Stakeholder Relations', description: 'Investor contacts, regional operating offices, whistleblower desk.', isPrimary: true }
    ],
    coreModules: ['miningOperations', 'investorDisclosures', 'esgReporting', 'reports'],
    optionalModules: ['suppliers', 'careers', 'news', 'publicAssistant'],
    primaryConversionActions: ['Read Latest SENS Announcement', 'Download Integrated Report', 'Register as Vendor']
  },

  wealth_private_equity: {
    id: 'wealth_private_equity',
    name: 'Sovereign Wealth & Private Equity',
    badge: 'Institutional Capital Tier',
    accentColor: '#0F766E',
    tagline: 'Mandate portfolios, AUM metrics, and confidential deal flow.',
    description: 'Designed for private equity firms, asset management institutions, family offices, and venture funds. Focuses on investment thesis clarity, active portfolio performance, track records, and a secure LP investor access portal.',
    recommendedIndustries: ['wealth_private_equity', 'corporate'],
    sampleStats: [
      { value: '$4.2B', label: 'Assets Under Management' },
      { value: '26.8%', label: 'Net IRR Historical Track Record' },
      { value: '38', label: 'Platform Portfolio Realizations' },
      { value: 'Tier-1', label: 'Institutional LP Base' }
    ],
    sampleHero: {
      badge: 'Private Capital & Direct Mandates',
      title: 'Partnering with transformative businesses to compound long-term alpha.',
      subtitle: 'Deploying high-conviction growth and buyout capital into resilient African and cross-border emerging market leaders.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Firm philosophy, AUM metric counters, featured platform investments.', isPrimary: true },
      { slug: 'portfolio', title: 'Active Portfolio & Realizations', description: 'Direct buyout holdings, growth case studies, sector allocation.', isPrimary: true },
      { slug: 'strategy', title: 'Investment Thesis & ESG', description: 'Value creation playbook, operational intervention, responsible investing.', isPrimary: true },
      { slug: 'team', title: 'Investment Committee & Partners', description: 'Partner biographies, advisory council, operating executives.', isPrimary: true },
      { slug: 'insights', title: 'Market Perspectives & Whitepapers', description: 'Private market intelligence, macro trend briefs, LP reports.', isPrimary: false },
      { slug: 'contact', title: 'Confidential Deal Submission', description: 'Founder pitch pipeline, LP investor desk, London & Joburg offices.', isPrimary: true }
    ],
    coreModules: ['caseStudies', 'team', 'insights', 'contactForm'],
    optionalModules: ['investorDisclosures', 'reports', 'publicAssistant'],
    primaryConversionActions: ['Inquire Direct Mandate', 'Access LP Investor Room', 'Review Track Record']
  },

  renewable_energy: {
    id: 'renewable_energy',
    name: 'Renewable Energy & Infrastructure',
    badge: 'Clean Energy Grid Ready',
    accentColor: '#0284C7',
    tagline: 'Megawatt telemetry, grid battery storage, and PPA contracting.',
    description: 'Engineered for solar IPPs, wind farms, battery energy storage systems (BESS), and green hydrogen developers. Provides interactive generation capacity dashboards, carbon offset telemetry, and commercial power purchase agreement (PPA) flows.',
    recommendedIndustries: ['renewable_energy', 'corporate'],
    sampleStats: [
      { value: '1,850 MW', label: 'Commissioned Solar & Wind Capacity' },
      { value: '420 MWh', label: 'Utility Battery Storage (BESS)' },
      { value: '2.1M Tons', label: 'Annual CO2 Abatement' },
      { value: '99.8%', label: 'Grid Interconnection Reliability' }
    ],
    sampleHero: {
      badge: 'Utility-Scale Clean Power',
      title: 'Accelerating energy independence through next-generation renewable infrastructure.',
      subtitle: 'Financing, constructing, and operating utility-scale clean energy generation and storage assets across Sub-Saharan Africa and high-demand grids.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Live generation telemetry, project portfolio, environmental impact counters.', isPrimary: true },
      { slug: 'projects', title: 'Solar, Wind & Storage Assets', description: 'Interactive project map, asset profiles, megawatt capacity specs.', isPrimary: true },
      { slug: 'ppa-solutions', title: 'Commercial & Industrial PPAs', description: 'Corporate off-taker structures, wheeling frameworks, tariff models.', isPrimary: true },
      { slug: 'sustainability', title: 'Carbon Abatement & ESG', description: 'Grid displacement metrics, biodiversity safeguards, community dividends.', isPrimary: false },
      { slug: 'about', title: 'Engineering & Executive Leadership', description: 'Technical development credentials, EPC partners, governance.', isPrimary: false },
      { slug: 'contact', title: 'PPA & Land Acquisition Inquiry', description: 'Off-taker RFP submissions, landowner lease inquiries.', isPrimary: true }
    ],
    coreModules: ['miningOperations', 'caseStudies', 'reports', 'contactForm'],
    optionalModules: ['esgReporting', 'news', 'publicAssistant'],
    primaryConversionActions: ['Request Corporate PPA Proposal', 'Explore Generation Map', 'Download ESG Impact Brief']
  },

  enterprise_tech: {
    id: 'enterprise_tech',
    name: 'Enterprise Technology & AI Platforms',
    badge: 'SOC2 & Cloud Native',
    accentColor: '#6366F1',
    tagline: 'Interactive product mockups, developer API docs, and SOC2 security.',
    description: 'Designed for enterprise B2B SaaS, cyber defense, cloud infrastructure, and AI engineering platforms. Highlights interactive feature demos, compliance trust badges (SOC2/ISO27001), API documentation hubs, and customized enterprise tier inquiries.',
    recommendedIndustries: ['enterprise_tech', 'technology'],
    sampleStats: [
      { value: '99.99%', label: 'Uptime SLA Commitment' },
      { value: '<12ms', label: 'Global Edge Invalidation' },
      { value: '140M+', label: 'Daily API Invocations' },
      { value: 'SOC 2', label: 'Type II Certified & HIPAA Ready' }
    ],
    sampleHero: {
      badge: 'Next-Gen Enterprise Infrastructure',
      title: 'Autonomous intelligence architecture powering mission-critical workflows.',
      subtitle: 'High-throughput, distributed AI compute with zero data-retention guarantees, audited security certifications, and instantaneous edge synchronization.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Interactive demo canvas, enterprise logos, SLA metrics, feature highlights.', isPrimary: true },
      { slug: 'platform', title: 'Architecture & Engine', description: 'Technical capabilities, latency benchmarks, distributed edge nodes.', isPrimary: true },
      { slug: 'security', title: 'Trust & Compliance Center', description: 'SOC2 Type II, ISO 27001, GDPR/POPIA, encryption whitepapers.', isPrimary: true },
      { slug: 'customers', title: 'Enterprise Proof & Scale', description: 'Fortune 500 benchmarks, migration case studies, ROI models.', isPrimary: false },
      { slug: 'pricing', title: 'Enterprise Licensing & SLAs', description: 'Dedicated tenancy, SLA options, volume tiers, custom quotes.', isPrimary: false },
      { slug: 'contact', title: 'Schedule Technical Deep-Dive', description: 'Direct solutions architect booking, enterprise quote form.', isPrimary: true }
    ],
    coreModules: ['servicesList', 'caseStudies', 'reports', 'contactForm'],
    optionalModules: ['insights', 'careers', 'publicAssistant'],
    primaryConversionActions: ['Schedule Technical Demo', 'Request Enterprise Quote', 'Review Security Whitepaper']
  },

  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    badge: 'Clinical Governance Standard',
    accentColor: '#0EA5E9',
    tagline: 'Clinical governance, therapeutic divisions, and specialist directories.',
    description: 'Crafted for hospital networks, specialized medical clinics, biotech innovators, and medical research foundations. Integrates facility locators, emergency triage banners, doctor credential directories, clinical trials, and patient booking portals.',
    recommendedIndustries: ['healthcare', 'health_wellness'],
    sampleStats: [
      { value: '34', label: 'Accredited Acute Care Hospitals' },
      { value: '1,800+', label: 'Specialist Physicians & Surgeons' },
      { value: '98.4%', label: 'Clinical Quality & Safety Index' },
      { value: '24/7/365', label: 'Emergency Trauma Coverage' }
    ],
    sampleHero: {
      badge: 'Clinical Excellence & Patient Care',
      title: 'Pioneering compassionate, world-class medical innovation and treatment.',
      subtitle: 'Delivering multidisciplinary clinical care, state-of-the-art robotic surgery, and advanced oncology across accredited hospital facilities.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Emergency triage banner, doctor finder, clinical centers of excellence.', isPrimary: true },
      { slug: 'specialties', title: 'Clinical Specialties & Centers', description: 'Cardiology, oncology, neurosurgery, robotic surgery, orthopedics.', isPrimary: true },
      { slug: 'hospitals', title: 'Hospital & Facility Directory', description: 'Interactive hospital locator, visiting hours, direct facility lines.', isPrimary: true },
      { slug: 'governance', title: 'Clinical Governance & Safety', description: 'Infection prevention metrics, ethics committee, patient rights charter.', isPrimary: false },
      { slug: 'research', title: 'Life Sciences & Clinical Trials', description: 'Ongoing investigative protocols, medical publications, academic chairs.', isPrimary: false },
      { slug: 'contact', title: 'Appointments & Emergency Triage', description: 'Online pre-admission booking, direct emergency switchboard.', isPrimary: true }
    ],
    coreModules: ['servicesList', 'team', 'reports', 'contactForm'],
    optionalModules: ['careers', 'news', 'publicAssistant'],
    primaryConversionActions: ['Find a Specialist', 'Book Hospital Pre-Admission', 'Emergency Contact Info']
  },

  legal_advisory: {
    id: 'legal_advisory',
    name: 'Institutional Legal & M&A Advisory',
    badge: 'Chambers Tier 1 Band',
    accentColor: '#9333EA',
    tagline: 'Practice taxonomies, cross-border M&A deals, and partner credentials.',
    description: 'Tailored for elite corporate law firms, cross-border dispute practices, and financial advisory boutiques. Emphasizes deal experience, Chambers & Legal 500 rankings, practice group taxonomies, and strategic market alerts.',
    recommendedIndustries: ['legal_advisory', 'professional_services'],
    sampleStats: [
      { value: 'R180B+', label: 'M&A Deal Mandates Advised in 2025' },
      { value: 'Tier 1', label: 'Chambers Global Ranking (6 Practices)' },
      { value: '120+', label: 'Senior Equity Partners & Counsel' },
      { value: '14', label: 'Pan-African & Offshore Desks' }
    ],
    sampleHero: {
      badge: 'Corporate Law & Complex Transactions',
      title: 'Providing decisive legal counsel for landmark transactions and critical disputes.',
      subtitle: 'Trusted by multinational corporations, sovereign entities, and financial institutions to execute complex M&A, regulatory mandates, and dispute resolution.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Key deal announcements, Chambers recognition, practice group overview.', isPrimary: true },
      { slug: 'practices', title: 'Practice Areas & Capabilities', description: 'Banking & Finance, M&A, Competition, Mining Law, Tax, Dispute Resolution.', isPrimary: true },
      { slug: 'deals', title: 'Track Record & Tombstones', description: 'Public transaction announcements, cross-border deals, restructuring briefs.', isPrimary: true },
      { slug: 'lawyers', title: 'Partners & Legal Counsel', description: 'Searchable directory by practice area, jurisdiction, and seniority.', isPrimary: true },
      { slug: 'insights', title: 'Regulatory Briefings & Alerts', description: 'Legislative changes, competition tribunal rulings, tax law updates.', isPrimary: false },
      { slug: 'contact', title: 'Confidential Client Inquiry', description: 'Retainer inquiries, conflict checks, international desk contacts.', isPrimary: true }
    ],
    coreModules: ['servicesList', 'caseStudies', 'team', 'contactForm'],
    optionalModules: ['insights', 'careers', 'publicAssistant'],
    primaryConversionActions: ['Inquire Retainer / Mandate', 'Download Legal Briefing', 'Contact Practice Head']
  },

  hospitality_living: {
    id: 'hospitality_living',
    name: 'Luxury Living & Boutique Hospitality',
    badge: 'Forbes Travel Guide Caliber',
    accentColor: '#D97706',
    tagline: 'Sensory photography, tasting menus, cellar collection, and suite bookings.',
    description: 'Designed for residential lifestyle estates, 5-star boutique hotels, historic wine farms, and private dining rooms. Focuses on full-bleed sensory photography, seasonal harvest tasting menus, estate amenities, and reservation integration.',
    recommendedIndustries: ['luxury_living', 'hospitality'],
    sampleStats: [
      { value: '5 Star', label: 'Luxury Tourism Grading' },
      { value: '98 Pts', label: 'Tim Atkin Wine Estate Rating' },
      { value: '450 Ha', label: 'Protected Private Reserve & Vineyards' },
      { value: 'Michelin', label: 'Featured Executive Culinary Team' }
    ],
    sampleHero: {
      badge: 'Luxury Estate & Culinary Haven',
      title: 'An exquisite sanctuary where heritage architecture meets bespoke hospitality.',
      subtitle: 'Immerse yourself in panoramic vineyard landscapes, award-winning gastronomic dining, and ultra-private luxury villas in the heart of the valley.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Atmospheric hero, philosophy statement, culinary previews, booking CTA.', isPrimary: true },
      { slug: 'villas', title: 'Luxury Suites & Villas', description: 'Suite floor plans, private plunge pools, panoramic mountain vistas.', isPrimary: true },
      { slug: 'dining', title: 'Gastronomy & Tasting Menus', description: 'Seasonal terroir menus, cellar selections, chef table experiences.', isPrimary: true },
      { slug: 'estate', title: 'Estate Heritage & Amenities', description: 'Historic vineyards, wellness spa, equestrian trails, masterplan.', isPrimary: false },
      { slug: 'events', title: 'Private Celebrations & Buyouts', description: 'Cellar weddings, executive retreats, corporate summit hosting.', isPrimary: false },
      { slug: 'reservations', title: 'Reserve Stay & Dining', description: 'Real-time room availability, dining table booking, concierge request.', isPrimary: true }
    ],
    coreModules: ['menusAndOfferings', 'reservationCta', 'contactForm'],
    optionalModules: ['events', 'privateDining', 'publicAssistant'],
    primaryConversionActions: ['Reserve Luxury Villa', 'Book Cellar Tasting Menu', 'Inquire Private Estate Buyout']
  },

  // Backwards compatibility aliases
  professional_services: {
    id: 'professional_services',
    name: 'Professional Services & Advisory',
    badge: 'Enterprise Standard',
    accentColor: '#0F766E',
    tagline: 'High-credibility advisory, agency, and consultancy flagship.',
    description: 'Tailored for law firms, management consultancies, M&A advisory, architecture, and technology agencies.',
    recommendedIndustries: ['professional_services', 'technology', 'general'],
    sampleStats: [
      { value: '$4.2B', label: 'Client Mandates Advised' },
      { value: '98%', label: 'Executive Retention Rate' },
      { value: '14', label: 'Global Practice Desks' }
    ],
    sampleHero: {
      badge: 'Strategic Advisory & Execution',
      title: 'Delivering precision outcomes for demanding corporate mandates.',
      subtitle: 'Partner-led advisory, technological execution, and governance consulting for market leaders.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Strategic positioning, key metrics, core capabilities, featured mandates.', isPrimary: true },
      { slug: 'services', title: 'Advisory Practice', description: 'Practice area overview, methodologies, deliverables, engagement models.', isPrimary: true },
      { slug: 'case-studies', title: 'Track Record & Impact', description: 'Verified transaction studies, outcome metrics, confidential case profiles.', isPrimary: true },
      { slug: 'about', title: 'Partners & Firm Ethos', description: 'Partner biographies, advisory philosophy, institutional credentials.', isPrimary: true },
      { slug: 'contact', title: 'Confidential Inquiry', description: 'Mandate submission form, partner contact details, global desks.', isPrimary: true }
    ],
    coreModules: ['servicesList', 'caseStudies', 'team', 'contactForm'],
    optionalModules: ['insights', 'careers', 'publicAssistant'],
    primaryConversionActions: ['Schedule Consultation', 'Submit Mandate Brief', 'Download Case Study']
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hospitality & Culinary Experiences',
    badge: 'Sensory Living Tier',
    accentColor: '#D97706',
    tagline: 'Sensory, experience-led presence for dining and boutique venues.',
    description: 'Crafted for fine dining restaurants, botanical tasting rooms, boutique hotels, and cultural venues.',
    recommendedIndustries: ['hospitality', 'retail', 'health_wellness'],
    sampleStats: [
      { value: '5 Star', label: 'Luxury Tourism Rating' },
      { value: 'Michelin', label: 'Culinary Direction' },
      { value: '100%', label: 'Local Terroir Ingredients' }
    ],
    sampleHero: {
      badge: 'Sensory Gastronomy',
      title: 'A culinary sanctuary where heritage terroir meets modern culinary craft.',
      subtitle: 'Experience seasonal farm-to-table tasting journeys paired with exclusive estate vintages.'
    },
    defaultPages: [
      { slug: 'home', title: 'Home', description: 'Full-bleed atmospheric hero, philosophy statement, menu preview, booking CTA.', isPrimary: true },
      { slug: 'menus', title: 'Menus & Pairings', description: 'Seasonal tasting menus, a la carte, wine and non-alcoholic pairings.', isPrimary: true },
      { slug: 'about', title: 'Philosophy & Terroir', description: 'Chef story, culinary heritage, ingredient provenance, local grower partnerships.', isPrimary: true },
      { slug: 'visit', title: 'Visit & Reservations', description: 'Location, parking, dress code, operating hours, OpenTable/Resy link.', isPrimary: true }
    ],
    coreModules: ['menusAndOfferings', 'reservationCta', 'contactForm'],
    optionalModules: ['events', 'privateDining', 'publicAssistant'],
    primaryConversionActions: ['Reserve Table', 'Inquire Private Dining', 'View Seasonal Menu']
  }
};
