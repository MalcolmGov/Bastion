import type { Client } from '@libsql/client';

export interface Migration {
  version: number;
  name: string;
  up: (db: Client) => Promise<void>;
}

export const migrations: Migration[] = [
  {
    version: 1,
    name: '001_core_baseline_schema',
    up: async (db: Client) => {
      // Create baseline tables if not already existing
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          region_scope TEXT DEFAULT 'All',
          client_id TEXT,
          created_at TEXT NOT NULL,
          last_login TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS content_records (
          id TEXT PRIMARY KEY,
          collection TEXT NOT NULL,
          slug TEXT NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'published',
          current_published_revision_id TEXT,
          current_draft_revision_id TEXT,
          owner_id TEXT REFERENCES users(id),
          client_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS revisions (
          id TEXT PRIMARY KEY,
          record_id TEXT NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
          revision_number INTEGER NOT NULL,
          data_json TEXT NOT NULL,
          content_hash TEXT NOT NULL,
          author_id TEXT REFERENCES users(id),
          created_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          review_comments TEXT
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS approvals (
          id TEXT PRIMARY KEY,
          revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
          reviewer_id TEXT NOT NULL REFERENCES users(id),
          decision TEXT NOT NULL,
          comment TEXT,
          created_at TEXT NOT NULL
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS audit_log (
          id TEXT PRIMARY KEY,
          actor_id TEXT NOT NULL,
          actor_name TEXT NOT NULL,
          action TEXT NOT NULL,
          collection TEXT,
          record_id TEXT,
          result TEXT NOT NULL,
          details_json TEXT,
          correlation_id TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS scheduled_jobs (
          id TEXT PRIMARY KEY,
          record_id TEXT NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
          revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
          scheduled_for TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          executed_at TEXT,
          error_message TEXT,
          created_at TEXT NOT NULL
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS media_assets (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          url TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          width INTEGER,
          height INTEGER,
          alt_text TEXT,
          caption TEXT,
          uploaded_by TEXT REFERENCES users(id),
          client_id TEXT,
          created_at TEXT NOT NULL
        );
      `);
    }
  },
  {
    version: 2,
    name: '002_multi_tenant_boundaries',
    up: async (db: Client) => {
      // Helper to add column if not exists
      const addColumnIfNotExists = async (table: string, columnDef: string, colName: string) => {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const names = info.rows.map(r => String(r.name));
        if (!names.includes(colName)) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
        }
      };

      await addColumnIfNotExists('users', 'client_id TEXT', 'client_id');
      await addColumnIfNotExists('content_records', 'client_id TEXT', 'client_id');
      await addColumnIfNotExists('media_assets', 'client_id TEXT', 'client_id');

      // Create index on tenant columns for speed and isolation
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_records_client ON content_records(client_id)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_media_assets_client ON media_assets(client_id)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_users_client ON users(client_id)`);
    }
  },
  {
    version: 3,
    name: '003_per_site_api_tokens',
    up: async (db: Client) => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS api_tokens (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          client_id TEXT NOT NULL REFERENCES clients(id),
          site_id TEXT REFERENCES websites(id),
          scopes_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          revoked_at TEXT
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_api_tokens_client ON api_tokens(client_id)`);
    }
  },
  {
    version: 4,
    name: '004_auth_lockout_and_invites',
    up: async (db: Client) => {
      const addColumnIfNotExists = async (table: string, columnDef: string, colName: string) => {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const names = info.rows.map(r => String(r.name));
        if (!names.includes(colName)) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
        }
      };

      await addColumnIfNotExists('users', 'failed_login_attempts INTEGER DEFAULT 0', 'failed_login_attempts');
      await addColumnIfNotExists('users', 'locked_until TEXT', 'locked_until');
      await addColumnIfNotExists('users', 'must_reset_password INTEGER DEFAULT 0', 'must_reset_password');
      await addColumnIfNotExists('users', 'invite_token TEXT', 'invite_token');
      await addColumnIfNotExists('users', 'invite_token_expires_at TEXT', 'invite_token_expires_at');
    }
  },
  {
    version: 5,
    name: '005_approvals_content_hash',
    up: async (db: Client) => {
      const addColumnIfNotExists = async (table: string, columnDef: string, colName: string) => {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const names = info.rows.map(r => String(r.name));
        if (!names.includes(colName)) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
        }
      };

      await addColumnIfNotExists('approvals', 'content_hash_at_approval TEXT', 'content_hash_at_approval');
    }
  },
  {
    version: 6,
    name: '006_billing_compliance_and_particulars',
    up: async (db: Client) => {
      const addColumnIfNotExists = async (table: string, columnDef: string, colName: string) => {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const names = info.rows.map(r => String(r.name));
        if (!names.includes(colName)) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
        }
      };

      // Ensure billing_docs table exists
      await db.execute(`
        CREATE TABLE IF NOT EXISTS billing_docs (
          id TEXT PRIMARY KEY,
          doc_number TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL,
          client_id TEXT NOT NULL REFERENCES clients(id),
          website_id TEXT REFERENCES websites(id),
          currency TEXT NOT NULL DEFAULT 'ZAR',
          subtotal REAL NOT NULL,
          vat_rate REAL NOT NULL DEFAULT 0.15,
          vat_amount REAL NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft',
          payment_terms TEXT,
          due_date TEXT,
          issued_date TEXT NOT NULL,
          client_legal_name TEXT,
          client_reg_no TEXT,
          client_vat_no TEXT,
          client_address TEXT,
          po_number TEXT,
          items_json TEXT NOT NULL,
          notes TEXT,
          acceptance_token TEXT UNIQUE,
          accepted_at TEXT,
          accepted_by_name TEXT,
          accepted_by_email TEXT,
          accepted_signature_svg TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      await addColumnIfNotExists('clients', 'billing_details_json TEXT', 'billing_details_json');
      await addColumnIfNotExists('billing_docs', 'client_legal_name TEXT', 'client_legal_name');
      await addColumnIfNotExists('billing_docs', 'client_reg_no TEXT', 'client_reg_no');
      await addColumnIfNotExists('billing_docs', 'po_number TEXT', 'po_number');
    }
  },
  {
    version: 7,
    name: '007_releases_and_schedules',
    up: async (db: Client) => {
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

      const addColumnIfNotExists = async (table: string, columnDef: string, colName: string) => {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const names = info.rows.map(r => String(r.name));
        if (!names.includes(colName)) {
          await db.execute(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
        }
      };

      await addColumnIfNotExists('scheduled_jobs', 'client_id TEXT', 'client_id');
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_releases_client ON content_releases(client_id)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_content_releases_status ON content_releases(status)`);
    }
  },
  {
    version: 8,
    name: '008_sre_and_probes',
    up: async (db: Client) => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS incidents (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          severity TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          affected_routes TEXT,
          owner_id TEXT REFERENCES users(id),
          timeline_json TEXT,
          created_at TEXT NOT NULL,
          resolved_at TEXT,
          error_details TEXT,
          ai_diagnosis TEXT,
          ai_proposed_patch TEXT,
          risk_level TEXT DEFAULT 'low',
          pr_number INTEGER,
          pr_url TEXT,
          pr_branch TEXT,
          pr_status TEXT DEFAULT 'none',
          approval_status TEXT DEFAULT 'pending_review',
          approved_by TEXT,
          deploy_status TEXT DEFAULT 'idle',
          verification_status TEXT DEFAULT 'unverified',
          repo_owner TEXT DEFAULT 'MalcolmGov',
          repo_name TEXT DEFAULT 'MoveDigital'
        );
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS sla_probes (
          id TEXT PRIMARY KEY,
          site_id TEXT NOT NULL,
          url TEXT NOT NULL,
          status TEXT NOT NULL,
          http_code INTEGER,
          latency_ms INTEGER,
          ssl_status TEXT,
          ssl_days_remaining INTEGER,
          region TEXT,
          probed_at TEXT NOT NULL
        );
      `);

      await db.execute(`CREATE INDEX IF NOT EXISTS idx_sla_probes_site ON sla_probes (site_id, probed_at DESC);`);
    }
  },
  {
    version: 9,
    name: '009_email_deliveries_and_page_versions',
    up: async (db: Client) => {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS email_deliveries (
          id TEXT PRIMARY KEY,
          recipient_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          role_title TEXT,
          client_name TEXT,
          provider TEXT NOT NULL DEFAULT 'resend',
          status TEXT NOT NULL DEFAULT 'delivered',
          provider_message_id TEXT,
          error_message TEXT,
          created_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_email_deliveries_recipient ON email_deliveries(recipient_email);`);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS page_versions (
          id TEXT PRIMARY KEY,
          composition_id TEXT NOT NULL,
          site_id TEXT NOT NULL,
          page_slug TEXT NOT NULL,
          version INTEGER NOT NULL,
          title TEXT NOT NULL,
          layout_collection TEXT DEFAULT 'contemporary',
          sections_json TEXT NOT NULL,
          meta_json TEXT,
          status TEXT NOT NULL DEFAULT 'draft',
          created_by TEXT,
          created_by_name TEXT,
          change_summary TEXT,
          created_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_page_versions_site_page ON page_versions(site_id, page_slug, version DESC);`);
    }
  },
  {
    version: 10,
    name: '010_sens_and_financial_calendar',
    up: async (db: Client) => {
      // 1. SENS Announcements Table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS sens_announcements (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          site_id TEXT NOT NULL,
          headline TEXT NOT NULL,
          announcement_type TEXT NOT NULL DEFAULT 'general',
          jse_code TEXT NOT NULL DEFAULT 'JSE: GFI',
          isin_code TEXT,
          released_at TEXT NOT NULL,
          body_html TEXT NOT NULL,
          summary TEXT,
          pdf_url TEXT,
          is_price_sensitive INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL DEFAULT 'published',
          sponsor TEXT DEFAULT 'J.P. Morgan Equities South Africa (Pty) Ltd',
          embargo_until TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_sens_client_released ON sens_announcements(client_id, released_at DESC);`);

      // 2. Financial Calendar Events Table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS financial_calendar_events (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          site_id TEXT NOT NULL,
          title TEXT NOT NULL,
          event_type TEXT NOT NULL DEFAULT 'results_announcement',
          event_date TEXT NOT NULL,
          time_sast TEXT NOT NULL DEFAULT '10:00 SAST',
          location TEXT,
          webcast_url TEXT,
          description TEXT,
          dividend_rate_cents REAL,
          dividend_currency TEXT DEFAULT 'ZAR',
          dwt_applicable INTEGER DEFAULT 1,
          is_completed INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_fin_cal_client_date ON financial_calendar_events(client_id, event_date ASC);`);

      // 3. Investor Reports & Publications Table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS investor_reports (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          site_id TEXT NOT NULL,
          title TEXT NOT NULL,
          fiscal_year INTEGER NOT NULL,
          period TEXT NOT NULL DEFAULT 'FY',
          report_type TEXT NOT NULL DEFAULT 'integrated_annual_report',
          pdf_url TEXT NOT NULL,
          filesize_bytes INTEGER DEFAULT 0,
          download_count INTEGER DEFAULT 0,
          published_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_inv_reports_client_year ON investor_reports(client_id, fiscal_year DESC);`);
    }
  },
  {
    version: 11,
    name: '011_governance_and_compliance_scorecard',
    up: async (db: Client) => {
      // 1. Governance Audits Table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS governance_audits (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          site_id TEXT NOT NULL,
          overall_score INTEGER NOT NULL,
          popia_score INTEGER NOT NULL,
          paia_score INTEGER NOT NULL,
          king_iv_score INTEGER NOT NULL,
          security_score INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'compliant',
          total_checks INTEGER NOT NULL DEFAULT 0,
          passed_checks INTEGER NOT NULL DEFAULT 0,
          warning_checks INTEGER NOT NULL DEFAULT 0,
          failed_checks INTEGER NOT NULL DEFAULT 0,
          scanned_by TEXT DEFAULT 'Bastion Statutory Compliance Engine',
          created_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_gov_audits_client ON governance_audits(client_id, created_at DESC);`);

      // 2. Governance Check Results Table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS governance_check_results (
          id TEXT PRIMARY KEY,
          audit_id TEXT NOT NULL REFERENCES governance_audits(id) ON DELETE CASCADE,
          client_id TEXT NOT NULL REFERENCES clients(id),
          rule_id TEXT NOT NULL,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          statutory_ref TEXT NOT NULL,
          status TEXT NOT NULL,
          severity TEXT NOT NULL,
          score_weight INTEGER NOT NULL DEFAULT 10,
          evidence_text TEXT,
          remediation_advice TEXT,
          created_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_gov_results_audit ON governance_check_results(audit_id, category);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_gov_results_client ON governance_check_results(client_id);`);
    }
  },
  {
    version: 12,
    name: '012_whistleblower_and_tenders',
    up: async (db: Client) => {
      // 1. Encrypted Whistleblower Reports (Zero IP Address retention)
      await db.execute(`
        CREATE TABLE IF NOT EXISTS whistleblower_reports (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          tracking_code TEXT UNIQUE NOT NULL,
          access_key_hash TEXT NOT NULL,
          category TEXT NOT NULL,
          severity TEXT NOT NULL DEFAULT 'medium',
          jurisdiction TEXT NOT NULL DEFAULT 'ZA',
          subject TEXT NOT NULL,
          encrypted_details TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'received',
          assigned_investigator_id TEXT REFERENCES users(id),
          resolution_summary TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_wb_reports_client ON whistleblower_reports(client_id, created_at DESC);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_wb_reports_tracking ON whistleblower_reports(tracking_code);`);

      // 2. Whistleblower Confidential Chat Messages
      await db.execute(`
        CREATE TABLE IF NOT EXISTS whistleblower_messages (
          id TEXT PRIMARY KEY,
          report_id TEXT NOT NULL REFERENCES whistleblower_reports(id) ON DELETE CASCADE,
          sender_type TEXT NOT NULL,
          sender_id TEXT,
          encrypted_message TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_wb_messages_report ON whistleblower_messages(report_id, created_at ASC);`);

      // 3. Corporate Supplier Tenders / RFPs
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tenders (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL REFERENCES clients(id),
          tender_number TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          estimated_value TEXT,
          closing_date TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          min_bbbee_level INTEGER DEFAULT 4,
          cidb_grading TEXT,
          host_community_mandate INTEGER DEFAULT 1,
          scope_document_url TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_tenders_client ON tenders(client_id, status, closing_date);`);

      // 4. Supplier Tender Bid Submissions
      await db.execute(`
        CREATE TABLE IF NOT EXISTS tender_submissions (
          id TEXT PRIMARY KEY,
          tender_id TEXT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
          client_id TEXT NOT NULL REFERENCES clients(id),
          reference_code TEXT UNIQUE NOT NULL,
          vendor_name TEXT NOT NULL,
          cipc_registration_number TEXT NOT NULL,
          sars_tax_pin TEXT NOT NULL,
          bbbee_level INTEGER NOT NULL,
          host_community_registered INTEGER NOT NULL DEFAULT 0,
          contact_name TEXT NOT NULL,
          contact_email TEXT NOT NULL,
          contact_phone TEXT NOT NULL,
          bid_amount REAL,
          currency TEXT NOT NULL DEFAULT 'ZAR',
          status TEXT NOT NULL DEFAULT 'submitted',
          compliance_notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_tender_subs_tender ON tender_submissions(tender_id, created_at DESC);`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_tender_subs_client ON tender_submissions(client_id);`);
    }
  },
  {
    version: 13,
    name: '013_strict_multi_tenant_data_isolation',
    up: async (db: Client) => {
      // 1. Assign unassigned content_records to client_goldfields
      await db.execute(`UPDATE content_records SET client_id = 'client_goldfields' WHERE client_id IS NULL OR client_id = ''`);
      
      // 2. Ensure media_folders table exists and assign unassigned media_assets and media_folders to client_goldfields
      await db.execute(`
        CREATE TABLE IF NOT EXISTS media_folders (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          client_id TEXT,
          site_id TEXT,
          parent_id TEXT,
          created_at TEXT NOT NULL
        )
      `);
      await db.execute(`UPDATE media_assets SET client_id = 'client_goldfields' WHERE client_id IS NULL OR client_id = ''`);
      await db.execute(`UPDATE media_folders SET client_id = 'client_goldfields' WHERE client_id IS NULL OR client_id = ''`);
      
      // 3. Ensure results_documents table exists and assign unassigned results_documents to client_bastion
      await db.execute(`
        CREATE TABLE IF NOT EXISTS results_documents (
          id TEXT PRIMARY KEY,
          client_id TEXT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL,
          source_filename TEXT,
          document_json TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          published_at TEXT
        )
      `);
      await db.execute(`UPDATE results_documents SET client_id = 'client_bastion' WHERE client_id IS NULL OR client_id = ''`);

      // 4. Ensure starter content_records exist for each client in the database
      const clientsRes = await db.execute(`SELECT id, name, slug FROM clients`);
      const now = new Date().toISOString();

      for (const row of clientsRes.rows) {
        const cId = String(row.id);
        const cName = String(row.name);
        const cSlug = String(row.slug || cId.replace('client_', ''));

        if (cId === 'client_goldfields') continue;

        const pagesRes = await db.execute({
          sql: `SELECT count(*) as c FROM content_records WHERE client_id = ? AND collection = 'pages'`,
          args: [cId]
        });
        const count = Number(pagesRes.rows[0]?.c || 0);

        if (count === 0) {
          const starterPages = [
            {
              slug: 'home',
              title: `${cName} — Flagship Homepage`,
              tagline: `Welcome to the official digital portal for ${cName}.`,
            },
            {
              slug: 'about',
              title: `About ${cName} — Purpose & Leadership`,
              tagline: `Enterprise stewardship, executive board leadership, and corporate governance at ${cName}.`,
            },
            {
              slug: 'services',
              title: `${cName} Capabilities & Solutions`,
              tagline: `Core specialist services, client engagement models, and execution frameworks.`,
            },
            {
              slug: 'reports',
              title: `${cName} Disclosures & Financial Reports`,
              tagline: `Audited financial disclosures, regulatory announcements, and governance documentation.`,
            },
            {
              slug: 'contact',
              title: `Contact & Corporate Directory — ${cName}`,
              tagline: `Direct stakeholder communication channels and regional office locations.`,
            },
            {
              slug: 'news',
              title: `${cName} Announcements & Media Releases`,
              tagline: `Official executive statements, corporate press releases, and market updates.`,
            }
          ];

          for (const page of starterPages) {
            const recId = `page_${cSlug}_${page.slug}`;
            const revId = `rev_${recId}_v1`;
            const dataJson = JSON.stringify({
              title: page.title,
              slug: page.slug,
              tagline: page.tagline,
              clientName: cName,
              clientId: cId,
              status: 'published'
            }, null, 2);

            await db.execute({
              sql: `INSERT OR REPLACE INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, client_id, created_at, updated_at)
                    VALUES (?, 'pages', ?, ?, 'published', ?, ?, 'usr_admin', ?, ?, ?)`,
              args: [recId, page.slug, page.title, revId, revId, cId, now, now]
            });

            await db.execute({
              sql: `INSERT OR REPLACE INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status)
                    VALUES (?, ?, 1, ?, 'seeded_hash', 'usr_admin', ?, 'published')`,
              args: [revId, recId, dataJson, now]
            });
          }
        }

        // Check if client has media folders
        const folderRes = await db.execute({
          sql: `SELECT count(*) as c FROM media_folders WHERE client_id = ?`,
          args: [cId]
        });
        if (Number(folderRes.rows[0]?.c || 0) === 0) {
          const defaultFolders = [
            'Logos & Brand DNA',
            'Executive Photography',
            'Regulatory Filings & PDFs',
            'Press & Media Assets',
            'Website Banners'
          ];
          for (let i = 0; i < defaultFolders.length; i++) {
            await db.execute({
              sql: `INSERT OR IGNORE INTO media_folders (id, name, client_id, created_at) VALUES (?, ?, ?, ?)`,
              args: [`fld_${cSlug}_${i + 1}`, defaultFolders[i], cId, now]
            });
          }
        }
      }
    }
  }
];

export async function runMigrations(db: Client): Promise<void> {
  // Ensure schema_migrations exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRes = await db.execute(`SELECT version FROM schema_migrations ORDER BY version ASC`);
  const appliedVersions = new Set<number>(appliedRes.rows.map(r => Number(r.version)));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      continue;
    }

    console.log(`[DB Migration] Applying migration ${migration.version}: ${migration.name}...`);
    try {
      await migration.up(db);
      await db.execute({
        sql: `INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)`,
        args: [migration.version, migration.name, new Date().toISOString()]
      });
      console.log(`[DB Migration] ✓ Successfully applied ${migration.name}`);
    } catch (err: any) {
      console.error(`[DB Migration] ✗ FAILED migration ${migration.version} (${migration.name}):`, err);
      // Halt execution immediately on migration failure
      throw new Error(`Migration ${migration.version} (${migration.name}) failed: ${err.message}`);
    }
  }
}
