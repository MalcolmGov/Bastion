import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { listResultsDocuments } from '@/lib/results/store';

export async function GET() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const clientId = isAgencyUser(user) ? null : user.client_id;
  const documents = await listResultsDocuments(clientId);
  return NextResponse.json({ documents });
}
