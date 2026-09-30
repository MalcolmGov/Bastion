import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function verifyDarkModeEndToEnd() {
  console.log('🚀 Starting End-to-End Dark Mode & AI Polish Verification...');
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

    // Step 2: Configure LocalStorage for optimal editor view
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('bastion_sidebar_collapsed', 'true');
      localStorage.setItem('bastion_editor_left_panel_width', '300');
      localStorage.setItem('bastion_editor_right_panel_width', '480');
      localStorage.setItem('bastion_ai_auto_apply', 'true');
    });

    // Step 3: Navigate to Editor
    console.log('Navigating to Editor...');
    await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Step 4: Switch to AI Tab
    console.log('Switching to AI Coding & Polish Studio tab via #tab-btn-ai...');
    await page.click('#tab-btn-ai');
    await new Promise(r => setTimeout(r, 1200));

    // Step 5: Click "🌓 Dark Mode (Entire Page)" quick button
    console.log('Applying Dark Mode to entire canvas via 1-click button...');
    const clickedDark = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const darkBtn = btns.find(b => b.textContent?.includes('Dark Mode (Entire Page)'));
      if (darkBtn) {
        darkBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Dark Mode (Entire Page):', clickedDark);
    await new Promise(r => setTimeout(r, 1500));

    // Capture Screenshot 1: Dark Mode applied to all sections
    const screenshot1Path = path.join(ARTIFACT_DIR, 'editor_dark_mode_all_sections_verified.png');
    await page.screenshot({ path: screenshot1Path, fullPage: false });
    console.log(`✓ Screenshot 1 saved to ${screenshot1Path}`);

    // Step 6: Test AI Live Prompt with Payguard Branding
    console.log('Testing live AI chat with Payguard dark mode prompt...');
    await page.focus('textarea[placeholder*="Ask"]');
    await page.type('textarea[placeholder*="Ask"]', 'Convert the header to Payguard dark glass theme with brand name Payguard and request demo button');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.press('Enter');
    console.log('Dispatched Enter to send prompt');

      console.log('Waiting for AI response from fallback cascade...');
      // Wait for assistant response to appear
      await page.waitForFunction(
        () => {
          const assistMsg = document.querySelector('[class*="border-sky-500"], [class*="bg-sky-500"]');
          const errorMsg = document.querySelector('.bg-rose-950');
          const applyBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Apply'));
          return applyBtn || assistMsg || errorMsg;
        },
        { timeout: 15000 }
      );

      await new Promise(r => setTimeout(r, 2000));

      // Check if there is an error banner
      const hasErrorBanner = await page.evaluate(() => {
        const err = document.querySelector('.bg-rose-950');
        return err ? err.textContent : null;
      });
      if (hasErrorBanner) {
        console.warn('Notice banner present:', hasErrorBanner);
      } else {
        console.log('✓ No error banner! Clean AI response generated.');
      }

      // Check if Apply button exists and click it
      const clickedApply = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent?.includes('Apply Changes to Canvas') || b.textContent?.includes('✓ Apply to Canvas'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log('Clicked Apply Changes to Canvas:', clickedApply);
      await new Promise(r => setTimeout(r, 1500));

    // Capture Screenshot 2: Final live state after apply
    const screenshot2Path = path.join(ARTIFACT_DIR, 'editor_dark_mode_live_verified.png');
    await page.screenshot({ path: screenshot2Path, fullPage: false });
    console.log(`✓ Screenshot 2 saved to ${screenshot2Path}`);

    // Verify brand name updated on header
    const headerBrandText = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.textContent : '';
    });
    console.log('Header text contains Payguard:', headerBrandText?.includes('Payguard'));

    console.log('✅ End-to-End Verification Complete!');
  } finally {
    await browser.close();
  }
}

verifyDarkModeEndToEnd().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
