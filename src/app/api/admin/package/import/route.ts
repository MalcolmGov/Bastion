import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { ProjectPackageService } from '@/lib/studio/exporter';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const pkg = body.packageData || body;
    const db = getDb();
    const result = await ProjectPackageService.importPackage(pkg, db);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
