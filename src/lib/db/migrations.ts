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
