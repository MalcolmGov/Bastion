import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { verifyApiToken } from '@/lib/auth/apiToken';
import { apiTenantFilter } from '@/lib/auth/apiAccess';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const { collection } = await context.params;
    const { searchParams } = new URL(req.url);

    const auth = await verifyApiToken(req, searchParams.get('apiKey'), 'content:read');
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const isPreview = searchParams.get('preview') === 'true';

    const effectiveClientId = auth.isAgencyAdmin
      ? (searchParams.get('clientId') || 'client_goldfields')
      : auth.clientId;
    const siteId = auth.siteId || searchParams.get('siteId') || (auth.isAgencyAdmin ? 'site_goldfields_flagship' : null);
    const slug = searchParams.get('slug');
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const db = getDb();
    const recordFilter = apiTenantFilter(auth, 'record', 'r');

    // SPECIAL CASE: 'pages' collection maps to page_compositions
    if (collection === 'pages') {
      const filter = apiTenantFilter(auth.isAgencyAdmin ? { ...auth, isAgencyAdmin: false, clientId: effectiveClientId } : auth, 'page');
      let pageSql = `SELECT * FROM page_compositions WHERE 1 = 1${filter.sql}`;
      const pageArgs: any[] = [...filter.args];
      if (siteId) {
        pageSql += ' AND site_id = ?';
        pageArgs.push(siteId);
      }

      if (slug) {
        pageSql += ` AND page_slug = ?`;
        pageArgs.push(slug);
      }

      if (!isPreview) {
        pageSql += ` AND status = 'published'`;
      }

      pageSql += ` ORDER BY page_slug ASC LIMIT ? OFFSET ?`;
      pageArgs.push(limit, offset);

      const pageRes = await db.execute({ sql: pageSql, args: pageArgs });
      const pages = pageRes.rows.map((row: any) => ({
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
      }));

      return NextResponse.json({
        collection: 'pages',
        count: pages.length,
        items: slug && pages.length > 0 ? pages[0] : pages,
      });
    }

    // STANDARD COLLECTIONS: operations, reports, news, sustainability, jobs, suppliers
    let sql = `
      SELECT r.id, r.collection, r.slug, r.title, r.status, r.created_at, r.updated_at,
             rev.revision_number, rev.data_json
      FROM content_records r
      JOIN revisions rev ON (
        CASE 
          WHEN ? = 'true' THEN r.current_draft_revision_id = rev.id
          ELSE r.current_published_revision_id = rev.id
        END
      )
      WHERE r.collection = ? AND (r.client_id = ? OR (r.client_id IS NULL AND ? = 'client_goldfields'))${recordFilter.sql}
    `;
    const args: any[] = [isPreview ? 'true' : 'false', collection, effectiveClientId, effectiveClientId, ...recordFilter.args];

    if (!isPreview) {
      sql += ` AND r.status = 'published'`;
    }

    if (slug) {
      sql += ` AND r.slug = ?`;
      args.push(slug);
    }

    if (search) {
      sql += ` AND (LOWER(r.title) LIKE ? OR LOWER(r.slug) LIKE ?)`;
      args.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ` ORDER BY r.updated_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const res = await db.execute({ sql, args });

    const items = res.rows.map((row: any) => {
      let parsedData = {};
      try {
        parsedData = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
      } catch (e) {
        parsedData = {};
      }

      return {
        id: String(row.id),
        collection: String(row.collection),
        slug: String(row.slug),
        title: String(row.title),
        status: String(row.status),
        revision: Number(row.revision_number),
        updatedAt: String(row.updated_at),
        createdAt: String(row.created_at),
        ...parsedData,
      };
    });

    // If specific slug was requested, return object directly
    if (slug && items.length > 0) {
      return NextResponse.json({
        collection,
        item: items[0],
      });
    }

    return NextResponse.json({
      collection,
      count: items.length,
      limit,
      offset,
      items,
    });
  } catch (err: any) {
    console.error('Headless API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
