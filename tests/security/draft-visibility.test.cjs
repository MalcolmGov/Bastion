const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const AGENCY_SECRET = 'agency-server-secret-0123456789';
const READ_ONLY = ['content:read', 'graphql:read'];
const EDITOR = ['content:read', 'graphql:read', 'content:edit'];
const SECRETS = ['SECRET-DRAFT-TEXT', 'SECRET-V2-TEXT', 'SECRET-V2-TITLE', 'SECRET-DRAFT-REPORT', 'SECRET embargoed', 'SECRET scheduled', 'SECRET-YEAR'];
const COLLECTIONS = ['reports', 'news', 'operations'];

const sections = text => JSON.stringify([{ id: 's1', componentId: 'hero', props: { text } }]);

async function fixture(t) {
  const h = await createHarness();
  const saved = process.env.API_SECRET_TOKEN;
  process.env.API_SECRET_TOKEN = AGENCY_SECRET;
  const realWarn = console.warn, realError = console.error;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    if (saved === undefined) delete process.env.API_SECRET_TOKEN; else process.env.API_SECRET_TOKEN = saved;
    console.warn = realWarn;
    console.error = realError;
    h.close();
  });
  const run = (sql, ...args) => h.db.execute({ sql, args });
  const page = (id, site, slug, title, text, version, status) => run(
    `INSERT INTO page_compositions VALUES(?,?,?,?,'contemporary',?,NULL,?,?,'2026-09-01','2026-09-02')`, id, site, slug, title, sections(text), version, status);
  const version = (id, comp, site, slug, title, text, number, status) => run(
    `INSERT INTO page_versions(id,composition_id,site_id,page_slug,version,title,layout_collection,sections_json,status,created_at) VALUES(?,?,?,?,?,?,'contemporary',?,?,'2026-09-02')`,
    id, comp, site, slug, number, title, sections(text), status);

  // Published and current.
  await page('p-live', 'site-a', 'live', 'Live page', 'LIVE-TEXT', 3, 'published');
  await version('pv-live-3', 'p-live', 'site-a', 'live', 'Live page', 'LIVE-TEXT', 3, 'published');
  // Never published.
  await page('p-secret', 'site-a', 'secret-draft', 'Secret draft page', 'SECRET-DRAFT-TEXT', 1, 'draft');
  await version('pv-secret-1', 'p-secret', 'site-a', 'secret-draft', 'Secret draft page', 'SECRET-DRAFT-TEXT', 1, 'draft');
  // Live at version 1 while a new draft, version 2, is being written. The public site keeps serving version 1.
  await page('p-rev', 'site-a', 'revising', 'SECRET-V2-TITLE', 'SECRET-V2-TEXT', 2, 'draft');
  await version('pv-rev-1', 'p-rev', 'site-a', 'revising', 'Revising page', 'V1-LIVE-TEXT', 1, 'published');
  await version('pv-rev-2', 'p-rev', 'site-a', 'revising', 'SECRET-V2-TITLE', 'SECRET-V2-TEXT', 2, 'draft');
  // Another tenant.
  await page('p-b-live', 'site-b', 'b-live', 'B live', 'B-LIVE-TEXT', 1, 'published');
  await version('pv-b-live-1', 'p-b-live', 'site-b', 'b-live', 'B live', 'B-LIVE-TEXT', 1, 'published');
  await page('p-b-draft', 'site-b', 'b-draft', 'B draft', 'SECRET-B-DRAFT', 1, 'draft');

  // Records: live, never published, live with a newer draft, archived.
  for (const col of COLLECTIONS) {
    const record = (slug, title, status, published, draft) => run(
      `INSERT INTO content_records VALUES(?,?,?,?,?,?,?,'site-a','tenant-a','2026-09-01','2026-09-02')`, `rec-${col}-${slug}`, col, slug, title, status, published, draft);
    const revision = (slug, number, data, status) => run(
      `INSERT INTO revisions VALUES(?,?,?,?,'hash','author-a','2026-09-01',?,NULL)`, `rev-${col}-${slug}-${number}`, `rec-${col}-${slug}`, number, JSON.stringify(data), status);
    await record('live', 'Live record', 'published', `rev-${col}-live-1`, null);
    await revision('live', 1, { year: '2025', category: 'Annual' }, 'published');
    await record('draft', 'SECRET-DRAFT-REPORT title', 'draft', null, `rev-${col}-draft-1`);
    await revision('draft', 1, { year: '2026', secret: 'SECRET-DRAFT-REPORT body' }, 'draft');
    await record('revising', 'Revising record', 'draft', `rev-${col}-revising-1`, `rev-${col}-revising-2`);
    await revision('revising', 1, { year: '2024' }, 'published');
    await revision('revising', 2, { year: 'SECRET-YEAR' }, 'draft');
    await record('archived', 'Archived record', 'archived', `rev-${col}-archived-1`, null);
    await revision('archived', 1, { year: '2020' }, 'published');
  }

  // Releases: one published, one draft and one scheduled bundle.
  const release = (id, name, status) => run(`INSERT INTO content_releases VALUES(?,'tenant-a','site-a',?,?,?,NULL,NULL,NULL,1,'2026-09-01','2026-09-01')`, id, name, 'description', status);
  const item = (id, releaseId, itemId, title) => run(`INSERT INTO content_release_items VALUES(?,?,'page',?,?,'update','summary',NULL,'2026-09-01')`, id, releaseId, itemId, title);
  await release('rel-pub', 'Published bundle', 'published');
  await release('rel-draft', 'SECRET embargoed results bundle', 'draft');
  await release('rel-sched', 'SECRET scheduled bundle', 'scheduled');
  await item('i-1', 'rel-pub', 'revising', 'Revising page in the published bundle');
  await item('i-2', 'rel-draft', 'live', 'Live page in an unpublished bundle');
  await item('i-3', 'rel-sched', 'live', 'Live page in a scheduled bundle');
  return h;
}

