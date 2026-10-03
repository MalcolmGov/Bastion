const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

async function fixture(t) {
  const h = await createHarness();
  t.after(() => h.close());
  const store = h.load('lib/results/store.ts');
  const render = h.load('lib/results/renderHtml.ts').renderResultsHtml;
  const document = { issuer: 'TEST ISSUER', title: 'Test results', periodLabel: '2025', unit: 'R000', narrative: ['Revenue rose to 123.'], highlights: [], statements: [], notes: ['Audited results.'], warnings: [], sourceFilename: 'synthetic.pdf', pageCount: 1 };
  document.presentationHtml = render(document);
  const saved = await store.saveResultsDocument({ clientId: 'tenant-a', document, status: 'draft' });
  const route = h.route('api/admin/results/[id]');
  const context = { params: Promise.resolve({ id: saved.id }) };
  const patch = body => route.PATCH(h.request('/api/admin/results/' + saved.id, { document, expectedUpdatedAt: saved.updatedAt, status: 'draft', ...body }, null, 'PATCH'), context);
  return { h, saved, store, document, patch, route, context };
}

test('results writes enforce tenant ownership, edit roles and publication permission', async t => {
  const { h, patch, saved, route, context } = await fixture(t);
  assert.equal((await patch({})).status, 403);
  h.user({ role: 'content_editor', client_id: 'tenant-b' });
  assert.equal((await patch({})).status, 403);
  h.user({ role: 'content_editor', client_id: 'tenant-a' });
  assert.equal((await patch({ status: 'published', sourceReviewed: true })).status, 403);
  await h.db.execute({ sql: 'UPDATE results_documents SET client_id = NULL WHERE id = ?', args: [saved.id] });
  assert.equal((await route.GET(h.request('/api/admin/results/' + saved.id, {}, null, 'GET'), context)).status, 403);
});

test('results save rejects stale revisions and altered transcription, and requires source review', async t => {
  const { h, patch, saved, store, document } = await fixture(t);
  h.user({ role: 'platform_admin', client_id: null });
  assert.equal((await patch({ expectedUpdatedAt: 'old-version' })).status, 409);
  assert.equal((await patch({ document: { ...document, presentationHtml: document.presentationHtml.replace('123.', '999.') } })).status, 400);
  assert.equal((await patch({ status: 'published' })).status, 400);
  assert.equal((await store.getResultsDocument(saved.id)).status, 'draft');
  const savedResponse = await patch({});
  assert.equal(savedResponse.status, 200, JSON.stringify(await savedResponse.clone().json()));
  const next = await savedResponse.json();
  assert.equal((await patch({ status: 'published', sourceReviewed: true, expectedUpdatedAt: next.updatedAt })).status, 200);
  assert.equal((await store.getResultsDocument(saved.id)).status, 'published');
  await assert.rejects(() => store.saveResultsDocument({ id: saved.id, document, status: 'draft', expectedUpdatedAt: 'outdated' }), /another session/);
});

test('results assistant requires edit permission and cannot access another tenant document', async t => {
  const { h, saved } = await fixture(t);
  const route = h.route('api/admin/results/code');
  const request = () => h.request('/api/admin/results/code', { documentId: saved.id, html: '<html><body>123</body></html>', prompt: 'Change typography' });
  assert.equal((await route.POST(request())).status, 403);
  h.user({ role: 'content_editor', client_id: 'tenant-b' });
  assert.equal((await route.POST(request())).status, 404);
});


test('report lists return paginated tenant metadata without financial content or artwork', async t => {
  const { h, saved, document } = await fixture(t);
  h.user({ role: 'content_editor', client_id: 'tenant-a' });
  for (let index = 0; index < 52; index++) {
    await h.db.execute({ sql: 'INSERT INTO results_documents (id, client_id, slug, title, status, source_filename, document_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['list-' + index, 'tenant-a', 'slug-' + index, 'Report ' + index, 'draft', 'test.pdf', JSON.stringify(document), '2026-10-03', '2026-10-03'] });
  }
  await h.db.execute({ sql: 'INSERT INTO results_documents (id, client_id, slug, title, status, source_filename, document_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: ['foreign-report', 'tenant-b', 'foreign-slug', 'Foreign report', 'draft', 'private.pdf', JSON.stringify(document), '2026-10-03', '2026-10-03'] });
  const route = h.route('api/admin/results');
  const first = await (await route.GET(h.request('/api/admin/results?clientId=tenant-b', {}, null, 'GET'))).json();
  assert.equal(first.documents.length, 50);
  assert.equal(first.nextOffset, 50);
  assert.ok(first.documents.every(item => item.clientId === 'tenant-a' && !('document' in item)));
  assert.ok(!JSON.stringify(first).includes('Revenue rose'));
  const last = await (await route.GET(h.request('/api/admin/results?offset=50', {}, null, 'GET'))).json();
  assert.equal(last.documents.length, 3);
  assert.equal(last.nextOffset, null);
  assert.equal(new Set([...first.documents, ...last.documents].map(item => item.id)).size, 53);
  assert.ok([...first.documents, ...last.documents].some(item => item.id === saved.id));
  assert.equal((await route.GET(h.request('/api/admin/results?offset=-1', {}, null, 'GET'))).status, 400);
});
