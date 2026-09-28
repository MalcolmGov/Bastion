/**
 * Move Studio — Automatic Website Assembly Pipeline
 * Takes extracted or reviewed client material, selected blueprint, and design collection,
 * then maps content into typed CMS records and generates full page compositions with a gap report.
 */

import type { Client as DbClient } from '@libsql/client';
import type {
  BlueprintId,
  DesignCollectionId,
  Website,
  BrandKit,
  PageComposition,
  SectionInstance,
  ContentGapItem
} from './types';
import { BLUEPRINTS } from './blueprints';
import { COMPONENT_REGISTRY } from './componentRegistry';

export interface AssembleInput {
  clientId: string;
  clientName: string;
  websiteName: string;
  websiteSlug: string;
  blueprintId: BlueprintId;
  collectionId: DesignCollectionId;
  brandKit: Partial<BrandKit>;
  extractedContent: {
    tagline?: string;
    services?: Array<{ title: string; description: string; metrics?: string; href?: string }>;
    contactInfo?: { email?: string; phone?: string; address?: string };
    businessSummary?: string;
    navigation?: Array<{ label: string; url: string }>;
    socialLinks?: Array<{ platform: string; url: string; handle?: string }>;
    footerNavigation?: Array<{ category: string; links: Array<{ label: string; url: string }> }>;
    stats?: Array<{ value: string; label: string }>;
    teamMembers?: Array<{ name: string; role: string; bio?: string; image?: string }>;
    caseStudies?: Array<{ headline: string; client: string; outcome: string; tag?: string }>;
  };
}

export interface AssembleResult {
  websiteId: string;
  previewUrl: string;
  compositions: PageComposition[];
  gaps: ContentGapItem[];
}

export class WebsiteAssembler {
  static async assembleAndSave(input: AssembleInput, db: DbClient): Promise<AssembleResult> {
    const now = new Date().toISOString();
    const siteId = `site_${input.websiteSlug.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const blueprint = BLUEPRINTS[input.blueprintId] || BLUEPRINTS.corporate;

    // 1. Prepare Curated Navigation (clean, uncrowded, top 5 primary links)
    const rawNav = input.extractedContent.navigation || [];
    const seenNavLabels = new Set<string>();
    const curatedMainNav: Array<{ label: string; href: string }> = [];

    for (const item of rawNav) {
      const cleanLabel = item.label.trim();
      const lower = cleanLabel.toLowerCase();
      if (
        !cleanLabel ||
        seenNavLabels.has(lower) ||
        lower === 'home' ||
        lower.startsWith('sign in') ||
        lower.startsWith('log in') ||
        curatedMainNav.length >= 5
      ) {
        continue;
      }
      seenNavLabels.add(lower);
      const displayLabel = cleanLabel.length > 18 ? cleanLabel.slice(0, 16) + '…' : cleanLabel;
      curatedMainNav.push({ label: displayLabel, href: item.url });
    }

    if (curatedMainNav.length === 0) {
      curatedMainNav.push(
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' }
      );
    }

    // Default rich footer columns
    const defaultFooterColumns = [
      {
        category: 'Capabilities',
        links: [
          { label: 'Platform Architecture', url: '/services' },
          { label: 'Core Solutions', url: '/services' },
          { label: 'Systems Integration', url: '/services' }
        ]
      },
      {
        category: 'Organization',
        links: [
          { label: 'About Executive Team', url: '/about' },
          { label: 'Practice Philosophy', url: '/about' },
          { label: 'Client Mandates', url: '/about' }
        ]
      },
      {
        category: 'Governance & Connect',
        links: [
          { label: 'Direct Partner Contact', url: '/contact' },
          { label: 'Privacy & Disclosures', url: '/privacy' },
          { label: 'Terms of Engagement', url: '/terms' }
        ]
      }
    ];

    const footerColumns = (input.extractedContent.footerNavigation && input.extractedContent.footerNavigation.length > 0)
      ? input.extractedContent.footerNavigation
      : defaultFooterColumns;

    const socialLinks = (input.extractedContent.socialLinks && input.extractedContent.socialLinks.length > 0)
      ? input.extractedContent.socialLinks
      : [
          { platform: 'linkedin', url: `https://linkedin.com/company/${input.websiteSlug}`, handle: input.websiteSlug },
          { platform: 'twitter', url: `https://x.com/${input.websiteSlug}`, handle: `@${input.websiteSlug}` }
        ];

    const settings = {
      enabledModules: {
        servicesList: input.blueprintId === 'professional_services',
        caseStudies: input.blueprintId === 'professional_services',
        menusAndOfferings: input.blueprintId === 'hospitality',
        miningOperations: false,
        investorDisclosures: false,
        publicAssistant: true
      },
      navigation: {
        mainNav: curatedMainNav,
        allNav: rawNav.map(n => ({ label: n.label, href: n.url })),
        primaryCta: { label: 'Get in Touch', href: '/contact' }
      },
      footer: {
        copyright: `© ${new Date().getFullYear()} ${input.clientName}. All rights reserved.`,
        officeAddress: input.extractedContent.contactInfo?.address || 'Corporate Headquarters',
        contactEmail: input.extractedContent.contactInfo?.email || `contact@${input.websiteSlug}.com`,
        contactPhone: input.extractedContent.contactInfo?.phone,
        columns: footerColumns,
        socialLinks
      }
    };

