import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDb } from '@/lib/db/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const db = getDb();
    // Query published page compositions
    const res = await db.execute({
      sql: `SELECT site_id, page_slug, updated_at FROM page_compositions WHERE status = 'published' ORDER BY updated_at DESC`,
      args: [],
    });

    const entries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];

    for (const row of res.rows) {
      const slug = String(row.page_slug);
      if (slug !== 'home') {
        entries.push({
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(String(row.updated_at)),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }

    return entries;
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
