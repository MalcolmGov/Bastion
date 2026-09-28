import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '';
  const collection = searchParams.get('collection') || 'pages';

  const validSecret = process.env.PREVIEW_SECRET_TOKEN || 'gf_preview_secret_token_2026';

  if (secret !== validSecret) {
    return new Response('Invalid preview token', { status: 401 });
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
