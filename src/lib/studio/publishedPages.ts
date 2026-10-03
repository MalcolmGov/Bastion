import { NextResponse } from 'next/server';
import type { Client } from '@libsql/client';
import { apiTenantFilter, type ApiAccess } from '@/lib/auth/apiAccess';

/**
 * Token scopes that let a caller read unpublished work. A token that can write content may see its drafts; the default
 * read-only token is meant for public delivery and its key often ends up in a browser, so it must never see them.
 */
const DRAFT_SCOPES = ['*', 'content:create', 'content:edit', 'content:publish'];

export function canPreviewDrafts(access: ApiAccess): boolean {
  if (!access.ok) return false;
  return !!access.isAgencyAdmin || DRAFT_SCOPES.some((scope) => access.scopes?.includes(scope));
}

/** The 403 for a request that asks for drafts without being allowed to see them, or null when the request may go on. */
export function previewRefusal(access: ApiAccess, isPreview: boolean): NextResponse | null {
  if (!isPreview || canPreviewDrafts(access)) return null;
  return NextResponse.json(
    { error: "Forbidden: previewing unpublished content needs an API token with the 'content:edit' or 'content:publish' scope" },
    { status: 403 }
  );
}

/**
 * What the public site serves for each page: the live row when the page is published, otherwise the last published
 * version. Saving a new draft over a live page does not take the page down (see getPublishedComposition).
 */
const PUBLISHED_PAGES = `(
  SELECT id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, updated_at
    FROM page_compositions WHERE status = 'published'
  UNION ALL
  SELECT v.composition_id, v.site_id, v.page_slug, v.title, v.layout_collection, v.sections_json, v.meta_json, v.version, v.status, v.created_at
    FROM page_versions v
   WHERE v.status = 'published'
     AND NOT EXISTS (SELECT 1 FROM page_compositions c WHERE c.site_id = v.site_id AND c.page_slug = v.page_slug AND c.status = 'published')
     AND v.version = (SELECT MAX(w.version) FROM page_versions w WHERE w.site_id = v.site_id AND w.page_slug = v.page_slug AND w.status = 'published')
)`;

export interface ApiPageQuery {
  access: ApiAccess;
  siteId?: string | null;
  slug?: string | null;
  limit?: number;
  offset?: number;
  /** The latest saved version of each page, whatever its status. Callers must check canPreviewDrafts first. */
  drafts?: boolean;
}

export async function selectApiPages(db: Pick<Client, 'execute'>, query: ApiPageQuery) {
  const filter = apiTenantFilter(query.access, 'page', 'p');
  let sql = `SELECT p.* FROM ${query.drafts ? 'page_compositions' : PUBLISHED_PAGES} p WHERE 1 = 1${filter.sql}`;
  const args: (string | number)[] = [...filter.args];
  if (query.siteId) {
    sql += ' AND p.site_id = ?';
    args.push(query.siteId);
  }
  if (query.slug) {
    sql += ' AND p.page_slug = ?';
    args.push(query.slug);
  }
  sql += ' ORDER BY p.page_slug ASC, p.site_id ASC LIMIT ? OFFSET ?';
  args.push(query.limit ?? 50, query.offset ?? 0);
  return (await db.execute({ sql, args })).rows;
}
