const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');
const { ACTORS } = require('./sens-fixture.cjs');

const ROUTE = 'api/admin/tenders';
const STATUSES = ['submitted', 'compliant', 'shortlisted', 'rejected', 'awarded'];
const NEW_TENDER = { tenderNumber: 'T-2026-001', title: 'Borehole drilling', category: 'Mining', description: 'Core drilling', closingDate: '2026-12-31T23:59:59Z' };
const BID = {
  tenderId: 'tdr-b', vendorName: 'Vendor (Pty) Ltd', cipcRegistrationNumber: '2020/654321/07', sarsTaxPin: 'SARS889900', bbbeeLevel: 1,
  contactName: 'Kagiso', contactEmail: 'k@vendor.example', contactPhone: '+27 12 800 1234',
};

async function fixture(t) {
  const h = await createHarness();
  const realWarn = console.warn, realError = console.error;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => { console.warn = realWarn; console.error = realError; h.close(); });
  await h.db.executeMultiple(`
    ALTER TABLE audit_log ADD COLUMN client_id TEXT;
    ALTER TABLE audit_log ADD COLUMN site_id TEXT;
    CREATE TABLE tenders(id TEXT PRIMARY KEY, client_id TEXT NOT NULL REFERENCES clients(id), tender_number TEXT UNIQUE NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL,
      description TEXT NOT NULL, estimated_value TEXT, closing_date TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', min_bbbee_level INTEGER DEFAULT 4, cidb_grading TEXT,
      host_community_mandate INTEGER DEFAULT 1, scope_document_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE tender_submissions(id TEXT PRIMARY KEY, tender_id TEXT NOT NULL REFERENCES tenders(id), client_id TEXT NOT NULL, reference_code TEXT UNIQUE NOT NULL,
      vendor_name TEXT NOT NULL, cipc_registration_number TEXT NOT NULL, sars_tax_pin TEXT NOT NULL, bbbee_level INTEGER NOT NULL, host_community_registered INTEGER NOT NULL DEFAULT 0,
      contact_name TEXT NOT NULL, contact_email TEXT NOT NULL, contact_phone TEXT NOT NULL, bid_amount REAL, currency TEXT NOT NULL DEFAULT 'ZAR', status TEXT NOT NULL DEFAULT 'submitted',
      compliance_notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    INSERT INTO tenders VALUES('tdr-a','tenant-a','TA-1','Tender A','Mining','d',NULL,'2026-12-31','active',4,NULL,1,NULL,'2026-10-01','2026-10-01');
    INSERT INTO tenders VALUES('tdr-b','tenant-b','TB-1','Tender B','Mining','d',NULL,'2026-12-31','active',4,NULL,1,NULL,'2026-10-02','2026-10-02');
    INSERT INTO tender_submissions VALUES('sub-a','tdr-a','tenant-a','BID-A','Vendor A','2020/111111/07','SARSAAAA11',1,0,'A','a@v.example','1',100,'ZAR','submitted','automated note','2026-10-01','2026-10-01');
    INSERT INTO tender_submissions VALUES('sub-b','tdr-b','tenant-b','BID-B','Vendor B','2020/222222/07','SARSBBBB22',1,0,'B','b@v.example','2',200,'ZAR','submitted','automated note','2026-10-01','2026-10-01');
    INSERT INTO tender_submissions VALUES('sub-misfiled','tdr-b','tenant-a','BID-M','Vendor M','2020/333333/07','SARSMMMM33',1,0,'M','m@v.example','3',300,'ZAR','submitted','automated note','2026-10-01','2026-10-01');
  `);
  return h;
}

async function call(h, actor, method, { query = '', body } = {}) {
  h.user(actor ? ACTORS[actor] : null);
  const handler = h.route(ROUTE)[method];
  const response = await handler(h.request(`/${ROUTE}${query}`, body, null, method));
  return { status: response.status, body: await response.json() };
}

const evaluate = (h, actor, submissionId, status = 'shortlisted', notes) => call(h, actor, 'PATCH', { body: { submissionId, status, notes } });
const submissionRow = async (h, id) => (await h.db.execute({ sql: 'SELECT * FROM tender_submissions WHERE id = ?', args: [id] })).rows[0];
const tenderCount = async h => Number((await h.db.execute('SELECT COUNT(*) AS c FROM tenders')).rows[0].c);
const audits = async (h, like) => (await h.db.execute({ sql: 'SELECT * FROM audit_log WHERE action LIKE ?', args: [like] })).rows;
const submissionIds = body => body.submissions.map(s => s.id).sort((a, b) => (a < b ? -1 : 1));

// ---- changing a bid's status ----

