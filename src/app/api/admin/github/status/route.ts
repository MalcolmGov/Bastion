import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getActiveGitHubIntegration, disconnectGitHub } from '@/lib/github/client';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET() {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();

    const integration = await getActiveGitHubIntegration();
    return NextResponse.json({ isConnected: integration.isConnected, user: integration.user, connectedAt: integration.connectedAt }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('GitHub status check failed:', err);
    return NextResponse.json({ isConnected: false, user: null }, { status: 200 });
  }
}

export async function DELETE() {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disconnectGitHub();
    return NextResponse.json({ success: true, isConnected: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
