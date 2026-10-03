import puppeteer from 'puppeteer-core';
import { loginViaForm } from './lib/devLogin';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  console.log('1. Logging in to admin...');
  await loginViaForm(page, 'http://localhost:3010', 'client');

  // Ensure Agency mode for billing
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'agency');
  });

  // SCREENSHOT 1: Commercial Billing Table with PRO-2026-BASTION
  console.log('2. Navigating to /admin/billing...');
  await page.goto('http://localhost:3010/admin/billing', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const billingTablePath = `${ARTIFACT_DIR}/bastion_billing_pipeline_proposal.png`;
  await page.screenshot({ path: billingTablePath, fullPage: false });
  console.log('Saved:', billingTablePath);

  // SCREENSHOT 2: Preview PRO-2026-BASTION Template
  console.log('3. Opening PRO-2026-BASTION preview modal...');
  const eyeButtons = await page.$$('button[title="Preview Document & Print"]');
  if (eyeButtons.length > 0) {
    await eyeButtons[0].click();
    await new Promise(r => setTimeout(r, 1500));
    const previewModalPath = `${ARTIFACT_DIR}/bastion_proposal_preview_template.png`;
    await page.screenshot({ path: previewModalPath, fullPage: false });
    console.log('Saved:', previewModalPath);
  }

  // SCREENSHOT 3: Public Digital Signature & Proposal Portal
  console.log('4. Navigating to public proposal acceptance portal...');
  await page.goto('http://localhost:3010/quote/tok_bastion_platform_proposal_2026', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const publicQuotePath = `${ARTIFACT_DIR}/bastion_proposal_client_sign_portal.png`;
  await page.screenshot({ path: publicQuotePath, fullPage: false });
  console.log('Saved:', publicQuotePath);

  // SCREENSHOT 4: Client Experience Sandbox Mode
  console.log('5. Navigating to Client Experience Sandbox (Vodacom Group)...');
  await page.goto('http://localhost:3010/admin', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'client');
    localStorage.setItem('move_studio_active_client', 'client_vodacom_group');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const sandboxModePath = `${ARTIFACT_DIR}/client_experience_sandbox_banner.png`;
  await page.screenshot({ path: sandboxModePath, fullPage: false });
  console.log('Saved:', sandboxModePath);

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
