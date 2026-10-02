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
  await corpPage.fill('input[type="email"]', 'editor@client.local');
  await corpPage.fill('input[type="password"]', 'Bastion2026!Corp#');
  await corpPage.click('button[type="submit"]');

  // Wait for redirect to /admin
  await corpPage.waitForURL('**/admin', { timeout: 15000 });
  await corpPage.waitForTimeout(3000);

  // Screenshot 1: Overview top showing refined status ribbon and breathing room
  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/12-decluttered-overview-top.png',
    fullPage: false
  });
  console.log('Saved 12-decluttered-overview-top.png');

  // Scroll down smoothly to show the airy transition to the 4 visual charts
  await corpPage.evaluate(() => window.scrollBy(0, 340));
  await corpPage.waitForTimeout(1000);

  await corpPage.screenshot({
    path: '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/13-decluttered-charts-breathing-room.png',
    fullPage: false
  });
  console.log('Saved 13-decluttered-charts-breathing-room.png');

  await browser.close();
  console.log('Decluttered screenshots captured successfully!');
}

main().catch(err => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
