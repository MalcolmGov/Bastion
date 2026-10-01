import { NextRequest, NextResponse } from 'next/server';
import { JobManager } from '@/lib/studio/worker';
import { HeadlessBrandExtractor } from '@/lib/studio/headlessExtractor';
import { validateSafeUrl, normalizeUrl } from '@/lib/studio/importer';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { url, maxPages = 4 } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Target website URL is required.' },
        { status: 400 }
      );
    }

    const normalized = normalizeUrl(url);
    const safeCheck = validateSafeUrl(normalized);
    if (!safeCheck.isValid) {
      return NextResponse.json(
        { error: `Security check failed: ${safeCheck.error}` },
        { status: 400 }
      );
    }

    // Create job entry in JobManager
    const job = JobManager.createJob(normalized);

    // Fire asynchronous background headless extraction
    // Does not block response to client
    (async () => {
      try {
        const extractor = new HeadlessBrandExtractor();
        await extractor.extractWithJob(normalized, job.id, maxPages);
      } catch (err: any) {
        console.error(`[BrandExtractionBackground] Job ${job.id} failed:`, err);
        // Error already handled by JobManager.failJob inside extractWithJob
      }
    })();

    return NextResponse.json({
      success: true,
      jobId: job.id,
      url: normalized,
      status: job.status,
      message: 'Headless Brand DNA extraction initiated.'
    });
  } catch (err: any) {
    console.error('[BrandExtractStartAPI] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to start extraction job.' },
      { status: 500 }
    );
  }
}
