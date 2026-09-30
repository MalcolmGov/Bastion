import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function capture() {
  console.log('Launching browser to capture clean sidebar and dashboard...');
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

  // Set dark theme
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    // Ensure sidebar is expanded
    localStorage.setItem('bastion_sidebar_collapsed', 'false');
  });

  // 2. Go to /admin
  console.log('Capturing /admin overview without top intelligence strip and clean sidebar...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const overviewPath = path.join(ARTIFACT_DIR, 'admin_overview_decluttered.png');
  await page.screenshot({ path: overviewPath, fullPage: false });
  console.log(`Saved: ${overviewPath}`);

  // 3. Focus screenshot on the sidebar
  const sidebarElement = await page.$('aside');
  if (sidebarElement) {
    const sidebarPath = path.join(ARTIFACT_DIR, 'admin_sidebar_cleaned.png');
    await sidebarElement.screenshot({ path: sidebarPath });
    console.log(`Saved: ${sidebarPath}`);
  }

  await browser.close();
  console.log('Screenshots completed successfully.');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
