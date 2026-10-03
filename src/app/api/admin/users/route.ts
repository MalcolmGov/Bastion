import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/auth';
import { passwordRefusal } from '@/lib/auth/passwordPolicy';
import { requireAgencyUser, requireUser, resolveTargetClientId } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const db = getDb();
    const targetClientId = resolveTargetClientId(user, req);

    const result = targetClientId
      ? await db.execute({
          sql: `
            SELECT id, name, email, role, region_scope, client_id, created_at, last_login
            FROM users
            WHERE client_id = ?
            ORDER BY created_at DESC
          `,
          args: [targetClientId]
        })
      : (isAgencyUser(user)
          ? await db.execute(`
              SELECT id, name, email, role, region_scope, client_id, created_at, last_login
              FROM users
              ORDER BY created_at DESC
            `)
          : await db.execute({
              sql: `
                SELECT id, name, email, role, region_scope, client_id, created_at, last_login
                FROM users
                WHERE client_id = ?
                ORDER BY created_at DESC
              `,
              args: [user.client_id]
            }));

    return NextResponse.json({ users: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const currentUser = gate.user;

    const body = await req.json();
    const {
      name,
      email,
      role = 'content_editor',
      clientName = 'Bastion Group',
      clientScope = 'All',
      clientId = null,
      initialPassword
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const refusal = passwordRefusal(initialPassword, 'A temporary password of at least 12 characters is required.');
    if (refusal) {
      return NextResponse.json({ error: refusal }, { status: 400 });
    }

    if (role === 'platform_admin' && clientId) {
      return NextResponse.json({ error: 'Platform admins are agency accounts and cannot be bound to one client.' }, { status: 400 });
    }

    if (role !== 'platform_admin' && !clientId) {
      return NextResponse.json({ error: 'Client users must be assigned to a client workspace.' }, { status: 400 });
    }

    const db = getDb();

    // Check if user already exists
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE email = ? LIMIT 1`,
      args: [email]
    });

    const now = new Date().toISOString();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const passHash = hashPassword(initialPassword);

    if (existing.rows.length > 0) {
      // Update existing user role and scope
      await db.execute({
        sql: `UPDATE users SET name = ?, role = ?, region_scope = ?, client_id = ? WHERE email = ?`,
        args: [name, role, clientScope, role === 'platform_admin' ? null : clientId, email]
      });
    } else {
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [userId, name, email, passHash, role, clientScope, role === 'platform_admin' ? null : clientId, now]
      });
    }

    // Role display title
    const roleTitles: Record<string, string> = {
      platform_admin: 'Platform Administrator',
      content_editor: 'Senior Content Editor',
      reviewer: 'Compliance Reviewer',
      publisher: 'Corporate Publisher',
      analyst: 'IR & Disclosures Analyst'
    };

    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${protocol}://${host}/admin/login?email=${encodeURIComponent(email)}`;

    // Generate Visual Welcome Email HTML
    const emailHtml = generateWelcomeEmailHtml({
      recipientName: name,
      recipientEmail: email,
      roleTitle: roleTitles[role] || 'Corporate Content Editor',
      clientName: clientName,
      loginUrl: loginUrl,
      inviterName: `${currentUser.name} (Bastion Group)`
    });

    return NextResponse.json({
      success: true,
      message: `User ${name} provisioned successfully!`,
      userId,
      email,
      loginUrl,
      emailHtml
    });
  } catch (err: any) {
    console.error('Users POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
