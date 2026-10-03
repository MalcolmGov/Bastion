import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { approvePageVersion, pageApprovalStatus, PageApprovalError } from '@/lib/studio/editor/pageApproval';

function failure(error: unknown) {
  if (error instanceof PageApprovalError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error('[Page approval]', error);
  return NextResponse.json({ error: 'The approval could not be recorded. Please try again.' }, { status: 500 });
}

/** Approval state of a page's current version, for the editor. */
export async function GET(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  try {
    const params = new URL(req.url).searchParams;
    return NextResponse.json(await pageApprovalStatus(gate.user, { siteId: params.get('siteId'), pageSlug: params.get('pageSlug') || 'home' }));
  } catch (error) {
    return failure(error);
  }
}

/** Records the signed-in reviewer's approval of the page's current saved version. */
export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid approval request.' }, { status: 400 });
    return NextResponse.json(await approvePageVersion(gate.user, body));
  } catch (error) {
    return failure(error);
  }
}
