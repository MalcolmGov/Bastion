import crypto from 'node:crypto';
import { getDb } from '@/lib/db/client';

const BANNED_SECRETS = new Set([
  'sec_goldfields_bastion_2026_live',
  'gf_preview_secret_token_2026',
  'prev_sec_goldfields_draft_2026',
  'whsec_bastion_goldfields_2026',
  'bastion_sre_quick_approval_secret_2026',
]);

/** True for the demo secrets that appear in the source, now or in earlier versions, so anyone can read them. */
export function isPublicDemoSecret(value: string | null | undefined): boolean {
  return !!value && BANNED_SECRETS.has(value.trim());
}

/** Returns a configured secret, or null when it is missing, short, or a known demo value. */
export function readSecret(envName: string, minLength = 16): string | null {
  const value = process.env[envName]?.trim();
  if (!value || value.length < minLength) return null;
  if (isPublicDemoSecret(value)) return null;
  return value;
}

export function secretsMatch(provided: string | null | undefined, expected: string | null): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function tokenFromRequest(req: Request | { headers: { get: (name: string) => string | null } }, queryToken?: string | null): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  const xApiKey = req.headers.get('x-api-key')?.trim();
  if (xApiKey) return xApiKey;

  const query = queryToken?.trim();
  return query || null;
}

export interface ApiTokenRecord {
  id: string;
  name: string;
  clientId: string;
  siteId?: string | null;
  scopes: string[];
  createdAt: string;
  revokedAt?: string | null;
}

export interface ApiTokenAuthResult {
  ok: boolean;
  status: number;
  error?: string;
  clientId?: string;
  siteId?: string;
  scopes?: string[];
  isAgencyAdmin?: boolean;
}

/**
 * Creates a new scoped API token for a site/client.
 * Returns the raw token string (only shown once) and stored record metadata.
 */
export async function createApiToken(params: {
  name: string;
  clientId: string;
  siteId?: string | null;
  scopes: string[];
}): Promise<{ rawToken: string; record: ApiTokenRecord }> {
  const db = getDb();
  const rawToken = `bst_tok_${crypto.randomBytes(32).toString('base64url')}`;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const id = `tok_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `
      INSERT INTO api_tokens (id, name, token_hash, client_id, site_id, scopes_json, created_at, revoked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `,
    args: [id, params.name, tokenHash, params.clientId, params.siteId || null, JSON.stringify(params.scopes), now]
  });

  return {
    rawToken,
    record: {
      id,
      name: params.name,
      clientId: params.clientId,
      siteId: params.siteId || null,
      scopes: params.scopes,
      createdAt: now,
      revokedAt: null
    }
  };
}

/**
 * Lists active API tokens for a client/site
 */
export async function listApiTokens(clientId?: string): Promise<ApiTokenRecord[]> {
  const db = getDb();
  const query = clientId
    ? {
        sql: `SELECT id, name, client_id, site_id, scopes_json, created_at, revoked_at FROM api_tokens WHERE client_id = ? AND revoked_at IS NULL ORDER BY created_at DESC`,
        args: [clientId]
      }
    : {
        sql: `SELECT id, name, client_id, site_id, scopes_json, created_at, revoked_at FROM api_tokens WHERE revoked_at IS NULL ORDER BY created_at DESC`,
        args: []
      };

  const res = await db.execute(query);
  return res.rows.map((r: any) => ({
    id: String(r.id),
    name: String(r.name),
    clientId: String(r.client_id),
    siteId: r.site_id ? String(r.site_id) : null,
    scopes: typeof r.scopes_json === 'string' ? JSON.parse(r.scopes_json) : (r.scopes_json || []),
    createdAt: String(r.created_at),
    revokedAt: r.revoked_at ? String(r.revoked_at) : null
  }));
}

/**
 * Revokes an API token
 */
export async function revokeApiToken(tokenId: string, clientId?: string): Promise<boolean> {
  const db = getDb();
  const now = new Date().toISOString();
  const query = clientId
    ? {
        sql: `UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND client_id = ? AND revoked_at IS NULL`,
        args: [now, tokenId, clientId]
      }
    : {
        sql: `UPDATE api_tokens SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL`,
        args: [now, tokenId]
      };

  const res = await db.execute(query);
  return (res.rowsAffected || 0) > 0;
}

/**
 * Verifies request token against the database per-site tokens, falling back to
 * valid server-level API_SECRET_TOKEN with agency super-admin privileges.
 */
export async function verifyApiToken(
  req: Request | { headers: { get: (name: string) => string | null } },
  queryToken?: string | null,
  requiredScope?: string
): Promise<ApiTokenAuthResult> {
  const rawToken = tokenFromRequest(req, queryToken);
  if (!rawToken) {
    return { ok: false, status: 401, error: 'Unauthorized: Missing API credentials (Bearer token or x-api-key required)' };
  }

  // 1. Check server-level API_SECRET_TOKEN for agency/platform admin operations
  const serverSecret = readSecret('API_SECRET_TOKEN');
  if (serverSecret && secretsMatch(rawToken, serverSecret)) {
    return {
      ok: true,
      status: 200,
      clientId: 'agency',
      scopes: ['*'],
      isAgencyAdmin: true
    };
  }

  // 2. Check hashed database per-site token
  try {
    const db = getDb();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const res = await db.execute({
      sql: `SELECT id, name, client_id, site_id, scopes_json, revoked_at FROM api_tokens WHERE token_hash = ? LIMIT 1`,
      args: [tokenHash]
    });

    if (res.rows.length === 0) {
      return { ok: false, status: 401, error: 'Unauthorized: Invalid API token' };
    }

    const row = res.rows[0];
    if (row.revoked_at) {
      return { ok: false, status: 401, error: 'Unauthorized: API token has been revoked' };
    }

    let scopes: string[] = [];
    try {
      scopes = typeof row.scopes_json === 'string' ? JSON.parse(row.scopes_json as string) : (row.scopes_json as any || []);
    } catch (_) {
      scopes = [];
    }

    if (requiredScope && !scopes.includes('*') && !scopes.includes(requiredScope)) {
      return {
        ok: false,
        status: 403,
        error: `Forbidden: API token lacks required scope '${requiredScope}'`
      };
    }

    return {
      ok: true,
      status: 200,
      clientId: String(row.client_id),
      siteId: row.site_id ? String(row.site_id) : undefined,
      scopes,
      isAgencyAdmin: false
    };
  } catch (err) {
    console.error('[API Token] Error validating token in database:', err);
    return { ok: false, status: 500, error: 'Internal security authentication error' };
  }
}
