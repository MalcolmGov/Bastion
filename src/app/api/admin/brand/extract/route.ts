import { NextRequest, NextResponse } from 'next/server';
import { HeadlessBrandExtractor } from '@/lib/studio/headlessExtractor';
import { BrandDnaExtractor } from '@/lib/studio/brandExtractor';
import { JobManager } from '@/lib/studio/worker';
import { requireAgencyUser } from '@/lib/auth/guard';

export const maxDuration = 120;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { url, maxPages = 3 } = body;

    if (!url) {
      return NextResponse.json({ error: 'Target website URL is required.' }, { status: 400 });
    }

    // Try HeadlessBrandExtractor with temporary job
    const job = JobManager.createJob(url);
    try {
      const headlessExtractor = new HeadlessBrandExtractor();
      const result = await headlessExtractor.extractWithJob(url, job.id, Math.min(4, Math.max(1, Number(maxPages) || 1)));
      return NextResponse.json({
        success: true,
        jobId: job.id,
        result
      });
    } catch (headlessErr) {
      console.warn('[BrandDnaExtractAPI] Headless failed, falling back to static parser:', headlessErr);
      const fallbackExtractor = new BrandDnaExtractor();
      const result = await fallbackExtractor.extractBrandKit(url);
      return NextResponse.json({
        success: true,
        jobId: job.id,
        result
      });
    }
  } catch (err: any) {
    console.error('[BrandDnaExtractAPI] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to extract Brand DNA.' },
      { status: 400 }
    );
  }
}
