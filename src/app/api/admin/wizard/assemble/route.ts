import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { WebsiteAssembler } from '@/lib/studio/assembler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    const result = await WebsiteAssembler.assembleAndSave(body, db);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
