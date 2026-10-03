import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser, hasPermission } from '@/lib/auth/auth';
import { clientOwns } from '@/lib/auth/guard';
import crypto from 'node:crypto';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection, id } = await context.params;
    const db = getDb();

    // 1. Fetch record
    const recordRes = await db.execute({
      sql: `
        SELECT r.*, u.name as owner_name, u.email as owner_email
        FROM content_records r
        LEFT JOIN users u ON r.owner_id = u.id
        WHERE r.collection = ? AND r.id = ?
        LIMIT 1
      `,
      args: [collection, id]
    });

    if (recordRes.rows.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = recordRes.rows[0];
    if (!clientOwns(user, record.client_id ? String(record.client_id) : null)) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // 2. Fetch current draft revision
    let draftData = null;
    if (record.current_draft_revision_id) {
      const draftRes = await db.execute({
        sql: `SELECT id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments
              FROM revisions WHERE id = ? LIMIT 1`,
        args: [record.current_draft_revision_id]
      });
      if (draftRes.rows.length > 0) {
        draftData = {
          ...draftRes.rows[0],
          data: JSON.parse(String(draftRes.rows[0].data_json))
        };
      }
    }

    // 3. Fetch current published revision
    let publishedData = null;
    if (record.current_published_revision_id) {
      const pubRes = await db.execute({
        sql: `SELECT id, revision_number, data_json, content_hash, author_id, created_at, status
              FROM revisions WHERE id = ? LIMIT 1`,
        args: [record.current_published_revision_id]
      });
      if (pubRes.rows.length > 0) {
        publishedData = {
          ...pubRes.rows[0],
          data: JSON.parse(String(pubRes.rows[0].data_json))
        };
      }
    }

    // 4. Fetch all revisions list
    const revisionsRes = await db.execute({
      sql: `
        SELECT rev.id, rev.revision_number, rev.content_hash, rev.created_at, rev.status,
               rev.review_comments, u.name as author_name
        FROM revisions rev
        LEFT JOIN users u ON rev.author_id = u.id
        WHERE rev.record_id = ?
        ORDER BY rev.revision_number DESC
      `,
      args: [id]
    });

    // 5. Fetch approvals
    const approvalsRes = await db.execute({
      sql: `
        SELECT a.*, u.name as reviewer_name, u.role as reviewer_role
        FROM approvals a
        JOIN users u ON a.reviewer_id = u.id
        WHERE a.revision_id IN (SELECT id FROM revisions WHERE record_id = ?)
        ORDER BY a.created_at DESC
      `,
      args: [id]
    });

    return NextResponse.json({
      record,
      draft: draftData,
      published: publishedData,
      revisions: revisionsRes.rows,
      approvals: approvalsRes.rows
    });
  } catch (error: any) {
    console.error('Content Item GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(user.role, 'content:edit')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to edit records' }, { status: 403 });
    }

    const { collection, id } = await context.params;
    const body = await req.json();
    const { title, slug, data } = body;

    const db = getDb();
    const now = new Date().toISOString();

    // Verify record exists
    const existingRes = await db.execute({
      sql: `SELECT * FROM content_records WHERE collection = ? AND id = ? LIMIT 1`,
      args: [collection, id]
    });

    if (existingRes.rows.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const existing = existingRes.rows[0];
    if (!clientOwns(user, existing.client_id ? String(existing.client_id) : null)) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // Determine next revision number
    const maxRevRes = await db.execute({
      sql: `SELECT MAX(revision_number) as max_rev FROM revisions WHERE record_id = ?`,
      args: [id]
    });
    const nextRevNum = (Number(maxRevRes.rows[0]?.max_rev) || 1) + 1;
    const newRevId = `rev_${id}_v${nextRevNum}`;

    const dataJson = JSON.stringify(data, null, 2);
    const contentHash = crypto.createHash('sha256').update(dataJson).digest('hex');

    // Insert new draft revision
    await db.execute({
      sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')`,
      args: [newRevId, id, nextRevNum, dataJson, contentHash, user.id, now]
    });

    // Update content_records pointer - edit immediately resets status to draft, invalidating prior approvals
    await db.execute({
      sql: `UPDATE content_records 
            SET title = COALESCE(?, title),
                slug = COALESCE(?, slug),
                current_draft_revision_id = ?,
                status = 'draft',
                updated_at = ?
            WHERE id = ?`,
      args: [title || null, slug || null, newRevId, now, id]
    });

    // Audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, 'CONTENT_UPDATE', ?, ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        user.id,
        user.name,
        collection,
        id,
        JSON.stringify({ revisionNumber: nextRevNum, revisionId: newRevId }),
        `corr_${Date.now()}`,
        req.headers.get('x-forwarded-for') || '127.0.0.1',
        now
      ]
    });

    return NextResponse.json({
      success: true,
      revisionId: newRevId,
      revisionNumber: nextRevNum
    });
  } catch (error: any) {
    console.error('Content Item PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
