const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');

const root = path.resolve(__dirname, '../..');
const PREVIEW_SECRET = 'preview-secret-0123456789';
const FLAGSHIP = 'client_goldfields';
const USERS = {
  agency: { id: 'agency-1', name: 'Agency', role: 'platform_admin', client_id: null },
  flagshipEditor: { id: 'gf-editor', name: 'GF Editor', role: 'content_editor', client_id: FLAGSHIP },
  flagshipReader: { id: 'gf-reader', name: 'GF Reader', role: 'read_only_stakeholder', client_id: FLAGSHIP },
  flagshipAnalyst: { id: 'gf-analyst', name: 'GF Analyst', role: 'analyst', client_id: FLAGSHIP },
  otherTenant: { id: 'vod-editor', name: 'Vodacom Editor', role: 'content_editor', client_id: 'client_vodacom_group' },
  otherAdmin: { id: 'vod-admin', name: 'Vodacom Admin', role: 'platform_admin', client_id: 'client_vodacom_group' },
};

async function fixture(t) {
  const h = await createHarness();
  const saved = process.env.PREVIEW_SECRET_TOKEN;
  process.env.PREVIEW_SECRET_TOKEN = PREVIEW_SECRET;
  t.after(() => {
    if (saved === undefined) delete process.env.PREVIEW_SECRET_TOKEN; else process.env.PREVIEW_SECRET_TOKEN = saved;
    h.close();
  });
  return h;
}

/** Calls /api/preview. Resolves to { status } for a refusal, or { redirectTo } when it enabled draft mode and redirected. */
async function preview(h, user, query = '') {
  h.user(user ? USERS[user] : null);
  try {
    const response = await h.route('api/preview').GET(h.request(`/api/preview${query}`, undefined, null, 'GET'));
    return { status: response.status };
  } catch (error) {
    if (error.redirectTo) return { redirectTo: error.redirectTo };
    throw error;
  }
}

// ---- who can switch draft mode on ----

test('draft mode cannot be switched on without a session or the preview secret', async t => {
  const h = await fixture(t);
  for (const query of ['', '?collection=pages&slug=home', '?secret=wrong-secret-0123456789', '?secret=']) {
    const result = await preview(h, null, query);
    assert.equal(result.status, 401, query);
  }
  assert.equal(h.draft.enabled, false);
});

test('a user of a client other than the one that owns the root site cannot switch draft mode on', async t => {
  const h = await fixture(t);
  for (const user of ['otherTenant', 'otherAdmin']) {
    const result = await preview(h, user, '?collection=reports&slug=anything');
    assert.equal(result.status, 403, `${user} switched draft mode on`);
    assert.equal(h.draft.enabled, false, `${user} left draft mode on`);
  }
});

test('users who may see the root site\'s drafts, and holders of the secret, still can', async t => {
  const h = await fixture(t);
  for (const user of ['agency', 'flagshipEditor', 'flagshipReader']) {
    h.draft.enabled = false;
    const result = await preview(h, user, '?collection=pages&slug=about');
    assert.deepEqual(result, { redirectTo: '/about' }, user);
    assert.equal(h.draft.enabled, true, user);
  }
  h.draft.enabled = false;
  assert.deepEqual(await preview(h, null, `?secret=${PREVIEW_SECRET}&collection=news&slug=update`), { redirectTo: '/media/update' });
  assert.equal(h.draft.enabled, true);
  // The secret is itself the credential, whoever presents it.
  h.draft.enabled = false;
  assert.deepEqual(await preview(h, 'otherTenant', `?secret=${PREVIEW_SECRET}&collection=pages&slug=home`), { redirectTo: '/' });
});

test('a role that cannot read content cannot switch draft mode on', async t => {
  const h = await fixture(t);
  assert.equal((await preview(h, 'flagshipAnalyst', '?collection=pages&slug=home')).status, 403);
  assert.equal(h.draft.enabled, false);
});

