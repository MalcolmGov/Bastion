import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function capture() {
  console.log('Launching browser to capture Phase 3 screens...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', 'GoldFields2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Logged in successfully.');

  // Set dark mode in localStorage
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });

  // -------------------------------------------------------------------------
  // Screen 1: Blueprints Two-Way Git Schema Sync Card
  // -------------------------------------------------------------------------
  console.log('Capturing /admin/blueprints with Git Schema Sync Card...');
  await page.goto(`${BASE_URL}/admin/blueprints`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1500));

  const blueprintsPath = path.join(ARTIFACT_DIR, 'phase3_blueprints_git_sync.png');
  await page.screenshot({ path: blueprintsPath, fullPage: false });
  console.log(`Saved: ${blueprintsPath}`);

  // -------------------------------------------------------------------------
  // Screen 2: Blueprints Schema Code Inspector Modal
  // -------------------------------------------------------------------------
  console.log('Opening Schema Code Inspector modal in /admin/blueprints...');
  const inspectBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent?.includes('Inspect Schema Code'));
  });

  if (inspectBtn) {
    await (inspectBtn as any).click();
    await new Promise(r => setTimeout(r, 1000));

    const modalPath = path.join(ARTIFACT_DIR, 'phase3_schema_inspector_modal.png');
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log(`Saved: ${modalPath}`);

    // Close modal
    const closeBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent?.trim() === 'Close');
    });
    if (closeBtn) await (closeBtn as any).click();
    await new Promise(r => setTimeout(r, 500));
  }

  // -------------------------------------------------------------------------
  // Screen 3: Sandbox GraphQL Explorer & Relations Playground
  // -------------------------------------------------------------------------
  console.log('Capturing /admin/sandbox with GraphQL Explorer...');
  await page.goto(`${BASE_URL}/admin/sandbox`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click on GraphQL Explorer tab
  const gqlTabBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent?.includes('GraphQL Explorer'));
  });

  if (gqlTabBtn) {
    await (gqlTabBtn as any).click();
    await new Promise(r => setTimeout(r, 1500));

    // Execute GraphQL query
    const runBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent?.includes('Execute GraphQL Query'));
    });
    if (runBtn) {
      await (runBtn as any).click();
      await new Promise(r => setTimeout(r, 1500));
    }

    const sandboxPath = path.join(ARTIFACT_DIR, 'phase3_graphql_explorer.png');
    await page.screenshot({ path: sandboxPath, fullPage: false });
    console.log(`Saved: ${sandboxPath}`);
  }

  // -------------------------------------------------------------------------
  // Screen 4: Visual Editor with Click-to-Edit & Floating Action Toolbar
  // -------------------------------------------------------------------------
  console.log('Capturing /admin/editor with Click-to-Edit and Action Toolbar...');
  await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click on an element inside the preview canvas iframe or main container
  await page.evaluate(() => {
    const heading = document.querySelector('h1, h2, [data-cms-field="title"]');
    if (heading) {
      (heading as HTMLElement).click();
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const editorPath = path.join(ARTIFACT_DIR, 'phase3_editor_click_to_edit.png');
  await page.screenshot({ path: editorPath, fullPage: false });
  console.log(`Saved: ${editorPath}`);

  await browser.close();
  console.log('All Phase 3 screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
