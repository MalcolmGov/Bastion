const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createHarness } = require('./harness.cjs');

const GLOBAL_SECRET = 'global-preview-secret-0123456789';
const SECRET_A = 'site-a-preview-secret-aaaaaaaaaaaa';
const SECRET_B = 'site-b-preview-secret-bbbbbbbbbbbb';
const REFUSED = 'Invalid preview token';
const SECRET_MARKERS = ['SECRET DRAFT HERO', 'SECRET Q3 results'];
const FLAGSHIP = 'client_goldfields';
const USERS = {
  agency: { id: 'agency-1', name: 'Agency', role: 'platform_admin', client_id: null },
  tenantAEditor: { id: 'a-editor', name: 'A Editor', role: 'content_editor', client_id: 'tenant-a' },
  tenantBEditor: { id: 'b-editor', name: 'B Editor', role: 'content_editor', client_id: 'tenant-b' },
};

const settings = secret => JSON.stringify({ headlessIntegration: { previewSecret: secret } });

async function fixture(t) {
  const h = await createHarness();
  const saved = process.env.PREVIEW_SECRET_TOKEN;
  process.env.PREVIEW_SECRET_TOKEN = GLOBAL_SECRET;
  t.after(() => {
    if (saved === undefined) delete process.env.PREVIEW_SECRET_TOKEN; else process.env.PREVIEW_SECRET_TOKEN = saved;
    h.close();
  });
  await h.db.executeMultiple(`
    ALTER TABLE audit_log ADD COLUMN ip_address TEXT;
    ALTER TABLE audit_log ADD COLUMN correlation_id TEXT;
    ALTER TABLE websites ADD COLUMN settings_json TEXT;
    INSERT INTO websites(id,client_id,slug,primary_domain,status) VALUES('site-short','tenant-a','short','short.example','published'),('site-demo','tenant-a','demo','demo.example','published');
  `);
  const setSecret = (id, secret) => h.db.execute({ sql: 'UPDATE websites SET settings_json = ? WHERE id = ?', args: [settings(secret), id] });
  await setSecret('site-a', SECRET_A);
  await setSecret('site-b', SECRET_B);
  await setSecret('site-short', 'tooshort');
  await setSecret('site-demo', 'prev_sec_goldfields_draft_2026'); // a public demo value from an earlier version of the Settings page
  // site-a2 has no settings at all.
  await h.db.executeMultiple(`
    INSERT INTO content_records VALUES('rep-live','reports','live-report','Live report','published','rev-rep-live',NULL,NULL,'${FLAGSHIP}','2026-09-01','2026-09-02');
    INSERT INTO revisions VALUES('rev-rep-live','rep-live',1,'{"note":"live body"}','h3','author-a','2026-09-01','published',NULL);
    INSERT INTO content_records VALUES('rep-draft','reports','draft-report','SECRET Q3 results','draft',NULL,'rev-rep-draft',NULL,'${FLAGSHIP}','2026-09-03','2026-09-03');
    INSERT INTO revisions VALUES('rev-rep-draft','rep-draft',1,'{"note":"SECRET DRAFT BODY"}','h4','author-a','2026-09-03','draft',NULL);
  `);
  return { h, setSecret };
}

async function preview(h, user, query = '', ip = '203.0.113.7') {
  h.user(user ? USERS[user] : null);
  const request = h.request(`/api/preview${query}`, undefined, null, 'GET');
  request.headers.set('x-forwarded-for', ip);
  try {
    const response = await h.route('api/preview').GET(request);
    return { status: response.status, body: await response.text() };
  } catch (error) {
    if (error.redirectTo) return { redirectTo: error.redirectTo };
    throw error;
  }
}

const audit = async (h, action) => (await h.db.execute({ sql: 'SELECT * FROM audit_log WHERE action = ? ORDER BY rowid', args: [action] })).rows;
const cookieFor = (h, siteId) => h.jar[`bastion_preview_site_${siteId}`];
const siteRow = (id, clientId, secret) => ({ id, client_id: clientId, settings_json: secret === undefined ? null : settings(secret) });

// ---- the route ----

