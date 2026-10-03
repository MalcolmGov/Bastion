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
    const results = await saveWebsiteDrafts(
      gate.user,
      body.siteId,
      body.pages,
      body.options || { allowCreate: true },
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
