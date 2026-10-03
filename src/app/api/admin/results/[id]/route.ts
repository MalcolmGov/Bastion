import { NextRequest, NextResponse } from 'next/server';
import { requireUser, clientOwns } from '@/lib/auth/guard';
import { packRevision } from '@/lib/results/history';
import { hasPermission } from '@/lib/auth/auth';
import { validateFinancials } from '@/lib/results/validateFinancials';
import { renderResultsHtml } from '@/lib/results/renderHtml';
import { sanitizePublicationHtml, assertPublicationContentPreserved } from '@/lib/results/codeAssistant';
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

  if (!clientOwns(user, document.clientId)) {
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

  if (!clientOwns(user, current.clientId)) {
    return NextResponse.json({ error: 'Forbidden: Cannot edit document belonging to another client tenant.' }, { status: 403 });
  }

  const body = await req.json();
  if (!isDocument(body.document)) {
    return NextResponse.json({ error: 'A results document is required.' }, { status: 400 });
  }
  const status = body.status === 'published' ? 'published' : 'draft';
  if (!hasPermission(user.role, status === 'published' ? 'content:publish' : 'content:edit')) return NextResponse.json({ error: 'Your role does not permit this action.' }, { status: 403 });
  if (body.expectedUpdatedAt !== current.updatedAt) return NextResponse.json({ error: 'This draft changed in another session. Reopen it before saving.' }, { status: 409 });
  try {
    // Original PDF evidence cannot be replaced by a styling or figures request.
    body.document.sourceFinancialContext = current.document.sourceFinancialContext;
    body.document.sourcePages = current.document.sourcePages;
    body.document.sourceFilename = current.document.sourceFilename;
    body.document.pageCount = current.document.pageCount;
    body.document.warnings = current.document.warnings;
    if (status === 'published' && !hasPermission(user.role, 'content:edit') && packRevision(body.document).hash !== packRevision(current.document).hash) return NextResponse.json({ error: 'Save content changes through an editor before publishing.' }, { status: 403 });
    if (typeof body.document.presentationHtml !== 'string') body.document.presentationHtml = renderResultsHtml(body.document);
    if (typeof body.document.presentationHtml === 'string') {
      body.document.presentationHtml = sanitizePublicationHtml(body.document.presentationHtml);
      try {
        assertPublicationContentPreserved(sanitizePublicationHtml(renderResultsHtml(body.document)), body.document.presentationHtml);
      } catch (error) {
        // Renderer upgrades must not prevent an unchanged legacy publication from being saved.
        // Only accept its existing content baseline when the underlying transcription is unchanged.
        const transcription = (document: ResultsDocument) => packRevision({ ...document, presentationHtml: undefined, brand: undefined }).hash;
        if (!current.document.presentationHtml || transcription(body.document) !== transcription(current.document)) throw error;
        assertPublicationContentPreserved(sanitizePublicationHtml(current.document.presentationHtml), body.document.presentationHtml);
      }
    }
    if (status === 'published' && body.sourceReviewed !== true) return NextResponse.json({ error: 'Compare the complete publication with the original PDF and confirm the source review before publishing.' }, { status: 400 });
    if (status === 'published' && validateFinancials(body.document).issues.length && body.validationReviewed !== true) return NextResponse.json({ error: 'Review the financial validation items before publishing. Original source figures have not been changed.' }, { status: 400 });
    const saved = await saveResultsDocument({ id, document: body.document, status, expectedUpdatedAt: body.expectedUpdatedAt, actor: { id: user.id, name: user.name } });
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The publication could not be saved.' }, { status: 400 });
  }
}
