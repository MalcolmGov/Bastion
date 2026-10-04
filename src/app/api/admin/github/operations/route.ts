import { NextRequest, NextResponse } from 'next/server';
import { requireAgencyUser } from '@/lib/auth/guard';
import { getDb } from '@/lib/db/client';
import { OperationsError, repositorySnapshot, linkRepository, unlinkRepository } from '@/lib/github/operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
function failure(error: unknown) {
  return error instanceof OperationsError ? json({ error: error.message }, error.status) : json({ error: 'The repository connection could not be updated. Retry shortly.' }, 500);
}
async function site(req: NextRequest) {
  const siteId = req.nextUrl.searchParams.get('siteId') || '';
  if (!siteId || siteId.length > 150) throw new OperationsError('Select a website first.');
  const result = await getDb().execute({ sql: 'SELECT id FROM websites WHERE id = ?', args: [siteId] });
  if (!result.rows.length) throw new OperationsError('Website not found.', 404);
  return siteId;
}
export async function GET(req: NextRequest) {
  const gate = await requireAgencyUser();
  if (!gate.ok) return gate.response;
  try { return json(await repositorySnapshot(await site(req))); }
  catch (error) { return failure(error); }
}
export async function POST(req: NextRequest) {
  const gate = await requireAgencyUser();
  if (!gate.ok) return gate.response;
  if (req.headers.get('origin') && req.headers.get('origin') !== req.nextUrl.origin) return json({ error: 'Invalid request origin.' }, 403);
  try {
    const siteId = await site(req);
    const text = await req.text();
    if (text.length > 4000) return json({ error: 'Request too large.' }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: 'Invalid request body.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request body.' }, 400);
    if (body.action === 'unlink') {
      if (!Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 1) return json({ error: 'Connection revision required.' }, 400);
      await unlinkRepository(siteId, body.expectedRevision, gate.user.id);
      return json({ success: true });
    }
    return json({ link: await linkRepository(siteId, body, gate.user.id) });
  } catch (error) { return failure(error); }
}
