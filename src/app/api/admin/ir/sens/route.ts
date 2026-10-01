import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { listSensAnnouncements, createSensAnnouncement, SensType } from '@/lib/ir/sensService';
import { getDb } from '@/lib/db/client';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const url = new URL(req.url);
    const requestedClient = url.searchParams.get('clientId');
    const type = url.searchParams.get('type') || undefined;
    const priceSensitiveOnly = url.searchParams.get('priceSensitive') === 'true';
    const search = url.searchParams.get('search') || undefined;

    // Scope check: non-agency users can only view their own client tenant
    const targetClientId = (isAgencyUser(user) && requestedClient ? requestedClient : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }

    const announcements = await listSensAnnouncements(targetClientId, {
      type,
      priceSensitiveOnly,
      search,
    });

    return NextResponse.json({ success: true, announcements });
  } catch (err: any) {
    console.error('[API SENS GET Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const body = await req.json();
    const {
      headline,
      announcementType,
      jseCode,
      isinCode,
      releasedAt,
      bodyHtml,
      summary,
      pdfUrl,
      isPriceSensitive,
      status,
      sponsor,
      clientId,
      siteId,
    } = body;

    if (!headline || !bodyHtml) {
      return NextResponse.json(
        { error: 'Missing required fields: headline and bodyHtml are mandatory' },
        { status: 400 }
      );
    }

    // Tenant binding
    const targetClientId = (isAgencyUser(user) && clientId ? clientId : user.client_id) || '';
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client tenant context required' }, { status: 400 });
    }
    const targetSiteId = siteId || `site_${targetClientId.replace('client_', '')}`;

    const announcement = await createSensAnnouncement({
      clientId: targetClientId,
      siteId: targetSiteId,
      headline,
      announcementType: announcementType as SensType,
      jseCode,
      isinCode,
      releasedAt,
      bodyHtml,
      summary,
      pdfUrl,
      isPriceSensitive,
      status,
      sponsor,
    });

    // Write to audit log
    try {
      const db = getDb();
      const now = new Date().toISOString();
      await db.execute({
        sql: `
          INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, client_id, site_id, created_at)
          VALUES (?, ?, ?, 'SENS_ANNOUNCEMENT_CREATE', 'sens_announcements', ?, 'success', ?, ?, ?, ?)
        `,
        args: [
          `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          user.id,
          user.name || 'Editor',
          announcement.id,
          JSON.stringify({ headline: announcement.headline, jseCode: announcement.jseCode, isPriceSensitive: announcement.isPriceSensitive }),
          targetClientId,
          targetSiteId,
          now,
        ],
      });
    } catch (auditErr) {
      console.warn('[Audit Log] Notice recording SENS creation:', auditErr);
    }

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    console.error('[API SENS POST Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
