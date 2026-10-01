import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { sanitizePublicationHtml } from '@/lib/results/codeAssistant';
import { getResultsDocument, saveResultsDocument } from '@/lib/results/store';
import type { ResultsDocument } from '@/lib/results/types';

function isDocument(value: unknown): value is ResultsDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as ResultsDocument;
  return typeof document.issuer === 'string' && Array.isArray(document.statements);
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const { id } = await context.params;
  const document = await getResultsDocument(id);
  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!isAgencyUser(user) && document.clientId && document.clientId !== user.client_id) {
    return NextResponse.json({ error: 'Forbidden: Document belongs to another client tenant.' }, { status: 403 });
  }

  return NextResponse.json(document);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const { id } = await context.params;
  const current = await getResultsDocument(id);
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!isAgencyUser(user) && current.clientId && current.clientId !== user.client_id) {
    return NextResponse.json({ error: 'Forbidden: Cannot edit document belonging to another client tenant.' }, { status: 403 });
  }

  const body = await req.json();
  if (!isDocument(body.document)) {
    return NextResponse.json({ error: 'A results document is required.' }, { status: 400 });
  }
  const status = body.status === 'published' ? 'published' : 'draft';
  if (typeof body.document.presentationHtml === 'string') {
    body.document.presentationHtml = sanitizePublicationHtml(body.document.presentationHtml);
  }
  const saved = await saveResultsDocument({
    id,
    document: body.document,
    status,
  });
  return NextResponse.json(saved);
}
