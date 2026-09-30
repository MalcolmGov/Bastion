import { NextRequest, NextResponse } from 'next/server';
import { listReleases, createRelease } from '@/lib/releases/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId') || undefined;
    const siteId = searchParams.get('siteId') || undefined;
    const status = searchParams.get('status') || undefined;

    const releases = await listReleases({ clientId, siteId, status });
    return NextResponse.json({ releases });
  } catch (err: any) {
    console.error('[API /api/admin/releases] Error listing releases:', err);
    return NextResponse.json({ error: err.message || 'Failed to list releases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Release name is required' }, { status: 400 });
    }

    const release = await createRelease({
      clientId: body.clientId,
      siteId: body.siteId,
      name: body.name,
      description: body.description,
      scheduledAt: body.scheduledAt,
      status: body.status
    });

    return NextResponse.json({ success: true, release }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/admin/releases] Error creating release:', err);
    return NextResponse.json({ error: err.message || 'Failed to create release' }, { status: 500 });
  }
}
