const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

async function fixture(t) {
  const h = await createHarness();
  t.after(() => h.close());
  return h;
}
function agency(h) { h.user({ role: 'platform_admin', client_id: null }); }
function reviewer(h) { h.user({ role: 'reviewer', client_id: 'tenant-a' }); }
async function mcp(h, token, name, args) {
  const response = await h.route('api/mcp').POST(h.request('/api/mcp', {
    method: 'tools/call', params: { name, arguments: args }
  }, token));
  return (await response.json()).result;
}
async function graph(h, token, query, method = 'POST') {
  const route = h.route('api/graphql');
  const url = method === 'GET' ? `/api/graphql?query=${encodeURIComponent(query)}` : '/api/graphql';
  return (await route[method](h.request(url, { query }, token, method))).json();
}
async function status(h, table, id) {
  return (await h.db.execute({ sql: `SELECT status FROM ${table} WHERE id = ?`, args: [id] })).rows[0].status;
}

test('read-only users cannot invite, reset existing users, or manage API tokens', async (t) => {
  const h = await fixture(t);
  for (const [path, body] of [
    ['api/admin/users/invite', { name: 'Attacker', email: 'victim-b@test.local', role: 'publisher', clientId: 'tenant-a' }],
    ['api/admin/users/resend-welcome', { email: 'victim-b@test.local' }],
    ['api/admin/settings/tokens', { name: 'Escalation', scopes: ['*'] }]
  ]) {
    const response = await h.route(path).POST(h.request('/' + path, body));
    assert.equal(response.status, 403);
  }
  for (const method of ['GET', 'DELETE']) {
    const response = await h.route('api/admin/settings/tokens')[method](h.request('/api/admin/settings/tokens?id=other', {}, null, method));
    assert.equal(response.status, 403);
  }
  const user = (await h.db.execute("SELECT role, client_id, invite_token FROM users WHERE id='victim-b'")).rows[0];
  assert.deepEqual({ ...user }, { role: 'reviewer', client_id: 'tenant-b', invite_token: null });
  assert.equal(h.emailCalls(), 0);
});

test('agency invitations enforce valid roles and prevent accidental tenant reassignment', async (t) => {
  const h = await fixture(t); agency(h);
  const route = h.route('api/admin/users/invite');
  for (const [role, clientId, expected] of [['publisher', 'tenant-a', 409], ['invented-role', 'tenant-b', 400]]) {
    assert.equal((await route.POST(h.request('/api/admin/users/invite', { name: 'User', email: 'victim-b@test.local', role, clientId }))).status, expected);
  }
  const response = await route.POST(h.request('/api/admin/users/invite', { name: 'User', email: 'victim-b@test.local', role: 'reviewer', clientId: 'tenant-b' }));
  assert.equal(response.status, 200);
  assert.ok((await response.json()).inviteToken);
  assert.equal(h.emailCalls(), 1);
});

test('agency token creation validates scopes and site ownership', async (t) => {
  const h = await fixture(t); agency(h);
  const route = h.route('api/admin/settings/tokens');
  for (const body of [
    { name: 'Bad scope', clientId: 'tenant-a', scopes: ['admin:write'] },
    { name: 'Bad site', clientId: 'tenant-a', siteId: 'site-b', scopes: ['content:read'] }
  ]) assert.equal((await route.POST(h.request('/api/admin/settings/tokens', body))).status, 400);
  const response = await route.POST(h.request('/api/admin/settings/tokens', { name: 'Reader', clientId: 'tenant-a', siteId: 'site-a', scopes: ['content:read'] }));
  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.record.siteId, 'site-a');
  assert.equal(json.record.clientId, 'tenant-a');
});

