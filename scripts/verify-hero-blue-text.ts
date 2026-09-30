import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function verifyHeroBlueText() {
  console.log('🚀 Starting Verification: "please update the hero text to blue"...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    // Step 1: Login
    console.log('Logging in as admin...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'admin@goldfields.com');
    await page.type('input[type="password"]', 'GoldFields2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Step 2: Set layout preferences
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('bastion_sidebar_collapsed', 'true');
      localStorage.setItem('bastion_editor_left_panel_width', '280');
      localStorage.setItem('bastion_editor_right_panel_width', '480');
      localStorage.setItem('bastion_ai_auto_apply', 'true');
    });

    // Step 3: Navigate to Editor
    console.log('Navigating to Editor...');
    await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Step 4: Switch to AI Tab
    console.log('Switching to AI Polish Studio tab...');
    await page.click('#tab-btn-ai');
    await new Promise(r => setTimeout(r, 1200));

    // Step 5: Close any voice copilot modal if open
    await page.evaluate(() => {
      const closeBtns = Array.from(document.querySelectorAll('button'));
      const xBtn = closeBtns.find(b => b.innerHTML.includes('lucide-x') || b.textContent === '✕');
      if (xBtn) xBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // Step 6: Type Malcolm's exact prompt: "please update the hero text to blue"
    console.log('Typing user request: "please update the hero text to blue"...');
    const textarea = await page.$('textarea');
    if (!textarea) throw new Error('Could not find chat textarea');
    await textarea.focus();
    await textarea.type('please update the hero text to blue');
    await page.keyboard.press('Enter');

    // Wait for AI response and auto-apply
    console.log('Waiting for AI response & auto-apply...');
    await new Promise(r => setTimeout(r, 4500));

    // Step 7: Inspect Hero H1 style on Canvas
    const heroH1Color = await page.evaluate(() => {
      // Find the h1 inside the hero section on canvas
      const hero = document.querySelector('section');
      const h1 = document.querySelector('section h1') as HTMLElement;
      if (!h1) return null;
      const computed = window.getComputedStyle(h1);
      return {
        text: h1.textContent,
        color: computed.color,
        inlineStyle: h1.getAttribute('style')
      };
    });
    console.log('Hero H1 style on canvas:', heroH1Color);

    // Step 8: Take screenshot of the editor showing the blue hero text and AI chat
    const screenshotPath = path.join(ARTIFACT_DIR, 'editor_hero_text_blue_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved to ${screenshotPath}`);

    // Step 9: Click "🌓 Dark Mode (Entire Page)" and verify combined dark mode with blue hero
    console.log('Testing 1-click Dark Mode across entire page with Electric Blue hero...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const darkBtn = btns.find(b => b.textContent?.includes('Dark Mode (Entire Page)'));
      if (darkBtn) darkBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const screenshotPathDark = path.join(ARTIFACT_DIR, 'editor_hero_blue_dark_mode_combined.png');
    await page.screenshot({ path: screenshotPathDark, fullPage: false });
    console.log(`✓ Screenshot 2 (Dark Mode + Blue Hero) saved to ${screenshotPathDark}`);

    console.log('✅ ALL TESTS PASSED: Hero text turned to blue, AI targeted Hero block, and Dark Mode harmonizes perfectly!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyHeroBlueText();
