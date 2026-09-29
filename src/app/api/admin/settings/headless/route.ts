import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import crypto from 'crypto';
import { dispatchContentWebhook } from '@/lib/webhooks/dispatcher';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId') || 'site_goldfields_flagship';
    const db = getDb();

    // 1. Fetch site settings
    const siteRes = await db.execute({
      sql: `SELECT id, name, slug, settings_json FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, siteId],
    });

    if (siteRes.rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const row = siteRes.rows[0];
    const settings = typeof row.settings_json === 'string' ? JSON.parse(row.settings_json) : (row.settings_json || {});
    const headless = settings.headlessIntegration || {
      apiKey: 'sec_goldfields_bastion_2026_live',
      webhookUrl: 'https://goldfields.com/api/webhooks/cms-update',
      webhookSecret: 'whsec_bastion_goldfields_2026',
      previewUrlPattern: 'https://preview.goldfields.com/{slug}?preview=true',
      previewSecret: 'prev_sec_goldfields_draft_2026',
    };

    // 2. Fetch recent webhook deliveries
    let deliveries: any[] = [];
    try {
      const delivRes = await db.execute({
        sql: `SELECT * FROM webhook_deliveries WHERE site_id = ? ORDER BY created_at DESC LIMIT 10`,
        args: [String(row.id)],
      });
      deliveries = delivRes.rows.map((d: any) => ({
        id: String(d.id),
        event: String(d.event),
        targetUrl: String(d.target_url),
        responseStatus: Number(d.response_status),
        latencyMs: Number(d.latency_ms),
        status: String(d.status),
        createdAt: String(d.created_at),
      }));
    } catch (e) {
      // Table might be fresh
    }

    return NextResponse.json({
      siteId: String(row.id),
      siteName: String(row.name),
      siteSlug: String(row.slug),
      headless,
      recentDeliveries: deliveries,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'save', siteId = 'site_goldfields_flagship', headless } = body;
    const db = getDb();
    const now = new Date().toISOString();

    // 1. Fetch existing settings
    const siteRes = await db.execute({
      sql: `SELECT id, settings_json FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, siteId],
    });

    if (siteRes.rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const currentSiteId = String(siteRes.rows[0].id);
    const rawSettings = siteRes.rows[0].settings_json;
    const settings = typeof rawSettings === 'string' ? JSON.parse(rawSettings) : (rawSettings || {});

    // Action A: Send Test Ping
    if (action === 'ping') {
      const pingResult = await dispatchContentWebhook({
        event: 'content.published',
        collection: 'test_ping',
        id: `ping_${Date.now()}`,
        slug: 'webhook-test-connection',
        title: 'Bastion Connection Verification Ping',
        siteId: currentSiteId,
        timestamp: now,
      });

      return NextResponse.json({
        success: pingResult.success,
        status: pingResult.status || (pingResult.success ? 200 : 500),
        latencyMs: pingResult.latencyMs,
        deliveryId: pingResult.deliveryId,
        error: pingResult.error,
      });
    }

    // Action B: Save Settings
    settings.headlessIntegration = {
      apiKey: headless.apiKey || 'sec_goldfields_bastion_2026_live',
      webhookUrl: headless.webhookUrl || '',
      webhookSecret: headless.webhookSecret || 'whsec_bastion_goldfields_2026',
      previewUrlPattern: headless.previewUrlPattern || '',
      previewSecret: headless.previewSecret || 'prev_sec_goldfields_draft_2026',
      updatedAt: now,
    };

    await db.execute({
      sql: `UPDATE websites SET settings_json = ?, updated_at = ? WHERE id = ?`,
      args: [JSON.stringify(settings), now, currentSiteId],
    });

    // Record audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'usr_admin',
        'Bastion Administrator',
        'headless_settings_update',
        'websites',
        currentSiteId,
        'success',
        now,
      ],
    });

    return NextResponse.json({ success: true, savedAt: now, headless: settings.headlessIntegration });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