test('scoped MCP reads stay inside the tenant and site', async (t) => {
  const h = await fixture(t);
  const token = await h.token(['mcp:access', 'content:read'], 'site-a');
  const own = await mcp(h, token, 'get_entry', { id: 'record-a' });
  assert.equal(own.isError, false);
  assert.match(own.content[0].text, /unpublished A/);
  for (const id of ['record-b', 'record-a2']) assert.equal((await mcp(h, token, 'get_entry', { id })).isError, true);
  const queried = await mcp(h, token, 'query_content', { collection: 'reports' });
  assert.equal(queried.isError, false);
  assert.deepEqual(JSON.parse(queried.content[0].text).entries.map(x => x.id), ['record-a']);
  const clients = await mcp(h, token, 'list_clients', {});
  assert.deepEqual(JSON.parse(clients.content[0].text).clients.map(x => x.id), ['tenant-a']);
  const response = await h.route('api/mcp').POST(h.request('/api/mcp', { method: 'resources/read', params: { uri: 'bastion://clients' } }, token));
  assert.deepEqual(JSON.parse((await response.json()).result.contents[0].text).clients.map(x => x.id), ['tenant-a']);
});

test('MCP write scopes cannot be obtained from mcp:access alone, and wildcard stays tenant scoped', async (t) => {
  const h = await fixture(t);
  const readToken = await h.token(['mcp:access', 'content:read']);
  for (const [name, args] of [
    ['update_entry', { id: 'record-a', data: {} }],
    ['publish_entry', { id: 'record-a' }],
    ['save_page_composition', { siteId: 'site-a', pageSlug: 'home', sections: [] }],
    ['extract_brand_dna', { githubRepo: 'some/repo' }]
  ]) assert.equal((await mcp(h, readToken, name, args)).isError, true);
  const writeToken = await h.token(['*']);
  for (const [name, args] of [
    ['update_entry', { id: 'record-b', data: {} }],
    ['publish_entry', { id: 'record-b' }],
    ['save_page_composition', { siteId: 'site-b', pageSlug: 'home', sections: [] }],
    ['create_entry', { collection: 'pages', title: 'Bad', siteId: 'site-b', data: {} }]
  ]) assert.equal((await mcp(h, writeToken, name, args)).isError, true);
  assert.equal(await status(h, 'content_records', 'record-b'), 'draft');
  assert.equal(await status(h, 'page_compositions', 'page-b'), 'draft');
});

test('authorized MCP writes stamp ownership and require independent approval for reports', async (t) => {
  const h = await fixture(t);
  const token = await h.token(['*'], 'site-a');
  const created = await mcp(h, token, 'create_entry', { collection: 'pages', title: 'Owned', siteId: 'site-a', data: { text: 'Own' } });
  assert.equal(created.isError, false);
  const id = JSON.parse(created.content[0].text).id;
  const row = (await h.db.execute({ sql: 'SELECT client_id,site_id,status FROM content_records WHERE id = ?', args: [id] })).rows[0];
  assert.deepEqual({ ...row }, { client_id: 'tenant-a', site_id: 'site-a', status: 'draft' });
  assert.equal((await mcp(h, token, 'update_entry', { id, data: { text: 'Edited' } })).isError, false);
  assert.equal((await mcp(h, token, 'publish_entry', { id })).isError, false);
  assert.equal((await mcp(h, token, 'publish_entry', { id: 'record-a' })).isError, true);
  await h.db.execute("INSERT INTO approvals VALUES('approval-a','revision-a','reviewer-a','approved','hash')");
  assert.equal((await mcp(h, token, 'publish_entry', { id: 'record-a' })).isError, false);
  const report = await mcp(h, token, 'create_entry', { collection: 'reports', title: 'API draft', siteId: 'site-a', data: { guidance: 'Draft' } });
  assert.equal(report.isError, false);
  const reportId = JSON.parse(report.content[0].text).id;
  const revision = (await h.db.execute({ sql: 'SELECT r.id,r.content_hash,r.author_id FROM revisions r JOIN content_records c ON c.current_draft_revision_id=r.id WHERE c.id=?', args: [reportId] })).rows[0];
  assert.equal(revision.author_id, null); // Integrations have no synthetic user foreign key.
  await h.db.execute({ sql: 'INSERT INTO approvals VALUES(?,?,?,?,?)', args: ['api-approval', revision.id, 'reviewer-a', 'approved', revision.content_hash] });
  assert.equal((await mcp(h, token, 'publish_entry', { id: reportId })).isError, false);
});

