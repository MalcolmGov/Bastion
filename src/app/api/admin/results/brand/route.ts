import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { extractResultsBrand } from '@/lib/results/brand';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const url = String(body.url || '').trim();
    if (!url) return NextResponse.json({ error: 'Enter the client website address.' }, { status: 400 });
    const brand = await extractResultsBrand(url);
    return NextResponse.json({ brand });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Brand extraction failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
