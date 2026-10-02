import { NextRequest, NextResponse } from 'next/server';
import { ensureDbReady } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { tenantClause, resolveTargetClientId } from '@/lib/auth/guard';
import fs from 'fs';
import path from 'path';
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
    const folder = url.searchParams.get('folder') || '';
    const sort = url.searchParams.get('sort') || 'newest';

    const db = await ensureDbReady();
    const targetClientId = resolveTargetClientId(user, req);
    const scope = tenantClause(user, 'client_id', targetClientId);
    let sql = `SELECT * FROM media_assets WHERE 1=1${scope.sql}`;
    const args: any[] = [...scope.args];

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

    // Sort options
    switch (sort) {
      case 'oldest':
        sql += ` ORDER BY created_at ASC`;
        break;
      case 'name_asc':
        sql += ` ORDER BY filename ASC`;
        break;
      case 'name_desc':
        sql += ` ORDER BY filename DESC`;
        break;
      case 'size_desc':
        sql += ` ORDER BY size_bytes DESC`;
        break;
      case 'size_asc':
        sql += ` ORDER BY size_bytes ASC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY created_at DESC`;
        break;
    }

    const res = await db.execute({ sql, args });

    // Also fetch folder counts for the active client
    const folderCountsRes = await db.execute({
      sql: `SELECT folder_id, COUNT(*) as count FROM media_assets WHERE 1=1${scope.sql} GROUP BY folder_id`,
      args: scope.args
    });

    const folderCounts: Record<string, number> = {};
    for (const row of folderCountsRes.rows) {
      if (row.folder_id) {
        folderCounts[String(row.folder_id)] = Number(row.count) || 0;
      }
    }

    // Also fetch custom folder records if any
    const foldersRes = await db.execute({
      sql: `SELECT * FROM media_folders WHERE 1=1${scope.sql} ORDER BY name ASC`,
      args: scope.args
    });

    return NextResponse.json({
      count: res.rows.length,
      assets: res.rows,
      folders: foldersRes.rows,
      folderCounts
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    let ids: string[] = [];
    const singleId = url.searchParams.get('id');

    if (singleId) {
      ids = [singleId];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body.ids)) {
          ids = body.ids;
        } else if (body.id) {
          ids = [body.id];
        }
      } catch (_) {}
    }

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Asset ID or ids array is required' }, { status: 400 });
    }

    const db = await ensureDbReady();
    const targetClientId = resolveTargetClientId(user, req);
    const scope = tenantClause(user, 'client_id', targetClientId);

    let deletedCount = 0;
    const deletedFilenames: string[] = [];

    for (const assetId of ids) {
      const checkRes = await db.execute({
        sql: `SELECT id, filename, url FROM media_assets WHERE id = ?${scope.sql} LIMIT 1`,
        args: [assetId, ...scope.args]
      });

      if (checkRes.rows.length === 0) continue;
      const asset = checkRes.rows[0];

      // Remove from database
      await db.execute({
        sql: `DELETE FROM media_assets WHERE id = ?`,
        args: [assetId]
      });

      deletedCount++;
      deletedFilenames.push(String(asset.filename));

      // Attempt to clean up physical file from public/assets if local
      try {
        if (asset.url && typeof asset.url === 'string' && asset.url.startsWith('/assets/')) {
          const safeFilename = path.basename(String(asset.url));
          const localPath = path.join(process.cwd(), 'public/assets', safeFilename);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        }
      } catch (e) {
        console.warn('Physical file deletion warning:', e);
      }

      // Audit log entry
      try {
        await db.execute({
          sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
                VALUES (?, ?, ?, 'MEDIA_DELETE', 'media_assets', ?, 'success', ?, ?, ?, ?)`,
          args: [
            `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            user.id,
            user.name,
            assetId,
            JSON.stringify({ filename: asset.filename, url: asset.url }),
            `corr_${Date.now()}`,
            req.headers.get('x-forwarded-for') || '127.0.0.1',
            new Date().toISOString()
          ]
        });
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      deletedFilenames
    });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
