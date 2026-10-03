import puppeteer from 'puppeteer-core';
import { loginViaForm } from './lib/devLogin';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Logging in...');
  await loginViaForm(page, 'http://localhost:3010', 'agency');

  console.log('2. Navigating to /admin/sens...');
  await page.goto('http://localhost:3010/admin/sens', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('3. Clicking Financial Calendar tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tab = btns.find(b => b.textContent?.includes('Financial Calendar'));
    if (tab) tab.click();
  });

  await new Promise(r => setTimeout(r, 1500));

  const p = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/jse_financial_calendar_and_dwt_calculator.png';
  await page.screenshot({ path: p, fullPage: false });
  console.log('Saved clean calendar screenshot:', p);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
