import type { Client as DbClient } from '@libsql/client';
import type { BlueprintId, DesignCollectionId, BrandKit, PageComposition, SectionInstance, ContentGapItem } from './types';
import type { WebsiteDesignSystem } from './designSystem';
import { BLUEPRINTS } from './blueprints';
import { createDesignSystem, normalizeDesignSystem, designSystemIssues, safeAssetUrl, sectionDesignStyles } from './designSystem';
export interface AssembleInput {
  clientId: string;
  clientName: string;
  websiteName: string;
  websiteSlug: string;
  blueprintId: BlueprintId;
  collectionId: DesignCollectionId;
  brandKit: Partial<BrandKit>;
  sourceUrl?: string;
  heroImage?: string;
  designReviewed?: boolean;
  designSystem?: WebsiteDesignSystem;
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


export class AssemblyError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export interface AssembleResult {
  websiteId: string;
  previewUrl: string;
  compositions: PageComposition[];
  gaps: ContentGapItem[];
}
export class WebsiteAssembler {
  static async assembleAndSave(input: AssembleInput, db: DbClient, actor?: { id: string; name: string }): Promise<AssembleResult> {
    if (!input || !actor) throw new AssemblyError('An authenticated agency author is required.');
    for (const key of ['clientId', 'clientName', 'websiteName', 'websiteSlug'] as const) {
      if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > 160) throw new AssemblyError(`A valid ${key} is required.`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.websiteSlug) || input.websiteSlug.length > 70) throw new AssemblyError('Use a lowercase website slug with letters, numbers and hyphens.');
    if (!/^[\w-]{1,100}$/.test(input.clientId)) throw new AssemblyError('Invalid client identifier.');
    if (!Object.hasOwn(BLUEPRINTS, input.blueprintId) || !['contemporary', 'editorial', 'immersive'].includes(input.collectionId)) throw new AssemblyError('Choose a supported blueprint and design direction.');
    if (input.designReviewed !== true) throw new AssemblyError('Review the design tokens and source content before creating the website.');
    if (!input.extractedContent || typeof input.extractedContent !== 'object' || JSON.stringify(input).length > 250000) throw new AssemblyError('Provide a website brief within the 250 KB limit.');
    const content = input.extractedContent;
    for (const key of ['services', 'stats', 'teamMembers', 'caseStudies'] as const) {
      if (content[key] !== undefined && (!Array.isArray(content[key]) || content[key]!.length > 40)) throw new AssemblyError(`Invalid ${key} collection.`);
    }
    if (content.services?.some(s => typeof s?.title !== 'string' || typeof s.description !== 'string')) throw new AssemblyError('Each service needs a title and description.');
    if (content.businessSummary && typeof content.businessSummary !== 'string') throw new AssemblyError('Business summary must be text.');
    for (const key of ['tagline', 'businessSummary'] as const) {
      if (content[key] !== undefined && (typeof content[key] !== 'string' || content[key]!.length > 10000)) throw new AssemblyError(`Invalid ${key}.`);
    }
    if (content.contactInfo && (typeof content.contactInfo !== 'object' || Object.values(content.contactInfo).some(v => typeof v !== 'string' || v.length > 1000))) throw new AssemblyError('Invalid contact information.');
    if (content.socialLinks && (!Array.isArray(content.socialLinks) || content.socialLinks.length > 20 || content.socialLinks.some(s => typeof s?.url !== 'string' || typeof s.platform !== 'string'))) throw new AssemblyError('Invalid social links.');
    if (content.stats?.some(s => typeof s?.value !== 'string' || typeof s.label !== 'string')) throw new AssemblyError('Invalid statistics.');
    if (content.teamMembers?.some(m => typeof m?.name !== 'string' || typeof m.role !== 'string')) throw new AssemblyError('Invalid team member.');
    if (content.caseStudies?.some(c => typeof c?.headline !== 'string' || typeof c.client !== 'string' || typeof c.outcome !== 'string')) throw new AssemblyError('Invalid case study.');
    const system = input.designSystem ? normalizeDesignSystem(input.designSystem) : createDesignSystem(input.brandKit, undefined, input.sourceUrl);
    const issues = designSystemIssues(system);
    if (issues.length) throw new AssemblyError(issues.join(' '));
    const now = new Date().toISOString();
    const siteId = `site_${input.websiteSlug.replace(/-/g, '_')}`;
    const link = (slug: string) => `/sites/${input.websiteSlug}${slug === 'home' ? '' : '/' + slug}`;
    const pages = [{ slug: 'home', title: 'Home' }, { slug: 'about', title: 'About' }, { slug: 'services', title: 'Services' }, { slug: 'contact', title: 'Contact' }];
    const mainNav = pages.map(p => ({ label: p.title, href: link(p.slug) }));
    const gaps: ContentGapItem[] = [];
    const gap = (pageSlug: string, field: string, message: string) => gaps.push({ id: `gap_${pageSlug}_${field}`, pageSlug, field, message, severity: 'warning', suggestedAction: 'Complete and verify this content in the visual editor before submitting it for review.' });
    if (!content.businessSummary) gap('about', 'summary', 'Company introduction is missing. An editorial placeholder is included.');
    if (!content.services?.length) gap('services', 'services', 'No service descriptions were provided. Add the client’s real capabilities.');
    if (!content.contactInfo?.email && !content.contactInfo?.phone) gap('contact', 'contact', 'No contact details were provided. No email address or phone number has been invented.');
    if (!system.logoUrl) gap('home', 'logo', 'No approved logo selected. The website uses the client name.');
    if (!safeAssetUrl(input.heroImage)) gap('home', 'imagery', 'No source image selected. Review imagery and usage rights before publication.');
    gap('contact', 'legal', 'Add client-specific privacy and legal policy links before publication.');
    gap('home', 'source_review', 'Extracted copy and assets are source candidates, not independently verified facts. Review claims, image rights and font licences.');
    const settings = { designSystem: system, sourceUrl: system.sourceUrl, contentGaps: gaps,
      enabledModules: { publicAssistant: false }, navigation: { mainNav, allNav: mainNav, primaryCta: { label: 'Contact us', href: link('contact') } } };
    const compositions = pages.map(({ slug, title }) => {
      let count = 0;
      const section = (componentId: string, variant: string, props: Record<string, unknown>, surface = false): SectionInstance => ({
        id: `sec_${siteId}_${slug}_${++count}`, componentId, variant, visible: true, props,
        styles: sectionDesignStyles(system, surface),
      });
      const heroTitle = slug === 'home' ? content.tagline || input.brandKit.voiceAndMessaging?.tagline || input.clientName : slug === 'about' ? `About ${input.clientName}` : slug === 'services' ? 'Our capabilities' : 'Start a conversation';
      const heroSubtitle = slug === 'contact' ? [content.contactInfo?.email, content.contactInfo?.phone, content.contactInfo?.address].filter(Boolean).join(' · ') || 'Contact information awaiting editorial review.' : content.businessSummary || 'Company introduction awaiting editorial review.';
      const sections: SectionInstance[] = [
        section('header', 'standard_glass', { brandName: input.clientName, logoUrl: system.logoUrl || undefined, links: mainNav, allLinks: mainNav, ctaText: 'Contact us', ctaHref: link('contact') }),
        section('hero', input.collectionId === 'immersive' ? 'immersive_full' : input.collectionId === 'editorial' ? 'editorial_split' : 'contemporary_bold', {
          badge: slug === 'home' ? input.websiteName : title, title: heroTitle, subtitle: heroSubtitle,
          bgImage: slug === 'home' ? safeAssetUrl(input.heroImage) || undefined : undefined,
          primaryCta: { label: slug === 'contact' ? 'Explore our services' : 'Explore our capabilities', href: link('services') },
          secondaryCta: { label: 'About us', href: link('about') }, stats: slug === 'home' ? content.stats || [] : [],
        }),
      ];
      if (slug === 'home' || slug === 'services') sections.push(section('services_grid', 'cards_3col', {
        eyebrow: 'Expertise', title: 'Built around your needs', description: content.services?.length ? 'Explore our services and capabilities.' : 'Add approved service descriptions in the visual editor.',
        services: (content.services || []).map(s => ({ title: s.title, description: s.description, metrics: s.metrics, href: link('contact') })),
      }, true));
      if (slug === 'about' && content.teamMembers?.length) sections.push(section('team', 'leadership_grid', { title: 'Our team', members: content.teamMembers.map(m => ({ ...m, image: safeAssetUrl(m.image) || undefined })) }, true));
      if (slug === 'home' && content.caseStudies?.length) sections.push(section('case_studies', 'impact_cards', { title: 'Selected work', eyebrow: 'Experience', caseStudies: content.caseStudies }, true));
      if (slug !== 'contact') sections.push(section('cta', 'split_card', { eyebrow: 'Let’s connect', title: `Talk to ${input.clientName}`, description: 'Get in touch to discuss your requirements.', ctaText: 'Contact us', ctaHref: link('contact') }, true));
      else if (content.contactInfo?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contactInfo.email)) sections.push(section('cta', 'split_card', { title: 'Speak with our team', description: content.contactInfo.address || '', ctaText: 'Email our team', ctaHref: `mailto:${content.contactInfo.email}` }, true));
      sections.push(section('footer', 'multi_column', { brandName: input.clientName, logoUrl: system.logoUrl || undefined,
        copyright: `© ${new Date().getFullYear()} ${input.clientName}.`, tagline: content.tagline || '',
        officeAddress: content.contactInfo?.address || '', contactEmail: content.contactInfo?.email || '', contactPhone: content.contactInfo?.phone || '',
        socialLinks: (content.socialLinks || []).filter(s => safeAssetUrl(s.url)), columns: [{ title: 'Explore', links: pages.map(p => ({ label: p.title, url: link(p.slug) })) }],
      }));
      return { id: `comp_${siteId}_${slug}_v1`, siteId, pageSlug: slug, title: `${input.clientName} — ${title}`, layoutCollection: input.collectionId,
        sections, version: 1, status: 'draft' as const, createdAt: now, updatedAt: now };
    });
    const tx = await db.transaction('write');
    try {
      const existing = await tx.execute({ sql: 'SELECT id FROM websites WHERE id=? OR slug=? LIMIT 1', args: [siteId, input.websiteSlug] });
      if (existing.rows.length) throw new AssemblyError('This website already exists. Open it in the visual editor or choose a different slug; creation never replaces an existing website.', 409);
      const client = await tx.execute({ sql: 'SELECT name FROM clients WHERE id=?', args: [input.clientId] });
      if (client.rows.length && String(client.rows[0].name) !== input.clientName) throw new AssemblyError('The selected client name does not match its tenant record. Refresh the client selector.', 409);
      if (!client.rows.length) await tx.execute({ sql: 'INSERT INTO clients (id,name,slug,industry,created_at,updated_at) VALUES (?,?,?,?,?,?)', args: [input.clientId, input.clientName, input.websiteSlug, input.blueprintId, now, now] });
      await tx.execute({ sql: 'INSERT INTO websites (id,client_id,name,slug,blueprint_id,design_collection_id,status,settings_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', args: [siteId, input.clientId, input.websiteName, input.websiteSlug, input.blueprintId, input.collectionId, 'draft', JSON.stringify(settings), now, now] });
      const colors = Object.fromEntries(Object.entries(system.colors).map(([role, value]) => [role, { name: role, value, status: 'approved', evidence: system.evidence[role] || 'Reviewed agency design proposal' }]));
      await tx.execute({ sql: 'INSERT INTO brand_kits (id,site_id,version,status,logos_json,colors_json,typography_json,component_rules_json,voice_and_messaging_json,locked_attributes_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', args: [
        `brand_${siteId}_v1`, siteId, 1, 'approved', JSON.stringify({ primary: { url: system.logoUrl, status: system.logoUrl ? 'approved' : 'missing' } }), JSON.stringify(colors), JSON.stringify({ ...system.typography, status: 'approved' }),
        JSON.stringify({ radius: system.radius, buttonStyle: 'solid', shadows: 'subtle', imageryDirection: 'Reviewed client photography' }),
        JSON.stringify(input.brandKit.voiceAndMessaging || { toneOfVoice: 'Clear and professional', approvedFacts: [] }), '[]', now, now,
      ] });
      for (const comp of compositions) {
        const sections = JSON.stringify(comp.sections);
        await tx.execute({ sql: 'INSERT INTO page_compositions (id,site_id,page_slug,title,layout_collection,sections_json,version,status,created_at,updated_at) VALUES (?,?,?,?,?,?,1,\'draft\',?,?)', args: [comp.id, siteId, comp.pageSlug, comp.title, input.collectionId, sections, now, now] });
        await tx.execute({ sql: 'INSERT INTO page_versions (id,composition_id,site_id,page_slug,version,title,layout_collection,sections_json,status,created_by,created_by_name,change_summary,created_at) VALUES (?,?,?,?,1,?,?,?,\'draft\',?,?,?,?)', args: [`${comp.id}_history_1`, comp.id, siteId, comp.pageSlug, comp.title, input.collectionId, sections, actor.id, actor.name, 'Agency website creation from reviewed design tokens', now] });
      }
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
    return { websiteId: siteId, previewUrl: `/admin/editor?siteId=${siteId}&pageSlug=home`, compositions, gaps };
  }
}
