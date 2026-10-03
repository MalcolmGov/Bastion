const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const APPROVAL_ERROR = /independent approval/i;
const CRON_SECRET = 'page-approval-test-secret-0001';

const USERS = {
  author: { id: 'author-a', name: 'Author A', role: 'content_editor', client_id: 'tenant-a' },
  reviewer: { id: 'reviewer-a', name: 'Reviewer A', role: 'reviewer', client_id: 'tenant-a' },
  publisher: { id: 'publisher-a', name: 'Publisher A', role: 'publisher', client_id: 'tenant-a' },
  admin: { id: 'agency-a', name: 'Agency Admin', role: 'platform_admin', client_id: null },
  admin2: { id: 'agency-b', name: 'Second Admin', role: 'platform_admin', client_id: null },
  reviewerB: { id: 'victim-b', name: 'Reviewer B', role: 'reviewer', client_id: 'tenant-b' },
};

const sections = (title = 'Hello') => [{ id: 'hero', componentId: 'hero', visible: true, props: { title }, styles: {} }];

async function fixture(t) {
  const h = await createHarness();
  const realError = console.error, realWarn = console.warn;
  console.error = () => {};
  console.warn = () => {};
  t.after(() => { console.error = realError; console.warn = realWarn; h.close(); });
  const { saveComposition } = h.load('lib/studio/editor/saveComposition.ts');
  const version = async () => Number((await h.db.execute("SELECT version FROM page_compositions WHERE id='page-a'")).rows[0].version);
  const save = async (user, extra = {}, expectedVersion) => saveComposition(user, {
    siteId: 'site-a', pageSlug: 'home', sections: sections(), expectedVersion: expectedVersion ?? await version(), ...extra,
  });
  const call = async (user, name, url, body, method = 'POST') => {
    h.user(user);
    const response = await h.route(name)[method](h.request(url, body, null, method));
    return { status: response.status, body: await response.json() };
  };
  const approve = (user, body = {}) => call(user, 'api/admin/editor/approve', '/api/admin/editor/approve', { siteId: 'site-a', pageSlug: 'home', ...body });
  const publish = async (user, extra = {}) => call(user, 'api/admin/editor', '/api/admin/editor', {
    siteId: 'site-a', pageSlug: 'home', sections: sections(), expectedVersion: await version(), status: 'published', ...extra,
  });
  const page = async (id = 'page-a') => (await h.db.execute({ sql: 'SELECT * FROM page_compositions WHERE id = ?', args: [id] })).rows[0];
  const versionRow = async v => (await h.db.execute({ sql: "SELECT * FROM page_versions WHERE site_id='site-a' AND page_slug='home' AND version = ?", args: [v] })).rows[0];
  return { h, save, approve, publish, call, page, versionRow, version };
}

// ---- the visual editor ----

test('a page cannot be published without an independent approval of exactly that content', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const result = await f.publish(USERS.publisher);
  assert.equal(result.status, 409);
  assert.equal(result.body.code, 'approval_required');
  assert.match(result.body.error, APPROVAL_ERROR);
  assert.equal((await f.page()).status, 'draft', 'unapproved page went live');
  assert.equal((await f.page()).version, 2);
});

test('a reviewer approves the saved draft, then a publisher can publish identical content', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const approved = await f.approve(USERS.reviewer, { version: 2 });
  assert.equal(approved.status, 200, JSON.stringify(approved.body));
  assert.equal(approved.body.approvedBy, 'reviewer-a');
  const row = await f.versionRow(2);
  assert.equal(row.approved_by, 'reviewer-a');
  assert.ok(row.approved_at && row.approved_content_hash);

  const published = await f.publish(USERS.publisher);
  assert.equal(published.status, 200, JSON.stringify(published.body));
  assert.equal((await f.page()).status, 'published');
  assert.equal((await f.page()).version, 3);
  const live = await f.versionRow(3);
  assert.equal(live.status, 'published');
  assert.equal(live.approved_by, 'reviewer-a', 'the published version does not record who approved it');
  assert.equal(live.approved_content_hash, row.approved_content_hash);
  const { getPublishedComposition } = f.h.load('lib/studio/editor/publishedComposition.ts');
  assert.equal(JSON.parse((await getPublishedComposition(f.h.db, 'site-a', 'home')).rows[0].sections_json)[0].props.title, 'Hello');
});

