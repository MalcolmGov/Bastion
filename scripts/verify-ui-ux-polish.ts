import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('1. Logging in to Bastion CMS...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3010/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'malcolm@movedigital.africa');
  await page.type('input[type="password"]', 'Bastion2026!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Ensure portal mode is set to client to inspect client CMS experience, and select Gold Fields Flagship
  await page.evaluate(() => {
    localStorage.setItem('move_studio_portal_mode', 'client');
    localStorage.setItem('bastion_active_client_id', 'client_goldfields');
    localStorage.setItem('move_studio_active_client', 'client_goldfields');
    localStorage.setItem('bastion_active_site_id', 'site_goldfields_flagship');
    localStorage.setItem('move_studio_active_site', 'site_goldfields_flagship');
    document.cookie = 'bastion_active_client_id=client_goldfields; path=/; max-age=31536000; SameSite=Lax';
    document.cookie = 'bastion_active_site_id=site_goldfields_flagship; path=/; max-age=31536000; SameSite=Lax';
  });

  console.log('2. Capturing Executive Overview (Desktop)...');
  await page.goto('http://localhost:3010/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01-executive-overview-desktop.png') });

  console.log('3. Capturing Executive Overview (Mobile 375px)...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02-executive-overview-mobile.png') });

  // Reset to desktop viewport
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false });

  console.log('4. Capturing Pages & Navigation Hub (Desktop)...');
  await page.goto('http://localhost:3010/admin/pages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03-pages-hub-desktop.png') });

  console.log('4b. Switching to Gold Fields Investor Relations web property...');
  const siteButtons = await page.$$('button');
  for (const btn of siteButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Gold Fields Investor Relations')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '03b-pages-hub-multi-site-switched.png') });
      break;
    }
  }

  console.log('5. Capturing Pages & Navigation Hub (Mobile 375px)...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04-pages-hub-mobile.png') });

  // Reset to desktop
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2, isMobile: false });

  console.log('6. Capturing Content Releases (Desktop)...');
  await page.goto('http://localhost:3010/admin/releases', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05-releases-desktop.png') });

  console.log('7. Capturing Approvals & Tasks (Desktop)...');
  await page.goto('http://localhost:3010/admin/tasks', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '06-tasks-approvals-desktop.png') });

  console.log('8. Capturing Visual Editor with Website Assistant...');
  await page.goto('http://localhost:3010/admin/editor?siteId=site_goldfields_flagship&pageSlug=home&panel=ai', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '07-visual-editor-ai-assistant.png') });

  console.log('All verification screenshots captured successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Screenshot verification failed:', err);
  process.exit(1);
});
