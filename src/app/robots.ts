import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { resolveDomain, isPlatformHost } from '@/lib/domains/registry';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const domain = host.split(':')[0].toLowerCase();

  // If host is platform/agency, preview, or staging, completely disallow crawler indexing
  if (isPlatformHost(domain) || domain.includes('admin') || domain.includes('staging')) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Resolve against custom domain registry
  const resolved = await resolveDomain(domain);
  if (!resolved.found || !resolved.isPublished) {
    // Unverified or draft client site — do not index
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Verified published client custom domain
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
