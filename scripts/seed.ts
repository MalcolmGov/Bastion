import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function hashPassword(password: string): string {
  const salt = process.env.AUTH_SALT || 'goldfields_studio_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log('--- Initializing Gold Fields Studio Database ---');
  const dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'studio.db')}`;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
  console.log(`Connecting to database: ${dbUrl.startsWith('file:') ? dbUrl : dbUrl.replace(/\/\/[^@]+@/, '//***@')}`);
  const db = createClient({ url: dbUrl, authToken: authToken || undefined });

  // 1. Execute schema.sql
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const statement of statements) {
    await db.execute(statement);
  }
  console.log('✓ Database schema tables verified.');

  const now = new Date().toISOString();

  // 2. Seed Users
  const users = [
    {
      id: 'usr_admin',
      name: 'Corporate Platform Admin',
      email: 'admin@goldfields.com',
      password_hash: hashPassword('GoldFields2026!'),
      role: 'platform_admin',
      region_scope: 'All',
      created_at: now
    },
    {
      id: 'usr_editor',
      name: 'Elena Rostova (Lead Editor)',
      email: 'editor@goldfields.com',
      password_hash: hashPassword('GoldFields2026!'),
      role: 'content_editor',
      region_scope: 'All',
      created_at: now
    },
    {
      id: 'usr_reviewer',
      name: 'Marcus Vance (Compliance Reviewer)',
      email: 'reviewer@goldfields.com',
      password_hash: hashPassword('GoldFields2026!'),
      role: 'reviewer',
      region_scope: 'All',
      created_at: now
    },
    {
      id: 'usr_publisher',
      name: 'Sipho Dlamini (Head of Communications)',
      email: 'publisher@goldfields.com',
      password_hash: hashPassword('GoldFields2026!'),
      role: 'publisher',
      region_scope: 'All',
      created_at: now
    },
    {
      id: 'usr_analyst',
      name: 'Thabo Mokoena (IR Analyst)',
      email: 'analyst@goldfields.com',
      password_hash: hashPassword('GoldFields2026!'),
      role: 'analyst',
      region_scope: 'All',
      created_at: now
    }
  ];

  for (const u of users) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO users (id, name, email, password_hash, role, region_scope, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [u.id, u.name, u.email, u.password_hash, u.role, u.region_scope, u.created_at]
    });
  }
  console.log(`✓ Seeded ${users.length} enterprise users.`);

  // 3. Helper to insert content record & published revision
  async function insertRecord(collection: string, id: string, slug: string, title: string, data: any) {
    const dataJson = JSON.stringify(data, null, 2);
    const contentHash = hashContent(dataJson);
    const revId = `rev_${id}_v1`;

    // Insert record first so revisions foreign key succeeds
    await db.execute({
      sql: `INSERT OR REPLACE INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, collection, slug, title, 'published', revId, revId, 'usr_admin', now, now]
    });

    await db.execute({
      sql: `INSERT OR REPLACE INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [revId, id, 1, dataJson, contentHash, 'usr_admin', now, 'published']
    });
  }

  // 4. Seed Operations
  const opsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/operations.json'), 'utf8'));
  for (const op of opsData) {
    await insertRecord('operations', op.id, op.slug, op.name, op);
  }
  console.log(`✓ Seeded ${opsData.length} operations records.`);

  // 5. Seed Reports
  const reportsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/reports.json'), 'utf8'));
  for (const rep of reportsData) {
    await insertRecord('reports', rep.id, rep.id, rep.title, rep);
  }
  console.log(`✓ Seeded ${reportsData.length} corporate reports.`);

  // 6. Seed News
  const newsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/news.json'), 'utf8'));
  for (const item of newsData) {
    await insertRecord('news', item.id, item.slug, item.title, item);
  }
  console.log(`✓ Seeded ${newsData.length} news & release articles.`);

  // 7. Seed Sustainability
  const sustData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/sustainability.json'), 'utf8'));
  for (const s of sustData) {
    await insertRecord('sustainability', s.id, s.id, s.title, s);
  }
  console.log(`✓ Seeded ${sustData.length} sustainability targets.`);

  // 8. Seed Jobs
  const jobsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/jobs.json'), 'utf8'));
  for (const j of jobsData) {
    await insertRecord('jobs', j.id, j.id, j.title, j);
  }
  console.log(`✓ Seeded ${jobsData.length} career vacancies.`);

  const supData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/content/suppliers.json'), 'utf8'));
  for (const sup of supData) {
    const supId = `sup_${sup.countryCode.toLowerCase()}`;
    const supSlug = sup.countryCode.toLowerCase();
    const supTitle = sup.title || `${sup.country} Supplier Guidance`;
    await insertRecord('suppliers', supId, supSlug, supTitle, sup);
  }
  console.log(`✓ Seeded ${supData.length} regional supplier guidelines.`);

  // 10. Seed Core Pages (Home, About, Operations, etc.)
  const pages = [
    {
      id: 'page_home',
      slug: 'home',
      title: 'Flagship Homepage',
      hero: {
        badge: 'Gold Fields Flagship • Global Production',
        title: 'Creating enduring value beyond mining.',
        subtitle: 'Discover our globally diversified operations, our workforce of over 20,000 people, and the sustainable economic value we generate across six mining jurisdictions.',
        bgImage: '/assets/goldfields-3d-mining-hero.jpg'
      },
      meta: {
        description: 'Gold Fields is a globally diversified gold producer with operations across Australia, Canada, Chile, Ghana, Peru, and South Africa.',
        keywords: 'Gold Fields, Gold Mining, South Deep, Tarkwa, Salares Norte, ESG Mining, H1 2026 Results, GFI'
      }
    },
    {
      id: 'page_about',
      slug: 'about',
      title: 'About Gold Fields — Purpose & Governance',
      hero: {
        title: 'Creating Enduring Value Beyond Mining',
        subtitle: 'Our purpose anchors our strategy to deliver sustainable, superior value for all stakeholders.'
      }
    },
    {
      id: 'page_sustainability',
      slug: 'sustainability',
      title: 'Sustainability & 2030 ESG Commitments',
      hero: {
        title: 'Sustainability Grounded in Science & Accountability',
        subtitle: 'Progress against our 2030 ESG Targets across decarbonization, water stewardship, and community value.'
      }
    },
    {
      id: 'page_operations',
      slug: 'operations',
      title: 'Global Mining Operations & Mineral Assets',
      hero: {
        badge: 'Global Operational Footprint',
        title: 'Disciplined Execution Across Six Mining Jurisdictions',
        subtitle: 'Our 10 mining operations across South Africa, Australia, Ghana, Chile, Peru, and Canada deliver resilient, mechanized production underpinned by renewable energy.'
      }
    },
    {
      id: 'page_reports',
      slug: 'reports',
      title: 'Reports & Regulatory Disclosures',
      hero: {
        badge: 'Corporate Reporting Suite',
        title: 'Transparent Reporting & Comprehensive Financial Disclosures',
        subtitle: 'Access audited annual integrated reports, quarterly results booklets, climate resilience disclosures, and mineral resource declarations.'
      }
    },
    {
      id: 'page_careers',
      slug: 'careers',
      title: 'Careers & Workplace Culture',
      hero: {
        badge: 'Life at Gold Fields',
        title: 'Empowering People to Shape the Future of Mining',
        subtitle: 'Join over 20,000 innovators, engineers, geologists, and technicians building safer, mechanized, and sustainable mining operations.'
      }
    },
    {
      id: 'page_suppliers',
      slug: 'suppliers',
      title: 'Suppliers & Procurement Guidelines',
      hero: {
        badge: 'Ethical Supply Chain',
        title: 'Transparent, Competitive, and Inclusive Procurement',
        subtitle: 'Prequalification checklists, anti-bribery standards, compliance mandates, and local content policies across our global operations.'
      }
    },
    {
      id: 'page_media',
      slug: 'media',
      title: 'Media Releases & Announcements',
      hero: {
        badge: 'Newsroom & Media Centre',
        title: 'Media Releases & Corporate Announcements',
        subtitle: 'Verified operational announcements, financial results, labor agreements, and renewable energy milestones across Gold Fields global assets.'
      }
    },
    {
      id: 'page_investors',
      slug: 'investors',
      title: 'Investor Relations & Shareholder Center',
      hero: {
        badge: 'Shareholder Value',
        title: 'Sustainable Returns, Capital Discipline & Growth',
        subtitle: 'Tracking JSE: GFI and NYSE: GFI performance, distribution history, financial calendar, and executive presentations.'
      }
    },
    {
      id: 'page_contact',
      slug: 'contact',
      title: 'Global Corporate Directory & Contact',
      hero: {
        badge: 'Connect With Us',
        title: 'Corporate Headquarters & Regional Administrative Offices',
        subtitle: 'Get in touch with executive management, media spokespeople, investor relations, and operational leadership across six jurisdictions.'
      }
    }
  ];

  for (const p of pages) {
    await insertRecord('pages', p.id, p.slug, p.title, p);
  }
  console.log(`✓ Seeded ${pages.length} core pages.`);

  // 11. Seed Media Assets from public/assets
  const assetsDir = path.join(process.cwd(), 'public/assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    let count = 0;
    for (const f of files) {
      if (f.startsWith('.')) continue;
      const stats = fs.statSync(path.join(assetsDir, f));
      const ext = path.extname(f).toLowerCase();
      let mime = 'image/jpeg';
      if (ext === '.png') mime = 'image/png';
      if (ext === '.svg') mime = 'image/svg+xml';
      if (ext === '.pdf') mime = 'application/pdf';

      const assetId = `asset_${f.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await db.execute({
        sql: `INSERT OR REPLACE INTO media_assets (id, filename, url, mime_type, size_bytes, alt_text, caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          assetId,
          f,
          `/assets/${f}`,
          mime,
          stats.size,
          `Gold Fields corporate asset: ${f}`,
          `Official asset in /assets/${f}`,
          now
        ]
      });
      count++;
    }
    console.log(`✓ Cataloged ${count} media library assets.`);
  }

  // 12. Seed AI Knowledge Sources
  const aiSources = [
    {
      id: 'ai_src_h1_results',
      title: 'H1 2026 Results Booklet & Disclosures',
      source_url: 'https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf',
      chunk_count: 48,
      status: 'indexed'
    },
    {
      id: 'ai_src_south_deep',
      title: 'South Deep Operational Profile & Khanyisa Solar',
      source_url: '/operations/south-deep',
      chunk_count: 24,
      status: 'indexed'
    },
    {
      id: 'ai_src_sustainability_report',
      title: '2024 Sustainability Report & 2030 Targets',
      source_url: '/sustainability',
      chunk_count: 64,
      status: 'indexed'
    },
    {
      id: 'ai_src_supplier_za',
      title: 'South Africa Host Community Supplier Onboarding',
      source_url: '/suppliers',
      chunk_count: 18,
      status: 'indexed'
    }
  ];

  for (const src of aiSources) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO ai_knowledge_items (id, title, source_url, status, chunk_count, last_indexed_at, eligibility_criteria) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [src.id, src.title, src.source_url, src.status, src.chunk_count, now, 'Eligible: published public disclosure']
    });
  }
  console.log(`✓ Seeded ${aiSources.length} public AI assistant knowledge items.`);

  // 13. Seed Incidents (Monitoring)
  const incidents = [
    {
      id: 'inc_001',
      title: 'Quarterly Financial Booklet CDN Distribution Cache Refresh Delay',
      severity: 'medium',
      status: 'resolved',
      affected_routes: '/investors, /reports',
      owner_id: 'usr_admin',
      timeline_json: JSON.stringify([
        { time: '2026-08-25T08:15:00Z', msg: 'Elevated cache miss latency observed on /reports booklet download.' },
        { time: '2026-08-25T08:32:00Z', msg: 'Origin asset pre-warmed across European and African edge nodes.' },
        { time: '2026-08-25T08:45:00Z', msg: 'Resolved. Edge cache hit ratio restored to 99.4%.' }
      ]),
      created_at: '2026-08-25T08:15:00Z',
      resolved_at: '2026-08-25T08:45:00Z'
    },
    {
      id: 'inc_002',
      title: 'Routine Semi-Annual Tailings GISTM Audit URL Integrity Verification',
      severity: 'low',
      status: 'acknowledged',
      affected_routes: '/sustainability',
      owner_id: 'usr_reviewer',
      timeline_json: JSON.stringify([
        { time: '2026-09-27T03:00:00Z', msg: 'Automated health worker flagged upcoming document renewal review.' }
      ]),
      created_at: '2026-09-27T03:00:00Z',
      resolved_at: null
    }
  ];

  for (const inc of incidents) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO incidents (id, title, severity, status, affected_routes, owner_id, timeline_json, created_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [inc.id, inc.title, inc.severity, inc.status, inc.affected_routes, inc.owner_id, inc.timeline_json, inc.created_at, inc.resolved_at]
    });
  }
  console.log(`✓ Seeded ${incidents.length} system health incidents.`);

  // 14. Seed Audit Log entries
  await db.execute({
    sql: `INSERT OR REPLACE INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'aud_init_01',
      'usr_admin',
      'Corporate Platform Admin',
      'SYSTEM_INITIALIZATION',
      'all',
      'system',
      'success',
      JSON.stringify({ note: 'Initial migration and schema seeding for Gold Fields Studio' }),
      'corr_init_001',
      '127.0.0.1',
      now
    ]
  });

  console.log('--- Gold Fields Studio Database Successfully Provisioned & Seeded ---');
}

main().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
