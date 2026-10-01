import { getDb } from '../src/lib/db/client';
import { generateContentHash } from '../src/lib/diff/diffEngine';

async function seedApprovalTasks() {
  const db = getDb();
  console.log('Seeding approval tasks for Move Studio & Gold Fields...');

  // Ensure reviewer/author users exist
  const existingUsers = await db.execute("SELECT id FROM users WHERE id = 'usr_sarah_ir'");
  if (existingUsers.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_sarah_ir',
        'Sarah Jenkins (IR Specialist)',
        'sarah.jenkins@goldfields.com',
        'scrypt:placeholder',
        'editor',
        'All',
        'client_goldfields',
        new Date().toISOString(),
      ],
    });
  }

  const existingCompliance = await db.execute("SELECT id FROM users WHERE id = 'usr_david_compliance'");
  if (existingCompliance.rows.length === 0) {
    await db.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'usr_david_compliance',
        'David Ndlovu (Compliance Lead)',
        'david.ndlovu@bastiongroup.co.za',
        'scrypt:placeholder',
        'admin',
        'All',
        null,
        new Date().toISOString(),
      ],
    });
  }

  // 1. Task 1: Financial Results Announcement (Stage 1: in_review)
  const task1Id = 'rec_results_h1_2026';
  const pubRev1Id = 'rev_results_h1_pub';
  const draftRev1Id = 'rev_results_h1_draft';

  const pub1Data = {
    title: 'Gold Fields Interim H1 2026 Financial Results',
    slug: 'h1-2026-financial-results',
    summary: 'Gold Fields announces interim financial figures for H1 2026. Attributable gold production of 1.05M ounces.',
    revenue: 'USD 2.40 Billion',
    headlineEarnings: 'USD 540 Million',
    interimDividend: '300 SA cents per ordinary share',
    status: 'Drafting',
    date: '2026-08-15',
  };

  const draft1Data = {
    title: 'Gold Fields Interim H1 2026 Financial Results & Dividend Declaration',
    slug: 'h1-2026-financial-results-dividend',
    summary: 'Gold Fields announces record interim financial figures for H1 2026 following strong operational performance at South Deep and Tarkwa. Attributable gold production increased to 1.18M ounces.',
    revenue: 'USD 2.85 Billion',
    headlineEarnings: 'USD 620 Million',
    interimDividend: '350 SA cents per ordinary share',
    status: 'Board Approved',
    date: '2026-08-15',
    auditFirm: 'PwC South Africa (Unqualified Audit Opinion)',
  };

  const hashPub1 = generateContentHash(pub1Data);
  const hashDraft1 = generateContentHash(draft1Data);

  // Clean existing
  await db.execute({ sql: 'DELETE FROM revisions WHERE record_id = ?', args: [task1Id] });
  await db.execute({ sql: 'DELETE FROM content_records WHERE id = ?', args: [task1Id] });

  // Insert Record 1
  await db.execute({
    sql: `INSERT INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, client_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      task1Id,
      'results',
      'h1-2026-financial-results',
      'H1 2026 Interim Financial Results & Dividend Declaration',
      'in_review',
      pubRev1Id,
      draftRev1Id,
      'usr_sarah_ir',
      'client_goldfields',
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });

  // Insert Revisions
  await db.execute({
    sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      pubRev1Id,
      task1Id,
      1,
      JSON.stringify(pub1Data, null, 2),
      hashPub1,
      'usr_sarah_ir',
      new Date(Date.now() - 86400000).toISOString(),
      'published',
      'Initial release baseline.',
    ],
  });

  await db.execute({
    sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      draftRev1Id,
      task1Id,
      2,
      JSON.stringify(draft1Data, null, 2),
      hashDraft1,
      'usr_sarah_ir',
      new Date().toISOString(),
      'in_review',
      'Updated with final audit committee signed figures and revised dividend declaration.',
    ],
  });

  // 2. Task 2: JSE SENS Trading Statement (Stage 2: approved / Executive Sign-off)
  const task2Id = 'rec_sens_trading_stmt_2026';
  const pubRev2Id = 'rev_sens_pub_2026';
  const draftRev2Id = 'rev_sens_draft_2026';

  const pub2Data = {
    title: 'Trading Statement for the Six Months Ended 30 June 2026',
    slug: 'sens-trading-statement-h1-2026',
    summary: 'Expected headline earnings per share (HEPS) between 55 US cents and 60 US cents per share.',
    ticker: 'GFI',
    exchange: 'JSE / NYSE',
    author: 'Legal & Investor Relations',
  };

  const draft2Data = {
    title: 'Trading Statement for the Six Months Ended 30 June 2026 - Revised Guidance',
    slug: 'sens-trading-statement-h1-2026-revised',
    summary: 'Expected headline earnings per share (HEPS) increased to between 68 US cents and 72 US cents (+20% variance above prior guidance).',
    ticker: 'GFI',
    exchange: 'JSE / NYSE',
    author: 'Legal & Investor Relations',
    jseSponsor: 'J.P. Morgan Equities South Africa Proprietary Limited',
  };

  const hashPub2 = generateContentHash(pub2Data);
  const hashDraft2 = generateContentHash(draft2Data);

  // Clean existing
  await db.execute({ sql: 'DELETE FROM revisions WHERE record_id = ?', args: [task2Id] });
  await db.execute({ sql: 'DELETE FROM content_records WHERE id = ?', args: [task2Id] });
  await db.execute({ sql: 'DELETE FROM approvals WHERE revision_id = ?', args: [draftRev2Id] });

  // Insert Record 2
  await db.execute({
    sql: `INSERT INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, client_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      task2Id,
      'sens',
      'sens-trading-statement-h1-2026',
      'JSE SENS: Revised Trading Statement Guidance H1 2026',
      'approved',
      pubRev2Id,
      draftRev2Id,
      'usr_david_compliance',
      'client_goldfields',
      new Date().toISOString(),
      new Date().toISOString(),
    ],
  });

  // Insert Revisions for Task 2
  await db.execute({
    sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      pubRev2Id,
      task2Id,
      1,
      JSON.stringify(pub2Data, null, 2),
      hashPub2,
      'usr_david_compliance',
      new Date(Date.now() - 172800000).toISOString(),
      'published',
      'Preliminary guidance draft.',
    ],
  });

  await db.execute({
    sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      draftRev2Id,
      task2Id,
      2,
      JSON.stringify(draft2Data, null, 2),
      hashDraft2,
      'usr_david_compliance',
      new Date().toISOString(),
      'approved',
      'Stage 1 compliance check cleared by JSE Sponsor.',
    ],
  });

  // Stage 1 approval record
  await db.execute({
    sql: `INSERT INTO approvals (id, revision_id, reviewer_id, decision, comment, content_hash_at_approval, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      `app_${Date.now()}_sens`,
      draftRev2Id,
      'usr_david_compliance',
      'approved',
      'JSE Listings Requirements Section 3.4 compliance verified against sponsor guidance.',
      hashDraft2,
      new Date().toISOString(),
    ],
  });

  console.log('✓ Successfully seeded 2 realistic enterprise approval tasks into local database.');
}

seedApprovalTasks().catch(console.error);
