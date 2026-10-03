import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';
import { listCompositionReviews, readCompositionReview, decideCompositionReview } from '@/lib/studio/editor/compositionReview';
import { EditorSaveError } from '@/lib/studio/editor/saveComposition';
export async function GET(request:NextRequest) {
  const gate = await requirePermission('content:read'); if (!gate.ok) return gate.response;
  try {
    const id=request.nextUrl.searchParams.get('id');
    return NextResponse.json(id ? {review:await readCompositionReview(gate.user,id)} : {reviews:await listCompositionReviews(gate.user,request)});
  } catch(error) {return failure(error);}
}
export async function POST(request:NextRequest) {
  const gate=await requirePermission('content:read'); if (!gate.ok) return gate.response;
  try {const body=await request.json(); return NextResponse.json(await decideCompositionReview(gate.user,body.id,body));}
  catch(error) {return failure(error);}
}
function failure(error:unknown) {
  if (error instanceof EditorSaveError) return NextResponse.json({error:error.message},{status:error.status});
  console.error('[Page review]',error); return NextResponse.json({error:'The review could not be completed. Please retry.'},{status:500});
}
