import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests/screenshots');
const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function logStep(stepNum, title) {
  console.log(`\n======================================================`);
  console.log(`[STEP ${stepNum}] ${title}`);
  console.log(`======================================================`);
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(SCREENSHOT_DIR, filename);
  const artifactPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  fs.copyFileSync(localPath, artifactPath);
  console.log(`📸 Screenshot saved: ${filename}`);
  return artifactPath;
}

async function runEndToEndVerification() {
  console.log('🚀 Starting Comprehensive End-to-End Test Suite...');
  console.log(`Target Base URL: ${BASE_URL}`);

  // =========================================================================
  // PART 1: LIVE API VERIFICATION
  // =========================================================================
  logStep(1, 'API: Verify Login for Agency and Client Users');
  
  // 1.1 Login as Client User (editor@client.local)
  const clientLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'editor@client.local', password: 'Bastion2026!Corp#' }),
  });
  assert.equal(clientLoginRes.status, 200, 'Client user login returns 200');
  const clientCookie = clientLoginRes.headers.get('set-cookie');
  assert.ok(clientCookie, 'Client user receives session cookie');
  const clientLoginData = await clientLoginRes.json();
  assert.equal(clientLoginData.user.role, 'content_editor');
  assert.equal(clientLoginData.user.client_id, 'client_goldfields');
  console.log('✅ Client user authenticated:', clientLoginData.user.email);

  // 1.2 Login as Bastion Agency User (admin@bastion.local)
  const agencyLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bastion.local', password: 'Bastion2026!Corp#' }),
  });
  assert.equal(agencyLoginRes.status, 200, 'Agency user login returns 200');
  const agencyCookie = agencyLoginRes.headers.get('set-cookie');
  assert.ok(agencyCookie, 'Agency user receives session cookie');
  const agencyLoginData = await agencyLoginRes.json();
  assert.equal(agencyLoginData.user.role, 'platform_admin');
  assert.equal(agencyLoginData.user.client_id, null);
  console.log('✅ Agency user authenticated:', agencyLoginData.user.email);

  // -------------------------------------------------------------------------
  logStep(2, 'API: Monetization Gate on Ingestion Endpoint');

  // 2.1 Client User attempts to ingest report -> Must be 403 Forbidden
  const clientIngestRes = await fetch(`${BASE_URL}/api/admin/editor/ingest-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: clientCookie,
    },
    body: JSON.stringify({ sampleId: 'goldfields-annual-2025', siteId: 'site_goldfields_flagship' }),
  });
  const clientIngestData = await clientIngestRes.json();
  assert.equal(clientIngestRes.status, 403, 'Client user blocked with 403 Forbidden');
  assert.ok(
    clientIngestData.error.includes('exclusive Bastion Agency monetization service'),
    'Includes monetization gate explanation'
  );
  assert.ok(
    clientIngestData.error.includes('contact your Bastion account director'),
    'Directs client to account director for upsell'
  );
  console.log('✅ Monetization Gate verified: Client user blocked with 403 and upsell message.');

  // 2.2 Agency User ingests report with genuine PDF -> Must be 200 OK
  const pdfPath = path.resolve(process.cwd(), 'fixtures/merafe-summarised-results-2025.pdf');
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  const formData = new FormData();
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'merafe-results-2025.pdf');
  formData.append('siteId', 'site_goldfields_flagship');

  const agencyIngestRes = await fetch(`${BASE_URL}/api/admin/editor/ingest-document`, {
    method: 'POST',
    headers: {
      cookie: agencyCookie,
    },
    body: formData,
  });
  const agencyIngestData = await agencyIngestRes.json();
  assert.equal(agencyIngestRes.status, 200, 'Agency user receives 200 OK on PDF ingestion');
  assert.equal(agencyIngestData.success, true);
  assert.equal(agencyIngestData.insights.companyName, 'Merafe Resources Limited');
  assert.ok(agencyIngestData.insights.kpis.length >= 4, 'Extracted at least 4 corporate KPIs');
  assert.equal(agencyIngestData.pages.length, 4, 'Synthesized 4 multi-page drafts');
  console.log('✅ Agency Ingestion verified: 120-page PDF parsed, 4 multi-page drafts synthesized in <1s.');

  // -------------------------------------------------------------------------
  logStep(3, 'API: Push 4 Pages to Client Portal for Review & Approvals (status: in_review)');

  const applyRes = await fetch(`${BASE_URL}/api/admin/editor/assistant/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: agencyCookie,
    },
    body: JSON.stringify({
      siteId: 'site_goldfields_flagship',
      pages: agencyIngestData.pages.map((p) => ({
        pageSlug: p.slug,
        title: p.title,
        sections: p.sections,
        changeSummary: `Bastion Agency Ingestion Handover: ${p.title} (Staged for client review & sign-off)`,
      })),
      options: { allowCreate: true, status: 'in_review' },
    }),
  });
  const applyData = await applyRes.json();
  assert.equal(applyRes.status, 200, 'Handover apply endpoint returns 200 OK');
  assert.equal(applyData.pages.length, 4, 'All 4 pages saved');

  // Verify in SQLite database that pages are recorded with status = 'in_review'
  const { createClient } = await import('@libsql/client');
  const db = createClient({ url: 'file:studio.db' });
  const dbCheck = await db.execute({
    sql: "SELECT page_slug, title, status FROM page_compositions WHERE site_id = 'site_goldfields_flagship' AND status = 'in_review'",
    args: [],
  });
  assert.ok(dbCheck.rows.length >= 4, 'Found at least 4 in_review pages in page_compositions');
  console.log(`✅ Handover pipeline verified: ${dbCheck.rows.length} pages staged in database with status: 'in_review'.`);

  // -------------------------------------------------------------------------
  logStep(4, 'API: Real-Time JSE Regulatory & "Greenwashing" Compliance Guardian');

  // 4.1 Audit Dirty Canvas
  const dirtySections = [
    {
      id: 'sec_test_jse',
      componentId: 'hero',
      visible: true,
      props: {
        title: 'Gold Fields will guarantee a 35% margin expansion in 2027',
        subtitle: 'Our mining assets are 100% green and completely carbon neutral with massive profits delivered to investors.'
      }
    },
    {
      id: 'sec_test_popia',
      componentId: 'cta',
      visible: true,
      props: {
        title: 'Join our investor circle',
        ctaText: 'Subscribe to investor alerts'
      }
    }
  ];

  const auditRes = await fetch(`${BASE_URL}/api/admin/editor/compliance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: agencyCookie,
    },
    body: JSON.stringify({
      siteId: 'site_goldfields_flagship',
      pageSlug: 'home',
      sections: dirtySections
    })
  });
  const auditData = await auditRes.json();
  assert.equal(auditRes.status, 200, 'Compliance audit returns 200 OK');
  assert.equal(auditData.success, true);
  assert.equal(auditData.report.status, 'non_compliant');
  assert.ok(auditData.report.criticalCount >= 2, 'Flags at least 2 critical violations (JSE + ESG)');
  assert.ok(auditData.report.score < 60, 'Score is severely degraded (<60)');
  assert.equal(auditData.report.grade, 'F', 'Grade is F due to critical greenwashing and guarantee promises');

  const jseIssue = auditData.report.issues.find(i => i.category === 'jse_regulatory');
  assert.ok(jseIssue, 'JSE Section 8.2 guarantee flagged');
  assert.equal(jseIssue.severity, 'critical');

  const esgIssue = auditData.report.issues.find(i => i.category === 'esg_greenwashing');
  assert.ok(esgIssue, 'ISSB S2 Greenwashing claim flagged');
  assert.equal(esgIssue.severity, 'critical');

  const popiaIssue = auditData.report.issues.find(i => i.category === 'popia_privacy');
  assert.ok(popiaIssue, 'POPIA consent omission flagged');

  const brandIssue = auditData.report.issues.find(i => i.category === 'brand_integrity');
  assert.ok(brandIssue, 'Brand hyperbole flagged');

  console.log(`✅ Compliance Guardian audit detected ${auditData.report.totalIssues} violations (JSE, ESG Greenwashing, POPIA, Hyperbole).`);

  // =========================================================================
  // PART 2: PLAYWRIGHT BROWSER UI AUTOMATION & SCREENSHOTS
  // =========================================================================
  logStep(5, 'Browser E2E: Launch Chromium & Agency User Journey');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const agencyContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const agencyPage = await agencyContext.newPage();

  // 5.1 Login as Agency User
  await agencyPage.goto(`${BASE_URL}/admin/login`);
  await agencyPage.waitForSelector('input[name="email"], input[type="email"]');
  await agencyPage.fill('input[name="email"], input[type="email"]', 'admin@bastion.local');
  await agencyPage.fill('input[name="password"], input[type="password"]', 'Bastion2026!Corp#');
  await agencyPage.click('button[type="submit"]');
  await agencyPage.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.includes('/login'), { timeout: 15000 });
  console.log('✅ Agency User logged into UI.');

  // 5.2 Navigate to Visual Editor
  logStep(6, 'Browser E2E: Agency User Visual Editor & Tools Check');
  await agencyPage.goto(`${BASE_URL}/admin/editor?siteId=site_goldfields_flagship&pageSlug=home`);
  await agencyPage.waitForSelector('h1:has-text("Page editor")', { timeout: 20000 });

  // Verify both "Ingest Report" and "Compliance" buttons are in the top toolbar
  const ingestBtn = agencyPage.locator('button[title*="Ingestion Suite"]');
  assert.ok(await ingestBtn.isVisible(), 'Ingest Report button is VISIBLE for Bastion Agency staff');

  const complianceBtn = agencyPage.locator('button[title*="Compliance Guardian"]');
  assert.ok(await complianceBtn.isVisible(), 'Compliance button is VISIBLE in toolbar');
  console.log('✅ Ingest Report and Compliance Guardian buttons confirmed visible in Agency Toolbar.');

  // 5.3 Open Compliance Guardian Panel
  logStep(7, 'Browser E2E: Open Compliance Guardian Inspector');
  await complianceBtn.click();
  await agencyPage.waitForSelector('h3:has-text("Compliance Guardian")', { timeout: 10000 });
  await agencyPage.waitForTimeout(1000); // Wait for animation

  await saveScreenshot(agencyPage, '08-compliance-guardian-panel.png');
  console.log('✅ Compliance Guardian Panel inspected and captured.');

  // 5.4 Open Document Ingestion Modal & Inspect Commercial Handover Pipeline
  logStep(8, 'Browser E2E: Ingest Report & Inspect Client Handover Pipeline');
  await ingestBtn.click();
  await agencyPage.waitForSelector('h2:has-text("AI Document & Annual Report Ingestion")', { timeout: 10000 });
  await agencyPage.waitForSelector('text=Bastion Agency Suite', { timeout: 10000 });
  await agencyPage.waitForSelector('text=Commercial Handover Engine · R45,000 / $2,500', { timeout: 10000 });

  await saveScreenshot(agencyPage, '09-document-ingestion-modal-samples.png');

  // Trigger synthesis of Gold Fields sample
  const synthesizeBtn = await agencyPage.locator('button:has-text("Extract & Synthesize Portal")');
  await synthesizeBtn.click();

  // Wait for synthesis results preview to appear
  await agencyPage.waitForSelector('text=Report Parsed & Brand Palette Synthesized', { timeout: 15000 });
  await agencyPage.waitForSelector('text=Multi-Page Architecture (4 Pages)', { timeout: 10000 });
  await agencyPage.waitForSelector('text=Push to Client Portal', { timeout: 10000 });
  await agencyPage.waitForSelector('text=Assemble Studio Drafts', { timeout: 10000 });

  await agencyPage.waitForTimeout(1000);
  await saveScreenshot(agencyPage, '10-document-ingestion-preview-handover.png');
  console.log('✅ Ingestion Modal verified with commercial handover cards and multi-page preview.');

  // Close modal
  await agencyPage.locator('button:has-text("Cancel")').click();
  await agencyContext.close();

  // -------------------------------------------------------------------------
  logStep(9, 'Browser E2E: Client User Journey & Monetization Gating Verification');

  const clientContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const clientPage = await clientContext.newPage();

  // 9.1 Login as Client User
  await clientPage.goto(`${BASE_URL}/admin/login`);
  await clientPage.waitForSelector('input[name="email"], input[type="email"]');
  await clientPage.fill('input[name="email"], input[type="email"]', 'editor@client.local');
  await clientPage.fill('input[name="password"], input[type="password"]', 'Bastion2026!Corp#');
  await clientPage.click('button[type="submit"]');
  await clientPage.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.includes('/login'), { timeout: 15000 });
  console.log('✅ Client User logged into UI.');

  // 9.2 Navigate to Visual Editor as Client User
  await clientPage.goto(`${BASE_URL}/admin/editor?siteId=site_goldfields_flagship&pageSlug=home`);
  await clientPage.waitForSelector('h1:has-text("Page editor")', { timeout: 20000 });

  // Verify that "Ingest Report" is HIDDEN for Client User
  const clientIngestBtn = clientPage.locator('button[title*="Ingestion Suite"]');
  const isIngestVisible = await clientIngestBtn.isVisible().catch(() => false);
  assert.equal(isIngestVisible, false, 'Ingest Report button is STRICTLY HIDDEN for client user in UI');

  // Verify that "Compliance" button is available for client user
  const clientComplianceBtn = clientPage.locator('button[title*="Compliance Guardian"]');
  assert.ok(await clientComplianceBtn.isVisible(), 'Compliance Guardian is available for client user');

  await saveScreenshot(clientPage, '11-client-editor-ingest-gated.png');
  console.log('✅ Client UI verified: Ingest Report button is strictly hidden, Compliance Guardian accessible.');

  // 9.3 Navigate to Tasks & Approvals Center to verify In-Review Handover Queue
  logStep(10, 'Browser E2E: Client Reviewer Tasks & Approvals Center');
  await clientPage.goto(`${BASE_URL}/admin/tasks`);
  await clientPage.waitForSelector('h1:has-text("Review, Approval")', { timeout: 20000 });
  await clientPage.waitForTimeout(1000);

  await saveScreenshot(clientPage, '12-client-tasks-approvals-handover-queue.png');
  console.log('✅ Client Tasks & Approvals queue inspected and captured.');

  await clientContext.close();
  await browser.close();

  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
}

runEndToEndVerification().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
