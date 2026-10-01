import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const domain = host.split(':')[0].toLowerCase();

  // If host is internal agency, preview, or staging, disallow crawler indexing
  if (
    domain.includes('admin') ||
    domain.includes('preview') ||
    domain.includes('staging') ||
    domain === 'localhost' ||
    domain === '127.0.0.1'
  ) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Public client custom domain or production site
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/preview/', '/quote/', '/invoice/'],
      },
    ],
    sitemap: `${protocol}://${host}/sitemap.xml`,
  };
}
