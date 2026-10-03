import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireUser, requirePermission } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import type { StudioUser } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/client';
import { listAllTenders, createTender, listTenderSubmissions, updateTenderSubmissionStatus, TenderError } from '@/lib/tenders/tenderService';

export const dynamic = 'force-dynamic';

const MAX_NOTES_LENGTH = 2000;

async function recordTenderAudit(user: StudioUser, action: string, recordId: string, clientId: string, details: Record<string, unknown>) {
  try {
    await getDb().execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, client_id, created_at)
            VALUES (?, ?, ?, ?, 'tenders', ?, 'success', ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        user.id,
        user.name || 'Procurement',
        action,
        recordId,
        JSON.stringify(details),
        clientId,
        new Date().toISOString(),
      ],
    });
  } catch (auditErr) {
    console.warn(`[Audit Log] Notice recording ${action}:`, auditErr);
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const view = url.searchParams.get('view') || 'tenders'; // 'tenders' | 'submissions'
    // Tender notices are public information. Bids carry vendors' tax PINs, contacts and prices.
    const gate = view === 'submissions' ? await requirePermission('tenders:read') : await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const requestedClient = url.searchParams.get('clientId');
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
    // A new tender is published on the public supplier portal straight away.
    const gate = await requirePermission('tenders:manage');
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

    // Client staff publish for their own tenant. Agency staff must name the client, so a tender is never filed under a default one.
    const targetClientId = String((isAgencyUser(user) ? clientId : user.client_id) || '');
    if (!targetClientId) {
      return NextResponse.json({ error: 'clientId is required to say which client this tender is for.' }, { status: 400 });
    }
    const client = await getDb().execute({ sql: 'SELECT id FROM clients WHERE id = ?', args: [targetClientId] });
    if (client.rows.length === 0) {
      return NextResponse.json({ error: 'Unknown client.' }, { status: 400 });
    }

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

    await recordTenderAudit(user, 'TENDER_CREATE', tender.id, tender.clientId, {
      tenderNumber: tender.tenderNumber,
      title: tender.title,
      closingDate: tender.closingDate,
    });
    return NextResponse.json({ success: true, tender });
  } catch (err: any) {
    console.error('[API Admin Tenders POST Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to create tender' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const gate = await requirePermission('tenders:manage');
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const { submissionId, status, notes } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'submissionId and status are required.' },
        { status: 400 }
      );
    }
    if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > MAX_NOTES_LENGTH)) {
      return NextResponse.json({ error: `notes must be text of at most ${MAX_NOTES_LENGTH} characters.` }, { status: 400 });
    }

    // Client staff can only evaluate bids on their own tenant's tenders; agency staff can evaluate any.
    const changed = await updateTenderSubmissionStatus(
      String(submissionId),
      status,
      notes || undefined,
      isAgencyUser(user) ? null : user.client_id
    );
    await recordTenderAudit(user, 'TENDER_SUBMISSION_STATUS_UPDATE', String(submissionId), changed.clientId, {
      from: changed.previousStatus,
      to: status,
      previousNotes: changed.previousNotes,
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      message: `Submission ${submissionId} updated to ${status}.`,
    });
  } catch (err: any) {
    if (err instanceof TenderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[API Admin Tenders PATCH Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to update submission' }, { status: 500 });
  }
}