test('the author cannot approve their own version, including a platform admin', async t => {
  const f = await fixture(t);
  await f.save(USERS.admin);
  const own = await f.approve(USERS.admin, { version: 2 });
  assert.equal(own.status, 403);
  assert.match(own.body.error, /different|independent/i);
  assert.equal((await f.versionRow(2)).approved_by, null);
  assert.equal((await f.publish(USERS.admin)).status, 409, 'self-approved page went live');
  assert.equal((await f.approve(USERS.admin2, { version: 2 })).status, 200);
  assert.equal((await f.publish(USERS.admin)).status, 200);
});

test('only roles with the approve permission can approve a page', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  assert.equal((await f.approve(USERS.author, { version: 2 })).status, 403);
  assert.equal((await f.approve(USERS.publisher, { version: 2 })).status, 403);
  f.h.user(null);
  const anonymous = await f.h.route('api/admin/editor/approve').POST(f.h.request('/api/admin/editor/approve', { siteId: 'site-a', pageSlug: 'home', version: 2 }));
  assert.equal(anonymous.status, 401);
  assert.equal((await f.versionRow(2)).approved_by, null);
});

test('approval is bound to the exact title, layout, sections and metadata', async t => {
  const f = await fixture(t);
  await f.save(USERS.author, { title: 'About us', layoutCollection: 'editorial', meta: { description: 'Original' } });
  assert.equal((await f.approve(USERS.reviewer, { version: 2 })).status, 200);
  const base = { title: 'About us', layoutCollection: 'editorial', meta: { description: 'Original' } };
  for (const [what, change] of [
    ['title', { title: 'About us (changed)' }],
    ['layout', { layoutCollection: 'immersive' }],
    ['meta', { meta: { description: 'Changed' } }],
    ['sections', { sections: sections('Changed heading') }],
    ['extra section', { sections: [...sections(), { id: 'extra', componentId: 'text', visible: true, props: {}, styles: {} }] }],
  ]) {
    const result = await f.publish(USERS.publisher, { ...base, ...change });
    assert.equal(result.status, 409, `${what} changed after approval but still published`);
    assert.equal((await f.page()).status, 'draft');
  }
  const same = await f.publish(USERS.publisher, base);
  assert.equal(same.status, 200, JSON.stringify(same.body));
});

test('property order and whitespace do not invalidate an approval', async t => {
  const f = await fixture(t);
  await f.save(USERS.author, { sections: [{ id: 'hero', componentId: 'hero', visible: true, props: { title: 'T', subtitle: 'S' }, styles: {} }] });
  assert.equal((await f.approve(USERS.reviewer, { version: 2 })).status, 200);
  const reordered = [{ styles: {}, props: { subtitle: 'S', title: 'T' }, visible: true, componentId: 'hero', id: 'hero' }];
  assert.equal((await f.publish(USERS.publisher, { sections: reordered })).status, 200);
});

test('a newer draft needs its own approval and an old approval cannot be applied to it', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  assert.equal((await f.approve(USERS.reviewer, { version: 2 })).status, 200);
  await f.save(USERS.author); // identical content, but a new version
  assert.equal((await f.publish(USERS.publisher)).status, 409);
  const stale = await f.approve(USERS.reviewer, { version: 2 });
  assert.equal(stale.status, 409, 'approved a version that is no longer current');
  assert.equal((await f.approve(USERS.reviewer, { version: 3 })).status, 200);
  assert.equal((await f.publish(USERS.publisher)).status, 200);
});

