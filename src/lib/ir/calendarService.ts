import { ensureDbReady } from '@/lib/db/client';
import crypto from 'node:crypto';
import type { CalendarEventType, FinancialCalendarEvent } from './types';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, calculateDividendTax } from './types';

export type { CalendarEventType, FinancialCalendarEvent };
export { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, calculateDividendTax };

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string.
 * Imports directly into Google Calendar, Microsoft Outlook, and Apple Calendar.
 */
export function generateIcsContent(event: FinancialCalendarEvent, organization = 'Bastion Group'): string {
  // Format date to YYYYMMDD
  const cleanDate = event.eventDate.replace(/-/g, '');
  const dtStart = `${cleanDate}T080000Z`;
  const dtEnd = `${cleanDate}T093000Z`;
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `${event.title} - ${organization}`;
  const desc = [
    event.description || event.title,
    event.webcastUrl ? `Webcast Link: ${event.webcastUrl}` : '',
    event.dividendRateCents ? `Dividend: ${event.dividendRateCents} SA cents per share` : '',
    `Time: ${event.timeSast}`,
    `Corporate Governance Portal: Bastion Move Studio`,
  ].filter(Boolean).join('\\n\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bastion Move Studio//Investor Relations Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@bastiongroup.co.za`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${event.location || 'Johannesburg, South Africa & Live Global Webcast'}`,
    event.webcastUrl ? `URL:${event.webcastUrl}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${event.title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export async function listCalendarEvents(
  clientId: string,
  params?: {
    upcomingOnly?: boolean;
    type?: string;
  }
): Promise<FinancialCalendarEvent[]> {
  const db = await ensureDbReady();
  let sql = 'SELECT * FROM financial_calendar_events WHERE client_id = ?';
  const args: any[] = [clientId];

  if (params?.type && params.type !== 'all') {
    sql += ' AND event_type = ?';
    args.push(params.type);
  }

  if (params?.upcomingOnly) {
    const today = new Date().toISOString().split('T')[0];
    sql += ' AND event_date >= ?';
    args.push(today);
  }

  sql += ' ORDER BY event_date ASC';

  const res = await db.execute({ sql, args });
  return res.rows.map(mapCalendarRow);
}

export async function getCalendarEvent(id: string, clientId?: string): Promise<FinancialCalendarEvent | null> {
  const db = await ensureDbReady();
  let sql = 'SELECT * FROM financial_calendar_events WHERE id = ?';
  const args: any[] = [id];

  if (clientId) {
    sql += ' AND client_id = ?';
    args.push(clientId);
  }

  const res = await db.execute({ sql, args });
  if (res.rows.length === 0) return null;
  return mapCalendarRow(res.rows[0]);
}

export async function createCalendarEvent(data: {
  clientId: string;
  siteId: string;
  title: string;
  eventType?: CalendarEventType;
  eventDate: string;
  timeSast?: string;
  location?: string;
  webcastUrl?: string;
  description?: string;
  dividendRateCents?: number;
  dividendCurrency?: string;
  dwtApplicable?: boolean;
}): Promise<FinancialCalendarEvent> {
  const db = await ensureDbReady();
  const id = `ev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  const event: FinancialCalendarEvent = {
    id,
    clientId: data.clientId,
    siteId: data.siteId,
    title: data.title.trim(),
    eventType: data.eventType || 'results_announcement',
    eventDate: data.eventDate,
    timeSast: data.timeSast || '10:00 SAST',
    location: data.location || 'Johannesburg & Virtual Webcast',
    webcastUrl: data.webcastUrl,
    description: data.description,
    dividendRateCents: data.dividendRateCents,
    dividendCurrency: data.dividendCurrency || 'ZAR',
    dwtApplicable: data.dwtApplicable !== undefined ? data.dwtApplicable : true,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.execute({
    sql: `
      INSERT INTO financial_calendar_events (
        id, client_id, site_id, title, event_type, event_date, time_sast,
        location, webcast_url, description, dividend_rate_cents, dividend_currency,
        dwt_applicable, is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `,
    args: [
      event.id,
      event.clientId,
      event.siteId,
      event.title,
      event.eventType,
      event.eventDate,
      event.timeSast,
      event.location || null,
      event.webcastUrl || null,
      event.description || null,
      event.dividendRateCents !== undefined ? event.dividendRateCents : null,
      event.dividendCurrency,
      event.dwtApplicable ? 1 : 0,
      event.createdAt,
      event.updatedAt,
    ],
  });

  return event;
}

export async function deleteCalendarEvent(id: string, clientId: string): Promise<boolean> {
  const db = await ensureDbReady();
  const res = await db.execute({
    sql: `DELETE FROM financial_calendar_events WHERE id = ? AND client_id = ?`,
    args: [id, clientId],
  });
  return (res.rowsAffected || 0) > 0;
}

function mapCalendarRow(row: any): FinancialCalendarEvent {
  return {
    id: String(row.id),
    clientId: String(row.client_id),
    siteId: String(row.site_id),
    title: String(row.title),
    eventType: (row.event_type as CalendarEventType) || 'results_announcement',
    eventDate: String(row.event_date),
    timeSast: String(row.time_sast || '10:00 SAST'),
    location: row.location ? String(row.location) : undefined,
    webcastUrl: row.webcast_url ? String(row.webcast_url) : undefined,
    description: row.description ? String(row.description) : undefined,
    dividendRateCents: row.dividend_rate_cents !== null && row.dividend_rate_cents !== undefined ? Number(row.dividend_rate_cents) : undefined,
    dividendCurrency: String(row.dividend_currency || 'ZAR'),
    dwtApplicable: Number(row.dwt_applicable) === 1,
    isCompleted: Number(row.is_completed) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
