import { NextRequest, NextResponse } from 'next/server';
import { getWhistleblowerCaseByTrackingCode } from '@/lib/ethics/ethicsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackingCode, accessKey } = body;

    if (!trackingCode || !accessKey) {
      return NextResponse.json(
        { error: 'Tracking Code and Access Key are both required.' },
        { status: 400 }
      );
    }

    const result = await getWhistleblowerCaseByTrackingCode(
      String(trackingCode),
      String(accessKey)
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid Tracking Code or Access Key. Please check your credentials.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report: result.report,
      messages: result.messages,
    });
  } catch (err: any) {
    console.error('[API Ethics Track Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to track report' }, { status: 500 });
  }
}
