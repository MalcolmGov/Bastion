/**
 * Bastion SRE — Omnichannel Notification & WhatsApp Approvals Bridge
 * Connects Autonomous SRE incident events with Zara AI WhatsApp messaging.
 */

import crypto from 'crypto';
import { readSecret } from '@/lib/auth/apiToken';

const SECRET_KEY = readSecret('SRE_APPROVAL_SECRET');
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010';

export interface QuickApproveTokenPayload {
  incidentId: string;
  prNumber: number;
  repoOwner: string;
  repoName: string;
  expiresAt: number;
}

/**
 * Generates a tamper-proof cryptographically signed HMAC token
 * allowing 1-click approval directly from WhatsApp / mobile email.
 */
export function generateQuickApproveToken(payload: Omit<QuickApproveTokenPayload, 'expiresAt'>, validHours = 24): string {
  if (!SECRET_KEY) {
    throw new Error('SRE_APPROVAL_SECRET is not configured.');
  }
  const secret: string = SECRET_KEY;
  const expiresAt = Date.now() + validHours * 3600 * 1000;
  const fullPayload: QuickApproveTokenPayload = { ...payload, expiresAt };
  const encodedData = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedData).digest('hex');
  return `${encodedData}.${signature}`;
}

/**
 * Validates the HMAC quick approval token.
 */
export function verifyQuickApproveToken(token: string): QuickApproveTokenPayload | null {
  try {
    if (!SECRET_KEY) return null;
    const secret: string = SECRET_KEY;
    const [encodedData, signature] = token.split('.');
    if (!encodedData || !signature) return null;

    const expectedSig = crypto.createHmac('sha256', secret).update(encodedData).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      console.warn('[Bastion SRE Auth] Invalid HMAC signature on approval token');
      return null;
    }

    const payload: QuickApproveTokenPayload = JSON.parse(Buffer.from(encodedData, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) {
      console.warn('[Bastion SRE Auth] Quick approval token has expired');
      return null;
    }

    return payload;
  } catch (err: any) {
    console.error('[Bastion SRE Auth] Token verification error:', err.message);
    return null;
  }
}

/**
 * Dispatches an automated incident & PR review notification to Malcolm's WhatsApp.
 */
export async function dispatchWhatsAppIncidentAlert({
  incidentId,
  title,
  severity,
  affectedRoute,
  repoOwner = 'MalcolmGov',
  repoName = 'MoveDigital',
  prNumber,
  prUrl,
  recipientNumber = '+27820000000'
}: {
  incidentId: string;
  title: string;
  severity: string;
  affectedRoute: string;
  repoOwner?: string;
  repoName?: string;
  prNumber?: number;
  prUrl?: string;
  recipientNumber?: string;
}) {
  try {
    const token = prNumber
      ? generateQuickApproveToken({
          incidentId,
          prNumber,
          repoOwner,
          repoName
        })
      : null;

    const quickApproveUrl = token
      ? `${PUBLIC_BASE_URL}/api/admin/sre/quick-approve?token=${token}`
      : `${PUBLIC_BASE_URL}/admin/incidents`;

    // Construct premium WhatsApp Markdown message
    const waText = [
      `🚨 *Bastion Autonomous SRE Alert*`,
      `*Target:* ${affectedRoute || 'movedigital.africa'}`,
      `*Incident:* [${incidentId}] ${title}`,
      `*Severity:* ${severity.toUpperCase()}`,
      `*Repository:* ${repoOwner}/${repoName}`,
      prNumber ? `*AI SRE Action:* Opened GitHub PR #${prNumber}` : null,
      ``,
      token ? `⚡ *1-Click Mobile Approval:*` : null,
      token ? `${quickApproveUrl}` : null,
      ``,
      prUrl ? `Inspect PR on GitHub: ${prUrl}` : null,
      `Console: ${PUBLIC_BASE_URL}/admin/incidents`
    ]
      .filter(Boolean)
      .join('\n');

    console.log(`[Bastion SRE WhatsApp Alert] Dispatched to ${recipientNumber}:\n${waText}`);

    // Try posting to Zara's local WhatsApp service or Zara agent
    const endpoints = [
      'http://localhost:3001/send',
      'http://localhost:8000/api/whatsapp/incoming'
    ];

    for (const ep of endpoints) {
      try {
        await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: recipientNumber,
            message: waText,
            incidentId,
            prNumber
          }),
          signal: AbortSignal.timeout(2000)
        });
        break;
      } catch {
        // Fallback to console / next endpoint
      }
    }

    return {
      success: true,
      quickApproveUrl,
      waText
    };
  } catch (err: any) {
    console.error('[Bastion SRE WhatsApp Dispatch Error]:', err.message);
    return { success: false, error: err.message };
  }
}
