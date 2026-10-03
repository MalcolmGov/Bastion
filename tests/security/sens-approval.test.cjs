const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const SENS_TABLE = `CREATE TABLE sens_announcements(
  id TEXT PRIMARY KEY, client_id TEXT, site_id TEXT, headline TEXT, announcement_type TEXT, jse_code TEXT,
  isin_code TEXT, released_at TEXT, body_html TEXT, summary TEXT, pdf_url TEXT, is_price_sensitive INTEGER,
  status TEXT, sponsor TEXT, embargo_until TEXT, created_at TEXT, updated_at TEXT,
  created_by TEXT, approved_by TEXT, approved_at TEXT, approved_content_hash TEXT)`;

const ACTORS = {
  editor: { id: 'editor-a', name: 'Editor A', role: 'content_editor', client_id: 'tenant-a' },
  editor2: { id: 'editor-a2', name: 'Editor A2', role: 'content_editor', client_id: 'tenant-a' },
  reviewer: { id: 'reviewer-a', name: 'Reviewer A', role: 'reviewer', client_id: 'tenant-a' },
  publisher: { id: 'publisher-a', name: 'Publisher A', role: 'publisher', client_id: 'tenant-a' },
  reader: { id: 'reader-a', name: 'Reader A', role: 'read_only_stakeholder', client_id: 'tenant-a' },
  otherTenant: { id: 'reviewer-b', name: 'Reviewer B', role: 'reviewer', client_id: 'tenant-b' },
  agency1: { id: 'agency-1', name: 'Agency One', role: 'platform_admin', client_id: null },
  agency2: { id: 'agency-2', name: 'Agency Two', role: 'platform_admin', client_id: null },
};

const INDEPENDENT = /independent approval/i;

async function fixture(t) {
  const h = await createHarness();
  const realWarn = console.warn, realError = console.error;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => { console.warn = realWarn; console.error = realError; h.close(); });
  await h.db.execute(SENS_TABLE);
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN client_id TEXT');
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN site_id TEXT');
  return h;
}

async function create(h, actor, body = {}) {
  h.user(ACTORS[actor]);
  const response = await h.route('api/admin/ir/sens').POST(h.request('/api/admin/ir/sens', {
    headline: 'Trading statement', bodyHtml: '<p>Headline earnings per share will increase.</p>', clientId: 'tenant-a', ...body,
  }));
  return { status: response.status, body: await response.json() };
}

async function act(h, actor, id, action) {
  h.user(ACTORS[actor]);
  const response = await h.route('api/admin/ir/sens/[id]').POST(
    h.request(`/api/admin/ir/sens/${id}`, { action }),
    { params: Promise.resolve({ id }) },
  );
  return { status: response.status, body: await response.json() };
}

const row = async (h, id) => (await h.db.execute({ sql: 'SELECT * FROM sens_announcements WHERE id = ?', args: [id] })).rows[0];
const draftBy = async (h, actor) => (await create(h, actor)).body.announcement.id;

// ---- creation ----

test('new SENS announcements are always created as drafts and record their author', async t => {
  const h = await fixture(t);
  const made = await create(h, 'editor');
  assert.equal(made.status, 200);
  assert.equal(made.body.announcement.status, 'draft');
  assert.equal(made.body.announcement.createdBy, 'editor-a');
  assert.equal((await row(h, made.body.announcement.id)).created_by, 'editor-a');
});

test('creating an announcement directly as published or embargoed is refused', async t => {
  const h = await fixture(t);
  for (const status of ['published', 'embargoed']) {
    const result = await create(h, 'editor', { status });
    assert.equal(result.status, 400, `status ${status} was accepted`);
    assert.match(String(result.body.error), /draft/i);
  }
  const count = await h.db.execute('SELECT COUNT(*) AS c FROM sens_announcements');
  assert.equal(Number(count.rows[0].c), 0, 'a refused announcement was stored');
});

test('a read-only user cannot create SENS announcements', async t => {
  const h = await fixture(t);
  assert.equal((await create(h, 'reader')).status, 403);
  const count = await h.db.execute('SELECT COUNT(*) AS c FROM sens_announcements');
  assert.equal(Number(count.rows[0].c), 0);
});

// ---- approval ----

test('the author cannot approve their own announcement, even a platform admin', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'agency1');
  const self = await act(h, 'agency1', id, 'approve');
  assert.equal(self.status, 403);
  assert.match(String(self.body.error), /author/i);
  assert.equal((await row(h, id)).approved_by, null);

  const other = await act(h, 'agency2', id, 'approve');
  assert.equal(other.status, 200);
  const stored = await row(h, id);
  assert.equal(stored.approved_by, 'agency-2');
  assert.ok(stored.approved_at && stored.approved_content_hash);
  assert.equal(stored.status, 'draft', 'approval alone must not publish');
});

