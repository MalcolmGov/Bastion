const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync, verify } = require('node:crypto');
const { createHarness } = require('./harness.cjs');
const { isolateEnvironment } = require('./auth-fixture.cjs');
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const ENV = { BASTION_GITHUB_APP_ID: '12345', BASTION_GITHUB_APP_PRIVATE_KEY: keys.privateKey.export({ type: 'pkcs8', format: 'pem' }), BASTION_GITHUB_APP_SLUG: 'bastion-test' };
async function fixture(t, configured = true) {
  const h = await createHarness();
  isolateEnvironment(t, configured ? { set: ENV } : { clear: Object.keys(ENV) });
  const previous = global.fetch;
  const calls = [];
  let unavailable = '';
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    assert.ok(url.startsWith('https://api.github.com/'));
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    if (unavailable && url.includes(unavailable)) return new Response('{}', { status: 403 });
    let data;
    if (url.endsWith('/installation')) data = { id: 55 };
    else if (url.endsWith('/access_tokens')) data = { token: 'secret-installation-token' };
    else if (url.includes('/branches/')) data = { name: 'main' };
    else if (url.includes('/commits?')) data = [{ sha: 'abcdef12345', commit: { message: 'Fix navigation', author: { date: '2026-10-04' } }, html_url: 'https://github.com/acme/website/commit/abc' }];
    else if (url.includes('/pulls?')) data = [{ number: 3, title: 'Fix', head: { ref: 'fix/nav' }, base: { ref: 'main' }, draft: true, html_url: 'https://attacker.example/' }];
    else if (url.includes('/actions/runs?')) data = { workflow_runs: [{ name: 'CI', head_sha: 'abcdef', updated_at: 'today', conclusion: 'failure', html_url: 'https://github.com/acme/website/actions/runs/1' }] };
    else if (url.includes('/statuses?')) data = [{ state: 'failure' }];
    else if (url.includes('/deployments?')) data = [{ id: 9, sha: 'abcdef', environment: 'production', created_at: 'today', url: 'https://api.github.com/repos/acme/website/deployments/9' }];
    else data = { id: 88, full_name: 'acme/website', default_branch: 'main' };
    return Response.json(data);
  };
  t.after(() => { global.fetch = previous; h.close(); });
  return { ...h, calls, unavailable: value => { unavailable = value; }, api: h.route('api/admin/github/operations') };
}
const agency = h => h.user({ id: 'agency', role: 'platform_admin', client_id: null });
const body = (revision = 0) => ({ repository: 'acme/website', branch: 'main', environment: 'production', expectedRevision: revision });
const request = (h, data = body(), site = 'site-a') => h.request(`/api/admin/github/operations?siteId=${site}`, data);

