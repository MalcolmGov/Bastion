import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'gf_studio_session';

/** Routes that authenticate with something other than the studio session cookie. */
function isPublicAdminApi(pathname: string): boolean {
  if (pathname === '/api/admin/auth/login') return true;
  if (pathname === '/api/admin/auth/accept-invite') return true;
  if (pathname === '/api/admin/sre/quick-approve') return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const hasSession = !!req.cookies.get(SESSION_COOKIE)?.value;

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

  // 3. SEO & Robots Isolation: Add noindex to admin, preview, draft, or api routes
  const res = NextResponse.next();
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/preview') ||
    searchParams.get('preview') === 'true'
  ) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/preview/:path*', '/sites/:path*'],
};
