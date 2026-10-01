import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { assertSiteAccess, requirePermission, requireUser } from '@/lib/auth/guard';

/**
 * Page Composition Version History API
 * Returns the immutable list of historical revisions for a page.
 */
export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const permGate = await requirePermission('content:read');
    if (!permGate.ok) return permGate.response;

    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');
    const pageSlug = searchParams.get('pageSlug') || 'home';

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const siteGate = await assertSiteAccess(gate.user, siteId);
    if (!siteGate.ok) return siteGate.response;

    const db = getDb();
    const res = await db.execute({
      sql: `SELECT id, version, title, layout_collection, sections_json, meta_json, status, created_by, created_by_name, change_summary, created_at
            FROM page_versions
            WHERE site_id = ? AND page_slug = ?
            ORDER BY version DESC
            LIMIT 50`,
      args: [siteId, pageSlug],
    });

    const versions = res.rows.map((row: any) => {
      let sectionCount = 0;
      try {
        const parsed = typeof row.sections_json === 'string' ? JSON.parse(row.sections_json) : row.sections_json;
        sectionCount = Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        sectionCount = 0;
      }

      return {
        id: String(row.id),
        version: Number(row.version),
        title: String(row.title),
        layoutCollection: String(row.layout_collection || 'contemporary'),
        status: String(row.status),
        createdBy: row.created_by ? String(row.created_by) : null,
        createdByName: row.created_by_name ? String(row.created_by_name) : 'Author',
        changeSummary: row.change_summary ? String(row.change_summary) : null,
        sectionCount,
        createdAt: String(row.created_at),
      };
    });

    return NextResponse.json({
      siteId,
      pageSlug,
      totalVersions: versions.length,
      versions,
    });
  } catch (err: any) {
    console.error('Version history error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
