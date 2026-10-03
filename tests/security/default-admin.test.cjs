const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');

const root = path.resolve(__dirname, '../..');
// Passwords that were written into this repository's seed and scripts. Anyone who has read the source knows them.
const PUBLISHED = ['Bastion2026!', 'GoldFields2026!'];
const STRONG = 'correct-horse-battery-staple-91';

async function fixture(t, env = {}) {
  const h = await createHarness();
  const saved = {};
  for (const key of ['BOOTSTRAP_ADMIN_EMAIL', 'BOOTSTRAP_ADMIN_PASSWORD']) { saved[key] = process.env[key]; delete process.env[key]; }
  Object.assign(process.env, env);
  const realWarn = console.warn, realError = console.error;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    console.warn = realWarn;
    console.error = realError;
    h.close();
  });
  await h.db.execute('ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0');
  await h.db.execute('ALTER TABLE users ADD COLUMN locked_until TEXT');
  await h.db.execute('ALTER TABLE users ADD COLUMN last_login TEXT');
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN correlation_id TEXT');
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN ip_address TEXT');
  await h.db.execute('CREATE TABLE sessions(id TEXT PRIMARY KEY, user_id TEXT, token_hash TEXT, expires_at TEXT, ip_address TEXT, user_agent TEXT)');
  const { hashPassword } = h.load('lib/auth/password.ts');
  const addUser = (id, email, role, password, clientId = null) => h.db.execute({
    sql: 'INSERT INTO users(id,name,email,role,client_id,password_hash,region_scope,created_at) VALUES(?,?,?,?,?,?,?,?)',
    args: [id, id, email, role, clientId, password === null ? 'revoked$published-default-credential' : hashPassword(password), 'All', '2026-10-01'],
  });
  const user = async email => (await h.db.execute({ sql: 'SELECT * FROM users WHERE LOWER(email) = ?', args: [email.toLowerCase()] })).rows[0];
  const login = async (email, password) => {
    const res = await h.route('api/admin/auth/login').POST(h.request('/api/admin/auth/login', { email, password }));
    return res.status;
  };
  const lib = () => h.load('lib/auth/bootstrapAdmin.ts');
  return { h, addUser, user, login, lib, hashPassword };
}

// ---- the published admin account is gone from the source ----

test('the multi-tenant seed no longer creates an account with a published password', () => {
  const seed = fs.readFileSync(path.join(root, 'src/lib/studio/seedMultiTenant.ts'), 'utf8');
  for (const password of PUBLISHED) assert.ok(!seed.includes(password), `the seed still contains ${password}`);
  assert.ok(!/hashPassword\(\s*['"`]/.test(seed), 'the seed still hashes a literal password');
  assert.ok(!seed.includes('usr_malcolm_movedigital'), 'the seed still creates the vendor admin account');
});

test('no script or published proposal page carries a published password', () => {
  const offenders = [];
  const scan = (dir, pattern) => {
    for (const file of fs.readdirSync(path.join(root, dir))) {
      if (!pattern.test(file)) continue;
      const source = fs.readFileSync(path.join(root, dir, file), 'utf8');
      for (const password of PUBLISHED) if (source.includes(password)) offenders.push(`${dir}/${file}: ${password}`);
    }
  };
  scan('scripts', /\.(ts|mjs|cjs|js|py)$/);
  scan('public/proposal', /\.html?$/);
  assert.deepEqual(offenders, []);
});

// ---- revoking accounts that already accept a published password ----

test('an admin account that still accepts a published password is revoked, signed out and audited', async t => {
  const f = await fixture(t);
  await f.addUser('usr_malcolm_movedigital', 'malcolm@movedigital.africa', 'platform_admin', 'Bastion2026!');
  await f.h.db.execute("INSERT INTO sessions VALUES('sess-1','usr_malcolm_movedigital','hash','2999-01-01','1.1.1.1','ua')");
  assert.equal(await f.login('malcolm@movedigital.africa', 'Bastion2026!'), 200, 'precondition: the published password signs in');

  const revoked = await f.lib().revokePublishedCredentials(f.h.db);
  assert.equal(revoked, 1);
  assert.equal(await f.login('malcolm@movedigital.africa', 'Bastion2026!'), 401, 'the published password still signs in');
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM sessions WHERE user_id = 'usr_malcolm_movedigital'")).rows[0].c, 0, 'an existing session survived');
  const audit = (await f.h.db.execute("SELECT * FROM audit_log WHERE action = 'PUBLISHED_CREDENTIAL_REVOKED'")).rows;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].record_id, 'usr_malcolm_movedigital');
  assert.ok(!JSON.stringify(audit).includes('Bastion2026!'), 'the password was written to the audit log');
  assert.equal(await f.lib().revokePublishedCredentials(f.h.db), 0, 'a second run changed something');
});

test('accounts with their own passwords are not touched', async t => {
  const f = await fixture(t);
  await f.addUser('admin-own', 'owner@example.com', 'platform_admin', STRONG);
  await f.addUser('client-own', 'editor@client.example', 'content_editor', STRONG, 'tenant-a');
  const before = [(await f.user('owner@example.com')).password_hash, (await f.user('editor@client.example')).password_hash];
  assert.equal(await f.lib().revokePublishedCredentials(f.h.db), 0);
  assert.deepEqual([(await f.user('owner@example.com')).password_hash, (await f.user('editor@client.example')).password_hash], before);
  assert.equal(await f.login('owner@example.com', STRONG), 200);
});

test('a published password is revoked on a platform admin of any name and on the known demo accounts of any role', async t => {
  const f = await fixture(t);
  await f.addUser('admin-other', 'someone@example.com', 'platform_admin', 'GoldFields2026!');
  await f.addUser('demo-client', 'admin@goldfields.com', 'content_editor', 'GoldFields2026!', 'tenant-a');
  await f.addUser('plain-client', 'plain@client.example', 'content_editor', 'GoldFields2026!', 'tenant-a');
  assert.equal(await f.lib().revokePublishedCredentials(f.h.db), 2);
  assert.equal(await f.login('someone@example.com', 'GoldFields2026!'), 401);
  assert.equal(await f.login('admin@goldfields.com', 'GoldFields2026!'), 401);
  assert.equal(await f.login('plain@client.example', 'GoldFields2026!'), 200, 'a non-admin, non-demo account was revoked');
});

test('migration 017 revokes published credentials when the database is brought up to date', async t => {
  const f = await fixture(t);
  await f.addUser('usr_malcolm_movedigital', 'malcolm@movedigital.africa', 'platform_admin', 'Bastion2026!');
  const migration = f.h.load('lib/db/migrations.ts').migrations.find(m => m.name === '017_revoke_published_credentials');
  assert.ok(migration, 'migration 017 does not exist');
  await migration.up(f.h.db);
  assert.equal(await f.login('malcolm@movedigital.africa', 'Bastion2026!'), 401);
});

// ---- the bootstrap admin ----

test('with nothing configured and no usable admin, nothing is created', async t => {
  const f = await fixture(t);
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'skipped');
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'platform_admin'")).rows[0].c, 0);
});

