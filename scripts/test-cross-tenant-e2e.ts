/**
 * Bastion Move Studio: Cross-Tenant HTTP E2E Matrix & Edge Defense Test Suite
 * Proves isolation between Client A and Client B at the HTTP protocol layer,
 * verifies automated cron release execution, and tests IP sliding-window rate limiting.
 */

import { getDb, ensureDbReady } from '../src/lib/db/client';
import { hashPassword } from '../src/lib/auth/password';
import { saveResultsDocument } from '../src/lib/results/store';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3010';
const CRON_SECRET = process.env.CRON_SECRET || 'bastion_cron_worker_production_key_2026';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];

async function test(suite: string, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ suite, name, status: 'PASS' });
    console.log(`  ✅ [PASS] ${suite} -> ${name}`);
  } catch (err: any) {
    results.push({ suite, name, status: 'FAIL', details: err.message });
    console.error(`  ❌ [FAIL] ${suite} -> ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function loginUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Login failed for ${email} (HTTP ${res.status}): ${data.error || 'Unknown'}`);
  }

  const setCookie = res.headers.get('set-cookie') || '';
  const match = setCookie.match(/gf_studio_session=([^;]+)/);
  if (!match) {
    throw new Error(`No gf_studio_session cookie received for ${email}`);
  }

  return match[1];
}