test('approving needs the content:approve permission and stays inside the tenant', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  assert.equal((await act(h, 'editor2', id, 'approve')).status, 403, 'an editor approved');
  assert.equal((await act(h, 'reader', id, 'approve')).status, 403, 'a read-only user approved');
  assert.equal((await act(h, 'otherTenant', id, 'approve')).status, 403, 'another tenant approved');
  assert.equal((await row(h, id)).approved_by, null);
  assert.equal((await act(h, 'reviewer', id, 'approve')).status, 200);
});

test('an unknown action and an unknown announcement are rejected', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  assert.equal((await act(h, 'reviewer', id, 'obliterate')).status, 400);
  assert.equal((await act(h, 'reviewer', 'sens_missing', 'approve')).status, 404);
});

// ---- publishing ----

for (const actor of ['publisher', 'agency2']) {
  test(`an announcement with no approval cannot be published, even by ${actor}`, async t => {
    const h = await fixture(t);
    const id = await draftBy(h, 'agency1');
    const result = await act(h, actor, id, 'publish');
    assert.equal(result.status, 409);
    assert.match(String(result.body.error), INDEPENDENT);
    assert.equal((await row(h, id)).status, 'draft', 'an unapproved announcement went live');
  });
}

test('an independently approved announcement can be published by someone with content:publish', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  assert.equal((await act(h, 'reviewer', id, 'approve')).status, 200);
  const published = await act(h, 'publisher', id, 'publish');
  assert.equal(published.status, 200);
  assert.equal(published.body.announcement.status, 'published');
  assert.equal((await row(h, id)).status, 'published');

  const audit = (await h.db.execute({ sql: 'SELECT action, actor_id FROM audit_log WHERE record_id = ? ORDER BY created_at, id', args: [id] })).rows.map(r => `${r.action}:${r.actor_id}`);
  assert.ok(audit.includes('SENS_ANNOUNCEMENT_APPROVE:reviewer-a'), `approve not audited: ${audit}`);
  assert.ok(audit.includes('SENS_ANNOUNCEMENT_PUBLISH:publisher-a'), `publish not audited: ${audit}`);
});

test('publishing needs the content:publish permission', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  await act(h, 'reviewer', id, 'approve');
  for (const actor of ['reviewer', 'editor', 'reader']) {
    assert.equal((await act(h, actor, id, 'publish')).status, 403, `${actor} published`);
  }
  assert.equal((await row(h, id)).status, 'draft');
});

test('an approval no longer counts once the announcement content has changed', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  await act(h, 'reviewer', id, 'approve');
  await h.db.execute({ sql: "UPDATE sens_announcements SET body_html = '<p>Quietly rewritten after sign-off</p>' WHERE id = ?", args: [id] });
  const result = await act(h, 'publisher', id, 'publish');
  assert.equal(result.status, 409);
  assert.match(String(result.body.error), INDEPENDENT);
  assert.equal((await row(h, id)).status, 'draft');
});

test('an approval recorded by the author is not accepted at publish time', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  await act(h, 'reviewer', id, 'approve');
  await h.db.execute({ sql: "UPDATE sens_announcements SET approved_by = created_by WHERE id = ?", args: [id] });
  assert.equal((await act(h, 'publisher', id, 'publish')).status, 409);
  assert.equal((await row(h, id)).status, 'draft');
});

test('a published announcement cannot be approved or published again', async t => {
  const h = await fixture(t);
  const id = await draftBy(h, 'editor');
  await act(h, 'reviewer', id, 'approve');
  await act(h, 'publisher', id, 'publish');
  assert.equal((await act(h, 'publisher', id, 'publish')).status, 409);
  assert.equal((await act(h, 'reviewer', id, 'approve')).status, 409);
});

// ---- things that must not change ----

test('announcements that already exist as published (legacy or wire-synced) stay listed and untouched', async t => {
  const h = await fixture(t);
  await h.db.execute({
    sql: `INSERT INTO sens_announcements (id, client_id, site_id, headline, announcement_type, jse_code, released_at, body_html, is_price_sensitive, status, sponsor, created_at, updated_at)
          VALUES ('sens_live_1','tenant-a','site-a','Wire item','general','JSE: GFI','2026-10-01','<p>Wire</p>',1,'published','Sponsor','2026-10-01','2026-10-01')`,
  });
  h.user(ACTORS.reviewer);
  const response = await h.route('api/admin/ir/sens').GET(h.request('/api/admin/ir/sens', {}, null, 'GET'));
  const body = await response.json();
  const legacy = body.announcements.find(item => item.id === 'sens_live_1');
  assert.ok(legacy);
  assert.equal(legacy.status, 'published');
  assert.equal((await row(h, 'sens_live_1')).status, 'published');
});

test('the service default is a draft, so existing callers such as the production gates stay valid', async t => {
  const h = await fixture(t);
  const service = h.load('lib/ir/sensService.ts');
  const made = await service.createSensAnnouncement({ clientId: 'tenant-a', siteId: 'site-a', headline: 'Service created', bodyHtml: '<p>x</p>' });
  assert.equal(made.status, 'draft');
});
