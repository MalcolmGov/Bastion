import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import crypto from 'crypto';
import type { BillingDoc, LineItem } from '@/lib/studio/billingTypes';
import { requireAgencyUser } from '@/lib/auth/guard';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');
    const db = getDb();

    let sql = `SELECT * FROM billing_docs WHERE 1=1`;
    const args: any[] = [];

    if (clientId && clientId !== 'all') {
      sql += ` AND client_id = ?`;
      args.push(clientId);
    }

    if (type && type !== 'all') {
      sql += ` AND type = ?`;
      args.push(type);
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await db.execute({ sql, args });

    const docs: BillingDoc[] = res.rows.map((row: any) => ({
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
      swiftCode: row.swift_code ? String(row.swift_code) : undefined,
      paymentRef: row.payment_ref ? String(row.payment_ref) : undefined,
      companyName: row.company_name ? String(row.company_name) : undefined,
      companyAddress: row.company_address ? String(row.company_address) : undefined,
      companyEmail: row.company_email ? String(row.company_email) : undefined,
      companyPhone: row.company_phone ? String(row.company_phone) : undefined,
      companyVat: row.company_vat ? String(row.company_vat) : undefined,
      companyRegNo: row.company_reg_no ? String(row.company_reg_no) : undefined,
      clientLegalName: row.client_legal_name ? String(row.client_legal_name) : undefined,
      clientRegNo: row.client_reg_no ? String(row.client_reg_no) : undefined,
      clientAddress: row.client_address ? String(row.client_address) : undefined,
      clientEmail: row.client_email ? String(row.client_email) : undefined,
      clientPhone: row.client_phone ? String(row.client_phone) : undefined,
      clientVat: row.client_vat ? String(row.client_vat) : undefined,
      clientContactPerson: row.client_contact_person ? String(row.client_contact_person) : undefined,
      paymentTerms: row.payment_terms ? String(row.payment_terms) : undefined,
      poNumber: row.po_number ? String(row.po_number) : undefined,
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
    }));

    return NextResponse.json({ docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const db = getDb();
    const now = new Date().toISOString();

    const id = body.id || `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const type = body.type || 'quote';
    const status = body.status || 'draft';
    const token = body.acceptanceToken || `token_${crypto.randomBytes(16).toString('hex')}`;

    const docNumber = body.docNumber || `${type === 'quote' ? 'QUO' : 'INV'}-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.execute({
      sql: `INSERT OR REPLACE INTO billing_docs (
        id, client_id, site_id, type, status, doc_number, issue_date, due_date, currency,
        items_json, notes, bank_name, account_no, branch_code, swift_code, payment_ref,
        company_name, company_address, company_email, company_phone, company_vat, company_reg_no,
        client_legal_name, client_reg_no, client_address, client_email, client_phone, client_vat, client_contact_person, payment_terms, po_number,
        sent_at, last_reminded_at, reminders_count, paid_at, amount_paid,
        acceptance_token, signature_data, signer_name, signer_role, accepted_at, declined_at, decline_reason,
        converted_from_quote_id, converted_to_invoice_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.clientId || 'client_swifter',
        body.siteId || 'site_swifter',
        type,
        status,
        docNumber,
        body.issueDate || now.split('T')[0],
        body.dueDate || new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0],
        body.currency || 'R',
        JSON.stringify(body.items || []),
        body.notes || 'Payment due within 30 days of invoice date.\nThank you for choosing Bastion Group.',
        body.bankName || 'First National Bank (FNB)',
        body.accountNo || '62849102941',
        body.branchCode || '250655',
        body.swiftCode || 'FIRNZAJJ',
        body.paymentRef || docNumber,
        body.companyName || 'Bastion Group (Pty) Ltd',
        body.companyAddress || '100 Sandton Drive, Sandton, Johannesburg, 2196',
        body.companyEmail || 'billing@bastiongroup.co.za',
        body.companyPhone || '+27 11 883 4000',
        body.companyVat || '4820194821',
        body.companyRegNo || '2024/091823/07',
        body.clientLegalName || null,
        body.clientRegNo || null,
        body.clientAddress || null,
        body.clientEmail || null,
        body.clientPhone || null,
        body.clientVat || null,
        body.clientContactPerson || null,
        body.paymentTerms || 'Net 30 Days',
        body.poNumber || null,
        status === 'sent' ? now : (body.sentAt || null),
        body.lastRemindedAt || null,
        body.remindersCount || 0,
        status === 'paid' ? now : (body.paidAt || null),
        body.amountPaid || null,
        token,
        body.signatureData || null,
        body.signerName || null,
        body.signerRole || null,
        body.acceptedAt || null,
        body.declinedAt || null,
        body.declineReason || null,
        body.convertedFromQuoteId || null,
        body.convertedToInvoiceId || null,
        body.createdAt || now,
        now,
      ],
    });

    // Record audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        'usr_admin',
        'Agency Administrator',
        'billing_doc_save',
        'billing_docs',
        id,
        'success',
        now,
      ],
    });

    return NextResponse.json({ success: true, docId: id, token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const { action, docId } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (!docId) {
      return NextResponse.json({ error: 'Missing docId' }, { status: 400 });
    }

    if (action === 'convert_to_invoice') {
      // 1. Fetch quote
      const quoteRes = await db.execute({
        sql: `SELECT * FROM billing_docs WHERE id = ? LIMIT 1`,
        args: [docId],
      });
      if (quoteRes.rows.length === 0) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
      const q: any = quoteRes.rows[0];

      // 2. Create invoice with fresh token
      const invoiceId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const invNumber = `INV-${String(q.doc_number).replace('QUO-', '')}`;
      const token = `token_${crypto.randomBytes(16).toString('hex')}`;

      await db.execute({
        sql: `INSERT INTO billing_docs (
          id, client_id, site_id, type, status, doc_number, issue_date, due_date, currency,
          items_json, notes, bank_name, account_no, branch_code, swift_code, payment_ref,
          company_name, company_address, company_email, company_phone, company_vat, company_reg_no,
          client_legal_name, client_reg_no, client_address, client_email, client_phone, client_vat, client_contact_person, payment_terms, po_number,
          acceptance_token, converted_from_quote_id, created_at, updated_at
        ) VALUES (?, ?, ?, 'invoice', 'sent', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          invoiceId,
          q.client_id,
          q.site_id,
          invNumber,
          now.split('T')[0],
          new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0],
          q.currency,
          q.items_json,
          q.notes,
          q.bank_name,
          q.account_no,
          q.branch_code,
          q.swift_code || 'FIRNZAJJ',
          invNumber,
          q.company_name,
          q.company_address,
          q.company_email,
          q.company_phone,
          q.company_vat,
          q.company_reg_no,
          q.client_legal_name || null,
          q.client_reg_no || null,
          q.client_address,
          q.client_email,
          q.client_phone,
          q.client_vat,
          q.client_contact_person,
          q.payment_terms || 'Net 14 Days',
          q.po_number || null,
          token,
          docId,
          now,
          now,
        ],
      });

      // 3. Mark quote with converted pointer
      await db.execute({
        sql: `UPDATE billing_docs SET converted_to_invoice_id = ?, updated_at = ? WHERE id = ?`,
        args: [invoiceId, now, docId],
      });

      return NextResponse.json({ success: true, invoiceId, docNumber: invNumber, token });
    }

    if (action === 'send') {
      await db.execute({
        sql: `UPDATE billing_docs SET status = 'sent', sent_at = ?, updated_at = ? WHERE id = ?`,
        args: [now, now, docId],
      });
      return NextResponse.json({ success: true, sentAt: now });
    }

    if (action === 'send_reminder') {
      await db.execute({
        sql: `UPDATE billing_docs SET reminders_count = COALESCE(reminders_count, 0) + 1, last_reminded_at = ?, updated_at = ? WHERE id = ?`,
        args: [now, now, docId],
      });
      return NextResponse.json({ success: true, lastRemindedAt: now });
    }

    if (action === 'update_status') {
      const { status } = body;
      const isPaid = status === 'paid';
      await db.execute({
        sql: `UPDATE billing_docs SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?`,
        args: [status, isPaid ? now : null, now, docId],
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'duplicate') {
      const docRes = await db.execute({
        sql: `SELECT * FROM billing_docs WHERE id = ? LIMIT 1`,
        args: [docId],
      });
      if (docRes.rows.length === 0) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      const orig: any = docRes.rows[0];
      const newId = `doc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const prefix = orig.type === 'quote' ? 'QUO' : 'INV';
      const newDocNumber = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newToken = `token_${crypto.randomBytes(16).toString('hex')}`;

      await db.execute({
        sql: `INSERT INTO billing_docs (
          id, client_id, site_id, type, status, doc_number, issue_date, due_date, currency,
          items_json, notes, bank_name, account_no, branch_code, swift_code, payment_ref,
          company_name, company_address, company_email, company_phone, company_vat, company_reg_no,
          client_legal_name, client_reg_no, client_address, client_email, client_phone, client_vat, client_contact_person, payment_terms, po_number,
          acceptance_token, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          newId,
          orig.client_id,
          orig.site_id,
          orig.type,
          newDocNumber,
          now.split('T')[0],
          new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0],
          orig.currency,
          orig.items_json,
          orig.notes,
          orig.bank_name,
          orig.account_no,
          orig.branch_code,
          orig.swift_code,
          newDocNumber,
          orig.company_name,
          orig.company_address,
          orig.company_email,
          orig.company_phone,
          orig.company_vat,
          orig.company_reg_no,
          orig.client_legal_name || null,
          orig.client_reg_no || null,
          orig.client_address,
          orig.client_email,
          orig.client_phone,
          orig.client_vat,
          orig.client_contact_person,
          orig.payment_terms,
          orig.po_number || null,
          newToken,
          now,
          now,
        ],
      });

      return NextResponse.json({ success: true, newId, docNumber: newDocNumber });
    }

    if (action === 'delete') {
      await db.execute({
        sql: `DELETE FROM billing_docs WHERE id = ?`,
        args: [docId],
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
