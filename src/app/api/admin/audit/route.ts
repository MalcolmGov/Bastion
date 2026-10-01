import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const action = url.searchParams.get('action') || '';

    const db = getDb();
    let sql = `SELECT * FROM audit_log WHERE 1=1`;
    const args: any[] = [];

    if (action) {
      sql += ` AND action LIKE ?`;
      args.push(`%${action}%`);
    }

    if (search) {
      sql += ` AND (LOWER(actor_name) LIKE ? OR LOWER(record_id) LIKE ? OR LOWER(details_json) LIKE ?)`;
      const q = `%${search.toLowerCase()}%`;
      args.push(q, q, q);
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const res = await db.execute({ sql, args });

    return NextResponse.json({
      count: res.rows.length,
      logs: res.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
