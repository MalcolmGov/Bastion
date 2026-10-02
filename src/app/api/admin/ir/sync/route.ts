import { NextRequest, NextResponse } from 'next/server';
import { syncSensWireToDatabase } from '@/lib/ir/liveFeeds';
import { requireUser, clientOwns } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { clientId, siteId, ticker } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }
    if (!clientOwns(gate.user, clientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine default ticker based on client if not explicitly provided
    let jseTicker = ticker;
    if (!jseTicker) {
      if (clientId.includes('vodacom')) {
        jseTicker = 'VOD';
      } else if (clientId.includes('goldfields')) {
        jseTicker = 'GFI';
      } else {
        jseTicker = 'GFI';
      }
    }

    const result = await syncSensWireToDatabase(
      clientId,
      siteId || 'site_bastion_primary',
      jseTicker
    );

    return NextResponse.json({
      success: true,
      ticker: jseTicker,
      syncedCount: result.syncedCount,
      totalLiveFound: result.totalLiveFound,
      message: `Successfully synchronized ${result.syncedCount} new authentic JSE SENS filings for ${jseTicker} at $0 licensing cost.`,
    });
  } catch (error: any) {
    console.error('Error syncing live SENS wire:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync live SENS wire' }, { status: 500 });
  }
}