test('approval refusals: wrong tenant, unknown page, bad input, already published', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  assert.equal((await f.approve(USERS.reviewerB, { version: 2 })).status, 404);
  assert.equal((await f.approve(USERS.reviewer, { pageSlug: 'nope', version: 1 })).status, 404);
  assert.equal((await f.approve(USERS.reviewer, { siteId: 'site-b', version: 1 })).status, 404);
  assert.equal((await f.approve(USERS.reviewer, { version: 'two' })).status, 400);
  assert.equal((await f.approve(USERS.reviewer, { version: 0 })).status, 400);
  assert.equal((await f.approve(USERS.reviewer, { pageSlug: '../x', version: 2 })).status, 400);
  assert.equal((await f.versionRow(2)).approved_by, null);
  await f.approve(USERS.reviewer, { version: 2 });
  await f.publish(USERS.publisher);
  assert.equal((await f.approve(USERS.reviewer, { version: 3 })).status, 409, 'approved a page that is already published');
});

test('a tampered approval record does not count', async t => {
  for (const [what, sql] of [
    ['approver is the author', "UPDATE page_versions SET approved_by = created_by WHERE version = 2"],
    ['no approver', 'UPDATE page_versions SET approved_by = NULL WHERE version = 2'],
    ['wrong hash', "UPDATE page_versions SET approved_content_hash = 'deadbeef' WHERE version = 2"],
    ['no hash', 'UPDATE page_versions SET approved_content_hash = NULL WHERE version = 2'],
  ]) {
    const f = await fixture(t);
    await f.save(USERS.author);
    await f.approve(USERS.reviewer, { version: 2 });
    await f.h.db.execute(sql);
    assert.equal((await f.publish(USERS.publisher)).status, 409, `${what}: page went live`);
    assert.equal((await f.page()).status, 'draft');
  }
});

test('a page that has never been saved cannot be published directly', async t => {
  const f = await fixture(t);
  const refused = await f.publish(USERS.publisher, { pageSlug: 'brand-new', expectedVersion: 0 });
  assert.equal(refused.status, 409);
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM page_compositions WHERE page_slug='brand-new'")).rows[0].c, 0);
  const draft = await f.call(USERS.author, 'api/admin/editor', '/api/admin/editor', { siteId: 'site-a', pageSlug: 'brand-new', sections: sections(), expectedVersion: 0, status: 'draft' });
  assert.equal(draft.status, 200);
});

test('drafts are unaffected: editors still save drafts and nothing is approved by saving', async t => {
  const f = await fixture(t);
  const saved = await f.save(USERS.author);
  assert.equal(saved.version, 2);
  const row = await f.versionRow(2);
  assert.equal(row.status, 'draft');
  assert.equal(row.approved_by, null);
  assert.equal((await f.page()).status, 'draft');
});

test('re-publishing content that is already live needs no new approval, but changing it does', async t => {
  const f = await fixture(t);
  await f.h.db.execute({ sql: "UPDATE page_compositions SET status='published', sections_json = ?, version = 4 WHERE id='page-a'", args: [JSON.stringify(sections('Live'))] });
  const unchanged = await f.publish(USERS.publisher, { sections: sections('Live') });
  assert.equal(unchanged.status, 200, JSON.stringify(unchanged.body));
  const changed = await f.publish(USERS.publisher, { sections: sections('Edited live') });
  assert.equal(changed.status, 409);
  const live = JSON.parse((await f.page()).sections_json);
  assert.equal(live[0].props.title, 'Live');
});

test('a seeded draft with no saved history can be approved by anyone who may approve and then published', async t => {
  const f = await fixture(t);
  // page-a is a seeded draft with version 1 and no page_versions row: nobody authored it through the editor.
  assert.equal((await f.approve(USERS.reviewer, { version: 1 })).status, 200);
  assert.equal((await f.publish(USERS.publisher, { sections: [], title: 'A Home', layoutCollection: 'contemporary' })).status, 200);
});

test('approving and publishing leave an audit trail', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  await f.approve(USERS.reviewer, { version: 2 });
  const audit = (await f.h.db.execute("SELECT actor_id, record_id, result, details_json FROM audit_log WHERE action = 'page_composition_approve'")).rows;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, 'reviewer-a');
  assert.equal(audit[0].record_id, 'page-a');
  assert.equal(audit[0].result, 'success');
  assert.equal(JSON.parse(audit[0].details_json).version, 2);
});

