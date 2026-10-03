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
  const result = await ask(h, AGENCY, REQUESTS.invoice, { portalViewMode: 'agency', clientId: 'tenant-a', clientContext: 'A' });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.action.type, 'create_invoice');
  const drafts = await invoices(h);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].status, 'draft');
});

// ---- the invoice is for the client the person is working in, and is never guessed ----

const AGENCY_INVOICE = { portalViewMode: 'agency' };
const addClient = (h, id, name) => h.db.execute({ sql: 'INSERT INTO clients(id,name,slug) VALUES(?,?,?)', args: [id, name, id] });

test('a voice invoice is drafted for the client in use, and says that client\'s own name', async t => {
  const h = await fixture(t);
  const result = await ask(h, AGENCY, REQUESTS.invoice, { ...AGENCY_INVOICE, clientId: 'tenant-b', clientContext: 'Some name the browser made up' });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.action.type, 'create_invoice');
  const drafts = await invoices(h);
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].client_id, 'tenant-b', 'the invoice went to another client');
  assert.equal(result.body.action.data.clientName, 'B', 'the confirmation names something other than the client billed');
  assert.ok(result.body.speechText.includes(' B '), result.body.speechText);
  assert.ok(!JSON.stringify(result.body).includes('made up'), 'the browser\'s text was repeated back as the client');
  assert.ok(!drafts[0].items_json.includes('made up'), 'the browser\'s text reached the invoice');
});

test('the client is the one named by its id, whatever its name looks like', async t => {
  const h = await fixture(t);
  await addClient(h, 'client_goldfields', 'Gold Fields');
  await addClient(h, 'tenant-gold', 'Goldwater Mining');
  // A name containing "gold" must not send the invoice to Gold Fields.
  const result = await ask(h, AGENCY, REQUESTS.invoice, { ...AGENCY_INVOICE, clientId: 'tenant-gold', clientContext: 'Goldwater Mining' });
  assert.equal(result.body.action.type, 'create_invoice', JSON.stringify(result.body));
  assert.deepEqual((await invoices(h)).map(row => row.client_id), ['tenant-gold']);
});

test('without a client that exists, no invoice is drafted and nothing is guessed', async t => {
  const h = await fixture(t);
  await addClient(h, 'client_goldfields', 'Gold Fields');
  const attempts = [
    { clientContext: 'Payguard' },
    { clientContext: 'Corporate' },
    {},
    { clientId: 'client_moove_digital' },
    // An id that does not exist is an error, not a reason to look at the name.
    { clientId: 'client_moove_digital', clientContext: 'A' },
    { clientId: ['tenant-a'], clientContext: 'A' },
    { clientId: { id: 'tenant-a' } },
    { clientId: "tenant-a' OR '1'='1" },
    { clientId: '', clientContext: 'No such client' },
  ];
  for (const extra of attempts) {
    const result = await ask(h, AGENCY, REQUESTS.invoice, { ...AGENCY_INVOICE, ...extra });
    assert.notEqual(result.body.action?.type, 'create_invoice', `drafted for ${JSON.stringify(extra)}`);
    assert.match(result.body.speechText, /client/i, JSON.stringify(extra));
  }
  assert.deepEqual(await invoices(h), [], 'an invoice was drafted for a client that was not identified');
});

test('a browser that sends only the client\'s exact name is still understood, but a name that is not exact or not unique is not', async t => {
  const h = await fixture(t);
  assert.equal((await ask(h, AGENCY, REQUESTS.invoice, { ...AGENCY_INVOICE, clientContext: 'a' })).body.action?.type, 'create_invoice');
  assert.deepEqual((await invoices(h)).map(row => row.client_id), ['tenant-a'], 'the name was not matched without regard to capitals');
  await addClient(h, 'tenant-a-twin', 'A');
  for (const clientContext of ['A', 'Gold', 'AA']) {
    const result = await ask(h, AGENCY, REQUESTS.invoice, { ...AGENCY_INVOICE, clientContext });
    assert.notEqual(result.body.action?.type, 'create_invoice', `drafted for the name ${clientContext}`);
  }
  assert.equal((await invoices(h)).length, 1, 'a second invoice was drafted from a name that was not unique');
});

test('the invoice action itself will not draft for a client it cannot find', async t => {
  const h = await fixture(t);
  const { createQuickInvoiceAction } = h.load('lib/copilot/actions.ts');
  for (const params of [{ clientName: 'Move Digital' }, { clientName: 'Gold Fields' }, {}, { clientId: 'client_moove_digital' }, { clientId: 'nope', clientName: 'A' }]) {
    const result = await createQuickInvoiceAction(params);
    assert.equal(result.success, false, `drafted for ${JSON.stringify(params)}`);
  }
  assert.deepEqual(await invoices(h), []);
  const ok = await createQuickInvoiceAction({ clientId: 'tenant-b' });
  assert.equal(ok.success, true);
  assert.equal(ok.data.clientName, 'B');
});

test('the assistant in the browser tells the server which client it is working in', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../../src/components/copilot/ZaraVoiceCopilot.tsx'), 'utf8');
  assert.match(source, /clientId:\s*activeClient\?\.id/, 'the browser does not send the active client\'s id');
});

test('agency staff previewing a client\'s view get the client\'s view, and a missing mode means the client view', async t => {
  const h = await fixture(t);
  for (const body of [{ portalViewMode: 'client' }, {}]) {
    for (const message of Object.values(REQUESTS)) assert.equal(exposesAgencyData(await ask(h, AGENCY, message, body)), false, JSON.stringify(body));
  }
  assert.deepEqual(await invoices(h), []);
});
