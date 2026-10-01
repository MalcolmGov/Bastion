import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteId = 'site_goldfields_flagship',
      theme,
      voice,
      fontAnalysis,
      mediaAssets
    } = body;

    if (!theme) {
      return NextResponse.json({ error: 'Theme definition is required.' }, { status: 400 });
    }

    const db = getDb();
    const id = `brand_kit_${Date.now()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `
        INSERT INTO brand_kits (
          id, site_id, version, status, logos_json, colors_json, typography_json, component_rules_json, voice_and_messaging_json, locked_attributes_json, created_at, updated_at
        ) VALUES (?, ?, 1, 'approved', ?, ?, ?, ?, ?, '[]', ?, ?)
      `,
      args: [
        id,
        siteId,
        JSON.stringify(theme.logo || {}),
        JSON.stringify(theme.color || {}),
        JSON.stringify(theme.font || {}),
        JSON.stringify({ radius: theme.radius, space: theme.space }),
        JSON.stringify(theme.voice || voice || {}),
        now,
        now
      ]
    });

    return NextResponse.json({
      success: true,
      brandKitId: id,
      message: 'Brand kit successfully approved and applied to client templates.'
    });
  } catch (err: any) {
    console.error('[BrandApproveAPI] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
