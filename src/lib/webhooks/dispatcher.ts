import crypto from 'crypto';
import { getDb } from '@/lib/db/client';

export interface WebhookEventPayload {
  event: 'content.published' | 'content.archived' | 'page.published';
  collection: string;
  id: string;
  slug?: string;
  title?: string;
  siteId?: string;
  timestamp: string;
}

export interface WebhookDeliveryResult {
  success: boolean;
  status?: number;
  latencyMs: number;
  error?: string;
  deliveryId: string;
}

/**
 * Dispatches an authenticated webhook to Bastion's frontend platform.
 * Non-blocking, signed with HMAC-SHA256, and recorded for audit logging.
 */
export async function dispatchContentWebhook(
  payload: WebhookEventPayload
): Promise<WebhookDeliveryResult> {
  const deliveryId = `whd_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const startTime = Date.now();
  const db = getDb();
  const siteId = payload.siteId || 'site_goldfields_flagship';

  try {
    // 1. Fetch site settings to find configured webhook URL and secret
    const siteRes = await db.execute({
      sql: `SELECT settings_json FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, siteId],
    });

    let webhookUrl = process.env.BASTION_WEBHOOK_URL || '';
    let webhookSecret = process.env.BASTION_WEBHOOK_SECRET || '';

    if (siteRes.rows.length > 0) {
      try {
        const rawSettings = siteRes.rows[0].settings_json;
        const settings = typeof rawSettings === 'string' ? JSON.parse(rawSettings) : rawSettings;
        if (settings?.headlessIntegration?.webhookUrl) {
          webhookUrl = settings.headlessIntegration.webhookUrl;
        }
        if (settings?.headlessIntegration?.webhookSecret) {
          webhookSecret = settings.headlessIntegration.webhookSecret;
        }
      } catch (e) {
        console.warn('[Webhook] Error parsing site settings:', e);
      }
    }

    if (!webhookUrl) {
      console.log(`[Webhook] No outbound webhook URL configured for site: ${siteId}. Delivery skipped.`);
      return {
        success: true,
        latencyMs: 0,
        deliveryId,
      };
    }

    // Never sign with a built-in default: that value is public in the source, so anyone could forge it.
    if (!webhookSecret) {
      console.warn(`[Webhook] No signing secret configured for site: ${siteId}. Delivery refused; set one in Settings or BASTION_WEBHOOK_SECRET.`);
      return {
        success: false,
        latencyMs: 0,
        error: 'Webhook signing secret is not configured for this site. Delivery was not sent.',
        deliveryId,
      };
    }

    // 2. Generate HMAC SHA-256 signature
    const bodyStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyStr)
      .digest('hex');

    // 3. Dispatch POST request with 4-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let res: Response;
    try {
      res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bastion-signature': `sha256=${signature}`,
          'x-bastion-event': payload.event,
          'x-bastion-delivery': deliveryId,
          'x-bastion-timestamp': payload.timestamp,
        },
        body: bodyStr,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const latencyMs = Date.now() - startTime;
    const isSuccess = res.ok;
    const responseBody = await res.text().catch(() => '');

    // 4. Record delivery in database
    try {
      await db.execute({
        sql: `INSERT INTO webhook_deliveries (
          id, site_id, event, target_url, payload_json, response_status, response_body, latency_ms, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          deliveryId,
          siteId,
          payload.event,
          webhookUrl,
          bodyStr,
          res.status,
          responseBody.substring(0, 500),
          latencyMs,
          isSuccess ? 'success' : 'failed',
          payload.timestamp,
        ],
      });
    } catch (e) {
      // Table might not exist yet; safe to proceed
    }

    return {
      success: isSuccess,
      status: res.status,
      latencyMs,
      deliveryId,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error(`[Webhook] Failed to dispatch webhook to ${siteId}:`, err.message);

    try {
      await db.execute({
        sql: `INSERT INTO webhook_deliveries (
          id, site_id, event, target_url, payload_json, response_status, response_body, latency_ms, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          deliveryId,
          siteId,
          payload.event,
          'configured-url',
          JSON.stringify(payload),
          500,
          err.message,
          latencyMs,
          'failed',
          payload.timestamp,
        ],
      });
    } catch (e) {
      // Ignore fallback table error
    }

    return {
      success: false,
      latencyMs,
      error: err.message,
      deliveryId,
    };
  }
}