test('only roles that manage tenders can change a bid status, and nothing changes for the others', async t => {
  const h = await fixture(t);
  for (const actor of ['editor', 'publisher', 'analyst', 'reader']) {
    const result = await evaluate(h, actor, 'sub-a', 'awarded');
    assert.equal(result.status, 403, `${actor} was allowed to evaluate a bid`);
  }
  assert.equal((await submissionRow(h, 'sub-a')).status, 'submitted');
  assert.equal((await audits(h, 'TENDER%')).length, 0);
  assert.equal((await evaluate(h, null, 'sub-a')).status, 401);
});

test('a reviewer can evaluate a bid on their own tender, and the change is audited with what it replaced', async t => {
  const h = await fixture(t);
  const result = await evaluate(h, 'reviewer', 'sub-a', 'shortlisted', 'Meets the technical criteria.');
  assert.equal(result.status, 200, JSON.stringify(result.body));
  const row = await submissionRow(h, 'sub-a');
  assert.equal(row.status, 'shortlisted');
  assert.equal(row.compliance_notes, 'Meets the technical criteria.');
  const audit = await audits(h, 'TENDER_SUBMISSION%');
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, 'reviewer-a');
  assert.equal(audit[0].record_id, 'sub-a');
  assert.equal(audit[0].client_id, 'tenant-a');
  const details = JSON.parse(audit[0].details_json);
  assert.equal(details.from, 'submitted');
  assert.equal(details.to, 'shortlisted');
  assert.equal(details.previousNotes, 'automated note', 'the note that was replaced was lost');
});

test('another tenant cannot evaluate a bid, including one filed under its own client id on someone else\'s tender', async t => {
  const h = await fixture(t);
  // sub-misfiled carries tenant-a's client id but sits on tenant-b's tender, so tenant-b owns it.
  for (const id of ['sub-b', 'sub-misfiled']) {
    assert.equal((await evaluate(h, 'reviewer', id, 'awarded')).status, 404, `${id} was reachable across tenants`);
    assert.equal((await submissionRow(h, id)).status, 'submitted', `${id} was changed by another tenant`);
  }
  assert.equal((await audits(h, 'TENDER%')).length, 0);
  assert.equal((await evaluate(h, 'otherTenant', 'sub-misfiled', 'compliant')).status, 200, 'the owning tenant lost access to its own bid');
});

test('agency staff can evaluate a bid for any tenant', async t => {
  const h = await fixture(t);
  assert.equal((await evaluate(h, 'agency1', 'sub-b', 'compliant')).status, 200);
  assert.equal((await submissionRow(h, 'sub-b')).status, 'compliant');
  assert.equal((await audits(h, 'TENDER_SUBMISSION%'))[0].client_id, 'tenant-b');
});

test('a status that is not part of the evaluation flow is refused', async t => {
  const h = await fixture(t);
  for (const status of ['hacked', '', 'AWARDED', 'awarded; DROP TABLE tenders', 7, null, ['awarded']]) {
    const result = await evaluate(h, 'reviewer', 'sub-a', status);
    assert.equal(result.status, 400, `accepted ${JSON.stringify(status)}`);
  }
  for (const status of STATUSES) assert.equal((await evaluate(h, 'reviewer', 'sub-a', status)).status, 200, status);
  assert.equal((await evaluate(h, 'reviewer', 'sub-a', 'compliant', 'x'.repeat(2001))).status, 400, 'an oversized note was accepted');
  assert.equal((await evaluate(h, 'reviewer', 'nope', 'compliant')).status, 404);
  assert.equal((await call(h, 'reviewer', 'PATCH', { body: { status: 'compliant' } })).status, 400);
});

test('the service refuses another tenant and an unknown status even when called directly', async t => {
  const h = await fixture(t);
  const service = h.load('lib/tenders/tenderService.ts');
  await assert.rejects(service.updateTenderSubmissionStatus('sub-b', 'awarded', undefined, 'tenant-a'), error => error.status === 404);
  await assert.rejects(service.updateTenderSubmissionStatus('sub-a', 'bogus', undefined, 'tenant-a'), error => error.status === 400);
  assert.equal((await submissionRow(h, 'sub-b')).status, 'submitted');
  await service.updateTenderSubmissionStatus('sub-b', 'awarded', undefined, null);
  assert.equal((await submissionRow(h, 'sub-b')).status, 'awarded');
});

// ---- creating a tender ----

