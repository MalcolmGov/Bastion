import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function verifyGreeting() {
  console.log('Verifying greeting on admin dashboard...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // 1. Login as Malcolm
    console.log('Logging in as malcolm@movedigital.africa...');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'malcolm@movedigital.africa');
    await page.type('input[type="password"]', 'Bastion2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 2. Ensure agency mode
    await page.evaluate(() => {
      localStorage.setItem('move_studio_portal_mode', 'agency');
    });
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // 3. Extract greeting headline
    const greetingText = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent?.trim() : 'NO H1 FOUND';
    });

    console.log(`[TEST RESULT] H1 Headline Text: "${greetingText}"`);

    // Check account menu name
    const accountName = await page.evaluate(() => {
      const btn = document.querySelector('button[title*="Account"]');
      return btn ? btn.getAttribute('title') : 'NO ACCOUNT BUTTON';
    });
    console.log(`[TEST RESULT] Account title: "${accountName}"`);

    if (greetingText?.includes('Malcolm') && !greetingText?.includes(', M.')) {
      console.log('✅ SUCCESS: Greeting correctly displays "Malcolm"!');
    } else {
      console.error('❌ FAILURE: Greeting still displays incorrect name!');
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

verifyGreeting().catch(err => {
  console.error(err);
  process.exit(1);
});
