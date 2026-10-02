import { NextRequest, NextResponse } from 'next/server';
import { requireAgencyUser } from '@/lib/auth/guard';
import { assertApiSiteAccess } from '@/lib/auth/apiAccess';
import { getDb } from '@/lib/db/client';
import { createApiToken, listApiTokens, revokeApiToken } from '@/lib/auth/apiToken';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;

    const tokens = await listApiTokens();

    return NextResponse.json({ success: true, tokens });
  } catch (err: any) {
    console.error('List tokens error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const { name, siteId, scopes = ['content:read'] } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Token name is required' }, { status: 400 });
    }

    const clientId = body.clientId || 'client_goldfields';

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const allowedScopes = ['content:read', 'content:create', 'content:edit', 'content:publish', 'graphql:read', 'mcp:access', '*'];
    if (!Array.isArray(scopes) || scopes.length === 0 || scopes.some((scope: unknown) => typeof scope !== 'string' || !allowedScopes.includes(scope))) {
      return NextResponse.json({ error: 'Invalid API token scopes.' }, { status: 400 });
    }
    if (siteId) {
      try {
        await assertApiSiteAccess(getDb(), { ok: true, status: 200, clientId }, siteId);
      } catch {
        return NextResponse.json({ error: 'Website not found in the selected workspace.' }, { status: 400 });
      }
    }

    const result = await createApiToken({
      name,
      clientId,
      siteId: siteId || null,
      scopes
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
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(req.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    const revoked = await revokeApiToken(tokenId);

    if (!revoked) {
      return NextResponse.json({ error: 'Token not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Revoke token error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
