import { NextRequest, NextResponse } from 'next/server';
import { runProberCycle } from '@/lib/sre/prober-daemon';
import { readSecret, secretsMatch, tokenFromRequest } from '@/lib/auth/apiToken';

/**
 * Background / Cron Route:
 * Requires CRON_SECRET via Authorization: Bearer or x-cron-secret.
 */
export async function GET(req: NextRequest) {
  const provided = req.headers.get('x-cron-secret') || tokenFromRequest(req, null);
  if (!secretsMatch(provided, readSecret('CRON_SECRET'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runProberCycle();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
  } catch (error: any) {
    console.error('[Prober Cron Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
