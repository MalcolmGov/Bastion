import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import type { BillingDoc } from '@/lib/studio/billingTypes';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const db = getDb();

    const res = await db.execute({
      sql: `SELECT b.*, c.name as client_name, c.logo_url as client_logo, c.primary_contact_json, w.name as site_name
            FROM billing_docs b
            LEFT JOIN clients c ON b.client_id = c.id
            LEFT JOIN websites w ON b.site_id = w.id
            WHERE b.acceptance_token = ? LIMIT 1`,
      args: [token],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Quotation agreement not found or expired.' }, { status: 404 });
    }

    const row: any = res.rows[0];
    const quote: BillingDoc = {
      id: String(row.id),
      clientId: String(row.client_id),
      siteId: row.site_id ? String(row.site_id) : undefined,
      type: row.type as any,
      status: row.status as any,
      docNumber: String(row.doc_number),
      issueDate: String(row.issue_date),
      dueDate: String(row.due_date),
      currency: String(row.currency || 'R'),
      items: typeof row.items_json === 'string' ? JSON.parse(row.items_json) : (row.items_json || []),
      notes: row.notes ? String(row.notes) : undefined,
      bankName: row.bank_name ? String(row.bank_name) : undefined,
      accountNo: row.account_no ? String(row.account_no) : undefined,
      branchCode: row.branch_code ? String(row.branch_code) : undefined,
      paymentRef: row.payment_ref ? String(row.payment_ref) : undefined,
      companyName: row.company_name ? String(row.company_name) : undefined,
      companyAddress: row.company_address ? String(row.company_address) : undefined,
      companyEmail: row.company_email ? String(row.company_email) : undefined,
      companyPhone: row.company_phone ? String(row.company_phone) : undefined,
      companyVat: row.company_vat ? String(row.company_vat) : undefined,
      companyRegNo: row.company_reg_no ? String(row.company_reg_no) : undefined,
      swiftCode: row.swift_code ? String(row.swift_code) : undefined,
      clientLegalName: row.client_legal_name ? String(row.client_legal_name) : undefined,
      clientRegNo: row.client_reg_no ? String(row.client_reg_no) : undefined,
      poNumber: row.po_number ? String(row.po_number) : undefined,
      clientAddress: row.client_address ? String(row.client_address) : undefined,
      clientEmail: row.client_email ? String(row.client_email) : undefined,
      clientPhone: row.client_phone ? String(row.client_phone) : undefined,
      clientVat: row.client_vat ? String(row.client_vat) : undefined,
      clientContactPerson: row.client_contact_person ? String(row.client_contact_person) : undefined,
      paymentTerms: row.payment_terms ? String(row.payment_terms) : undefined,
      sentAt: row.sent_at ? String(row.sent_at) : undefined,
      lastRemindedAt: row.last_reminded_at ? String(row.last_reminded_at) : undefined,
      remindersCount: Number(row.reminders_count || 0),
      paidAt: row.paid_at ? String(row.paid_at) : undefined,
      amountPaid: row.amount_paid != null ? Number(row.amount_paid) : undefined,
      acceptanceToken: row.acceptance_token ? String(row.acceptance_token) : undefined,
      signatureData: row.signature_data ? String(row.signature_data) : undefined,
      signerName: row.signer_name ? String(row.signer_name) : undefined,
      signerRole: row.signer_role ? String(row.signer_role) : undefined,
      acceptedAt: row.accepted_at ? String(row.accepted_at) : undefined,
      declinedAt: row.declined_at ? String(row.declined_at) : undefined,
      declineReason: row.decline_reason ? String(row.decline_reason) : undefined,
      convertedFromQuoteId: row.converted_from_quote_id ? String(row.converted_from_quote_id) : undefined,
      convertedToInvoiceId: row.converted_to_invoice_id ? String(row.converted_to_invoice_id) : undefined,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    };

    const clientContact = row.primary_contact_json
      ? (typeof row.primary_contact_json === 'string' ? JSON.parse(row.primary_contact_json) : row.primary_contact_json)
      : null;

    return NextResponse.json({
      quote,
      client: {
        name: row.client_name || 'Client',
        logoUrl: row.client_logo,
        contact: clientContact,
        siteName: row.site_name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action = 'accept', signatureData, signerName, signerRole, declineReason } = body;
    const db = getDb();
    const now = new Date().toISOString();

    const check = await db.execute({
      sql: `SELECT id, status FROM billing_docs WHERE acceptance_token = ? LIMIT 1`,
      args: [token],
    });

    if (check.rows.length === 0) {
      return NextResponse.json({ error: 'Quotation agreement not found.' }, { status: 404 });
    }

    const docId = String(check.rows[0].id);

    if (action === 'accept') {
      if (!signatureData) {
        return NextResponse.json({ error: 'Digital signature is required to approve this agreement.' }, { status: 400 });
      }

      await db.execute({
        sql: `UPDATE billing_docs
              SET status = 'accepted',
                  signature_data = ?,
                  signer_name = ?,
                  signer_role = ?,
                  accepted_at = ?,
                  updated_at = ?
              WHERE id = ?`,
        args: [
          signatureData,
          signerName || 'Authorized Signatory',
          signerRole || 'Client Representative',
          now,
          now,
          docId,
        ],
      });

      // Record audit log
      await db.execute({
        sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          `audit_${Date.now()}`,
          'usr_client_sign',
          signerName || 'Client Signatory',
          'quote_digital_signature_accepted',
          'billing_docs',
          docId,
          'success',
          now,
        ],
      });

      return NextResponse.json({ success: true, acceptedAt: now, message: 'Agreement signed and approved successfully.' });
    }

    if (action === 'decline') {
      await db.execute({
        sql: `UPDATE billing_docs
              SET status = 'declined',
                  declined_at = ?,
                  decline_reason = ?,
                  updated_at = ?
              WHERE id = ?`,
        args: [now, declineReason || 'Declined by client', now, docId],
      });

      return NextResponse.json({ success: true, declinedAt: now });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
