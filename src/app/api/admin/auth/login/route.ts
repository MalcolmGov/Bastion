import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { createSession, hashPassword, isLegacyPasswordHash, verifyPassword, StudioUser } from '@/lib/auth/auth';
import { checkLoginRateLimit } from '@/lib/security/rateLimiter';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts from this IP address. Please wait ${rateLimit.retryAfterSec} seconds before trying again.`
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSec),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetMs)
          }
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const cleanEmail = String(email).trim().toLowerCase();

    const userRes = await db.execute({
      sql: `SELECT id, name, email, password_hash, role, region_scope, client_id, created_at, last_login, failed_login_attempts, locked_until, must_reset_password FROM users WHERE LOWER(email) = ? LIMIT 1`,
      args: [cleanEmail]
    });

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    const now = new Date().toISOString();

    if (userRes.rows.length === 0) {
      // User not found - audit log and return generic 401
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

    // Check if account is currently locked
    if (row.locked_until) {
      const lockUntil = new Date(String(row.locked_until)).getTime();
      if (Date.now() < lockUntil) {
        const remainingMinutes = Math.ceil((lockUntil - Date.now()) / (60 * 1000));
        return NextResponse.json({
          error: `Account is temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        }, { status: 423 });
      }
    }

    const storedHash = String(row.password_hash || '');
    const isPasswordValid = verifyPassword(password, storedHash);

    if (!isPasswordValid) {
      const failedCount = Number(row.failed_login_attempts || 0) + 1;
      const lockedUntil = failedCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

      await db.execute({
        sql: `UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?`,
        args: [failedCount, lockedUntil, String(row.id)]
      });

      // Audit log failed attempt
      await db.execute({
        sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          String(row.id),
          cleanEmail,
          'AUTH_LOGIN',
          'users',
          String(row.id),
          'failed',
          JSON.stringify({ reason: 'Invalid password', attempt: failedCount, lockedUntil }),
          `corr_${Date.now()}`,
          ip,
          now
        ]
      });

      if (failedCount >= 5) {
        return NextResponse.json({
          error: 'Account locked for 15 minutes due to multiple failed login attempts.'
        }, { status: 423 });
      }

      return NextResponse.json({ error: 'Invalid credentials. Please verify your email and password.' }, { status: 401 });
    }

    if (isLegacyPasswordHash(storedHash)) {
      await db.execute({
        sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
        args: [hashPassword(password), String(row.id)]
      });
    }

    const user: StudioUser = {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      role: String(row.role) as any,
      region_scope: String(row.region_scope || 'All'),
      client_id: row.client_id ? String(row.client_id) : null,
      created_at: String(row.created_at),
      last_login: now
    };

    // Reset failed login attempts and update last_login
    await db.execute({
      sql: `UPDATE users SET last_login = ?, failed_login_attempts = 0, locked_until = NULL WHERE id = ?`,
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
      user,
      mustResetPassword: Boolean(row.must_reset_password)
    });

    // Set cookie
    response.cookies.set('gf_studio_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
