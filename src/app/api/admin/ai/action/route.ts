import { NextRequest, NextResponse } from 'next/server';
import { getActiveModelProvider } from '@/lib/studio/aiAssistant';
import { requireUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const provider = getActiveModelProvider();
    const response = await provider.execute(body);
    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
