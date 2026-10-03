const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');

// The demo values that shipped in the source and in earlier versions of the Settings page. Anyone can read them.
const PUBLIC_DEMO = ['whsec_bastion_goldfields_2026', 'prev_sec_goldfields_draft_2026'];
const AGENCY = { id: 'agency-1', name: 'Agency One', role: 'platform_admin', client_id: null };
const ROUTE = 'api/admin/settings/headless';
const strong = () => 'whsec_' + crypto.randomBytes(24).toString('hex');

async function fixture(t, { settings = null, env = {} } = {}) {
  const h = await createHarness();
  const saved = { fetch: globalThis.fetch, url: process.env.BASTION_WEBHOOK_URL, secret: process.env.BASTION_WEBHOOK_SECRET };
  const realWarn = console.warn, realError = console.error, realLog = console.log;
  delete process.env.BASTION_WEBHOOK_URL;
  delete process.env.BASTION_WEBHOOK_SECRET;
  Object.assign(process.env, env);
  console.warn = () => {};
  console.error = () => {};
  console.log = () => {};
  t.after(() => {
    globalThis.fetch = saved.fetch;
    if (saved.url === undefined) delete process.env.BASTION_WEBHOOK_URL; else process.env.BASTION_WEBHOOK_URL = saved.url;
    if (saved.secret === undefined) delete process.env.BASTION_WEBHOOK_SECRET; else process.env.BASTION_WEBHOOK_SECRET = saved.secret;
    console.warn = realWarn;
    console.error = realError;
    console.log = realLog;
    h.close();
  });
  await h.db.execute('ALTER TABLE websites ADD COLUMN settings_json TEXT');
  await h.db.execute('ALTER TABLE websites ADD COLUMN updated_at TEXT');
  await h.db.execute('ALTER TABLE websites ADD COLUMN name TEXT');
  await h.db.execute('CREATE TABLE webhook_deliveries(id TEXT PRIMARY KEY, site_id TEXT, event TEXT, target_url TEXT, payload_json TEXT, response_status INTEGER, response_body TEXT, latency_ms INTEGER, status TEXT, created_at TEXT)');
  if (settings) await h.db.execute({ sql: "UPDATE websites SET settings_json = ? WHERE id = 'site-a'", args: [JSON.stringify({ headlessIntegration: settings })] });
  h.user(AGENCY);
  return h;
}

const stored = async h => JSON.parse((await h.db.execute("SELECT settings_json FROM websites WHERE id = 'site-a'")).rows[0].settings_json || '{}').headlessIntegration;

async function save(h, headless, user = AGENCY) {
  h.user(user);
  const response = await h.route(ROUTE).POST(h.request(`/${ROUTE}`, { action: 'save', siteId: 'site-a', headless }));
  return { status: response.status, body: await response.json() };
}

async function read(h, user = AGENCY) {
  h.user(user);
  const response = await h.route(ROUTE).GET(h.request(`/${ROUTE}?siteId=site-a`, undefined, null, 'GET'));
  return { status: response.status, body: await response.json() };
}

const goodSettings = (extra = {}) => ({ apiKey: '', webhookUrl: 'https://client.example/hook', webhookSecret: strong(), previewUrlPattern: '', previewSecret: '', ...extra });

// ---- saving ----

test('saving a public demo value as the webhook or preview secret is refused and nothing is stored', async t => {
  const h = await fixture(t);
  for (const secret of PUBLIC_DEMO) {
    for (const field of ['webhookSecret', 'previewSecret']) {
      const result = await save(h, goodSettings({ [field]: secret }));
      assert.equal(result.status, 400, `${field} accepted the public demo value ${secret}`);
      assert.match(String(result.body.error), /public|demo/i);
    }
  }
  assert.equal(await stored(h), undefined, 'a refused save still wrote settings');
});

test('a new secret shorter than 16 characters is refused, a strong one is stored', async t => {
  const h = await fixture(t);
  const weak = await save(h, goodSettings({ webhookSecret: 'tooshort' }));
  assert.equal(weak.status, 400);
  assert.match(String(weak.body.error), /16/);
  const secret = strong();
  const ok = await save(h, goodSettings({ webhookSecret: secret }));
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal((await stored(h)).webhookSecret, secret);
});

test('leaving the secrets empty is allowed and means not configured', async t => {
  const h = await fixture(t);
  const result = await save(h, goodSettings({ webhookSecret: '', previewSecret: '' }));
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal((await stored(h)).webhookSecret, '');
});

test('re-saving other fields does not force a rotation of an existing shorter secret', async t => {
  const h = await fixture(t, { settings: { webhookUrl: 'https://old.example/hook', webhookSecret: 'legacy-secret-1', previewSecret: 'legacy-prev-1' } });
  const result = await save(h, goodSettings({ webhookUrl: 'https://new.example/hook', webhookSecret: 'legacy-secret-1', previewSecret: 'legacy-prev-1' }));
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal((await stored(h)).webhookUrl, 'https://new.example/hook');
  const changed = await save(h, goodSettings({ webhookSecret: 'legacy-secret-2' }));
  assert.equal(changed.status, 400, 'a new short secret was accepted');
});

test('only agency staff can read or change these settings', async t => {
  const h = await fixture(t);
  const tenant = { id: 'editor-a', name: 'Editor A', role: 'content_editor', client_id: 'tenant-a' };
  assert.notEqual((await save(h, goodSettings(), tenant)).status, 200);
  assert.notEqual((await read(h, tenant)).status, 200);
  assert.equal(await stored(h), undefined);
});

// ---- reading ----

