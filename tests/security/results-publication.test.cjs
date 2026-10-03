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
  const historyRoute = h.route('api/admin/results/[id]/history');
  const revision = (await (await historyRoute.GET(h.request('/api/admin/results/' + saved.id + '/history', {}, null, 'GET'), { params: Promise.resolve({ id: saved.id }) })).json()).currentRevisionId;
  h.user({ id: 'reviewer-a', name: 'Reviewer', role: 'reviewer', client_id: 'tenant-a' });
  assert.equal((await historyRoute.POST(h.request('/api/admin/results/' + saved.id + '/history', { action: 'approve', revisionId: revision, expectedUpdatedAt: next.updatedAt, sourceReviewed: true, comment: '' }), { params: Promise.resolve({ id: saved.id }) })).status, 200);
  h.user({ id: 'publisher-a', role: 'publisher', client_id: 'tenant-a' });
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


test('publication recomputes financial issues on the server and requires review acknowledgement', async t => {
  const { h, patch, document, saved, store } = await fixture(t);
  h.user({ role: 'platform_admin', client_id: null });
  const changed = { ...document, unit: 'R’000', statements: [{ id: 'regional', title: 'Revenue by region', sourcePage: 1, period: '', stubLabel: '', confidence: 1, columns: [{ id: 'amount', label: '2025 R’000', role: 'figure' }], rows: [{ id: 'a', label: 'A', kind: 'data', cells: ['10'], confidence: 1 }, { id: 'b', label: 'B', kind: 'data', cells: ['20'], confidence: 1 }, { id: 'total', label: 'Total', kind: 'total', cells: ['99'], confidence: 1 }] }] };
  changed.presentationHtml = h.load('lib/results/renderHtml.ts').renderResultsHtml(changed);
  const rejected = await patch({ document: changed, status: 'published', sourceReviewed: true, validation: { issues: [] } });
  assert.equal(rejected.status, 400);
  assert.match((await rejected.json()).error, /financial validation/);
  assert.equal((await store.getResultsDocument(saved.id)).status, 'draft');
  const next = await (await patch({ document: changed })).json();
  const historyRoute = h.route('api/admin/results/[id]/history');
  const context = { params: Promise.resolve({ id: saved.id }) };
  const revision = (await (await historyRoute.GET(h.request('/api/admin/results/' + saved.id + '/history', {}, null, 'GET'), context)).json()).currentRevisionId;
  h.user({ id: 'reviewer-a', name: 'Reviewer', role: 'reviewer', client_id: 'tenant-a' });
  const review = extra => historyRoute.POST(h.request('/api/admin/results/' + saved.id + '/history', { action: 'approve', revisionId: revision, expectedUpdatedAt: next.updatedAt, sourceReviewed: true, comment: '', ...extra }), context);
  assert.equal((await review({})).status, 409);
  assert.equal((await review({ validationReviewed: true })).status, 200);
  h.user({ id: 'publisher-a', role: 'publisher', client_id: 'tenant-a' });
  assert.equal((await patch({ document: changed, status: 'published', sourceReviewed: true, validationReviewed: true, expectedUpdatedAt: next.updatedAt })).status, 200);
  assert.equal((await store.getResultsDocument(saved.id)).document.statements[0].rows[2].cells[0], '99', 'review must not auto-correct source figures');
});
test('legacy styling can be saved without losing protected text or figures after renderer upgrades', async t => {
  const { h, saved, store, document, patch } = await fixture(t);
  const legacy = { ...document, presentationHtml: document.presentationHtml.replace('</body>', '<p>Original legacy disclosure.</p></body>') };
  const current = await store.saveResultsDocument({ id: saved.id, document: legacy, status: 'draft', expectedUpdatedAt: saved.updatedAt });
  h.user({ role: 'content_editor', client_id: 'tenant-a' });
  const response = await patch({ document: legacy, expectedUpdatedAt: current.updatedAt });
  assert.equal(response.status, 200);
  const next = await response.json();
  assert.equal((await patch({ document: { ...legacy, presentationHtml: legacy.presentationHtml.replace('123.', '999.') }, expectedUpdatedAt: next.updatedAt })).status, 400);
  assert.equal((await patch({ document: { ...legacy, narrative: ['Different transcript'] }, expectedUpdatedAt: next.updatedAt })).status, 400);
});
