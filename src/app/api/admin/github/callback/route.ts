import { NextRequest, NextResponse } from 'next/server';
import { requireAgencyUser } from '@/lib/auth/guard';
import {
  exchangeOAuthCode,
  fetchGitHubUser,
  saveGitHubIntegration
} from '@/lib/github/client';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const code = req.nextUrl.searchParams.get('code');
    const requestedReturn = req.nextUrl.searchParams.get('return_to') || '/admin/create';
    const returnTo = requestedReturn.startsWith('/admin') && !requestedReturn.startsWith('//')
      ? requestedReturn
      : '/admin/create';
    const origin = req.nextUrl.origin;

    if (!code) {
      return NextResponse.redirect(new URL(`${returnTo}?error=no_code`, origin));
    }

    const token = await exchangeOAuthCode(code, origin);
    const ghUser = await fetchGitHubUser(token);
    await saveGitHubIntegration(ghUser, token);

    return NextResponse.redirect(new URL(`${returnTo}?github=connected`, origin));
  } catch (err: any) {
    console.error('GitHub OAuth callback failed:', err);
    const origin = req.nextUrl.origin;
    return NextResponse.redirect(new URL(`/admin/create?error=${encodeURIComponent(err.message)}`, origin));
  }
}
