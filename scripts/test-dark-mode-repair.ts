import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function testDarkModeRepair() {
  console.log('Testing dark mode repair on exact user screenshot payload...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1540,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1540, height: 960 });

  // 1. Login
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', 'GoldFields2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 2. Seed the exact stuck payload from the user screenshot into localStorage
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('bastion_sidebar_collapsed', 'true');
    localStorage.setItem('bastion_editor_left_panel_width', '320');
    localStorage.setItem('bastion_editor_right_panel_width', '520');

    // Exact stuck payload from Malcolm screenshot: truncated mid-word at `"brand`, no closing braces, no markdown fence
    const stuckRawText = `"props": {
  "brandName": "Payguard",
  "logoDarkUrl": "https://payguard.africa/payguard-logo-light.png",
  "links": [
    { "label": "Products", "href": "/products" },
    { "label": "How It Works", "href": "/how-it-works" },
    { "label": "Architecture", "href": "/architecture" },
    { "label": "Developers", "href": "/developers" },
    { "label": "Live Demos", "href": "/demo" }
  ],
  "ctaText": "Request a Demo",
  "ctaHref": "/contact"
},
"styles": {
  "theme": "dark",
  "backgroundType": "solid",
  "backgroundColor": "rgba(5, 8, 15, 0.72)",
  "backdropBlur": "16px",
  "backdropSaturate": "180%",
  "borderColor": "rgba(255, 255, 255, 0.06)",
  "bottomAccentLine": "linear-gradient(90deg, transparent 0%, rgba(2, 132, 199, 0.6) 50%, transparent 100%)",
  "brandTextColor": "#F8FAFC",
  "brand`;

    const seedChat = [
      {
        id: 'user_dark_mode_prompt',
        role: 'user',
        content: 'Implement dark mode for header with Payguard branding and glass styling',
        timestamp: '17:38'
      },
      {
        id: 'assist_previously_stuck',
        role: 'assistant',
        content: stuckRawText,
        modelId: 'Claude Opus 5.5',
        provider: 'Anthropic',
        timestamp: '17:38',
        targetSectionTitle: 'HEADER',
        // In the user session, parsedChanges was undefined because the JSON parser crashed on unclosed tokens!
        parsedChanges: undefined,
        applied: false
      }
    ];

    localStorage.setItem('bastion_ai_chat_v2_home', JSON.stringify(seedChat));
  });

  // 3. Navigate to editor
  await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Header section so target block is HEADER
  await page.evaluate(() => {
    // Click header dynamic zone item or set selected section
    const headerBlock = Array.from(document.querySelectorAll('div')).find(d => d.textContent?.includes('HEADER'));
    if (headerBlock) (headerBlock as HTMLElement).click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Open AI Polish tab
  await page.waitForSelector('#tab-btn-ai');
  await page.click('#tab-btn-ai');
  await new Promise(r => setTimeout(r, 1200));

  // Capture healed diff card screenshot (shows clean prose, Dark Theme badge, props/styles diff, Apply button)
  const healedPath = path.join(ARTIFACT_DIR, 'editor_dark_mode_healed_diff.png');
  await page.screenshot({ path: healedPath, fullPage: false });
  console.log(`Saved healed screenshot: ${healedPath}`);

  // 5. Click "✓ Apply Changes to Canvas" button
  console.log('Clicking ✓ Apply Changes to Canvas...');
  const applyClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const applyBtn = btns.find(b => b.textContent && b.textContent.includes('Apply Changes to Canvas'));
    if (applyBtn) {
      (applyBtn as HTMLElement).click();
      return true;
    }
    return false;
  });
  console.log(`Apply button clicked: ${applyClicked}`);
  await new Promise(r => setTimeout(r, 1500));

  // Capture canvas after applying changes (shows Payguard brand in header, dark translucent glass styling, confirmation toast)
  const appliedPath = path.join(ARTIFACT_DIR, 'editor_dark_mode_applied_to_canvas.png');
  await page.screenshot({ path: appliedPath, fullPage: false });
  console.log(`Saved applied screenshot: ${appliedPath}`);

  await browser.close();
  console.log('Dark mode repair test completed successfully.');
}

testDarkModeRepair().catch(err => {
  console.error('Error in dark mode repair test:', err);
  process.exit(1);
});
