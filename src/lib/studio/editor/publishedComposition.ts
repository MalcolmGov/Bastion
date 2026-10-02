import type { Client } from '@libsql/client';

/** Saving a new draft must keep the last published snapshot on the public site. */
export function getPublishedComposition(
  db: Client,
  siteId: string,
  pageSlug: string,
) {
  return db.execute({
    sql: `SELECT title,layout_collection,sections_json,meta_json,version,status FROM page_compositions WHERE site_id = ? AND page_slug = ? AND status = 'published'
      UNION ALL SELECT title,layout_collection,sections_json,meta_json,version,status FROM page_versions WHERE site_id = ? AND page_slug = ? AND status = 'published'
      ORDER BY version DESC LIMIT 1`,
    args: [siteId, pageSlug, siteId, pageSlug],
  });
}
