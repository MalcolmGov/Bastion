import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveTickerQuotes } from '@/lib/ir/liveFeeds';

export const revalidate = 60; // Cache 60 seconds

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('tickers');
    const tickers = symbolsParam
      ? symbolsParam.split(',').map((s) => s.trim())
      : ['GFI', 'VOD', 'AGL', 'TRU'];

    const quotes = await fetchLiveTickerQuotes(tickers);

    return NextResponse.json({
      success: true,
      quotes,
      exchange: 'Johannesburg Stock Exchange (JSE)',
      currency: 'ZAR',
      marketStatus: 'Open / Regular Hours (09:00 - 17:00 SAST)',
      dataCost: 'R0.00 ($0.00) - Open Exchange Feed',
    });
  } catch (error: any) {
    console.error('Error fetching live quotes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quotes' }, { status: 500 });
  }
}
