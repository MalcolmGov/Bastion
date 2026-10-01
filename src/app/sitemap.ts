import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getDb } from '@/lib/db/client';
import { resolveDomain, isPlatformHost } from '@/lib/domains/registry';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const domain = host.split(':')[0].toLowerCase();
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // Do not emit sitemaps for platform / agency domains
  if (isPlatformHost(domain)) {
    return [];
  }

  // Resolve client website by verified primary domain
  const resolved = await resolveDomain(domain);
  if (!resolved.found || !resolved.isPublished || !resolved.websiteId) {
    return [];
  }

  try {
    const db = getDb();
    // Query published page compositions strictly for this website
    const res = await db.execute({
      sql: `SELECT page_slug, updated_at FROM page_compositions WHERE site_id = ? AND status = 'published' ORDER BY updated_at DESC`,
      args: [resolved.websiteId],
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
    return [];
  }
}
