const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createHarness } = require('./harness.cjs');

const SECRET = 'preview-secret-0123456789';
const OTHER_SECRET = 'a-different-preview-secret-98765';
const FLAGSHIP = 'client_goldfields';
const GRANT_COOKIE = 'bastion_preview_grant';
const USERS = {
  agency: { id: 'agency-1', name: 'Agency', role: 'platform_admin', client_id: null },
  flagshipEditor: { id: 'gf-editor', name: 'GF Editor', role: 'content_editor', client_id: FLAGSHIP },
  otherTenant: { id: 'vod-editor', name: 'Vodacom Editor', role: 'content_editor', client_id: 'client_vodacom_group' },
};
const SECRET_MARKERS = ['SECRET DRAFT HERO', 'SECRET Q3 results', 'SECRET DRAFT BODY'];

async function fixture(t) {
  const h = await createHarness();
  const saved = process.env.PREVIEW_SECRET_TOKEN;
  process.env.PREVIEW_SECRET_TOKEN = SECRET;
  t.after(() => {
    if (saved === undefined) delete process.env.PREVIEW_SECRET_TOKEN; else process.env.PREVIEW_SECRET_TOKEN = saved;
    h.close();
  });
  await h.db.executeMultiple(`
    ALTER TABLE audit_log ADD COLUMN ip_address TEXT;
    ALTER TABLE audit_log ADD COLUMN correlation_id TEXT;
    INSERT INTO content_records VALUES('page-home','pages','home','Home','published','rev-home-1','rev-home-2',NULL,'${FLAGSHIP}','2026-09-01','2026-09-02');
    INSERT INTO revisions VALUES('rev-home-1','page-home',1,'{"hero":{"title":"LIVE HERO"}}','h1','author-a','2026-09-01','published',NULL);
    INSERT INTO revisions VALUES('rev-home-2','page-home',2,'{"hero":{"title":"SECRET DRAFT HERO"}}','h2','author-a','2026-09-02','draft',NULL);
    INSERT INTO content_records VALUES('rep-live','reports','live-report','Live report','published','rev-rep-live',NULL,NULL,'${FLAGSHIP}','2026-09-01','2026-09-02');
    INSERT INTO revisions VALUES('rev-rep-live','rep-live',1,'{"note":"live body"}','h3','author-a','2026-09-01','published',NULL);
    INSERT INTO content_records VALUES('rep-draft','reports','draft-report','SECRET Q3 results','draft',NULL,'rev-rep-draft',NULL,'${FLAGSHIP}','2026-09-03','2026-09-03');
    INSERT INTO revisions VALUES('rev-rep-draft','rep-draft',1,'{"note":"SECRET DRAFT BODY"}','h4','author-a','2026-09-03','draft',NULL);
  `);
  return h;
}

/** Calls /api/preview as `user` (or signed out). Resolves to { status } for a refusal, or { redirectTo } on success. */
async function preview(h, user, query = '', ip = '203.0.113.7') {
  h.user(user ? USERS[user] : null);
  const request = h.request(`/api/preview${query}`, undefined, null, 'GET');
  request.headers.set('x-forwarded-for', ip);
  try {
    const response = await h.route('api/preview').GET(request);
    return { status: response.status };
  } catch (error) {
    if (error.redirectTo) return { redirectTo: error.redirectTo };
    throw error;
  }
}

const audit = async (h, action) => (await h.db.execute({ sql: 'SELECT * FROM audit_log WHERE action = ? ORDER BY created_at', args: [action] })).rows;
const grantValue = h => h.jar[GRANT_COOKIE]?.value;

// ---- the route ----

test('a correct secret switches draft mode on, issues a grant cookie that holds no secret, and is audited', async t => {
  const h = await fixture(t);
  const result = await preview(h, null, `?secret=${SECRET}&collection=pages&slug=about`);
  assert.deepEqual(result, { redirectTo: '/about' });
  assert.equal(h.draft.enabled, true);
  const cookie = h.jar[GRANT_COOKIE];
  assert.ok(cookie, 'no grant cookie was issued');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, 'lax');
  assert.equal(cookie.options.path, '/');
  assert.ok(cookie.options.maxAge > 0 && cookie.options.maxAge <= 12 * 3600, `maxAge ${cookie.options.maxAge}`);
  assert.ok(!cookie.value.includes(SECRET), 'the secret is inside the cookie');
  const rows = await audit(h, 'PREVIEW_ENABLED');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].actor_id, 'preview-secret');
  assert.equal(rows[0].ip_address, '203.0.113.7');
  assert.equal(JSON.parse(rows[0].details_json).via, 'secret');
  assert.ok(!JSON.stringify(rows).includes(SECRET), 'the secret was written to the audit log');
});

