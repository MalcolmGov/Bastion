import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  console.log('Logging in as editor@aurum.local...');
  await page.goto('http://localhost:3010/admin/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', 'editor@aurum.local');
  await page.fill('input[type="password"]', 'Bastion2026!Corp#');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/admin', { timeout: 15000 });
  await page.waitForTimeout(3000);

  // 1. Capture Overview top showing multi-site tabs & header
  await page.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/19-multi-site-overview-pills.png',
    fullPage: false
  });
  console.log('Saved 19-multi-site-overview-pills.png');

  // 2. Click the sidebar workspace card to open the multi-site popover
  const workspaceButton = page.locator('aside button:has-text("Aurum Energy & Resources")');
  await workspaceButton.click();
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/18-multi-site-sidebar-switcher.png',
    fullPage: false
  });
  console.log('Saved 18-multi-site-sidebar-switcher.png');

  // 3. Click "Aurum Investor Relations Hub" from the sidebar dropdown
  const irButton = page.locator('button:has-text("Aurum Investor Relations Hub")').first();
  await irButton.click();
  await page.waitForTimeout(2000);

  await page.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/20-multi-site-switched-property.png',
    fullPage: false
  });
  console.log('Saved 20-multi-site-switched-property.png');

  // 4. Scroll down to show the Corporate Web Properties portfolio card
  await page.evaluate(() => window.scrollBy(0, 950));
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/21-multi-site-portfolio-grid.png',
    fullPage: false
  });
  console.log('Saved 21-multi-site-portfolio-grid.png');

  await browser.close();
  console.log('All multi-site verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
