import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import {
  listWhistleblowerReports,
  addWhistleblowerMessage,
} from '@/lib/ethics/ethicsService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const url = new URL(req.url);
    const requestedClient = url.searchParams.get('clientId');
    const targetClientId = (isAgencyUser(user) && requestedClient ? requestedClient : user.client_id) || '';

    const reports = await listWhistleblowerReports(targetClientId || null);

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error('[API Admin Ethics GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to list reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const { reportId, message } = body;

    if (!reportId || !message || !String(message).trim()) {
      return NextResponse.json(
        { error: 'reportId and non-empty message are required.' },
        { status: 400 }
      );
    }

    const created = await addWhistleblowerMessage({
      reportId: String(reportId),
      senderType: 'investigator',
      senderId: user.id,
      messageText: String(message).trim(),
    });

    return NextResponse.json({ success: true, message: created });
  } catch (err: any) {
    console.error('[API Admin Ethics POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 500 });
  }
}
