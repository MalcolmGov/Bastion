import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    const db = getDb();
    let sql = `SELECT * FROM websites`;
    const args: any[] = [];

    if (!isAgencyUser(gate.user)) {
      // Non-agency users can only view websites belonging to their client
      sql += ` WHERE client_id = ?`;
      args.push(gate.user.client_id);
      if (clientId && clientId !== gate.user.client_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (clientId) {
      sql += ` WHERE client_id = ?`;
      args.push(clientId);
    }

    sql += ` ORDER BY created_at ASC`;

    const res = await db.execute({ sql, args });

    const websites = res.rows.map(w => ({
      id: String(w.id),
      clientId: String(w.client_id),
      name: String(w.name),
      slug: String(w.slug),
      blueprintId: String(w.blueprint_id),
      designCollectionId: String(w.design_collection_id),
      status: String(w.status),
      primaryDomain: w.primary_domain ? String(w.primary_domain) : undefined,
      publishedRevisionId: w.published_revision_id ? String(w.published_revision_id) : undefined,
      settings: typeof w.settings_json === 'string' ? JSON.parse(w.settings_json) : (w.settings_json || {}),
      createdAt: String(w.created_at),
      updatedAt: String(w.updated_at)
    }));

    return NextResponse.json({ websites });
  } catch (err: any) {
    console.error('Failed to list websites:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const {
      clientId,
      name,
      slug: rawSlug,
      blueprintId = 'corporate',
      designCollectionId = 'editorial',
      primaryDomain,
      status = 'published',
      tagline
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Website name is required.' }, { status: 400 });
    }

    const targetClientId = clientId || gate.user.client_id;
    if (!targetClientId) {
      return NextResponse.json({ error: 'Client ID is required.' }, { status: 400 });
    }

    // Role check: non-agency users can only add websites to their own client
    if (!isAgencyUser(gate.user) && targetClientId !== gate.user.client_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const siteId = `site_${slug.replace(/[^a-z0-9]/gi, '_')}`;
    const now = new Date().toISOString();

    const db = getDb();

    // Check if website slug or ID already exists
    const existing = await db.execute({
      sql: `SELECT id FROM websites WHERE id = ? OR slug = ? LIMIT 1`,
      args: [siteId, slug]
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'A website with this name or slug already exists.' }, { status: 409 });
    }

    const initialSettings = {
      tagline: tagline || `${name} — Corporate Web Property`,
      enabledModules: {
        pages: true,
        news: true,
        calendar: true,
        media: true
      },
      navigation: {
        mainNav: [
          { label: 'Overview', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'News & Announcements', href: '/news' },
          { label: 'Contact', href: '/contact' }
        ]
      }
    };

    await db.execute({
      sql: `INSERT INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        siteId,
        targetClientId,
        name.trim(),
        slug,
        blueprintId,
        designCollectionId,
        status,
        primaryDomain?.trim() || null,
        JSON.stringify(initialSettings),
        now,
        now
      ]
    });

    return NextResponse.json({
      success: true,
      website: {
        id: siteId,
        clientId: targetClientId,
        name: name.trim(),
        slug,
        blueprintId,
        designCollectionId,
        status,
        primaryDomain: primaryDomain?.trim() || undefined,
        settings: initialSettings,
        createdAt: now,
        updatedAt: now
      }
    });
  } catch (err: any) {
    console.error('Failed to create website:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const body = await req.json();
    const { id, name, primaryDomain, status, blueprintId, designCollectionId, settings } = body;

    if (!id) {
      return NextResponse.json({ error: 'Website ID is required.' }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.execute({
      sql: `SELECT * FROM websites WHERE id = ? LIMIT 1`,
      args: [id]
    });

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Website not found.' }, { status: 404 });
    }

    const current = existing.rows[0];
    if (!isAgencyUser(gate.user) && String(current.client_id) !== gate.user.client_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const updatedName = name ?? String(current.name);
    const updatedDomain = primaryDomain !== undefined ? primaryDomain : current.primary_domain;
    const updatedStatus = status ?? String(current.status);
    const updatedBlueprint = blueprintId ?? String(current.blueprint_id);
    const updatedDesign = designCollectionId ?? String(current.design_collection_id);
    const updatedSettings = settings !== undefined
      ? (typeof settings === 'string' ? settings : JSON.stringify(settings))
      : String(current.settings_json);

    await db.execute({
      sql: `UPDATE websites 
            SET name = ?, primary_domain = ?, status = ?, blueprint_id = ?, design_collection_id = ?, settings_json = ?, updated_at = ?
            WHERE id = ?`,
      args: [updatedName, updatedDomain, updatedStatus, updatedBlueprint, updatedDesign, updatedSettings, now, id]
    });

    return NextResponse.json({ success: true, website: { id, name: updatedName, primaryDomain: updatedDomain, status: updatedStatus } });
  } catch (err: any) {
    console.error('Failed to update website:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