test('the approval status endpoint reports what the editor needs to show', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const url = '/api/admin/editor/approve?siteId=site-a&pageSlug=home';
  const asAuthor = await f.call(USERS.author, 'api/admin/editor/approve', url, undefined, 'GET');
  assert.equal(asAuthor.status, 200);
  assert.deepEqual(
    { v: asAuthor.body.version, status: asAuthor.body.status, approved: asAuthor.body.approved, canApprove: asAuthor.body.canApprove },
    { v: 2, status: 'draft', approved: false, canApprove: false },
  );
  const asReviewer = await f.call(USERS.reviewer, 'api/admin/editor/approve', url, undefined, 'GET');
  assert.equal(asReviewer.body.canApprove, true);
  await f.approve(USERS.reviewer, { version: 2 });
  const after = await f.call(USERS.publisher, 'api/admin/editor/approve', url, undefined, 'GET');
  assert.equal(after.body.approved, true);
  assert.equal(after.body.approvedByName, 'Reviewer A');
  await f.h.db.execute("UPDATE page_compositions SET title = 'Edited behind the back' WHERE id = 'page-a'");
  const stale = await f.call(USERS.publisher, 'api/admin/editor/approve', url, undefined, 'GET');
  assert.equal(stale.body.approved, false, 'status claims approval for content that changed after it');
  const other = await f.call(USERS.reviewerB, 'api/admin/editor/approve', url, undefined, 'GET');
  assert.equal(other.status, 404);
});

// ---- releases ----

async function releaseWithPage(f, pageId = 'page-a') {
  const service = f.h.load('lib/releases/service.ts');
  const release = await service.createRelease({ clientId: 'tenant-a', siteId: 'site-a', name: 'Page release' });
  await service.addItemToRelease(release.id, { itemType: 'page', itemId: pageId, title: 'Home' });
  return { service, release };
}

test('a release cannot publish a draft page that has no independent approval', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const { service, release } = await releaseWithPage(f);
  await assert.rejects(service.publishRelease(release.id, 'Publisher A'), APPROVAL_ERROR);
  assert.equal((await f.page()).status, 'draft', 'unapproved page went live through a release');
  assert.equal((await f.h.db.execute({ sql: 'SELECT status FROM content_releases WHERE id = ?', args: [release.id] })).rows[0].status, 'draft');

  const response = await (async () => {
    f.h.user(USERS.publisher);
    return f.h.route('api/admin/releases/[id]/publish').POST(f.h.request('/x', {}), { params: Promise.resolve({ id: release.id }) });
  })();
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, APPROVAL_ERROR);
});

test('a release publishes a page once its current version is independently approved', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const { service, release } = await releaseWithPage(f);
  await f.approve(USERS.reviewer, { version: 2 });
  await service.publishRelease(release.id, 'Publisher A');
  assert.equal((await f.page()).status, 'published');
});

test('an approval does not cover content that changed after it, even without a new version', async t => {
  const f = await fixture(t);
  await f.save(USERS.author);
  const { service, release } = await releaseWithPage(f);
  await f.approve(USERS.reviewer, { version: 2 });
  await f.h.db.execute({ sql: "UPDATE page_compositions SET sections_json = ? WHERE id = 'page-a'", args: [JSON.stringify(sections('Swapped in'))] });
  await assert.rejects(service.publishRelease(release.id, 'Publisher A'), APPROVAL_ERROR);
  assert.equal((await f.page()).status, 'draft');
});

test('a release containing an already-live page is not blocked by it', async t => {
  const f = await fixture(t);
  await f.h.db.execute("UPDATE page_compositions SET status = 'published' WHERE id = 'page-a'");
  const { service, release } = await releaseWithPage(f);
  await service.publishRelease(release.id, 'Publisher A');
  assert.equal((await f.page()).status, 'published');
});

