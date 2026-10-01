import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { assertSiteAccess, requirePermission, requireUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const permGate = await requirePermission('content:read');
    if (!permGate.ok) return permGate.response;

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'site_apex_strategy';
    const siteGate = await assertSiteAccess(gate.user, siteId);
    if (!siteGate.ok) return siteGate.response;
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
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const { siteId, pageSlug = 'home', sections, title, layoutCollection = 'contemporary', meta, status = 'draft', changeSummary } = body;
    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const siteGate = await assertSiteAccess(gate.user, siteId);
    if (!siteGate.ok) return siteGate.response;

    if (status === 'published') {
      const pubGate = await requirePermission('content:publish');
      if (!pubGate.ok) {
        return NextResponse.json({ error: 'Forbidden: only a publisher can publish a page composition.' }, { status: 403 });
      }
    } else {
      const editGate = await requirePermission('content:edit');
      if (!editGate.ok) {
        return NextResponse.json({ error: 'Forbidden: content:edit permission required.' }, { status: 403 });
      }
    }

    const db = getDb();
    const now = new Date().toISOString();

    // Query existing composition and calculate next version number
    const existingRes = await db.execute({
      sql: `SELECT id, version FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1`,
      args: [siteId, pageSlug]
    });

    const currentVersion = existingRes.rows.length > 0 ? Number(existingRes.rows[0].version || 1) : 0;
    const newVersion = currentVersion + 1;
    const compId = existingRes.rows.length > 0 ? String(existingRes.rows[0].id) : `comp_${siteId}_${pageSlug}`;

    await db.execute({
      sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        compId,
        siteId,
        pageSlug,
        title || 'Page',
        layoutCollection,
        JSON.stringify(sections || []),
        meta ? JSON.stringify(meta) : null,
        newVersion,
        status,
        now,
        now
      ]
    });

    // Record immutable historical version snapshot
    const versionId = `pver_${siteId}_${pageSlug}_v${newVersion}`;
    await db.execute({
      sql: `INSERT INTO page_versions (id, composition_id, site_id, page_slug, version, title, layout_collection, sections_json, meta_json, status, created_by, created_by_name, change_summary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        versionId,
        compId,
        siteId,
        pageSlug,
        newVersion,
        title || 'Page',
        layoutCollection,
        JSON.stringify(sections || []),
        meta ? JSON.stringify(meta) : null,
        status,
        gate.user.id,
        gate.user.name,
        changeSummary || (status === 'published' ? `Published version ${newVersion}` : `Draft snapshot v${newVersion}`),
        now
      ]
    });

    // Record audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        gate.user.id,
        gate.user.name,
        'page_composition_save',
        'page_compositions',
        compId,
        'success',
        now
      ]
    });

    if (status === 'published') {
      try {
        const { dispatchContentWebhook } = await import('@/lib/webhooks/dispatcher');
        dispatchContentWebhook({
          event: 'page.published',
          collection: 'pages',
          id: compId,
          slug: pageSlug,
          title: title || 'Page',
          siteId,
          timestamp: now
        }).catch(err => console.error('[Webhook Page Error]:', err));
      } catch (webhookErr) {
        console.warn('[Webhook Page Warning]:', webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      compositionId: compId,
      version: newVersion,
      savedAt: now
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
