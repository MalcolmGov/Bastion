import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser, hasPermission, StudioUser } from '@/lib/auth/auth';
import { isAgencyUser } from '@/lib/auth/roles';

export type Guard =
  | { ok: true; user: StudioUser }
  | { ok: false; response: NextResponse };

function denied(status: number, error: string): Guard {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

export async function requireUser(): Promise<Guard> {
  const user = await getCurrentUser();
  if (!user) return denied(401, 'Unauthorized');
  if (!isAgencyUser(user) && !user.client_id) {
    return denied(403, 'Account is not assigned to a client workspace.');
  }
  return { ok: true, user };
}

export async function requireAgencyUser(): Promise<Guard> {
  const gate = await requireUser();
  if (!gate.ok) return gate;
  if (!isAgencyUser(gate.user)) {
    return denied(403, 'Forbidden: agency staff only.');
  }
  return gate;
}

export async function requirePermission(permission: string): Promise<Guard> {
  const gate = await requireUser();
  if (!gate.ok) return gate;
  if (!hasPermission(gate.user.role, permission)) {
    return denied(403, 'Forbidden');
  }
  return gate;
}

export function clientOwns(user: StudioUser, clientId: string | null | undefined): boolean {
  if (isAgencyUser(user)) return true;
  return !!clientId && clientId === user.client_id;
}

export function extractTenantFromRequest(req?: Request | any): string | null {
  if (!req) return null;
  try {
    // 1. Check query parameters
    let url: URL | null = null;
    if (typeof req.url === 'string') {
      url = new URL(req.url, 'http://localhost');
    } else if (req.nextUrl) {
      url = req.nextUrl;
    }
    const fromQuery = url?.searchParams.get('clientId');
    if (fromQuery && fromQuery.trim()) return fromQuery.trim();

    // 2. Check headers
    if (req.headers) {
      const fromHeader = typeof req.headers.get === 'function'
        ? (req.headers.get('x-client-id') || req.headers.get('x-tenant-id'))
        : (req.headers['x-client-id'] || req.headers['x-tenant-id']);
      if (fromHeader && String(fromHeader).trim()) return String(fromHeader).trim();

      // 3. Check Cookie header
      const cookieHeader = typeof req.headers.get === 'function' ? req.headers.get('cookie') : req.headers.cookie;
      if (cookieHeader) {
        const match = String(cookieHeader).match(/bastion_active_client_id=([^;]+)/);
        if (match && match[1]) return decodeURIComponent(match[1].trim());
      }
    }

    // 4. Check NextRequest cookies map if present
    if (req.cookies && typeof req.cookies.get === 'function') {
      const cookieVal = req.cookies.get('bastion_active_client_id')?.value;
      if (cookieVal && cookieVal.trim()) return cookieVal.trim();
    }
  } catch {
    // Fallback if URL parsing encounters relative paths
  }
  return null;
}

export function resolveTargetClientId(
  user: StudioUser,
  req?: Request | any,
  explicitClientId?: string | null
): string | null {
  if (!isAgencyUser(user)) {
    return user.client_id || null;
  }
  if (explicitClientId && explicitClientId.trim()) {
    return explicitClientId.trim();
  }
  const fromReq = extractTenantFromRequest(req);
  if (fromReq) return fromReq;
  return null;
}

export function tenantClause(
  user: StudioUser,
  column = 'client_id',
  explicitTargetClientId?: string | null
): { sql: string; args: string[] } {
  if (!isAgencyUser(user)) {
    return { sql: ` AND ${column} = ?`, args: [user.client_id || ''] };
  }
  if (explicitTargetClientId && explicitTargetClientId.trim()) {
    return { sql: ` AND ${column} = ?`, args: [explicitTargetClientId.trim()] };
  }
  return { sql: '', args: [] };
}

export async function assertSiteAccess(user: StudioUser, siteId: string): Promise<Guard> {
  if (isAgencyUser(user)) return { ok: true, user };
  const db = getDb();
  const res = await db.execute({
    sql: `SELECT client_id FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
    args: [siteId, siteId],
  });
  if (res.rows.length === 0) return denied(404, 'Website not found');
  const clientId = res.rows[0].client_id ? String(res.rows[0].client_id) : null;
  if (!clientOwns(user, clientId)) return denied(403, 'Forbidden');
  return { ok: true, user };
}

export async function assertReleaseAccess(user: StudioUser, releaseId: string): Promise<Guard> {
  if (isAgencyUser(user)) return { ok: true, user };
  const db = getDb();
  const res = await db.execute({
    sql: `SELECT client_id FROM content_releases WHERE id = ? LIMIT 1`,
    args: [releaseId],
  });
  if (res.rows.length === 0) return denied(404, 'Release not found');
  if (String(res.rows[0].client_id) !== user.client_id) return denied(404, 'Release not found');
  return { ok: true, user };
}

export async function assertWhistleblowerAccess(user: StudioUser, reportId: string): Promise<Guard> {
  const res = await getDb().execute({
    sql: 'SELECT client_id FROM whistleblower_reports WHERE id = ? LIMIT 1',
    args: [reportId]
  });
  if (res.rows.length === 0 || !clientOwns(user, String(res.rows[0].client_id || ''))) {
    return denied(404, 'Report not found');
  }
  return { ok: true, user };
}
