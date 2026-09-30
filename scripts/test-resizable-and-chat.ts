import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function test() {
  console.log('Launching browser to test resizable panels and enhanced AI chat...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1540,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1540, height: 960 });

  // 1. Login
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', 'GoldFields2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Set dark theme & collapse outer sidebar for maximum editor canvas & set wide panels
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('bastion_sidebar_collapsed', 'true');
    // Set wider width directly via saved preferences: Left: 340px, Right Inspector: 540px
    localStorage.setItem('bastion_editor_left_panel_width', '340');
    localStorage.setItem('bastion_editor_right_panel_width', '540');
  });

  // 2. Open /admin/editor
  console.log('Navigating to /admin/editor...');
  await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select AI Polish tab in inspector using explicit ID
  console.log('Switching to AI Polish tab...');
  await page.waitForSelector('#tab-btn-ai');
  await page.click('#tab-btn-ai');
  await new Promise(r => setTimeout(r, 1000));

  // Capture screenshot of expanded resizable panels
  const expandedPath = path.join(ARTIFACT_DIR, 'editor_expanded_resizable_panels.png');
  await page.screenshot({ path: expandedPath, fullPage: false });
  console.log(`Saved: ${expandedPath}`);

  // 3. Test clicking quick prompt ✨ Polish Copy
  console.log('Clicking ✨ Polish Copy quick action prompt...');
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const polishBtn = btns.find(b => b.textContent && b.textContent.includes('Polish Copy'));
    if (polishBtn) {
      (polishBtn as HTMLElement).click();
      return true;
    }
    return false;
  });
  console.log(`Clicked Polish Copy: ${clicked}`);

  // Wait for model synthesis
  console.log('Waiting for AI model response...');
  await new Promise(r => setTimeout(r, 5500));

  // Capture response with applied changes
  const appliedPath = path.join(ARTIFACT_DIR, 'editor_ai_chat_diff_applied.png');
  await page.screenshot({ path: appliedPath, fullPage: false });
  console.log(`Saved: ${appliedPath}`);

  // 4. Test Tab Switching Persistence: Switch to 'Content' tab and back to 'AI Polish'
  console.log('Testing tab switching persistence: switching to Content tab...');
  await page.click('#tab-btn-content');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Switching back to AI Polish tab...');
  await page.click('#tab-btn-ai');
  await new Promise(r => setTimeout(r, 1000));

  const persistentPath = path.join(ARTIFACT_DIR, 'editor_ai_chat_history_preserved.png');
  await page.screenshot({ path: persistentPath, fullPage: false });
  console.log(`Saved: ${persistentPath}`);

  await browser.close();
  console.log('All tests and captures completed successfully.');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
