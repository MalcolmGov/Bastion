import { NextRequest, NextResponse } from 'next/server';
import {
  getWhistleblowerCaseByTrackingCode,
  addWhistleblowerMessage,
} from '@/lib/ethics/ethicsService';

import { rateLimitResponse } from '@/lib/security/rateLimiter';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimitResponse(req, 'ethics-message', 10, 900000);
    if (limited) return limited;
    const body = await req.json();
    const { trackingCode, accessKey, message } = body;

    if (!trackingCode || !accessKey || !message || !String(message).trim()) {
      return NextResponse.json(
        { error: 'Tracking Code, Access Key, and a non-empty message are required.' },
        { status: 400 }
      );
    }

    // Authenticate whistleblower access
    const verifiedCase = await getWhistleblowerCaseByTrackingCode(
      String(trackingCode),
      String(accessKey)
    );

    if (!verifiedCase) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid tracking credentials.' },
        { status: 401 }
      );
    }

    const created = await addWhistleblowerMessage({
      reportId: verifiedCase.report.id,
      senderType: 'whistleblower',
      messageText: String(message).trim(),
    });

    return NextResponse.json({
      success: true,
      message: created,
    });
  } catch (err: any) {
    console.error('[API Ethics Message Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 500 });
  }
}
