import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { listCalendarEvents, createCalendarEvent, CalendarEventType } from '@/lib/ir/calendarService';
import { getDb } from '@/lib/db/client';
import crypto from 'node:crypto';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const url = new URL(req.url);
    const requestedClient = url.searchParams.get('clientId');
    const type = url.searchParams.get('type') || undefined;
    const upcomingOnly = url.searchParams.get('upcoming') === 'true';

    const targetClientId = (isAgencyUser(user) && requestedClient ? requestedClient : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }

    const events = await listCalendarEvents(targetClientId, {
      type,
      upcomingOnly,
    });

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error('[API Calendar GET Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const {
      title,
      eventType,
      eventDate,
      timeSast,
      location,
      webcastUrl,
      description,
      dividendRateCents,
      dividendCurrency,
      dwtApplicable,
      clientId,
      siteId,
    } = body;

    if (!title || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title and eventDate are mandatory' },
        { status: 400 }
      );
    }

    const targetClientId = (isAgencyUser(user) && clientId ? clientId : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }
    const targetSiteId = siteId || `site_${targetClientId.replace('client_', '')}`;

    const event = await createCalendarEvent({
      clientId: targetClientId,
      siteId: targetSiteId,
      title,
      eventType: eventType as CalendarEventType,
      eventDate,
      timeSast,
      location,
      webcastUrl,
      description,
      dividendRateCents: dividendRateCents ? Number(dividendRateCents) : undefined,
      dividendCurrency,
      dwtApplicable,
    });

    // Write to audit log
    try {
      const db = getDb();
      const now = new Date().toISOString();
      await db.execute({
        sql: `
          INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, client_id, site_id, created_at)
          VALUES (?, ?, ?, 'CALENDAR_EVENT_CREATE', 'financial_calendar_events', ?, 'success', ?, ?, ?, ?)
        `,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          user.id,
          user.name || 'Editor',
          event.id,
          JSON.stringify({ title: event.title, eventDate: event.eventDate, eventType: event.eventType }),
          targetClientId,
          targetSiteId,
          now,
        ],
      });
    } catch (auditErr) {
      console.warn('[Audit Log] Notice recording event creation:', auditErr);
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error('[API Calendar POST Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
