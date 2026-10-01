import { NextRequest, NextResponse } from 'next/server';
import { publishRelease } from '@/lib/releases/service';
import { hasPermission } from '@/lib/auth/auth';
import { assertReleaseAccess, requireUser } from '@/lib/auth/guard';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    if (!hasPermission(gate.user.role, 'content:publish')) {
      return NextResponse.json({ error: 'Forbidden: only a publisher can publish a release.' }, { status: 403 });
    }
    const access = await assertReleaseAccess(gate.user, id);
    if (!access.ok) return access.response;
    const result = await publishRelease(id, gate.user.name);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[API /api/admin/releases/${(await params).id}/publish] Error:`, err);
    return NextResponse.json({ error: err.message || 'Failed to publish release' }, { status: 500 });
  }
}
