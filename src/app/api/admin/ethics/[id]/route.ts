import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { updateWhistleblowerStatus, WhistleblowerStatus } from '@/lib/ethics/ethicsService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await params;
    const body = await req.json();
    const { status, resolutionSummary } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    await updateWhistleblowerStatus(
      id,
      status as WhistleblowerStatus,
      resolutionSummary,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: `Report ${id} updated to ${status}.`,
    });
  } catch (err: any) {
    console.error('[API Admin Ethics PATCH Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update report' }, { status: 500 });
  }
}
