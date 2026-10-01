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
    },
  });
}
