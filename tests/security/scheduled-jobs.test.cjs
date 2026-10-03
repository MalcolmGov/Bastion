const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const DUE = '2020-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';
const CRON_SECRET = 'scheduled-jobs-test-secret-0001';
const PUBLISHER = { id: 'publisher-a', name: 'Publisher A', role: 'publisher', client_id: 'tenant-a' };
const AGENCY = { id: 'agency-1', name: 'Agency One', role: 'platform_admin', client_id: null };
let seq = 0;

// The shape this codebase used to create in places: a record_id, scheduled_for and created_at column instead of the
// publish_at_utc / executed_at_utc / error_log ones that schema.sql, the workflow route and the worker use.
const CRON_SHAPE = `CREATE TABLE scheduled_jobs(id TEXT PRIMARY KEY, record_id TEXT NOT NULL REFERENCES content_records(id) ON DELETE CASCADE,
  revision_id TEXT NOT NULL REFERENCES revisions(id) ON DELETE CASCADE, scheduled_for TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  executed_at TEXT, error_message TEXT, created_at TEXT NOT NULL, client_id TEXT)`;

async function fixture(t) {
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
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN client_id TEXT');
  await h.db.execute("INSERT INTO users(id,name,email,role,client_id) VALUES('publisher-a','Publisher A','publisher-a@test.local','publisher','tenant-a')");
  return h;
}

async function addRecord(h, { collection = 'operations' } = {}) {
  const n = ++seq, rec = `rec-${n}`, rev = `rev-${n}`;
  await h.db.execute({ sql: 'INSERT INTO content_records VALUES(?,?,?,?,?,NULL,?,?,?,?,?)', args: [rec, collection, `slug-${n}`, `Title ${n}`, 'scheduled', rev, 'site-a', 'tenant-a', '2026-10-01', '2026-10-01'] });
  await h.db.execute({ sql: 'INSERT INTO revisions VALUES(?,?,?,?,?,?,?,?,NULL)', args: [rev, rec, 1, '{}', `hash-${n}`, 'author-a', '2026-10-01', 'approved'] });
  return { rec, rev };
}

const schedule = (h, { rev }, at = DUE, id = `job-${++seq}`) =>
  h.db.execute({ sql: "INSERT INTO scheduled_jobs(id, revision_id, publish_at_utc, target_environment, status, scheduled_by_id) VALUES(?,?,?,'production','pending','author-a')", args: [id, rev, at] }).then(() => id);

const job = async (h, id) => (await h.db.execute({ sql: 'SELECT * FROM scheduled_jobs WHERE id = ?', args: [id] })).rows[0];
const record = async (h, rec) => (await h.db.execute({ sql: 'SELECT * FROM content_records WHERE id = ?', args: [rec] })).rows[0];
const revision = async (h, rev) => (await h.db.execute({ sql: 'SELECT * FROM revisions WHERE id = ?', args: [rev] })).rows[0];
const isLive = async (h, { rec, rev }) => (await record(h, rec)).current_published_revision_id === rev;
const publishAudit = async h => (await h.db.execute("SELECT * FROM audit_log WHERE action = 'SCHEDULED_PUBLISH'")).rows;
const columns = async (h, table = 'scheduled_jobs') => (await h.db.execute(`PRAGMA table_info(${table})`)).rows.map(r => String(r.name));

const runWorker = h => h.load('lib/worker/worker.ts').executeScheduledWorker();
const runCron = async h => {
  const res = await h.route('api/cron/releases').POST(h.request('/api/cron/releases', {}, CRON_SECRET));
  assert.equal(res.status, 200);
  return res.json();
};

// ---- the migration that leaves one shape ----

const migration = h => h.load('lib/db/migrations.ts').migrations.find(m => m.name === '016_scheduled_jobs_single_schema');

