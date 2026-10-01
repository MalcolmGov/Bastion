import crypto from 'crypto';

const BANNED_SECRETS = new Set([
  'sec_goldfields_bastion_2026_live',
  'gf_preview_secret_token_2026',
  'prev_sec_goldfields_draft_2026',
  'whsec_bastion_goldfields_2026',
  'bastion_sre_quick_approval_secret_2026',
]);

/** Returns a configured secret, or null when it is missing, short, or a known demo value. */
export function readSecret(envName: string, minLength = 16): string | null {
  const value = process.env[envName]?.trim();
  if (!value || value.length < minLength) return null;
  if (BANNED_SECRETS.has(value)) return null;
  return value;
}

export function secretsMatch(provided: string | null | undefined, expected: string | null): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function tokenFromRequest(authorization: string | null, queryToken?: string | null): string | null {
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();
    return token || null;
  }
  const query = queryToken?.trim();
  return query || null;
}
