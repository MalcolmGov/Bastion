import { NextRequest, NextResponse } from 'next/server';
import { ReleaseValidationError, listReleases, createRelease } from '@/lib/releases/service';
import { assertSiteAccess, requireUser, requirePermission } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(request.url);
    const clientId = isAgencyUser(gate.user)
      ? (searchParams.get('clientId') || undefined)
      : gate.user.client_id || undefined;
    const siteId = searchParams.get('siteId') || undefined;
    const status = searchParams.get('status') || undefined;

    const releases = await listReleases({ clientId, siteId, status });
    return NextResponse.json({ releases });
  } catch (err: any) {
    console.error('[API /api/admin/releases] Error listing releases:', err);
    return NextResponse.json({ error: err.message || 'Failed to list releases' }, { status: err instanceof ReleaseValidationError ? 400 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requirePermission('content:publish');
    if (!gate.ok) return gate.response;
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Release name is required' }, { status: 400 });
    }

    const clientId = isAgencyUser(gate.user) ? body.clientId : gate.user.client_id;
    if (body.siteId) {
      const siteGate = await assertSiteAccess(gate.user, body.siteId);
      if (!siteGate.ok) return siteGate.response;
    }

    const release = await createRelease({
      clientId,
      siteId: body.siteId,
      name: body.name,
      description: body.description,
      scheduledAt: body.scheduledAt,
      status: body.status
    });

    return NextResponse.json({ success: true, release }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/admin/releases] Error creating release:', err);
    return NextResponse.json({ error: err.message || 'Failed to create release' }, { status: err instanceof ReleaseValidationError ? 400 : 500 });
  }
}
