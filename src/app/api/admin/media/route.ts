import { NextRequest, NextResponse } from 'next/server';
import { ensureDbReady } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const mime = url.searchParams.get('mime') || '';
    const folder = url.searchParams.get('folder') || '';

    const db = await ensureDbReady();
    let sql = `SELECT * FROM media_assets WHERE 1=1`;
    const args: any[] = [];

    if (mime && mime !== 'all') {
      sql += ` AND mime_type LIKE ?`;
      args.push(`%${mime}%`);
    }

    if (folder && folder !== 'all') {
      sql += ` AND folder_id = ?`;
      args.push(folder);
    }

    if (search) {
      sql += ` AND (LOWER(filename) LIKE ? OR LOWER(alt_text) LIKE ? OR LOWER(caption) LIKE ?)`;
      const q = `%${search.toLowerCase()}%`;
      args.push(q, q, q);
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await db.execute({ sql, args });

    // Also fetch folders
    const foldersRes = await db.execute(`SELECT * FROM media_folders ORDER BY name ASC`);

    return NextResponse.json({
      count: res.rows.length,
      assets: res.rows,
      folders: foldersRes.rows
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
    const { id, alt_text, caption, focal_x, focal_y, folder_id, hotspot_data_json } = body;

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    const db = await ensureDbReady();
    const updates: string[] = [];
    const args: any[] = [];

    if (alt_text !== undefined) {
      updates.push('alt_text = ?');
      args.push(alt_text);
    }
    if (caption !== undefined) {
      updates.push('caption = ?');
      args.push(caption);
    }
    if (focal_x !== undefined) {
      updates.push('focal_x = ?');
      args.push(Number(focal_x));
    }
    if (focal_y !== undefined) {
      updates.push('focal_y = ?');
      args.push(Number(focal_y));
    }
    if (folder_id !== undefined) {
      updates.push('folder_id = ?');
      args.push(folder_id);
    }
    const hotspotData = hotspot_data_json !== undefined ? hotspot_data_json : body.hotspot_data;
    if (hotspotData !== undefined) {
      updates.push('hotspot_data_json = ?');
      args.push(typeof hotspotData === 'string' ? hotspotData : JSON.stringify(hotspotData));
    }

    if (updates.length > 0) {
      args.push(id);
      await db.execute({
        sql: `UPDATE media_assets SET ${updates.join(', ')} WHERE id = ?`,
        args
      });
    }

    const updatedRes = await db.execute({
      sql: `SELECT * FROM media_assets WHERE id = ? LIMIT 1`,
      args: [id]
    });

    return NextResponse.json({
      success: true,
      id,
      asset: updatedRes.rows[0] || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PATCH = PUT;
