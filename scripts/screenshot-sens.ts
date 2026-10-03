import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa');
  await page.type('input[type="password"]', 'Bastion2026!');
  await page.click('button[type="submit"]');

  console.log('2. Waiting for login completion...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('3. Navigating to /admin/sens...');
  await page.goto('http://localhost:3010/admin/sens', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 1: SENS Wire Feeder
  const p1 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/jse_sens_hub_wire_feed.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Saved:', p1);

  // Click on "Read Official SENS" button to open teleprinter modal
  const readButtons = await page.$$('button');
  for (const btn of readButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Read Official SENS')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 800));
      break;
    }
  }

  // Screenshot 2: JSE Teleprinter Modal
  const p2 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/jse_sens_teleprinter_modal.png';
  await page.screenshot({ path: p2, fullPage: false });
  console.log('Saved:', p2);

  // Close modal by clicking the close button with Lucide X
  const closeBtn = await page.$('button[aria-label="Close"], .fixed button:has(svg)');
  if (closeBtn) {
    await closeBtn.click();
  } else {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const close = btns.find(b => b.querySelector('svg.lucide-x') || b.textContent?.includes('✕'));
      if (close) close.click();
    });
  }
  await new Promise(r => setTimeout(r, 600));

  // Click on "Financial Calendar & Dividend Hub" tab
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text && text.includes('Financial Calendar')) {
      await tab.click();
      await new Promise(r => setTimeout(r, 1200));
      break;
    }
  }

  // Screenshot 3: Calendar & SA DWT Calculator
  const p3 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/jse_financial_calendar_and_dwt_calculator.png';
  await page.screenshot({ path: p3, fullPage: false });
  console.log('Saved:', p3);

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
