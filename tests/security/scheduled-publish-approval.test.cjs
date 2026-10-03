const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const DUE = '2020-01-01T00:00:00.000Z';
const CRON_SECRET = 'scheduled-approval-test-secret-0001';
const APPROVAL_ERROR = /independent approval/i;
let seq = 0;

// scheduled_jobs exists with two different column sets in this codebase (schema.sql vs the embedded and
// migration schema), and the worker and the cron route each read a different one, so both are covered.
const JOBS = {
  worker: 'CREATE TABLE scheduled_jobs(id TEXT PRIMARY KEY, revision_id TEXT, publish_at_utc TEXT, target_environment TEXT, status TEXT, scheduled_by_id TEXT, executed_at_utc TEXT, error_log TEXT)',
  cron: 'CREATE TABLE scheduled_jobs(id TEXT PRIMARY KEY, record_id TEXT, revision_id TEXT, scheduled_for TEXT, status TEXT, executed_at TEXT, error_message TEXT, created_at TEXT)',
};

async function fixture(t, { jobs, legacyReleases = false } = {}) {
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
  if (jobs) await h.db.execute(JOBS[jobs]);
  if (legacyReleases) {
    await h.db.execute('CREATE TABLE releases(id TEXT PRIMARY KEY, name TEXT, client_id TEXT, scheduled_at TEXT, status TEXT, published_at TEXT)');
    await h.db.execute('CREATE TABLE release_items(release_id TEXT, item_type TEXT, item_id TEXT, action TEXT)');
  }
  return h;
}

async function addRecord(h, { collection = 'reports', author = 'author-a' } = {}) {
  const n = ++seq, rec = `rec-${n}`, rev = `rev-${n}`, hash = `hash-${n}`;
  await h.db.execute({ sql: `INSERT INTO content_records VALUES(?,?,?,?,?,NULL,?,?,?,?,?)`, args: [rec, collection, `slug-${n}`, `Title ${n}`, 'scheduled', rev, 'site-a', 'tenant-a', '2026-10-01', '2026-10-01'] });
  await h.db.execute({ sql: `INSERT INTO revisions VALUES(?,?,?,?,?,?,?,?,NULL)`, args: [rev, rec, 1, '{}', hash, author, '2026-10-01', 'approved'] });
  return { rec, rev, hash };
}

const approve = (h, { rev, hash }, reviewer = 'reviewer-a', contentHash = hash) =>
  h.db.execute({ sql: 'INSERT INTO approvals VALUES(?,?,?,?,?)', args: [`appr-${++seq}`, rev, reviewer, 'approved', contentHash] });

const scheduleWorkerJob = (h, { rev }, id = `job-${++seq}`) =>
  h.db.execute({ sql: "INSERT INTO scheduled_jobs VALUES(?,?,?,'production','pending','author-a',NULL,NULL)", args: [id, rev, DUE] }).then(() => id);

const scheduleCronJob = (h, { rec, rev }, id = `job-${++seq}`) =>
  h.db.execute({ sql: "INSERT INTO scheduled_jobs VALUES(?,?,?,?,'pending',NULL,NULL,'2026-10-01')", args: [id, rec, rev, DUE] }).then(() => id);

const job = async (h, id) => (await h.db.execute({ sql: 'SELECT * FROM scheduled_jobs WHERE id = ?', args: [id] })).rows[0];
const record = async (h, rec) => (await h.db.execute({ sql: 'SELECT * FROM content_records WHERE id = ?', args: [rec] })).rows[0];
const revision = async (h, rev) => (await h.db.execute({ sql: 'SELECT * FROM revisions WHERE id = ?', args: [rev] })).rows[0];
const isLive = async (h, { rec, rev }) => (await record(h, rec)).current_published_revision_id === rev;

const runWorker = h => h.load('lib/worker/worker.ts').executeScheduledWorker();
const runCron = async h => {
  const res = await h.route('api/cron/releases').POST(h.request('/api/cron/releases', {}, CRON_SECRET));
  assert.equal(res.status, 200);
  return res.json();
};

// ---- the scheduled-job worker (the executor behind the "run worker" button) ----

for (const collection of ['reports', 'news']) {
  test(`worker does not publish a scheduled ${collection} revision that has no approval`, async t => {
    const h = await fixture(t, { jobs: 'worker' });
    const r = await addRecord(h, { collection });
    const id = await scheduleWorkerJob(h, r);
    const result = await runWorker(h);
    assert.equal(result.publishedJobsCount, 0);
    assert.equal(await isLive(h, r), false, 'unapproved disclosure went live');
    assert.notEqual((await record(h, r.rec)).status, 'published');
    assert.notEqual((await revision(h, r.rev)).status, 'published');
    const j = await job(h, id);
    assert.equal(j.status, 'failed');
    assert.match(String(j.error_log), APPROVAL_ERROR);
  });
}

test('worker rejects an approval given by the revision author and an approval of different content', async t => {
  const h = await fixture(t, { jobs: 'worker' });
  const selfApproved = await addRecord(h);
  await approve(h, selfApproved, 'author-a');
  const stale = await addRecord(h);
  await approve(h, stale, 'reviewer-a', 'hash-of-older-content');
  const rejected = await addRecord(h);
  await h.db.execute({ sql: 'INSERT INTO approvals VALUES(?,?,?,?,?)', args: ['appr-rejected', rejected.rev, 'reviewer-a', 'rejected', rejected.hash] });
  const ids = [];
  for (const r of [selfApproved, stale, rejected]) ids.push(await scheduleWorkerJob(h, r));
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 0);
  for (const r of [selfApproved, stale, rejected]) assert.equal(await isLive(h, r), false);
  for (const id of ids) assert.equal((await job(h, id)).status, 'failed');
});

