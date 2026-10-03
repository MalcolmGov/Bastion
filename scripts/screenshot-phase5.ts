import puppeteer from 'puppeteer-core';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });

  // 1. Public Ethics / Whistleblower Hotline
  console.log('1. Navigating to /ethics ...');
  await page.goto('http://localhost:3010/ethics', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 2000));

  const p1 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_ethics_hotline_portal.png';
  await page.screenshot({ path: p1, fullPage: false });
  console.log('✓ Saved:', p1);

  // 2. Public Corporate Supplier Tender Board
  console.log('2. Navigating to /suppliers/tenders ...');
  await page.goto('http://localhost:3010/suppliers/tenders', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 2000));

  const p2 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_suppliers_tender_board.png';
  await page.screenshot({ path: p2, fullPage: false });
  console.log('✓ Saved:', p2);

  // 3. Admin Login & Ombudsman Triage Desk
  console.log('3. Logging in as admin...');
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa');
  await page.type('input[type="password"]', 'Bastion2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('4. Navigating to /admin/ethics ...');
  await page.goto('http://localhost:3010/admin/ethics', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  const p3 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_admin_ethics_ombudsman.png';
  await page.screenshot({ path: p3, fullPage: false });
  console.log('✓ Saved:', p3);

  // 4. Admin Tender Management & Vendor Evaluation Desk
  console.log('5. Navigating to /admin/tenders ...');
  await page.goto('http://localhost:3010/admin/tenders', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  const p4 =
    '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/bastion_admin_tender_management.png';
  await page.screenshot({ path: p4, fullPage: false });
  console.log('✓ Saved:', p4);

  await browser.close();
  console.log('All Phase 5 screenshots captured successfully.');
}

main().catch((err) => {
  console.error('Screenshot script failed:', err);
  process.exit(1);
});
