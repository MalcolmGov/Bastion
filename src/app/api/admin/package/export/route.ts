import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { ProjectPackageService } from '@/lib/studio/exporter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'site_apex_strategy';
    const db = getDb();

    const pkg = await ProjectPackageService.exportPackage(siteId, db);
    return NextResponse.json(pkg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
