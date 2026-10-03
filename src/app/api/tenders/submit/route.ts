import { NextRequest, NextResponse } from 'next/server';
import { submitTenderBid } from '@/lib/tenders/tenderService';
import { rateLimitResponse } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimitResponse(req, 'tender-submit', 10, 3600000);
    if (limited) return limited;
    const body = await req.json();
    const {
      tenderId,
      vendorName,
      cipcRegistrationNumber,
      sarsTaxPin,
      bbbeeLevel,
      hostCommunityRegistered,
      contactName,
      contactEmail,
      contactPhone,
      bidAmount,
      currency,
    } = body;

    if (!tenderId || !vendorName || !cipcRegistrationNumber || !sarsTaxPin || !bbbeeLevel || !contactName || !contactEmail || !contactPhone) {
      return NextResponse.json(
        { error: 'Mandatory fields missing: tenderId, vendorName, CIPC number, SARS PIN, B-BBEE level, and contact details are required.' },
        { status: 400 }
      );
    }

    const submission = await submitTenderBid({
      tenderId: String(tenderId),
      vendorName: String(vendorName),
      cipcRegistrationNumber: String(cipcRegistrationNumber),
      sarsTaxPin: String(sarsTaxPin),
      bbbeeLevel: Number(bbbeeLevel),
      hostCommunityRegistered: Boolean(hostCommunityRegistered),
      contactName: String(contactName),
      contactEmail: String(contactEmail),
      contactPhone: String(contactPhone),
      bidAmount: bidAmount ? Number(bidAmount) : undefined,
      currency: currency || 'ZAR',
    });

    return NextResponse.json({
      success: true,
      message: 'Tender RFP bid successfully submitted.',
      submission,
    });
  } catch (err: any) {
    console.error('[API Tenders Submit Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit tender bid' }, { status: 400 });
  }
}
