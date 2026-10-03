import { isAgencyUser } from '@/lib/auth/roles';
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';
import {
  saveWebsiteDrafts,
  EditorSaveError,
} from '@/lib/studio/editor/saveComposition';
export async function POST(request: NextRequest) {
  const gate = await requirePermission('content:edit');
  if (!gate.ok) return gate.response;
  try {
    const body = await request.json();
    const handover = body.options?.allowCreate === true || body.options?.status === 'in_review';
    if (handover && !isAgencyUser(gate.user)) return NextResponse.json({error:'Only agency staff can create or hand over report pages.'},{status:403});
    if (body.options?.status && !['draft','in_review'].includes(body.options.status)) return NextResponse.json({error:'The assistant saves drafts or submits reviews; it cannot publish.'},{status:400});
    const results = await saveWebsiteDrafts(
      gate.user,
      body.siteId,
      body.pages,
      { allowCreate: handover && isAgencyUser(gate.user), status: body.options?.status === 'in_review' ? 'in_review' : 'draft' },
    );
    return NextResponse.json({ pages: results });
  } catch (error) {
    if (error instanceof EditorSaveError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error('[Website assistant apply]', error);
    return NextResponse.json(
      {
        error:
          'The website changes could not be saved. No changes were applied.',
      },
      { status: 500 },
    );
  }
}
