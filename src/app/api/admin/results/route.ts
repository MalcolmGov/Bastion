import { NextRequest, NextResponse } from 'next/server';
import { requireUser, resolveTargetClientId } from '@/lib/auth/guard';
import { listResultsSummaries } from '@/lib/results/store';

export async function GET(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const targetClientId = resolveTargetClientId(user, req);
  const offset = Number(req.nextUrl.searchParams.get('offset') || '0');
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100_000) return NextResponse.json({ error: 'Invalid list offset.' }, { status: 400 });
  const documents = await listResultsSummaries(targetClientId, offset);
  return NextResponse.json({ documents: documents.slice(0, 50), nextOffset: documents.length > 50 ? offset + 50 : null });
}
