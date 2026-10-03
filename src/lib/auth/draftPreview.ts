import crypto from 'node:crypto';
import { cookies, draftMode } from 'next/headers';
import { getCurrentUser, hasPermission, type StudioUser } from '@/lib/auth/auth';
import { readSecret, secretsMatch } from '@/lib/auth/apiToken';
import { isAgencyUser } from '@/lib/auth/roles';

/** The client that owns the root site (/, /reports, /operations ...); its pages and records are not tied to a /sites/<slug> website. */
export const FLAGSHIP_CLIENT_ID = 'client_goldfields';

/** Whether this signed-in person may see unpublished work that belongs to `ownerClientId`: agency staff, or staff of that client. */
export function mayViewDraftsOf(user: StudioUser | null, ownerClientId: string | null | undefined): boolean {
  if (!user || !hasPermission(user.role, 'content:read')) return false;
  if (isAgencyUser(user)) return true;
  return !!ownerClientId && user.client_id === ownerClientId;
}

/**
 * Draft mode is a cookie: it says a browser asked for drafts, not that it may have them. A site shows its drafts only
 * when the cookie is set and the person signed in may see that client's work, so one client's staff cannot read
 * another client's unpublished pages by browsing to its /sites/<slug> address with the cookie on.
 */
export async function draftPreviewActive(ownerClientId: string | null | undefined): Promise<boolean> {
  if (!(await draftMode()).isEnabled) return false;
  return mayViewDraftsOf(await getCurrentUser(), ownerClientId);
}

/** Issued by /api/preview to someone who proved they hold the preview secret, rather than signing in. */
export const PREVIEW_GRANT_COOKIE = 'bastion_preview_grant';
const GRANT_SCOPE = 'flagship';
const GRANT_TTL_MS = 12 * 60 * 60 * 1000;

function grantMac(expires: string, key: string): string {
  return crypto.createHmac('sha256', key).update(`${GRANT_SCOPE}.${expires}`).digest('hex');
}

/**
 * A grant says "this browser proved it holds the preview secret, until this time" and is signed with that secret, so it
 * carries no secret, cannot be forged or stretched, and stops working the moment the secret is changed or removed.
 */
export function signPreviewGrant(now = Date.now()): { value: string; maxAgeSeconds: number } | null {
  const key = readSecret('PREVIEW_SECRET_TOKEN');
  if (!key) return null;
  const expires = String(now + GRANT_TTL_MS);
  return { value: `${GRANT_SCOPE}.${expires}.${grantMac(expires, key)}`, maxAgeSeconds: GRANT_TTL_MS / 1000 };
}

export function verifyPreviewGrant(value: string | null | undefined, now = Date.now()): boolean {
  const key = readSecret('PREVIEW_SECRET_TOKEN');
  if (!key || typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 3) return false;
  const [scope, expiresText, mac] = parts;
  if (scope !== GRANT_SCOPE || !/^\d{1,15}$/.test(expiresText)) return false;
  const remaining = Number(expiresText) - now;
  if (remaining <= 0 || remaining > GRANT_TTL_MS) return false;
  return secretsMatch(mac, grantMac(expiresText, key));
}

/**
 * Whether drafts of the root site may be shown to this request: it holds a valid preview grant, or the person signed in
 * may see the flagship client's unpublished work. The draft-mode cookie only says drafts were asked for; this decides.
 */
export async function flagshipDraftsAllowed(): Promise<boolean> {
  const jar = await cookies();
  if (verifyPreviewGrant(jar.get(PREVIEW_GRANT_COOKIE)?.value)) return true;
  return mayViewDraftsOf(await getCurrentUser(), FLAGSHIP_CLIENT_ID);
}
