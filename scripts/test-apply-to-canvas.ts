import { requireEnv } from './lib/env';
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';

async function testApply() {
  console.log('Testing live canvas application with structured AI diff...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1540,960']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1540, height: 960 });

  // Login
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', requireEnv('E2E_CLIENT_PASSWORD'));
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Seed chat with a completed assistant response proposing headline changes
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('bastion_sidebar_collapsed', 'true');
    localStorage.setItem('bastion_editor_left_panel_width', '340');
    localStorage.setItem('bastion_editor_right_panel_width', '540');
    localStorage.setItem('bastion_ai_auto_apply', 'true');

    const seedChat = [
      {
        id: 'user_1',
        role: 'user',
        content: 'Polish the headline, subtitle, and badge to make it an ultra-modern corporate advisory entrance.',
        timestamp: '17:32'
      },
      {
        id: 'assist_1',
        role: 'assistant',
        content: 'Refined the Hero showcase section with an authoritative investor-grade headline, crisp Swiss-style eyebrow badge, and compelling secondary narrative.\n\n```json\n{\n  "summary": "Elevated hero with high-conviction headline and executive typography",\n  "props": {\n    "badge": "FLAGSHIP INSTITUTIONAL ADVISORY • 2026",\n    "title": "Capital Architecture for High-Stakes Global Mandates",\n    "subtitle": "Advising Fortune 500 boards and premier alternative asset managers across cross-border M&A, structured credit, and recapitalizations."\n  }\n}\n```',
        modelId: 'Claude Opus 5.5',
        provider: 'Anthropic',
        timestamp: '17:32',
        targetSectionTitle: 'HERO',
        parsedChanges: {
          summary: 'Elevated hero with high-conviction headline and executive typography',
          props: {
            badge: 'FLAGSHIP INSTITUTIONAL ADVISORY • 2026',
            title: 'Capital Architecture for High-Stakes Global Mandates',
            subtitle: 'Advising Fortune 500 boards and premier alternative asset managers across cross-border M&A, structured credit, and recapitalizations.'
          }
        },
        applied: false
      }
    ];

    localStorage.setItem('bastion_ai_chat_v2_home', JSON.stringify(seedChat));
  });

  // Navigate to editor
  await page.goto(`${BASE_URL}/admin/editor`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Open AI Polish tab
  await page.waitForSelector('#tab-btn-ai');
  await page.click('#tab-btn-ai');
  await new Promise(r => setTimeout(r, 1200));

  // Capture before applying
  const beforeApplyPath = path.join(ARTIFACT_DIR, 'editor_ai_before_apply.png');
  await page.screenshot({ path: beforeApplyPath, fullPage: false });
  console.log(`Saved: ${beforeApplyPath}`);

  // Click "✓ Apply Changes to Canvas"
  console.log('Clicking ✓ Apply Changes to Canvas button...');
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

  // Capture after applying - notice canvas headline should say "Capital Architecture for High-Stakes Global Mandates"!
  const afterApplyPath = path.join(ARTIFACT_DIR, 'editor_ai_after_apply.png');
  await page.screenshot({ path: afterApplyPath, fullPage: false });
  console.log(`Saved: ${afterApplyPath}`);

  // Test Revert button
  console.log('Testing Revert button...');
  const revertClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const revertBtn = btns.find(b => b.textContent && b.textContent.includes('Revert'));
    if (revertBtn) {
      (revertBtn as HTMLElement).click();
      return true;
    }
    return false;
  });
  console.log(`Revert button clicked: ${revertClicked}`);
  await new Promise(r => setTimeout(r, 1500));

  const afterRevertPath = path.join(ARTIFACT_DIR, 'editor_ai_after_revert.png');
  await page.screenshot({ path: afterRevertPath, fullPage: false });
  console.log(`Saved: ${afterRevertPath}`);

  await browser.close();
  console.log('Apply and Revert test completed.');
}

testApply().catch(err => {
  console.error('Error testing apply:', err);
  process.exit(1);
});
