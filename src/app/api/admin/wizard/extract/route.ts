import { NextRequest, NextResponse } from 'next/server';
import { MoveStudioIngestProvider } from '@/lib/studio/importer';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { url, maxPages = 15, excludedPaths = [] } = body;

    if (!url) {
      return NextResponse.json({ error: 'Source URL is required.' }, { status: 400 });
    }

    const provider = new MoveStudioIngestProvider();
    const result = await provider.crawlAndExtract(url, {
      maxPages: Number(maxPages),
      excludedPaths
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
