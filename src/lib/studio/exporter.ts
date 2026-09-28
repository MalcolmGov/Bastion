/**
 * Move Studio — Project Package Exporter & Importer
 * Bundles approved brand kit, design tokens, compositions, and an Antigravity AI implementation brief
 * into a portable, schema-validated project manifest.
 */

import type { Client as DbClient } from '@libsql/client';
import type { Website, BrandKit, PageComposition, ContentGapItem } from './types';

export interface MoveStudioProjectPackage {
  schemaVersion: '1.0.0';
  generator: 'Move Studio Enterprise Platform';
  exportedAt: string;
  website: {
    name: string;
    slug: string;
    blueprintId: string;
    designCollectionId: string;
    primaryDomain?: string;
    settings: any;
  };
  brandKit: Partial<BrandKit>;
  pageCompositions: PageComposition[];
  sitemap: Array<{ path: string; title: string; lastModified: string }>;
  redirectMap: Record<string, string>;
  outstandingContentGaps: ContentGapItem[];
  antigravityImplementationBrief: string;
}

export class ProjectPackageService {
  static async exportPackage(siteId: string, db: DbClient): Promise<MoveStudioProjectPackage> {
    // 1. Fetch site
    const siteRes = await db.execute({
      sql: `SELECT * FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, siteId]
    });
    if (siteRes.rows.length === 0) {
      throw new Error(`Website not found: ${siteId}`);
    }
    const site = siteRes.rows[0];
    const settings = typeof site.settings_json === 'string' ? JSON.parse(site.settings_json) : (site.settings_json || {});

    // 2. Fetch Brand Kit
    const brandRes = await db.execute({
      sql: `SELECT * FROM brand_kits WHERE site_id = ? ORDER BY version DESC LIMIT 1`,
      args: [site.id]
    });
    let brandKit: any = {};
    if (brandRes.rows.length > 0) {
      const bRow = brandRes.rows[0];
      brandKit = {
        logos: typeof bRow.logos_json === 'string' ? JSON.parse(bRow.logos_json) : bRow.logos_json,
        colors: typeof bRow.colors_json === 'string' ? JSON.parse(bRow.colors_json) : bRow.colors_json,
        typography: typeof bRow.typography_json === 'string' ? JSON.parse(bRow.typography_json) : bRow.typography_json,
        componentRules: typeof bRow.component_rules_json === 'string' ? JSON.parse(bRow.component_rules_json) : bRow.component_rules_json,
        voiceAndMessaging: typeof bRow.voice_and_messaging_json === 'string' ? JSON.parse(bRow.voice_and_messaging_json) : bRow.voice_and_messaging_json,
        lockedAttributes: typeof bRow.locked_attributes_json === 'string' ? JSON.parse(bRow.locked_attributes_json) : bRow.locked_attributes_json
      };
    }

    // 3. Fetch Compositions
    const compRes = await db.execute({
      sql: `SELECT * FROM page_compositions WHERE site_id = ?`,
      args: [site.id]
    });
    const compositions: PageComposition[] = compRes.rows.map((r: any) => ({
      id: String(r.id),
      siteId: String(r.site_id),
      pageSlug: String(r.page_slug),
      title: String(r.title),
      layoutCollection: r.layout_collection as any,
      sections: typeof r.sections_json === 'string' ? JSON.parse(r.sections_json) : r.sections_json,
      version: Number(r.version),
      status: r.status as any,
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at)
    }));

    // 4. Build Sitemap
    const sitemap = compositions.map(c => ({
      path: c.pageSlug === 'home' ? '/' : `/${c.pageSlug}`,
      title: c.title,
      lastModified: c.updatedAt
    }));

    // 5. Generate Antigravity Implementation Brief
    const promptBrief = `# Move Studio Implementation Brief: ${site.name}

## Project Overview
- **Client & Website:** ${site.name} (\`${site.slug}\`)
- **Selected Blueprint:** \`${site.blueprintId}\`
- **Design Collection:** \`${site.designCollectionId}\`
- **Primary Domain:** ${site.primary_domain || 'N/A'}
- **Brand Tone of Voice:** "${brandKit.voiceAndMessaging?.toneOfVoice || 'Authoritative and clear'}"

## Approved Brand Tokens
- **Primary Color:** ${brandKit.colors?.primary?.value || '#0F172A'} (${brandKit.colors?.primary?.name || 'Primary'})
- **Accent Color:** ${brandKit.colors?.accent?.value || '#0284C7'} (${brandKit.colors?.accent?.name || 'Accent'})
- **Canvas Background:** ${brandKit.colors?.background?.value || '#F8FAFC'}
- **Display Heading Font:** ${brandKit.typography?.headingFont || 'Plus Jakarta Sans'}
- **Body Font:** ${brandKit.typography?.bodyFont || 'Inter'}
- **Corner Radius:** ${brandKit.componentRules?.radius || 'md'}
- **Button Styling:** ${brandKit.componentRules?.buttonStyle || 'solid'}

## Composed Page Tree
${compositions.map(c => `- **/${c.pageSlug}** (${c.title}): ${c.sections.length} active sections [${c.sections.map(s => s.componentId).join(' -> ')}]`).join('\n')}

## Autonomous Coding Instructions
1. Render these composed sections using the Move Studio Reusable Component Registry.
2. Maintain strict brand token compliance and WCAG 2.2 AA contrast standards.
3. Do not modify locked attributes: [${(brandKit.lockedAttributes || []).join(', ')}].
`;

    return {
      schemaVersion: '1.0.0',
      generator: 'Move Studio Enterprise Platform',
      exportedAt: new Date().toISOString(),
      website: {
        name: String(site.name),
        slug: String(site.slug),
        blueprintId: String(site.blueprintId),
        designCollectionId: String(site.design_collection_id),
        primaryDomain: site.primary_domain ? String(site.primary_domain) : undefined,
        settings
      },
      brandKit,
      pageCompositions: compositions,
      sitemap,
      redirectMap: {},
      outstandingContentGaps: [],
      antigravityImplementationBrief: promptBrief
    };
  }

  static async importPackage(pkg: MoveStudioProjectPackage, db: DbClient): Promise<{ siteId: string; slug: string }> {
    if (pkg.schemaVersion !== '1.0.0') {
      throw new Error(`Unsupported package schema version: ${pkg.schemaVersion}`);
    }

    const now = new Date().toISOString();
    const siteSlug = pkg.website.slug;
    const clientId = `client_${siteSlug.replace(/[^a-z0-9]/gi, '_')}`;
    const siteId = `site_${siteSlug.replace(/[^a-z0-9]/gi, '_')}`;

    // Insert or update Client
    await db.execute({
      sql: `INSERT OR REPLACE INTO clients (id, name, slug, industry, logo_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [clientId, pkg.website.name, siteSlug, 'general', pkg.brandKit.logos?.primary?.url || null, now, now]
    });

    // Insert Website
    await db.execute({
      sql: `INSERT OR REPLACE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        siteId,
        clientId,
        pkg.website.name,
        siteSlug,
        pkg.website.blueprintId,
        pkg.website.designCollectionId,
        'draft',
        pkg.website.primaryDomain || null,
        JSON.stringify(pkg.website.settings),
        now,
        now
      ]
    });

    // Insert Brand Kit
    const brandKitId = `brand_${siteId}_imported`;
    await db.execute({
      sql: `INSERT OR REPLACE INTO brand_kits (id, site_id, version, status, logos_json, colors_json, typography_json, component_rules_json, voice_and_messaging_json, locked_attributes_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        brandKitId,
        siteId,
        1,
        'approved',
        JSON.stringify(pkg.brandKit.logos || {}),
        JSON.stringify(pkg.brandKit.colors || {}),
        JSON.stringify(pkg.brandKit.typography || {}),
        JSON.stringify(pkg.brandKit.componentRules || {}),
        JSON.stringify(pkg.brandKit.voiceAndMessaging || {}),
        JSON.stringify(pkg.brandKit.lockedAttributes || []),
        now,
        now
      ]
    });

    // Insert Page Compositions
    for (const comp of pkg.pageCompositions) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, version, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          comp.id || `comp_${siteId}_${comp.pageSlug}`,
          siteId,
          comp.pageSlug,
          comp.title,
          comp.layoutCollection,
          JSON.stringify(comp.sections),
          comp.version || 1,
          comp.status || 'draft',
          now,
          now
        ]
      });
    }

    return { siteId, slug: siteSlug };
  }
}