    // 0. Ensure Client Record exists
    await db.execute({
      sql: `INSERT OR IGNORE INTO clients (id, name, slug, industry, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        input.clientId,
        input.clientName,
        input.websiteSlug,
        input.blueprintId === 'hospitality' ? 'hospitality' : (input.blueprintId === 'professional_services' ? 'professional_services' : 'corporate'),
        now,
        now
      ]
    });

    // 2. Insert Website Record
    await db.execute({
      sql: `INSERT OR REPLACE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, settings_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        siteId,
        input.clientId,
        input.websiteName,
        input.websiteSlug,
        input.blueprintId,
        input.collectionId,
        'draft',
        JSON.stringify(settings),
        now,
        now
      ]
    });

    // 3. Save / Update Brand Kit
    const brandKitId = `brand_${siteId}_v1`;
    const fullBrandKit = {
      id: brandKitId,
      siteId,
      version: 1,
      status: 'approved',
      logos: input.brandKit.logos || {
        primary: { url: '/assets/logo-placeholder.svg', status: 'approved' }
      },
      colors: input.brandKit.colors || {
        primary: { name: 'Primary Slate', value: '#0F172A', status: 'approved' },
        secondary: { name: 'Secondary Navy', value: '#1E293B', status: 'approved' },
        accent: { name: 'Electric Accent', value: '#0284C7', status: 'approved' },
        background: { name: 'Light Canvas', value: '#F8FAFC', status: 'approved' },
        surface: { name: 'White Surface', value: '#FFFFFF', status: 'approved' },
        textPrimary: { name: 'Dark Ink', value: '#0F172A', status: 'approved' },
        textMuted: { name: 'Muted Ink', value: '#64748B', status: 'approved' },
        hairline: { name: 'Hairline Divider', value: '#E2E8F0', status: 'approved' }
      },
      typography: input.brandKit.typography || {
        headingFont: input.collectionId === 'editorial' ? 'Playfair Display' : 'Plus Jakarta Sans',
        bodyFont: 'Inter',
        headingWeight: '700',
        scaleRatio: 1.25,
        status: 'approved'
      },
      componentRules: input.brandKit.componentRules || {
        radius: 'md',
        buttonStyle: 'solid',
        shadows: 'crisp',
        imageryDirection: 'Clean corporate photography with high-contrast framing'
      },
      voiceAndMessaging: input.brandKit.voiceAndMessaging || {
        toneOfVoice: 'Authoritative, decisive, and customer-aligned.',
        approvedFacts: ['Established organization delivering specialist capabilities.']
      },
      lockedAttributes: ['logos.primary', 'colors.primary']
    };

    await db.execute({
      sql: `INSERT OR REPLACE INTO brand_kits (id, site_id, version, status, logos_json, colors_json, typography_json, component_rules_json, voice_and_messaging_json, locked_attributes_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        brandKitId,
        siteId,
        1,
        'approved',
        JSON.stringify(fullBrandKit.logos),
        JSON.stringify(fullBrandKit.colors),
        JSON.stringify(fullBrandKit.typography),
        JSON.stringify(fullBrandKit.componentRules),
        JSON.stringify(fullBrandKit.voiceAndMessaging),
        JSON.stringify(fullBrandKit.lockedAttributes),
        now,
        now
      ]
    });

    // 4. Assemble Composed Pages
    const compositions: PageComposition[] = [];
    const gaps: ContentGapItem[] = [];

    // Analyze gaps
    if (!input.extractedContent.contactInfo?.phone) {
      gaps.push({
        id: 'gap_missing_phone',
        severity: 'warning',
        pageSlug: 'contact',
        field: 'phone',
        message: 'No direct telephone number was detected in website extraction.',
        suggestedAction: 'Add direct corporate telephone number in Brand & Settings.'
      });
    }

    if (!input.extractedContent.services || input.extractedContent.services.length < 3) {
      gaps.push({
        id: 'gap_services_count',
        severity: 'info',
        pageSlug: 'services',
        field: 'services',
        message: 'Fewer than 3 services detected. Recommended to have at least 3 practice areas for balanced grid visual rhythm.',
        suggestedAction: 'Add supporting practice areas in Content management.'
      });
    }

    // Build Homepage Sections
    const homeSections: SectionInstance[] = [
      {
        id: `sec_${siteId}_hdr`,
        componentId: 'header',
        variant: input.collectionId === 'immersive' ? 'bold_solid' : 'standard_glass',
        visible: true,
        props: {
          brandName: input.clientName,
          logoUrl: fullBrandKit.logos.primary?.url,
          links: settings.navigation.mainNav,
          allLinks: settings.navigation.allNav,
          ctaText: settings.navigation.primaryCta.label,
          ctaHref: settings.navigation.primaryCta.href
        }
      },
      {
        id: `sec_${siteId}_hero`,
        componentId: 'hero',
        variant: input.collectionId === 'immersive' ? 'immersive_full' : input.collectionId === 'editorial' ? 'editorial_split' : 'contemporary_bold',
        visible: true,
        props: {
          badge: `${input.clientName} Flagship`,
          title: input.extractedContent.tagline || input.brandKit.voiceAndMessaging?.tagline || (input.extractedContent.businessSummary
            ? `${input.clientName}: Strategic excellence.`
            : `Delivering precision capabilities for demanding requirements.`),
          subtitle: input.extractedContent.businessSummary || input.brandKit.voiceAndMessaging?.missionStatement || 'Providing industry-leading capabilities and strategic advisory with senior partner dedication.',
          primaryCta: { label: settings.navigation.primaryCta?.label || 'Explore Capabilities', href: settings.navigation.primaryCta?.href || '/services' },
          secondaryCta: { label: 'Contact Our Team', href: '/contact' },
          stats: input.extractedContent.stats || [
            { value: '100%', label: 'Dedicated Execution' },
            { value: '24h', label: 'Response Guarantee' },
            { value: 'Tier-1', label: 'Client Quality Standard' }
          ]
        }
      },
      {
        id: `sec_${siteId}_services`,
        componentId: 'services_grid',
        variant: 'cards_3col',
        visible: true,
        props: {
          eyebrow: input.blueprintId === 'hospitality' ? 'Seasonal Offerings' : (input.blueprintId === 'professional_services' ? 'Practice Areas & Capabilities' : 'Core Capabilities'),
          title: `Capabilities and solutions by ${input.clientName}.`,
          description: input.extractedContent.businessSummary || 'Senior partner-led execution across all core disciplines.',
          services: (input.extractedContent.services && input.extractedContent.services.length > 0)
            ? input.extractedContent.services
            : [
                { title: 'Core Advisory & Consulting', description: 'Comprehensive strategic advisory tailored to institutional clients.' },
                { title: 'Execution & Delivery', description: 'Rigorous implementation ensuring sustainable performance and efficiency.' },
                { title: 'Risk Governance & Review', description: 'Continuous compliance and risk assessment protocols.' }
              ]
        }
      }
    ];

    if (input.extractedContent.caseStudies && input.extractedContent.caseStudies.length > 0) {
      homeSections.push({
        id: `sec_${siteId}_cases`,
        componentId: 'case_studies',
        variant: 'impact_cards',
        visible: true,
        props: {
          eyebrow: 'Verified Impact',
          title: 'Decisive outcomes achieved across client engagements.',
          caseStudies: input.extractedContent.caseStudies
        }
      });
    }

    homeSections.push(
      {
        id: `sec_${siteId}_cta`,
        componentId: 'cta',
        variant: 'split_card',
        visible: true,
        props: {
          eyebrow: 'Inquire & Connect',
          title: `Connect with ${input.clientName} for your next initiative.`,
          description: input.extractedContent.businessSummary || `Engage directly with ${input.clientName} to discuss specifications, architecture, or partnerships.`,
          ctaText: settings.navigation.primaryCta?.label || 'Get in Touch',
          ctaHref: settings.navigation.primaryCta?.href || '/contact',
          contactDetails: {
            phone: input.extractedContent.contactInfo?.phone,
            email: input.extractedContent.contactInfo?.email
          }
        }
      },
      {
        id: `sec_${siteId}_ftr`,
        componentId: 'footer',
        variant: 'multi_column',
        visible: true,
        props: {
          brandName: input.clientName,
          logoUrl: fullBrandKit.logos.primary?.url,
          tagline: input.extractedContent.tagline || input.brandKit.voiceAndMessaging?.tagline || `Precision solutions and architecture for ${input.clientName}.`,
          copyright: settings.footer.copyright,
          officeAddress: input.extractedContent.contactInfo?.address || settings.footer.officeAddress,
          contactEmail: input.extractedContent.contactInfo?.email || settings.footer.contactEmail,
          contactPhone: input.extractedContent.contactInfo?.phone || settings.footer.contactPhone,
          socialLinks: settings.footer.socialLinks,
          columns: settings.footer.columns
        }
      }
    );

    const homeComp: PageComposition = {
      id: `comp_${siteId}_home_v1`,
      siteId,
      pageSlug: 'home',
      title: `${input.clientName} — Home`,
      layoutCollection: input.collectionId,
      sections: homeSections,
      version: 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now
    };

    await db.execute({
      sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, version, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        homeComp.id,
        homeComp.siteId,
        homeComp.pageSlug,
        homeComp.title,
        homeComp.layoutCollection,
        JSON.stringify(homeComp.sections),
        homeComp.version,
        homeComp.status,
        now,
        now
      ]
    });

    compositions.push(homeComp);

    return {
      websiteId: siteId,
      previewUrl: `/preview/${input.websiteSlug}`,
      compositions,
      gaps
    };
  }
}
