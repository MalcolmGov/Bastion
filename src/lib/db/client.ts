import { createClient } from '@libsql/client';
import type { Client, InStatement } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let rawClient: Client | null = null;
let wrappedClient: Client | null = null;
let initPromise: Promise<void> | null = null;

function hashPassword(password: string): string {
  const salt = process.env.AUTH_SALT || 'goldfields_studio_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function getRawClient(): Client {
  if (!rawClient) {
    const isVercel = !!process.env.VERCEL;
    let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

    if (!url) {
      if (isVercel) {
        const tmpDbPath = '/tmp/studio.db';
        const bundled = path.join(process.cwd(), 'studio.db');

        // Copy bundled DB if /tmp/studio.db doesn't exist or is empty
        try {
          if (!fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0) {
            if (fs.existsSync(bundled) && fs.statSync(bundled).size > 0) {
              fs.copyFileSync(bundled, tmpDbPath);
              console.log('[DB] Successfully copied bundled studio.db to /tmp/studio.db');
            }
          }
        } catch (e) {
          console.warn('[DB] Could not copy studio.db to /tmp, will initialize from schema:', e);
        }

        url = `file:${tmpDbPath}`;
      } else {
        url = `file:${path.join(process.cwd(), 'studio.db')}`;
      }
    }

    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
    rawClient = createClient({
      url,
      authToken: authToken || undefined,
    });
  }
  return rawClient;
}

export async function ensureDbReady(): Promise<Client> {
  const raw = getRawClient();
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const check = await raw.execute(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='users' LIMIT 1"
        );
        if (check.rows.length === 0) {
          console.log('[DB] users table missing. Initializing schema and seed users...');
          await runInitSchema(raw);
          await seedEssentialUsers(raw);
          await seedEssentialContent(raw);
        }

        // Run Move Studio multi-tenant migrations and seeds
        const { runMoveStudioMigrations } = await import('@/lib/studio/seedMultiTenant');
        await runMoveStudioMigrations(raw);

        // Run Phase 2 migrations (Content Releases, Media Folders, Translations)
        const { runPhase2Migrations } = await import('@/lib/db/phase2Migrations');
        await runPhase2Migrations(raw);
      } catch (err) {
        console.error('[DB] Error inspecting database tables:', err);
        try {
          await runInitSchema(raw);
          await seedEssentialUsers(raw);
          const { runMoveStudioMigrations } = await import('@/lib/studio/seedMultiTenant');
          await runMoveStudioMigrations(raw);
          const { runPhase2Migrations } = await import('@/lib/db/phase2Migrations');
          await runPhase2Migrations(raw);
        } catch (innerErr) {
          console.error('[DB] Schema init fallback error:', innerErr);
        }
      }
    })();
  }
  await initPromise;
  return raw;
}

async function runInitSchema(db: Client): Promise<void> {
  let sql = '';
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql');
  try {
    if (fs.existsSync(schemaPath)) {
      sql = fs.readFileSync(schemaPath, 'utf8');
    }
  } catch (e) {
    console.warn('[DB] Could not read schema.sql, using embedded schema');
  }

  if (!sql) {
    sql = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        region_scope TEXT DEFAULT 'All',
        created_at TEXT NOT NULL,
        last_login TEXT
      );
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT
      );
      CREATE TABLE IF NOT EXISTS content_records (
        id TEXT PRIMARY KEY,
        collection TEXT NOT NULL,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'published',
        current_published_revision_id TEXT,
        current_draft_revision_id TEXT,
        owner_id TEXT REFERENCES users(id),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
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
      CREATE TABLE IF NOT EXISTS approvals (
        id TEXT PRIMARY KEY,
        revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
        reviewer_id TEXT NOT NULL REFERENCES users(id),
        decision TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL
      );
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
      CREATE TABLE IF NOT EXISTS media_assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        uploaded_by TEXT REFERENCES users(id),
        created_at TEXT NOT NULL
      );
    `;
  }

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      await db.execute(statement);
    } catch (e) {
      console.warn('[DB] Schema statement warning:', e);
    }
  }

  // Safe incremental schema column migrations
  try {
    await db.execute(`ALTER TABLE clients ADD COLUMN billing_details_json TEXT`);
  } catch (_) {}
  try {
    await db.execute(`ALTER TABLE billing_docs ADD COLUMN client_legal_name TEXT`);
  } catch (_) {}
  try {
    await db.execute(`ALTER TABLE billing_docs ADD COLUMN client_reg_no TEXT`);
  } catch (_) {}
  try {
    await db.execute(`ALTER TABLE billing_docs ADD COLUMN po_number TEXT`);
  } catch (_) {}
}

async function seedEssentialUsers(db: Client): Promise<void> {
  const now = new Date().toISOString();
  const defaultUsers = [
    {
      id: 'usr_malcolm_movedigital',
      name: 'Malcolm Govender (Platform Admin)',
      email: 'malcolm@movedigital.africa',
      password_hash: hashPassword('Bastion2026!'),
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

  for (const u of defaultUsers) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, region_scope, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [u.id, u.name, u.email, u.password_hash, u.role, u.region_scope, u.created_at]
      });
    } catch (err) {
      console.error('[DB] Failed to insert user:', u.email, err);
    }
  }
}

async function seedEssentialContent(db: Client): Promise<void> {
  const now = new Date().toISOString();
  function hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async function insertRecord(collection: string, id: string, slug: string, title: string, data: any) {
    const dataJson = JSON.stringify(data, null, 2);
    const contentHash = hashContent(dataJson);
    const revId = `rev_${id}_v1`;

    await db.execute({
      sql: `INSERT OR IGNORE INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, collection, slug, title, 'published', revId, revId, 'usr_admin', now, now]
    });

    await db.execute({
      sql: `INSERT OR IGNORE INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [revId, id, 1, dataJson, contentHash, 'usr_admin', now, 'published']
    });
  }

  try {
    const opsFile = path.join(process.cwd(), 'src/content/operations.json');
    if (fs.existsSync(opsFile)) {
      const ops = JSON.parse(fs.readFileSync(opsFile, 'utf8'));
      for (const op of ops) {
        await insertRecord('operations', op.id, op.slug, op.name, op);
      }
    }

    const pagesFile = path.join(process.cwd(), 'src/content/pages.json');
    if (fs.existsSync(pagesFile)) {
      const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
      for (const pg of pages) {
        await insertRecord('pages', pg.id, pg.slug, pg.title, pg);
      }
    }
  } catch (e) {
    console.warn('[DB] Seed essential content warning:', e);
  }
}

export function getDb(): Client {
  if (!wrappedClient) {
    const raw = getRawClient();

    // Wrap with automatic schema & user initialization guarantee
    wrappedClient = new Proxy(raw, {
      get(target, prop, receiver) {
        if (prop === 'execute') {
          return async (stmt: InStatement) => {
            await ensureDbReady();
            return target.execute(stmt);
          };
        }
        if (prop === 'batch') {
          return async (stmts: InStatement[], mode?: any) => {
            await ensureDbReady();
            return target.batch(stmts, mode);
          };
        }
        const val = Reflect.get(target, prop, receiver);
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    });
  }
  return wrappedClient;
}

export async function initDb(): Promise<void> {
  const raw = getRawClient();
  await runInitSchema(raw);
  await seedEssentialUsers(raw);
}