test('a database that has the cron-shaped table is rebuilt into the shared shape without losing jobs', async t => {
  const h = await fixture(t);
  const a = await addRecord(h), b = await addRecord(h), c = await addRecord(h);
  await h.db.execute('DROP TABLE scheduled_jobs');
  await h.db.execute(CRON_SHAPE);
  const insert = (id, r, status, at, executedAt, error) => h.db.execute({
    sql: 'INSERT INTO scheduled_jobs(id, record_id, revision_id, scheduled_for, status, executed_at, error_message, created_at, client_id) VALUES(?,?,?,?,?,?,?,?,?)',
    args: [id, r.rec, r.rev, at, status, executedAt, error, '2026-10-01', 'tenant-a'],
  });
  await insert('job-pending', a, 'pending', '2026-11-01T09:00:00.000Z', null, null);
  await insert('job-executed', b, 'executed', '2026-09-01T09:00:00.000Z', '2026-09-01T09:00:05.000Z', null);
  await insert('job-failed', c, 'failed', '2026-09-02T09:00:00.000Z', null, 'Independent approval required');
  await h.db.execute({ sql: 'INSERT INTO scheduled_jobs(id, record_id, revision_id, scheduled_for, status, created_at) VALUES(?,?,?,?,?,?)', args: ['job-orphan', a.rec, 'revision-that-is-gone', DUE, 'pending', '2026-10-01'] }).catch(() => {});

  await migration(h).up(h.db);

  const cols = await columns(h);
  for (const col of ['id', 'revision_id', 'publish_at_utc', 'target_environment', 'status', 'scheduled_by_id', 'executed_at_utc', 'error_log', 'client_id', 'site_id']) assert.ok(cols.includes(col), `missing ${col}`);
  for (const col of ['record_id', 'scheduled_for', 'executed_at', 'error_message']) assert.ok(!cols.includes(col), `old column ${col} survived`);
  assert.equal((await job(h, 'job-pending')).publish_at_utc, '2026-11-01T09:00:00.000Z');
  assert.equal((await job(h, 'job-pending')).status, 'pending');
  assert.equal((await job(h, 'job-pending')).target_environment, 'production');
  assert.equal((await job(h, 'job-pending')).client_id, 'tenant-a');
  assert.equal((await job(h, 'job-executed')).executed_at_utc, '2026-09-01T09:00:05.000Z');
  assert.equal((await job(h, 'job-failed')).error_log, 'Independent approval required');
  assert.equal(await job(h, 'job-orphan'), undefined, 'a job whose revision no longer exists was carried over');
  const idx = (await h.db.execute("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'scheduled_jobs'")).rows.map(r => r.name);
  assert.ok(idx.includes('idx_jobs_status_publish'));
  // and the workflow route's own INSERT works on it
  const d = await addRecord(h);
  await schedule(h, d, DUE, 'job-new');
  assert.equal((await job(h, 'job-new')).status, 'pending');
});

test('a table that is already the shared shape is left exactly as it is, and the migration can run twice', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  await schedule(h, r, '2026-11-01T09:00:00.000Z', 'job-keep');
  const before = JSON.stringify((await h.db.execute('SELECT * FROM scheduled_jobs ORDER BY id')).rows);
  await migration(h).up(h.db);
  await migration(h).up(h.db);
  assert.equal(JSON.stringify((await h.db.execute('SELECT * FROM scheduled_jobs ORDER BY id')).rows), before);
});

test('a shared-shape table from before later columns existed gains them', async t => {
  const h = await fixture(t);
  await h.db.execute('DROP TABLE scheduled_jobs');
  await h.db.execute("CREATE TABLE scheduled_jobs(id TEXT PRIMARY KEY, revision_id TEXT NOT NULL, publish_at_utc TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending')");
  await h.db.execute("INSERT INTO scheduled_jobs VALUES('job-old','revision-a','2026-11-01','pending')");
  await migration(h).up(h.db);
  const cols = await columns(h);
  for (const col of ['target_environment', 'scheduled_by_id', 'executed_at_utc', 'error_log']) assert.ok(cols.includes(col), `missing ${col}`);
  assert.equal((await job(h, 'job-old')).publish_at_utc, '2026-11-01');
});

test('a database with no scheduled_jobs table gets the shared shape', async t => {
  const h = await fixture(t);
  await h.db.execute('DROP TABLE scheduled_jobs');
  await migration(h).up(h.db);
  assert.ok((await columns(h)).includes('publish_at_utc'));
});

// ---- the cron and the worker run the same jobs ----

test('the cron publishes a job that was scheduled through the workflow endpoint', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  h.user(PUBLISHER);
  const response = await h.route('api/admin/content/[collection]/[id]/workflow').POST(
    h.request(`/api/admin/content/operations/${r.rec}/workflow`, { action: 'schedule', scheduledAt: DUE }),
    { params: Promise.resolve({ collection: 'operations', id: r.rec }) },
  );
  assert.equal(response.status, 200, JSON.stringify(await response.clone().json()));
  assert.equal((await record(h, r.rec)).status, 'scheduled');
  assert.equal(await isLive(h, r), false, 'scheduling published the record early');

  const result = await runCron(h);
  assert.equal(result.executedJobs, 1, 'the cron did not run the job it was given');
  assert.equal(await isLive(h, r), true);
  assert.equal((await record(h, r.rec)).status, 'published');
  assert.equal((await revision(h, r.rev)).status, 'published');
  const audit = await publishAudit(h);
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, 'system_cron');
  assert.equal(audit[0].record_id, r.rec);
});

test('the worker publishes the same kind of job and records its own actor', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  const id = await schedule(h, r);
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 1);
  assert.equal(await isLive(h, r), true);
  assert.equal((await job(h, id)).status, 'executed');
  assert.ok((await job(h, id)).executed_at_utc);
  assert.equal((await publishAudit(h))[0].actor_id, 'system_worker');
});

