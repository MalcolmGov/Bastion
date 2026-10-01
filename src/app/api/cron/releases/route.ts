import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { readSecret, secretsMatch, tokenFromRequest } from '@/lib/auth/apiToken';
import crypto from 'crypto';

/**
 * Scheduled Releases Worker:
 * Secure endpoint called periodically by cron to publish scheduled releases and content jobs.
 * Requires CRON_SECRET via x-cron-secret or Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get('x-cron-secret') || tokenFromRequest(req, null);
  const cronSecret = readSecret('CRON_SECRET');

  if (!secretsMatch(provided, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET' }, { status: 401 });
  }

  try {
    const db = getDb();
    const now = new Date().toISOString();
    let publishedReleasesCount = 0;
    let executedJobsCount = 0;

    // 1. Process Scheduled Releases from releases table
    try {
      const releasesRes = await db.execute({
        sql: `SELECT id, name, client_id, scheduled_at FROM releases WHERE status = 'scheduled' AND scheduled_at <= ?`,
        args: [now]
      });

      for (const row of releasesRes.rows) {
        const releaseId = String(row.id);
        const releaseName = String(row.name);
        const clientId = row.client_id ? String(row.client_id) : 'client_goldfields';

        // Fetch release items
        const itemsRes = await db.execute({
          sql: `SELECT item_type, item_id, action FROM release_items WHERE release_id = ?`,
          args: [releaseId]
        });

        for (const item of itemsRes.rows) {
          const itemType = String(item.item_type);
          const itemId = String(item.item_id);

          if (itemType === 'page' || itemType === 'page_composition') {
            await db.execute({
              sql: `UPDATE page_compositions SET status = 'published', updated_at = ? WHERE id = ?`,
              args: [now, itemId]
            });
          } else {
            // Standard content record: promote draft revision to published
            await db.execute({
              sql: `
                UPDATE content_records
                SET current_published_revision_id = COALESCE(current_draft_revision_id, current_published_revision_id),
                    status = 'published',
                    updated_at = ?
                WHERE id = ?
              `,
              args: [now, itemId]
            });
          }
        }

        // Mark release as published
        await db.execute({
          sql: `UPDATE releases SET status = 'published', published_at = ? WHERE id = ?`,
          args: [now, releaseId]
        });

        // Audit log
        await db.execute({
          sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
                VALUES (?, 'system_cron', 'Scheduled Releases Worker', 'RELEASE_PUBLISH', 'releases', ?, 'success', ?, ?, '127.0.0.1', ?)`,
          args: [
            `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            releaseId,
            JSON.stringify({ releaseName, clientId, itemCount: itemsRes.rows.length, publishedAt: now }),
            `corr_cron_${Date.now()}`,
            now
          ]
        });

        publishedReleasesCount++;
      }
    } catch (relErr) {
      console.warn('[Cron Releases] Table inspection note:', relErr);
    }

    // 2. Process Scheduled Jobs from scheduled_jobs table
    try {
      const jobsRes = await db.execute({
        sql: `SELECT id, record_id, revision_id FROM scheduled_jobs WHERE status = 'pending' AND scheduled_for <= ?`,
        args: [now]
      });

      for (const job of jobsRes.rows) {
        const jobId = String(job.id);
        const recordId = String(job.record_id);
        const revisionId = String(job.revision_id);

        await db.execute({
          sql: `UPDATE content_records SET current_published_revision_id = ?, status = 'published', updated_at = ? WHERE id = ?`,
          args: [revisionId, now, recordId]
        });

        await db.execute({
          sql: `UPDATE revisions SET status = 'published' WHERE id = ?`,
          args: [revisionId]
        });

        await db.execute({
          sql: `UPDATE scheduled_jobs SET status = 'executed', executed_at = ? WHERE id = ?`,
          args: [now, jobId]
        });

        executedJobsCount++;
      }
    } catch (jobErr) {
      console.warn('[Cron Jobs] Table inspection note:', jobErr);
    }

    return NextResponse.json({
      success: true,
      publishedReleases: publishedReleasesCount,
      executedJobs: executedJobsCount,
      executedAt: now
    });
  } catch (err: any) {
    console.error('[Cron Releases Worker Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
