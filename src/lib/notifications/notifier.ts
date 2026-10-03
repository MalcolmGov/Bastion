import { getDb } from '@/lib/db/client';
import crypto from 'node:crypto';

export interface NotificationPayload {
  recordTitle: string;
  collection: string;
  recordId: string;
  authorName: string;
  authorRole: string;
  comments?: string;
}

/**
 * Dispatches an automated notification alert to Slack / MS Teams / Webhook
 * when editorial content is submitted for compliance review.
 */
export async function sendReviewNotification(payload: NotificationPayload): Promise<boolean> {
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
  const now = new Date().toISOString();
  const db = getDb();

  const isFinancial = payload.collection === 'reports' || payload.collection === 'news';

  const messageText = `🔔 *Gold Fields Studio: Regulatory Review Requested*\n\n` +
    `• *Item:* ${payload.recordTitle}\n` +
    `• *Collection:* ${payload.collection.toUpperCase()}\n` +
    `• *Author:* ${payload.authorName} (${payload.authorRole})\n` +
    (payload.comments ? `• *Comments:* "${payload.comments}"\n` : '') +
    (isFinancial ? `• *Governance Notice:* Two-Person sign-off strictly required prior to live release.\n` : '') +
    `• *Review URL:* ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010'}/admin/tasks`;

  let sent = false;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messageText,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: messageText
              }
            }
          ]
        })
      });
      sent = res.ok;
    } catch (err: any) {
      console.warn('Notification webhook delivery error:', err.message);
    }
  } else {
    // Simulated notification logging for local/dev
    console.log('[Notification Simulation] Outbound alert queued:', payload.recordTitle);
    sent = true;
  }

  // Audit log the alert
  try {
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, 'system_notifier', 'Studio Alert Service', 'NOTIFICATION_DISPATCH', ?, ?, 'success', ?, ?, '127.0.0.1', ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        payload.collection,
        payload.recordId,
        JSON.stringify({ author: payload.authorName, delivered: sent, channel: webhookUrl ? 'webhook' : 'simulated' }),
        `corr_notif_${Date.now()}`,
        now
      ]
    });
  } catch (err) {
    console.warn('Failed to audit notification:', err);
  }

  return sent;
}
