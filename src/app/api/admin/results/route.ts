import { NextRequest, NextResponse } from 'next/server';
import { requireUser, resolveTargetClientId } from '@/lib/auth/guard';
import { listResultsDocuments } from '@/lib/results/store';

export async function GET(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const targetClientId = resolveTargetClientId(user, req);
  const documents = await listResultsDocuments(targetClientId);
  return NextResponse.json({ documents });
}
