import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET() {
  try {
    const db = getDb();
    const clientsRes = await db.execute(`SELECT * FROM clients ORDER BY created_at ASC`);
    const websitesRes = await db.execute(`SELECT * FROM websites ORDER BY created_at ASC`);

    const websites = websitesRes.rows.map(w => ({
      id: String(w.id),
      clientId: String(w.client_id),
      name: String(w.name),
      slug: String(w.slug),
      blueprintId: String(w.blueprint_id),
      designCollectionId: String(w.design_collection_id),
      status: String(w.status),
      primaryDomain: w.primary_domain ? String(w.primary_domain) : undefined,
      settings: typeof w.settings_json === 'string' ? JSON.parse(w.settings_json) : (w.settings_json || {})
    }));

    const clients = clientsRes.rows.map(c => ({
      id: String(c.id),
      name: String(c.name),
      slug: String(c.slug),
      industry: String(c.industry),
      logoUrl: c.logo_url ? String(c.logo_url) : undefined,
      websites: websites.filter(w => w.clientId === String(c.id))
    }));

    return NextResponse.json({ clients, websites });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
