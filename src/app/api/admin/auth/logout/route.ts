import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeSession, getCurrentUser } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/client';
import crypto from 'node:crypto';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('gf_studio_session')?.value;
    const user = await getCurrentUser();

    if (token) {
      await revokeSession(token);
    }

    if (user) {
      const db = getDb();
      await db.execute({
        sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          user.id,
          user.name,
          'AUTH_LOGOUT',
          'users',
          user.id,
          'success',
          JSON.stringify({ note: 'User logged out' }),
          `corr_${Date.now()}`,
          req.headers.get('x-forwarded-for') || '127.0.0.1',
          new Date().toISOString()
        ]
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('gf_studio_session');
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
