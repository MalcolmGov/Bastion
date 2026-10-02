import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword } from '../src/lib/auth/password';
import { seedGoldFieldsResults } from './seed-results-document';
import { encryptSecret } from '../src/lib/crypto/encryption';

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

  // 2. Seed Users only when an operator supplies a password. Never write a shared demo password.
  const demoPassword = process.env.SEED_DEMO_PASSWORD?.trim() || '';
  if (demoPassword.length < 12) {
    console.log('Skipping user seed. Set SEED_DEMO_PASSWORD (12+ characters) to create demo accounts.');
  } else {
    const passwordHash = hashPassword(demoPassword);
    const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim() || 'admin@bastion.local';
    const users = [
      {
        id: 'usr_admin',
        name: 'Bastion Platform Admin',
        email: adminEmail,
        password_hash: passwordHash,
        role: 'platform_admin',
        region_scope: 'All',
        client_id: null as string | null,
        created_at: now
      },
      {
        id: 'usr_editor',
        name: 'Client Lead Editor',
        email: 'editor@client.local',
        password_hash: passwordHash,
        role: 'content_editor',
        region_scope: 'client_goldfields',
        client_id: 'client_goldfields',
        created_at: now
      },
      {
        id: 'usr_reviewer',
        name: 'Client Reviewer',
        email: 'reviewer@client.local',
        password_hash: passwordHash,
        role: 'reviewer',
        region_scope: 'client_goldfields',
        client_id: 'client_goldfields',
        created_at: now
      },
      {
        id: 'usr_publisher',
        name: 'Client Publisher',
        email: 'publisher@client.local',
        password_hash: passwordHash,
        role: 'publisher',
        region_scope: 'client_goldfields',
        client_id: 'client_goldfields',
        created_at: now
      }
    ];

    for (const u of users) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [u.id, u.name, u.email, u.password_hash, u.role, u.region_scope, u.client_id, now]
      });
    }
    console.log(`✓ Seeded ${users.length} users. Admin email: ${adminEmail}`);
  }

  // 3. Helper to insert content record & published revision
  async function insertRecord(collection: string, id: string, slug: string, title: string, data: any) {
    const dataJson = JSON.stringify(data, null, 2);
    const contentHash = hashContent(dataJson);
    const revId = `rev_${id}_v1`;

    // Insert record first so revisions foreign key succeeds
    await db.execute({
      sql: `INSERT OR REPLACE INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, client_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, collection, slug, title, 'published', revId, revId, 'usr_admin', 'client_goldfields', now, now]
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

  // 15. Seed Gold Fields H1 2026 Interactive Results Document
  await seedGoldFieldsResults();

  // 16. Seed Corporate Tenders & RFPs (Phase 5)
  const tenders = [
    {
      id: 'tdr_seed_001',
      client_id: 'client_goldfields',
      tender_number: 'GF-2026-RFP-088',
      title: 'South Deep Solar PV Microgrid Phase II (40MW Expansion)',
      category: 'Renewable Energy & Power',
      description: 'Turnkey EPC contractor services for 40MW DC ground-mounted solar expansion and 20MW/80MWh battery energy storage system (BESS) integration at South Deep mine, Gauteng.',
      estimated_value: 'R 480,000,000',
      closing_date: '2026-11-30T17:00:00Z',
      status: 'active',
      min_bbbee_level: 4,
      cidb_grading: '9EP / 9GB',
      host_community_mandate: 1,
      created_at: '2026-09-01T08:00:00Z',
      updated_at: '2026-09-01T08:00:00Z',
    },
    {
      id: 'tdr_seed_002',
      client_id: 'client_goldfields',
      tender_number: 'GF-2026-RFP-089',
      title: 'Tarkwa Tailings Storage Facility (TSF) Automated Piezometer & Geotechnical Sensor Network',
      category: 'Environmental & Tailings',
      description: 'Supply, installation, and cloud telemetry integration of vibrating wire piezometers, inclinometers, and robotic total stations adhering to Global Industry Standard on Tailings Management (GISTM).',
      estimated_value: 'R 32,500,000',
      closing_date: '2026-10-31T17:00:00Z',
      status: 'active',
      min_bbbee_level: 3,
      cidb_grading: '7CE',
      host_community_mandate: 0,
      created_at: '2026-09-10T08:00:00Z',
      updated_at: '2026-09-10T08:00:00Z',
    },
    {
      id: 'tdr_seed_003',
      client_id: 'client_goldfields',
      tender_number: 'GF-2026-RFP-090',
      title: 'Deep Underground Haulage Fleet Telemetry & Proximity Detection System (PDS Level 9)',
      category: 'Mining Operations & Underground',
      description: 'Retrofit of underground load-haul-dump (LHD) loaders and 50t haul trucks with fail-safe ISO 21815-compliant machine intervention collision prevention systems.',
      estimated_value: 'R 65,000,000',
      closing_date: '2026-11-15T17:00:00Z',
      status: 'active',
      min_bbbee_level: 4,
      cidb_grading: null,
      host_community_mandate: 1,
      created_at: '2026-09-15T08:00:00Z',
      updated_at: '2026-09-15T08:00:00Z',
    },
  ];

  for (const t of tenders) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO tenders (
              id, client_id, tender_number, title, category, description,
              estimated_value, closing_date, status, min_bbbee_level, cidb_grading,
              host_community_mandate, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        t.id, t.client_id, t.tender_number, t.title, t.category, t.description,
        t.estimated_value, t.closing_date, t.status, t.min_bbbee_level, t.cidb_grading,
        t.host_community_mandate, t.created_at, t.updated_at
      ]
    });
  }
  console.log(`✓ Seeded ${tenders.length} corporate supplier tenders.`);

  // Seed sample tender submission
  await db.execute({
    sql: `INSERT OR REPLACE INTO tender_submissions (
            id, tender_id, client_id, reference_code, vendor_name,
            cipc_registration_number, sars_tax_pin, bbbee_level,
            host_community_registered, contact_name, contact_email, contact_phone,
            bid_amount, currency, status, compliance_notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'sub_seed_001',
      'tdr_seed_001',
      'client_goldfields',
      'BID-2026-WR891',
      'West Rand Engineering Services (Pty) Ltd',
      '2018/142981/07',
      '998877661',
      2,
      1,
      'Sipho Ndlovu',
      'sndlovu@wrengineering.co.za',
      '+27 11 950 1200',
      465000000,
      'ZAR',
      'compliant',
      'Verified: CIPC valid format, SARS TCS PIN verified, B-BBEE Level 2 compliant, Host community registered.',
      '2026-09-20T10:30:00Z',
      '2026-09-20T10:30:00Z'
    ]
  });
  console.log('✓ Seeded 1 verified supplier tender bid submission.');

  // 17. Seed Whistleblower Report (Phase 5: AES-256-GCM Encrypted at rest, Zero-IP)
  const saltHash = crypto.createHash('sha256').update('bastion_ethics_salt_ak_demo1234567890').digest('hex');
  const narrative = JSON.stringify({
    details: 'Observed non-compliant diesel spillage near West Shaft ventilation shaft 2 without secondary containment bunding. Maintenance logbook entries appeared backdated.',
    incidentDate: '2026-09-18',
    involvedParties: 'Shift B maintenance crew',
    evidenceLinks: []
  });
  const encryptedPayload = encryptSecret(narrative);

  await db.execute({
    sql: `INSERT OR REPLACE INTO whistleblower_reports (
            id, client_id, tracking_code, access_key_hash, category, severity,
            jurisdiction, subject, encrypted_details, status, resolution_summary,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'wb_seed_001',
      'client_goldfields',
      'ETH-2026-9F4B2',
      saltHash,
      'environmental',
      'high',
      'ZA',
      'Unbunded Diesel Spillage & Backdated Maintenance Log at West Shaft',
      encryptedPayload,
      'under_investigation',
      'Environmental Health & Safety officer dispatched for ground inspection.',
      '2026-09-19T14:20:00Z',
      '2026-09-20T09:00:00Z'
    ]
  });

  const encryptedMsg1 = encryptSecret('Thank you for this disclosure. A senior environmental engineer has been dispatched to West Shaft to inspect secondary containment.');
  await db.execute({
    sql: `INSERT OR REPLACE INTO whistleblower_messages (
            id, report_id, sender_type, sender_id, encrypted_message, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      'msg_seed_001',
      'wb_seed_001',
      'investigator',
      'usr_reviewer',
      encryptedMsg1,
      '2026-09-19T16:00:00Z'
    ]
  });

  const encryptedMsg2 = encryptSecret('Understood. Additional photographic evidence of the drainage sump has been retained if required.');
  await db.execute({
    sql: `INSERT OR REPLACE INTO whistleblower_messages (
            id, report_id, sender_type, sender_id, encrypted_message, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      'msg_seed_002',
      'wb_seed_001',
      'whistleblower',
      null,
      encryptedMsg2,
      '2026-09-19T18:15:00Z'
    ]
  });
  console.log('✓ Seeded 1 encrypted whistleblower case with 2 dialogue messages (zero-IP).');

  console.log('--- Gold Fields Studio Database Successfully Provisioned & Seeded ---');
}

main().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