const token = (h, scopes) => h.token(scopes);

async function gql(h, apiToken, query) {
  const response = await h.route('api/graphql').POST(h.request('/api/graphql', { query }, apiToken));
  return response.json();
}

async function restList(h, apiToken, collection, query = '') {
  const response = await h.route('api/content/[collection]').GET(
    h.request(`/api/content/${collection}${query}`, undefined, apiToken, 'GET'), { params: Promise.resolve({ collection }) });
  return { status: response.status, body: await response.json() };
}

async function restOne(h, apiToken, collection, slug, query = '') {
  const response = await h.route('api/content/[collection]/[slug]').GET(
    h.request(`/api/content/${collection}/${slug}${query}`, undefined, apiToken, 'GET'), { params: Promise.resolve({ collection, slug }) });
  return { status: response.status, body: await response.json() };
}

const slugs = list => list.map(x => x.slug).sort((a, b) => (a < b ? -1 : 1));
const leaks = payload => SECRETS.filter(secret => JSON.stringify(payload).includes(secret));

// ---- GraphQL: pages ----

test('GraphQL serves only what the public site serves: published pages, with a page under revision at its published version', async t => {
  const h = await fixture(t);
  for (const apiToken of [await token(h, READ_ONLY), await token(h, EDITOR), AGENCY_SECRET]) {
    const { data, errors } = await gql(h, apiToken, '{ pages { slug title status version dynamicZones { data } } }');
    assert.equal(errors, undefined);
    const live = data.pages.filter(p => !p.slug.startsWith('b-'));
    assert.deepEqual(slugs(live), ['live', 'revising'], 'a page that was never published was listed');
    assert.deepEqual(leaks(data), [], 'draft content reached the API');
    const revising = data.pages.find(p => p.slug === 'revising');
    assert.equal(revising.version, 1);
    assert.equal(revising.title, 'Revising page');
    assert.equal(revising.status, 'published');
    assert.equal(revising.dynamicZones[0].data.text, 'V1-LIVE-TEXT');
  }
});

