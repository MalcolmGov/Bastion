import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db/client';
import { getCurrentUser, hasPermission } from '@/lib/auth/auth';
import { sendReviewNotification } from '@/lib/notifications/notifier';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection, id } = await context.params;
    const body = await req.json();
    const { action, comments, scheduledAt } = body;

    const db = getDb();
    const now = new Date().toISOString();

    // 1. Fetch current record
    const recordRes = await db.execute({
      sql: `SELECT * FROM content_records WHERE collection = ? AND id = ? LIMIT 1`,
      args: [collection, id]
    });

    if (recordRes.rows.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = recordRes.rows[0];
    const draftRevId = String(record.current_draft_revision_id || '');

    // 2. Fetch draft revision details
    const draftRes = await db.execute({
      sql: `SELECT * FROM revisions WHERE id = ? LIMIT 1`,
      args: [draftRevId]
    });
    const draft = draftRes.rows[0];

    // 3. Process action
    let newStatus = record.status;

    switch (action) {
      case 'submit_review': {
        if (!hasPermission(user.role, 'content:edit') && !hasPermission(user.role, 'content:create')) {
          return NextResponse.json({ error: 'Forbidden: Cannot submit for review' }, { status: 403 });
        }
        newStatus = 'in_review';
        await db.execute({
          sql: `UPDATE revisions SET status = 'in_review', review_comments = ? WHERE id = ?`,
          args: [comments || null, draftRevId]
        });

        // Trigger outbound compliance notification alert
        await sendReviewNotification({
          recordTitle: String(record.title),
          collection,
          recordId: id,
          authorName: user.name,
          authorRole: user.role,
          comments
        });
        break;
      }

      case 'request_changes': {
        if (!hasPermission(user.role, 'content:review')) {
          return NextResponse.json({ error: 'Forbidden: Only reviewers can request changes' }, { status: 403 });
        }
        newStatus = 'changes_requested';
        await db.execute({
          sql: `UPDATE revisions SET status = 'changes_requested', review_comments = ? WHERE id = ?`,
          args: [comments || 'Changes requested by reviewer', draftRevId]
        });
        break;
      }

      case 'approve': {
        if (!hasPermission(user.role, 'content:approve')) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions to approve' }, { status: 403 });
        }

        // Two-Person Rule Enforcement for sensitive corporate releases & reports:
        const isSensitive = collection === 'reports' || collection === 'news';
        if (isSensitive && draft && draft.author_id === user.id) {
          return NextResponse.json({
            error: 'Two-Person Rule Violation: Author cannot approve their own financial disclosure or regulatory release.'
          }, { status: 403 });
        }

        // Insert approval record
        const approvalId = `appr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        await db.execute({
          sql: `INSERT INTO approvals (id, revision_id, reviewer_id, decision, comment, created_at)
                VALUES (?, ?, ?, 'approved', ?, ?)`,
          args: [approvalId, draftRevId, user.id, comments || 'Approved for release', now]
        });

        newStatus = 'approved';
        await db.execute({
          sql: `UPDATE revisions SET status = 'approved' WHERE id = ?`,
          args: [draftRevId]
        });
        break;
      }

      case 'publish': {
        if (!hasPermission(user.role, 'content:publish')) {
          return NextResponse.json({ error: 'Forbidden: Only publishers can publish content live' }, { status: 403 });
        }

        // Verify two-person rule for sensitive releases if needed
        const isSensitive = collection === 'reports';
        if (isSensitive) {
          const approvalsCount = await db.execute({
            sql: `SELECT COUNT(*) as c FROM approvals WHERE revision_id = ? AND decision = 'approved'`,
            args: [draftRevId]
          });
          const count = Number(approvalsCount.rows[0]?.c || 0);
          if (count < 1 && user.role !== 'platform_admin') {
            return NextResponse.json({
              error: 'Cannot publish financial report: Formal compliance review approval required before publishing.'
            }, { status: 400 });
          }
        }

        newStatus = 'published';

        // Update revision to published
        await db.execute({
          sql: `UPDATE revisions SET status = 'published' WHERE id = ?`,
          args: [draftRevId]
        });

        // Set record's current_published_revision_id to draftRevId
        await db.execute({
          sql: `UPDATE content_records 
                SET current_published_revision_id = ?,
                    status = 'published',
                    updated_at = ?
                WHERE id = ?`,
          args: [draftRevId, now, id]
        });

        // Invalidate public caches immediately
        try {
          revalidatePath('/');
          revalidatePath('/about');
          revalidatePath('/sustainability');
          revalidatePath('/operations');
          revalidatePath('/reports');
          revalidatePath('/news');
          revalidatePath(`/${collection}`);
          if (record.slug) {
            revalidatePath(`/${record.slug}`);
            revalidatePath(`/${collection}/${record.slug}`);
          }
        } catch (e) {
          console.warn('revalidatePath warning:', e);
        }

        // Outbound Webhook to Bastion's frontend platform
        try {
          const { dispatchContentWebhook } = await import('@/lib/webhooks/dispatcher');
          dispatchContentWebhook({
            event: 'content.published',
            collection,
            id,
            slug: record.slug ? String(record.slug) : undefined,
            title: record.title ? String(record.title) : undefined,
            siteId: record.site_id ? String(record.site_id) : 'site_goldfields_flagship',
            timestamp: now
          }).catch(err => console.error('[Webhook Dispatcher Error]:', err));
        } catch (webhookErr) {
          console.warn('[Webhook Import Warning]:', webhookErr);
        }
        break;
      }

      case 'schedule': {
        if (!hasPermission(user.role, 'content:schedule')) {
          return NextResponse.json({ error: 'Forbidden: Insufficient permissions to schedule' }, { status: 403 });
        }

        if (!scheduledAt) {
          return NextResponse.json({ error: 'Scheduled release timestamp is required' }, { status: 400 });
        }

        newStatus = 'scheduled';

        const jobId = `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        await db.execute({
          sql: `INSERT INTO scheduled_jobs (id, revision_id, publish_at_utc, target_environment, status, scheduled_by_id)
                VALUES (?, ?, ?, 'production', 'pending', ?)`,
          args: [
            jobId,
            draftRevId,
            scheduledAt,
            user.id
          ]
        });
        break;
      }

      case 'archive': {
        if (!hasPermission(user.role, 'content:archive')) {
          return NextResponse.json({ error: 'Forbidden: Cannot archive content' }, { status: 403 });
        }
        newStatus = 'archived';
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown workflow action: ${action}` }, { status: 400 });
    }

    // Update content_records status
    await db.execute({
      sql: `UPDATE content_records SET status = ?, updated_at = ? WHERE id = ?`,
      args: [newStatus, now, id]
    });

    // Audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        user.id,
        user.name,
        `WORKFLOW_${action.toUpperCase()}`,
        collection,
        id,
        JSON.stringify({ previousStatus: record.status, newStatus, comments }),
        `corr_${Date.now()}`,
        req.headers.get('x-forwarded-for') || '127.0.0.1',
        now
      ]
    });

    return NextResponse.json({
      success: true,
      action,
      previousStatus: record.status,
      newStatus
    });
  } catch (error: any) {
    console.error('Workflow error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
