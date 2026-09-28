import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { createSession, hashPassword, StudioUser } from '@/lib/auth/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const cleanEmail = String(email).trim().toLowerCase();
    const pwdHash = hashPassword(password);

    const userRes = await db.execute({
      sql: `SELECT id, name, email, password_hash, role, region_scope, created_at, last_login FROM users WHERE LOWER(email) = ? LIMIT 1`,
      args: [cleanEmail]
    });

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const now = new Date().toISOString();

    if (userRes.rows.length === 0 || userRes.rows[0].password_hash !== pwdHash) {
      // Audit log failed attempt
      await db.execute({
        sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          'unauthenticated',
          cleanEmail,
          'AUTH_LOGIN',
          'users',
          'session',
          'failed',
          JSON.stringify({ reason: 'Invalid email or password', email: cleanEmail }),
          `corr_${Date.now()}`,
          ip,
          now
        ]
      });

      return NextResponse.json({ error: 'Invalid credentials. Please verify your email and password.' }, { status: 401 });
    }

    const row = userRes.rows[0];
    const user: StudioUser = {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role) as any,
      region_scope: String(row.region_scope || 'All'),
      created_at: String(row.created_at),
      last_login: now
    };

    // Update user's last_login
    await db.execute({
      sql: `UPDATE users SET last_login = ? WHERE id = ?`,
      args: [now, user.id]
    });

    // Create session
    const token = await createSession(user.id, ip, userAgent);

    // Audit log successful login
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        user.id,
        user.name,
        'AUTH_LOGIN',
        'users',
        user.id,
        'success',
        JSON.stringify({ role: user.role, region_scope: user.region_scope }),
        `corr_${Date.now()}`,
        ip,
        now
      ]
    });

    const response = NextResponse.json({
      success: true,
      user
    });

    // Set cookie
    response.cookies.set('gf_studio_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