test('one unapproved page holds back the whole release and nothing in it is published', async t => {
  const f = await fixture(t);
  await f.h.db.execute("INSERT INTO page_compositions VALUES('page-about','site-a','about','About','contemporary','[]',NULL,1,'draft','2026-10-01','2026-10-01')");
  await f.save(USERS.author);
  await f.approve(USERS.reviewer, { version: 2 });
  const { service, release } = await releaseWithPage(f);
  await service.addItemToRelease(release.id, { itemType: 'page', itemId: 'page-about', title: 'About' });
  await assert.rejects(service.publishRelease(release.id, 'Publisher A'), APPROVAL_ERROR);
  assert.equal((await f.page()).status, 'draft');
  assert.equal((await f.page('page-about')).status, 'draft');
});

// ---- scheduled releases (legacy cron table) ----

test('the scheduled-release cron holds back a release whose page is not independently approved', async t => {
  const f = await fixture(t);
  const realSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = CRON_SECRET;
  t.after(() => { if (realSecret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = realSecret; });
  await f.h.db.execute('ALTER TABLE audit_log ADD COLUMN correlation_id TEXT');
  await f.h.db.execute('ALTER TABLE audit_log ADD COLUMN ip_address TEXT');
  await f.h.db.execute('CREATE TABLE releases(id TEXT PRIMARY KEY, name TEXT, client_id TEXT, scheduled_at TEXT, status TEXT, published_at TEXT)');
  await f.h.db.execute('CREATE TABLE release_items(release_id TEXT, item_type TEXT, item_id TEXT, action TEXT)');
  await f.h.db.execute("CREATE TABLE scheduled_jobs(id TEXT PRIMARY KEY, record_id TEXT, revision_id TEXT, scheduled_for TEXT, status TEXT, executed_at TEXT, error_message TEXT, created_at TEXT)");
  await f.save(USERS.author);
  await f.h.db.execute("INSERT INTO releases VALUES('rel-1','Scheduled','tenant-a','2020-01-01T00:00:00.000Z','scheduled',NULL)");
  await f.h.db.execute("INSERT INTO release_items VALUES('rel-1','page','page-a','publish')");
  const run = async () => {
    const res = await f.h.route('api/cron/releases').POST(f.h.request('/api/cron/releases', {}, CRON_SECRET));
    assert.equal(res.status, 200);
  };
  await run();
  assert.equal((await f.page()).status, 'draft', 'unapproved page went live through the cron');
  assert.equal((await f.h.db.execute("SELECT status FROM releases WHERE id='rel-1'")).rows[0].status, 'scheduled');
  await f.approve(USERS.reviewer, { version: 2 });
  await run();
  assert.equal((await f.page()).status, 'published');
  assert.equal((await f.h.db.execute("SELECT status FROM releases WHERE id='rel-1'")).rows[0].status, 'published');
});

// ---- MCP ----

async function mcp(f, name, args) {
  f.h.user(USERS.admin);
  const response = await f.h.route('api/mcp').POST(f.h.request('/api/mcp', { method: 'tools/call', params: { name, arguments: args } }));
  return (await response.json()).result;
}

test('MCP save_page_composition cannot publish a page, even for an agency caller', async t => {
  const f = await fixture(t);
  const before = await f.page();
  const result = await mcp(f, 'save_page_composition', { siteId: 'site-a', pageSlug: 'home', title: 'Hijacked', sections: sections('Hijacked'), status: 'published' });
  assert.equal(result.isError, true);
  assert.match(JSON.stringify(result.content), /approval/i);
  const after = await f.page();
  assert.equal(after.status, before.status);
  assert.equal(after.sections_json, before.sections_json);
  assert.equal((await f.h.db.execute("SELECT COUNT(*) AS c FROM page_compositions WHERE title = 'Hijacked'")).rows[0].c, 0);
});

test('MCP save_page_composition still saves drafts', async t => {
  const f = await fixture(t);
  const result = await mcp(f, 'save_page_composition', { siteId: 'site-a', pageSlug: 'about-mcp', title: 'About', sections: sections() });
  assert.equal(result.isError, false);
  assert.equal((await f.h.db.execute("SELECT status FROM page_compositions WHERE page_slug='about-mcp'")).rows[0].status, 'draft');
});
