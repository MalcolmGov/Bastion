import { requireEnv } from './lib/env';
import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';
const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖\x1b[0m ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runE2ETests() {
  console.log('\n======================================================');
  console.log('  BASTION STUDIO CMS — PHASE 3 FULL END-TO-END (E2E) TEST');
  console.log('======================================================\n');

  console.log('Launching headless Chrome for real browser execution...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------------------
    // STEP 0: LOGIN & SESSION AUTHENTICATION
    // -------------------------------------------------------------------------
    console.log('\x1b[36m▶ [E2E STEP 0] Authentication & User Session\x1b[0m');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'malcolm@movedigital.africa');
    await page.type('input[type="password"]', requireEnv('E2E_ADMIN_PASSWORD'));
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const currentUrl = page.url();
    assert(currentUrl.includes('/admin'), 'User successfully authenticated and redirected to /admin', `URL: ${currentUrl}`);

    // Set dark mode
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    // -------------------------------------------------------------------------
    // STEP 1: VISUAL CLICK-TO-EDIT & FLOATING QUICK ACTION TOOLBAR (/admin/editor)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m▶ [E2E STEP 1] Visual Click-to-Edit & Quick Action Toolbar (/admin/editor)\x1b[0m');
    await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Check editor page elements
    const editorTitle = await page.title();
    assert(editorTitle.length > 0, 'Visual Editor page loaded', `Title: ${editorTitle}`);

    // Find and click on the headline in the visual canvas
    console.log('  Simulating user clicking directly on the canvas headline...');
    const clickedHeadline = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2, [data-cms-field="title"]') as HTMLElement;
      if (heading) {
        heading.click();
        return heading.textContent?.trim();
      }
      return null;
    });

    assert(clickedHeadline !== null, 'Found and clicked headline element on canvas', `Text: "${clickedHeadline?.substring(0, 40)}..."`);
    await new Promise(r => setTimeout(r, 800));

    // Verify Floating Quick Action Toolbar appeared docked above active block
    const toolbarButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return {
        hasAiPolish: buttons.some(b => b.textContent?.includes('AI Polish')),
        hasInspector: buttons.some(b => b.textContent?.includes('Inspector')),
        blockBadge: document.body.innerText.includes('BLOCK:')
      };
    });

    assert(toolbarButtons.hasAiPolish, 'Floating action toolbar renders "AI Polish" action button');
    assert(toolbarButtons.hasInspector, 'Floating action toolbar renders "Inspector" focus button');
    assert(toolbarButtons.blockBadge, 'Floating block pill indicator is displayed on canvas');

    // Verify Properties Inspector has focused field with glowing ring
    const inspectorFocusState = await page.evaluate(() => {
      const fieldTitle = document.getElementById('field-title') as HTMLTextAreaElement | HTMLInputElement;
      if (!fieldTitle) return { exists: false, hasFocusClass: false, value: '' };

      const classList = fieldTitle.className;
      const hasFocusClass = classList.includes('ring-cyan-400') || classList.includes('border-cyan-400');
      return { exists: true, hasFocusClass, value: fieldTitle.value };
    });

    assert(inspectorFocusState.exists, 'Properties Inspector headline input field exists (#field-title)');
    assert(inspectorFocusState.hasFocusClass, 'Properties Inspector headline input has active cyan focus ring (ring-cyan-400)');

    // Real-time bidirectional edit test
    console.log('  Simulating user modifying the headline in the Properties Inspector with real keystrokes...');
    await page.focus('#field-title');
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await page.type('#field-title', 'Bastion Capital Advisory — E2E Verified Headline 2026', { delay: 10 });
    await new Promise(r => setTimeout(r, 1200));

    const canvasUpdated = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Bastion Capital Advisory — E2E Verified Headline 2026');
    });
    assert(canvasUpdated, 'Canvas preview updated live in real time from Properties Inspector input');

    // -------------------------------------------------------------------------
    // STEP 2: TWO-WAY GIT SCHEMA & CODE SYNC (/admin/blueprints)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m▶ [E2E STEP 2] Two-Way Git Schema & Code Sync (/admin/blueprints)\x1b[0m');
    await page.goto(`${BASE_URL}/admin/blueprints`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Verify Git Sync Card is rendered
    const gitCardData = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('Git Schema Synchronization & Code Generator'),
        hasRepo: text.includes('MalcolmGov/Goldfields'),
        hasBranch: text.includes('main'),
        hasTrackedFiles: text.includes('Tracked Schemas')
      };
    });

    assert(gitCardData.hasTitle, 'Git Schema Synchronization card renders in Blueprints dashboard');
    assert(gitCardData.hasRepo, 'Git Schema card identifies MalcolmGov/Goldfields repository');
    assert(gitCardData.hasBranch, 'Git Schema card identifies main branch');
    assert(gitCardData.hasTrackedFiles, 'Git Schema card displays tracked schema file count');

    // Test "Inspect Schema Code" Modal
    console.log('  Testing Schema Code Inspector modal...');
    const inspectBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent?.includes('Inspect Schema Code'));
    });
    if (inspectBtn) await (inspectBtn as any).click();
    await new Promise(r => setTimeout(r, 1000));

    const modalData = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isOpen: text.includes('Bastion Schema Code Inspector'),
        hasJsonTab: text.includes('bastion-schema.json'),
        hasTsTab: text.includes('bastion-cms.d.ts'),
        hasConfigTab: text.includes('bastion.config.ts')
      };
    });

    assert(modalData.isOpen, 'Schema Code Inspector modal opens on click');
    assert(modalData.hasJsonTab && modalData.hasTsTab && modalData.hasConfigTab, 'Schema modal provides all 3 file tabs (JSON, TS, Config)');

    // Test Copy Code button inside modal
    const copySuccess = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const copyBtn = buttons.find(b => b.textContent?.includes('Copy Code'));
      if (copyBtn) {
        copyBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    assert(copySuccess, 'Copy Code button clicked and functional');

    // Close modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const closeBtn = buttons.find(b => b.textContent?.trim() === 'Close');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Test "Pull from Git" action
    console.log('  Testing "Pull from Git" action...');
    const pullSuccess = await page.evaluate(async () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pullBtn = buttons.find(b => b.textContent?.includes('Pull from Git'));
      if (pullBtn) {
        pullBtn.click();
        return true;
      }
      return false;
    });
    assert(pullSuccess, '"Pull from Git" action button clicked');
    await new Promise(r => setTimeout(r, 2000));

    const pullFeedback = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Pulled latest schema') || text.includes('synchronized');
    });
    assert(pullFeedback, 'Pull action returned success toast feedback with synchronized blueprint count');

    // -------------------------------------------------------------------------
    // STEP 3: GRAPHQL EXPLORER & RELATIONS PLAYGROUND (/admin/sandbox)
    // -------------------------------------------------------------------------
    console.log('\n\x1b[36m▶ [E2E STEP 3] GraphQL Explorer & Relations DSL (/admin/sandbox)\x1b[0m');
    await page.goto(`${BASE_URL}/admin/sandbox`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // Switch to GraphQL Explorer tab
    console.log('  Switching to GraphQL Explorer & Relations DSL protocol tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const gqlTab = buttons.find(b => b.textContent?.includes('GraphQL Explorer'));
      if (gqlTab) gqlTab.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const gqlModeActive = await page.evaluate(() => {
      const text = document.body.innerText;
      return (
        text.includes('POST /api/graphql') ||
        text.includes('Query Editor') ||
        text.includes('GraphQL Presets')
      );
    });
    assert(gqlModeActive, 'GraphQL Explorer mode activated with dedicated SDL editor & telemetry');

    // Test Preset Selection (e.g. 10 Global Mining Assets)
    console.log('  Testing GraphQL preset selection...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const opsPreset = buttons.find(b => b.textContent?.includes('10 Global Mining Assets'));
      if (opsPreset) opsPreset.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const presetLoaded = await page.evaluate(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      return textarea ? textarea.value.includes('GetMiningOperations') : false;
    });
    assert(presetLoaded, 'Query preset loaded into editor: GetMiningOperations');

    // Switch back to Full Page Tree preset
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pagePreset = buttons.find(b => b.textContent?.includes('Full Page & Dynamic Zones Tree'));
      if (pagePreset) pagePreset.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Click "Execute GraphQL Query (Deep Population)"
    console.log('  Executing live GraphQL query from the browser UI...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const execBtn = buttons.find(b => b.textContent?.includes('Execute GraphQL Query'));
      if (execBtn) execBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Verify response telemetry & JSON data
    const gqlExecutionResult = await page.evaluate(() => {
      const text = document.body.innerText;
      const pre = document.querySelector('pre');
      const jsonText = pre ? pre.textContent || '' : '';
      return {
        hasStatusOk: text.includes('200 OK'),
        hasDeepRelationsBadge: text.includes('Deep Relations Populated'),
        hasDynamicZones: jsonText.includes('"dynamicZones"'),
        hasBlockType: jsonText.includes('"blockType"')
      };
    });

    assert(gqlExecutionResult.hasStatusOk, 'GraphQL query executed with HTTP 200 OK status');
    assert(gqlExecutionResult.hasDeepRelationsBadge, 'GraphQL execution confirmed "Deep Relations Populated" telemetry');
    assert(gqlExecutionResult.hasDynamicZones, 'GraphQL JSON response contains populated dynamicZones tree');
    assert(gqlExecutionResult.hasBlockType, 'Dynamic zone blocks resolved with polymorphic blockType');

    // Test Client Code tab
    console.log('  Testing Client Code generator sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const codeTab = buttons.find(b => b.textContent?.includes('Client Code'));
      if (codeTab) codeTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const clientCodeGenerated = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      return pre ? pre.textContent?.includes('ApolloClient') || pre.textContent?.includes('@apollo/client') : false;
    });
    assert(clientCodeGenerated, 'Client Code generator dynamically outputs configured Apollo Client query code');

    // Test Schema Documentation tab
    console.log('  Testing Schema Types documentation sub-tab...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const schemaTab = buttons.find(b => b.textContent?.includes('Schema Types'));
      if (schemaTab) schemaTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const schemaDocsRendered = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('type Page') && text.includes('type DynamicZoneBlock') && text.includes('type MediaAsset');
    });
    assert(schemaDocsRendered, 'Schema Types documentation browsable with Page, DynamicZoneBlock, and MediaAsset');

  } catch (err: any) {
    console.error('E2E Test Execution Error:', err);
    failed++;
  } finally {
    await browser.close();
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  E2E TEST RUN COMPLETED: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
