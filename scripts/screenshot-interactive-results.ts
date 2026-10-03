import { requireEnv } from './lib/env';
import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Navigating to public results viewer: /results/gold-fields-interim-h1-2026 ...');
  await page.goto('http://localhost:3010/results/gold-fields-interim-h1-2026', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Public Results Overview & KPI Ribbon & SVG Charts
  const p1 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_interactive_results_overview.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('✓ Saved:', p1);

  // Scroll down to the Financial Statements Explorer
  console.log('2. Scrolling to Financial Statements Explorer...');
  await page.evaluate(() => {
    window.scrollTo({ top: 920, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 2: Financial Statements Explorer & Statutory DWT Footnote
  const p2 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_interactive_results_statements.png';
  await page.screenshot({ path: p2, fullPage: false });
  console.log('✓ Saved:', p2);

  // Login to Admin and navigate to /admin/results to capture the Admin Results Studio preview
  console.log('3. Logging in as admin...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa');
  await page.type('input[type="password"]', requireEnv('E2E_ADMIN_PASSWORD'));
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('4. Navigating to /admin/results ...');
  await page.goto('http://localhost:3010/admin/results', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // Click on the first recent conversion to open Step 4 (Code & publish preview)
  const itemButtons = await page.$$('ul li button');
  if (itemButtons.length > 0) {
    await itemButtons[0].click();
    await new Promise((r) => setTimeout(r, 2000));
  }

  const p3 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_admin_results_studio_preview.png';
  await page.screenshot({ path: p3, fullPage: false });
  console.log('✓ Saved:', p3);

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch((err) => {
  console.error('Screenshot script failed:', err);
  process.exit(1);
});
