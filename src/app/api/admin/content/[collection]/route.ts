import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser, hasPermission } from '@/lib/auth/auth';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection } = await context.params;
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const db = getDb();
    let sql = `
      SELECT r.id, r.collection, r.slug, r.title, r.status, r.current_published_revision_id,
             r.current_draft_revision_id, r.owner_id, r.created_at, r.updated_at,
             u.name as owner_name
      FROM content_records r
      LEFT JOIN users u ON r.owner_id = u.id
      WHERE r.collection = ?
    `;
    const args: any[] = [collection];

    if (status) {
      sql += ` AND r.status = ?`;
      args.push(status);
    }

    if (search) {
      sql += ` AND (LOWER(r.title) LIKE ? OR LOWER(r.slug) LIKE ?)`;
      args.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ` ORDER BY r.updated_at DESC`;

    const res = await db.execute({ sql, args });

    return NextResponse.json({
      collection,
      count: res.rows.length,
      records: res.rows
    });
  } catch (error: any) {
    console.error('Content GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(user.role, 'content:create')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to create records' }, { status: 403 });
    }

    const { collection } = await context.params;
    const body = await req.json();
    const { slug, title, data } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const db = getDb();
    const cleanSlug = String(slug).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const recordId = `${collection}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const revId = `rev_${recordId}_v1`;
    const now = new Date().toISOString();

    const dataJson = JSON.stringify(data || {}, null, 2);
    const contentHash = crypto.createHash('sha256').update(dataJson).digest('hex');

    // 1. Insert record in draft status
    await db.execute({
      sql: `INSERT INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'draft', NULL, ?, ?, ?, ?)`,
      args: [recordId, collection, cleanSlug, title, revId, user.id, now, now]
    });

    // 2. Insert initial draft revision
    await db.execute({
      sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status)
            VALUES (?, ?, 1, ?, ?, ?, ?, 'draft')`,
      args: [revId, recordId, dataJson, contentHash, user.id, now]
    });

    // 3. Audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, 'CONTENT_CREATE', ?, ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        user.id,
        user.name,
        collection,
        recordId,
        JSON.stringify({ title, slug: cleanSlug }),
        `corr_${Date.now()}`,
        req.headers.get('x-forwarded-for') || '127.0.0.1',
        now
      ]
    });

    return NextResponse.json({
      success: true,
      id: recordId,
      slug: cleanSlug,
      revisionId: revId
    });
  } catch (error: any) {
    console.error('Content POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
