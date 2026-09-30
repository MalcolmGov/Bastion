import type { Client } from '@libsql/client';

export async function runPhase2Migrations(db: Client): Promise<void> {
  // 1. content_releases table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS content_releases (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      site_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_at TEXT,
      published_at TEXT,
      published_by TEXT,
      item_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. content_release_items table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS content_release_items (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      title TEXT NOT NULL,
      action TEXT NOT NULL DEFAULT 'update',
      changes_summary TEXT,
      snapshot_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. media_folders table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      client_id TEXT,
      site_id TEXT,
      parent_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 4. Alter media_assets to ensure folder_id and hotspot_data_json exist
  try {
    const assetCols = await db.execute("PRAGMA table_info(media_assets)");
    const colNames = assetCols.rows.map(r => r.name);
    if (!colNames.includes('folder_id')) {
      await db.execute("ALTER TABLE media_assets ADD COLUMN folder_id TEXT DEFAULT 'corporate'");
    }
    if (!colNames.includes('hotspot_data_json')) {
      await db.execute("ALTER TABLE media_assets ADD COLUMN hotspot_data_json TEXT");
    }
  } catch (err) {
    console.warn('[DB Migration] Notice checking media_assets columns:', err);
  }

  // 5. Alter page_compositions to ensure translations_json exists
  try {
    const compCols = await db.execute("PRAGMA table_info(page_compositions)");
    const colNames = compCols.rows.map(r => r.name);
    if (!colNames.includes('translations_json')) {
      await db.execute("ALTER TABLE page_compositions ADD COLUMN translations_json TEXT");
    }
  } catch (err) {
    console.warn('[DB Migration] Notice checking page_compositions columns:', err);
  }

  // 6. Seed default media folders if empty
  try {
    const folderCount = await db.execute("SELECT COUNT(*) as count FROM media_folders");
    const count = Number(folderCount.rows[0]?.count || 0);
    if (count === 0) {
      const now = new Date().toISOString();
      const defaultFolders = [
        { id: 'fld_corporate', name: 'Corporate & Board', slug: 'corporate' },
        { id: 'fld_operations', name: 'Operations & Facilities', slug: 'operations' },
        { id: 'fld_sustainability', name: 'Sustainability & ESG', slug: 'sustainability' },
        { id: 'fld_brand', name: 'Brand DNA & Logos', slug: 'brand' },
        { id: 'fld_sens', name: 'SENS & Regulatory Disclosures', slug: 'sens' }
      ];
      for (const f of defaultFolders) {
        await db.execute({
          sql: "INSERT INTO media_folders (id, name, slug, created_at) VALUES (?, ?, ?, ?)",
          args: [f.id, f.name, f.slug, now]
        });
      }
      console.log('[DB Migration] Seeded 5 standard enterprise DAM media folders.');
    }
  } catch (err) {
    console.warn('[DB Migration] Notice seeding media folders:', err);
  }

  // 7. Seed initial demonstrative content releases if empty
  try {
    const releaseCount = await db.execute("SELECT COUNT(*) as count FROM content_releases");
    const count = Number(releaseCount.rows[0]?.count || 0);
    if (count === 0) {
      const now = new Date().toISOString();
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days from now

      // Release 1: Scheduled Q3 Financial Results Drop
      await db.execute({
        sql: `INSERT INTO content_releases (
          id, client_id, site_id, name, description, status, scheduled_at, published_at, published_by, item_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'rel_q3_financials_2026',
          'client_goldfields',
          'site_goldfields_flagship',
          'Q3 2026 Financial Results & Operational Telemetry Drop',
          'Synchronized release bundling H2 production metrics, AISC discipline update, and SENS regulatory release.',
          'scheduled',
          futureDate,
          null,
          'Malcolm Govender',
          3,
          now,
          now
        ]
      });

      // Release 1 items
      await db.execute({
        sql: `INSERT INTO content_release_items (id, release_id, item_type, item_id, title, action, changes_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'item_rel_1',
          'rel_q3_financials_2026',
          'page',
          'page_home_q3',
          'Homepage - Executive Hero & Key Financial Metrics',
          'update',
          'Updated AISC to US$1,385/oz and free cash flow guidance',
          now
        ]
      });
      await db.execute({
        sql: `INSERT INTO content_release_items (id, release_id, item_type, item_id, title, action, changes_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'item_rel_2',
          'rel_q3_financials_2026',
          'report',
          'rep_q3_operating_results',
          'Q3 2026 Operational Results & Financial Statement',
          'create',
          'Audited financial statement with JSE SENS compliance check',
          now
        ]
      });
      await db.execute({
        sql: `INSERT INTO content_release_items (id, release_id, item_type, item_id, title, action, changes_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'item_rel_3',
          'rel_q3_financials_2026',
          'dynamic_zone',
          'dz_kpis_q3',
          'Key Metrics Bar - H2 Free Cash Flow Vitals',
          'update',
          'Telemetry cards refreshed with real-time enterprise feed',
          now
        ]
      });

      // Release 2: Draft 2030 Decarbonization Campaign
      await db.execute({
        sql: `INSERT INTO content_releases (
          id, client_id, site_id, name, description, status, scheduled_at, published_at, published_by, item_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'rel_esg_decarb_2026',
          'client_goldfields',
          'site_goldfields_flagship',
          '2030 Science-Based Net-Zero Roadmap & Solar Launch',
          'Multi-page ESG campaign announcing completion of 50MW Khanyisa micro-grid and renewable haulage targets.',
          'draft',
          null,
          null,
          'Malcolm Govender',
          2,
          now,
          now
        ]
      });

      await db.execute({
        sql: `INSERT INTO content_release_items (id, release_id, item_type, item_id, title, action, changes_summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          'item_rel_4',
          'rel_esg_decarb_2026',
          'page',
          'page_sustainability',
          'Sustainability Hub - 2030 Targets & Micro-Grid',
          'update',
          'Added Khanyisa Solar Farm aerial assets and live kWh generation stats',
          now
        ]
      });

      console.log('[DB Migration] Seeded 2 enterprise content releases with bundled items.');
    }
  } catch (err) {
    console.warn('[DB Migration] Notice seeding initial releases:', err);
  }
}
