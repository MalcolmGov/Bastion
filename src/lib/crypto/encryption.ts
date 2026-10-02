/**
 * Bastion Move Studio: Secret & Token Encryption at Rest
 * Implements AES-256-GCM authenticated encryption for sensitive third-party
 * API tokens and credentials persisted in SQLite/Turso.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard recommended IV length for AES-GCM
const PREFIX = 'enc$gcm$';

function getDerivedKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY?.trim() || process.env.API_SECRET_TOKEN?.trim();
  if (!secret) {
    // Never fall back to a key that is published in source control for production data.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY (or API_SECRET_TOKEN) must be set to encrypt or decrypt stored secrets.');
    }
    return crypto.scryptSync('bastion_dev_only_vault_key', 'bastion_vault_salt_v1', 32);
  }
  return crypto.scryptSync(secret, 'bastion_vault_salt_v1', 32);
}

/** Check if a value is encrypted with Bastion AES-256-GCM */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

/** Encrypt plaintext string into enc$gcm$<iv>$<tag>$<ciphertext> */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  if (isEncrypted(plaintext)) return plaintext; // already encrypted

  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return `${PREFIX}${iv.toString('hex')}$${tag}$${encrypted}`;
}

/** Decrypt enc$gcm$<iv>$<tag>$<ciphertext> into plaintext string */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext) return '';
  if (!isEncrypted(ciphertext)) {
    // Unencrypted legacy token, return as-is
    return ciphertext;
  }

  try {
    const parts = ciphertext.slice(PREFIX.length).split('$');
    if (parts.length !== 3) return ciphertext;

    const [ivHex, tagHex, dataHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('[Encryption] Decryption failed:', err.message);
    throw new Error('Failed to decrypt token; vault encryption key mismatch or corrupted data.');
  }
}
