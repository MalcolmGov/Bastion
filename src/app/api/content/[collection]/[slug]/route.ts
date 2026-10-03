import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { verifyApiToken } from '@/lib/auth/apiToken';
import { apiTenantFilter } from '@/lib/auth/apiAccess';
import { previewRefusal, selectApiPages } from '@/lib/studio/publishedPages';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string; slug: string }> }
) {
  try {
    const { collection, slug } = await context.params;
    const { searchParams } = new URL(req.url);

    const auth = await verifyApiToken(req, searchParams.get('apiKey'), 'content:read');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const isPreview = searchParams.get('preview') === 'true';
    const refused = previewRefusal(auth, isPreview);
    if (refused) return refused;

    const effectiveClientId: string = auth.isAgencyAdmin
      ? (searchParams.get('clientId') || 'client_goldfields')
      : (auth.clientId || 'client_goldfields');
    const siteId = auth.siteId || searchParams.get('siteId') || (auth.isAgencyAdmin ? 'site_goldfields_flagship' : null);
    const db = getDb();
    const recordFilter = apiTenantFilter(auth, 'record', 'r');

    if (collection === 'pages') {
      const tenant = auth.isAgencyAdmin ? { ...auth, isAgencyAdmin: false, clientId: effectiveClientId } : auth;
      const pageRows = await selectApiPages(db, { access: tenant, siteId, slug, limit: 1, drafts: isPreview });

      if (pageRows.length === 0) {
        return NextResponse.json({ error: `Page '${slug}' not found` }, { status: 404 });
      }

      const row: any = pageRows[0];
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
      WHERE r.collection = ? AND r.slug = ? AND (r.client_id = ? OR (r.client_id IS NULL AND ? = 'client_goldfields'))${recordFilter.sql}
      LIMIT 1
    `;

    const res = await db.execute({
      sql,
      args: [isPreview ? 'true' : 'false', collection, slug, effectiveClientId, effectiveClientId, ...recordFilter.args],
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
