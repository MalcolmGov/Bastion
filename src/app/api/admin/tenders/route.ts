import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { listAllTenders, createTender, listTenderSubmissions, updateTenderSubmissionStatus } from '@/lib/tenders/tenderService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const url = new URL(req.url);
    const requestedClient = url.searchParams.get('clientId');
    const view = url.searchParams.get('view') || 'tenders'; // 'tenders' | 'submissions'
    const tenderId = url.searchParams.get('tenderId') || undefined;
    const targetClientId = (isAgencyUser(user) && requestedClient ? requestedClient : user.client_id) || '';

    if (view === 'submissions') {
      const submissions = await listTenderSubmissions(tenderId, targetClientId || null);
      return NextResponse.json({ success: true, submissions });
    }

    const tenders = await listAllTenders(targetClientId || null);
    return NextResponse.json({ success: true, tenders });
  } catch (err: any) {
    console.error('[API Admin Tenders GET Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to list tenders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const {
      tenderNumber,
      title,
      category,
      description,
      estimatedValue,
      closingDate,
      minBbbeeLevel,
      cidbGrading,
      hostCommunityMandate,
      scopeDocumentUrl,
      clientId,
    } = body;

    if (!tenderNumber || !title || !category || !description || !closingDate) {
      return NextResponse.json(
        { error: 'Mandatory fields missing: tenderNumber, title, category, description, and closingDate are required.' },
        { status: 400 }
      );
    }

    const targetClientId = (isAgencyUser(user) && clientId ? clientId : user.client_id) || 'client_goldfields';

    const tender = await createTender({
      clientId: targetClientId,
      tenderNumber: String(tenderNumber),
      title: String(title),
      category: String(category),
      description: String(description),
      estimatedValue: estimatedValue ? String(estimatedValue) : undefined,
      closingDate: String(closingDate),
      minBbbeeLevel: minBbbeeLevel ? Number(minBbbeeLevel) : 4,
      cidbGrading: cidbGrading ? String(cidbGrading) : undefined,
      hostCommunityMandate: Boolean(hostCommunityMandate),
      scopeDocumentUrl: scopeDocumentUrl ? String(scopeDocumentUrl) : undefined,
    });

    return NextResponse.json({ success: true, tender });
  } catch (err: any) {
    console.error('[API Admin Tenders POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to create tender' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const { submissionId, status, notes } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'submissionId and status are required.' },
        { status: 400 }
      );
    }

    await updateTenderSubmissionStatus(String(submissionId), status, notes);

    return NextResponse.json({
      success: true,
      message: `Submission ${submissionId} updated to ${status}.`,
    });
  } catch (err: any) {
    console.error('[API Admin Tenders PATCH Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update submission' }, { status: 500 });
  }
}