test('a site\'s own secret switches draft mode on for that site: a scoped grant cookie, a redirect to the site, an audit record', async t => {
  const { h } = await fixture(t);
  assert.deepEqual(await preview(h, null, `?site=a&secret=${SECRET_A}&slug=about`), { redirectTo: '/sites/a/about' });
  assert.equal(h.draft.enabled, true);
  const cookie = cookieFor(h, 'site-a');
  assert.ok(cookie, 'no site grant was issued');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, 'lax');
  assert.equal(cookie.options.path, '/');
  assert.ok(cookie.options.maxAge > 0 && cookie.options.maxAge <= 12 * 3600);
  assert.ok(!cookie.value.includes(SECRET_A), 'the secret is inside the cookie');
  assert.equal(h.jar.bastion_preview_grant, undefined, 'a flagship grant was issued for a site secret');
  const rows = await audit(h, 'PREVIEW_ENABLED');
  assert.equal(rows.length, 1);
  const details = JSON.parse(rows[0].details_json);
  assert.equal(details.via, 'site_secret');
  assert.equal(details.site, 'site-a');
  assert.equal(rows[0].ip_address, '203.0.113.7');
  assert.ok(!JSON.stringify(rows).includes(SECRET_A), 'the secret was written to the audit log');
});

test('without a page, or for the home page, the redirect is the site itself', async t => {
  const { h } = await fixture(t);
  assert.deepEqual(await preview(h, null, `?site=a&secret=${SECRET_A}`), { redirectTo: '/sites/a' });
  assert.deepEqual(await preview(h, null, `?site=a&secret=${SECRET_A}&slug=home`), { redirectTo: '/sites/a' });
});

test('one site\'s secret does not open another site, the global secret does not open any site, and a site secret does not open the root site', async t => {
  const { h } = await fixture(t);
  for (const query of [`?site=b&secret=${SECRET_A}`, `?site=a&secret=${SECRET_B}`, `?site=a&secret=${GLOBAL_SECRET}`, `?site=b&secret=${GLOBAL_SECRET}`]) {
    const result = await preview(h, null, query);
    assert.equal(result.status, 401, query);
    assert.equal(result.body, REFUSED);
  }
  assert.equal(h.draft.enabled, false);
  assert.equal(h.jar.bastion_preview_site_site_a, undefined);
  // No site named: the secret has to be the global one, so a site secret opens nothing.
  assert.equal((await preview(h, null, `?secret=${SECRET_A}&collection=reports`)).status, 401);
  assert.equal(h.draft.enabled, false);
});

test('an unknown site, a site with no secret, a weak secret and a public demo value are all refused the same way, and audited with the reason', async t => {
  const { h } = await fixture(t);
  const cases = [
    ['unknown_site', '?site=nosuchsite&secret=whatever-whatever-whatever-1'],
    ['no_site_secret', '?site=a2&secret=whatever-whatever-whatever-2'],
    ['no_site_secret', '?site=short&secret=tooshort'],
    ['no_site_secret', '?site=demo&secret=prev_sec_goldfields_draft_2026'],
    ['bad_site_secret', `?site=a&secret=${'x'.repeat(SECRET_A.length)}`],
    ['bad_site_secret', '?site=a'],
    ['unknown_site', '?site=..%2Fadmin&secret=whatever-whatever-whatever-3'],
  ];
  for (const [, query] of cases) {
    const result = await preview(h, null, query);
    assert.equal(result.status, 401, query);
    assert.equal(result.body, REFUSED, 'the refusal gives away whether the site exists or has a secret');
  }
  assert.equal(h.draft.enabled, false);
  assert.deepEqual(h.jar, {});
  const reasons = (await audit(h, 'PREVIEW_DENIED')).map(r => JSON.parse(r.details_json).reason);
  assert.deepEqual(reasons, cases.map(([reason]) => reason));
});

test('a signed-in person is not let in by naming a site: the site flow needs the secret', async t => {
  const { h } = await fixture(t);
  for (const user of ['agency', 'tenantAEditor']) {
    assert.equal((await preview(h, user, '?site=a')).status, 401, user);
  }
  assert.equal(h.draft.enabled, false);
});