test('GraphQL does not let a caller ask for drafts by status, and a single page is the published one', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, EDITOR);
  for (const status of ['draft', 'in_review', 'archived']) {
    const { data } = await gql(h, apiToken, `{ pages(status: "${status}") { slug } }`);
    assert.deepEqual(data.pages, [], `status ${status} returned pages`);
  }
  assert.deepEqual(slugs((await gql(h, apiToken, '{ pages(status: "published") { slug } }')).data.pages), ['live', 'revising']);
  assert.equal((await gql(h, apiToken, '{ page(slug: "secret-draft") { slug } }')).data.page, null);
  assert.equal((await gql(h, apiToken, '{ page(slug: "home") { slug } }')).data.page, null, 'a seeded draft home page was served');
  const revising = (await gql(h, apiToken, '{ page(slug: "revising") { title version dynamicZones { data } } }')).data.page;
  assert.equal(revising.version, 1);
  assert.equal(revising.dynamicZones[0].data.text, 'V1-LIVE-TEXT');
});

test('GraphQL pages stay inside the caller\'s tenant', async t => {
  const h = await fixture(t);
  const { data } = await gql(h, await token(h, READ_ONLY), '{ pages { slug } }');
  assert.ok(!slugs(data.pages).some(slug => slug.startsWith('b-')), 'another tenant\'s page was served');
});

// ---- GraphQL: records and releases ----

test('GraphQL lists records that are live and nothing else, whatever their draft or archive state', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, READ_ONLY);
  const { data, errors } = await gql(h, apiToken, `{
    reports { slug title status year }
    news { slug title status }
    operations { slug title status }
  }`);
  assert.equal(errors, undefined);
  for (const list of [data.reports, data.news, data.operations]) {
    assert.deepEqual(slugs(list), ['live', 'revising'], 'a record that is not live was listed');
    assert.ok(list.every(item => item.status === 'published'));
  }
  assert.equal(data.reports.find(r => r.slug === 'revising').year, '2024', 'the draft revision was served instead of the published one');
  assert.deepEqual(leaks(data), []);
});

test('GraphQL single records are not served unless they are live', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, READ_ONLY);
  for (const slug of ['draft', 'archived']) {
    const { data } = await gql(h, apiToken, `{ operation(slug: "${slug}") { slug } newsArticle(slug: "${slug}") { slug } }`);
    assert.equal(data.operation, null, `operation ${slug} was served`);
    assert.equal(data.newsArticle, null, `news ${slug} was served`);
  }
  const { data } = await gql(h, apiToken, '{ operation(slug: "revising") { slug } newsArticle(slug: "live") { slug } }');
  assert.equal(data.operation.slug, 'revising');
  assert.equal(data.newsArticle.slug, 'live');
});

test('GraphQL serves published releases only, and a page is bundled only into a published one', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, EDITOR);
  const { data } = await gql(h, apiToken, '{ releases { id name status items { title } } }');
  assert.deepEqual(data.releases.map(r => r.id), ['rel-pub']);
  assert.deepEqual(leaks(data), []);
  for (const status of ['draft', 'scheduled']) {
    assert.deepEqual((await gql(h, apiToken, `{ releases(status: "${status}") { id } }`)).data.releases, []);
  }
  const single = (await gql(h, apiToken, '{ a: release(id: "rel-draft") { id } b: release(id: "rel-sched") { id } c: release(id: "rel-pub") { id } }')).data;
  assert.equal(single.a, null);
  assert.equal(single.b, null);
  assert.equal(single.c.id, 'rel-pub');
  const pages = (await gql(h, apiToken, '{ pages { slug bundledRelease { id name } } }')).data.pages;
  assert.equal(pages.find(p => p.slug === 'live').bundledRelease, null, 'an unpublished release was attached to a page');
  assert.equal(pages.find(p => p.slug === 'revising').bundledRelease.id, 'rel-pub');
});

// ---- REST: published view ----

