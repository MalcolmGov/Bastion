// Shared setup for the SENS workflow tests: the table, the people who act on it, and calls through the real routes.
const { createHarness } = require('./harness.cjs');

const SENS_TABLE = `CREATE TABLE sens_announcements(
  id TEXT PRIMARY KEY, client_id TEXT, site_id TEXT, headline TEXT, announcement_type TEXT, jse_code TEXT,
  isin_code TEXT, released_at TEXT, body_html TEXT, summary TEXT, pdf_url TEXT, is_price_sensitive INTEGER,
  status TEXT, sponsor TEXT, embargo_until TEXT, created_at TEXT, updated_at TEXT,
  created_by TEXT, approved_by TEXT, approved_at TEXT, approved_content_hash TEXT)`;

const ACTORS = {
  editor: { id: 'editor-a', name: 'Editor A', role: 'content_editor', client_id: 'tenant-a' },
  editor2: { id: 'editor-a2', name: 'Editor A2', role: 'content_editor', client_id: 'tenant-a' },
  editorB: { id: 'editor-b', name: 'Editor B', role: 'content_editor', client_id: 'tenant-b' },
  reviewer: { id: 'reviewer-a', name: 'Reviewer A', role: 'reviewer', client_id: 'tenant-a' },
  publisher: { id: 'publisher-a', name: 'Publisher A', role: 'publisher', client_id: 'tenant-a' },
  analyst: { id: 'analyst-a', name: 'Analyst A', role: 'analyst', client_id: 'tenant-a' },
  reader: { id: 'reader-a', name: 'Reader A', role: 'read_only_stakeholder', client_id: 'tenant-a' },
  otherTenant: { id: 'reviewer-b', name: 'Reviewer B', role: 'reviewer', client_id: 'tenant-b' },
  agency1: { id: 'agency-1', name: 'Agency One', role: 'platform_admin', client_id: null },
  agency2: { id: 'agency-2', name: 'Agency Two', role: 'platform_admin', client_id: null },
};

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

module.exports = { SENS_TABLE, ACTORS, fixture, create, act, row };
