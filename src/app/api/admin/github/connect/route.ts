import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import {
  getGitHubOAuthUrl,
  fetchGitHubUser,
  saveGitHubIntegration
} from '@/lib/github/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const origin = req.nextUrl.origin;
    const url = getGitHubOAuthUrl(origin);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const token = String(body.token || '').trim();

    if (!token) {
      return NextResponse.json({ error: 'GitHub Personal Access Token is required' }, { status: 400 });
    }

    // Verify token with GitHub
    const ghUser = await fetchGitHubUser(token);
    await saveGitHubIntegration(ghUser, token, user.id);

    return NextResponse.json({
      success: true,
      isConnected: true,
      user: ghUser
    });
  } catch (err: any) {
    console.error('Failed to connect GitHub token:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
