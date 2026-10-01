import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvent, generateIcsContent } from '@/lib/ir/calendarService';
import { getDb } from '@/lib/db/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const event = await getCalendarEvent(id);

    if (!event) {
      return new NextResponse('Calendar event not found', { status: 404 });
    }

    // Resolve client organization name
    const db = getDb();
    const clientRes = await db.execute({
      sql: `SELECT name FROM clients WHERE id = ? LIMIT 1`,
      args: [event.clientId],
    });
    const orgName = clientRes.rows.length > 0 ? String(clientRes.rows[0].name) : 'Bastion Corporate Portal';

    const icsContent = generateIcsContent(event, orgName);
    const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('[API Calendar ICS Error]:', err);
    return new NextResponse('Error generating calendar file', { status: 500 });
  }
}
