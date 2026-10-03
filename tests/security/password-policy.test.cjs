const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');
const { addAuthSchema, isolateEnvironment } = require('./auth-fixture.cjs');

const root = path.resolve(__dirname, '../..');
// Passwords that were written into this repository's seed, scripts and tests. Anyone who has read the source knows them.
const PUBLISHED = ['Bastion2026!', 'GoldFields2026!', 'Bastion2026!Corp#'];
const STRONG = 'correct-horse-battery-staple-91';
const TOKEN = 'invite-token-for-tests';

async function fixture(t, env = {}) {
  const h = await createHarness();
  isolateEnvironment(t, { set: env });
  t.after(() => h.close());
  await addAuthSchema(h.db);
  const { hashPassword, verifyPassword } = h.load('lib/auth/password.ts');
  const placeholder = hashPassword('a-random-placeholder-nobody-knows-1');
  await h.db.execute({
    sql: `INSERT INTO users(id,name,email,role,client_id,password_hash,region_scope,invite_token,invite_token_expires_at,must_reset_password,created_at)
          VALUES('invitee','Invitee','invitee@test.local','content_editor','tenant-a',?,'All',?,?,1,'2026-10-01')`,
    args: [placeholder, TOKEN, new Date(Date.now() + 3600_000).toISOString()],
  });
  const invitee = async () => (await h.db.execute("SELECT * FROM users WHERE id = 'invitee'")).rows[0];
  const accept = async newPassword => {
    const res = await h.route('api/admin/auth/accept-invite').POST(h.request('/api/admin/auth/accept-invite', { token: TOKEN, newPassword }));
    return { status: res.status, body: await res.json() };
  };
  const provision = async initialPassword => {
    h.user({ id: 'platform-admin', name: 'Platform Admin', email: 'admin@test.local', role: 'platform_admin', client_id: null });
    const res = await h.route('api/admin/users').POST(h.request('/api/admin/users', {
      name: 'New Person', email: 'new.person@test.local', role: 'content_editor', clientId: 'tenant-a', clientName: 'A', initialPassword,
    }));
    return { status: res.status, body: await res.json() };
  };
  const created = async () => (await h.db.execute("SELECT * FROM users WHERE email = 'new.person@test.local'")).rows[0];
  return { h, placeholder, invitee, accept, provision, created, verifyPassword };
}

// ---- the policy itself ----

test('a published password is refused however it is written, and so is a public demo secret', async t => {
  const { h } = await fixture(t);
  const { passwordProblem } = h.load('lib/auth/passwordPolicy.ts');
  const variants = [];
  for (const published of PUBLISHED) variants.push(published, published.toLowerCase(), published.toUpperCase(), `  ${published}  `);
  for (const password of variants) assert.equal(passwordProblem(password), 'published', `accepted ${JSON.stringify(password)}`);
  assert.equal(passwordProblem('whsec_bastion_goldfields_2026'), 'published');
});

test('short, empty and non-text passwords are refused, and an ordinary strong one is accepted', async t => {
  const { h } = await fixture(t);
  const { passwordProblem, MIN_PASSWORD_LENGTH } = h.load('lib/auth/passwordPolicy.ts');
  assert.equal(MIN_PASSWORD_LENGTH, 12);
  for (const password of ['', 'short1!', 'x'.repeat(11)]) assert.equal(passwordProblem(password), 'too_short', `accepted ${JSON.stringify(password)}`);
  for (const password of [undefined, null, 123456789012, {}, ['a'.repeat(12)]]) assert.equal(passwordProblem(password), 'not_text');
  assert.equal(passwordProblem(STRONG), null);
  assert.equal(passwordProblem('x'.repeat(12)), null, 'exactly the minimum length is allowed');
  // Close to a published value is not the published value: only the real ones are refused.
  assert.equal(passwordProblem('Bastion2027!'), null);
});

test('the refusal message explains the problem and never repeats the password', async t => {
  const { h } = await fixture(t);
  const policy = h.load('lib/auth/passwordPolicy.ts');
  const message = policy.PUBLISHED_PASSWORD_MESSAGE;
  assert.match(message, /published|repository/i);
  for (const published of [...PUBLISHED, ...policy.PUBLISHED_PASSWORDS]) assert.ok(!message.includes(published), 'the message repeats a published password');
});

// ---- invitation: where a person chooses their own password ----

test('an invited person cannot choose a published password: nothing changes and no session starts', async t => {
  const f = await fixture(t);
  const before = (await f.invitee()).password_hash;
  const answers = [];
  for (const password of [...PUBLISHED, 'bastion2026!', 'GOLDFIELDS2026!']) {
    const { status, body } = await f.accept(password);
    assert.equal(status, 400, `accepted ${password}`);
    answers.push(body.error);
  }
  const after = await f.invitee();
  assert.equal(after.password_hash, before, 'the password changed');
  assert.equal(after.invite_token, TOKEN, 'the invitation was used up by a refused password');
  assert.equal(after.must_reset_password, 1);
  assert.equal((await f.h.db.execute('SELECT COUNT(*) AS c FROM sessions')).rows[0].c, 0, 'a session was started');
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM audit_log WHERE action = 'ACCEPT_INVITE'")).rows[0].c, 0);
  const { PUBLISHED_PASSWORD_MESSAGE } = f.h.load('lib/auth/passwordPolicy.ts');
  for (const error of answers) assert.equal(error, PUBLISHED_PASSWORD_MESSAGE);
});

