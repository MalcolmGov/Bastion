import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { getCalendarEvent, deleteCalendarEvent } from '@/lib/ir/calendarService';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await context.params;
    const event = await getCalendarEvent(id);

    if (!event) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }

    if (!isAgencyUser(user) && event.clientId !== user.client_id) {
      return NextResponse.json({ error: 'Access denied: Event belongs to another tenant' }, { status: 403 });
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await context.params;
    const event = await getCalendarEvent(id);

    if (!event) {
      return NextResponse.json({ error: 'Calendar event not found' }, { status: 404 });
    }

    if (!isAgencyUser(user) && event.clientId !== user.client_id) {
      return NextResponse.json({ error: 'Access denied: Event belongs to another tenant' }, { status: 403 });
    }

    await deleteCalendarEvent(id, event.clientId);
    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
