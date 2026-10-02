import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Test Bastion Agency Login
  console.log('Testing Bastion Agency Admin Login...');
  const agencyContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const agencyPage = await agencyContext.newPage();
  
  await agencyPage.goto('http://localhost:3010/admin/login');
  await agencyPage.waitForLoadState('networkidle');

  // Fill in Bastion Agency Admin credentials
  await agencyPage.fill('input[type="email"]', 'admin@bastion.local');
  await agencyPage.fill('input[type="password"]', 'Bastion2026!Corp#');
  await agencyPage.click('button[type="submit"]');

  // Wait for redirect to /admin
  await agencyPage.waitForURL('**/admin', { timeout: 15000 });
  await agencyPage.waitForTimeout(3000);

  await agencyPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/06-bastion-agency-overview-fixed.png',
    fullPage: false
  });
  console.log('Saved 06-bastion-agency-overview-fixed.png');

  // 2. Test Corporate User Login
  console.log('Testing Corporate User Login...');
  const corpContext = await browser.newContext({ viewport: { width: 1440, height: 1080 } });
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

  // Take screenshot of top part (identity + metrics)
  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/07-corporate-executive-dashboard-top.png',
    fullPage: false
  });
  console.log('Saved 07-corporate-executive-dashboard-top.png');

  // Scroll down to Web Telemetry & Reporting Dashboard
  await corpPage.evaluate(() => window.scrollBy(0, 450));
  await corpPage.waitForTimeout(1000);

  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/08-corporate-web-analytics-charts.png',
    fullPage: false
  });
  console.log('Saved 08-corporate-web-analytics-charts.png');

  // Scroll further down to Live Website Preview and Actions
  await corpPage.evaluate(() => window.scrollBy(0, 600));
  await corpPage.waitForTimeout(1000);

  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/09-corporate-live-website-preview.png',
    fullPage: false
  });
  console.log('Saved 09-corporate-live-website-preview.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
