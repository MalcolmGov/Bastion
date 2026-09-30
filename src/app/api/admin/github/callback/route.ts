import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeOAuthCode,
  fetchGitHubUser,
  saveGitHubIntegration
} from '@/lib/github/client';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    const returnTo = req.nextUrl.searchParams.get('return_to') || '/admin/create';
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
