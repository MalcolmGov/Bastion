import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { zaraBridge, ZaraMessage } from '@/lib/zara/bridgeClient';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const {
      message = '',
      history = [],
      clientContext = 'Gold Fields',
      clientId = 'client_goldfields',
      portalViewMode = 'agency',
      userName = 'Malcolm',
      userRole = 'platform_admin'
    } = body;

    const response = await zaraBridge.processMessage(
      message,
      history as ZaraMessage[],
      {
        portalViewMode: portalViewMode as any,
        clientName: clientContext,
        clientId,
        userName: gate.user?.name ? gate.user.name.split(' ')[0] : userName,
        userRole: gate.user?.role || userRole
      }
    );

    return NextResponse.json({
      success: true,
      ...response
    });
  } catch (error: any) {
    console.error('[Zara Admin Agent API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        reply: `Apologies, I encountered an internal error processing your request: ${error.message}`,
        speechText: "I encountered an error processing your request.",
        toolsExecuted: []
      },
      { status: 500 }
    );
  }
}
