import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { generateToken, hashPassword, ROLE_PERMISSIONS } from '@/lib/auth/auth';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';
import { sendTransactionalEmail } from '@/lib/email/delivery';
import crypto from 'crypto';

const ASSIGNABLE_ROLES = new Set(Object.keys(ROLE_PERMISSIONS));

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const currentUser = gate.user;

    const body = await req.json();
    const {
      name,
      email,
      role = 'content_editor',
      clientName = 'Bastion Client Workspace',
      clientScope = 'All'
    } = body;

    let clientId = body.clientId;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    if (!ASSIGNABLE_ROLES.has(String(role))) {
      return NextResponse.json({ error: 'Unknown role.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Client users can only invite into their own client workspace
    if (!isAgencyUser(currentUser)) {
      clientId = currentUser.client_id;
      if (role === 'platform_admin') {
        return NextResponse.json({ error: 'Client users cannot invite platform admins.' }, { status: 403 });
      }
    }

    if (role === 'platform_admin' && clientId) {
      return NextResponse.json({ error: 'Platform admins are agency accounts and cannot be bound to one client.' }, { status: 400 });
    }

    if (role !== 'platform_admin' && !clientId) {
      return NextResponse.json({ error: 'Client users must be assigned to a client workspace.' }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    const inviteToken = generateToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

    // Random non-usable temporary salt/hash until set by user
    const placeholderHash = hashPassword(crypto.randomBytes(32).toString('hex'));

    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      args: [cleanEmail]
    });

    let userId = '';

    if (existing.rows.length > 0) {
      // A client user may only re-invite members of their own workspace; otherwise they could
      // reassign (or take over via the returned invite token) accounts that belong to other tenants or the agency.
      if (!isAgencyUser(currentUser)) {
        const ownerRes = await db.execute({
          sql: `SELECT client_id FROM users WHERE id = ? LIMIT 1`,
          args: [String(existing.rows[0].id)]
        });
        const ownerClient = ownerRes.rows[0]?.client_id ? String(ownerRes.rows[0].client_id) : null;
        if (ownerClient !== currentUser.client_id) {
          return NextResponse.json({ error: 'That email already belongs to another workspace.' }, { status: 409 });
        }
      }
      userId = String(existing.rows[0].id);
      await db.execute({
        sql: `UPDATE users SET name = ?, role = ?, client_id = ?, invite_token = ?, invite_token_expires_at = ?, must_reset_password = 1 WHERE id = ?`,
        args: [name, role, role === 'platform_admin' ? null : clientId, inviteToken, expiresAt, userId]
      });
    } else {
      userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, invite_token, invite_token_expires_at, must_reset_password, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        args: [userId, name, cleanEmail, placeholderHash, role, clientScope, role === 'platform_admin' ? null : clientId, inviteToken, expiresAt, now]
      });
    }

    // Prefer the configured public URL: the Host header is attacker-controlled and would let a
    // forged request mint invite links (carrying a live token) that point at another domain.
    const configuredBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const inviteUrl = `${configuredBase || `${protocol}://${host}`}/admin/invite?token=${inviteToken}`;

    const roleTitles: Record<string, string> = {
      platform_admin: 'Platform Administrator',
      content_editor: 'Corporate Content Editor',
      reviewer: 'Compliance Reviewer',
      publisher: 'Corporate Publisher',
      analyst: 'IR & Disclosures Analyst'
    };

    const emailHtml = generateWelcomeEmailHtml({
      recipientName: name,
      recipientEmail: cleanEmail,
      roleTitle: roleTitles[role] || 'Corporate Workspace Member',
      clientName: clientName,
      loginUrl: inviteUrl,
      inviterName: `${currentUser.name} (${isAgencyUser(currentUser) ? 'Bastion Agency' : clientName})`
    });

    const delivery = await sendTransactionalEmail({
      to: cleanEmail,
      subject: `Welcome to the ${clientName} Corporate CMS Portal`,
      html: emailHtml,
      roleTitle: roleTitles[role] || 'Corporate Workspace Member',
      clientName,
      inviteUrl
    });

    return NextResponse.json({
      success: true,
      message: `Invitation ${delivery.status === 'delivered' ? 'dispatched via email' : 'generated'} successfully for ${cleanEmail}`,
      userId,
      email: cleanEmail,
      inviteUrl,
      inviteToken,
      expiresAt,
      delivery
    });
  } catch (err: any) {
    console.error('Invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
