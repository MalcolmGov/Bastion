import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { hasPermission, type StudioUser } from '@/lib/auth/auth';
import { isAgencyUser } from '@/lib/auth/roles';
import { getDb } from '@/lib/db/client';
import {
  getSensAnnouncement,
  deleteSensAnnouncement,
  approveSensAnnouncement,
  publishSensAnnouncement,
  SensApprovalError,
  type SensAnnouncement,
} from '@/lib/ir/sensService';
import crypto from 'crypto';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** The permission each workflow action needs, mirroring the content workflow (approve, publish). */
const ACTION_PERMISSIONS: Record<string, string> = {
  approve: 'content:approve',
  publish: 'content:publish',
};

async function recordWorkflowAudit(user: StudioUser, action: string, announcement: SensAnnouncement) {
  try {
    await getDb().execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, client_id, site_id, created_at)
            VALUES (?, ?, ?, ?, 'sens_announcements', ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        user.id,
        user.name || 'Reviewer',
        `SENS_ANNOUNCEMENT_${action.toUpperCase()}`,
        announcement.id,
        JSON.stringify({ headline: announcement.headline, createdBy: announcement.createdBy, approvedBy: announcement.approvedBy, contentHash: announcement.approvedContentHash }),
        announcement.clientId,
        announcement.siteId,
        new Date().toISOString(),
      ],
    });
  } catch (auditErr) {
    console.warn(`[Audit Log] Notice recording SENS ${action}:`, auditErr);
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await context.params;
    const announcement = await getSensAnnouncement(id);

    if (!announcement) {
      return NextResponse.json({ error: 'SENS announcement not found' }, { status: 404 });
    }

    // Tenant boundary check
    if (!isAgencyUser(user) && announcement.clientId !== user.client_id) {
      return NextResponse.json({ error: 'Access denied: Announcement belongs to another tenant' }, { status: 403 });
    }

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await context.params;
    const announcement = await getSensAnnouncement(id);

    if (!announcement) {
      return NextResponse.json({ error: 'SENS announcement not found' }, { status: 404 });
    }

    if (!isAgencyUser(user) && announcement.clientId !== user.client_id) {
      return NextResponse.json({ error: 'Access denied: Announcement belongs to another tenant' }, { status: 403 });
    }
    // Discarding a draft is an editing action. Whether it may be deleted at all is decided by its status.
    if (!hasPermission(user.role, 'content:edit')) {
      return NextResponse.json({ error: 'Forbidden: your role cannot delete SENS announcements' }, { status: 403 });
    }

    const removed = await deleteSensAnnouncement(id, announcement.clientId);
    await recordWorkflowAudit(user, 'delete', removed);
    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    if (err instanceof SensApprovalError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[API SENS DELETE Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Workflow actions on an announcement: `approve` records an independent sign-off, `publish` makes an
 * approved announcement live. Nothing authored in the studio can be published without both.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const user = gate.user;

    const { id } = await context.params;
    const { action } = await req.json();
    const permission = ACTION_PERMISSIONS[action];
    if (!permission) {
      return NextResponse.json({ error: `Unknown SENS workflow action: ${action}` }, { status: 400 });
    }

    const announcement = await getSensAnnouncement(id);
    if (!announcement) {
      return NextResponse.json({ error: 'SENS announcement not found' }, { status: 404 });
    }
    if (!isAgencyUser(user) && announcement.clientId !== user.client_id) {
      return NextResponse.json({ error: 'Access denied: Announcement belongs to another tenant' }, { status: 403 });
    }
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json({ error: `Forbidden: your role cannot ${action} SENS announcements` }, { status: 403 });
    }

    const updated = action === 'approve'
      ? await approveSensAnnouncement(id, user.id, announcement.clientId)
      : await publishSensAnnouncement(id, announcement.clientId);
    await recordWorkflowAudit(user, action, updated);
    return NextResponse.json({ success: true, announcement: updated });
  } catch (err: any) {
    if (err instanceof SensApprovalError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[API SENS workflow Error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
