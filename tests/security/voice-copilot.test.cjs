const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const AGENCY = { id: 'agency-1', name: 'Agency One', role: 'platform_admin', client_id: null };
const CLIENT = { id: 'editor-a', name: 'Editor A', role: 'content_editor', client_id: 'tenant-a' };
const CLIENT_ADMIN = { id: 'admin-a', name: 'Admin A', role: 'platform_admin', client_id: 'tenant-a' };
const INCIDENT_TITLE = 'Checkout outage on the tenant B payment page';
const AGENCY_ACTIONS = ['sre_health', 'list_incidents', 'billing_summary', 'create_invoice'];

// What each agency-only request asks for. These read data across every tenant, or write a billing document.
const REQUESTS = {
  sre: 'How is platform health and latency right now?',
  incidents: 'Are there any incidents or open pull requests?',
  billing: 'What is our total invoiced revenue and billing?',
  invoice: 'Create a draft invoice for billing',
};

async function fixture(t) {
  const h = await createHarness();
  const realWarn = console.warn, realError = console.error;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    console.warn = realWarn;
    console.error = realError;
    if (apiKey !== undefined) process.env.ANTHROPIC_API_KEY = apiKey;
    h.close();
  });
  await h.db.executeMultiple(`
    CREATE TABLE sla_probes(id TEXT PRIMARY KEY, timestamp TEXT, latency_ms INTEGER, status TEXT);
    CREATE TABLE incidents(id TEXT PRIMARY KEY, title TEXT, status TEXT, affected_routes TEXT, pr_number TEXT, created_at TEXT, resolved_at TEXT);
    CREATE TABLE billing_docs(id TEXT PRIMARY KEY, client_id TEXT, type TEXT, status TEXT, doc_number TEXT, issue_date TEXT, due_date TEXT, currency TEXT,
      items_json TEXT, notes TEXT, payment_terms TEXT, acceptance_token TEXT, created_at TEXT, updated_at TEXT);
    INSERT INTO sla_probes VALUES('probe-1','2026-10-01T10:00:00Z',231,'ok');
    INSERT INTO incidents VALUES('inc-1','${INCIDENT_TITLE}','open','/checkout','4821','2026-10-01T09:00:00Z',NULL);
    INSERT INTO billing_docs VALUES('inv-b','client_b','invoice','paid','INV-7777','2026-10-01','2026-10-15','R','[{"qty":1,"unitPrice":1234567,"taxRate":0}]','n','t','tok-b','2026-10-01','2026-10-01');
  `);
  return h;
}

async function ask(h, user, message, body = {}) {
  h.user(user);
  const response = await h.route('api/admin/voice-copilot').POST(h.request('/api/admin/voice-copilot', { message, ...body }));
  return { status: response.status, body: await response.json() };
}

const invoices = async h => (await h.db.execute("SELECT * FROM billing_docs WHERE status = 'draft'")).rows;
const exposesAgencyData = ({ body }) => AGENCY_ACTIONS.includes(body.action?.type)
  || /INV-7777|1\s?234\s?567|4821/.test(JSON.stringify(body))
  || JSON.stringify(body).includes(INCIDENT_TITLE);

// ---- a client user cannot switch the assistant into agency mode ----

test('a client user who claims agency mode in the request still gets no agency data', async t => {
  const h = await fixture(t);
  for (const [name, message] of Object.entries(REQUESTS)) {
    const result = await ask(h, CLIENT, message, { portalViewMode: 'agency', userRole: 'platform_admin' });
    assert.equal(result.status, 200, name);
    assert.equal(exposesAgencyData(result), false, `${name}: agency data reached a client user: ${JSON.stringify(result.body).slice(0, 300)}`);
  }
  assert.deepEqual(await invoices(h), [], 'a client user created an invoice through the assistant');
});

test('every spelling of the agency flag is ignored for a client user', async t => {
  const h = await fixture(t);
  for (const mode of ['agency', 'Agency', 'AGENCY', 'admin', 'platform_admin', true, 1, null, undefined, '']) {
    for (const message of [REQUESTS.billing, REQUESTS.invoice]) {
      const result = await ask(h, CLIENT, message, { portalViewMode: mode });
      assert.equal(exposesAgencyData(result), false, `portalViewMode ${JSON.stringify(mode)} exposed agency data`);
    }
  }
  assert.deepEqual(await invoices(h), []);
});

test('a platform admin who belongs to a client workspace is a client user, not agency staff', async t => {
  const h = await fixture(t);
  for (const message of Object.values(REQUESTS)) {
    assert.equal(exposesAgencyData(await ask(h, CLIENT_ADMIN, message, { portalViewMode: 'agency' })), false);
  }
  assert.deepEqual(await invoices(h), []);
});

test('a client user gets the client suggestions and greeting even when the request claims agency mode', async t => {
  const h = await fixture(t);
  const { DEFAULT_CLIENT_SUGGESTED_STEPS, DEFAULT_AGENCY_SUGGESTED_STEPS } = h.load('lib/copilot/cmsKnowledge.ts');
  const result = await ask(h, CLIENT, '', { portalViewMode: 'agency' });
  assert.deepEqual(result.body.suggestedNextSteps, DEFAULT_CLIENT_SUGGESTED_STEPS);
  assert.notDeepEqual(DEFAULT_CLIENT_SUGGESTED_STEPS, DEFAULT_AGENCY_SUGGESTED_STEPS, 'the two step lists are no longer distinguishable');
});

test('a signed-out request is refused', async t => {
  const h = await fixture(t);
  const result = await ask(h, null, REQUESTS.billing, { portalViewMode: 'agency' });
  assert.equal(result.status, 401);
  assert.deepEqual(await invoices(h), []);
});

// ---- agency staff keep what they had ----

test('agency staff in agency mode still get platform health, incidents and billing', async t => {
  const h = await fixture(t);
  assert.equal((await ask(h, AGENCY, REQUESTS.sre, { portalViewMode: 'agency' })).body.action.type, 'sre_health');
  const incidents = await ask(h, AGENCY, REQUESTS.incidents, { portalViewMode: 'agency' });
  assert.equal(incidents.body.action.type, 'list_incidents');
  assert.equal(incidents.body.action.data.incidents[0].title, INCIDENT_TITLE);
  const billing = await ask(h, AGENCY, REQUESTS.billing, { portalViewMode: 'agency' });
  assert.equal(billing.body.action.type, 'billing_summary');
  assert.equal(billing.body.action.data.totalInvoiced, 1234567);
});

test('agency staff can still draft an invoice by voice, and it is only a draft', async t => {
  const h = await fixture(t);
  const result = await ask(h, AGENCY, REQUESTS.invoice, { portalViewMode: 'agency', clientContext: 'Gold Fields' });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.action.type, 'create_invoice');
  const drafts = await invoices(h);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].status, 'draft');
});

test('agency staff previewing a client\'s view get the client\'s view, and a missing mode means the client view', async t => {
  const h = await fixture(t);
  for (const body of [{ portalViewMode: 'client' }, {}]) {
    for (const message of Object.values(REQUESTS)) assert.equal(exposesAgencyData(await ask(h, AGENCY, message, body)), false, JSON.stringify(body));
  }
  assert.deepEqual(await invoices(h), []);
});
