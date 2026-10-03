import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';
const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

async function capture() {
  console.log('Capturing new production Bastion login screens...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture clean sign in page
  console.log('Navigating to /admin/login...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const cleanLoginPath = path.join(ARTIFACT_DIR, 'bastion_production_signin_clean.png');
  await page.screenshot({ path: cleanLoginPath, fullPage: false });
  console.log(`Saved: ${cleanLoginPath}`);

  // 2. Type credentials and toggle show password
  console.log('Typing admin credentials: malcolm@movedigital.africa...');
  await page.type('input[type="email"]', 'malcolm@movedigital.africa', { delay: 10 });
  await page.type('input[type="password"]', 'Bastion2026!', { delay: 10 });
  await new Promise(r => setTimeout(r, 600));

  const filledLoginPath = path.join(ARTIFACT_DIR, 'bastion_production_signin_filled.png');
  await page.screenshot({ path: filledLoginPath, fullPage: false });
  console.log(`Saved: ${filledLoginPath}`);

  // 3. Click submit and verify redirection to /admin
  console.log('Submitting login form...');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const postLoginUrl = page.url();
  console.log(`Current URL after login: ${postLoginUrl}`);

  const dashboardPath = path.join(ARTIFACT_DIR, 'bastion_dashboard_post_login.png');
  await page.screenshot({ path: dashboardPath, fullPage: false });
  console.log(`Saved: ${dashboardPath}`);

  await browser.close();
  console.log('Capture completed successfully!');
}

capture().catch(e => {
  console.error(e);
  process.exit(1);
});
