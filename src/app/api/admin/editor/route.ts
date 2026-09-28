import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'site_apex_strategy';
    const pageSlug = searchParams.get('pageSlug') || 'home';
    const db = getDb();

    // Fetch site
    const siteRes = await db.execute({
      sql: `SELECT * FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, siteId]
    });
    if (siteRes.rows.length === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    const site = siteRes.rows[0];

    // Fetch Brand Kit
    const brandRes = await db.execute({
      sql: `SELECT * FROM brand_kits WHERE site_id = ? ORDER BY version DESC LIMIT 1`,
      args: [site.id]
    });
    const bRow = brandRes.rows[0] || {};
    const brandKit = {
      id: bRow.id,
      logos: typeof bRow.logos_json === 'string' ? JSON.parse(bRow.logos_json) : (bRow.logos_json || {}),
      colors: typeof bRow.colors_json === 'string' ? JSON.parse(bRow.colors_json) : (bRow.colors_json || {}),
      typography: typeof bRow.typography_json === 'string' ? JSON.parse(bRow.typography_json) : (bRow.typography_json || {}),
      componentRules: typeof bRow.component_rules_json === 'string' ? JSON.parse(bRow.component_rules_json) : (bRow.component_rules_json || {}),
      voiceAndMessaging: typeof bRow.voice_and_messaging_json === 'string' ? JSON.parse(bRow.voice_and_messaging_json) : (bRow.voice_and_messaging_json || {}),
      lockedAttributes: typeof bRow.locked_attributes_json === 'string' ? JSON.parse(bRow.locked_attributes_json) : (bRow.locked_attributes_json || [])
    };

    // Fetch Compositions for site
    const compsRes = await db.execute({
      sql: `SELECT * FROM page_compositions WHERE site_id = ?`,
      args: [site.id]
    });

    const compositions = compsRes.rows.map((c: any) => ({
      id: String(c.id),
      siteId: String(c.site_id),
      pageSlug: String(c.page_slug),
      title: String(c.title),
      layoutCollection: c.layout_collection,
      sections: typeof c.sections_json === 'string' ? JSON.parse(c.sections_json) : (c.sections_json || []),
      version: Number(c.version),
      status: String(c.status)
    }));

    return NextResponse.json({
      site: {
        id: String(site.id),
        name: String(site.name),
        slug: String(site.slug),
        blueprintId: String(site.blueprint_id),
        designCollectionId: String(site.design_collection_id),
        status: String(site.status)
      },
      brandKit,
      compositions
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteId, pageSlug = 'home', sections, title, status = 'draft' } = body;
    const db = getDb();
    const now = new Date().toISOString();

    const compId = `comp_${siteId}_${pageSlug}_v1`;

    await db.execute({
      sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, version, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        compId,
        siteId,
        pageSlug,
        title || 'Page',
        'contemporary',
        JSON.stringify(sections),
        1,
        status,
        now,
        now
      ]
    });

    // Record audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'usr_admin',
        'Agency Administrator',
        'page_composition_save',
        'page_compositions',
        compId,
        'success',
        now
      ]
    });

    return NextResponse.json({ success: true, compositionId: compId, savedAt: now });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
