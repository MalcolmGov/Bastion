import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'gf_studio_session';

/** Public admin API routes that do not require session cookie auth */
function isPublicAdminApi(pathname: string): boolean {
  if (pathname === '/api/admin/auth/login') return true;
  if (pathname === '/api/admin/auth/accept-invite') return true;
  if (pathname === '/api/admin/sre/quick-approve') return true;
  if (pathname === '/api/admin/ir/quotes') return true;
  if (pathname === '/api/admin/ir/live-wire') return true;
  if (pathname === '/api/admin/voice-copilot/speak') return true;
  if (pathname.startsWith('/api/admin/ir/calendar/') && pathname.endsWith('/ics')) return true;
  return false;
}

interface CustomDomainResolution {
  slug: string;
  isPublished: boolean;
}

const EXACT_DOMAIN_REGISTRY: Record<string, CustomDomainResolution> = {
  'goldfields-bay.vercel.app': { slug: 'goldfields', isPublished: true },
  'vodacom.com': { slug: 'vodacom', isPublished: true },
  'apexadvisory.com': { slug: 'apex-advisory', isPublished: true },
  'bastiongroup.co.za': { slug: 'bastion-holding', isPublished: true },
  'luminadining.com': { slug: 'lumina', isPublished: false },
};

/** Resolves client site slug from custom domain hostnames via exact match */
function resolveClientDomain(hostname: string): CustomDomainResolution | null {
  if (!hostname) return null;
  const clean = hostname.split(':')[0].toLowerCase();
  const noWww = clean.replace(/^www\./, '');

  // 1. Exact registry lookup against verified primary domains
  if (EXACT_DOMAIN_REGISTRY[clean]) return EXACT_DOMAIN_REGISTRY[clean];
  if (EXACT_DOMAIN_REGISTRY[noWww]) return EXACT_DOMAIN_REGISTRY[noWww];

  // 2. Root platform / agency control planes — do not rewrite
  if (
    clean === 'localhost' ||
    clean === '127.0.0.1' ||
    clean.includes('zaraai.digital') ||
    clean.includes('duckdns.org') ||
    clean.includes('bastion-studio') ||
    clean.includes('movedigital.africa')
  ) {
    return null;
  }

  // 3. Multi-tenant subdomain pattern: [siteSlug].domains...
  const parts = clean.split('.');
  if (parts.length >= 3) {
    const candidateSlug = parts[0];
    const registered = Object.values(EXACT_DOMAIN_REGISTRY).find(r => r.slug === candidateSlug);
    if (registered) return registered;
  }

  return null;
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  return res;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;
  const host = req.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();
  const isPreview = searchParams.get('preview') === 'true';

  // 1. API Admin Protection
  if (pathname.startsWith('/api/admin')) {
    if (isPublicAdminApi(pathname)) {
      const res = NextResponse.next();
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return applySecurityHeaders(res);
    }
    if (!hasSession) {
      return applySecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return applySecurityHeaders(res);
  }

  // 2. Admin UI Protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/invite') {
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  // 3. Client Custom Domain Routing
  // If the request is from a client's verified domain, rewrite to their tenant site
  const resolvedDomain = resolveClientDomain(hostname);
  if (
    resolvedDomain &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/sites') &&
    !pathname.startsWith('/quote') &&
    !pathname.startsWith('/invoice') &&
    !pathname.startsWith('/status') &&
    pathname !== '/robots.txt' &&
    pathname !== '/sitemap.xml'
  ) {
    const rewriteUrl = req.nextUrl.clone();
    if (pathname === '/') {
      rewriteUrl.pathname = `/sites/${resolvedDomain.slug}`;
    } else {
      rewriteUrl.pathname = `/sites/${resolvedDomain.slug}${pathname}`;
    }

    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set('x-tenant-site', resolvedDomain.slug);
    res.headers.set('x-tenant-domain', hostname);

    // Only grant indexing if the website is officially published and not in preview mode
    if (isPreview || !resolvedDomain.isPublished) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } else {
      res.headers.set(
        'X-Robots-Tag',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }
    return applySecurityHeaders(res);
  }

  // 4. Platform SEO & Robots Isolation
  const res = NextResponse.next();
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/quote') ||
    pathname.startsWith('/invoice') ||
    pathname.startsWith('/sites/') ||
    isPreview
  ) {
    // All platform direct visits, preview links, admin tools, and direct /sites/... visits are strictly noindex
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return applySecurityHeaders(res);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets directory
     * - static file extensions (svg, png, jpg, jpeg, gif, webp, css, js)
     */
    '/((?!_next/static|_next/image|assets|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};
