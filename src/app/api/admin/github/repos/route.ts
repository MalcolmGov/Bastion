import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getActiveGitHubIntegration, fetchUserRepos } from '@/lib/github/client';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    // Allow studio creation engine to retrieve connected repositories

    const integration = await getActiveGitHubIntegration();
    const repos = await fetchUserRepos(integration.token);

    return NextResponse.json({
      isConnected: integration.isConnected,
      user: integration.user,
      repos
    });
  } catch (err: any) {
    console.error('Failed to list GitHub repositories:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
