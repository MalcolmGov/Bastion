import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveSensWire } from '@/lib/ir/liveFeeds';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker') || undefined;
    const limit = parseInt(searchParams.get('limit') || '35', 10);

    const wireItems = await fetchLiveSensWire({ ticker, limit });

    return NextResponse.json({
      success: true,
      wireItems,
      total: wireItems.length,
      exchange: 'JSE Stock Exchange News Service (SENS)',
      source: 'Open Regulatory Distribution Wire',
      licensingCost: 'R0.00 / Zero Additional Cost',
    });
  } catch (error: any) {
    console.error('Error fetching live wire:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch live wire' }, { status: 500 });
  }
}