test('a database with no usable admin gets one from the environment, and it can sign in', async t => {
  const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: 'Owner@Example.com', BOOTSTRAP_ADMIN_PASSWORD: STRONG });
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'created');
  const admin = await f.user('owner@example.com');
  assert.equal(admin.role, 'platform_admin');
  assert.equal(admin.client_id, null);
  assert.ok(String(admin.password_hash).startsWith('scrypt$'));
  assert.equal(await f.login('owner@example.com', STRONG), 200);
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM audit_log WHERE action = 'BOOTSTRAP_ADMIN_CREATED'")).rows[0].c, 1);
});

test('the bootstrap never overrides an admin who can already sign in', async t => {
  const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: 'intruder@example.com', BOOTSTRAP_ADMIN_PASSWORD: STRONG });
  await f.addUser('admin-own', 'owner@example.com', 'platform_admin', 'a-different-strong-password-17');
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'skipped');
  assert.equal(await f.user('intruder@example.com'), undefined, 'a second admin was created');
  assert.equal(await f.login('owner@example.com', 'a-different-strong-password-17'), 200);
});

test('after a revocation the owner gets back in through the bootstrap, and only the owner', async t => {
  const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: 'malcolm@movedigital.africa', BOOTSTRAP_ADMIN_PASSWORD: STRONG });
  await f.addUser('usr_malcolm_movedigital', 'malcolm@movedigital.africa', 'platform_admin', 'Bastion2026!');
  await f.lib().revokePublishedCredentials(f.h.db);
  assert.equal(await f.login('malcolm@movedigital.africa', 'Bastion2026!'), 401);
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'recovered');
  assert.equal(await f.login('malcolm@movedigital.africa', STRONG), 200);
  assert.equal(await f.login('malcolm@movedigital.africa', 'Bastion2026!'), 401);
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'skipped', 'it ran again once an admin could sign in');
});

test('weak, published or malformed bootstrap settings are refused and nothing is created', async t => {
  for (const [email, password] of [
    ['owner@example.com', 'short1!'],
    ['owner@example.com', 'Bastion2026!'],
    ['owner@example.com', 'GoldFields2026!'],
    ['owner@example.com', 'whsec_bastion_goldfields_2026'],
    ['not-an-email', STRONG],
    ['', STRONG],
    ['owner@example.com', ''],
  ]) {
    const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password });
    assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'skipped', `accepted ${email} / ${password}`);
    assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'platform_admin'")).rows[0].c, 0);
  }
});

test('the bootstrap will not promote an existing client user to platform admin', async t => {
  const f = await fixture(t, { BOOTSTRAP_ADMIN_EMAIL: 'editor@client.example', BOOTSTRAP_ADMIN_PASSWORD: STRONG });
  await f.addUser('client-own', 'editor@client.example', 'content_editor', 'a-client-password-123', 'tenant-a');
  assert.equal(await f.lib().bootstrapPlatformAdmin(f.h.db), 'skipped');
  assert.equal((await f.user('editor@client.example')).role, 'content_editor');
  assert.equal(await f.login('editor@client.example', 'a-client-password-123'), 200, 'the client user lost their password');
});
