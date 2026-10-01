import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { createApiToken, listApiTokens, revokeApiToken } from '@/lib/auth/apiToken';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const clientId = isAgencyUser(gate.user) ? undefined : (gate.user.client_id || undefined);
    const tokens = await listApiTokens(clientId);

    return NextResponse.json({ success: true, tokens });
  } catch (err: any) {
    console.error('List tokens error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const { name, siteId, scopes = ['content:read'] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Token name is required' }, { status: 400 });
    }

    const clientId = isAgencyUser(gate.user)
      ? (body.clientId || gate.user.client_id || 'client_goldfields')
      : gate.user.client_id;

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const result = await createApiToken({
      name,
      clientId,
      siteId: siteId || null,
      scopes: Array.isArray(scopes) ? scopes : ['content:read']
    });

    return NextResponse.json({
      success: true,
      token: result.rawToken,
      record: result.record
    });
  } catch (err: any) {
    console.error('Create token error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const clientId = isAgencyUser(gate.user) ? undefined : (gate.user.client_id || undefined);
    const revoked = await revokeApiToken(tokenId, clientId);

    if (!revoked) {
      return NextResponse.json({ error: 'Token not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Revoke token error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