test('a wrong secret is refused, audited without the guess, and gives no cookie and no draft mode', async t => {
  const h = await fixture(t);
  const guess = 'guess-guess-guess-guess-1234';
  assert.equal((await preview(h, null, `?secret=${guess}`)).status, 401);
  assert.equal(h.draft.enabled, false);
  assert.equal(grantValue(h), undefined);
  const rows = await audit(h, 'PREVIEW_DENIED');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].ip_address, '203.0.113.7');
  assert.equal(JSON.parse(rows[0].details_json).reason, 'bad_secret');
  assert.ok(!JSON.stringify(rows).includes(guess), 'the guessed secret was written to the audit log');
});

test('a signed-out request with no secret is refused without filling the audit log', async t => {
  const h = await fixture(t);
  assert.equal((await preview(h, null, '')).status, 401);
  assert.equal((await audit(h, 'PREVIEW_DENIED')).length, 0);
  assert.equal((await h.db.execute('SELECT COUNT(*) AS c FROM audit_log')).rows[0].c, 0);
});

test('guessing the secret is rate limited per address, and the limit applies to the correct secret too', async t => {
  const h = await fixture(t);
  for (let attempt = 1; attempt <= 10; attempt++) {
    assert.equal((await preview(h, null, `?secret=wrong-secret-attempt-${attempt}-xxxx`, '198.51.100.5')).status, 401, `attempt ${attempt}`);
  }
  const blocked = await preview(h, null, `?secret=${SECRET}`, '198.51.100.5');
  assert.equal(blocked.status, 429, 'the eleventh attempt was not limited');
  assert.equal(h.draft.enabled, false, 'draft mode was switched on past the limit');
  assert.deepEqual(await preview(h, null, `?secret=${SECRET}`, '198.51.100.99'), { redirectTo: '/' }, 'another address was limited too');
  assert.equal((await audit(h, 'PREVIEW_DENIED')).length, 10, 'throttled requests were audited');
});

test('signed-in preview is unchanged and audited under the real person, with no grant cookie', async t => {
  const h = await fixture(t);
  for (const user of ['agency', 'flagshipEditor']) {
    h.draft.enabled = false;
    assert.deepEqual(await preview(h, user, '?collection=pages&slug=home'), { redirectTo: '/' }, user);
    assert.equal(h.draft.enabled, true, user);
  }
  assert.equal(grantValue(h), undefined, 'a session preview was given a secret-style grant');
  const rows = await audit(h, 'PREVIEW_ENABLED');
  assert.deepEqual(rows.map(r => r.actor_id).sort(), ['agency-1', 'gf-editor']);
  assert.ok(rows.every(r => JSON.parse(r.details_json).via === 'session'));
});

test('a signed-in person who may not preview is refused and the refusal is audited', async t => {
  const h = await fixture(t);
  assert.equal((await preview(h, 'otherTenant', '?collection=pages&slug=home')).status, 403);
  assert.equal(h.draft.enabled, false);
  const rows = await audit(h, 'PREVIEW_DENIED');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].actor_id, 'vod-editor');
  assert.equal(JSON.parse(rows[0].details_json).reason, 'not_entitled');
});

// ---- the grant ----

test('a grant is valid only if it was signed with the current secret, has not expired and has not been altered', async t => {
  const h = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  const { value } = lib.signPreviewGrant();
  assert.equal(lib.verifyPreviewGrant(value), true);
  const [scope, expires, mac] = value.split('.');
  assert.equal(lib.verifyPreviewGrant(`${scope}.${Number(expires) + 1000}.${mac}`), false, 'an altered expiry was accepted');
  assert.equal(lib.verifyPreviewGrant(`other.${expires}.${mac}`), false, 'an altered scope was accepted');
  assert.equal(lib.verifyPreviewGrant(`${scope}.${expires}.${'0'.repeat(mac.length)}`), false);
  assert.equal(lib.verifyPreviewGrant(`${scope}.${expires}.${mac.slice(0, -2)}`), false, 'a short signature was accepted');
  for (const junk of [undefined, null, '', 'abc', 'a.b', 'a.b.c.d', `${scope}.notanumber.${mac}`]) assert.equal(lib.verifyPreviewGrant(junk), false, String(junk));
  assert.equal(lib.verifyPreviewGrant(value, Number(expires) + 1), false, 'an expired grant was accepted');
  const farFuture = Date.now() + 365 * 24 * 3600 * 1000;
  const body = `${scope}.${farFuture}`;
  const forged = `${body}.${crypto.createHmac('sha256', SECRET).update(body).digest('hex')}`;
  assert.equal(lib.verifyPreviewGrant(forged), false, 'a grant that outlives the maximum lifetime was accepted');
});

