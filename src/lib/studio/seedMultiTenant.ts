/**
 * Move Studio — Multi-Tenant Migration & Seed Runner
 * Ensures database schema tables exist and seeds default and demonstration clients.
 */

import type { Client as DbClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import type { Client, Website, BrandKit, PageComposition } from './types';

export async function runMoveStudioMigrations(db: DbClient): Promise<void> {
  // 1. Run schema DDL for Move Studio tables
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      try {
        await db.execute(stmt);
      } catch (err: any) {
        // Table or index might already exist
        if (!err.message?.includes('already exists')) {
          console.warn('[MoveStudio Migration] DDL statement notice:', err.message);
        }
      }
    }
  }

  // 2. Additive columns for existing tables
  const alterColumns = [
    { table: 'content_records', col: 'site_id TEXT' },
    { table: 'content_records', col: 'client_id TEXT' },
    { table: 'media_assets', col: 'site_id TEXT' },
    { table: 'media_assets', col: 'client_id TEXT' },
    { table: 'audit_log', col: 'site_id TEXT' },
    { table: 'audit_log', col: 'client_id TEXT' },
    { table: 'scheduled_jobs', col: 'site_id TEXT' },
    { table: 'scheduled_jobs', col: 'client_id TEXT' },
    { table: 'clients', col: 'billing_details_json TEXT' },
    { table: 'billing_docs', col: 'client_legal_name TEXT' },
    { table: 'billing_docs', col: 'client_reg_no TEXT' },
    { table: 'billing_docs', col: 'po_number TEXT' },
  ];

  for (const { table, col } of alterColumns) {
    try {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${col}`);
    } catch {
      // Column already exists, safe to ignore
    }
  }

  // 3. Migrate any existing unassociated content_records to Gold Fields
  try {
    await db.execute(
      `UPDATE content_records SET site_id = 'site_goldfields_flagship', client_id = 'client_goldfields' WHERE site_id IS NULL`
    );
    await db.execute(
      `UPDATE media_assets SET site_id = 'site_goldfields_flagship', client_id = 'client_goldfields' WHERE site_id IS NULL`
    );
  } catch (err) {
    console.warn('[MoveStudio Migration] Notice migrating legacy records:', err);
  }

  // 4. Seed Clients & Websites
  await seedMoveStudioTenants(db);
}

export async function seedMoveStudioTenants(db: DbClient): Promise<void> {
  const now = new Date().toISOString();

  // --- CLIENT 1: Gold Fields Limited (Preserved Corporate Flagship) ---
  await db.execute({
    sql: `INSERT OR REPLACE INTO clients (id, name, slug, industry, logo_url, primary_contact_json, billing_details_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'client_goldfields',
      'Gold Fields Limited',
      'goldfields',
      'mining_resources',
      '/assets/gold-fields-logo.svg',
      JSON.stringify({ name: 'Sipho Dlamini', email: 'communications@goldfields.com', phone: '+27 11 562 9700' }),
      JSON.stringify({
        legalEntityName: 'Gold Fields Limited',
        registrationNumber: '1968/004880/06',
        vatNumber: '4690104820',
        billingAddress: '150 Helen Road, Sandown, Sandton, Johannesburg, 2196, South Africa',
        billingContactName: 'Sipho Dlamini',
        billingEmail: 'accounts.payable@goldfields.com',
        billingPhone: '+27 11 562 9700',
        currency: 'R',
        paymentTerms: 'Net 30 Days',
        poNumberRequired: true
      }),
      now,
      now
    ]
  });

  const gfSettings = {
    enabledModules: {
      miningOperations: true,
      investorDisclosures: true,
      esgReporting: true,
      caseStudies: true,
      careers: true,
      suppliers: true,
      publicAssistant: true
    },
    navigation: {
      utilityLinks: [
        { label: 'JSE: GFI', url: '/investors' },
        { label: 'NYSE: GFI', url: '/investors' },
        { label: 'Speak Up', url: '/suppliers', isExternal: true }
      ],
      mainNav: [
        { label: 'About', href: '/about' },
        { label: 'Operations', href: '/operations' },
        { label: 'Sustainability', href: '/sustainability' },
        { label: 'Investors', href: '/investors' },
        { label: 'Reports', href: '/reports' },
        { label: 'News', href: '/media' },
        { label: 'Contact', href: '/contact' }
      ],
      primaryCta: { label: 'Ask Assistant', href: '#assistant' }
    },
    footer: {
      copyright: '© 2026 Gold Fields Limited. All rights reserved. Concept prototype evaluated by BastionGroup.',
      officeAddress: '150 Helen Road, Sandton, Johannesburg, South Africa',
      contactEmail: 'investors@goldfields.com',
      contactPhone: '+27 11 562 9700',
      columns: [
        { title: 'Operations', links: [{ label: 'South Deep', href: '/operations/south-deep' }, { label: 'Tarkwa', href: '/operations/tarkwa' }, { label: 'St Ives', href: '/operations/st-ives' }] },
        { title: 'Investors', links: [{ label: 'H1 2026 Results', href: '/reports' }, { label: 'SENS Wire', href: '/media' }] },
        { title: 'ESG', links: [{ label: '2030 Targets', href: '/sustainability' }, { label: 'GISTM Conformance', href: '/sustainability' }] }
      ]
    },
    integrations: {
      assistant: { provider: 'anthropic', status: 'connected', assistantName: 'Ask Gold Fields' },
      analytics: { provider: 'plausible', status: 'demo', trackingId: 'goldfields.com' }
    }
  };

  await db.execute({
    sql: `INSERT OR REPLACE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'site_goldfields_flagship',
      'client_goldfields',
      'Gold Fields Corporate Flagship',
      'goldfields',
      'corporate',
      'editorial',
      'published',
      'goldfields-bay.vercel.app',
      JSON.stringify(gfSettings),
      now,
      now
    ]
  });

  // --- CLIENT 2: Apex Advisory Partners (Professional Services Blueprint / Contemporary Collection) ---
  await db.execute({
    sql: `INSERT OR REPLACE INTO clients (id, name, slug, industry, logo_url, primary_contact_json, billing_details_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'client_apex_advisory',
      'Apex Advisory Partners',
      'apex-advisory',
      'professional_services',
      '/assets/apex-advisory-logo.svg',
      JSON.stringify({ name: 'Alexandra Vance', email: 'alexandra.vance@apexadvisory.com', phone: '+44 20 7946 0912' }),
      JSON.stringify({
        legalEntityName: 'Apex Advisory Partners (Pty) Ltd',
        registrationNumber: '2018/341920/07',
        vatNumber: '4720194812',
        billingAddress: 'Katherine & West Building, 114 West Street, Sandton, 2196, South Africa',
        billingContactName: 'Alexandra Vance',
        billingEmail: 'invoices@apexadvisory.co.za',
        billingPhone: '+27 11 884 2100',
        currency: 'R',
        paymentTerms: 'Net 14 Days',
        poNumberRequired: false
      }),
      now,
      now
    ]
  });

  const apexSettings = {
    enabledModules: {
      servicesList: true,
      caseStudies: true,
      careers: true,
      publicAssistant: true,
      miningOperations: false,
      investorDisclosures: false,
      esgReporting: false,
      menusAndOfferings: false
    },
    navigation: {
      mainNav: [
        { label: 'Services', href: '/services' },
        { label: 'Track Record', href: '/case-studies' },
        { label: 'Insights', href: '/insights' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      ],
      primaryCta: { label: 'Discuss Mandate', href: '/contact' }
    },
    footer: {
      copyright: '© 2026 Apex Advisory Partners LLP. Regulated by the Financial Conduct Authority.',
      officeAddress: '100 Bishopsgate, London EC2N 4AG, United Kingdom',
      contactEmail: 'mandates@apexadvisory.com',
      contactPhone: '+44 20 7946 0912',
      columns: [
        { title: 'Advisory Practice', links: [{ label: 'M&A Transactions', href: '/services#m-and-a' }, { label: 'Capital Structuring', href: '/services#capital' }, { label: 'Cross-Border Restructuring', href: '/services#restructure' }] },
        { title: 'Offices', links: [{ label: 'London Flagship', href: '/contact#london' }, { label: 'Zurich Office', href: '/contact#zurich' }, { label: 'Johannesburg Desk', href: '/contact#joburg' }] },
        { title: 'Governance', links: [{ label: 'Regulatory Disclosures', href: '/legal' }, { label: 'Privacy Policy', href: '/privacy' }] }
      ]
    },
    integrations: {
      assistant: { provider: 'deterministic', status: 'connected', assistantName: 'Apex Advisory Copilot' },
      analytics: { provider: 'ga4', status: 'not_configured' }
    }
  };

  await db.execute({
    sql: `INSERT OR REPLACE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'site_apex_strategy',
      'client_apex_advisory',
      'Apex Advisory Flagship',
      'apex-advisory',
      'professional_services',
      'contemporary',
      'published',
      'apexadvisory.com',
      JSON.stringify(apexSettings),
      now,
      now
    ]
  });

  // Apex Brand Kit
  const apexBrandKit = {
    id: 'brand_apex_v1',
    siteId: 'site_apex_strategy',
    version: 1,
    status: 'approved',
    logos: {
      primary: { url: '/assets/apex-advisory-logo.svg', status: 'approved', evidence: 'Approved vector brand mark' },
      favicon: { url: '/favicon.ico', status: 'approved' }
    },
    colors: {
      primary: { name: 'Obsidian Slate', value: '#0F172A', status: 'approved' },
      secondary: { name: 'Deep Navy Gray', value: '#1E293B', status: 'approved' },
      accent: { name: 'Sky Azure', value: '#0284C7', status: 'approved' },
      background: { name: 'Off-White Canvas', value: '#F8FAFC', status: 'approved' },
      surface: { name: 'Pure White Card', value: '#FFFFFF', status: 'approved' },
      textPrimary: { name: 'Deep Slate', value: '#0F172A', status: 'approved' },
      textMuted: { name: 'Muted Slate', value: '#64748B', status: 'approved' },
      hairline: { name: 'Hairline Divider', value: '#E2E8F0', status: 'approved' }
    },
    typography: {
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Inter',
      headingWeight: '700',
      scaleRatio: 1.25,
      status: 'approved'
    },
    componentRules: {
      radius: 'md',
      buttonStyle: 'solid',
      shadows: 'crisp',
      imageryDirection: 'Architectural, monochrome accents, high-contrast executive portraiture'
    },
    voiceAndMessaging: {
      toneOfVoice: 'Analytical, decisive, discreet, senior-partner level.',
      approvedFacts: [
        'Advising mid-market and sovereign capital on cross-border transactions across EMEA.',
        'Completed 48 closed transactions totaling $4.2B in enterprise value.',
        'Offices in London, Zurich, and Johannesburg.'
      ],
      tagline: 'Precision capital advisory for complex global mandates.',
      missionStatement: 'We structure high-stakes M&A and capital solutions with relentless rigor and discretion.'
    },
    lockedAttributes: ['colors.primary', 'colors.accent', 'logos.primary', 'voiceAndMessaging.toneOfVoice']
  };

  await db.execute({
    sql: `INSERT OR REPLACE INTO brand_kits (id, site_id, version, status, logos_json, colors_json, typography_json, component_rules_json, voice_and_messaging_json, locked_attributes_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      apexBrandKit.id,
      apexBrandKit.siteId,
      apexBrandKit.version,
      apexBrandKit.status,
      JSON.stringify(apexBrandKit.logos),
      JSON.stringify(apexBrandKit.colors),
      JSON.stringify(apexBrandKit.typography),
      JSON.stringify(apexBrandKit.componentRules),
      JSON.stringify(apexBrandKit.voiceAndMessaging),
      JSON.stringify(apexBrandKit.lockedAttributes),
      now,
      now
    ]
  });

  // Apex Home Page Composition (Professional Services Blueprint)
  const apexHomeSections = [
    {
      id: 'sec_apex_hero',
      componentId: 'hero',
      variant: 'contemporary_bold',
      visible: true,
      props: {
        badge: 'Cross-Border Capital Advisory • London • Zurich • Johannesburg',
        title: 'Precision advisory for defining corporate transactions.',
        subtitle: 'Apex Advisory Partners advises market leaders and institutional capital on high-stakes M&A, private credit, and balance sheet restructuring across EMEA.',
        primaryCta: { label: 'Explore Advisory Mandates', href: '/services' },
        secondaryCta: { label: 'Track Record & Case Studies', href: '/case-studies' },
        stats: [
          { value: '$4.2B+', label: 'Transaction Volume Advised' },
          { value: '48', label: 'Completed Transactions' },
          { value: '100%', label: 'Partner-Led Execution' },
          { value: '3', label: 'Financial Centers' }
        ]
      }
    },
    {
      id: 'sec_apex_services',
      componentId: 'services_grid',
      variant: 'cards_3col',
      visible: true,
      props: {
        eyebrow: 'Core Capabilities',
        title: 'Disciplined advisory practices tailored to complex outcomes.',
        description: 'Our senior partners lead every engagement directly from valuation thesis to deal execution and post-merger integration.',
        services: [
          {
            title: 'M&A & Strategic Divestitures',
            description: 'Buy-side and sell-side advisory for cross-border consolidations, carve-outs, and management buyouts with rigorous deal structuring.',
            metrics: '26 closed deals ($2.8B)',
            href: '/services#m-and-a'
          },
          {
            title: 'Growth Capital & Private Credit',
            description: 'Direct origination of institutional senior debt, mezzanine finance, and minority equity capital for expansion-stage enterprises.',
            metrics: '14 facilities placed ($950M)',
            href: '/services#capital'
          },
          {
            title: 'Special Situations & Restructuring',
            description: 'Consensual balance sheet reorganization, covenant renegotiation, and liquidity turnaround advisory for distressed corporates.',
            metrics: '8 successful turnarounds ($450M)',
            href: '/services#restructure'
          }
        ]
      }
    },
    {
      id: 'sec_apex_cases',
      componentId: 'case_studies',
      variant: 'impact_cards',
      visible: true,
      props: {
        eyebrow: 'Selected Track Record',
        title: 'Delivering decisive outcomes in demanding market conditions.',
        caseStudies: [
          {
            headline: '€420M Cross-Border Industrial Carve-Out',
            client: 'Pan-European Engineering Conglomerate',
            outcome: 'Structured complex carve-out of robotics division with sovereign wealth co-investment, executing within 4 months.',
            tag: 'M&A Advisory'
          },
          {
            headline: '$180M Growth Debt Facility for Cloud Infrastructure Provider',
            client: 'Tier-1 SaaS Enterprise',
            outcome: 'Arranged dual-tranche debt package reducing overall cost of capital by 240bps with zero equity dilution.',
            tag: 'Private Credit'
          }
        ]
      }
    },
    {
      id: 'sec_apex_team',
      componentId: 'team',
      variant: 'portrait_grid',
      visible: true,
      props: {
        eyebrow: 'Senior Leadership',
        title: 'Partner-level discretion. Zero junior delegation.',
        members: [
          {
            name: 'Alexandra Vance',
            role: 'Managing Partner — M&A Advisory',
            bio: '22 years investment banking experience across London and Zurich. Former Managing Director at Morgan Stanley.',
            image: '/assets/team-partner-1.jpg'
          },
          {
            name: 'Julian Thorne',
            role: 'Senior Partner — Capital Solutions',
            bio: 'Specialist in private credit, hybrid debt, and sovereign capital placement with $3B+ completed transactions.',
            image: '/assets/team-partner-2.jpg'
          },
          {
            name: 'Dr. Tariq Al-Mansoor',
            role: 'Partner — Special Situations',
            bio: 'Former restructuring advisor at Alvarez & Marsal. Advised 30+ European industrial turnarounds.',
            image: '/assets/team-partner-3.jpg'
          }
        ]
      }
    },
    {
      id: 'sec_apex_cta',
      componentId: 'cta',
      variant: 'split_card',
      visible: true,
      props: {
        eyebrow: 'Confidential Consultation',
        title: 'Initiate a preliminary discussion with our senior partners.',
        description: 'All introductory discussions are held under strict non-disclosure. We respond to all qualified corporate mandates within 24 hours.',
        ctaText: 'Schedule Confidential Discussion',
        ctaHref: '/contact',
        contactDetails: {
          london: '+44 20 7946 0912',
          email: 'mandates@apexadvisory.com'
        }
      }
    }
  ];

  await db.execute({
    sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'comp_apex_home_v1',
      'site_apex_strategy',
      'home',
      'Apex Advisory Partners — Precision Corporate Advisory',
      'contemporary',
      JSON.stringify(apexHomeSections),
      JSON.stringify({ description: 'Apex Advisory Partners advises market leaders and institutional capital on high-stakes M&A, private credit, and balance sheet restructuring across EMEA.' }),
      1,
      'published',
      now,
      now
    ]
  });

  // --- CLIENT 3: Lumina Dining & Experiences (Hospitality Blueprint / Immersive Collection) ---
  await db.execute({
    sql: `INSERT OR REPLACE INTO clients (id, name, slug, industry, logo_url, primary_contact_json, billing_details_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'client_lumina',
      'Lumina Botanical Dining',
      'lumina',
      'hospitality',
      '/assets/lumina-logo.svg',
      JSON.stringify({ name: 'Chef Sebastien Roy', email: 'reservations@luminadining.com', phone: '+27 21 488 3000' }),
      JSON.stringify({
        legalEntityName: 'Lumina Hospitality Group (Pty) Ltd',
        registrationNumber: '2022/681029/07',
        vatNumber: '4610294817',
        billingAddress: 'Bree Street Studios, 120 Bree Street, Cape Town, 8001, South Africa',
        billingContactName: 'Chef Sebastien Roy',
        billingEmail: 'accounts@luminadining.com',
        billingPhone: '+27 21 488 3000',
        currency: 'R',
        paymentTerms: 'Net 7 Days',
        poNumberRequired: false
      }),
      now,
      now
    ]
  });

  const luminaSettings = {
    enabledModules: {
      menusAndOfferings: true,
      publicAssistant: true,
      servicesList: false,
      caseStudies: false,
      miningOperations: false,
      investorDisclosures: false,
      esgReporting: false
    },
    navigation: {
      mainNav: [
        { label: 'Philosophy', href: '/about' },
        { label: 'Tasting Menus', href: '/menus' },
        { label: 'Wine & Cellar', href: '/wine' },
        { label: 'Private Dining', href: '/private' },
        { label: 'Reservations', href: '/visit' }
      ],
      primaryCta: { label: 'Book Table', href: 'https://www.opentable.com/booking-demo' }
    },
    footer: {
      copyright: '© 2026 Lumina Dining & Botanical Lounge. Cape Town, South Africa.',
      officeAddress: '12 Kloof Street, Gardens, Cape Town, 8001',
      contactEmail: 'concierge@luminadining.com',
      contactPhone: '+27 21 488 3000',
      columns: [
        { title: 'The Experience', links: [{ label: 'Autumn 8-Course Tasting', href: '/menus#tasting' }, { label: 'Botanical Pairings', href: '/menus#pairings' }] },
        { title: 'Visiting', links: [{ label: 'Reservations & Policies', href: '/visit' }, { label: 'Private Room & Buyouts', href: '/private' }] }
      ]
    },
    integrations: {
      booking: { provider: 'opentable', bookingUrl: 'https://www.opentable.com/booking-demo' }
    }
  };

  await db.execute({
    sql: `INSERT OR REPLACE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'site_lumina_dining',
      'client_lumina',
      'Lumina Flagship Experience',
      'lumina',
      'hospitality',
      'immersive',
      'draft',
      'luminadining.com',
      JSON.stringify(luminaSettings),
      now,
      now
    ]
  });

  // Lumina Brand Kit
  const luminaBrandKit = {
    id: 'brand_lumina_v1',
    siteId: 'site_lumina_dining',
    version: 1,
    status: 'approved',
    logos: {
      primary: { url: '/assets/lumina-logo.svg', status: 'approved' },
      favicon: { url: '/favicon.ico', status: 'approved' }
    },
    colors: {
      primary: { name: 'Obsidian Zinc', value: '#18181B', status: 'approved' },
      secondary: { name: 'Smoked Oak', value: '#27272A', status: 'approved' },
      accent: { name: 'Amber Ochre', value: '#D97706', status: 'approved' },
      background: { name: 'Midnight Charcoal', value: '#09090B', status: 'approved' },
      surface: { name: 'Elevated Zinc', value: '#141416', status: 'approved' },
      textPrimary: { name: 'Ivory White', value: '#FAFAFA', status: 'approved' },
      textMuted: { name: 'Muted Ash', value: '#A1A1AA', status: 'approved' },
      hairline: { name: 'Dark Charcoal Hairline', value: '#27272A', status: 'approved' }
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Plus Jakarta Sans',
      headingWeight: '600',
      scaleRatio: 1.333,
      status: 'approved'
    },
    componentRules: {
      radius: 'sm',
      buttonStyle: 'outline',
      shadows: 'subtle',
      imageryDirection: 'Moody lighting, botanical macro-photography, fire and fermentation textures'
    },
    voiceAndMessaging: {
      toneOfVoice: 'Sensory, refined, poetic, celebration of terroir and seasonal flora.',
      approvedFacts: [
        'Seasonal 8-course tasting menu sourced within 100km of the Cape Peninsula.',
        'Zero-waste botanical cellar and fermentation laboratory.',
        'Awarded World Sustainable Restaurant Award 2025.'
      ],
      tagline: 'Modern botanical dining grounded in Cape terroir.',
      missionStatement: 'We celebrate the untamed biodiversity of the Cape floral kingdom through seasonal cuisine.'
    },
    lockedAttributes: ['colors.primary', 'colors.accent', 'logos.primary']
  };

  await db.execute({
    sql: `INSERT OR REPLACE INTO brand_kits (id, site_id, version, status, logos_json, colors_json, typography_json, component_rules_json, voice_and_messaging_json, locked_attributes_json, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      luminaBrandKit.id,
      luminaBrandKit.siteId,
      luminaBrandKit.version,
      luminaBrandKit.status,
      JSON.stringify(luminaBrandKit.logos),
      JSON.stringify(luminaBrandKit.colors),
      JSON.stringify(luminaBrandKit.typography),
      JSON.stringify(luminaBrandKit.componentRules),
      JSON.stringify(luminaBrandKit.voiceAndMessaging),
      JSON.stringify(luminaBrandKit.lockedAttributes),
      now,
      now
    ]
  });

  // Lumina Home Page Composition (Hospitality Blueprint / Immersive Collection)
  const luminaHomeSections = [
    {
      id: 'sec_lumina_hero',
      componentId: 'hero',
      variant: 'immersive_full',
      visible: true,
      props: {
        badge: 'Cape Town • Seasonal Botanical Tasting Room',
        title: 'Where indigenous flora meets modern culinary fire.',
        subtitle: 'An intimate 28-seat dining experience exploring the untamed botanical terroir of the Cape Peninsula through an evolving 8-course sensory journey.',
        primaryCta: { label: 'Reserve Tasting Table', href: 'https://www.opentable.com/booking-demo' },
        secondaryCta: { label: 'Explore Autumn Menu', href: '#menus' }
      }
    },
    {
      id: 'sec_lumina_statement',
      componentId: 'rich_text',
      variant: 'editorial_quote',
      visible: true,
      props: {
        quote: '“We do not merely cook with ingredients; we translate the aromatic landscape of coastal fynbos and wild seaweeds into a living narrative.”',
        author: 'Chef Sebastien Roy',
        role: 'Executive Chef & Botanical Forager'
      }
    },
    {
      id: 'sec_lumina_menu',
      componentId: 'services_grid',
      variant: 'cards_3col',
      visible: true,
      props: {
        eyebrow: 'Seasonal Offerings',
        title: 'Autumn Tasting Menus & Pairings',
        description: 'Available Wednesday through Sunday evening. Dietary adjustments accommodated with 48 hours notice.',
        services: [
          {
            title: '8-Course Cape Flora Tasting',
            description: 'Wild coastal foraged kelp, dry-aged Karoo lamb with fermented buchu glaze, wood-fired root vegetables.',
            metrics: 'ZAR 1,450 per guest',
            href: '#reserve'
          },
          {
            title: 'Artisanal Botanical Wine Pairing',
            description: 'Biodynamic Swartland and Hemel-en-Aarde natural wines selected in symbiosis with each botanical course.',
            metrics: 'ZAR 850 per guest',
            href: '#reserve'
          },
          {
            title: 'Non-Alcoholic Botanical Alchemy',
            description: 'Cold-extracted indigenous tea infusions, smoked pine kombuchas, and mountain honey shrubs crafted in-house.',
            metrics: 'ZAR 650 per guest',
            href: '#reserve'
          }
        ]
      }
    },
    {
      id: 'sec_lumina_cta',
      componentId: 'cta',
      variant: 'banner',
      visible: true,
      props: {
        eyebrow: 'Reservations Open for Autumn 2026',
        title: 'Join us at the Chef’s Counter.',
        description: 'Reservations are released 30 days in advance. Private cellar dining available for parties up to 12.',
        ctaText: 'Reserve on OpenTable',
        ctaHref: 'https://www.opentable.com/booking-demo'
      }
    }
  ];

  await db.execute({
    sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'comp_lumina_home_v1',
      'site_lumina_dining',
      'home',
      'Lumina Dining — Modern Botanical Dining & Tasting Room',
      'immersive',
      JSON.stringify(luminaHomeSections),
      JSON.stringify({ description: 'An intimate 28-seat dining experience exploring the untamed botanical terroir of the Cape Peninsula.' }),
      1,
      'draft',
      now,
      now
    ]
  });

  console.log('✓ Move Studio multi-tenant seed complete (3 clients, 3 blueprints, 3 design collections).');
}