test('only roles that manage tenders can publish a tender', async t => {
  const h = await fixture(t);
  const before = await tenderCount(h);
  for (const actor of ['editor', 'publisher', 'analyst', 'reader']) {
    assert.equal((await call(h, actor, 'POST', { body: NEW_TENDER })).status, 403, `${actor} published a tender`);
  }
  assert.equal((await call(h, null, 'POST', { body: NEW_TENDER })).status, 401);
  assert.equal(await tenderCount(h), before);
});

test('a reviewer\'s tender is always created for their own tenant, whatever client id they send, and is audited', async t => {
  const h = await fixture(t);
  const result = await call(h, 'reviewer', 'POST', { body: { ...NEW_TENDER, clientId: 'tenant-b' } });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.tender.clientId, 'tenant-a');
  const audit = await audits(h, 'TENDER_CREATE');
  assert.equal(audit.length, 1);
  assert.equal(audit[0].client_id, 'tenant-a');
  assert.equal(audit[0].record_id, result.body.tender.id);
});

test('agency staff must say which client a tender is for, and it must be a real client', async t => {
  const h = await fixture(t);
  const before = await tenderCount(h);
  assert.equal((await call(h, 'agency1', 'POST', { body: NEW_TENDER })).status, 400, 'a tender was published for a default client');
  assert.equal((await call(h, 'agency1', 'POST', { body: { ...NEW_TENDER, clientId: 'no-such-client' } })).status, 400);
  assert.equal(await tenderCount(h), before);
  const ok = await call(h, 'agency1', 'POST', { body: { ...NEW_TENDER, clientId: 'tenant-b' } });
  assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal(ok.body.tender.clientId, 'tenant-b');
});

// ---- reading ----

test('vendor details and bid amounts are only returned to roles that manage tenders', async t => {
  const h = await fixture(t);
  for (const actor of ['editor', 'publisher', 'analyst', 'reader']) {
    const result = await call(h, actor, 'GET', { query: '?view=submissions' });
    assert.equal(result.status, 403, `${actor} read vendor details`);
    assert.ok(!JSON.stringify(result.body).includes('SARSAAAA11'));
  }
  assert.equal((await call(h, null, 'GET', { query: '?view=submissions' })).status, 401);
});

test('a tenant sees the bids on its own tenders and no others, whatever client id the bid carries', async t => {
  const h = await fixture(t);
  const own = await call(h, 'reviewer', 'GET', { query: '?view=submissions' });
  assert.deepEqual(submissionIds(own.body), ['sub-a']);
  const asking = await call(h, 'reviewer', 'GET', { query: '?view=submissions&clientId=tenant-b&tenderId=tdr-b' });
  assert.deepEqual(submissionIds(asking.body), [], 'another tenant\'s bids were returned');
  const other = await call(h, 'otherTenant', 'GET', { query: '?view=submissions' });
  assert.deepEqual(submissionIds(other.body), ['sub-b', 'sub-misfiled']);
  const agency = await call(h, 'agency1', 'GET', { query: '?view=submissions' });
  assert.deepEqual(submissionIds(agency.body), ['sub-a', 'sub-b', 'sub-misfiled']);
});

test('the tender list is still tenant scoped and open to the tenant\'s signed-in users', async t => {
  const h = await fixture(t);
  for (const actor of ['editor', 'reader', 'reviewer']) {
    const result = await call(h, actor, 'GET', { query: '?view=tenders&clientId=tenant-b' });
    assert.equal(result.status, 200);
    assert.deepEqual(result.body.tenders.map(x => x.id), ['tdr-a'], `${actor} saw another tenant's tenders`);
  }
});

// ---- the public bid form cannot choose the owning tenant ----

test('a bid submitted through the public form belongs to the tender\'s tenant, not to the client id the vendor sent', async t => {
  const h = await fixture(t);
  h.user(null);
  for (const extra of [{ clientId: 'tenant-a' }, {}, { clientId: 'client_goldfields' }]) {
    const response = await h.route('api/tenders/submit').POST(h.request('/api/tenders/submit', { ...BID, ...extra }));
    const body = await response.json();
    assert.equal(response.status, 200, JSON.stringify(body));
    assert.equal(body.submission.clientId, 'tenant-b', `client id ${JSON.stringify(extra)} decided the owner`);
    assert.equal((await submissionRow(h, body.submission.id)).client_id, 'tenant-b');
  }
});

test('the automatic note on a new bid does not claim the registration or tax PIN was verified, because only their format is checked', async t => {
  const h = await fixture(t);
  const response = await h.route('api/tenders/submit').POST(h.request('/api/tenders/submit', BID));
  const { submission } = await response.json();
  assert.ok(!/PIN verified|CIPC verified/i.test(submission.complianceNotes), submission.complianceNotes);
  assert.match(submission.complianceNotes, /not been verified/i);
});
