import puppeteer from 'puppeteer-core';
import path from 'path';
import { loginViaApi } from './lib/devLogin';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Authenticating as Platform Administrator...');
  const loginRes = await loginViaApi('http://localhost:3010', 'agency');
  const setCookieHeader = loginRes.headers.get('set-cookie');
  console.log('Login response status:', loginRes.status);

  let sessionToken = '';
  if (setCookieHeader) {
    const match = setCookieHeader.match(/gf_studio_session=([^;]+)/);
    if (match) sessionToken = match[1];
  }

  if (sessionToken) {
    await page.setCookie({
      name: 'gf_studio_session',
      value: sessionToken,
      domain: 'localhost',
      path: '/'
    });
  }

  const artifactsDir = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

  // ─────────────────────────────────────────────────────────────
  // 1. MOOVE DIGITAL PAGES (ZERO GOLDFIELDS LEAKAGE)
  // ─────────────────────────────────────────────────────────────
  console.log('2. Setting active tenant to client_moove_digital...');
  await page.setCookie({
    name: 'bastion_active_client_id',
    value: 'client_moove_digital',
    domain: 'localhost',
    path: '/'
  });

  await page.goto('http://localhost:3010/admin/pages', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('move_studio_active_client', 'client_moove_digital');
    localStorage.setItem('bastion_active_client_id', 'client_moove_digital');
  });
  await page.goto('http://localhost:3010/admin/pages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // If select dropdown is present, verify selection or change to client_moove_digital
  await page.evaluate(() => {
    const select = document.querySelector('select') as HTMLSelectElement | null;
    if (select && select.value !== 'client_moove_digital') {
      select.value = 'client_moove_digital';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  const moovePagesShot = path.join(artifactsDir, 'moove_digital_isolated_pages.png');
  await page.screenshot({ path: moovePagesShot });
  console.log(`Saved screenshot: ${moovePagesShot}`);

  // ─────────────────────────────────────────────────────────────
  // 2. MOOVE DIGITAL RESULTS (ZERO CONVERSIONS / 0 GOLDFIELDS RESULTS)
  // ─────────────────────────────────────────────────────────────
  console.log('3. Loading /admin/results for Moove Digital...');
  await page.goto('http://localhost:3010/admin/results', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const mooveResultsShot = path.join(artifactsDir, 'moove_digital_isolated_results.png');
  await page.screenshot({ path: mooveResultsShot });
  console.log(`Saved screenshot: ${mooveResultsShot}`);

  // ─────────────────────────────────────────────────────────────
  // 3. GOLDFIELDS PAGES (GOLDFIELDS TENANT PRESERVED)
  // ─────────────────────────────────────────────────────────────
  console.log('4. Switching active tenant to client_goldfields...');
  await page.setCookie({
    name: 'bastion_active_client_id',
    value: 'client_goldfields',
    domain: 'localhost',
    path: '/'
  });
  await page.evaluate(() => {
    localStorage.setItem('move_studio_active_client', 'client_goldfields');
    localStorage.setItem('bastion_active_client_id', 'client_goldfields');
  });

  await page.goto('http://localhost:3010/admin/pages', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const select = document.querySelector('select') as HTMLSelectElement | null;
    if (select && select.value !== 'client_goldfields') {
      select.value = 'client_goldfields';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  const gfPagesShot = path.join(artifactsDir, 'goldfields_isolated_pages.png');
  await page.screenshot({ path: gfPagesShot });
  console.log(`Saved screenshot: ${gfPagesShot}`);

  // ─────────────────────────────────────────────────────────────
  // 4. GOLDFIELDS RESULTS (GOLDFIELDS H1 2026 DOCUMENT PRESERVED)
  // ─────────────────────────────────────────────────────────────
  console.log('5. Loading /admin/results for Gold Fields...');
  await page.goto('http://localhost:3010/admin/results', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const gfResultsShot = path.join(artifactsDir, 'goldfields_isolated_results.png');
  await page.screenshot({ path: gfResultsShot });
  console.log(`Saved screenshot: ${gfResultsShot}`);

  await browser.close();
  console.log('Verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error running screenshot script:', err);
  process.exit(1);
});
