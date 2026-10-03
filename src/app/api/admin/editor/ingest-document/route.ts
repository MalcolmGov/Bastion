import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import {
  ingestCorporateDocument,
  CORPORATE_REPORT_SAMPLES,
  type ExtractedReportInsights,
} from '@/lib/studio/editor/documentIngest';
import { saveWebsiteDrafts, EditorSaveError } from '@/lib/studio/editor/saveComposition';
import { getDb } from '@/lib/db/client';

export async function GET() {
  // Returns available corporate demo samples for quick selector in UI
  const samples = Object.entries(CORPORATE_REPORT_SAMPLES).map(([id, sample]) => ({
    id,
    companyName: sample.companyName,
    reportingPeriod: sample.reportingPeriod,
    theme: sample.theme,
    badge: sample.badge,
    kpiCount: sample.kpis.length,
    pillarCount: sample.strategicPillars.length,
    tableRowCount: sample.financialTable?.rows.length || 0,
    hasEsg: Boolean(sample.sustainabilityKpis && sample.sustainabilityKpis.length > 0),
  }));

  return NextResponse.json({ samples });
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    // Monetization Gate: Only Bastion Agency staff can run the document-to-web ingestion engine
    if (!isAgencyUser(gate.user)) {
      return NextResponse.json(
        {
          error:
            'The AI Document & Annual Report Ingestion engine is an exclusive Bastion Agency monetization service. Please contact your Bastion account director to convert your PDF reports into interactive web portals.',
        },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    let sampleId: string | undefined;
    let rawText: string | undefined;
    let fileBuffer: Buffer | undefined;
    let siteId: string | undefined;
    let brandKit: any = null;
    let autoSaveAllPages = false;

    // Handle Multipart Form Data (PDF File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      sampleId = formData.get('sampleId') as string | undefined;
      rawText = formData.get('rawText') as string | undefined;
      siteId = formData.get('siteId') as string | undefined;
      autoSaveAllPages = formData.get('autoSaveAllPages') === 'true';

      const upload = formData.get('file');
      if(typeof upload==='string') return NextResponse.json({error:'Upload a PDF file.'},{status:400});
      const file = upload as File | null;
      if (file && file.size > 25_000_000) return NextResponse.json({error:'PDFs must be smaller than 25 MB.'},{status:413});
      if (file && !file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({error:'Upload a PDF file.'},{status:400});
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    }
    // Handle JSON payload
    else {
      const body = await req.json();
      sampleId = body.sampleId;
      rawText = body.rawText;
      siteId = body.siteId;
      brandKit = body.brandKit;
      autoSaveAllPages = Boolean(body.autoSaveAllPages);
    }

    // Attempt to load active site Brand Kit from DB if not provided
    if (!brandKit && siteId) {
      try {
        const db = getDb();
        const brandRes = await db.execute({
          sql: `SELECT * FROM brand_kits WHERE site_id = ? ORDER BY version DESC LIMIT 1`,
          args: [siteId],
        });
        if (brandRes.rows.length > 0) {
          const bRow = brandRes.rows[0];
          brandKit = {
            colors: typeof bRow.colors_json === 'string' ? JSON.parse(bRow.colors_json) : bRow.colors_json,
            typography: typeof bRow.typography_json === 'string' ? JSON.parse(bRow.typography_json) : bRow.typography_json,
          };
        }
      } catch (err) {
        console.warn('[Ingest Document] Could not load brand kit for site:', siteId, err);
      }
    }

    if (rawText && (typeof rawText !== 'string' || rawText.length > 2_000_000)) return NextResponse.json({error:'Report text must be smaller than 2 MB.'},{status:413});
    // Capture versions before parsing. Applying must compare with these versions,
    // rather than silently taking whatever version is current at save time.
    const db = getDb();
    const site = siteId ? (await db.execute({sql:'SELECT id FROM websites WHERE id=? OR slug=? LIMIT 1',args:[siteId,siteId]})).rows[0] : null;
    const captured = site ? (await db.execute({sql:'SELECT page_slug,version FROM page_compositions WHERE site_id=?',args:[site.id]})).rows : [];
    const versions = new Map(captured.map(row=>[String(row.page_slug),Number(row.version)]));
    const result = await ingestCorporateDocument({
      sampleId,
      text: rawText,
      buffer: fileBuffer,
      brandKit,
    });

    result.pages?.forEach(page=>{page.expectedVersion=versions.get(page.pageSlug)||0;});
    let savedPages: any[] = [];
    if (autoSaveAllPages && siteId && result.pages && result.pages.length > 0) {
        savedPages = await saveWebsiteDrafts(
          gate.user,
          siteId,
          result.pages.map((p) => ({
            pageSlug: p.pageSlug,
            title: p.title,
            layoutCollection: p.layoutCollection || 'contemporary',
            sections: p.sections,
            expectedVersion: p.expectedVersion!,
            changeSummary: `AI Report Ingestion: ${result.insights.companyName} (${result.insights.reportingPeriod})`,
          })),
          { allowCreate: true }
        );

    }

    return NextResponse.json({
      ...result,
      savedPages,
    });
  } catch (error: any) {
    if (error instanceof EditorSaveError) return NextResponse.json({error:error.message},{status:error.status});
    console.error('[Ingest Document Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ingest corporate report.' },
      { status: 500 }
    );
  }
}
