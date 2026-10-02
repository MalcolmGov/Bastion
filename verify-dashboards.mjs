import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Test Corporate User Login with Decluttered & Airy Executive Dashboard
  console.log('Testing Decluttered Corporate Executive Overview with generous breathing room...');
  const corpContext = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const corpPage = await corpContext.newPage();

  await corpPage.goto('http://localhost:3010/admin/login');
  await corpPage.waitForLoadState('networkidle');

  // Fill in Corporate User credentials
  await corpPage.fill('input[type="email"]', 'editor@aurum.local');
  await corpPage.fill('input[type="password"]', 'Bastion2026!Corp#');
  await corpPage.click('button[type="submit"]');

  // Wait for redirect to /admin
  await corpPage.waitForURL('**/admin', { timeout: 15000 });
  await corpPage.waitForTimeout(3000);

  // Screenshot 1: Overview top showing Aurum Energy workspace with premium sidebar & polished cards
  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/16-premium-sidebar-cards-top.png',
    fullPage: false
  });
  console.log('Saved 16-premium-sidebar-cards-top.png');

  // Scroll down smoothly to show charts, downloads, and sync footer
  await corpPage.evaluate(() => window.scrollBy(0, 360));
  await corpPage.waitForTimeout(1000);

  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/17-premium-sidebar-cards-bottom.png',
    fullPage: false
  });
  console.log('Saved 17-premium-sidebar-cards-bottom.png');

  await browser.close();
  console.log('Premium sidebar and cards screenshots captured successfully!');
}

main().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
