import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { readSecret, secretsMatch } from '@/lib/auth/apiToken';
import { FLAGSHIP_CLIENT_ID, mayViewDraftsOf } from '@/lib/auth/draftPreview';

// A slug becomes part of the redirect target, so it may only be a plain page or record name, never a path or a URL.
const SLUG = /^[a-z0-9][a-z0-9_-]{0,79}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '';
  const collection = searchParams.get('collection') || 'pages';

  const user = await getCurrentUser();
  const secretOk = secretsMatch(secret, readSecret('PREVIEW_SECRET_TOKEN'));
  if (!user && !secretOk) {
    return new Response('Invalid preview token', { status: 401 });
  }
  // This switches on draft mode for the root site, which is the flagship client's. A signed-in person needs to be allowed
  // to see that client's unpublished work; the preview secret is its own credential.
  if (!secretOk && !mayViewDraftsOf(user, FLAGSHIP_CLIENT_ID)) {
    return new Response('You cannot preview unpublished content for this site.', { status: 403 });
  }
  if (slug && !SLUG.test(slug)) {
    return new Response('Invalid preview slug', { status: 400 });
  }

  // Enable Draft Mode by setting the draft_mode cookie
  const draft = await draftMode();
  draft.enable();

  // Determine redirection path
  let redirectPath = '/';
  if (collection === 'pages') {
    redirectPath = slug === 'home' ? '/' : `/${slug}`;
  } else if (collection === 'operations') {
    redirectPath = `/operations/${slug}`;
  } else if (collection === 'reports') {
    redirectPath = '/reports';
  } else if (collection === 'news') {
    redirectPath = `/media/${slug}`;
  } else if (collection === 'sustainability') {
    redirectPath = '/sustainability';
  } else if (collection === 'jobs') {
    redirectPath = '/careers';
  } else if (collection === 'suppliers') {
    redirectPath = '/suppliers';
  }

  redirect(redirectPath);
}
