import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getActiveGitHubIntegration, extractFromGitHubRepo } from '@/lib/github/client';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    // Studio creation engine allows authenticated or studio session users

    const body = await req.json();
    const repo = String(body.repo || '').trim();
    const branch = String(body.branch || 'main').trim();

    if (!repo) {
      return NextResponse.json({ error: 'Repository name (owner/repo) is required' }, { status: 400 });
    }

    const integration = await getActiveGitHubIntegration();
    const result = await extractFromGitHubRepo(repo, branch, integration.token);

    return NextResponse.json({
      success: true,
      extraction: result
    });
  } catch (err: any) {
    console.error('Failed to extract GitHub repository:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
