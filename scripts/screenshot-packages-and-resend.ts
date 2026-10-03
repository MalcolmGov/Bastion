import { requireEnv } from './lib/env';
import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Authenticating via API to get session cookie...');
  const loginRes = await fetch('http://localhost:3010/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'malcolm@movedigital.africa',
      password: requireEnv('E2E_ADMIN_PASSWORD')
    })
  });
  const setCookieHeader = loginRes.headers.get('set-cookie');
  console.log('Login result:', loginRes.status, setCookieHeader ? 'Cookie acquired' : 'No cookie');

  let sessionToken = '';
  if (setCookieHeader) {
    const match = setCookieHeader.match(/gf_studio_session=([^;]+)/);
    if (match) sessionToken = match[1];
  }

  if (sessionToken) {
    await page.setCookie({
      name: 'gf_studio_session',
      value: sessionToken,
      domain: 'localhost',
      path: '/'
    });
  }

  console.log('2. Navigating to /admin/onboard ...');
  await page.goto('http://localhost:3010/admin/onboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Vodacom Group preset in Step 1
  console.log('3. Applying Vodacom Group preset...');
  const presetButtons = await page.$$('button');
  for (const btn of presetButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Vodacom Group')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Click continue to Step 2
  console.log('4. Advancing to Step 2: Commercial Package...');
  const continueButtons = await page.$$('button');
  for (const btn of continueButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Continue to Commercial Package')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  // Capture Step 2: Commercial Package Tier & Custom Pricing
  const p1 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_onboarding_packages_tier_flow.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('✓ Saved Step 2 Packages screenshot:', p1);

  // Switch to Platinum Tier to demonstrate interactivity
  console.log('5. Clicking Platinum Tier card...');
  const tierCards = await page.$$('div[class*="cursor-pointer"]');
  for (const card of tierCards) {
    const text = await page.evaluate(el => el.textContent, card);
    if (text && text.includes('Platinum Package')) {
      await card.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  const p2 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_onboarding_packages_platinum_selected.png';
  await page.screenshot({ path: p2, fullPage: false });
  console.log('✓ Saved Platinum Tier screenshot:', p2);

  // Advance to Client Access (Step 5) to inspect Welcome Notification & Resend Preview
  console.log('6. Advancing to Brand DNA...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Continue to Brand DNA'));
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('7. Advancing to Architecture...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Continue to Architecture'));
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('8. Advancing to Client Access...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Continue to Client Access'));
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const p3 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_onboarding_resend_notification_preview.png';
  await page.screenshot({ path: p3, fullPage: false });
  console.log('✓ Saved Client Access & Resend Preview screenshot:', p3);

  // Advance to Step 6: Launch
  console.log('9. Advancing to Step 6: Launch...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Continue to Launch'));
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  const p4 = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_onboarding_step6_launchpad.png';
  await page.screenshot({ path: p4, fullPage: false });
  console.log('✓ Saved Step 6 Launchpad screenshot:', p4);

  await browser.close();
  console.log('✓ All visual verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
