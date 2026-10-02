import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { requireAgencyUser } from '@/lib/auth/guard';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';
import { sendTransactionalEmail } from '@/lib/email/delivery';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;

    const body = await req.json().catch(() => ({}));
    const targetEmail = String(body.email || 'malcolm@movedigital.africa').toLowerCase().trim();

    const db = getDb();
    const userRes = await db.execute({
      sql: `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
      args: [targetEmail]
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    if (body.clientId && userRes.rows[0].client_id !== body.clientId) {
      return NextResponse.json({ error: 'User belongs to a different workspace.' }, { status: 409 });
    }

    let recipientName = body.name || 'Malcolm Govender';
    let userRole = 'platform_admin';
    let clientId = body.clientId || null;

    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      recipientName = String(u.name || recipientName);
      userRole = String(u.role || userRole);
      if (!clientId && u.client_id) {
        clientId = String(u.client_id);
      }
    }

    let clientName = body.clientName;
    if (!clientName && clientId) {
      const clientRes = await db.execute({
        sql: `SELECT name FROM clients WHERE id = ? LIMIT 1`,
        args: [clientId]
      });
      if (clientRes.rows.length > 0) {
        clientName = String(clientRes.rows[0].name);
      }
    }
    clientName = clientName || 'Bastion Group';

    const roleTitles: Record<string, string> = {
      platform_admin: 'Platform Administrator',
      content_editor: 'Corporate Content Editor',
      reviewer: 'Compliance Reviewer',
      publisher: 'Corporate Publisher',
      analyst: 'IR & Disclosures Analyst'
    };
    const roleTitle = body.roleTitle || roleTitles[userRole] || 'Corporate Workspace Member';

    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';

    // Generate fresh invite token for direct password creation
    const inviteToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    if (userRes.rows.length > 0) {
      await db.execute({
        sql: `UPDATE users SET invite_token = ?, invite_token_expires_at = ?, must_reset_password = 1 WHERE id = ?`,
        args: [inviteToken, expiresAt, userRes.rows[0].id]
      });
    }

    const inviteUrl = `${protocol}://${host}/admin/invite?token=${inviteToken}`;

    const emailHtml = generateWelcomeEmailHtml({
      recipientName,
      recipientEmail: targetEmail,
      roleTitle,
      clientName,
      loginUrl: inviteUrl,
      inviterName: `${gate.user.name || 'Bastion Operations'} (Bastion Group)`
    });

    const delivery = await sendTransactionalEmail({
      to: targetEmail,
      subject: `Welcome to ${clientName} Corporate CMS Portal — Bastion Group`,
      html: emailHtml,
      roleTitle,
      clientName,
      inviteUrl
    });

    return NextResponse.json({
      success: delivery.ok,
      message: delivery.status === 'delivered'
        ? `Welcome invitation link successfully dispatched to ${targetEmail} via Resend (Message ID: ${delivery.providerMessageId})`
        : delivery.status === 'simulated_dev'
        ? `Simulated email generated for ${targetEmail}. (Add RESEND_API_KEY in .env.local to deliver live via Resend)`
        : `Email delivery failed: ${delivery.error}`,
      delivery,
      credentials: {
        email: targetEmail,
        name: recipientName,
        role: userRole,
        loginUrl: inviteUrl
      }
    });
  } catch (err: any) {
    console.error('Resend welcome error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
