import { requireEnv } from './lib/env';
import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1400']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1400, deviceScaleFactor: 2 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', requireEnv('E2E_CLIENT_PASSWORD'));
  await page.click('button[type="submit"]');

  console.log('Waiting for admin redirect...');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Set mode to agency
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'agency');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Screenshot clean hero card on /admin
  const heroScreenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_hero_card_clean.png';
  const heroElement = await page.$('.relative.overflow-hidden.rounded-2xl.border.border-slate-800');
  if (heroElement) {
    await heroElement.screenshot({ path: heroScreenshot });
    console.log('Clean Hero Card screenshot saved to:', heroScreenshot);
  }

  const dashboardScreenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_admin_clean_hero_full.png';
  await page.screenshot({ path: dashboardScreenshot });
  console.log('Full admin dashboard screenshot saved to:', dashboardScreenshot);

  // 2. Navigate to /admin/onboard
  console.log('Navigating to /admin/onboard...');
  await page.goto('http://localhost:3010/admin/onboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const wizardStep1Screenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step1_profile.png';
  await page.screenshot({ path: wizardStep1Screenshot });
  console.log('Wizard Step 1 screenshot saved to:', wizardStep1Screenshot);

  // Select Vodacom preset and advance to Step 2
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Vodacom Group')) {
      await b.click();
      console.log('Clicked Vodacom Group preset');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 600));

  // Helper to click next
  async function clickContinue() {
    for (const b of await page.$$('button')) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.toUpperCase().includes('CONTINUE TO')) {
        await b.click();
        console.log('Clicked continue button:', text.trim());
        break;
      }
    }
    await new Promise(r => setTimeout(r, 800));
  }

  // Go to Step 2: Brand DNA
  await clickContinue();
  const wizardStep2Screenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step2_brand.png';
  await page.screenshot({ path: wizardStep2Screenshot });
  console.log('Wizard Step 2 screenshot saved to:', wizardStep2Screenshot);

  // Go to Step 3: Architecture & Modules
  await clickContinue();
  const wizardStep3Screenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step3_architecture.png';
  await page.screenshot({ path: wizardStep3Screenshot });
  console.log('Wizard Step 3 screenshot saved to:', wizardStep3Screenshot);

  // Go to Step 4: Client Access
  await clickContinue();
  const wizardStep4Screenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step4_access.png';
  await page.screenshot({ path: wizardStep4Screenshot });
  console.log('Wizard Step 4 screenshot saved to:', wizardStep4Screenshot);

  // Go to Step 5: Launch
  await clickContinue();
  const wizardStep5Screenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step5_prelaunch.png';
  await page.screenshot({ path: wizardStep5Screenshot });
  console.log('Wizard Step 5 Prelaunch screenshot saved to:', wizardStep5Screenshot);

  // Click Execute Full Onboarding & Deploy Website
  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Execute Full Onboarding')) {
      await b.click();
      console.log('Clicked Execute Full Onboarding & Deploy Website');
      break;
    }
  }

  // Wait for 5-phase provisioning animation & server response to complete
  await new Promise(r => setTimeout(r, 4500));

  const wizardDeployedScreenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/onboarding_wizard_step5_deployed_success.png';
  await page.screenshot({ path: wizardDeployedScreenshot });
  console.log('Wizard Step 5 Deployed Success screenshot saved to:', wizardDeployedScreenshot);

  // 3. Navigate to /admin/clients and click "Onboard Client"
  console.log('Navigating to /admin/clients...');
  await page.goto('http://localhost:3010/admin/clients', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  for (const b of await page.$$('button')) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Onboard Client') && !text.includes('Full')) {
      await b.click();
      console.log('Clicked Onboard Client modal trigger');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  const modalScreenshot = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/clients_onboarding_modal_open.png';
  await page.screenshot({ path: modalScreenshot });
  console.log('Clients Onboarding Modal screenshot saved to:', modalScreenshot);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