test('GraphQL GET and POST constrain pages including explicit site overrides', async (t) => {
  const h = await fixture(t);
  const clientToken = await h.token(['graphql:read']);
  const siteToken = await h.token(['graphql:read'], 'site-a');
  for (const method of ['GET', 'POST']) {
    assert.deepEqual((await graph(h, clientToken, '{ pages(status:"draft") { id } }', method)).data.pages.map(x => x.id).sort(), ['page-a', 'page-a2']);
    assert.deepEqual((await graph(h, siteToken, '{ pages { id } }', method)).data.pages.map(x => x.id), ['page-a']);
    assert.deepEqual((await graph(h, clientToken, '{ pages(siteId:"site-b") { id } }', method)).data.pages, []);
    assert.equal((await graph(h, siteToken, '{ page(slug:"home", siteId:"site-a2") { id } }', method)).data.page, null);
  }
});

test('GraphQL collections, media and releases enforce tenant/site filters', async (t) => {
  const h = await fixture(t);
  for (const [id, site, tenant] of [['rel-a', 'site-a', 'tenant-a'], ['rel-b', 'site-b', 'tenant-b'], ['rel-a2', 'site-a2', 'tenant-a']]) {
    await h.db.execute({ sql: 'INSERT INTO content_releases(id,site_id,client_id,name,status) VALUES(?,?,?,?,?)', args: [id, site, tenant, id, 'draft'] });
  }
  await h.db.executeMultiple(`
    INSERT INTO content_records(id,collection,slug,title,status,site_id,client_id) VALUES
      ('op-a','operations','own-op','Own operation','published','site-a','tenant-a'),
      ('op-b','operations','other-op','Other operation','published','site-b','tenant-b'),
      ('news-a','news','own-news','Own news','published','site-a','tenant-a'),
      ('news-b','news','other-news','Other news','published','site-b','tenant-b');
  `);
  const token = await h.token(['graphql:read'], 'site-a');
  const result = await graph(h, token, '{ reports { id } operations { id } news { id } releases { id } mediaAssets { id } mediaAsset(id:"media-b") { id } release(id:"rel-b") { id } }');
  assert.equal(result.errors, undefined);
  assert.deepEqual(result.data.reports.map(x => x.id), ['record-a']);
  assert.deepEqual(result.data.operations.map(x => x.id), ['op-a']);
  assert.deepEqual(result.data.news.map(x => x.id), ['news-a']);
  const singles = await graph(h, token, '{ ownOp: operation(slug:"own-op") { id } otherOp: operation(slug:"other-op") { id } ownNews: newsArticle(slug:"own-news") { id } otherNews: newsArticle(slug:"other-news") { id } }');
  assert.equal(singles.data.ownOp.id, 'op-a');
  assert.equal(singles.data.otherOp, null);
  assert.equal(singles.data.ownNews.id, 'news-a');
  assert.equal(singles.data.otherNews, null);
  assert.deepEqual(result.data.releases.map(x => x.id), ['rel-a']);
  assert.deepEqual(result.data.mediaAssets.map(x => x.id), ['media-a']);
  assert.equal(result.data.mediaAsset, null);
  assert.equal(result.data.release, null);
});

