import { NextRequest, NextResponse } from 'next/server';
import {
  getWhistleblowerCaseByTrackingCode,
  addWhistleblowerMessage,
} from '@/lib/ethics/ethicsService';

import { checkRateLimit } from '@/lib/security/rateLimiter';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
    const limited = checkRateLimit(`ethics-message:${ip}`, 10, 900000);
    if (!limited.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } }
      );
    }
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
