const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const APPROVAL_ERROR = /independent approval/i;
let seq = 0;

const ACTORS = {
  publisher: { id: 'publisher-a', name: 'Publisher A', role: 'publisher', client_id: 'tenant-a' },
  agency: { id: 'agency-a', name: 'Agency Admin', role: 'platform_admin', client_id: null },
};

async function fixture(t) {
  const h = await createHarness();
  const realError = console.error;
  console.error = () => {};
  t.after(() => { console.error = realError; h.close(); });
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN correlation_id TEXT');
  await h.db.execute('ALTER TABLE audit_log ADD COLUMN ip_address TEXT');
  await h.db.execute(`INSERT INTO users(id,name,email,role,client_id) VALUES
    ('publisher-a','Publisher A','publisher-a@test.local','publisher','tenant-a'),
    ('agency-a','Agency Admin','agency-a@test.local','platform_admin',NULL)`);
  return h;
}

async function addRecord(h, { collection = 'reports', author = 'author-a' } = {}) {
  const n = ++seq, rec = `rec-${n}`, rev = `rev-${n}`, hash = `hash-${n}`;
  await h.db.execute({ sql: 'INSERT INTO content_records VALUES(?,?,?,?,?,NULL,?,?,?,?,?)', args: [rec, collection, `slug-${n}`, `Title ${n}`, 'approved', rev, 'site-a', 'tenant-a', '2026-10-01', '2026-10-01'] });
  await h.db.execute({ sql: 'INSERT INTO revisions VALUES(?,?,?,?,?,?,?,?,NULL)', args: [rev, rec, 1, '{}', hash, author, '2026-10-01', 'approved'] });
  return { rec, rev, hash, collection };
}

const approve = (h, { rev, hash }, reviewer = 'reviewer-a', contentHash = hash, decision = 'approved') =>
  h.db.execute({ sql: 'INSERT INTO approvals VALUES(?,?,?,?,?)', args: [`appr-${++seq}`, rev, reviewer, decision, contentHash] });

const record = async (h, rec) => (await h.db.execute({ sql: 'SELECT * FROM content_records WHERE id = ?', args: [rec] })).rows[0];
const isLive = async (h, { rec, rev }) => (await record(h, rec)).current_published_revision_id === rev;

async function publishViaWorkflow(h, r, actor = 'publisher') {
  h.user(ACTORS[actor]);
  const response = await h.route('api/admin/content/[collection]/[id]/workflow').POST(
    h.request(`/api/admin/content/${r.collection}/${r.rec}/workflow`, { action: 'publish' }),
    { params: Promise.resolve({ collection: r.collection, id: r.rec }) }
  );
  return { status: response.status, body: await response.json() };
}

async function mcp(h, name, args) {
  h.user(ACTORS.agency); // an agency session: mcpAuthorized treats it as isAgencyAdmin with every scope
  const response = await h.route('api/mcp').POST(h.request('/api/mcp', { method: 'tools/call', params: { name, arguments: args } }));
  return (await response.json()).result;
}

// ---- workflow route: the "publish" action ----

for (const collection of ['reports', 'news']) {
  for (const actor of ['publisher', 'agency']) {
    test(`workflow publish refuses ${collection} with no approval, even for the ${actor}`, async t => {
      const h = await fixture(t);
      const r = await addRecord(h, { collection });
      const result = await publishViaWorkflow(h, r, actor);
      assert.equal(result.status, 400);
      assert.match(String(result.body.error), APPROVAL_ERROR);
      assert.equal(await isLive(h, r), false, 'unapproved disclosure went live');
      assert.equal((await record(h, r.rec)).status, 'approved');
    });

    test(`workflow publish allows ${collection} once an independent approval of the current content exists (${actor})`, async t => {
      const h = await fixture(t);
      const r = await addRecord(h, { collection });
      await approve(h, r);
      const result = await publishViaWorkflow(h, r, actor);
      assert.equal(result.status, 200);
      assert.equal(await isLive(h, r), true);
      assert.equal((await record(h, r.rec)).status, 'published');
    });
  }

  test(`workflow publish refuses ${collection} whose only approval is the author's, stale, or a rejection`, async t => {
    const h = await fixture(t);
    const selfApproved = await addRecord(h, { collection });
    await approve(h, selfApproved, 'author-a');
    const stale = await addRecord(h, { collection });
    await approve(h, stale, 'reviewer-a', 'hash-of-older-content');
    const rejected = await addRecord(h, { collection });
    await approve(h, rejected, 'reviewer-a', rejected.hash, 'rejected');
    for (const r of [selfApproved, stale, rejected]) {
      const result = await publishViaWorkflow(h, r, 'publisher');
      assert.equal(result.status, 400);
      assert.equal(await isLive(h, r), false, 'disclosure went live without a valid approval');
    }
  });
}

