import crypto from 'node:crypto';
import { cookies, draftMode } from 'next/headers';
import { getCurrentUser, hasPermission, type StudioUser } from '@/lib/auth/auth';
import { isPublicDemoSecret, readSecret, secretsMatch } from '@/lib/auth/apiToken';
import { isAgencyUser } from '@/lib/auth/roles';

/** The client that owns the root site (/, /reports, /operations ...); its pages and records are not tied to a /sites/<slug> website. */
export const FLAGSHIP_CLIENT_ID = 'client_goldfields';

/** Whether this signed-in person may see unpublished work that belongs to `ownerClientId`: agency staff, or staff of that client. */
export function mayViewDraftsOf(user: StudioUser | null, ownerClientId: string | null | undefined): boolean {
  if (!user || !hasPermission(user.role, 'content:read')) return false;
  if (isAgencyUser(user)) return true;
  return !!ownerClientId && user.client_id === ownerClientId;
}

/** A website row. The preview checks read its id, client_id and settings_json. */
export type PreviewSite = Record<string, unknown>;

/**
 * Draft mode is a cookie: it says a browser asked for drafts, not that it may have them. A site shows its drafts only
 * when the cookie is set and either the person signed in may see that client's work, or the browser holds a valid grant
 * for this site (issued to someone who proved they hold the site's own preview secret). So one client's staff cannot read
 * another client's unpublished pages by browsing to its /sites/<slug> address with the cookie on, and a grant for one site
 * opens no other.
 */
export async function draftPreviewActive(site: PreviewSite): Promise<boolean> {
  if (!(await draftMode()).isEnabled) return false;
  const owner = site.client_id == null ? null : String(site.client_id);
  if (mayViewDraftsOf(await getCurrentUser(), owner)) return true;
  const name = siteGrantCookieName(site.id);
  if (!name) return false;
  return verifySiteGrant(site, (await cookies()).get(name)?.value);
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

// ---- a site's own preview secret ----

export const SITE_GRANT_COOKIE_PREFIX = 'bastion_preview_site_';
const SITE_ID = /^[A-Za-z0-9_-]{1,80}$/;
const MIN_SITE_SECRET_LENGTH = 16;

/**
 * The preview secret an agency set for this site in Settings ("Draft Verification Token"), or null when there is none or it
 * is not one that counts: too short, or a public demo value from the source code, which anyone could use.
 */
export function sitePreviewSecret(site: PreviewSite): string | null {
  let settings: any = site.settings_json;
  if (typeof settings === 'string') {
    try {
      settings = JSON.parse(settings);
    } catch {
      return null;
    }
  }
  const secret = settings?.headlessIntegration?.previewSecret;
  if (typeof secret !== 'string' || secret.length < MIN_SITE_SECRET_LENGTH || isPublicDemoSecret(secret)) return null;
  return secret;
}

/** One cookie per site, named after it, so a browser can hold passes for several sites at once. Null for an id that is not a safe cookie name. */
export function siteGrantCookieName(siteId: unknown): string | null {
  const id = String(siteId ?? '');
  return SITE_ID.test(id) ? `${SITE_GRANT_COOKIE_PREFIX}${id}` : null;
}

function siteGrantMac(siteId: string, expires: string, key: string): string {
  return crypto.createHmac('sha256', key).update(`site.${siteId}.${expires}`).digest('hex');
}

/**
 * Like the root grant, but bound to one site and signed with that site's own secret: it opens that site's drafts and
 * nothing else, and stops working the moment the secret is changed or cleared in Settings.
 */
export function signSiteGrant(site: PreviewSite, now = Date.now()): { name: string; value: string; maxAgeSeconds: number } | null {
  const key = sitePreviewSecret(site);
  const name = siteGrantCookieName(site.id);
  if (!key || !name) return null;
  const expires = String(now + GRANT_TTL_MS);
  return { name, value: `${expires}.${siteGrantMac(String(site.id), expires, key)}`, maxAgeSeconds: GRANT_TTL_MS / 1000 };
}

export function verifySiteGrant(site: PreviewSite, value: string | null | undefined, now = Date.now()): boolean {
  const key = sitePreviewSecret(site);
  if (!key || !siteGrantCookieName(site.id) || typeof value !== 'string') return false;
  const parts = value.split('.');
  if (parts.length !== 2 || !/^\d{1,15}$/.test(parts[0])) return false;
  const remaining = Number(parts[0]) - now;
  if (remaining <= 0 || remaining > GRANT_TTL_MS) return false;
  return secretsMatch(parts[1], siteGrantMac(String(site.id), parts[0], key));
}
