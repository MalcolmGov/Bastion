import { draftMode } from 'next/headers';
import { getCurrentUser, hasPermission, type StudioUser } from '@/lib/auth/auth';
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
