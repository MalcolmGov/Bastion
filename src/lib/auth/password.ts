import crypto from 'crypto';

/**
 * Per-user scrypt hash. Format: scrypt$<salt hex>$<hash hex>
 * Legacy SHA-256 hashes are verified only when AUTH_SALT is set, then
 * callers should replace them with hashPassword().
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function isLegacyPasswordHash(stored: string): boolean {
  return !!stored && !stored.startsWith('scrypt$');
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!password || !stored) return false;

  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$');
    const salt = parts[1];
    const hash = parts[2];
    if (!salt || !hash) return false;
    const verify = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    if (expected.length !== verify.length) return false;
    return crypto.timingSafeEqual(expected, verify);
  }

  const salt = process.env.AUTH_SALT?.trim();
  if (!salt) return false;
  const legacy = crypto.createHash('sha256').update(password + salt).digest();
  const expected = Buffer.from(stored, 'hex');
  if (expected.length !== legacy.length) return false;
  return crypto.timingSafeEqual(expected, legacy);
}
