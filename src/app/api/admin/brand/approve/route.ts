import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db/client';
import { requireAgencyUser } from '@/lib/auth/guard';
import { createDesignSystem, designSystemIssues } from '@/lib/studio/designSystem';

export async function POST(req: NextRequest) {
  const gate = await requireAgencyUser(); if (!gate.ok) return gate.response;
  try {
    const { siteId, theme } = await req.json();
    if (typeof siteId !== 'string' || !siteId || !theme || typeof theme !== 'object') return NextResponse.json({ error: 'An explicit website and reviewed theme are required.' }, { status: 400 });
    const system = createDesignSystem({}, theme, theme.sources?.site);
    const issues = designSystemIssues(system);
    if (issues.length) return NextResponse.json({ error: issues.join(' ') }, { status: 400 });
    const tx = await getDb().transaction('write');
    let version = 1; const id = `brand_kit_${randomUUID()}`; const now = new Date().toISOString();
    try {
      const site = await tx.execute({ sql: 'SELECT id FROM websites WHERE id=?', args: [siteId] });
      if (!site.rows.length) { await tx.rollback(); return NextResponse.json({ error: 'Website not found.' }, { status: 404 }); }
      const previous = await tx.execute({ sql: 'SELECT MAX(version) AS version FROM brand_kits WHERE site_id=?', args: [siteId] });
      version = Number(previous.rows[0]?.version || 0) + 1;
      const colors = Object.fromEntries(Object.entries(system.colors).map(([role, value]) => [role, { name: role, value, status: 'approved', evidence: system.evidence[role] || 'Agency-reviewed design proposal' }]));
      await tx.execute({ sql: 'INSERT INTO brand_kits (id,site_id,version,status,logos_json,colors_json,typography_json,component_rules_json,voice_and_messaging_json,locked_attributes_json,created_at,updated_at) VALUES (?,?,?,\'approved\',?,?,?,?,?,\'[]\',?,?)', args: [id, siteId, version,
        JSON.stringify({ primary: { url: system.logoUrl, status: system.logoUrl ? 'approved' : 'missing' } }), JSON.stringify(colors), JSON.stringify({ ...system.typography, status: 'approved' }),
        JSON.stringify({ radius: system.radius, buttonStyle: 'solid', shadows: 'subtle', imageryDirection: 'Reviewed client imagery' }),
        JSON.stringify({ toneOfVoice: typeof theme.voice?.summary === 'string' ? theme.voice.summary : 'Clear and professional', approvedFacts: [] }), now, now] });
      await tx.commit();
    } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
    return NextResponse.json({ success: true, brandKitId: id, version, system, message: 'A new reviewed brand-kit version was saved. Existing approved pages have not been rewritten.' });
  } catch (error) {
    console.error('[BrandApproveAPI]', error);
    return NextResponse.json({ error: 'The brand kit could not be saved.' }, { status: 500 });
  }
}
