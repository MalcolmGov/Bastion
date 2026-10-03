import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import {
  saveComposition,
  EditorSaveError,
} from '@/lib/studio/editor/saveComposition';
import { revalidatePath } from 'next/cache';
import {
  assertSiteAccess,
  requirePermission,
  requireUser,
} from '@/lib/auth/guard';

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
      args: [siteId, siteId],
    });
    if (siteRes.rows.length === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    const site = siteRes.rows[0];

    // Fetch Brand Kit
    const brandRes = await db.execute({
      sql: `SELECT * FROM brand_kits WHERE site_id = ? ORDER BY version DESC LIMIT 1`,
      args: [site.id],
    });
    const bRow = brandRes.rows[0] || {};
    const brandKit = {
      id: bRow.id,
      logos:
        typeof bRow.logos_json === 'string'
          ? JSON.parse(bRow.logos_json)
          : bRow.logos_json || {},
      colors:
        typeof bRow.colors_json === 'string'
          ? JSON.parse(bRow.colors_json)
          : bRow.colors_json || {},
      typography:
        typeof bRow.typography_json === 'string'
          ? JSON.parse(bRow.typography_json)
          : bRow.typography_json || {},
      componentRules:
        typeof bRow.component_rules_json === 'string'
          ? JSON.parse(bRow.component_rules_json)
          : bRow.component_rules_json || {},
      voiceAndMessaging:
        typeof bRow.voice_and_messaging_json === 'string'
          ? JSON.parse(bRow.voice_and_messaging_json)
          : bRow.voice_and_messaging_json || {},
      lockedAttributes:
        typeof bRow.locked_attributes_json === 'string'
          ? JSON.parse(bRow.locked_attributes_json)
          : bRow.locked_attributes_json || [],
    };

    // Fetch Compositions for site
    const compsRes = await db.execute({
      sql: `SELECT * FROM page_compositions WHERE site_id = ?`,
      args: [site.id],
    });

    const compositions = compsRes.rows.map((c: any) => ({
      id: String(c.id),
      siteId: String(c.site_id),
      pageSlug: String(c.page_slug),
      title: String(c.title),
      layoutCollection: c.layout_collection,
      sections:
        typeof c.sections_json === 'string'
          ? JSON.parse(c.sections_json)
          : c.sections_json || [],
      version: Number(c.version),
      meta: c.meta_json ? JSON.parse(String(c.meta_json)) : null,
      status: String(c.status),
    }));

    return NextResponse.json({
      site: {
        id: String(site.id),
        name: String(site.name),
        clientId: String(site.client_id),
        slug: String(site.slug),
        blueprintId: String(site.blueprint_id),
        designCollectionId: String(site.design_collection_id),
        status: String(site.status),
      },
      brandKit,
      compositions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  try {
    const body = await req.json();
    const result = await saveComposition(gate.user, body);
    if (body.status === 'published') {
      revalidatePath(`/sites/${result.siteSlug}`);
      revalidatePath(`/sites/${result.siteSlug}/${body.pageSlug}`);
      try {
        const { dispatchContentWebhook } =
          await import('@/lib/webhooks/dispatcher');
        void dispatchContentWebhook({
          event: 'page.published',
          collection: 'pages',
          id: result.compositionId,
          slug: body.pageSlug,
          title: result.title,
          siteId: result.siteId,
          timestamp: result.savedAt,
        }).catch((error) => console.error('[Editor webhook]', error));
      } catch (error) {
        console.error('[Editor webhook]', error);
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EditorSaveError)
      return NextResponse.json(
        { error: error.message, ...(error.code ? { code: error.code } : {}) },
        { status: error.status },
      );
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { error: 'Invalid page data.' },
        { status: 400 },
      );
    console.error('[Editor save]', error);
    return NextResponse.json(
      {
        error:
          'The page could not be saved. Your edits are still here. Please try again.',
      },
      { status: 500 },
    );
  }
}
