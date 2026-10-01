/**
 * Bastion Move Studio: Domain Registry & Custom Domain Resolution
 * Resolves verified custom domains against the websites table without
 * unsafe substring guessing or arbitrary domain collision.
 */

import { getDb } from '@/lib/db/client';

export interface ResolvedDomain {
  found: boolean;
  siteSlug: string | null;
  websiteId: string | null;
  clientId: string | null;
  status: string | null;
  primaryDomain: string | null;
  isPublished: boolean;
  isPlatformHost: boolean;
}

interface DomainCacheEntry {
  resolved: ResolvedDomain;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 1000; // 30-second memory cache
const domainCache = new Map<string, DomainCacheEntry>();

/** Known agency platform host suffixes that should not be treated as client custom domains */
const PLATFORM_HOST_PATTERNS = [
  'localhost',
  '127.0.0.1',
  'zaraai.digital',
  'duckdns.org',
  'bastion-studio',
  'movedigital.africa',
];

export function isPlatformHost(hostname: string): boolean {
  if (!hostname) return true;
  const clean = hostname.split(':')[0].toLowerCase();
  return PLATFORM_HOST_PATTERNS.some(pattern => clean === pattern || clean.endsWith(`.${pattern}`));
}

/**
 * Resolves a hostname to a tenant website record.
 * Performs strict exact matching against websites.primary_domain or supported tenant subdomains.
 */
export async function resolveDomain(hostname: string): Promise<ResolvedDomain> {
  if (!hostname) {
    return {
      found: false,
      siteSlug: null,
      websiteId: null,
      clientId: null,
      status: null,
      primaryDomain: null,
      isPublished: false,
      isPlatformHost: true,
    };
  }

  const clean = hostname.split(':')[0].toLowerCase();
  const normalizedNoWww = clean.replace(/^www\./, '');

  // Check in-memory cache
  const cached = domainCache.get(clean);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.resolved;
  }

  // 1. Check if this is the root platform host
  const isPlatform = isPlatformHost(clean);

  // 2. Multi-tenant subdomain pattern: e.g. vodacom.bastion.app or goldfields.movedigital.africa
  if (isPlatform) {
    const parts = clean.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      const reserved = ['admin', 'api', 'preview', 'www', 'app', 'portal', 'mail', 'auth'];
      if (!reserved.includes(subdomain)) {
        try {
          const db = getDb();
          const subRes = await db.execute({
            sql: `SELECT id, client_id, slug, status, primary_domain FROM websites WHERE LOWER(slug) = ? LIMIT 1`,
            args: [subdomain],
          });
          if (subRes.rows.length > 0) {
            const w = subRes.rows[0];
            const resolved: ResolvedDomain = {
              found: true,
              siteSlug: String(w.slug),
              websiteId: String(w.id),
              clientId: String(w.client_id),
              status: String(w.status),
              primaryDomain: w.primary_domain ? String(w.primary_domain) : null,
              isPublished: w.status === 'published',
              isPlatformHost: false,
            };
            domainCache.set(clean, { resolved, expiresAt: Date.now() + CACHE_TTL_MS });
            return resolved;
          }
        } catch (_) {}
      }
    }

    const platformResolved: ResolvedDomain = {
      found: false,
      siteSlug: null,
      websiteId: null,
      clientId: null,
      status: null,
      primaryDomain: null,
      isPublished: false,
      isPlatformHost: true,
    };
    domainCache.set(clean, { resolved: platformResolved, expiresAt: Date.now() + CACHE_TTL_MS });
    return platformResolved;
  }

  // 3. Database lookup for custom primary domain (Exact match only)
  try {
    const db = getDb();
    const res = await db.execute({
      sql: `SELECT id, client_id, slug, status, primary_domain 
            FROM websites 
            WHERE LOWER(primary_domain) = ? OR LOWER(primary_domain) = ? 
            LIMIT 1`,
      args: [clean, normalizedNoWww],
    });

    if (res.rows.length > 0) {
      const w = res.rows[0];
      const resolved: ResolvedDomain = {
        found: true,
        siteSlug: String(w.slug),
        websiteId: String(w.id),
        clientId: String(w.client_id),
        status: String(w.status),
        primaryDomain: String(w.primary_domain || clean),
        isPublished: w.status === 'published',
        isPlatformHost: false,
      };
      domainCache.set(clean, { resolved, expiresAt: Date.now() + CACHE_TTL_MS });
      return resolved;
    }
  } catch (err: any) {
    console.warn('[Domain Registry] Lookup failed:', err.message);
  }

  // Not found in registry
  const notFoundResolved: ResolvedDomain = {
    found: false,
    siteSlug: null,
    websiteId: null,
    clientId: null,
    status: null,
    primaryDomain: null,
    isPublished: false,
    isPlatformHost: false,
  };
  domainCache.set(clean, { resolved: notFoundResolved, expiresAt: Date.now() + CACHE_TTL_MS });
  return notFoundResolved;
}

/** Clear domain cache on site update */
export function invalidateDomainCache(domain?: string) {
  if (domain) {
    const clean = domain.split(':')[0].toLowerCase();
    domainCache.delete(clean);
    domainCache.delete(clean.replace(/^www\./, ''));
  } else {
    domainCache.clear();
  }
}
