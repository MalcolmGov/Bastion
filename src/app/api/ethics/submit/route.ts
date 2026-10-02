import { NextRequest, NextResponse } from 'next/server';
import { createWhistleblowerReport, WhistleblowerCategory, WhistleblowerSeverity } from '@/lib/ethics/ethicsService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      category,
      severity,
      jurisdiction,
      subject,
      details,
      incidentDate,
      involvedParties,
      evidenceLinks,
    } = body;

    if (!category || !subject || !details) {
      return NextResponse.json(
        { error: 'Mandatory fields missing: category, subject, and details are required.' },
        { status: 400 }
      );
    }

    // Default to client_goldfields if not specified by public portal
    const targetClientId = clientId || 'client_goldfields';

    // Strictly NO IP, headers, or user agent stored
    const result = await createWhistleblowerReport({
      clientId: targetClientId,
      category: category as WhistleblowerCategory,
      severity: severity as WhistleblowerSeverity,
      jurisdiction: jurisdiction || 'ZA',
      subject: String(subject).slice(0, 300),
      details: String(details),
      incidentDate: incidentDate ? String(incidentDate) : undefined,
      involvedParties: involvedParties ? String(involvedParties).slice(0, 500) : undefined,
      evidenceLinks: Array.isArray(evidenceLinks) ? evidenceLinks.map(String) : [],
    });

    return NextResponse.json({
      success: true,
      message: 'Confidential report received. Please securely record your Tracking Code and Access Key.',
      trackingCode: result.trackingCode,
      accessKey: result.accessKey,
    });
  } catch (err: any) {
    console.error('[API Ethics Submit Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit report' }, { status: 500 });
  }
}
