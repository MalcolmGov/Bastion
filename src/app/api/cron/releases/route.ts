import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { readSecret, secretsMatch, tokenFromRequest } from '@/lib/auth/apiToken';
import { publishRelease } from '@/lib/releases/service';
import { assertRecordApproval } from '@/lib/auth/contentApproval';
import { assertPageApproved } from '@/lib/studio/editor/pageApproval';
import { runDueScheduledJobs } from '@/lib/worker/scheduledJobs';
import crypto from 'crypto';

const DEV_DEFAULT_CRON_SECRET = 'bastion_cron_worker_production_key_2026';

/**
 * Scheduling must not be a way around the two-person rule for disclosures, so the branches below
 * re-check approval at the moment of publishing, the same rule publishRelease applies.
 * Why a legacy release must not publish yet: the first page or record item without an independent approval.
 */
async function legacyReleaseRefusal(db: ReturnType<typeof getDb>, items: readonly Record<string, unknown>[]): Promise<string | null> {
  for (const item of items) {
    const itemType = String(item.item_type);
    try {
      if (itemType === 'page' || itemType === 'page_composition') await assertPageApproved(db, String(item.item_id));
      else await assertRecordApproval(db, String(item.item_id));
    } catch (error) {
      return (error as Error).message;
    }
  }
  return null;
}

/**
 * Scheduled Releases Worker:
 * Secure endpoint called periodically by cron to publish scheduled releases and content jobs.
 * Requires CRON_SECRET via x-cron-secret or Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(req: NextRequest) {
  const provided = req.headers.get('x-cron-secret') || tokenFromRequest(req, null);
  const cronSecret = readSecret('CRON_SECRET') || (process.env.NODE_ENV !== 'production' ? (process.env.CRON_SECRET || DEV_DEFAULT_CRON_SECRET) : null);

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

        // All-or-nothing: one unapproved disclosure holds the whole release back, and the next release still runs.
        const refusal = await legacyReleaseRefusal(db, itemsRes.rows);
        if (refusal) {
          console.warn(`[Cron Releases] Release ${releaseId} not published: ${refusal}`);
          continue;
        }

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

    // 1b. Process Scheduled Releases from content_releases table
    try {
      const contentReleasesRes = await db.execute({
        sql: `SELECT id FROM content_releases WHERE status = 'scheduled' AND scheduled_at <= ?`,
        args: [now]
      });

      for (const row of contentReleasesRes.rows) {
        await publishRelease(String(row.id), 'system_cron');
        publishedReleasesCount++;
      }
    } catch (cRelErr) {
      console.warn('[Cron Content Releases] Inspection note:', cRelErr);
    }

    // 2. Process scheduled jobs (the same executor the manual worker uses)
    try {
      const run = await runDueScheduledJobs(db, { id: 'system_cron', name: 'Scheduled Releases Worker' }, now);
      executedJobsCount = run.executed;
    } catch (jobErr) {
      console.warn('[Cron Jobs] Could not process scheduled jobs:', jobErr);
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
