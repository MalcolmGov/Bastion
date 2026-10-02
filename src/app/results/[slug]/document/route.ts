import { NextResponse } from 'next/server';
import { getPublishedResultsBySlug } from '@/lib/results/store';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const stored = await getPublishedResultsBySlug(slug);
  const html = stored?.document.presentationHtml;
  if (!stored || !html) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
      // Published booklets are static documents. Sandbox without allow-same-origin gives them an opaque
      // origin and no scripts, so stored markup can never reach the studio session or admin APIs.
      'content-security-policy':
        "sandbox allow-popups allow-popups-to-escape-sandbox; default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src https: data:; base-uri 'none'; form-action 'none'",
    },
  });
}
