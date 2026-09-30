import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function capture() {
  console.log('Launching browser to capture polished hero greeting card...');
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

  // 2. Set Agency Mode and Dark theme in localStorage
  await page.evaluate(() => {
    localStorage.setItem('bastion_theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    localStorage.setItem('move_studio_portal_mode', 'agency');
    localStorage.setItem('bastion_sidebar_collapsed', 'false');
  });

  // 3. Navigate to /admin
  console.log('Navigating to /admin in Agency Mode...');
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 4. Capture full page in dark mode
  const overviewDarkPath = path.join(ARTIFACT_DIR, 'hero_greeting_card_polished_dark.png');
  await page.screenshot({ path: overviewDarkPath, fullPage: false });
  console.log(`Saved: ${overviewDarkPath}`);

  // 5. Capture close-up of the hero card itself
  const heroElement = await page.$('section');
  if (heroElement) {
    const heroCardPath = path.join(ARTIFACT_DIR, 'hero_greeting_card_closeup.png');
    await heroElement.screenshot({ path: heroCardPath });
    console.log(`Saved: ${heroCardPath}`);
  }

  // 6. Test Voice button active state to show animated soundwave visualizer!
  const voiceBtn = await page.$('button:has(svg.lucide-mic)');
  if (voiceBtn) {
    console.log('Triggering voice button to capture soundwave equalizer animation...');
    await voiceBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const voiceCardPath = path.join(ARTIFACT_DIR, 'hero_card_voice_active.png');
    if (heroElement) {
      await heroElement.screenshot({ path: voiceCardPath });
      console.log(`Saved: ${voiceCardPath}`);
    }
  }

  // 7. Light Mode check
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 600));
  const overviewLightPath = path.join(ARTIFACT_DIR, 'hero_greeting_card_polished_light.png');
  await page.screenshot({ path: overviewLightPath, fullPage: false });
  console.log(`Saved: ${overviewLightPath}`);

  await browser.close();
  console.log('Screenshots completed successfully.');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