test('jobs that are not due yet are left alone, and due jobs run oldest first', async t => {
  const h = await fixture(t);
  const later = await addRecord(h), soon = await addRecord(h), tomorrow = await addRecord(h);
  await schedule(h, later, '2020-06-01T00:00:00.000Z', 'job-later');
  await schedule(h, soon, '2020-01-01T00:00:00.000Z', 'job-soon');
  const notYet = await schedule(h, tomorrow, FUTURE);
  const result = await runCron(h);
  assert.equal(result.executedJobs, 2);
  assert.equal((await job(h, notYet)).status, 'pending');
  assert.equal(await isLive(h, tomorrow), false);
  const order = (await publishAudit(h)).map(a => a.record_id);
  assert.deepEqual(order, [soon.rec, later.rec]);
});

test('a job already run is not run again by the other runner', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  await schedule(h, r);
  assert.equal((await runWorker(h)).publishedJobsCount, 1);
  assert.equal((await runCron(h)).executedJobs, 0);
  assert.equal((await publishAudit(h)).length, 1, 'a job was published twice');
});

test('the worker and the cron running at the same moment publish a job once', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  const id = await schedule(h, r);
  const [worker, cron] = await Promise.all([runWorker(h), runCron(h)]);
  assert.equal(worker.publishedJobsCount + cron.executedJobs, 1, `worker ran ${worker.publishedJobsCount}, cron ran ${cron.executedJobs}`);
  assert.equal((await publishAudit(h)).length, 1, 'a job was published twice');
  assert.equal((await job(h, id)).status, 'executed');
  assert.equal(await isLive(h, r), true);
});

test('a job that another runner takes after the due list was read is skipped, not published again', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  const id = await schedule(h, r);
  // The other runner finishes the job between this run reading the list of due jobs and claiming one.
  const original = h.db.execute.bind(h.db);
  h.db.execute = async query => {
    const sql = typeof query === 'string' ? query : query.sql;
    const result = await original(query);
    if (/FROM scheduled_jobs j/.test(sql)) {
      h.db.execute = original;
      await original({ sql: "UPDATE scheduled_jobs SET status = 'executed', executed_at_utc = '2020-01-01T00:00:01.000Z' WHERE id = ?", args: [id] });
    }
    return result;
  };
  const result = await runWorker(h);
  h.db.execute = original;
  assert.equal(result.publishedJobsCount, 0, 'a job another runner had already taken was run');
  assert.equal(await isLive(h, r), false);
  assert.equal((await publishAudit(h)).length, 0);
  assert.equal((await job(h, id)).executed_at_utc, '2020-01-01T00:00:01.000Z', 'the other runner\'s record of the job was overwritten');
});

// ---- failure leaves nothing half done ----

test('a failure while publishing rolls the whole job back and records why', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  const id = await schedule(h, r);
  await h.db.execute("CREATE TRIGGER fail_publish BEFORE UPDATE ON content_records BEGIN SELECT RAISE(ABORT, 'record update failed'); END");
  const result = await runWorker(h);
  assert.equal(result.publishedJobsCount, 0);
  const failed = await job(h, id);
  assert.equal(failed.status, 'failed');
  assert.match(String(failed.error_log), /record update failed/);
  assert.equal(failed.executed_at_utc, null, 'a failed job is recorded as executed');
  assert.notEqual((await revision(h, r.rev)).status, 'published', 'the revision was promoted although the record was not');
  assert.equal((await publishAudit(h)).length, 0, 'a failed job was audited as published');
});

test('one failing job does not stop the others in the same run', async t => {
  const h = await fixture(t);
  const bad = await addRecord(h), good = await addRecord(h);
  await schedule(h, bad, '2020-01-01T00:00:00.000Z', 'job-bad');
  await schedule(h, good, '2020-02-01T00:00:00.000Z', 'job-good');
  await h.db.execute({ sql: `CREATE TRIGGER fail_one BEFORE UPDATE ON content_records WHEN OLD.id = '${bad.rec}' BEGIN SELECT RAISE(ABORT, 'bad record'); END` });
  const result = await runCron(h);
  assert.equal(result.executedJobs, 1);
  assert.equal((await job(h, 'job-bad')).status, 'failed');
  assert.equal((await job(h, 'job-good')).status, 'executed');
  assert.equal(await isLive(h, good), true);
  assert.equal(await isLive(h, bad), false);
});

// ---- what the admin page reads ----

test('the worker status endpoint lists scheduled jobs from the shared table', async t => {
  const h = await fixture(t);
  const r = await addRecord(h);
  await schedule(h, r, '2026-11-01T09:00:00.000Z', 'job-listed');
  h.user(AGENCY);
  const response = await h.route('api/admin/worker/status').GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  const listed = body.jobs.find(j => j.id === 'job-listed');
  assert.ok(listed, 'the job is not listed');
  assert.equal(listed.publish_at_utc, '2026-11-01T09:00:00.000Z');
  assert.equal(listed.collection, 'operations');
});
