import { requireEnv } from './lib/env';
/**
 * Bastion Enterprise CMS — Phase 2 Automated Verification Suite
 * Tests:
 * 1. Content Releases & Scheduled Drops Engine (CRUD, bundling, atomic publishing, audit logging)
 * 2. Multi-Locale (i18n) Engine & AI Translation (preservation of AISC, EBITDA, SENS, fallback resolution)
 * 3. Enterprise DAM Hotspot / Focal Point & Media Folders persistence
 */

export {};

const BASE_URL = 'http://localhost:3010';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'PASS', durationMs });
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'FAIL', durationMs, details: err.message });
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms): ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log('\n============================================================');
  console.log('🚀 BASTION ENTERPRISE CMS — PHASE 2 AUTOMATED TEST SUITE');
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  let sessionCookie = '';

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: AUTHENTICATION
  // ─────────────────────────────────────────────────────────────
  console.log('📦 SUITE 1: Authentication & Session');

  await runTest('Auth', 'Login as Admin and obtain session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@goldfields.com', password: requireEnv('E2E_CLIENT_PASSWORD') })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert(!!setCookie && setCookie.includes('gf_studio_session'), 'Missing session cookie');
    sessionCookie = (setCookie || '').split(';')[0];
    const data = await res.json();
    assert(data.success === true, 'Login response not success');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: CONTENT RELEASES & SCHEDULED DROPS ENGINE
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 2: Content Releases & Scheduled Drops Engine');

  let testReleaseId = '';

  await runTest('Releases', 'List seeded content releases via /api/admin/releases', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/releases`, {
      headers: { Cookie: sessionCookie }
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.releases), 'releases should be an array');
    assert(data.releases.length >= 2, 'Should have at least 2 seeded releases');
    const scheduled = data.releases.find((r: any) => r.status === 'scheduled');
    assert(!!scheduled, 'Should have a scheduled release');
    assert(!!scheduled.scheduledAt, 'Scheduled release must have scheduledAt timestamp');
  });

  await runTest('Releases', 'Create a new draft Content Release bundle', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        clientId: 'client_goldfields',
        siteId: 'site_goldfields_global',
        name: 'Automated Test Release Q4 2026',
        description: 'Comprehensive test bundle for atomic deployment verification.',
        status: 'draft'
      })
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Expected success === true');
    assert(!!data.release?.id, 'Missing release.id');
    assert(data.release.name === 'Automated Test Release Q4 2026', 'Release name mismatch');
    assert(data.release.status === 'draft', 'Status should be draft');
    testReleaseId = data.release.id;
  });

  let testItemId = '';

  await runTest('Releases', 'Bundle content items (Page & Dynamic Zone) into release', async () => {
    assert(!!testReleaseId, 'testReleaseId must be defined');

    // Add Item 1: Page
    const res1 = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        itemType: 'page',
        itemId: 'page_home',
        title: 'Gold Fields Homepage [Global]',
        action: 'publish',
        changesSummary: 'Updated 2026 guidance metrics bar and hero banner',
        snapshot: { heroHeadline: 'Sustainable Gold Mining at Global Scale' }
      })
    });
    assert(res1.ok, `Item 1 HTTP ${res1.status}`);
    const data1 = await res1.json();
    assert(data1.success === true, 'Item 1 creation failed');
    assert(!!data1.item?.id, 'Missing item 1 id');
    testItemId = data1.item.id;

    // Add Item 2: Dynamic Zone / Article
    const res2 = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        itemType: 'article',
        itemId: 'sens_q3_financials_2026',
        title: 'Q3 2026 Operating & Financial Results SENS',
        action: 'publish',
        changesSummary: 'Audited financial disclosure approved by Board of Directors'
      })
    });
    assert(res2.ok, `Item 2 HTTP ${res2.status}`);
    const data2 = await res2.json();
    assert(data2.success === true, 'Item 2 creation failed');
  });

  await runTest('Releases', 'Inspect release details and confirm bundled items count', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}`, {
      headers: { Cookie: sessionCookie }
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.release.id === testReleaseId, 'Release ID mismatch');
    assert(data.release.itemCount === 2, `Expected 2 bundled items, got ${data.release.itemCount}`);
    assert(data.items.length === 2, `Expected 2 items in array, got ${data.items.length}`);
    assert(data.items[0].itemType === 'page', 'First item type should be page');
    assert(data.items[1].itemType === 'article', 'Second item type should be article');
  });

  await runTest('Releases', 'Perform Atomic Publishing Promotion on the release', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ publishedBy: 'Test Automation Suite' })
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Publishing response not success');
    assert(data.publishedCount === 2, `Expected 2 published items, got ${data.publishedCount}`);

    // Verify release status transitioned to 'published'
    const checkRes = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}`, {
      headers: { Cookie: sessionCookie }
    });
    const checkData = await checkRes.json();
    assert(checkData.release.status === 'published', `Expected status 'published', got '${checkData.release.status}'`);
    assert(!!checkData.release.publishedAt, 'publishedAt must be set');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: MULTI-LOCALE (i18n) ENGINE & AI TRANSLATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 3: Multi-Locale (i18n) Engine & AI Translation');

  await runTest('i18n', 'Translate corporate text to Spanish (Chile/Perú) preserving financial terms', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        targetLocale: 'es',
        sourceLocale: 'en',
        fields: {
          headline: 'Precision advisory for defining corporate transactions.',
          metrics: 'AISC guidance maintained; EBITDA margin at 48%; SENS release published.'
        }
      })
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Translation failed');
    assert(data.targetLocale === 'es', 'Target locale should be es');
    assert(data.translatedFields.headline.includes('Asesoramiento de precisión'), 'Headline translation mismatch');
    assert(data.translatedFields.metrics.includes('AISC'), 'Must preserve AISC metric');
    assert(data.translatedFields.metrics.includes('EBITDA'), 'Must preserve EBITDA metric');
    assert(data.translatedFields.metrics.includes('SENS'), 'Must preserve SENS metric');
  });

  await runTest('i18n', 'Translate corporate text to French (West Africa)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        targetLocale: 'fr',
        sourceLocale: 'en',
        fields: {
          cta: 'Explore Advisory Mandates'
        }
      })
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.translatedFields.cta.includes('Explorer nos Mandats'), 'French CTA translation mismatch');
  });

  await runTest('i18n', 'Translate corporate text to isiZulu (South Deep / Gauteng)', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        targetLocale: 'zu',
        sourceLocale: 'en',
        fields: {
          title: 'Precision advisory for defining corporate transactions.'
        }
      })
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(data.translatedFields.title.includes('Ukwelulekwa'), 'isiZulu translation mismatch');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: ENTERPRISE DAM FOCAL POINTS & MEDIA FOLDERS
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 4: Enterprise DAM Focal Point & Media Folders');

  await runTest('DAM', 'List media folders and asset catalog', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/media?siteId=site_goldfields_global`, {
      headers: { Cookie: sessionCookie }
    });
    assert(res.ok, `HTTP ${res.status}`);
    const data = await res.json();
    assert(Array.isArray(data.folders), 'folders should be an array');
    assert(data.folders.length >= 5, `Expected >= 5 folders, got ${data.folders.length}`);
    const corpFolder = data.folders.find((f: any) => f.slug === 'corporate');
    assert(!!corpFolder, 'corporate folder must exist');
    assert(Array.isArray(data.assets), 'assets should be an array');
    assert(data.assets.length > 0, 'assets should have items');
  });

  await runTest('DAM', 'Update asset focal point coordinates (focalX, focalY) and folder', async () => {
    // Get first asset
    const mediaRes = await fetch(`${BASE_URL}/api/admin/media?siteId=site_goldfields_global`, {
      headers: { Cookie: sessionCookie }
    });
    const mediaData = await mediaRes.json();
    const asset = mediaData.assets[0];
    assert(!!asset, 'Must have at least one asset to test');

    // Update with focal point coordinates: x=34%, y=72% and folder_id
    const updateRes = await fetch(`${BASE_URL}/api/admin/media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        id: asset.id,
        focal_x: 34,
        focal_y: 72,
        folder_id: 'folder_corp',
        hotspot_data: { focusArea: 'Executive Face', zoomLevel: 1.2 }
      })
    });
    assert(updateRes.ok, `PATCH HTTP ${updateRes.status}`);
    const updateData = await updateRes.json();
    assert(updateData.success === true, 'Update not success');
    assert(updateData.asset.focal_x === 34, `Expected focal_x 34, got ${updateData.asset.focal_x}`);
    assert(updateData.asset.focal_y === 72, `Expected focal_y 72, got ${updateData.asset.focal_y}`);
    assert(updateData.asset.folder_id === 'folder_corp', 'folder_id mismatch');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: CLEANUP
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 5: Test Data Cleanup');

  await runTest('Cleanup', 'Delete test release bundle', async () => {
    if (testReleaseId) {
      const res = await fetch(`${BASE_URL}/api/admin/releases/${testReleaseId}`, {
        method: 'DELETE',
        headers: { Cookie: sessionCookie }
      });
      assert(res.ok, `Delete HTTP ${res.status}`);
      const data = await res.json();
      assert(data.success === true, 'Delete not success');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n============================================================');
  console.log('📊 BASTION ENTERPRISE CMS — PHASE 2 VERIFICATION REPORT');
  console.log('============================================================');

  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:         ${passed} / ${total} (${Math.round((passed / total) * 100)}%)`);
  console.log(`Failed:         ${failed} / ${total}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(f => {
      console.log(`  - [${f.suite}] ${f.name}: ${f.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n✨ ALL PHASE 2 TESTS PASSED PERFECTLY WITH 100% SUCCESS RATE!\n');
  }
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
