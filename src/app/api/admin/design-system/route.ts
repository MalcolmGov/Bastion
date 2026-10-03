import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { assertSiteAccess, requireUser } from '@/lib/auth/guard';
import { createDesignSystem } from '@/lib/studio/designSystem';

export async function GET(req: NextRequest) {
  const gate = await requireUser(); if (!gate.ok) return gate.response;
  const siteId = req.nextUrl.searchParams.get('siteId');
  if (!siteId) return NextResponse.json({ error: 'Choose a website.' }, { status: 400 });
  const access = await assertSiteAccess(gate.user, siteId); if (!access.ok) return access.response;
  const db = getDb();
  const site = await db.execute({ sql: 'SELECT id,name,settings_json FROM websites WHERE id=?', args: [siteId] });
  if (!site.rows.length) return NextResponse.json({ error: 'Website not found.' }, { status: 404 });
  const settings = JSON.parse(String(site.rows[0].settings_json || '{}'));
  const brand = await db.execute({ sql: 'SELECT * FROM brand_kits WHERE site_id=? ORDER BY version DESC LIMIT 1', args: [siteId] });
  const row = brand.rows[0];
  const parse = (value: unknown) => JSON.parse(String(value || '{}'));
  const kit = row ? { colors: parse(row.colors_json), typography: parse(row.typography_json), logos: parse(row.logos_json), componentRules: parse(row.component_rules_json) } : {};
  const system = settings.designSystem || (row ? createDesignSystem(kit) : null);
  return NextResponse.json({ system, websiteName: site.rows[0].name, brandVersion: row ? Number(row.version) : null, note: 'Website tokens are snapshots. New brand-kit versions do not rewrite approved page compositions.' });
}
