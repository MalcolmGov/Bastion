import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'gf_studio_session';

/** Public admin API routes that do not require session cookie auth */
function isPublicAdminApi(pathname: string): boolean {
  if (pathname === '/api/admin/auth/login') return true;
  if (pathname === '/api/admin/auth/accept-invite') return true;
  if (pathname === '/api/admin/sre/quick-approve') return true;
  return false;
}

/** Resolves client site slug from custom domain hostnames */
function resolveClientSiteSlug(hostname: string): string | null {
  if (!hostname) return null;
  const clean = hostname.split(':')[0].toLowerCase();

  // Root platform / agency control planes — do not rewrite
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

  // Pre-configured client domain mappings
  if (clean === 'goldfields-bay.vercel.app' || clean.includes('goldfields')) {
    return 'goldfields';
  }
  if (clean.includes('vodacom')) {
    return 'vodacom';
  }
  if (clean.includes('apex')) {
    return 'apex-advisory';
  }
  if (clean.includes('lumina')) {
    return 'lumina';
  }
  if (clean.includes('bastiongroup.co.za')) {
    return 'bastion-holding';
  }

  // Multi-tenant subdomain pattern: [siteSlug].domains...
  const parts = clean.split('.');
  if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'admin' && parts[0] !== 'api') {
    return parts[0];
  }

  return null;
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
      return res;
    }
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }

  // 2. Admin UI Protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/invite') {
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 3. Client Custom Domain Routing
  // If the request is from a client's own domain, rewrite to their published tenant site
  const clientSiteSlug = resolveClientSiteSlug(hostname);
  if (
    clientSiteSlug &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/sites') &&
    !pathname.startsWith('/quote') &&
    !pathname.startsWith('/invoice') &&
    !pathname.startsWith('/status')
  ) {
    const rewriteUrl = req.nextUrl.clone();
    if (pathname === '/') {
      rewriteUrl.pathname = `/sites/${clientSiteSlug}`;
    } else {
      rewriteUrl.pathname = `/sites/${clientSiteSlug}${pathname}`;
    }

    const res = NextResponse.rewrite(rewriteUrl);
    res.headers.set('x-tenant-site', clientSiteSlug);
    res.headers.set('x-tenant-domain', hostname);

    if (isPreview) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } else {
      res.headers.set(
        'X-Robots-Tag',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }
    return res;
  }

  // 4. Platform SEO & Robots Isolation
  const res = NextResponse.next();
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/preview') ||
    pathname.startsWith('/quote') ||
    pathname.startsWith('/invoice') ||
    isPreview
  ) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else if (pathname.startsWith('/sites/')) {
    // Direct access to site compositions inherits preview/published indexing rule
    if (isPreview) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    } else {
      res.headers.set('X-Robots-Tag', 'index, follow');
    }
  }

  return res;
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
