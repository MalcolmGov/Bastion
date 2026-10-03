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

  // 8. Seed corporate page compositions for multi-website properties if missing
  try {
    const now = new Date().toISOString();
    const demoCompositions = [
      // Gold Fields Corporate Flagship
      {
        id: 'comp_gf_flagship_operations',
        siteId: 'site_goldfields_flagship',
        slug: 'operations',
        title: 'Global Mining Operations & Mineral Reserves',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_ops_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Tier-1 Asset Portfolio',
              title: 'Global Mining Operations & Mineral Reserves',
              description: 'World-class mechanized gold operations across South Africa, Ghana, Australia, Chile, and Peru.',
              primaryCtaText: 'View Mine Profiles',
              primaryCtaHref: '#mines'
            }
          }
        ]
      },
      {
        id: 'comp_gf_flagship_leadership',
        siteId: 'site_goldfields_flagship',
        slug: 'leadership',
        title: 'Executive Leadership & Board of Directors',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_lead_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Corporate Governance',
              title: 'Executive Leadership & Board of Directors',
              description: 'Disciplined capital allocation, operational excellence, and industry-leading safety standards.',
              primaryCtaText: 'Executive Profiles',
              primaryCtaHref: '#board'
            }
          }
        ]
      },
      {
        id: 'comp_gf_flagship_report',
        siteId: 'site_goldfields_flagship',
        slug: 'integrated-report',
        title: '2026 Integrated Annual Report',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_rep_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Annual Reporting Suite',
              title: '2026 Integrated Annual Report',
              description: 'Comprehensive financial, operational, and sustainability performance disclosures.',
              primaryCtaText: 'Download Full Suite (PDF)',
              primaryCtaHref: '/assets/integrated-report-2026.pdf'
            }
          }
        ]
      },
      {
        id: 'comp_gf_flagship_contact',
        siteId: 'site_goldfields_flagship',
        slug: 'contact',
        title: 'Global Corporate & Regional Offices',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_contact_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Global Enquiries',
              title: 'Global Corporate & Regional Offices',
              description: 'Connect with our corporate office in Sandton, Johannesburg, or our regional leadership hubs.',
              primaryCtaText: 'Contact Investor Relations',
              primaryCtaHref: 'mailto:investors@goldfields.com'
            }
          }
        ]
      },

      // Gold Fields Investor Relations
      {
        id: 'comp_gf_inv_home',
        siteId: 'site_goldfields_investors',
        slug: 'home',
        title: 'Investor Relations Hub & Shareholder Portal',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_inv_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'JSE: GFI | NYSE: GFI',
              title: 'Gold Fields Investor Relations Hub',
              description: 'Market disclosures, quarterly financial results, production guidance, and institutional presentations.',
              primaryCtaText: 'Latest Financial Results',
              primaryCtaHref: '/results'
            }
          }
        ]
      },
      {
        id: 'comp_gf_inv_results',
        siteId: 'site_goldfields_investors',
        slug: 'results',
        title: 'Financial Results, Webcasts & Presentations',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_results_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Reporting Calendar',
              title: 'Financial Results, Webcasts & Presentations',
              description: 'Access audited statements, management presentations, and webcast recordings for analysts and investors.',
              primaryCtaText: 'H1 2026 Webcast',
              primaryCtaHref: '#webcast'
            }
          }
        ]
      },
      {
        id: 'comp_gf_inv_sens',
        siteId: 'site_goldfields_investors',
        slug: 'sens',
        title: 'JSE SENS & Regulatory Filings',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_sens_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Regulatory Disclosures',
              title: 'JSE SENS Announcements & Circulars',
              description: 'Official price-sensitive announcements filed with the Johannesburg Stock Exchange and SEC.',
              primaryCtaText: 'Subscribe to SENS Alerts',
              primaryCtaHref: '#subscribe'
            }
          }
        ]
      },
      {
        id: 'comp_gf_inv_shareholder',
        siteId: 'site_goldfields_investors',
        slug: 'shareholder-info',
        title: 'Shareholder Information & Dividend Policy',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_share_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Capital Allocation',
              title: 'Shareholder Distribution & Dividends',
              description: 'Gold Fields targets payout ratios between 30% and 45% of normalized earnings.',
              primaryCtaText: 'Dividend History',
              primaryCtaHref: '#history'
            }
          }
        ]
      },
      {
        id: 'comp_gf_inv_calendar',
        siteId: 'site_goldfields_investors',
        slug: 'calendar',
        title: 'Financial Reporting & AGM Calendar',
        collection: 'contemporary',
        status: 'draft',
        sections: [
          {
            id: 'sec_gf_cal_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Upcoming Events',
              title: '2026 Financial Calendar & AGM',
              description: 'Key dates for interim results announcements, quiet periods, and annual general meetings.',
              primaryCtaText: 'Add to Calendar',
              primaryCtaHref: '#export'
            }
          }
        ]
      },

      // Gold Fields 2030 ESG & Sustainability
      {
        id: 'comp_gf_esg_home',
        siteId: 'site_goldfields_sustainability',
        slug: 'home',
        title: '2030 ESG & Sustainable Value Strategy',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_esg_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Sustainable Value Creation',
              title: '2030 ESG & Decarbonisation Strategy',
              description: 'Committed to safe operations, renewable power micro-grids, and net positive biodiversity impact.',
              primaryCtaText: 'Read ESG Charter',
              primaryCtaHref: '#charter'
            }
          }
        ]
      },
      {
        id: 'comp_gf_esg_decarb',
        siteId: 'site_goldfields_sustainability',
        slug: 'decarbonisation',
        title: 'Khanyisa Micro-Grid & Decarbonisation Roadmap',
        collection: 'contemporary',
        status: 'draft',
        sections: [
          {
            id: 'sec_gf_decarb_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Net-Zero Pathway',
              title: 'Khanyisa Solar Micro-Grid & Scope 1-2 Roadmap',
              description: 'Delivering 50MW clean photovoltaic energy to the South Deep mechanized mine.',
              primaryCtaText: 'Live Solar Telemetry',
              primaryCtaHref: '#telemetry'
            }
          }
        ]
      },
      {
        id: 'comp_gf_esg_water',
        siteId: 'site_goldfields_sustainability',
        slug: 'water-stewardship',
        title: 'Water Stewardship & Catchment Protection',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_water_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'ICMM Conformance',
              title: 'Water Stewardship & Catchment Protection',
              description: 'Recycling 75% of operational water and implementing Global Industry Standard on Tailings Management (GISTM).',
              primaryCtaText: 'View Water Metrics',
              primaryCtaHref: '#metrics'
            }
          }
        ]
      },
      {
        id: 'comp_gf_esg_safety',
        siteId: 'site_goldfields_sustainability',
        slug: 'safety',
        title: 'Courageous Safety Leadership & Zero Harm',
        collection: 'contemporary',
        status: 'published',
        sections: [
          {
            id: 'sec_gf_safety_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Core Value',
              title: 'If We Cannot Mine Safely, We Will Not Mine',
              description: 'Eliminating fatal risks through critical control management and human-centric safety culture.',
              primaryCtaText: 'Safety Dashboard',
              primaryCtaHref: '#dashboard'
            }
          }
        ]
      },

      // Aurum Energy Flagship
      {
        id: 'comp_aurum_about',
        siteId: 'site_aurum_energy',
        slug: 'about',
        title: 'Corporate Profile & Transition Mandate',
        collection: 'editorial',
        status: 'published',
        sections: [
          {
            id: 'sec_aurum_abt_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: 'Clean Power Pioneer',
              title: 'Powering Africa’s Clean Industrial Transition',
              description: 'Accelerating high-capacity grid storage and renewable utility generation across sub-Saharan Africa.',
              primaryCtaText: 'Our Track Record',
              primaryCtaHref: '#track-record'
            }
          }
        ]
      },
      {
        id: 'comp_aurum_projects',
        siteId: 'site_aurum_energy',
        slug: 'projects',
        title: 'Grid-Scale Solar & Wind Asset Portfolio',
        collection: 'editorial',
        status: 'published',
        sections: [
          {
            id: 'sec_aurum_proj_hero',
            componentId: 'hero',
            variant: 'bold_split',
            visible: true,
            props: {
              eyebrow: '1.2 GW Installed Capacity',
              title: 'Active Solar & Wind Utility Assets',
              description: 'Operating high-availability solar PV and battery energy storage across Northern Cape and Karoo basins.',
              primaryCtaText: 'View Asset Map',
              primaryCtaHref: '#assets'
            }
          }
        ]
      },
      {
        id: 'comp_aurum_contact',
        siteId: 'site_aurum_energy',
        slug: 'contact',
        title: 'Commercial Power & Investor Inquiries',
        collection: 'editorial',
        status: 'published',
        sections: [
          {
            id: 'sec_aurum_cnt_hero',
            componentId: 'hero',
            variant: 'centered',
            visible: true,
            props: {
              eyebrow: 'Sandton Office',
              title: 'Commercial Power & Investor Inquiries',
              description: 'Direct inquiries for corporate Power Purchase Agreements (PPAs) and institutional financing.',
              primaryCtaText: 'Reach Commercial Team',
              primaryCtaHref: 'mailto:contact@aurumenergy.com'
            }
          }
        ]
      }
    ];

    for (const comp of demoCompositions) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO page_compositions (
          id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          comp.id,
          comp.siteId,
          comp.slug,
          comp.title,
          comp.collection,
          JSON.stringify(comp.sections),
          JSON.stringify({ description: comp.title }),
          1,
          comp.status,
          now,
          now
        ]
      });
    }
    console.log('[DB Migration] Seeded corporate compositions for multi-website portfolios.');
  } catch (err) {
    console.warn('[DB Migration] Notice seeding demo compositions:', err);
  }
}
