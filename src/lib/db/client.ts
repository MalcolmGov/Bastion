import { createClient } from '@libsql/client';
import type { Client, InStatement } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth/password';

let rawClient: Client | null = null;
let wrappedClient: Client | null = null;
let initPromise: Promise<void> | null = null;

export interface DatabaseInfo {
  mode: 'hosted_turso' | 'local_file';
  url: string;
  isHosted: boolean;
  hasAuthToken: boolean;
}

export function getDatabaseInfo(): DatabaseInfo {
  const remoteUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const isHosted = !!remoteUrl && (remoteUrl.startsWith('libsql://') || remoteUrl.startsWith('https://'));
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
  return {
    mode: isHosted ? 'hosted_turso' : 'local_file',
    url: isHosted ? remoteUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@') : 'file:studio.db',
    isHosted,
    hasAuthToken: !!authToken
  };
}

export function validateProductionEnvironment(): { ok: boolean; issues: string[]; warnings: string[] } {
  const issues: string[] = [];
  const warnings: string[] = [];
  const isProd = process.env.NODE_ENV === 'production';
  const isVercel = !!process.env.VERCEL;
  const dbInfo = getDatabaseInfo();

  if ((isProd || isVercel) && !dbInfo.isHosted && process.env.ALLOW_LOCAL_DB !== 'true') {
    issues.push('TURSO_DATABASE_URL is missing. Hosted database required in production/serverless.');
  }

  if (dbInfo.isHosted && !dbInfo.hasAuthToken) {
    issues.push('TURSO_AUTH_TOKEN is missing for hosted Turso connection.');
  }

  if ((isProd || isVercel) && !process.env.RESEND_API_KEY && process.env.ALLOW_SIMULATED_EMAIL !== 'true') {
    issues.push('RESEND_API_KEY is not configured for transactional email delivery in production.');
  }

  if (!process.env.CRON_SECRET) {
    warnings.push('CRON_SECRET is not set; scheduled release execution is unprotected.');
  }

  if (!process.env.API_SECRET_TOKEN) {
    warnings.push('API_SECRET_TOKEN is not set; headless and GraphQL routes lack bearer token protection.');
  }

  return {
    ok: issues.length === 0,
    issues,
    warnings
  };
}

function getRawClient(): Client {
  if (!rawClient) {
    const isVercel = !!process.env.VERCEL;
    const isProd = process.env.NODE_ENV === 'production';
    let url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

    if (!url) {
      if ((isProd || isVercel) && process.env.ALLOW_LOCAL_DB !== 'true') {
        throw new Error(
          '[FATAL DB ERROR] Production launch blocked: TURSO_DATABASE_URL is not configured. ' +
          'Running with local SQLite in production/serverless will result in data loss on container restart. ' +
          'Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN, or set ALLOW_LOCAL_DB=true only for explicit local staging.'
        );
      }
      url = `file:${path.join(process.cwd(), 'studio.db')}`;
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

        // Run ordered versioned database migrations
        const { runMigrations } = await import('@/lib/db/migrations');
        await runMigrations(raw);

        // Run Move Studio multi-tenant migrations and seeds
        const { runMoveStudioMigrations } = await import('@/lib/studio/seedMultiTenant');
        await runMoveStudioMigrations(raw);

        // Run Phase 2 migrations (Content Releases, Media Folders, Translations)
        const { runPhase2Migrations } = await import('@/lib/db/phase2Migrations');
        await runPhase2Migrations(raw);
      } catch (err) {
        console.error('[DB] Error inspecting database tables:', err);
        try {
          const { runMigrations } = await import('@/lib/db/migrations');
          await runMigrations(raw);
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
        client_id TEXT,
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
        revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
        publish_at_utc TEXT NOT NULL,
        target_environment TEXT DEFAULT 'production',
        status TEXT NOT NULL DEFAULT 'pending',
        scheduled_by_id TEXT REFERENCES users(id),
        executed_at_utc TEXT,
        error_log TEXT
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
  if (process.env.SEED_DEMO_USERS !== 'true') return;

  const password = process.env.SEED_DEMO_PASSWORD?.trim() || '';
  if (password.length < 12) {
    console.warn('[DB] SEED_DEMO_USERS is set but SEED_DEMO_PASSWORD must be at least 12 characters. Skipping demo user seed.');
    return;
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const defaultUsers = [
    {
      id: 'usr_platform_admin',
      name: 'Bastion Platform Admin',
      email: process.env.SEED_ADMIN_EMAIL?.trim() || 'admin@bastion.local',
      role: 'platform_admin',
      region_scope: 'All',
      client_id: null as string | null,
    },
    {
      id: 'usr_editor',
      name: 'Client Lead Editor',
      email: 'editor@client.local',
      role: 'content_editor',
      region_scope: 'client_goldfields',
      client_id: 'client_goldfields',
    },
    {
      id: 'usr_reviewer',
      name: 'Client Reviewer',
      email: 'reviewer@client.local',
      role: 'reviewer',
      region_scope: 'client_goldfields',
      client_id: 'client_goldfields',
    },
    {
      id: 'usr_publisher',
      name: 'Client Publisher',
      email: 'publisher@client.local',
      role: 'publisher',
      region_scope: 'client_goldfields',
      client_id: 'client_goldfields',
    },
  ];

  for (const u of defaultUsers) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO users (id, name, email, password_hash, role, region_scope, client_id, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [u.id, u.name, u.email, passwordHash, u.role, u.region_scope, u.client_id, now]
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
