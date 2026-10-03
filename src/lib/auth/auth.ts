import { getDb } from '@/lib/db/client';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

export { hashPassword, verifyPassword, isLegacyPasswordHash } from '@/lib/auth/password';

export type UserRole = 
  | 'platform_admin'
  | 'content_editor'
  | 'reviewer'
  | 'publisher'
  | 'analyst'
  | 'website_operator'
  | 'ai_knowledge_manager'
  | 'read_only_stakeholder';

export interface StudioUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region_scope: string;
  client_id: string | null;
  created_at: string;
  last_login?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  platform_admin: ['*'],
  content_editor: ['content:read', 'content:create', 'content:edit', 'media:upload', 'media:edit'],
  reviewer: ['content:read', 'content:review', 'content:approve', 'content:request_changes', 'ethics:read', 'ethics:manage', 'tenders:read', 'tenders:manage'],
  publisher: ['content:read', 'content:publish', 'content:schedule', 'content:archive'],
  analyst: ['analytics:read', 'analytics:export'],
  website_operator: ['health:read', 'health:check', 'incidents:manage'],
  ai_knowledge_manager: ['ai:read', 'ai:manage_sources', 'ai:evaluate', 'ai:prompt_edit'],
  read_only_stakeholder: ['content:read', 'analytics:read', 'health:read']
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Session Creation
export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
  const db = getDb();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const sessionId = `sess_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // 7-day session expiry
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.execute({
    sql: `INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [sessionId, userId, tokenHash, expiresAt, ipAddress || '127.0.0.1', userAgent || 'Unknown']
  });

  return token;
}

// Get Authenticated User from Cookies
export async function getCurrentUser(): Promise<StudioUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('gf_studio_session')?.value;
  if (!token) return null;

  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const result = await db.execute({
    sql: `
      SELECT u.id, u.name, u.email, u.role, u.region_scope, u.client_id, u.created_at, u.last_login
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > ?
      LIMIT 1
    `,
    args: [tokenHash, now]
  });

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role) as UserRole,
    region_scope: String(row.region_scope || 'All'),
    client_id: row.client_id ? String(row.client_id) : null,
    created_at: String(row.created_at),
    last_login: row.last_login ? String(row.last_login) : undefined
  };
}

// Revoke session
export async function revokeSession(token: string): Promise<void> {
  const db = getDb();
  const tokenHash = hashToken(token);
  await db.execute({
    sql: `DELETE FROM sessions WHERE token_hash = ?`,
    args: [tokenHash]
  });
}
