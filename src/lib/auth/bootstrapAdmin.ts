import crypto from 'node:crypto';
import type { Client } from '@libsql/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { isPublicDemoSecret } from '@/lib/auth/apiToken';

/**
 * Passwords that were written into this repository's seed and scripts. Anyone who has read the source knows them, so no
 * account may keep one and none may be chosen again.
 */
export const PUBLISHED_PASSWORDS: readonly string[] = ['Bastion2026!', 'GoldFields2026!'];

/** Accounts those passwords were created for. Checked in any role, on top of every platform admin. */
const PUBLISHED_ACCOUNTS: readonly string[] = ['malcolm@movedigital.africa', 'admin@goldfields.com'];

/** Not a valid hash, so verifyPassword never accepts it. Marks an account whose password has been taken away. */
export const REVOKED_HASH = 'revoked$published-default-credential';

export const MIN_BOOTSTRAP_PASSWORD_LENGTH = 12;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let warnedNoAdmin = false;

async function audit(db: Client, actor: string, action: string, recordId: string, details: Record<string, unknown>) {
  try {
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, created_at)
            VALUES (?, ?, ?, ?, 'users', ?, 'success', ?, ?)`,
      args: [`aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, actor, 'Startup security check', action, recordId, JSON.stringify(details), new Date().toISOString()]
    });
  } catch (error) {
    console.warn(`[Security] Could not write the audit entry for ${action}:`, (error as Error).message);
  }
}

/**
 * Takes the password away from every platform admin, and from the known demo accounts, whose password is still one that was
 * published in this repository, and signs them out. Their owner sets a new one through BOOTSTRAP_ADMIN_* or an invitation.
 * Returns how many accounts were revoked.
 */
export async function revokePublishedCredentials(db: Client): Promise<number> {
  const accounts = (await db.execute({
    sql: `SELECT id, email, role, password_hash FROM users WHERE role = 'platform_admin' OR LOWER(email) IN (${PUBLISHED_ACCOUNTS.map(() => '?').join(',')})`,
    args: [...PUBLISHED_ACCOUNTS]
  })).rows;

  let revoked = 0;
  for (const account of accounts) {
    const hash = String(account.password_hash || '');
    if (!hash.startsWith('scrypt$') || !PUBLISHED_PASSWORDS.some(password => verifyPassword(password, hash))) continue;
    const id = String(account.id);
    await db.execute({ sql: `UPDATE users SET password_hash = ?, must_reset_password = 1 WHERE id = ?`, args: [REVOKED_HASH, id] });
    try {
      await db.execute({ sql: `DELETE FROM sessions WHERE user_id = ?`, args: [id] });
    } catch (error) {
      console.warn('[Security] Could not end the sessions of a revoked account:', (error as Error).message);
    }
    await audit(db, 'system_startup', 'PUBLISHED_CREDENTIAL_REVOKED', id, { email: String(account.email), role: String(account.role) });
    console.warn(`[Security] ${account.email} was using a password published in this repository. It has been revoked and the account signed out. ` +
      `Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (at least ${MIN_BOOTSTRAP_PASSWORD_LENGTH} characters) and restart to set a new one.`);
    revoked++;
  }
  return revoked;
}

function usableHash(hash: unknown): boolean {
  const value = String(hash || '');
  return value !== '' && !value.startsWith('revoked$');
}

function refusal(reason: string): 'skipped' {
  console.warn(`[Bootstrap] BOOTSTRAP_ADMIN_* ignored: ${reason}`);
  return 'skipped';
}

/**
 * Gives a deployment its first platform admin, or gives one back after a revocation, from BOOTSTRAP_ADMIN_EMAIL and
 * BOOTSTRAP_ADMIN_PASSWORD. It acts only when no platform admin can sign in, so it can never replace or add to a working
 * admin. It does not promote an existing non-admin account.
 */
export async function bootstrapPlatformAdmin(db: Client): Promise<'created' | 'recovered' | 'skipped'> {
  const admins = (await db.execute(`SELECT password_hash FROM users WHERE role = 'platform_admin'`)).rows;
  if (admins.some(admin => usableHash(admin.password_hash))) return 'skipped';

  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || '';
  if (!email && !password) {
    if (!warnedNoAdmin) {
      warnedNoAdmin = true;
      console.error('[Bootstrap] No platform admin can sign in. Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (at least ' +
        `${MIN_BOOTSTRAP_PASSWORD_LENGTH} characters) and restart to create one.`);
    }
    return 'skipped';
  }
  if (!EMAIL.test(email)) return refusal('BOOTSTRAP_ADMIN_EMAIL is not a valid email address.');
  if (password.length < MIN_BOOTSTRAP_PASSWORD_LENGTH) return refusal(`BOOTSTRAP_ADMIN_PASSWORD must be at least ${MIN_BOOTSTRAP_PASSWORD_LENGTH} characters.`);
  if (PUBLISHED_PASSWORDS.includes(password) || isPublicDemoSecret(password)) return refusal('BOOTSTRAP_ADMIN_PASSWORD is a value published in this repository.');

  const existing = (await db.execute({ sql: `SELECT id, role FROM users WHERE LOWER(email) = ? LIMIT 1`, args: [email] })).rows[0];
  if (existing && String(existing.role) !== 'platform_admin') return refusal('that email belongs to an account that is not a platform admin.');

  const hash = hashPassword(password);
  if (existing) {
    await db.execute({ sql: `UPDATE users SET password_hash = ?, must_reset_password = 0 WHERE id = ?`, args: [hash, String(existing.id)] });
    await audit(db, 'system_startup', 'BOOTSTRAP_ADMIN_RECOVERED', String(existing.id), { email });
    console.warn(`[Bootstrap] Set a new password for ${email} from BOOTSTRAP_ADMIN_PASSWORD.`);
    return 'recovered';
  }

  const id = `usr_${crypto.randomUUID()}`;
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at) VALUES (?, 'Platform Administrator', ?, ?, 'platform_admin', 'All', NULL, ?)`,
    args: [id, email, hash, new Date().toISOString()]
  });
  await audit(db, 'system_startup', 'BOOTSTRAP_ADMIN_CREATED', id, { email });
  console.warn(`[Bootstrap] Created platform admin ${email} from BOOTSTRAP_ADMIN_*.`);
  return 'created';
}
