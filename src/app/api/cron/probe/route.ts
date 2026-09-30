import { NextResponse } from 'next/server';
import { runProberCycle } from '@/lib/sre/prober-daemon';

/**
 * Background / Cron Route:
 * Can be called periodically by Vercel Cron, Hetzner systemd timer, or internal worker.
 */
export async function GET() {
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

export async function POST() {
  return GET();
}
