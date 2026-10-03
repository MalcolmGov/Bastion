const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createHarness } = require('./harness.cjs');

async function fixture(t, { settings = null, env = {} } = {}) {
  const h = await createHarness();
  const saved = {
    fetch: globalThis.fetch,
    BASTION_WEBHOOK_URL: process.env.BASTION_WEBHOOK_URL,
    BASTION_WEBHOOK_SECRET: process.env.BASTION_WEBHOOK_SECRET,
  };
  delete process.env.BASTION_WEBHOOK_URL;
  delete process.env.BASTION_WEBHOOK_SECRET;
  Object.assign(process.env, env);
  t.after(() => {
    globalThis.fetch = saved.fetch;
    for (const key of ['BASTION_WEBHOOK_URL', 'BASTION_WEBHOOK_SECRET']) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
    h.close();
  });
  await h.db.execute('ALTER TABLE websites ADD COLUMN settings_json TEXT');
  await h.db.execute(`CREATE TABLE webhook_deliveries(id TEXT PRIMARY KEY, site_id TEXT, event TEXT, target_url TEXT, payload_json TEXT, response_status INTEGER, response_body TEXT, latency_ms INTEGER, status TEXT, created_at TEXT)`);
  if (settings) await h.db.execute({ sql: "UPDATE websites SET settings_json = ? WHERE id = 'site-a'", args: [typeof settings === 'string' ? settings : JSON.stringify(settings)] });
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, text: async () => 'ok' }; };
  const { dispatchContentWebhook } = h.load('lib/webhooks/dispatcher.ts');
  const send = () => dispatchContentWebhook({ event: 'content.published', collection: 'news', id: 'n1', siteId: 'site-a', timestamp: '2026-10-03T07:05:00.000Z' });
  return { calls, send };
}

test('webhook delivery refuses to send when no signing secret is configured', async t => {
  const { calls, send } = await fixture(t, { settings: { headlessIntegration: { webhookUrl: 'https://client.example/hook', webhookSecret: '' } } });
  const result = await send();
  assert.equal(calls.length, 0, 'an unsigned-by-a-real-secret request must not be sent');
  assert.equal(result.success, false);
  assert.match(String(result.error), /secret/i);
});

test('webhook delivery refuses to send with an env URL but no secret anywhere', async t => {
  const { calls, send } = await fixture(t, { env: { BASTION_WEBHOOK_URL: 'https://client.example/hook' } });
  const result = await send();
  assert.equal(calls.length, 0);
  assert.equal(result.success, false);
});

test('webhook delivery signs the exact body with the site secret (HMAC-SHA256)', async t => {
  const secret = 'site-secret-' + crypto.randomBytes(8).toString('hex');
  const { calls, send } = await fixture(t, { settings: { headlessIntegration: { webhookUrl: 'https://client.example/hook', webhookSecret: secret } } });
  const result = await send();
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url, 'https://client.example/hook');
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(init.body).digest('hex');
  assert.equal(init.headers['x-bastion-signature'], expected);
  assert.equal(init.headers['x-bastion-event'], 'content.published');
});

test('webhook delivery still works with env-configured URL and secret', async t => {
  const secret = 'env-secret-' + crypto.randomBytes(8).toString('hex');
  const { calls, send } = await fixture(t, { env: { BASTION_WEBHOOK_URL: 'https://client.example/env-hook', BASTION_WEBHOOK_SECRET: secret } });
  const result = await send();
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(calls[0].init.body).digest('hex');
  assert.equal(calls[0].init.headers['x-bastion-signature'], expected);
});

test('webhook delivery uses site settings in preference to env configuration', async t => {
  const siteSecret = 'site-secret-' + crypto.randomBytes(8).toString('hex');
  const { calls, send } = await fixture(t, {
    settings: { headlessIntegration: { webhookUrl: 'https://client.example/site-hook', webhookSecret: siteSecret } },
    env: { BASTION_WEBHOOK_URL: 'https://client.example/env-hook', BASTION_WEBHOOK_SECRET: 'env-secret-should-not-be-used' },
  });
  const result = await send();
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://client.example/site-hook');
  const expected = 'sha256=' + crypto.createHmac('sha256', siteSecret).update(calls[0].init.body).digest('hex');
  assert.equal(calls[0].init.headers['x-bastion-signature'], expected);
});

test('webhook delivery ignores malformed site settings and falls back to env configuration', async t => {
  const realWarn = console.warn;
  console.warn = () => {};
  t.after(() => { console.warn = realWarn; });
  const secret = 'env-secret-' + crypto.randomBytes(8).toString('hex');
  const { calls, send } = await fixture(t, { settings: '{not valid json', env: { BASTION_WEBHOOK_URL: 'https://client.example/env-hook', BASTION_WEBHOOK_SECRET: secret } });
  const result = await send();
  assert.equal(result.success, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://client.example/env-hook');
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(calls[0].init.body).digest('hex');
  assert.equal(calls[0].init.headers['x-bastion-signature'], expected);
});

test('webhook delivery is skipped quietly when no URL is configured', async t => {
  const { calls, send } = await fixture(t);
  const result = await send();
  assert.equal(calls.length, 0);
  assert.equal(result.success, true);
});
