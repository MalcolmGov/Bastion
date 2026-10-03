import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import crypto from 'node:crypto';
import { dispatchContentWebhook } from '@/lib/webhooks/dispatcher';
import { requireAgencyUser } from '@/lib/auth/guard';
import { isPublicDemoSecret } from '@/lib/auth/apiToken';

const SECRET_FIELDS = ['webhookSecret', 'previewSecret'] as const;
const SECRET_LABELS: Record<(typeof SECRET_FIELDS)[number], string> = {
  webhookSecret: 'The webhook secret',
  previewSecret: 'The draft verification token',
};
const MIN_SECRET_LENGTH = 16;

/**
 * Why a secret may not be saved, or null. A demo value from the source code is never accepted. A new secret has to be
 * long enough; one that has not changed is left alone, so re-saving other fields never forces a rotation.
 */
function secretProblem(field: (typeof SECRET_FIELDS)[number], value: string, previous: unknown): string | null {
  if (!value) return null;
  if (isPublicDemoSecret(value)) {
    return `${SECRET_LABELS[field]} is a public demo value that appears in the source code, so anyone could forge it. Use Generate to create a new one.`;
  }
  if (value !== previous && value.length < MIN_SECRET_LENGTH) {
    return `${SECRET_LABELS[field]} must be at least ${MIN_SECRET_LENGTH} characters. Use Generate to create one.`;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
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
    const headless = {
      apiKey: '',
      webhookUrl: '',
      webhookSecret: '',
      previewUrlPattern: '',
      previewSecret: '',
      ...settings.headlessIntegration,
    };
    // A demo secret saved by an earlier version of this page is not a real setting: report it, never hand it back as a value.
    const unsafeSecrets = SECRET_FIELDS.filter((field) => isPublicDemoSecret(headless[field]));
    for (const field of unsafeSecrets) headless[field] = '';

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
      unsafeSecrets,
      recentDeliveries: deliveries,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
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
    const previous = settings.headlessIntegration || {};
    const next = {
      apiKey: headless?.apiKey || '',
      webhookUrl: headless?.webhookUrl || '',
      webhookSecret: headless?.webhookSecret || '',
      previewUrlPattern: headless?.previewUrlPattern || '',
      previewSecret: headless?.previewSecret || '',
    };
    for (const field of SECRET_FIELDS) {
      const problem = secretProblem(field, String(next[field]), previous[field]);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }
    // Which settings changed, by name only: the audit trail must never hold a secret.
    const changed = Object.keys(next).filter((key) => next[key as keyof typeof next] !== (previous[key] || ''));
    settings.headlessIntegration = { ...next, updatedAt: now };

    await db.execute({
      sql: `UPDATE websites SET settings_json = ?, updated_at = ? WHERE id = ?`,
      args: [JSON.stringify(settings), now, currentSiteId],
    });

    // Record audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        gate.user.id,
        gate.user.name,
        'headless_settings_update',
        'websites',
        currentSiteId,
        'success',
        JSON.stringify({ changed }),
        now,
      ],
    });

    return NextResponse.json({ success: true, savedAt: now, headless: settings.headlessIntegration });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
