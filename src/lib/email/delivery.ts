import { getDb } from '@/lib/db/client';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

function getResendApiKey(): string | undefined {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '') {
    return process.env.RESEND_API_KEY.trim();
  }
  // Fallback to direct read from .env.local or .env without requiring full server restart
  const candidateFiles = ['.env.local', '.env'];
  for (const file of candidateFiles) {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(/^\s*RESEND_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (match && match[1] && match[1].trim() !== '') {
          return match[1].trim();
        }
      }
    } catch {
      // ignore
    }
  }
  return undefined;
}

function getEmailFrom(): string {
  if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim() !== '') {
    return process.env.EMAIL_FROM.trim();
  }
  const candidateFiles = ['.env.local', '.env'];
  for (const file of candidateFiles) {
    try {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(/^\s*EMAIL_FROM\s*=\s*["']?([^"'\r\n]+)["']?/m);
        if (match && match[1] && match[1].trim() !== '') {
          return match[1].trim();
        }
      }
    } catch {
      // ignore
    }
  }
  return 'Bastion Group <onboarding@resend.dev>';
}

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
  const apiKey = getResendApiKey();
  let fromAddress = options.from || getEmailFrom();

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
      } else if (
        data.message?.toLowerCase().includes('only send testing emails') ||
        data.message?.toLowerCase().includes('testing emails') ||
        process.env.ALLOW_SIMULATED_EMAIL === 'true'
      ) {
        console.warn(`[Email Delivery - Resend Sandbox] Account is restricted to owner email. Falling back to simulation for: ${options.to}`);
        status = 'simulated_dev';
        provider = 'simulated';
        providerMessageId = `sim_resend_sandbox_${Date.now()}`;
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