test('the slug cannot send the browser to another site', async t => {
  const h = await fixture(t);
  for (const slug of ['/evil.example', '//evil.example', 'https://evil.example', 'http:evil.example', '\\\\evil.example', 'a/b', '../admin', 'a b', '']) {
    h.draft.enabled = false;
    const result = await preview(h, 'agency', `?collection=pages&slug=${encodeURIComponent(slug)}`);
    if (slug === '') {
      assert.deepEqual(result, { redirectTo: '/' }, 'an empty slug is the home page');
    } else {
      assert.equal(result.status, 400, `slug ${JSON.stringify(slug)} was accepted`);
      assert.equal(h.draft.enabled, false, `draft mode was switched on for ${JSON.stringify(slug)}`);
    }
  }
  for (const [collection, slug, expected] of [['pages', 'home', '/'], ['pages', 'our-story_2', '/our-story_2'], ['operations', 'tarkwa', '/operations/tarkwa'], ['reports', 'x', '/reports']]) {
    assert.deepEqual(await preview(h, 'agency', `?collection=${collection}&slug=${slug}`), { redirectTo: expected });
  }
});

// ---- who sees drafts once it is on ----

test('a person sees drafts of a client\'s work only if they may see that client\'s work', async t => {
  const h = await fixture(t);
  const { mayViewDraftsOf } = h.load('lib/auth/draftPreview.ts');
  assert.equal(mayViewDraftsOf(null, FLAGSHIP), false, 'a signed-out visitor saw drafts');
  assert.equal(mayViewDraftsOf(USERS.agency, FLAGSHIP), true);
  assert.equal(mayViewDraftsOf(USERS.agency, 'client_vodacom_group'), true);
  assert.equal(mayViewDraftsOf(USERS.flagshipEditor, FLAGSHIP), true);
  assert.equal(mayViewDraftsOf(USERS.flagshipReader, FLAGSHIP), true);
  assert.equal(mayViewDraftsOf(USERS.flagshipEditor, 'client_vodacom_group'), false, 'drafts of another client were visible');
  assert.equal(mayViewDraftsOf(USERS.otherAdmin, FLAGSHIP), false, 'a platform admin inside a client workspace is not agency staff');
  assert.equal(mayViewDraftsOf(USERS.flagshipAnalyst, FLAGSHIP), false, 'a role without content access saw drafts');
  assert.equal(mayViewDraftsOf(USERS.flagshipEditor, null), false);
  assert.equal(mayViewDraftsOf(USERS.flagshipEditor, undefined), false);
});

test('a site shows drafts only when draft mode is on and the signed-in person may see that client\'s drafts', async t => {
  const h = await fixture(t);
  const { draftPreviewActive } = h.load('lib/auth/draftPreview.ts');
  const active = async (user, owner, enabled = true) => {
    h.draft.enabled = enabled;
    h.user(user ? USERS[user] : null);
    return draftPreviewActive({ id: 'site-x', client_id: owner });
  };
  assert.equal(await active('agency', 'client_vodacom_group', false), false, 'drafts were shown with draft mode off');
  assert.equal(await active('agency', 'client_vodacom_group'), true);
  assert.equal(await active('otherTenant', 'client_vodacom_group'), true, 'a client lost the preview of its own site');
  assert.equal(await active('flagshipEditor', 'client_vodacom_group'), false, 'draft mode let one client read another\'s drafts');
  assert.equal(await active(null, 'client_vodacom_group'), false, 'a visitor with a draft-mode cookie and no session saw drafts');
});

test('the multi-tenant site pages decide draft previews with that check, not with the cookie alone', () => {
  for (const file of ['src/app/sites/[siteSlug]/page.tsx', 'src/app/sites/[siteSlug]/[pageSlug]/page.tsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(source.includes('draftPreviewActive('), `${file} does not use draftPreviewActive`);
    assert.ok(!/draft\.isEnabled/.test(source), `${file} still trusts the draft-mode cookie by itself`);
    assert.ok(!/draftMode\s*\(/.test(source), `${file} still reads draft mode directly`);
  }
});