test('workflow publish still publishes content outside the disclosure collections without an approval', async t => {
  const h = await fixture(t);
  const r = await addRecord(h, { collection: 'operations' });
  const result = await publishViaWorkflow(h, r, 'publisher');
  assert.equal(result.status, 200);
  assert.equal(await isLive(h, r), true);
});

test('workflow publish still needs the content:publish permission', async t => {
  const h = await fixture(t);
  const r = await addRecord(h, { collection: 'operations' });
  h.user({ id: 'editor-a', name: 'Editor A', role: 'content_editor', client_id: 'tenant-a' });
  const response = await h.route('api/admin/content/[collection]/[id]/workflow').POST(
    h.request(`/api/admin/content/${r.collection}/${r.rec}/workflow`, { action: 'publish' }),
    { params: Promise.resolve({ collection: r.collection, id: r.rec }) }
  );
  assert.equal(response.status, 403);
  assert.equal(await isLive(h, r), false);
});

// ---- MCP tools, called as an agency session (which previously skipped the checks) ----

for (const collection of ['reports', 'news']) {
  test(`MCP publish_entry refuses ${collection} with no approval for an agency caller`, async t => {
    const h = await fixture(t);
    const r = await addRecord(h, { collection });
    const result = await mcp(h, 'publish_entry', { id: r.rec });
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result.content), APPROVAL_ERROR);
    assert.equal(await isLive(h, r), false, 'unapproved disclosure went live');
  });

  test(`MCP publish_entry publishes ${collection} for an agency caller once independently approved`, async t => {
    const h = await fixture(t);
    const r = await addRecord(h, { collection });
    await approve(h, r);
    const result = await mcp(h, 'publish_entry', { id: r.rec });
    assert.equal(result.isError, false);
    assert.equal(await isLive(h, r), true);
  });

  test(`MCP create_entry cannot create ${collection} that are already published, for an agency caller`, async t => {
    const h = await fixture(t);
    const result = await mcp(h, 'create_entry', { collection, title: 'Straight to live', siteId: 'site-a', data: { body: 'x' }, status: 'published' });
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result.content), /drafts and independently approved/i);
    const created = await h.db.execute({ sql: "SELECT COUNT(*) AS c FROM content_records WHERE title = 'Straight to live'" });
    assert.equal(Number(created.rows[0].c), 0, 'a published disclosure record was created');
  });
}

test('MCP publish_entry and create_entry still publish non-disclosure content without an approval for an agency caller', async t => {
  const h = await fixture(t);
  const r = await addRecord(h, { collection: 'operations' });
  assert.equal((await mcp(h, 'publish_entry', { id: r.rec })).isError, false);
  assert.equal(await isLive(h, r), true);
  const created = await mcp(h, 'create_entry', { collection: 'operations', title: 'Live ops note', siteId: 'site-a', data: { body: 'x' }, status: 'published' });
  assert.equal(created.isError, false);
});

test('MCP draft creation of disclosures is unaffected', async t => {
  const h = await fixture(t);
  const created = await mcp(h, 'create_entry', { collection: 'reports', title: 'Draft report', siteId: 'site-a', data: { body: 'x' } });
  assert.equal(created.isError, false);
  const row = (await h.db.execute({ sql: "SELECT status, current_published_revision_id FROM content_records WHERE title = 'Draft report'" })).rows[0];
  assert.equal(row.status, 'draft');
  assert.equal(row.current_published_revision_id, null);
});
