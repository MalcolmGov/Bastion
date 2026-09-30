import { NextRequest, NextResponse } from 'next/server';
import { publishRelease } from '@/lib/releases/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let publishedBy = 'Malcolm Govender';
    try {
      const body = await request.json();
      if (body.publishedBy) publishedBy = body.publishedBy;
    } catch {}

    const result = await publishRelease(id, publishedBy);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[API /api/admin/releases/${(await params).id}/publish] Error:`, err);
    return NextResponse.json({ error: err.message || 'Failed to publish release' }, { status: 500 });
  }
}
