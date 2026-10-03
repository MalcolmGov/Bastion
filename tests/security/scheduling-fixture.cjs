// Shared setup for tests of scheduled publishing: the harness with the cron secret set, quiet logs, the audit columns the
// scheduler writes, and the cron route called the way the platform calls it.
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const DUE = '2020-01-01T00:00:00.000Z';
const CRON_SECRET = 'scheduled-publishing-test-secret-0001';

async function fixture(t, { legacyReleases = false } = {}) {
  const h = await createHarness();
  const realEnv = process.env.CRON_SECRET, realWarn = console.warn, realError = console.error;
  process.env.CRON_SECRET = CRON_SECRET;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    if (realEnv === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = realEnv;
    console.warn = realWarn;
    console.error = realError;
    h.close();
  });
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN correlation_id TEXT');
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN ip_address TEXT');
  if (legacyReleases) {
    await h.db.execute('CREATE TABLE releases(id TEXT PRIMARY KEY, name TEXT, client_id TEXT, scheduled_at TEXT, status TEXT, published_at TEXT)');
    await h.db.execute('CREATE TABLE release_items(release_id TEXT, item_type TEXT, item_id TEXT, action TEXT)');
  }
  return h;
}

const runWorker = h => h.load('lib/worker/worker.ts').executeScheduledWorker();

const runCron = async h => {
  const res = await h.route('api/cron/releases').POST(h.request('/api/cron/releases', {}, CRON_SECRET));
  assert.equal(res.status, 200);
  return res.json();
};

module.exports = { DUE, CRON_SECRET, fixture, runWorker, runCron };
