import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { sanitizePublicationHtml } from '@/lib/results/codeAssistant';
import { getResultsDocument, saveResultsDocument } from '@/lib/results/store';
import type { ResultsDocument } from '@/lib/results/types';

function isDocument(value: unknown): value is ResultsDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as ResultsDocument;
  return typeof document.issuer === 'string' && Array.isArray(document.statements);
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  const document = await getResultsDocument(id);
  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(document);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
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
