import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string; slug: string }> }
) {
  try {
    const { collection, slug } = await context.params;
    const { searchParams } = new URL(req.url);

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : searchParams.get('apiKey');
    const validToken = process.env.API_SECRET_TOKEN || 'sec_goldfields_bastion_2026_live';
    const isPreview = searchParams.get('preview') === 'true';

    if (token && token !== validToken && !token.startsWith('prev_')) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid Bearer token' },
        { status: 401 }
      );
    }

    const siteId = searchParams.get('siteId') || 'site_goldfields_flagship';
    const db = getDb();

    if (collection === 'pages') {
      const pageRes = await db.execute({
        sql: `SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1`,
        args: [siteId, slug],
      });

      if (pageRes.rows.length === 0) {
        return NextResponse.json({ error: `Page '${slug}' not found` }, { status: 404 });
      }

      const row: any = pageRes.rows[0];
      return NextResponse.json({
        id: String(row.id),
        siteId: String(row.site_id),
        slug: String(row.page_slug),
        title: String(row.title),
        layoutCollection: String(row.layout_collection),
        version: Number(row.version),
        status: String(row.status),
        sections: typeof row.sections_json === 'string' ? JSON.parse(row.sections_json) : (row.sections_json || []),
        meta: row.meta_json ? (typeof row.meta_json === 'string' ? JSON.parse(row.meta_json) : row.meta_json) : null,
        updatedAt: String(row.updated_at),
      });
    }

    const sql = `
      SELECT r.id, r.collection, r.slug, r.title, r.status, r.created_at, r.updated_at,
             rev.revision_number, rev.data_json
      FROM content_records r
      JOIN revisions rev ON (
        CASE 
          WHEN ? = 'true' THEN r.current_draft_revision_id = rev.id
          ELSE r.current_published_revision_id = rev.id
        END
      )
      WHERE r.collection = ? AND r.slug = ?
      LIMIT 1
    `;

    const res = await db.execute({
      sql,
      args: [isPreview ? 'true' : 'false', collection, slug],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: `Record '${slug}' not found in '${collection}'` }, { status: 404 });
    }

    const row: any = res.rows[0];
    let parsedData = {};
    try {
      parsedData = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
    } catch (e) {
      parsedData = {};
    }

    return NextResponse.json({
      id: String(row.id),
      collection: String(row.collection),
      slug: String(row.slug),
      title: String(row.title),
      status: String(row.status),
      revision: Number(row.revision_number),
      updatedAt: String(row.updated_at),
      createdAt: String(row.created_at),
      ...parsedData,
    });
  } catch (err: any) {
    console.error('Headless single item API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
