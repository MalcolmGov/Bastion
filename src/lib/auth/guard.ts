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

export function tenantClause(user: StudioUser, column = 'client_id'): { sql: string; args: string[] } {
  if (isAgencyUser(user)) return { sql: '', args: [] };
  return { sql: ` AND ${column} = ?`, args: [user.client_id || ''] };
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
