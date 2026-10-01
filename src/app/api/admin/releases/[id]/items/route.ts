import { NextRequest, NextResponse } from 'next/server';
import { addItemToRelease, removeItemFromRelease } from '@/lib/releases/service';
import { assertReleaseAccess, requireUser } from '@/lib/auth/guard';

export async function POST(
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

    if (!body.itemType || !body.itemId || !body.title) {
      return NextResponse.json({ error: 'itemType, itemId, and title are required' }, { status: 400 });
    }

    const item = await addItemToRelease(id, {
      itemType: body.itemType,
      itemId: body.itemId,
      title: body.title,
      action: body.action || 'update',
      changesSummary: body.changesSummary,
      snapshotJson: body.snapshotJson
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId query parameter is required' }, { status: 400 });
    }

    const success = await removeItemFromRelease(id, itemId);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
