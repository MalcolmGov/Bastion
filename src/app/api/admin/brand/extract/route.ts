import { NextRequest, NextResponse } from 'next/server';
import { BrandDnaExtractor } from '@/lib/studio/brandExtractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Target website URL is required.' }, { status: 400 });
    }

    const extractor = new BrandDnaExtractor();
    const result = await extractor.extractBrandKit(url);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (err: any) {
    console.error('[BrandDnaExtractAPI] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to extract Brand DNA.' },
      { status: 400 }
    );
  }
}
