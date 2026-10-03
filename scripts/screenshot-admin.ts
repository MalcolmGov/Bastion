import puppeteer from 'puppeteer-core';
import { loginViaForm } from './lib/devLogin';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1400']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1400, deviceScaleFactor: 2 });

  console.log('Navigating to login...');
  await loginViaForm(page, 'http://localhost:3010', 'client', { waitForNavigation: false });

  console.log('Waiting for admin redirect...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Set mode to agency
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'agency');
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // Wait for Recharts animations to complete
  await new Promise(r => setTimeout(r, 2500));

  const screenshotPath = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_operations_overview_dashboard.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);

  // Also take a screenshot focused directly on the 4 cards and charts
  const cardsElement = await page.$('section.space-y-6');
  if (cardsElement) {
    const cardsScreenshotPath = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_operations_cards_and_charts.png';
    await cardsElement.screenshot({ path: cardsScreenshotPath });
    console.log('Cards screenshot saved to:', cardsScreenshotPath);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