async function main() {
  console.log('============================================================');
  console.log('🛡️  BASTION MOVE STUDIO: CROSS-TENANT HTTP E2E MATRIX');
  console.log('============================================================\n');

  await ensureDbReady();
  const db = getDb();
  const now = new Date().toISOString();

  // 1. Provision Test Persona Accounts
  console.log('1. Setting up isolated test personas...');
  const testPassword = 'TestPassword2026!';
  const passwordHash = hashPassword(testPassword);

  // Client A Persona: Gold Fields Content Editor
  const emailA = `editor_goldfields_${Date.now()}@client.test`;
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, failed_login_attempts, locked_until, created_at)
          VALUES (?, 'Gold Fields Lead Editor', ?, ?, 'content_editor', 'client_goldfields', 'client_goldfields', 0, NULL, ?)`,
    args: [`usr_test_gf_${Date.now()}`, emailA, passwordHash, now],
  });

  // Client B Persona: Vodacom Content Editor
  const emailB = `editor_vodacom_${Date.now()}@client.test`;
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, failed_login_attempts, locked_until, created_at)
          VALUES (?, 'Vodacom Group Editor', ?, ?, 'content_editor', 'client_vodacom_group', 'client_vodacom_group', 0, NULL, ?)`,
    args: [`usr_test_vod_${Date.now()}`, emailB, passwordHash, now],
  });

  // 2. Perform Authenticated Logins
  console.log('2. Authenticating personas via HTTP login endpoint...');
  const cookieA = await loginUser(emailA, testPassword);
  const cookieB = await loginUser(emailB, testPassword);
  console.log('✓ Successfully obtained HTTP session cookies for Client A and Client B\n');

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: HTTP CROSS-TENANT DATA ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('📦 SUITE 1: Cross-Tenant Resource Isolation via HTTP');

  await test('Cross-Tenant', 'Client A calling agency-only billing route receives 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/billing`, {
      headers: { Cookie: `gf_studio_session=${cookieA}` },
    });
    assert(res.status === 403, `Expected HTTP 403 Forbidden, got ${res.status}`);
  });

  await test('Cross-Tenant', 'Client A calling agency-only SRE health route receives 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/health`, {
      headers: { Cookie: `gf_studio_session=${cookieA}` },
    });
    assert(res.status === 403, `Expected HTTP 403 Forbidden, got ${res.status}`);
  });

  await test('Cross-Tenant', 'Client A calling /api/admin/users only sees their own client tenant users', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `gf_studio_session=${cookieA}` },
    });
    assert(res.ok, `Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    const leaked = (data.users || []).some((u: any) => u.client_id !== 'client_goldfields');
    assert(!leaked, 'Client A saw users belonging to other tenants');
  });

  await test('Cross-Tenant', 'Client A calling /api/admin/clients only sees their own client fleet', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/clients`, {
      headers: { Cookie: `gf_studio_session=${cookieA}` },
    });
    assert(res.ok, `Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    const foreignClients = (data.clients || []).filter((c: any) => c.id !== 'client_goldfields');
    assert(foreignClients.length === 0, 'Client A saw clients belonging to other organizations');
  });

  await test('Cross-Tenant', 'Client A cannot view Client B results document by ID (403 Forbidden)', async () => {
    // Create a results document specifically for Vodacom (Client B)
    const docVodacom = await saveResultsDocument({
      clientId: 'client_vodacom_group',
      status: 'published',
      document: {
        issuer: 'Vodacom Group Limited',
        title: 'Preliminary Financial Statements',
        periodLabel: `FY2026 Test ${Date.now()}`,
        unit: 'ZAR million',
        narrative: [],
        highlights: [],
        statements: [],
        notes: [],
        warnings: [],
        sourceFilename: 'vodacom_fy26_test.pdf',
        pageCount: 1,
      },
    });

    // Client A attempts to fetch Client B's document directly by ID
    const res = await fetch(`${BASE_URL}/api/admin/results/${docVodacom.id}`, {
      headers: { Cookie: `gf_studio_session=${cookieA}` },
    });

    assert(res.status === 403, `Expected HTTP 403 Forbidden for cross-tenant document, got ${res.status}`);

    // Client B fetches their own document -> should succeed with HTTP 200
    const resOwner = await fetch(`${BASE_URL}/api/admin/results/${docVodacom.id}`, {
      headers: { Cookie: `gf_studio_session=${cookieB}` },
    });
    assert(resOwner.status === 200, `Owner should have access with HTTP 200, got ${resOwner.status}`);

    // Cleanup
    await db.execute({ sql: `DELETE FROM results_documents WHERE id = ?`, args: [docVodacom.id] });
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: AUTOMATED CRON SCHEDULED RELEASE EXECUTION
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 2: Automated Scheduled Release Execution via Cron Worker');

  await test('Cron Worker', 'Cron endpoint executes scheduled release with CRON_SECRET and transitions to published', async () => {
    const releaseId = `rel_test_${Date.now()}`;
    const releaseTime = new Date(Date.now() - 60 * 1000).toISOString(); // 1 minute in the past

    // Insert scheduled release ready for rollout
    await db.execute({
      sql: `INSERT INTO content_releases (id, client_id, site_id, name, scheduled_at, status, description, created_at, updated_at)
            VALUES (?, 'client_vodacom_group', 'site_vodacom_group', 'Automated Telecom IR Rollout', ?, 'scheduled', 'Scheduled test rollout', ?, ?)`,
      args: [releaseId, releaseTime, now, now],
    });

    // Trigger cron worker
    const cronRes = await fetch(`${BASE_URL}/api/cron/releases`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });

    assert(cronRes.ok, `Cron worker failed with HTTP ${cronRes.status}`);
    const cronData = await cronRes.json();
    assert(cronData.success === true, 'Cron response indicated failure');

    // Verify release status in database transitioned to 'published'
    const checkRes = await db.execute({
      sql: `SELECT status, published_at FROM content_releases WHERE id = ?`,
      args: [releaseId],
    });

    assert(checkRes.rows.length > 0, 'Release record not found');
    assert(checkRes.rows[0].status === 'published', `Expected status 'published', found '${checkRes.rows[0].status}'`);

    // Cleanup
    await db.execute({ sql: `DELETE FROM content_releases WHERE id = ?`, args: [releaseId] });
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: IP SLIDING-WINDOW RATE LIMITING
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 3: Edge IP Sliding-Window Rate Limiting');

  await test('Rate Limiting', 'Consecutive rapid login attempts from single IP return HTTP 429 Too Many Requests', async () => {
    const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    let rateLimited = false;
    let retryAfterHeader = '';

    // Fire 12 rapid requests from same test IP
    for (let i = 0; i < 12; i++) {
      const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({ email: 'nonexistent@probe.test', password: 'AnyPassword123!' }),
      });

      if (res.status === 429) {
        rateLimited = true;
        retryAfterHeader = res.headers.get('retry-after') || '';
        break;
      }
    }

    assert(rateLimited === true, 'Failed to trigger HTTP 429 Too Many Requests on rapid attempts');
    assert(Number(retryAfterHeader) > 0, 'Retry-After header was missing or invalid');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: ENTERPRISE HTTP SECURITY HEADERS
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 4: Enterprise Defense-in-Depth HTTP Security Headers');

  await test('Security Headers', 'Middleware injects HSTS, nosniff, SAMEORIGIN, and Permissions-Policy headers', async () => {
    const res = await fetch(`${BASE_URL}/admin/login`);
    const hsts = res.headers.get('strict-transport-security');
    const nosniff = res.headers.get('x-content-type-options');
    const xframe = res.headers.get('x-frame-options');
    const referrer = res.headers.get('referrer-policy');
    const permissions = res.headers.get('permissions-policy');

    assert(!!hsts && hsts.includes('max-age'), 'Missing Strict-Transport-Security header');
    assert(nosniff === 'nosniff', `Expected X-Content-Type-Options: nosniff, got ${nosniff}`);
    assert(xframe === 'SAMEORIGIN', `Expected X-Frame-Options: SAMEORIGIN, got ${xframe}`);
    assert(referrer === 'strict-origin-when-cross-origin', `Expected Referrer-Policy: strict-origin-when-cross-origin, got ${referrer}`);
    assert(!!permissions, 'Missing Permissions-Policy header');
  });

  // ─────────────────────────────────────────────────────────────
  // CLEANUP & SUMMARY
  // ─────────────────────────────────────────────────────────────
  await db.execute({ sql: `DELETE FROM users WHERE email IN (?, ?)`, args: [emailA, emailB] });

  console.log('\n============================================================');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal E2E runner error:', err);
  process.exit(1);
});
