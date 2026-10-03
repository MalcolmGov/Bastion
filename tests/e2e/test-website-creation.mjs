import assert from 'node:assert/strict';
import { request } from '@playwright/test';
const base = process.env.BASTION_E2E_URL;
assert.equal(process.env.BASTION_E2E_ISOLATED, '1', 'Use a disposable fixture database only.');
assert.ok(base && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base));
const contexts = [];
async function account(role) {
  const email = process.env[`BASTION_E2E_${role}_EMAIL`], password = process.env[`BASTION_E2E_${role}_PASSWORD`];
  assert.ok(email && password, `Provide the ${role} fixture account.`);
  const context = await request.newContext({ baseURL: base }); contexts.push(context);
  assert.equal((await context.post('/api/admin/auth/login', { data: { email, password } })).status(), 200);
  return context;
}
async function json(response, status = 200) { const data = await response.json(); assert.equal(response.status(), status, data.error); return data; }
try {
  const agency = await account('AGENCY'), reviewer = await account('REVIEWER');
  const clients = (await json(await agency.get('/api/admin/clients'))).clients;
  const client = clients.find(c => c.websites.some(s => s.id === process.env.BASTION_E2E_SITE_ID));
  assert.ok(client, 'Provide the fixture client website.');
  const slug = `creation-fixture-${Date.now()}`;
  const data = { clientId: client.id, clientName: client.name, websiteName: 'Synthetic corporate creation fixture', websiteSlug: slug, blueprintId: 'professional_services', collectionId: 'editorial', designReviewed: true,
    brandKit: { colors: { primary: { value: '#173A45' }, accent: { value: '#234A54' } }, typography: { headingFont: 'Georgia', bodyFont: 'Arial', headingWeight: '600', scaleRatio: 1.25 } },
    extractedContent: { tagline: 'Purpose with perspective', businessSummary: 'Synthetic company brief for local verification only.', services: [{ title: 'Strategic advice', description: 'Synthetic service description for the fixture.' }], contactInfo: { email: 'fixture@example.com' } } };
  const created = await json(await agency.post('/api/admin/wizard/assemble', { data }));
  assert.equal(created.compositions.length, 4); assert.ok(created.compositions.every(p => p.status === 'draft'));
  await json(await agency.post('/api/admin/wizard/assemble', { data }), 409);
  await json(await reviewer.post('/api/admin/wizard/assemble', { data: { ...data, websiteSlug: `${slug}-forbidden` } }), 403);
  const tokens = await json(await reviewer.get(`/api/admin/design-system?siteId=${created.websiteId}`));
  assert.equal(tokens.system.colors.primary, '#173A45');
  const read = await json(await reviewer.get(`/api/admin/editor?siteId=${created.websiteId}`));
  assert.equal(read.compositions.length, 4);
  const home = read.compositions.find(p => p.pageSlug === 'home');
  assert.equal(home.sections[1].styles.headingFont, 'Georgia');
  const edited = await json(await agency.post('/api/admin/editor', { data: { siteId: created.websiteId, pageSlug: 'home', title: 'Synthetic updated home', sections: home.sections, expectedVersion: 1, status: 'in_review' } }));
  assert.equal(edited.version, 2);
  const queue = await json(await reviewer.get('/api/admin/editor/reviews'));
  assert.ok(queue.reviews.some(item => item.id === edited.compositionId));
  await json(await agency.post('/api/admin/editor', { data: { siteId: created.websiteId, pageSlug: 'home', sections: home.sections, expectedVersion: 2, status: 'published' } }), 409);
  console.log(`PASS: ${slug} created four token-based drafts, preserved duplicate conflict, allowed client reads and entered independent review without publishing.`);
  if (process.env.BASTION_E2E_EXTRACT_PUBLIC === '1') {
    const source = await json(await agency.post('/api/admin/brand/extract', { data: { url: 'https://example.com', maxPages: 1 }, timeout: 120000 }));
    assert.ok(source.result.theme.color.text); assert.ok(source.result.crawledPages.length >= 1);
    console.log('PASS: bounded live public DNA extraction returned a real homepage and semantic theme.');
  }
} finally { for (const context of contexts) await context.dispose(); }
