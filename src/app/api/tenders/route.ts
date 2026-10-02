import { NextRequest, NextResponse } from 'next/server';
import { listActiveTenders } from '@/lib/tenders/tenderService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId') || 'client_goldfields';

    const tenders = await listActiveTenders(clientId);
    return NextResponse.json({ success: true, tenders });
  } catch (err: any) {
    console.error('[API Tenders GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to list tenders' }, { status: 500 });
  }
}
