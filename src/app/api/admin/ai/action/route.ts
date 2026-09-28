import { NextRequest, NextResponse } from 'next/server';
import { getActiveModelProvider } from '@/lib/studio/aiAssistant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = getActiveModelProvider();
    const response = await provider.execute(body);
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