test('an invited person is still refused a short password with the same message, and can still choose a good one', async t => {
  const f = await fixture(t);
  const short = await f.accept('short1!');
  assert.equal(short.status, 400);
  assert.equal(short.body.error, 'Password must be at least 12 characters long');
  const ok = await f.accept(STRONG);
  assert.equal(ok.status, 200);
  const after = await f.invitee();
  assert.ok(f.verifyPassword(STRONG, after.password_hash), 'the chosen password does not work');
  assert.equal(after.invite_token, null);
  assert.equal(after.must_reset_password, 0);
});

// ---- an administrator creating an account with a first password ----

test('an administrator cannot create an account whose first password is a published one', async t => {
  const f = await fixture(t);
  const answers = [];
  for (const password of [...PUBLISHED, 'bastion2026!']) {
    const { status, body } = await f.provision(password);
    assert.equal(status, 400, `accepted ${password}`);
    answers.push(body.error);
  }
  assert.equal(await f.created(), undefined, 'an account was created');
  const { PUBLISHED_PASSWORD_MESSAGE } = f.h.load('lib/auth/passwordPolicy.ts');
  for (const error of answers) assert.equal(error, PUBLISHED_PASSWORD_MESSAGE);
});

test('an administrator can still create an account with a good first password, and a short one is still refused', async t => {
  const f = await fixture(t);
  const short = await f.provision('short1!');
  assert.equal(short.status, 400);
  assert.equal(short.body.error, 'A temporary password of at least 12 characters is required.');
  assert.equal(await f.created(), undefined);
  const ok = await f.provision(STRONG);
  assert.equal(ok.status, 200);
  assert.ok(f.verifyPassword(STRONG, (await f.created()).password_hash));
});

// ---- the first administrator and the demo accounts ----

test('the bootstrap administrator refuses a published password in any capitalisation', async t => {
  for (const password of ['bastion2026!', 'GOLDFIELDS2026!', 'Bastion2026!Corp#']) {
    const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: 'owner@example.com', BOOTSTRAP_ADMIN_PASSWORD: password });
    const { bootstrapPlatformAdmin } = f.h.load('lib/auth/bootstrapAdmin.ts');
    assert.equal(await bootstrapPlatformAdmin(f.h.db), 'skipped', `accepted ${password}`);
    assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'platform_admin'")).rows[0].c, 0);
  }
});

test('the demo accounts are not seeded with a published password, and are with a good one', async t => {
  const seeded = async h => (await h.db.execute("SELECT COUNT(*) AS c FROM users WHERE id LIKE 'usr\\_%' ESCAPE '\\'")).rows[0].c;
  for (const [password, shouldSeed] of [['Bastion2026!', false], ['bastion2026!', false], ['GoldFields2026!', false], [STRONG, true]]) {
    const f = await fixture(t, { SEED_DEMO_USERS: 'true', SEED_DEMO_PASSWORD: password });
    const before = await seeded(f.h);
    const { seedEssentialUsers } = f.h.load('lib/db/client.ts');
    await seedEssentialUsers(f.h.db);
    const added = (await seeded(f.h)) - before;
    assert.ok(shouldSeed ? added > 0 : added === 0, `${password}: seeded ${added} accounts`);
  }
});

// ---- no new way to set a password can skip the policy ----

test('every place that stores a chosen password goes through the policy', () => {
  const offenders = [];
  const scan = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(full); continue; }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      const source = fs.readFileSync(full, 'utf8');
      const calls = [...source.matchAll(/\bhashPassword\(([^)]*\)?)/g)].map(m => m[1]);
      if (!calls.length || /export \{[^}]*hashPassword/.test(source) || /export function hashPassword/.test(source)) continue;
      const relative = path.relative(root, full).replace(/\\/g, '/');
      const placeholdersOnly = calls.every(call => /randomBytes/.test(call));
      const checked = /passwordPolicy/.test(source);
      // Login re-hashes the password a person has just signed in with, to move an old hash to scrypt; it chooses nothing new.
      const upgradesVerifiedHash = relative === 'src/app/api/admin/auth/login/route.ts';
      if (!(placeholdersOnly || checked || upgradesVerifiedHash)) offenders.push(relative);
    }
  };
  scan(path.join(root, 'src'));
  assert.deepEqual(offenders, [], `these hash a password without the policy: ${offenders.join(', ')}`);
});
