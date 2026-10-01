import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { WebsiteAssembler } from '@/lib/studio/assembler';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const db = getDb();

    const result = await WebsiteAssembler.assembleAndSave(body, db);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Assemble Error Details]:', err);
    return NextResponse.json({ error: err.message, stack: err.stack, cause: err.cause }, { status: 500 });
  }
}
