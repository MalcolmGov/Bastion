const test = require('node:test');
const assert = require('node:assert/strict');
const { ACTORS, fixture, create: createAnnouncement, act, row } = require('./sens-fixture.cjs');

const draft = async (h, actor, body) => (await createAnnouncement(h, actor, body)).body.announcement;

async function remove(h, actor, id) {
  h.user(ACTORS[actor]);
  const response = await h.route('api/admin/ir/sens/[id]').DELETE(h.request(`/api/admin/ir/sens/${id}`, {}, null, 'DELETE'), { params: Promise.resolve({ id }) });
  return { status: response.status, body: await response.json() };
}

async function publishedAnnouncement(h) {
  const made = await draft(h, 'editor');
  assert.equal((await act(h, 'agency2', made.id, 'approve')).status, 200);
  assert.equal((await act(h, 'agency1', made.id, 'publish')).status, 200);
  return made.id;
}

const deleteAudit = async h => (await h.db.execute("SELECT * FROM audit_log WHERE action = 'SENS_ANNOUNCEMENT_DELETE'")).rows;

const insertLegacy = (h, id, status, tenant = 'tenant-a') => h.db.execute({
  sql: `INSERT INTO sens_announcements(id,client_id,site_id,headline,announcement_type,jse_code,released_at,body_html,is_price_sensitive,status,sponsor,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  args: [id, tenant, 'site-a', 'Legacy announcement', 'general', 'JSE: GFI', '2026-01-01', '<p>Legacy</p>', 1, status, 'Sponsor', '2026-01-01', '2026-01-01'],
});

test('a published announcement cannot be deleted by anyone, a platform admin included', async t => {
  const h = await fixture(t);
  const id = await publishedAnnouncement(h);
  for (const actor of ['editor', 'agency1', 'agency2']) {
    const result = await remove(h, actor, id);
    assert.equal(result.status, 409, `${actor} was allowed to delete a published announcement`);
    assert.match(String(result.body.error), /published|market record/i);
  }
  assert.equal((await row(h, id)).status, 'published', 'a published announcement was removed');
  assert.equal((await deleteAudit(h)).length, 0, 'a refused delete was audited as a success');
});

test('seeded or synced announcements that were never drafts are protected too', async t => {
  const h = await fixture(t);
  await insertLegacy(h, 'legacy-published', 'published');
  await insertLegacy(h, 'legacy-embargoed', 'embargoed');
  await insertLegacy(h, 'legacy-null', null);
  for (const id of ['legacy-published', 'legacy-embargoed', 'legacy-null']) {
    for (const actor of ['editor', 'agency1']) {
      assert.equal((await remove(h, actor, id)).status, 409, `${id} deleted by ${actor}`);
    }
    assert.ok(await row(h, id), `${id} was removed`);
  }
});

test('a draft can be deleted by a role that can edit content, and the deletion is audited', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor', { headline: 'Draft to discard' });
  const result = await remove(h, 'editor', made.id);
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.deleted, true);
  assert.equal(await row(h, made.id), undefined);
  const audit = await deleteAudit(h);
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, 'editor-a');
  assert.equal(audit[0].record_id, made.id);
  assert.equal(audit[0].client_id, 'tenant-a');
  assert.equal(JSON.parse(audit[0].details_json).headline, 'Draft to discard');
  assert.equal((await remove(h, 'editor', made.id)).status, 404, 'a deleted announcement is still found');
});

test('a platform admin can delete another tenant\'s draft, as agency staff can for other tenant data', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor');
  assert.equal((await remove(h, 'agency1', made.id)).status, 200);
  assert.equal(await row(h, made.id), undefined);
});

test('roles that cannot edit content cannot delete even a draft', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor');
  for (const actor of ['reader', 'reviewer', 'publisher', 'analyst']) {
    const result = await remove(h, actor, made.id);
    assert.equal(result.status, 403, `${actor} was allowed to delete a draft`);
  }
  assert.ok(await row(h, made.id), 'the draft was removed by a role without permission');
  assert.equal((await deleteAudit(h)).length, 0);
});

test('another tenant cannot delete a draft, even with the right role', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor');
  const result = await remove(h, 'editorB', made.id);
  assert.equal(result.status, 403);
  assert.ok(await row(h, made.id), 'a draft was deleted across tenants');
});

test('an unknown announcement is a 404', async t => {
  const h = await fixture(t);
  assert.equal((await remove(h, 'editor', 'sens_missing')).status, 404);
});

test('an approved draft can be deleted, and then can no longer be published', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor');
  assert.equal((await act(h, 'agency2', made.id, 'approve')).status, 200);
  assert.equal((await remove(h, 'editor', made.id)).status, 200);
  assert.equal((await act(h, 'agency1', made.id, 'publish')).status, 404);
});

test('deleting one draft leaves other announcements alone', async t => {
  const h = await fixture(t);
  const first = await draft(h, 'editor', { headline: 'First' });
  const second = await draft(h, 'editor', { headline: 'Second' });
  const live = await publishedAnnouncement(h);
  await remove(h, 'editor', first.id);
  assert.ok(await row(h, second.id));
  assert.equal((await row(h, live)).status, 'published');
});

test('a delete that loses a race with publication does not remove the published announcement', async t => {
  const h = await fixture(t);
  const made = await draft(h, 'editor');
  assert.equal((await act(h, 'agency2', made.id, 'approve')).status, 200);
  // Publish the announcement after the route has read it as a draft and just before the delete statement runs.
  const original = h.db.execute.bind(h.db);
  h.db.execute = async query => {
    const sql = typeof query === 'string' ? query : query.sql;
    if (/^\s*DELETE FROM sens_announcements/i.test(sql)) {
      h.db.execute = original;
      await original({ sql: "UPDATE sens_announcements SET status = 'published' WHERE id = ?", args: [made.id] });
    }
    return original(query);
  };
  const result = await remove(h, 'editor', made.id);
  h.db.execute = original;
  assert.equal(result.status, 409);
  assert.equal((await row(h, made.id)).status, 'published', 'the announcement that went live was deleted');
  assert.equal((await deleteAudit(h)).length, 0);
});

test('the service itself refuses to delete a published announcement, whoever calls it', async t => {
  const h = await fixture(t);
  const service = h.load('lib/ir/sensService.ts');
  const id = await publishedAnnouncement(h);
  await assert.rejects(service.deleteSensAnnouncement(id, 'tenant-a'), error => error.status === 409);
  assert.equal((await row(h, id)).status, 'published');
  const unpublished = await draft(h, 'editor');
  await assert.rejects(service.deleteSensAnnouncement(unpublished.id, 'tenant-b'), error => error.status === 404, 'deleted through the wrong tenant');
  assert.ok(await row(h, unpublished.id));
  const removed = await service.deleteSensAnnouncement(unpublished.id, 'tenant-a');
  assert.equal(removed.id, unpublished.id);
  assert.equal(await row(h, unpublished.id), undefined);
});
