import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import {
  getGitHubOAuthUrl,
  fetchGitHubUser,
  saveGitHubIntegration,
  getLocalGitHubCliToken,
  saveGitHubOAuthConfig
} from '@/lib/github/client';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const url = await getGitHubOAuthUrl(origin);
    const cliToken = getLocalGitHubCliToken();

    return NextResponse.json({
      configured: !!url,
      url: url || null,
      hasLocalCli: !!cliToken,
      localCliUser: cliToken ? 'MalcolmGov' : null,
      message: url ? 'OAuth App ready' : 'GitHub OAuth App has not been configured with a Client ID.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    // Option 1: Connect via detected Local GitHub CLI
    if (body.action === 'local_cli') {
      const cliToken = getLocalGitHubCliToken();
      if (!cliToken) {
        return NextResponse.json({ error: 'Local GitHub CLI (gh) is not logged in on this system.' }, { status: 400 });
      }
      const ghUser = await fetchGitHubUser(cliToken);
      await saveGitHubIntegration(ghUser, cliToken, user?.id || 'usr_developer_local');
      return NextResponse.json({
        success: true,
        isConnected: true,
        user: ghUser
      });
    }

    // Option 2: Save custom GitHub OAuth App Client ID & Secret
    if (body.action === 'save_oauth') {
      const clientId = String(body.clientId || '').trim();
      const clientSecret = String(body.clientSecret || '').trim();
      if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Client ID and Client Secret are required' }, { status: 400 });
      }
      await saveGitHubOAuthConfig(clientId, clientSecret);
      const origin = req.nextUrl.origin;
      const url = await getGitHubOAuthUrl(origin);
      return NextResponse.json({
        success: true,
        configured: true,
        url
      });
    }

    // Option 3: Connect via Personal Access Token (PAT)
    const token = String(body.token || '').trim();
    if (!token) {
      return NextResponse.json({ error: 'GitHub Personal Access Token is required' }, { status: 400 });
    }

    // Verify token with GitHub
    const ghUser = await fetchGitHubUser(token);
    await saveGitHubIntegration(ghUser, token, user?.id || 'usr_admin');

    return NextResponse.json({
      success: true,
      isConnected: true,
      user: ghUser
    });
  } catch (err: any) {
    console.error('Failed to connect GitHub:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
