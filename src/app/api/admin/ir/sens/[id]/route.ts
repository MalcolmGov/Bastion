import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { getSensAnnouncement, deleteSensAnnouncement } from '@/lib/ir/sensService';

interface RouteContext {
  params: Promise<{ id: string }>;
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

    await deleteSensAnnouncement(id, announcement.clientId);
    return NextResponse.json({ success: true, deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
