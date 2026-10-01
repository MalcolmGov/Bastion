import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { convertMerafeExample, convertPdfBytes, convertSampleBooklet } from '@/lib/results/convert';
import { saveResultsDocument } from '@/lib/results/store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;
  const user = gate.user;

  try {
    const contentType = req.headers.get('content-type') || '';
    let document;
    let clientId: string | null = null;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientId = isAgencyUser(user) ? (body.clientId || null) : user.client_id;
      if (body.example === 'merafe') document = await convertMerafeExample();
      else if (body.sample) document = await convertSampleBooklet();
      else return NextResponse.json({ error: 'Upload a PDF or choose an example booklet.' }, { status: 400 });
    } else {
      const form = await req.formData();
      const file = form.get('file');
      clientId = isAgencyUser(user) ? (String(form.get('clientId') || '') || null) : user.client_id;
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Choose a PDF results booklet.' }, { status: 400 });
      }
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: 'PDF must be 20 MB or smaller.' }, { status: 400 });
      }
      const name = file.name || 'results.pdf';
      if (!name.toLowerCase().endsWith('.pdf') && file.type && file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF booklets can be converted.' }, { status: 400 });
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      document = await convertPdfBytes(bytes, name);
    }

    const saved = await saveResultsDocument({
      clientId,
      document,
      status: 'draft',
    });
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Conversion failed';
    console.error('Results conversion error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
