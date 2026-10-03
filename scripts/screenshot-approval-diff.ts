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

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa');
  await page.type('input[type="password"]', requireEnv('E2E_ADMIN_PASSWORD'));
  await page.click('button[type="submit"]');

  console.log('2. Waiting for login completion...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('3. Navigating to /admin/tasks...');
  await page.goto('http://localhost:3010/admin/tasks', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Overview
  const p1 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_approval_matrix_overview.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Saved:', p1);

  // Click on "Inspect Visual Diff" on the second task card (Financial Results)
  console.log('4. Opening Visual Diff for Financial Results...');
  const diffButtons = await page.$$('button');
  const inspectBtns: any[] = [];
  for (const btn of diffButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Inspect Visual Diff')) {
      inspectBtns.push(btn);
    }
  }

  if (inspectBtns.length >= 2) {
    await inspectBtns[1].click();
    await new Promise((r) => setTimeout(r, 2000));

    // Screenshot 2: Split View for Financial Results
    const p2 =
      '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_approval_visual_diff_financial_split.png';
    await page.screenshot({ path: p2, fullPage: false });
    console.log('Saved:', p2);

    // Switch to Unified Diff
    const modalButtons = await page.$$('button');
    for (const b of modalButtons) {
      const t = await page.evaluate((el) => el.textContent, b);
      if (t && t.includes('Unified Diff')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 1000));
        break;
      }
    }

    // Screenshot 3: Unified Diff View
    const p3 =
      '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_approval_visual_diff_unified.png';
    await page.screenshot({ path: p3, fullPage: false });
    console.log('Saved:', p3);
  }

  await browser.close();
  console.log('All screenshots completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
