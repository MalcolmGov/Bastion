import crypto from 'node:crypto';
import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getCurrentUser, type StudioUser } from '@/lib/auth/auth';
import { readSecret, secretsMatch } from '@/lib/auth/apiToken';
import { FLAGSHIP_CLIENT_ID, PREVIEW_GRANT_COOKIE, mayViewDraftsOf, signPreviewGrant } from '@/lib/auth/draftPreview';
import { getDb } from '@/lib/db/client';
import { rateLimitResponse } from '@/lib/security/rateLimiter';

// A slug becomes part of the redirect target, so it may only be a plain page or record name, never a path or a URL.
const SLUG = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

// The secret is the one way in that needs no account, so guesses are limited per address.
const SECRET_ATTEMPTS = 10;
const SECRET_WINDOW_MS = 15 * 60 * 1000;

/** Who asked for drafts and how it went, without ever recording the secret or a guess at it. */
async function recordPreviewAudit(
  req: NextRequest,
  action: 'PREVIEW_ENABLED' | 'PREVIEW_DENIED',
  actor: StudioUser | null,
  details: Record<string, unknown>
) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
    await getDb().execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, result, details_json, ip_address, created_at)
            VALUES (?, ?, ?, ?, 'preview', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        actor?.id || 'preview-secret',
        actor?.name || 'Preview secret holder',
        action,
        action === 'PREVIEW_ENABLED' ? 'success' : 'denied',
        JSON.stringify(details),
        ip,
        new Date().toISOString(),
      ],
    });
  } catch (error) {
    console.warn(`[Audit Log] Notice recording ${action}:`, error);
  }
}

interface PreviewRequest {
  secret: string | null;
  collection: string;
  slug: string;
}

type Admission = { response: Response } | { via: 'secret' | 'session'; actor: StudioUser | null };

/** Decides who may switch draft mode on, and records what happened. Either a refusal to send back, or how they got in. */
async function admit(req: NextRequest, { secret, collection, slug }: PreviewRequest): Promise<Admission> {
  if (secret !== null) {
    const limited = rateLimitResponse(req, 'preview-secret', SECRET_ATTEMPTS, SECRET_WINDOW_MS);
    if (limited) return { response: limited };
  }

  const user = await getCurrentUser();
  const secretOk = secretsMatch(secret, readSecret('PREVIEW_SECRET_TOKEN'));
  if (!user && !secretOk) {
    // Only an attempt with a secret is worth a record; every scanner that hits this URL is not.
    if (secret !== null) await recordPreviewAudit(req, 'PREVIEW_DENIED', null, { reason: 'bad_secret', collection, slug });
    return { response: new Response('Invalid preview token', { status: 401 }) };
  }
  // This switches on draft mode for the root site, which is the flagship client's. A signed-in person needs to be allowed
  // to see that client's unpublished work; the preview secret is its own credential.
  if (!secretOk && !mayViewDraftsOf(user, FLAGSHIP_CLIENT_ID)) {
    await recordPreviewAudit(req, 'PREVIEW_DENIED', user, { reason: 'not_entitled', collection, slug });
    return { response: new Response('You cannot preview unpublished content for this site.', { status: 403 }) };
  }
  if (slug && !SLUG.test(slug)) {
    return { response: new Response('Invalid preview slug', { status: 400 }) };
  }

  const via = secretOk ? 'secret' : 'session';
  const actor = secretOk ? null : user;
  await recordPreviewAudit(req, 'PREVIEW_ENABLED', actor, { via, collection, slug });
  return { via, actor };
}

/** Draft mode is only a request for drafts. Someone who got in with the secret carries a signed grant that the root site
 *  checks before showing them; a signed-in person is checked against their session instead. */
async function issueGrant() {
  const grant = signPreviewGrant();
  if (!grant) return;
  (await cookies()).set(PREVIEW_GRANT_COOKIE, grant.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: grant.maxAgeSeconds,
  });
}

// Where each kind of content is shown on the root site. Anything else lands on the home page.
const PAGE_FOR: ReadonlyMap<string, (slug: string) => string> = new Map([
  ['pages', (slug) => (slug === 'home' ? '/' : `/${slug}`)],
  ['operations', (slug) => `/operations/${slug}`],
  ['reports', () => '/reports'],
  ['news', (slug) => `/media/${slug}`],
  ['sustainability', () => '/sustainability'],
  ['jobs', () => '/careers'],
  ['suppliers', () => '/suppliers'],
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const request: PreviewRequest = {
    secret: searchParams.get('secret'),
    collection: searchParams.get('collection') || 'pages',
    slug: searchParams.get('slug') || '',
  };

  const admission = await admit(req, request);
  if ('response' in admission) return admission.response;

  // Enable Draft Mode by setting the draft_mode cookie
  (await draftMode()).enable();
  if (admission.via === 'secret') await issueGrant();

  redirect(PAGE_FOR.get(request.collection)?.(request.slug) ?? '/');
}