test('a previously saved public demo secret is never returned as if it were a real setting', async t => {
  const h = await fixture(t, { settings: { webhookUrl: 'https://client.example/hook', webhookSecret: PUBLIC_DEMO[0], previewSecret: PUBLIC_DEMO[1], apiKey: 'key-1' } });
  const { status, body } = await read(h);
  assert.equal(status, 200);
  assert.equal(body.headless.webhookSecret, '');
  assert.equal(body.headless.previewSecret, '');
  assert.deepEqual([...body.unsafeSecrets].sort(), ['previewSecret', 'webhookSecret']);
  assert.equal(body.headless.apiKey, 'key-1', 'unrelated settings were changed');
  assert.ok(!JSON.stringify(body).includes(PUBLIC_DEMO[0]) && !JSON.stringify(body).includes(PUBLIC_DEMO[1]));
});

test('real secrets are returned unchanged and nothing is flagged', async t => {
  const secret = strong();
  const h = await fixture(t, { settings: { webhookUrl: 'https://client.example/hook', webhookSecret: secret } });
  const { body } = await read(h);
  assert.equal(body.headless.webhookSecret, secret);
  assert.deepEqual(body.unsafeSecrets, []);
});

test('a site with no settings gets empty fields, not defaults', async t => {
  const h = await fixture(t);
  const { body } = await read(h);
  for (const field of ['webhookUrl', 'webhookSecret', 'previewUrlPattern', 'previewSecret']) assert.equal(body.headless[field], '');
});

// ---- delivery ----

async function dispatcher(h) {
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, text: async () => 'ok' }; };
  const { dispatchContentWebhook } = h.load('lib/webhooks/dispatcher.ts');
  const send = () => dispatchContentWebhook({ event: 'content.published', collection: 'news', id: 'n1', siteId: 'site-a', timestamp: '2026-10-03T07:05:00.000Z' });
  return { calls, send };
}

test('delivery treats a stored public demo secret as not configured and sends nothing', async t => {
  const h = await fixture(t, { settings: { webhookUrl: 'https://client.example/hook', webhookSecret: PUBLIC_DEMO[0] } });
  const { calls, send } = await dispatcher(h);
  const result = await send();
  assert.equal(calls.length, 0, 'a delivery was signed with a secret that is public in the source');
  assert.equal(result.success, false);
  assert.match(String(result.error), /secret/i);
});

test('delivery refuses an environment secret that is a public demo value too', async t => {
  const h = await fixture(t, { env: { BASTION_WEBHOOK_URL: 'https://client.example/hook', BASTION_WEBHOOK_SECRET: PUBLIC_DEMO[0] } });
  const { calls, send } = await dispatcher(h);
  assert.equal((await send()).success, false);
  assert.equal(calls.length, 0);
});

test('a stored public demo secret falls back to a real environment secret, never to the demo value', async t => {
  const envSecret = 'env-secret-' + crypto.randomBytes(12).toString('hex');
  const h = await fixture(t, { settings: { webhookUrl: 'https://client.example/hook', webhookSecret: PUBLIC_DEMO[0] }, env: { BASTION_WEBHOOK_SECRET: envSecret } });
  const { calls, send } = await dispatcher(h);
  assert.equal((await send()).success, true);
  assert.equal(calls.length, 1);
  const body = calls[0].init.body;
  assert.equal(calls[0].init.headers['x-bastion-signature'], 'sha256=' + crypto.createHmac('sha256', envSecret).update(body).digest('hex'));
});

test('delivery still signs with a real site secret, including a short legacy one', async t => {
  for (const secret of [strong(), 'legacy-secret-1']) {
    const h = await fixture(t, { settings: { webhookUrl: 'https://client.example/hook', webhookSecret: secret } });
    const { calls, send } = await dispatcher(h);
    assert.equal((await send()).success, true);
    assert.equal(calls[0].init.headers['x-bastion-signature'], 'sha256=' + crypto.createHmac('sha256', secret).update(calls[0].init.body).digest('hex'));
  }
});

// ---- audit and source ----

test('saving is audited under the real user, names the fields changed and never records a secret', async t => {
  const h = await fixture(t);
  const secret = strong();
  const result = await save(h, goodSettings({ webhookSecret: secret, previewSecret: strong() }));
  assert.equal(result.status, 200);
  const audit = (await h.db.execute("SELECT * FROM audit_log WHERE action = 'headless_settings_update'")).rows;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, 'agency-1');
  assert.equal(audit[0].actor_name, 'Agency One');
  const details = JSON.parse(audit[0].details_json);
  assert.ok(details.changed.includes('webhookSecret') && details.changed.includes('webhookUrl'));
  assert.ok(!JSON.stringify(audit).includes(secret), 'a secret was written to the audit log');
  const refused = await save(h, goodSettings({ webhookSecret: PUBLIC_DEMO[0] }));
  assert.equal(refused.status, 400);
  assert.equal((await h.db.execute("SELECT COUNT(*) AS c FROM audit_log WHERE action = 'headless_settings_update'")).rows[0].c, 1, 'a refused save was audited as an update');
});

test('the Settings page ships no public demo secret or another tenant\'s endpoint as a default', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../src/app/admin/settings/page.tsx'), 'utf8');
  for (const secret of PUBLIC_DEMO) assert.ok(!source.includes(secret), `the Settings page still contains ${secret}`);
  assert.ok(!/goldfields\.com\/api\/webhooks/.test(source), 'the Settings page pre-fills another tenant\'s webhook URL');
  assert.ok(!/preview\.goldfields\.com/.test(source), 'the Settings page pre-fills another tenant\'s preview URL');
});
