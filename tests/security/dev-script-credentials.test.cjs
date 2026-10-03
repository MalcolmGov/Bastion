const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');

const root = path.resolve(__dirname, '../..');
// Passwords that were written into this repository. Anyone who has read the source knows them.
const PUBLISHED = ['Bastion2026!', 'GoldFields2026!'];
const SOURCE = /\.(ts|mjs|cjs|js|py|html?)$/;

function filesIn(dir, pattern = SOURCE) {
  const base = path.join(root, dir);
  return fs.readdirSync(base).filter(file => pattern.test(file) && fs.statSync(path.join(base, file)).isFile()).map(file => path.join(dir, file));
}

// Every place a dev script, a root-level check or a browser test can sign in from.
const SCRIPT_FILES = [...filesIn('scripts'), ...filesIn('scripts/lib'), ...filesIn('tests/e2e'), ...filesIn('public/proposal'), ...filesIn('.', /^verify-.*\.mjs$/)];

test('no dev script, E2E test or published proposal page carries a published password', () => {
  const offenders = [];
  for (const file of SCRIPT_FILES) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const password of PUBLISHED) if (source.includes(password)) offenders.push(`${file}: ${password}`);
  }
  assert.deepEqual(offenders, []);
});

test('no script types a literal into a password field or sends one to the login API', () => {
  const typed = /(?:type|name)="password"\][^,\n]*,\s*['"`]/;
  const sent = line => /password\s*:\s*['"`][^'"`$]/.test(line) && !/nonexistent@/.test(line); // a probe for an unknown user is not a credential
  const offenders = [];
  for (const file of SCRIPT_FILES.filter(f => /\.(ts|mjs|cjs|js)$/.test(f))) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    if (typed.test(source)) offenders.push(`${file}: types a literal password`);
    if (/auth\/login/.test(source) && source.split('\n').some(sent)) offenders.push(`${file}: sends a literal password`);
  }
  assert.deepEqual(offenders, []);
});

// ---- the shared helper ----

async function helper(t, env = {}) {
  const h = await createHarness();
  const saved = {};
  for (const key of ['E2E_AGENCY_EMAIL', 'E2E_AGENCY_PASSWORD', 'E2E_CLIENT_EMAIL', 'E2E_CLIENT_PASSWORD']) { saved[key] = process.env[key]; delete process.env[key]; }
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    h.close();
  });
  return h.load('../scripts/lib/devLogin.ts');
}

function fakePage() {
  const calls = [];
  const page = {
    calls,
    goto: async (url, options) => calls.push(['goto', url, options]),
    type: async (selector, text, options) => calls.push(['type', selector, text, options]),
    click: async selector => calls.push(['click', selector]),
    waitForNavigation: async options => calls.push(['waitForNavigation', options]),
  };
  return page;
}

test('credentials come from the environment, and a missing password says which variable to set', async t => {
  const lib = await helper(t);
  assert.throws(() => lib.devCredentials('agency'), /E2E_AGENCY_PASSWORD/);
  assert.throws(() => lib.devCredentials('client'), /E2E_CLIENT_PASSWORD/);
  process.env.E2E_AGENCY_PASSWORD = 'agency-pass-from-env';
  process.env.E2E_CLIENT_PASSWORD = 'client-pass-from-env';
  assert.deepEqual({ ...lib.devCredentials('agency') }, { email: 'malcolm@movedigital.africa', password: 'agency-pass-from-env' });
  assert.deepEqual({ ...lib.devCredentials('client') }, { email: 'admin@goldfields.com', password: 'client-pass-from-env' });
  process.env.E2E_CLIENT_EMAIL = 'someone@example.com';
  assert.equal(lib.devCredentials('client').email, 'someone@example.com');
});

test('an empty password variable is treated as not set', async t => {
  const lib = await helper(t, { E2E_AGENCY_PASSWORD: '' });
  assert.throws(() => lib.devCredentials('agency'), /E2E_AGENCY_PASSWORD/);
});

test('the form login opens the sign-in page, types the credentials, submits and waits for the redirect', async t => {
  const lib = await helper(t, { E2E_CLIENT_PASSWORD: 'client-pass-from-env' });
  const page = fakePage();
  await lib.loginViaForm(page, 'http://localhost:3010', 'client');
  assert.deepEqual(page.calls.map(c => c[0]).sort(), ['click', 'goto', 'type', 'type', 'waitForNavigation']);
  assert.deepEqual(page.calls[0], ['goto', 'http://localhost:3010/admin/login', { waitUntil: 'networkidle2' }]);
  assert.ok(page.calls.some(c => c[0] === 'type' && c[1] === 'input[type="email"]' && c[2] === 'admin@goldfields.com'));
  assert.ok(page.calls.some(c => c[0] === 'type' && c[1] === 'input[type="password"]' && c[2] === 'client-pass-from-env'));
  assert.ok(page.calls.some(c => c[0] === 'click' && c[1] === 'button[type="submit"]'));
});

test('the form login can type slowly and can leave the wait for the redirect to the script', async t => {
  const lib = await helper(t, { E2E_AGENCY_PASSWORD: 'agency-pass-from-env' });
  const page = fakePage();
  await lib.loginViaForm(page, 'http://localhost:3010', 'agency', { delay: 10, waitForNavigation: false });
  assert.ok(page.calls.every(c => c[0] !== 'waitForNavigation'), 'it waited although told not to');
  assert.deepEqual(page.calls.filter(c => c[0] === 'type').map(c => c[3]), [{ delay: 10 }, { delay: 10 }]);
  assert.equal(page.calls.at(-1)[0], 'click', 'the form was not submitted last');
});

test('typing credentials alone does not submit the form', async t => {
  const lib = await helper(t, { E2E_AGENCY_PASSWORD: 'agency-pass-from-env' });
  const page = fakePage();
  await lib.typeCredentials(page, 'agency', 10);
  assert.deepEqual(page.calls.map(c => c[0]), ['type', 'type']);
  const plain = fakePage();
  await lib.typeCredentials(plain, 'agency');
  assert.deepEqual(plain.calls.map(c => c[3]), [undefined, undefined]);
});

test('the API login posts the account\'s credentials as JSON and returns the response', async t => {
  const lib = await helper(t, { E2E_AGENCY_PASSWORD: 'agency-pass-from-env' });
  const realFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init) => { requests.push({ url, init }); return { status: 200, marker: 'response' }; };
  t.after(() => { globalThis.fetch = realFetch; });
  const response = await lib.loginViaApi('http://localhost:3010', 'agency');
  assert.equal(response.marker, 'response');
  assert.equal(requests[0].url, 'http://localhost:3010/api/admin/auth/login');
  assert.equal(requests[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].init.body), { email: 'malcolm@movedigital.africa', password: 'agency-pass-from-env' });
});
