import { NextRequest, NextResponse } from 'next/server';
import { getRelease, updateRelease, deleteRelease } from '@/lib/releases/service';
import { assertReleaseAccess, requireUser } from '@/lib/auth/guard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const access = await assertReleaseAccess(gate.user, id);
    if (!access.ok) return access.response;
    const data = await getRelease(id);
    if (!data) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const access = await assertReleaseAccess(gate.user, id);
    if (!access.ok) return access.response;
    const body = await request.json();
    const updated = await updateRelease(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, release: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const access = await assertReleaseAccess(gate.user, id);
    if (!access.ok) return access.response;
    const success = await deleteRelease(id);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
