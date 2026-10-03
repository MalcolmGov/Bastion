import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';
const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

async function capture() {
  console.log('Capturing updated modernized dashboard typography...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 2 });

  // Login first to set cookie and get clean session
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa', { delay: 10 });
  await page.type('input[type="password"]', 'Bastion2026!', { delay: 10 });
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // If still not on /admin, navigate there
  if (!page.url().includes('/admin')) {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
  }

  // Ensure Agency View is active (check for Switch to Agency View button)
  const switchedToAgency = await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'agency');
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Switch to Agency View'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Switched to agency view via button:', switchedToAgency);
  await new Promise(r => setTimeout(r, 2000));

  // Wait for Google fonts to finish loading
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await new Promise(r => setTimeout(r, 1000));

  const dashboardPath = path.join(ARTIFACT_DIR, 'bastion_modernized_dashboard_typography.png');
  await page.screenshot({ path: dashboardPath, fullPage: false });
  console.log(`Saved: ${dashboardPath}`);

  // Also capture zoomed in telemetry and fleet cards
  const fleetPath = path.join(ARTIFACT_DIR, 'bastion_modernized_telemetry_section.png');
  await page.screenshot({ path: fleetPath, clip: { x: 260, y: 0, width: 1340, height: 1000 } });
  console.log(`Saved: ${fleetPath}`);

  await browser.close();
  console.log('Capture completed successfully!');
}

capture().catch(e => {
  console.error(e);
  process.exit(1);
});
