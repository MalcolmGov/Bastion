import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/guard';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';
import { sendTransactionalEmail } from '@/lib/email/delivery';
import { hashPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json().catch(() => ({}));
    const targetEmail = String(body.email || 'malcolm@movedigital.africa').toLowerCase().trim();
    const clientName = body.clientName || 'Bastion Group';
    const roleTitle = body.roleTitle || 'Platform Administrator';
    const rawPassword = body.password || `${clientName.replace(/[^a-zA-Z0-9]/g, '')}2026!`;

    const db = getDb();
    const userRes = await db.execute({
      sql: `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
      args: [targetEmail]
    });

    let recipientName = body.name || 'Malcolm Govender';
    let userRole = 'platform_admin';
    if (userRes.rows.length > 0) {
      const u = userRes.rows[0];
      recipientName = String(u.name || recipientName);
      userRole = String(u.role || userRole);
      // Reset/update password hash
      const pwdHash = hashPassword(rawPassword);
      await db.execute({
        sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
        args: [pwdHash, u.id]
      });
    }

    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${protocol}://${host}/admin/login?email=${encodeURIComponent(targetEmail)}`;

    const emailHtml = generateWelcomeEmailHtml({
      recipientName,
      recipientEmail: targetEmail,
      roleTitle,
      clientName,
      loginUrl,
      temporaryPassword: rawPassword,
      inviterName: `${gate.user.name || 'Bastion Operations'} (Bastion Group)`
    });

    const delivery = await sendTransactionalEmail({
      to: targetEmail,
      subject: `Welcome to ${clientName} Corporate CMS Portal — Bastion Group`,
      html: emailHtml,
      roleTitle,
      clientName,
      inviteUrl: loginUrl
    });

    return NextResponse.json({
      success: delivery.ok,
      message: delivery.status === 'delivered'
        ? `Welcome credentials successfully dispatched to ${targetEmail} via Resend (Message ID: ${delivery.providerMessageId})`
        : delivery.status === 'simulated_dev'
        ? `Simulated email generated for ${targetEmail}. (Add RESEND_API_KEY in .env.local to deliver live via Resend)`
        : `Email delivery failed: ${delivery.error}`,
      delivery,
      credentials: {
        email: targetEmail,
        name: recipientName,
        role: userRole,
        temporaryPassword: rawPassword,
        loginUrl
      }
    });
  } catch (err: any) {
    console.error('Resend welcome error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