test('rotating or removing the secret revokes every grant that was already issued', async t => {
  const h = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  const { value } = lib.signPreviewGrant();
  process.env.PREVIEW_SECRET_TOKEN = OTHER_SECRET;
  assert.equal(lib.verifyPreviewGrant(value), false, 'a grant survived rotation of the secret');
  process.env.PREVIEW_SECRET_TOKEN = SECRET;
  assert.equal(lib.verifyPreviewGrant(value), true);
  delete process.env.PREVIEW_SECRET_TOKEN;
  assert.equal(lib.verifyPreviewGrant(value), false, 'a grant was accepted with no secret configured');
  assert.equal(lib.signPreviewGrant(), null, 'a grant was signed with no secret configured');
});

// ---- what the root site shows ----

const published = ({ hero, items }) => ({ hero: hero?.hero?.title, titles: items.map(r => r.title).sort() });

async function rootSite(h) {
  const content = h.load('lib/server/content.ts');
  const page = await content.getPublishedPage('home', true);
  const reports = await content.getPublishedCollection('reports', true);
  const bySlug = await content.getPublishedRecordBySlug('reports', 'draft-report', true);
  return { page, reports, bySlug, text: JSON.stringify({ page, reports, bySlug }) };
}

test('the draft-mode cookie by itself no longer shows drafts: with no grant and no session the root site is the published one', async t => {
  const h = await fixture(t);
  h.draft.enabled = true;
  h.user(null);
  const site = await rootSite(h);
  assert.deepEqual(SECRET_MARKERS.filter(m => site.text.includes(m)), [], 'draft content reached a visitor with only the cookie');
  assert.equal(site.page.hero.title, 'LIVE HERO');
  assert.deepEqual(published({ hero: site.page, items: site.reports }).titles, ['Live report']);
  assert.equal(site.bySlug, null);
});

test('a valid grant shows the root site\'s drafts, a signed-in flagship user does too, and another client\'s user does not', async t => {
  const h = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  h.draft.enabled = true;

  h.user(null);
  h.jar[GRANT_COOKIE] = { value: lib.signPreviewGrant().value };
  let site = await rootSite(h);
  assert.equal(site.page.hero.title, 'SECRET DRAFT HERO', 'a valid grant did not show drafts');
  assert.ok(site.reports.some(r => r.title === 'SECRET Q3 results'));
  assert.ok(site.bySlug, 'a draft record was not found by slug with a valid grant');

  delete h.jar[GRANT_COOKIE];
  for (const [user, sees] of [['flagshipEditor', true], ['agency', true], ['otherTenant', false]]) {
    h.user(USERS[user]);
    site = await rootSite(h);
    assert.equal(site.page.hero.title, sees ? 'SECRET DRAFT HERO' : 'LIVE HERO', user);
  }
});

test('an altered, expired or revoked grant shows nothing, and drafts are never shown when they were not asked for', async t => {
  const h = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  h.draft.enabled = true;
  h.user(null);
  const { value } = lib.signPreviewGrant();
  const [scope, expires, mac] = value.split('.');
  for (const bad of [`${scope}.${Number(expires) + 5000}.${mac}`, `${scope}.${Date.now() - 1000}.${mac}`, 'garbage']) {
    h.jar[GRANT_COOKIE] = { value: bad };
    assert.equal((await rootSite(h)).page.hero.title, 'LIVE HERO', `accepted ${bad}`);
  }
  h.jar[GRANT_COOKIE] = { value };
  process.env.PREVIEW_SECRET_TOKEN = OTHER_SECRET;
  assert.equal((await rootSite(h)).page.hero.title, 'LIVE HERO', 'a grant outlived the secret it was signed with');
  process.env.PREVIEW_SECRET_TOKEN = SECRET;
  const content = h.load('lib/server/content.ts');
  assert.equal((await content.getPublishedPage('home', false)).hero.title, 'LIVE HERO', 'drafts were shown to a request that did not ask for them');
});

test('each kind of content redirects to its page, and an unknown or object-prototype name lands on the home page', async t => {
  const h = await fixture(t);
  for (const [collection, slug, expected] of [
    ['pages', 'home', '/'], ['pages', 'about', '/about'], ['operations', 'tarkwa', '/operations/tarkwa'], ['reports', 'x', '/reports'],
    ['news', 'update', '/media/update'], ['sustainability', 'x', '/sustainability'], ['jobs', 'x', '/careers'], ['suppliers', 'x', '/suppliers'],
    ['unknown', 'x', '/'], ['constructor', 'x', '/'], ['__proto__', 'x', '/'], ['toString', 'x', '/'],
  ]) {
    assert.deepEqual(await preview(h, 'agency', `?collection=${collection}&slug=${slug}`), { redirectTo: expected }, `${collection}/${slug}`);
  }
});
