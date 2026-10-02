import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Test Corporate User Login
  console.log('Testing Corporate User Login with Enhanced 4-Chart Executive Suite...');
  const corpContext = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const corpPage = await corpContext.newPage();

  await corpPage.goto('http://localhost:3010/admin/login');
  await corpPage.waitForLoadState('networkidle');

  // Fill in Corporate User credentials
  await corpPage.fill('input[type="email"]', 'editor@client.local');
  await corpPage.fill('input[type="password"]', 'Bastion2026!Corp#');
  await corpPage.click('button[type="submit"]');

  // Wait for redirect to /admin
  await corpPage.waitForURL('**/admin', { timeout: 15000 });
  await corpPage.waitForTimeout(3000);

  // Scroll down to the 4 visual chart cards
  await corpPage.evaluate(() => window.scrollBy(0, 380));
  await corpPage.waitForTimeout(1000);

  // Screenshot 1: Chart Card 1 & Chart Card 2 (Vitals AreaChart + Document Intelligence Donut)
  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/10-corporate-charts-vitals-and-donut.png',
    fullPage: false
  });
  console.log('Saved 10-corporate-charts-vitals-and-donut.png');

  // Scroll down further to Chart Card 3 & Chart Card 4 (Traffic Velocity BarChart + Edge Invalidation & Geo)
  await corpPage.evaluate(() => window.scrollBy(0, 480));
  await corpPage.waitForTimeout(1000);

  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/11-corporate-charts-traffic-and-edge.png',
    fullPage: false
  });
  console.log('Saved 11-corporate-charts-traffic-and-edge.png');

  await browser.close();
  console.log('All visual verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