test('worker publishes a scheduled disclosure that has an independent approval of its current content', async t => {
  const h = await fixture(t, { jobs: 'worker' });
  const r = await addRecord(h);
  await approve(h, r);
  const id = await scheduleWorkerJob(h, r);
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 1);
  assert.equal(await isLive(h, r), true);
  assert.equal((await record(h, r.rec)).status, 'published');
  assert.equal((await revision(h, r.rev)).status, 'published');
  assert.equal((await job(h, id)).status, 'executed');
});

test('worker still publishes scheduled content outside the disclosure collections without an approval', async t => {
  const h = await fixture(t, { jobs: 'worker' });
  const r = await addRecord(h, { collection: 'operations' });
  const id = await scheduleWorkerJob(h, r);
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 1);
  assert.equal(await isLive(h, r), true);
  assert.equal((await job(h, id)).status, 'executed');
});

test('worker keeps going after a refused job: an approved job later in the same run is published', async t => {
  const h = await fixture(t, { jobs: 'worker' });
  const blocked = await addRecord(h);
  const allowed = await addRecord(h);
  await approve(h, allowed);
  const blockedJob = await scheduleWorkerJob(h, blocked);
  const allowedJob = await scheduleWorkerJob(h, allowed);
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 1);
  assert.equal((await job(h, blockedJob)).status, 'failed');
  assert.equal((await job(h, allowedJob)).status, 'executed');
  assert.equal(await isLive(h, blocked), false);
  assert.equal(await isLive(h, allowed), true);
});

// ---- the cron route's two other scheduled branches (legacy releases and scheduled_jobs) ----

test('cron legacy releases: a scheduled release holding an unapproved report is not published', async t => {
  const h = await fixture(t, { legacyReleases: true });
  const r = await addRecord(h);
  await h.db.execute({ sql: "INSERT INTO releases VALUES('lr-1','Q3 results','tenant-a',?,'scheduled',NULL)", args: [DUE] });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-1','report',?,'publish')", args: [r.rec] });
  await runCron(h);
  assert.equal(await isLive(h, r), false, 'unapproved disclosure went live');
  assert.equal((await h.db.execute("SELECT status FROM releases WHERE id = 'lr-1'")).rows[0].status, 'scheduled');
});

test('cron legacy releases: an approved report is published, and a refused release does not block the next one', async t => {
  const h = await fixture(t, { legacyReleases: true });
  const blocked = await addRecord(h);
  const allowed = await addRecord(h);
  await approve(h, allowed);
  await h.db.execute({ sql: "INSERT INTO releases VALUES('lr-blocked','Blocked','tenant-a',?,'scheduled',NULL)", args: [DUE] });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-blocked','report',?,'publish')", args: [blocked.rec] });
  await h.db.execute({ sql: "INSERT INTO releases VALUES('lr-ok','Approved','tenant-a',?,'scheduled',NULL)", args: [DUE] });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-ok','report',?,'publish')", args: [allowed.rec] });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-ok','page','page-a','publish')" });
  await runCron(h);
  assert.equal(await isLive(h, blocked), false);
  assert.equal(await isLive(h, allowed), true);
  assert.equal((await h.db.execute("SELECT status FROM releases WHERE id = 'lr-blocked'")).rows[0].status, 'scheduled');
  assert.equal((await h.db.execute("SELECT status FROM releases WHERE id = 'lr-ok'")).rows[0].status, 'published');
  assert.equal((await h.db.execute("SELECT status FROM page_compositions WHERE id = 'page-a'")).rows[0].status, 'published');
});

test('cron legacy releases: a release with a refused disclosure publishes none of its other items', async t => {
  const h = await fixture(t, { legacyReleases: true });
  const blocked = await addRecord(h);
  await h.db.execute({ sql: "INSERT INTO releases VALUES('lr-mixed','Mixed','tenant-a',?,'scheduled',NULL)", args: [DUE] });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-mixed','page','page-a','publish')" });
  await h.db.execute({ sql: "INSERT INTO release_items VALUES('lr-mixed','report',?,'publish')", args: [blocked.rec] });
  await runCron(h);
  assert.equal((await h.db.execute("SELECT status FROM page_compositions WHERE id = 'page-a'")).rows[0].status, 'draft');
  assert.equal(await isLive(h, blocked), false);
});

test('cron scheduled jobs: unapproved disclosures are refused and approved ones are published', async t => {
  const h = await fixture(t, { jobs: 'cron' });
  const blocked = await addRecord(h);
  const allowed = await addRecord(h);
  await approve(h, allowed);
  const blockedJob = await scheduleCronJob(h, blocked);
  const allowedJob = await scheduleCronJob(h, allowed);
  await runCron(h);
  assert.equal(await isLive(h, blocked), false, 'unapproved disclosure went live');
  const refused = await job(h, blockedJob);
  assert.equal(refused.status, 'failed');
  assert.match(String(refused.error_message), APPROVAL_ERROR);
  assert.equal(await isLive(h, allowed), true);
  assert.equal((await job(h, allowedJob)).status, 'executed');
});