test('GraphQL nested media and same-slug releases cannot cross tenant boundaries', async (t) => {
  const h = await fixture(t);
  await h.db.execute(`UPDATE page_compositions SET meta_json='{"ogImage":"/b.png"}',sections_json='[{"id":"hero","data":{"imageUrl":"/b.png"}}]' WHERE id='page-a'`);
  await h.db.execute("INSERT INTO content_releases(id,site_id,client_id,name,status) VALUES('rel-b','site-b','tenant-b','B','draft')");
  await h.db.execute("INSERT INTO content_release_items(id,release_id,item_type,item_id,title) VALUES('item-b','rel-b','page','home','Secret B')");
  const token = await h.token(['graphql:read'], 'site-a');
  const result = await graph(h, token, '{ page(slug:"home") { featuredMedia { id } dynamicZones { featuredMedia { id } } bundledRelease { id } } }');
  assert.equal(result.errors, undefined);
  assert.equal(result.data.page.featuredMedia, null);
  assert.equal(result.data.page.dynamicZones[0].featuredMedia, null);
  assert.equal(result.data.page.bundledRelease, null);
});

test('REST page lists and individual pages reject site overrides and preserve valid reads', async (t) => {
  const h = await fixture(t);
  const token = await h.token(['content:read']);
  const list = h.route('api/content/[collection]');
  const single = h.route('api/content/[collection]/[slug]');
  const listResult = await (await list.GET(h.request('/api/content/pages?siteId=site-b&preview=true', null, token, 'GET'), { params: Promise.resolve({ collection: 'pages' }) })).json();
  assert.deepEqual(listResult.items, []);
  assert.equal((await single.GET(h.request('/api/content/pages/home?siteId=site-b&preview=true', null, token, 'GET'), { params: Promise.resolve({ collection: 'pages', slug: 'home' }) })).status, 404);
  const own = await (await single.GET(h.request('/api/content/pages/home?siteId=site-a&preview=true', null, token, 'GET'), { params: Promise.resolve({ collection: 'pages', slug: 'home' }) })).json();
  assert.equal(own.id, 'page-a');
  const siteToken = await h.token(['content:read'], 'site-a');
  const reports = await (await list.GET(h.request('/api/content/reports?preview=true', null, siteToken, 'GET'), { params: Promise.resolve({ collection: 'reports' }) })).json();
  assert.deepEqual(reports.items.map(x => x.id), ['record-a']);
});

test('release publishing resolves slugs only within its tenant/site and promotes the correct revision', async (t) => {
  const h = await fixture(t);
  const service = h.load('lib/releases/service.ts');
  const release = await service.createRelease({ clientId: 'tenant-a', siteId: 'site-a', name: 'A release' });
  const item = await service.addItemToRelease(release.id, { itemType: 'page', itemId: 'home', title: 'Home' });
  assert.equal(item.itemId, 'page-a');
  await assert.rejects(service.addItemToRelease(release.id, { itemType: 'page', itemId: 'page-b', title: 'Bad' }), /workspace/);
  await service.addItemToRelease(release.id, { itemType: 'report', itemId: 'record-a', title: 'Report' });
  await h.db.execute("INSERT INTO approvals VALUES('release-approval','revision-a','reviewer-a','approved','hash')");
  await h.approvePage();
  await service.publishRelease(release.id, 'A publisher');
  assert.equal(await status(h, 'page_compositions', 'page-a'), 'published');
  assert.equal(await status(h, 'page_compositions', 'page-b'), 'draft');
  assert.equal(await status(h, 'page_compositions', 'page-a2'), 'draft');
  assert.equal((await h.db.execute("SELECT current_published_revision_id FROM content_records WHERE id='record-a'")).rows[0].current_published_revision_id, 'revision-a');
});

test('legacy cross-tenant release items fail atomically at publication time', async (t) => {
  const h = await fixture(t);
  const service = h.load('lib/releases/service.ts');
  const release = await service.createRelease({ clientId: 'tenant-a', siteId: 'site-a', name: 'Legacy bad bundle' });
  await service.addItemToRelease(release.id, { itemType: 'page', itemId: 'page-a', title: 'Good' });
  await h.db.execute({ sql: 'INSERT INTO content_release_items(id,release_id,item_type,item_id,title,created_at) VALUES(?,?,?,?,?,?)', args: ['legacy-b', release.id, 'report', 'record-b', 'Bad', '2099'] });
  await assert.rejects(service.publishRelease(release.id), /workspace/);
  assert.equal(await status(h, 'page_compositions', 'page-a'), 'draft');
  assert.equal(await status(h, 'content_records', 'record-b'), 'draft');
  assert.equal(await status(h, 'content_releases', release.id), 'draft');
});

