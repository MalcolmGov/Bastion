import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { requireAgencyUser } from '@/lib/auth/guard';

function escapeCsvField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const res = await db.execute(`
      SELECT id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at
      FROM audit_log
      ORDER BY created_at DESC
    `);

    const headers = [
      'Timestamp (UTC)',
      'Event ID',
      'Actor ID',
      'Actor Name',
      'Action Type',
      'Target Collection',
      'Record ID',
      'Result',
      'Details / Payload',
      'Correlation ID',
      'IP Address'
    ];

    const rows = res.rows.map(r => [
      escapeCsvField(r.created_at),
      escapeCsvField(r.id),
      escapeCsvField(r.actor_id),
      escapeCsvField(r.actor_name),
      escapeCsvField(r.action),
      escapeCsvField(r.collection),
      escapeCsvField(r.record_id),
      escapeCsvField(r.result),
      escapeCsvField(r.details_json),
      escapeCsvField(r.correlation_id),
      escapeCsvField(r.ip_address)
    ].join(','));

    const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="goldfields-audit-trail-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