test('guessing a site\'s secret is rate limited with the same limit as the root secret, and the correct secret is limited too', async t => {
  const { h } = await fixture(t);
  for (let attempt = 1; attempt <= 10; attempt++) {
    assert.equal((await preview(h, null, `?site=a&secret=wrong-guess-number-${attempt}-xxxxxxx`, '198.51.100.5')).status, 401, `attempt ${attempt}`);
  }
  assert.equal((await preview(h, null, `?site=a&secret=${SECRET_A}`, '198.51.100.5')).status, 429);
  assert.equal(h.draft.enabled, false);
  assert.deepEqual(await preview(h, null, `?site=a&secret=${SECRET_A}`, '198.51.100.99'), { redirectTo: '/sites/a' });
  // Probing for site names is a guess too, so it counts against the same limit.
  for (let attempt = 1; attempt <= 10; attempt++) await preview(h, null, `?site=probe${attempt}`, '198.51.100.7');
  assert.equal((await preview(h, null, '?site=another', '198.51.100.7')).status, 429);
});

test('the page slug cannot send the browser to another site, and is only checked once the secret is right', async t => {
  const { h } = await fixture(t);
  for (const slug of ['/evil.example', '//evil.example', 'https://evil.example', '..%2Fx', 'a/b']) {
    const result = await preview(h, null, `?site=a&secret=${SECRET_A}&slug=${encodeURIComponent(slug)}`);
    assert.equal(result.status, 400, `slug ${slug}`);
  }
  assert.equal(h.draft.enabled, false);
  assert.equal((await preview(h, null, `?site=a&secret=wrong-wrong-wrong-wrong-1&slug=${encodeURIComponent('//evil.example')}`)).status, 401, 'a bad slug answered before the secret was checked');
});

test('the root-site preview is unchanged: the global secret still opens it, with its own grant', async t => {
  const { h } = await fixture(t);
  assert.deepEqual(await preview(h, null, `?secret=${GLOBAL_SECRET}&collection=reports`), { redirectTo: '/reports' });
  assert.ok(h.jar.bastion_preview_grant);
  assert.equal(cookieFor(h, 'site-a'), undefined);
});

// ---- the grant ----

test('a site grant is valid only for its site, only until it expires, and only while the site\'s secret is unchanged', async t => {
  const { h, setSecret } = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  const site = siteRow('site-a', 'tenant-a', SECRET_A);
  const { name, value } = lib.signSiteGrant(site);
  assert.equal(name, 'bastion_preview_site_site-a');
  assert.equal(lib.verifySiteGrant(site, value), true);

  const [expires, mac] = value.split('.');
  assert.equal(lib.verifySiteGrant(site, `${Number(expires) + 1000}.${mac}`), false, 'an altered expiry was accepted');
  assert.equal(lib.verifySiteGrant(site, `${expires}.${'0'.repeat(mac.length)}`), false);
  assert.equal(lib.verifySiteGrant(site, value, Number(expires) + 1), false, 'an expired grant was accepted');
  for (const junk of [undefined, null, '', 'abc', 'a.b.c', `notanumber.${mac}`]) assert.equal(lib.verifySiteGrant(site, junk), false, String(junk));
  const farFuture = Date.now() + 365 * 24 * 3600 * 1000;
  const forged = `${farFuture}.${crypto.createHmac('sha256', SECRET_A).update(`site.site-a.${farFuture}`).digest('hex')}`;
  assert.equal(lib.verifySiteGrant(site, forged), false, 'a grant beyond the maximum lifetime was accepted');

  assert.equal(lib.verifySiteGrant(siteRow('site-b', 'tenant-b', SECRET_B), value), false, 'a grant opened another site');
  assert.equal(lib.verifySiteGrant(siteRow('site-b', 'tenant-b', SECRET_A), value), false, 'a grant was accepted for another site that happened to share the secret');
  assert.equal(lib.verifySiteGrant(siteRow('site-a', 'tenant-a', 'a-rotated-secret-0123456789'), value), false, 'rotating the secret did not revoke the grant');
  assert.equal(lib.verifySiteGrant(siteRow('site-a', 'tenant-a', ''), value), false, 'clearing the secret did not revoke the grant');
  assert.equal(lib.verifySiteGrant(siteRow('site-a', 'tenant-a', 'short'), value), false);
  assert.equal(lib.verifySiteGrant({ id: 'site-a', client_id: 'tenant-a' }, value), false, 'a site with no settings accepted a grant');
  assert.equal(lib.signSiteGrant(siteRow('site-a2', 'tenant-a')), null, 'a grant was signed for a site with no secret');
  assert.equal(lib.signSiteGrant(siteRow('site-short', 'tenant-a', 'tooshort')), null);
  assert.equal(lib.signSiteGrant(siteRow('site-demo', 'tenant-a', 'prev_sec_goldfields_draft_2026')), null);
  await setSecret('site-a', SECRET_A);
});

