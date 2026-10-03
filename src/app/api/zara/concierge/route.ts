import { NextRequest, NextResponse } from 'next/server';
import { zaraBridge, ZaraMessage } from '@/lib/zara/bridgeClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message = '',
      history = [],
      clientContext = 'Gold Fields',
      clientId = 'client_goldfields'
    } = body;

    const response = await zaraBridge.processMessage(
      message,
      history as ZaraMessage[],
      {
        portalViewMode: 'public',
        clientName: clientContext,
        clientId,
        userName: 'Visitor',
        userRole: 'public_stakeholder'
      }
    );

    return NextResponse.json({
      success: true,
      ...response
    });
  } catch (error: any) {
    console.error('[Zara Public Concierge API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        reply: `Welcome to Gold Fields. I am having a temporary issue retrieving that corporate disclosure. Please refer to our Investor Relations portal or try again in a moment.`,
        speechText: "Welcome to Gold Fields. Please refer to our Investor Relations portal.",
        toolsExecuted: []
      },
      { status: 500 }
    );
  }
}
