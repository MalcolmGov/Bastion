import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const mime = url.searchParams.get('mime') || '';

    const db = getDb();
    let sql = `SELECT * FROM media_assets WHERE 1=1`;
    const args: any[] = [];

    if (mime) {
      sql += ` AND mime_type LIKE ?`;
      args.push(`%${mime}%`);
    }

    if (search) {
      sql += ` AND (LOWER(filename) LIKE ? OR LOWER(alt_text) LIKE ? OR LOWER(caption) LIKE ?)`;
      const q = `%${search.toLowerCase()}%`;
      args.push(q, q, q);
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await db.execute({ sql, args });

    return NextResponse.json({
      count: res.rows.length,
      assets: res.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, alt_text, caption } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const db = getDb();
    await db.execute({
      sql: `UPDATE media_assets SET alt_text = ?, caption = ? WHERE id = ?`,
      args: [alt_text, caption, id]
    });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