test('a site id that could not be a safe cookie name gets no grant', async t => {
  const { h } = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  for (const id of ['a b', 'a;b', 'a=b', '', 'x'.repeat(200), 'é']) assert.equal(lib.signSiteGrant(siteRow(id, 'tenant-a', SECRET_A)), null, JSON.stringify(id));
});

// ---- what a site shows ----

test('a site shows drafts to the holder of its grant, to entitled staff, and to nobody else', async t => {
  const { h } = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  const a = siteRow('site-a', 'tenant-a', SECRET_A);
  const b = siteRow('site-b', 'tenant-b', SECRET_B);
  const active = async (site, { user = null, draft = true, cookies = {} } = {}) => {
    h.draft.enabled = draft;
    h.user(user ? USERS[user] : null);
    for (const key of Object.keys(h.jar)) delete h.jar[key];
    Object.assign(h.jar, Object.fromEntries(Object.entries(cookies).map(([k, v]) => [k, { value: v }])));
    return lib.draftPreviewActive(site);
  };
  const grantA = lib.signSiteGrant(a);
  const grantB = lib.signSiteGrant(b);

  assert.equal(await active(a), false, 'a cookie-only visitor saw drafts');
  assert.equal(await active(a, { cookies: { [grantA.name]: grantA.value } }), true, 'the grant holder did not see their site\'s drafts');
  assert.equal(await active(a, { cookies: { [grantA.name]: grantA.value }, draft: false }), false, 'drafts were shown with draft mode off');
  assert.equal(await active(b, { cookies: { [grantA.name]: grantA.value } }), false, 'a grant for one site opened another');
  assert.equal(await active(b, { cookies: { [grantB.name]: grantA.value } }), false, 'a grant copied under another site\'s cookie name opened it');
  assert.equal(await active(a, { cookies: { [grantA.name]: 'garbage' } }), false);
  assert.equal(await active(a, { user: 'tenantAEditor' }), true, 'a client lost the preview of its own site');
  assert.equal(await active(a, { user: 'agency' }), true);
  assert.equal(await active(a, { user: 'tenantBEditor' }), false, 'another client\'s staff saw drafts');
  // The secret was rotated in Settings: the same cookie no longer works.
  const rotated = siteRow('site-a', 'tenant-a', 'a-rotated-secret-0123456789');
  assert.equal(await active(rotated, { cookies: { [grantA.name]: grantA.value } }), false, 'a grant outlived a change of the site\'s secret');
});

test('holding a site\'s grant, even with draft mode on, shows nothing extra on the root site', async t => {
  const { h } = await fixture(t);
  const lib = h.load('lib/auth/draftPreview.ts');
  const content = h.load('lib/server/content.ts');
  h.draft.enabled = true;
  h.user(null);
  const grant = lib.signSiteGrant(siteRow('site-a', 'tenant-a', SECRET_A));
  h.jar[grant.name] = { value: grant.value };
  const reports = await content.getPublishedCollection('reports', true);
  const text = JSON.stringify(reports);
  assert.deepEqual(SECRET_MARKERS.filter(m => text.includes(m)), [], 'a site grant showed the root site\'s drafts');
  assert.deepEqual(reports.map(r => r.title), ['Live report']);
});

test('the site pages hand the whole site row to the check, so its secret and owner are what decide', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  for (const file of ['src/app/sites/[siteSlug]/page.tsx', 'src/app/sites/[siteSlug]/[pageSlug]/page.tsx']) {
    const source = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
    assert.ok(/draftPreviewActive\(\s*siteRow\s*\)/.test(source), `${file} does not pass the site row to draftPreviewActive`);
  }
});
