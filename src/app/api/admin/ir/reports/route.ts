import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { getDb, ensureDbReady } from '@/lib/db/client';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const url = new URL(req.url);
    const requestedClient = url.searchParams.get('clientId');
    const targetClientId = (isAgencyUser(user) && requestedClient ? requestedClient : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }

    const db = await ensureDbReady();
    const res = await db.execute({
      sql: `SELECT * FROM investor_reports WHERE client_id = ? ORDER BY fiscal_year DESC, created_at DESC`,
      args: [targetClientId],
    });

    const reports = res.rows.map((row) => ({
      id: String(row.id),
      clientId: String(row.client_id),
      siteId: String(row.site_id),
      title: String(row.title),
      fiscalYear: Number(row.fiscal_year),
      period: String(row.period),
      reportType: String(row.report_type),
      pdfUrl: String(row.pdf_url),
      filesizeBytes: Number(row.filesize_bytes || 0),
      downloadCount: Number(row.download_count || 0),
      publishedAt: String(row.published_at),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }));

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const { title, fiscalYear, period, reportType, pdfUrl, filesizeBytes, clientId, siteId } = body;

    if (!title || !pdfUrl) {
      return NextResponse.json({ error: 'Title and pdfUrl are mandatory' }, { status: 400 });
    }

    const targetClientId = (isAgencyUser(user) && clientId ? clientId : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }
    const targetSiteId = siteId || `site_${targetClientId.replace('client_', '')}`;

    const db = await ensureDbReady();
    const id = `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: `
        INSERT INTO investor_reports (
          id, client_id, site_id, title, fiscal_year, period, report_type,
          pdf_url, filesize_bytes, download_count, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
      `,
      args: [
        id,
        targetClientId,
        targetSiteId,
        title,
        fiscalYear ? Number(fiscalYear) : new Date().getFullYear(),
        period || 'FY',
        reportType || 'integrated_annual_report',
        pdfUrl,
        filesizeBytes ? Number(filesizeBytes) : 1024 * 1024 * 5,
        now,
        now,
        now,
      ],
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
