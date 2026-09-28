import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { ProjectPackageService } from '@/lib/studio/exporter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pkg = body.packageData || body;
    const db = getDb();
    const result = await ProjectPackageService.importPackage(pkg, db);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
