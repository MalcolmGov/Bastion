import puppeteer from 'puppeteer-core';
import path from 'path';
import { loginViaForm } from './lib/devLogin';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3010';
const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

async function main() {
  console.log('--- Starting Commercial Billing & Invoicing Verification ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  // 1. Login to admin
  console.log('Logging in to Admin Console...');
  await loginViaForm(page, BASE_URL, 'agency', { delay: 10, waitForNavigation: false });
  await new Promise(r => setTimeout(r, 2000));

  // 2. Navigate to /admin/billing
  console.log('Navigating to /admin/billing...');
  await page.goto(`${BASE_URL}/admin/billing`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Ensure Light Mode for first screenshot
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  });
  await new Promise(r => setTimeout(r, 500));

  const lightBillingPath = path.join(ARTIFACT_DIR, 'bastion_billing_light_mode.png');
  await page.screenshot({ path: lightBillingPath, fullPage: false });
  console.log('Saved Light Mode Billing Dashboard:', lightBillingPath);

  // 4. Test "Create Quotation" modal in Light Mode
  console.log('Opening Create Quotation Modal in Light Mode...');
  const createQuoteBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent && b.textContent.includes('Create Quotation'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Create Quotation button:', createQuoteBtn);
  await new Promise(r => setTimeout(r, 1000));

  const createModalLightPath = path.join(ARTIFACT_DIR, 'bastion_create_modal_light_mode.png');
  await page.screenshot({ path: createModalLightPath, fullPage: false });
  console.log('Saved Create Modal Light Mode:', createModalLightPath);

  // Close modal
  await page.evaluate(() => {
    const closeButtons = Array.from(document.querySelectorAll('button'));
    const btn = closeButtons.find(b => b.textContent === '✕' || b.textContent?.includes('Cancel'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 5. Open Preview on the first document to inspect CommercialDocumentTemplate
  console.log('Opening Document Preview Modal with CommercialDocumentTemplate...');
  const previewClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[title*="Preview Document"]'));
    if (buttons.length > 0) {
      (buttons[0] as HTMLButtonElement).click();
      return true;
    }
    return false;
  });
  console.log('Clicked Preview Document button:', previewClicked);
  await new Promise(r => setTimeout(r, 1500));

  const previewTemplatePath = path.join(ARTIFACT_DIR, 'bastion_commercial_document_template_preview.png');
  await page.screenshot({ path: previewTemplatePath, fullPage: false });
  console.log('Saved Document Template Preview:', previewTemplatePath);

  // Close preview modal
  await page.evaluate(() => {
    const closeButtons = Array.from(document.querySelectorAll('button[title="Close Preview"]'));
    if (closeButtons.length > 0) {
      (closeButtons[0] as HTMLButtonElement).click();
    }
  });
  await new Promise(r => setTimeout(r, 800));

  // 6. Switch to Dark Mode & capture
  console.log('Switching to Dark Mode...');
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  });
  await new Promise(r => setTimeout(r, 800));

  const darkBillingPath = path.join(ARTIFACT_DIR, 'bastion_billing_dark_mode.png');
  await page.screenshot({ path: darkBillingPath, fullPage: false });
  console.log('Saved Dark Mode Billing Dashboard:', darkBillingPath);

  // 7. Test client invoice portal page
  // Get an invoice acceptance token from database via API
  const token = await page.evaluate(async () => {
    const res = await fetch('/api/admin/billing');
    const data = await res.json();
    const inv = data.docs?.find((d: any) => d.type === 'invoice' && d.acceptanceToken);
    return inv ? inv.acceptanceToken : null;
  });

  if (token) {
    console.log(`Navigating to client invoice portal at /invoice/${token}...`);
    await page.goto(`${BASE_URL}/invoice/${token}`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const invoicePortalPath = path.join(ARTIFACT_DIR, 'bastion_client_invoice_portal.png');
    await page.screenshot({ path: invoicePortalPath, fullPage: false });
    console.log('Saved Client Invoice Portal:', invoicePortalPath);
  } else {
    console.log('No existing invoice with token found to screenshot portal.');
  }

  await browser.close();
  console.log('--- Commercial Billing & Invoicing Verification Completed Successfully ---');
}

main().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
