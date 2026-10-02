import { getDb } from '@/lib/db/client';
import crypto from 'crypto';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  roleTitle?: string;
  clientName?: string;
  inviteUrl?: string;
}

export interface EmailDeliveryResult {
  ok: boolean;
  status: 'delivered' | 'simulated_dev' | 'failed';
  provider: 'resend' | 'simulated';
  id: string;
  providerMessageId?: string;
  error?: string;
}

/**
 * Enterprise Email Delivery Service
 * Delivers transactional emails via Resend REST API when configured,
 * or safely logs and persists delivery simulation in local/test environments.
 */
export async function sendTransactionalEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
  const deliveryId = `eml_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  let fromAddress = options.from || process.env.EMAIL_FROM || 'Bastion Move Studio <notifications@bastiongroup.co.za>';

  let status: 'delivered' | 'simulated_dev' | 'failed' = 'simulated_dev';
  let providerMessageId: string | undefined = undefined;
  let errorMessage: string | undefined = undefined;
  let provider: 'resend' | 'simulated' = apiKey ? 'resend' : 'simulated';

  if (apiKey) {
    try {
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      let data = await res.json();

      // If failed due to unverified domain or 403, and not already using onboarding@resend.dev, attempt auto-fallback
      if (!res.ok && (data.message?.toLowerCase().includes('domain') || data.message?.toLowerCase().includes('verify') || res.status === 403)) {
        if (!fromAddress.includes('onboarding@resend.dev')) {
          console.warn(`[Email Delivery] Sender domain unverified (${fromAddress}). Retrying with verified Resend fallback sender onboarding@resend.dev...`);
          const fallbackFrom = 'Bastion Move Studio <onboarding@resend.dev>';
          res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fallbackFrom,
              to: [options.to],
              subject: options.subject,
              html: options.html,
            }),
          });
          data = await res.json();
          if (res.ok) {
            fromAddress = fallbackFrom;
          }
        }
      }

      if (res.ok) {
        status = 'delivered';
        providerMessageId = data.id || `res_${Date.now()}`;
        console.log(`[Email Delivery - Resend] Successfully delivered to ${options.to} (ID: ${providerMessageId}) via ${fromAddress}`);
      } else {
        status = 'failed';
        errorMessage = data.message || `Resend HTTP error ${res.status}: ${JSON.stringify(data)}`;
        console.error(`[Email Delivery - Resend Error]`, errorMessage);
      }
    } catch (err: any) {
      status = 'failed';
      errorMessage = err.message || 'Network failure dispatching email';
      console.error(`[Email Delivery - Network Error]`, err);
    }
  } else {
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    if (isProd && process.env.ALLOW_SIMULATED_EMAIL !== 'true') {
      status = 'failed';
      errorMessage = 'Production email delivery blocked: RESEND_API_KEY is not configured on production server.';
      console.error('[Email Delivery] FATAL: Production email blocked because RESEND_API_KEY is missing.');
    } else {
      // Development / Test Simulation
      status = 'simulated_dev';
      providerMessageId = `sim_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      console.log(
        `[Email Service - Simulated Dev] To: ${options.to} | Subject: "${options.subject}" | Link: ${options.inviteUrl || 'N/A'}`
      );
    }
  }

  // Persist delivery audit record in database
  try {
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO email_deliveries (id, recipient_email, subject, role_title, client_name, provider, status, provider_message_id, error_message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        deliveryId,
        options.to,
        options.subject,
        options.roleTitle || 'Member',
        options.clientName || 'Bastion Workspace',
        provider,
        status,
        providerMessageId || null,
        errorMessage || null,
        now,
      ],
    });
  } catch (dbErr) {
    console.warn('[Email Service] Could not log email delivery to database:', dbErr);
  }

  return {
    ok: status !== 'failed',
    status,
    provider,
    id: deliveryId,
    providerMessageId,
    error: errorMessage,
  };
}
