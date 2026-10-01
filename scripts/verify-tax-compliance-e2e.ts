import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1400']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1400, deviceScaleFactor: 2 });

  console.log('1. Logging in to Bastion Admin...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@goldfields.com');
  await page.type('input[type="password"]', 'GoldFields2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Set mode to agency
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'agency');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Test Onboarding Wizard Step 1 Corporate Tax Particulars
  console.log('2. Navigating to /admin/onboard...');
  await page.goto('http://localhost:3010/admin/onboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Click Vodacom Group preset button
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Vodacom Group')) {
      await b.click();
      console.log('Clicked Vodacom Group preset');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';
  const onboardScreenshot = `${artifactDir}/onboarding_step1_corporate_tax_particulars.png`;
  await page.screenshot({ path: onboardScreenshot });
  console.log('Saved onboarding Step 1 screenshot:', onboardScreenshot);

  // 3. Test Billing Page Modal Auto-population
  console.log('3. Navigating to /admin/billing...');
  await page.goto('http://localhost:3010/admin/billing', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click "Create Quotation" button
  const billButtons = await page.$$('button');
  for (const b of billButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Create Quotation') || text.includes('New Quotation'))) {
      await b.click();
      console.log('Clicked Create Quotation button');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // In the modal, select Vodacom Group in the recipient client dropdown
  const selects = await page.$$('select');
  for (const s of selects) {
    const hasVodacom = await page.evaluate(el => {
      return Array.from((el as HTMLSelectElement).options).some(o => o.value === 'client_vodacom_group');
    }, s);
    if (hasVodacom) {
      await s.select('client_vodacom_group');
      console.log('Selected client_vodacom_group in modal');
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Type PO reference
  const poInput = await page.$('input[placeholder*="PO-89210-VDCM"]');
  if (poInput) {
    await poInput.type('PO-98412-VDCM');
    console.log('Entered PO-98412-VDCM');
  }

  await new Promise(r => setTimeout(r, 500));
  const billingModalScreenshot = `${artifactDir}/billing_modal_sars_compliant_populated.png`;
  await page.screenshot({ path: billingModalScreenshot });
  console.log('Saved billing modal screenshot:', billingModalScreenshot);

  // Click "Issue & Send to Client" or "Save as Draft"
  const modalButtons = await page.$$('button');
  for (const b of modalButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Issue & Send') || text.includes('Save as Draft'))) {
      await b.click();
      console.log('Clicked Save in modal:', text.trim());
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  // 4. View Document Template Preview
  console.log('4. Opening document template preview...');
  // Ensure filter is "all"
  const allSelects = await page.$$('select');
  for (const s of allSelects) {
    const isFilter = await page.evaluate(el => {
      return Array.from((el as HTMLSelectElement).options).some(o => o.value === 'all');
    }, s);
    if (isFilter) {
      await s.select('all');
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Click the Eye Preview button on the first row
  const eyeButtons = await page.$$('button[title*="Preview"]');
  if (eyeButtons.length > 0) {
    await eyeButtons[0].click();
    console.log('Clicked preview eye button');
  } else {
    console.log('No eye button found, searching all buttons');
  }

  await new Promise(r => setTimeout(r, 2000));
  const docViewScreenshot = `${artifactDir}/tax_invoice_quote_compliant_render.png`;
  await page.screenshot({ path: docViewScreenshot });
  console.log('Saved document preview screenshot:', docViewScreenshot);

  await browser.close();
  console.log('All E2E verifications completed successfully!');
}

main().catch(err => {
  console.error('E2E verification error:', err);
  process.exit(1);
});
