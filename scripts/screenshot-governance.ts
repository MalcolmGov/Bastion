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

  console.log('3. Navigating to /admin/governance...');
  await page.goto('http://localhost:3010/admin/governance', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // Screenshot 1: Governance Scorecard Overview
  const p1 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_governance_scorecard_overview.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Saved:', p1);

  // Click on "Boardroom Audit Report" button to open executive report modal
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text && text.includes('Boardroom Audit Report')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 1200));
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        const scrollContainers = document.querySelectorAll('div');
        scrollContainers.forEach((el) => {
          if (el.scrollHeight > el.clientHeight) el.scrollTop = 0;
        });
      });
      await new Promise((r) => setTimeout(r, 600));
      break;
    }
  }

  // Screenshot 2: Boardroom Executive Audit Report Modal
  const p2 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_governance_boardroom_report_modal.png';
  await page.screenshot({ path: p2, fullPage: false });
  console.log('Saved:', p2);

  await browser.close();
  console.log('Screenshots complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
