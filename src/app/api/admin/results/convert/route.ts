import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { readStoredBrand } from '@/lib/results/brand';
import { convertMerafeExample, convertPdfBytes, convertSampleBooklet } from '@/lib/results/convert';
import { renderResultsHtml } from '@/lib/results/renderHtml';
import { saveResultsDocument } from '@/lib/results/store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const contentType = req.headers.get('content-type') || '';
    let document;
    let clientId: string | null = null;

    let brandInput: unknown = null;
    if (contentType.includes('application/json')) {
      const body = await req.json();
      clientId = body.clientId || null;
      brandInput = body.brand;
      if (body.example === 'merafe') document = await convertMerafeExample();
      else if (body.sample) document = await convertSampleBooklet();
      else return NextResponse.json({ error: 'Upload a PDF or choose an example booklet.' }, { status: 400 });
    } else {
      const form = await req.formData();
      const file = form.get('file');
      clientId = String(form.get('clientId') || '') || null;
      const brandField = form.get('brand');
      if (typeof brandField === 'string' && brandField) {
        try { brandInput = JSON.parse(brandField); } catch { brandInput = null; }
      }
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

    document.brand = readStoredBrand(brandInput);
    document.presentationHtml = renderResultsHtml(document);

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
