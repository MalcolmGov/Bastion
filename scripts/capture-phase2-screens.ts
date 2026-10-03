import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function capture() {
  console.log('Launching browser to capture Phase 2 screens...');
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

  // Set dark mode in localStorage if needed
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });

  // 2. Capture /admin/releases (Content Releases & Scheduled Drops Dashboard)
  console.log('Capturing /admin/releases...');
  await page.goto(`${BASE_URL}/admin/releases`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1200));

  // Click on the first release to open the inspector drawer
  const releaseCard = await page.$('.p-5.rounded-2xl.border.transition-all');
  if (releaseCard) {
    await releaseCard.click();
    await new Promise(r => setTimeout(r, 800));
  }

  const releasesPath = path.join(ARTIFACT_DIR, 'releases_dashboard.png');
  await page.screenshot({ path: releasesPath, fullPage: false });
  console.log(`Saved: ${releasesPath}`);

  // 3. Capture /admin/editor with Locale Switcher and AI Translation Bar
  console.log('Capturing /admin/editor (Phase 2 Multi-Locale & Toolbar)...');
  await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const editorPath = path.join(ARTIFACT_DIR, 'editor_phase2_locale_and_release.png');
  await page.screenshot({ path: editorPath, fullPage: false });
  console.log(`Saved: ${editorPath}`);

  // 4. Capture "Add to Release" Modal
  console.log('Capturing Add to Release Modal...');
  const addToReleaseBtn = await page.$('button[title*="Bundle page into"]');
  if (addToReleaseBtn) {
    await addToReleaseBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    const modalPath = path.join(ARTIFACT_DIR, 'editor_add_to_release_modal.png');
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log(`Saved: ${modalPath}`);
    // Close modal
    const closeBtn = await page.$('.fixed.inset-0 button.p-1');
    if (closeBtn) await closeBtn.click();
  }

  // 5. Capture /admin/media with Enterprise DAM Folders & Focal Point Picker
  console.log('Capturing /admin/media...');
  await page.goto(`${BASE_URL}/admin/media`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const mediaPath = path.join(ARTIFACT_DIR, 'media_dam_focal_point.png');
  await page.screenshot({ path: mediaPath, fullPage: false });
  console.log(`Saved: ${mediaPath}`);

  // Click on the second asset card (an image) to open the focal point modal
  const imageAsset = await page.$('.grid.grid-cols-2 > div:nth-child(2)');
  if (imageAsset) {
    console.log('Opening Focal Point Picker modal on image asset...');
    await imageAsset.click();
    await new Promise(r => setTimeout(r, 1200));

    const modalPath = path.join(ARTIFACT_DIR, 'media_dam_focal_point_modal.png');
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log(`Saved: ${modalPath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
