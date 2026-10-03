import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { AssemblyError, WebsiteAssembler } from '@/lib/studio/assembler';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const db = getDb();

    const result = await WebsiteAssembler.assembleAndSave(body, db, gate.user);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Assemble Error Details]:', err);
    return NextResponse.json({ error: err instanceof AssemblyError ? err.message : 'Website creation failed. No changes were saved.' }, { status: err instanceof AssemblyError ? err.status : 500 });
  }
}