test('REST pages are the published view, including a page that is being revised, and never a draft', async t => {
  const h = await fixture(t);
  for (const apiToken of [await token(h, READ_ONLY), await token(h, EDITOR)]) {
    const { status, body } = await restList(h, apiToken, 'pages');
    assert.equal(status, 200);
    assert.deepEqual(slugs(body.items), ['live', 'revising']);
    assert.deepEqual(leaks(body), []);
    const revising = body.items.find(p => p.slug === 'revising');
    assert.equal(revising.version, 1);
    assert.equal(revising.sections[0].props.text, 'V1-LIVE-TEXT');
    assert.equal(revising.status, 'published');
  }
  const apiToken = await token(h, READ_ONLY);
  assert.equal((await restOne(h, apiToken, 'pages', 'secret-draft')).status, 404);
  assert.equal((await restOne(h, apiToken, 'pages', 'home')).status, 404);
  const one = await restOne(h, apiToken, 'pages', 'revising');
  assert.equal(one.status, 200);
  assert.equal(one.body.sections[0].props.text, 'V1-LIVE-TEXT');
  assert.equal((await restList(h, apiToken, 'pages', '?slug=secret-draft')).body.count, 0);
  assert.equal((await restList(h, apiToken, 'pages', '?preview=false&slug=secret-draft')).body.count, 0);
});

test('REST pagination still works on the published view', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, READ_ONLY);
  assert.deepEqual((await restList(h, apiToken, 'pages', '?limit=1&offset=0')).body.items.map(p => p.slug), ['live']);
  assert.deepEqual((await restList(h, apiToken, 'pages', '?limit=1&offset=1')).body.items.map(p => p.slug), ['revising']);
  assert.deepEqual((await restList(h, apiToken, 'pages', '?limit=1&offset=2')).body.items, []);
});

// ---- REST: preview ----

test('a read-only API token cannot preview drafts of pages or records', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, ['content:read']);
  const requests = [
    () => restList(h, apiToken, 'pages', '?preview=true'),
    () => restOne(h, apiToken, 'pages', 'secret-draft', '?preview=true'),
    () => restList(h, apiToken, 'reports', '?preview=true'),
    () => restOne(h, apiToken, 'reports', 'draft', '?preview=true'),
  ];
  for (const request of requests) {
    const { status, body } = await request();
    assert.equal(status, 403, JSON.stringify(body).slice(0, 200));
    assert.match(String(body.error), /preview/i);
    assert.deepEqual(leaks(body), []);
  }
});

test('a token that can edit or publish, and agency credentials, can still preview drafts', async t => {
  const h = await fixture(t);
  for (const scopes of [EDITOR, ['content:read', 'content:publish'], ['content:read', 'content:create'], ['*']]) {
    const apiToken = await token(h, scopes);
    const pages = await restList(h, apiToken, 'pages', '?preview=true');
    assert.equal(pages.status, 200, `${scopes} could not preview`);
    assert.deepEqual(slugs(pages.body.items).filter(s => s !== 'home'), ['live', 'revising', 'secret-draft']);
    const revising = pages.body.items.find(p => p.slug === 'revising');
    assert.equal(revising.version, 2);
    assert.equal(revising.status, 'draft');
    assert.equal((await restOne(h, apiToken, 'pages', 'secret-draft', '?preview=true')).status, 200);
    assert.equal((await restOne(h, apiToken, 'reports', 'draft', '?preview=true')).body.year, '2026');
  }
  const agency = await restList(h, AGENCY_SECRET, 'pages', '?preview=true&siteId=site-a&clientId=tenant-a');
  assert.equal(agency.status, 200);
  assert.ok(slugs(agency.body.items).includes('secret-draft'));
});

test('preview is only switched on by exactly "true"', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, ['content:read']);
  for (const value of ['TRUE', '1', 'yes', '']) {
    const { status, body } = await restList(h, apiToken, 'pages', `?preview=${value}`);
    assert.equal(status, 200);
    assert.deepEqual(leaks(body), [], `preview=${value} exposed a draft`);
  }
});

test('REST record listings for a read-only token are unchanged: published records only', async t => {
  const h = await fixture(t);
  const apiToken = await token(h, ['content:read']);
  const { body } = await restList(h, apiToken, 'reports');
  assert.deepEqual(slugs(body.items), ['live']);
  assert.deepEqual(leaks(body), []);
});