test('clients and anonymous visitors cannot inspect, link, or unlink GitHub repositories', async t => {
  const h = await fixture(t);
  for (const user of [{ role: 'content_editor', client_id: 'tenant-a' }, { role: 'platform_admin', client_id: 'tenant-a' }, null]) {
    h.user(user);
    assert.ok([401,403].includes((await h.api.GET(h.request('/api/admin/github/operations?siteId=site-a', null, null, 'GET'))).status));
    assert.ok([401,403].includes((await h.api.POST(request(h))).status));
    assert.ok([401,403].includes((await h.api.POST(request(h, { action: 'unlink', expectedRevision: 1 }))).status));
  }
  assert.equal(h.calls.length, 0);
});
test('unconfigured App is reported truthfully without discovering local CLI credentials', async t => {
  const h = await fixture(t, false); agency(h);
  const get = await h.api.GET(h.request('/api/admin/github/operations?siteId=site-a', null, null, 'GET'));
  assert.deepEqual(await get.json(), { link: null, app: { configured: false, installUrl: null } });
  assert.equal((await h.api.POST(request(h))).status, 503);
  assert.equal(h.calls.length, 0);
});
test('linking verifies installation and branch, scopes permissions, and records an atomic audit', async t => {
  const h = await fixture(t); agency(h);
  const res = await h.api.POST(request(h)); assert.equal(res.status, 200);
  const { link } = await res.json(); assert.equal(link.siteId, 'site-a'); assert.equal(link.revision, 1);
  const tokens = h.calls.filter(c => c.url.endsWith('/access_tokens'));
  assert.deepEqual(JSON.parse(tokens[0].options.body), { repositories: ['website'], permissions: { contents: 'read', pull_requests: 'read', actions: 'read', deployments: 'read' } });
  assert.equal((await h.db.execute('SELECT * FROM website_github_audit')).rows.length, 1);
  assert.equal((await h.db.execute("SELECT * FROM website_github_links WHERE site_id='site-b'")).rows.length, 0);
  assert.ok(!JSON.stringify(link).includes('token'));
});
test('stale saves and stale unlink attempts preserve the existing connection', async t => {
  const h = await fixture(t); agency(h); await h.api.POST(request(h));
  assert.equal((await h.api.POST(request(h))).status, 409);
  assert.equal((await h.api.POST(request(h, { action: 'unlink', expectedRevision: 2 }))).status, 409);
  assert.equal((await h.db.execute('SELECT * FROM website_github_links')).rows.length, 1);
  assert.equal((await h.db.execute('SELECT * FROM website_github_audit')).rows.length, 1);
});
test('unlink and relink never recycle a revision that a stale tab could use', async t => {
  const h = await fixture(t); agency(h); await h.api.POST(request(h));
  assert.equal((await h.api.POST(request(h, { action: 'unlink', expectedRevision: 1 }))).status, 200);
  const res = await h.api.POST(request(h)); assert.equal((await res.json()).link.revision, 2);
  assert.equal((await h.api.POST(request(h, body(1)))).status, 409);
});
test('verification failures never persist a new connection or fabricated GitHub status', async t => {
  const h = await fixture(t); agency(h); await h.load('lib/github/operations.ts').readLink('site-a'); h.unavailable('/branches/');
  assert.equal((await h.api.POST(request(h))).status, 503);
  assert.equal((await h.db.execute('SELECT * FROM website_github_links')).rows.length, 0);
});
test('missing sites and injected repository/branch paths are rejected before outbound calls', async t => {
  const h = await fixture(t); agency(h);
  assert.equal((await h.api.POST(request(h, body(), 'missing'))).status, 404);
  for (const repository of ['https://evil.test/a/b', 'acme/website?token=secret', 'acme/../website', 'acme/website#frag']) assert.equal((await h.api.POST(request(h, { ...body(), repository }))).status, 400);
  assert.equal(h.calls.length, 0);
  const { parseBranch } = h.load('lib/github/operations.ts');
  for (const branch of ['../secret', 'main?foo', '/main', 'main//secret']) assert.throws(() => parseBranch(branch));
});
test('JWT signatures and lifetimes are valid and bounded', async t => {
  const h = await fixture(t);
  const jwt = h.load('lib/github/operations.ts').appJwt();
  const [header, payload, signature] = jwt.split('.');
  assert.ok(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), keys.publicKey, Buffer.from(signature, 'base64url')));
  const claims = JSON.parse(Buffer.from(payload, 'base64url'));
  assert.equal(claims.iss, '12345'); assert.equal(claims.exp - claims.iat, 600);
});
test('snapshots show actual build and deployment failures and hide untrusted outbound links', async t => {
  const h = await fixture(t); agency(h); await h.api.POST(request(h));
  const res = await h.api.GET(h.request('/api/admin/github/operations?siteId=site-a', null, null, 'GET'));
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const data = await res.json();
  assert.equal(data.activity.builds[0].status, 'failure'); assert.equal(data.activity.deployments[0].status, 'failure');
  assert.equal(data.activity.pulls[0].url, ''); assert.ok(!JSON.stringify(data).includes('secret-installation-token'));
  const token = h.calls.filter(c => c.url.endsWith('/access_tokens')).at(-1);
  assert.deepEqual(JSON.parse(token.options.body).repository_ids, [88]);
});
test('partial permission failures are surfaced while other diagnostic sections remain available', async t => {
  const h = await fixture(t); agency(h); await h.api.POST(request(h)); h.unavailable('/actions/');
  const res = await h.api.GET(h.request('/api/admin/github/operations?siteId=site-a', null, null, 'GET'));
  const data = await res.json(); assert.equal(data.activity.builds.length, 0); assert.equal(data.activity.commits.length, 1);
  assert.match(data.warnings[0], /Builds unavailable/);
});
test('connection audit failure rolls back the entire mapping transaction', async t => {
  const h = await fixture(t); agency(h);
  await h.load('lib/github/operations.ts').readLink('site-a');
  await h.db.execute("CREATE TRIGGER reject_audit BEFORE INSERT ON website_github_audit BEGIN SELECT RAISE(ABORT, 'audit rejected'); END");
  assert.equal((await h.api.POST(request(h))).status, 500);
  assert.equal((await h.db.execute('SELECT * FROM website_github_links')).rows.length, 0);
});
test('legacy status endpoint never serializes saved GitHub credentials', async t => {
  const h = await fixture(t); agency(h);
  await h.load('lib/github/client.ts').ensureGitHubSchema();
  await h.db.execute("INSERT INTO developer_github_integrations(id,github_login,access_token,connected_at,last_used_at) VALUES('test','acme','do-not-expose-token','today','today')");
  const res = await h.route('api/admin/github/status').GET();
  assert.equal(res.status, 200); assert.ok(!(await res.text()).includes('do-not-expose-token'));
});
test('revoked installation reports unavailable but still permits audited disconnect', async t => {
  const h = await fixture(t); agency(h); await h.api.POST(request(h)); h.unavailable('/access_tokens');
  const res = await h.api.GET(h.request('/api/admin/github/operations?siteId=site-a', null, null, 'GET'));
  const data = await res.json(); assert.equal(data.link.repository, 'acme/website'); assert.match(data.connectionError, /restricted/); assert.equal(data.activity, undefined);
  assert.equal((await h.api.POST(request(h, { action: 'unlink', expectedRevision: 1 }))).status, 200);
});
test('cross-origin mapping writes are rejected before verification or SQL changes', async t => {
  const h = await fixture(t); agency(h);
  const req = request(h); req.headers.set('origin', 'https://attacker.example');
  assert.equal((await h.api.POST(req)).status, 403); assert.equal(h.calls.length, 0);
});