test('read-only users cannot mutate or schedule releases', async (t) => {
  const h = await fixture(t);
  for (const [path, method, body] of [
    ['api/admin/releases', 'POST', { name: 'Bad', scheduledAt: '2026-10-01' }],
    ['api/admin/releases/[id]', 'PUT', { status: 'scheduled' }],
    ['api/admin/releases/[id]', 'DELETE', {}],
    ['api/admin/releases/[id]/items', 'POST', { itemType: 'page', itemId: 'page-a', title: 'A' }]
  ]) assert.equal((await h.route(path)[method](h.request('/releases', body, null, method), { params: Promise.resolve({ id: 'any' }) })).status, 403);
});

test('ethics reads and writes require investigator permissions and case ownership', async (t) => {
  const h = await fixture(t);
  const listing = h.route('api/admin/ethics');
  const patch = h.route('api/admin/ethics/[id]');
  assert.equal((await listing.GET(h.request('/api/admin/ethics', null, null, 'GET'))).status, 403);
  assert.equal((await patch.PATCH(h.request('/ethics', { status: 'resolved' }, null, 'PATCH'), { params: Promise.resolve({ id: 'case-b' }) })).status, 403);
  reviewer(h);
  assert.equal((await patch.PATCH(h.request('/ethics', { status: 'resolved' }, null, 'PATCH'), { params: Promise.resolve({ id: 'case-b' }) })).status, 404);
  assert.equal((await listing.POST(h.request('/ethics', { reportId: 'case-b', message: 'Injected' }))).status, 404);
  assert.equal(await status(h, 'whistleblower_reports', 'case-b'), 'received');
  const reports = await (await listing.GET(h.request('/api/admin/ethics?clientId=tenant-b', null, null, 'GET'))).json();
  assert.deepEqual(reports.reports.map(x => x.id), ['case-a']);
  assert.equal((await patch.PATCH(h.request('/ethics', { status: 'made-up' }, null, 'PATCH'), { params: Promise.resolve({ id: 'case-a' }) })).status, 400);
  assert.equal((await patch.PATCH(h.request('/ethics', { status: 'resolved' }, null, 'PATCH'), { params: Promise.resolve({ id: 'case-a' }) })).status, 200);
  assert.equal((await listing.POST(h.request('/ethics', { reportId: 'case-a', message: 'Authorized reply' }))).status, 200);
});


test('missing sessions and API credentials fail closed while agency access remains available', async (t) => {
  const h = await fixture(t);
  h.user(null);
  assert.equal((await h.route('api/admin/users/invite').POST(h.request('/invite', {}))).status, 401);
  assert.equal((await h.route('api/mcp').POST(h.request('/api/mcp', { method: 'tools/list' }))).status, 401);
  assert.equal((await h.route('api/graphql').POST(h.request('/api/graphql', { query: '{ pages { id } }' }))).status, 401);
  agency(h);
  const own = await mcp(h, null, 'get_entry', { id: 'record-b' });
  assert.equal(own.isError, false);
});

test('release bundles cannot bypass approval of the current disclosure revision', async (t) => {
  const h = await fixture(t);
  const service = h.load('lib/releases/service.ts');
  const release = await service.createRelease({ clientId: 'tenant-a', siteId: 'site-a', name: 'Unapproved report' });
  await service.addItemToRelease(release.id, { itemType: 'report', itemId: 'record-a', title: 'Report' });
  await assert.rejects(service.publishRelease(release.id), /Independent approval/);
  await h.db.execute("INSERT INTO approvals VALUES('stale','revision-a','reviewer-a','approved','old-hash')");
  await assert.rejects(service.publishRelease(release.id), /Independent approval/);
  assert.equal(await status(h, 'content_records', 'record-a'), 'draft');
});
