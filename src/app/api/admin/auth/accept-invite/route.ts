import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { createSession, hashPassword } from '@/lib/auth/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ valid: false, error: 'Invite token is required' }, { status: 400 });
    }

    const db = getDb();
    const userRes = await db.execute({
      sql: `SELECT id, name, email, role, region_scope, client_id, invite_token_expires_at FROM users WHERE invite_token = ? LIMIT 1`,
      args: [token.trim()]
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired invite token' }, { status: 404 });
    }

    const row = userRes.rows[0];
    if (row.invite_token_expires_at) {
      const expiresAt = new Date(String(row.invite_token_expires_at)).getTime();
      if (Date.now() > expiresAt) {
        return NextResponse.json({ valid: false, error: 'This invitation has expired. Please request a new invite link.' }, { status: 410 });
      }
    }

    let clientName = String(row.region_scope || 'Bastion Workspace');
    if (row.client_id) {
      try {
        const clientRes = await db.execute({
          sql: `SELECT name FROM clients WHERE id = ? LIMIT 1`,
          args: [String(row.client_id)]
        });
        if (clientRes.rows.length > 0 && clientRes.rows[0].name) {
          clientName = String(clientRes.rows[0].name);
        }
      } catch (_) {}
    }

    return NextResponse.json({
      valid: true,
      user: {
        name: String(row.name),
        email: String(row.email),
        role: String(row.role),
        clientName,
        clientId: row.client_id ? String(row.client_id) : null
      }
    });
  } catch (err: any) {
    console.error('Validate invite error:', err);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invite token is required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters long' }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();

    const userRes = await db.execute({
      sql: `SELECT id, name, email, role, region_scope, client_id, invite_token_expires_at FROM users WHERE invite_token = ? LIMIT 1`,
      args: [token.trim()]
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 400 });
    }

    const row = userRes.rows[0];
    if (row.invite_token_expires_at) {
      const expiresAt = new Date(String(row.invite_token_expires_at)).getTime();
      if (Date.now() > expiresAt) {
        return NextResponse.json({ error: 'This invitation has expired. Please request a new invite link.' }, { status: 410 });
      }
    }

    const newHash = hashPassword(newPassword);
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Clear invite token, set password, and clear must_reset_password
    await db.execute({
      sql: `UPDATE users SET password_hash = ?, invite_token = NULL, invite_token_expires_at = NULL, must_reset_password = 0, failed_login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?`,
      args: [newHash, now, String(row.id)]
    });

    // Create session
    const sessionToken = await createSession(String(row.id), ip, userAgent);

    // Audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, 'ACCEPT_INVITE', 'users', ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        String(row.id),
        String(row.name),
        String(row.id),
        JSON.stringify({ email: String(row.email) }),
        `corr_${Date.now()}`,
        ip,
        now
      ]
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account activated successfully!',
      user: {
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        role: String(row.role),
        clientId: row.client_id ? String(row.client_id) : null
      }
    });

    response.cookies.set('gf_studio_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error('Accept invite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
