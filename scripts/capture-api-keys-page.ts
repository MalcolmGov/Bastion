import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function capture() {
  console.log('Launching browser to capture AI API Keys page and sidebar...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1250 });

  // 1. Login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', 'GoldFields2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Set dark theme & uncollapsed sidebar & agency mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('bastion_sidebar_collapsed', 'false');
    localStorage.setItem('move_studio_portal_mode', 'agency');
  });

  // 2. Navigate to /admin/api-keys
  console.log('Navigating to /admin/api-keys...');
  await page.goto(`${BASE_URL}/admin/api-keys`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Capture full page
  const fullPagePath = path.join(ARTIFACT_DIR, 'admin_api_keys_page.png');
  await page.screenshot({ path: fullPagePath, fullPage: false });
  console.log(`Saved: ${fullPagePath}`);

  // Capture sidebar showing AI API Keys active
  const sidebarElement = await page.$('aside');
  if (sidebarElement) {
    const sidebarPath = path.join(ARTIFACT_DIR, 'admin_api_keys_sidebar.png');
    await sidebarElement.screenshot({ path: sidebarPath });
    console.log(`Saved: ${sidebarPath}`);
  }

  // 3. Also navigate to /admin (Overview) to show the sidebar with AI API Keys item in default state
  console.log('Navigating to /admin overview to capture sidebar in overview state...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  if (sidebarElement) {
    const overviewSidebarPath = path.join(ARTIFACT_DIR, 'admin_sidebar_with_ai_keys.png');
    const aside = await page.$('aside');
    if (aside) {
      await aside.screenshot({ path: overviewSidebarPath });
      console.log(`Saved: ${overviewSidebarPath}`);
    }
  }

  await browser.close();
  console.log('Capture completed successfully.');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
