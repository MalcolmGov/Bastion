const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');
const sections = [
  {
    id: 'hero',
    componentId: 'hero',
    visible: true,
    props: { title: 'Updated heading' },
    styles: {},
  },
];
const author = {
  id: 'author-a',
  name: 'Author',
  role: 'content_editor',
  client_id: 'tenant-a',
};
async function setup(t) {
  const h = await createHarness();
  t.after(() => h.close());
  const { saveComposition } = h.load('lib/studio/editor/saveComposition.ts');
  return { h, saveComposition };
}
const input = (extra = {}) => ({
  siteId: 'site-a',
  pageSlug: 'home',
  expectedVersion: 1,
  sections,
  ...extra,
});
test('save preserves existing metadata, design collection, title and original creation time', async (t) => {
  const { h, saveComposition } = await setup(t);
  await h.db.execute(
    `UPDATE page_compositions SET layout_collection='editorial', meta_json='{"description":"Keep this"}', created_at='2020-01-01' WHERE id='page-a'`,
  );
  const result = await saveComposition(author, input());
  assert.equal(result.version, 2);
  const row = (
    await h.db.execute("SELECT * FROM page_compositions WHERE id='page-a'")
  ).rows[0];
  assert.equal(row.layout_collection, 'editorial');
  assert.equal(row.title, 'A Home');
  assert.equal(row.created_at, '2020-01-01');
  assert.equal(row.meta_json, '{"description":"Keep this"}');
});
test('stale saves cannot overwrite a newer document', async (t) => {
  const { h, saveComposition } = await setup(t);
  await saveComposition(author, input());
  await assert.rejects(
    saveComposition(author, input({ sections: [] })),
    (error) => error.status === 409,
  );
  assert.equal(
    (
      await h.db.execute(
        "SELECT version FROM page_compositions WHERE id='page-a'",
      )
    ).rows[0].version,
    2,
  );
  assert.equal(
    (await h.db.execute('SELECT COUNT(*) AS total FROM page_versions')).rows[0]
      .total,
    1,
  );
});
test('composition, history and audit writes roll back together on failure', async (t) => {
  const { h, saveComposition } = await setup(t);
  await h.db.execute(
    "CREATE TRIGGER fail_audit BEFORE INSERT ON audit_log BEGIN SELECT RAISE(ABORT,'audit failed'); END",
  );
  await assert.rejects(saveComposition(author, input()));
  assert.equal(
    (
      await h.db.execute(
        "SELECT version FROM page_compositions WHERE id='page-a'",
      )
    ).rows[0].version,
    1,
  );
  assert.equal(
    (await h.db.execute('SELECT COUNT(*) AS total FROM page_versions')).rows[0]
      .total,
    0,
  );
});
test('draft saving retains the public baseline until explicit publication', async (t) => {
  const { h, saveComposition } = await setup(t);
  const { getPublishedComposition } = h.load(
    'lib/studio/editor/publishedComposition.ts',
  );
  await h.db.execute(
    "UPDATE page_compositions SET status='published',sections_json='[]' WHERE id='page-a'",
  );
  await saveComposition(author, input());
  let live = (await getPublishedComposition(h.db, 'site-a', 'home')).rows[0];
  assert.equal(live.sections_json, '[]');
  assert.equal(live.version, 1);
  await assert.rejects(
    saveComposition(author, input({ expectedVersion: 2, status: 'published' })),
    (error) => error.status === 403,
  );
  // Publishing also needs a reviewer other than the author to have approved this exact version.
  await assert.rejects(
    saveComposition({ ...author, role: 'publisher' }, input({ expectedVersion: 2, status: 'published' })),
    (error) => error.status === 409 && error.code === 'approval_required',
  );
  const { approvePageVersion } = h.load('lib/studio/editor/pageApproval.ts');
  await approvePageVersion(
    { id: 'reviewer-a', name: 'Reviewer', role: 'reviewer', client_id: 'tenant-a' },
    { siteId: 'site-a', pageSlug: 'home', version: 2 },
  );
  await saveComposition(
    { ...author, role: 'publisher' },
    input({ expectedVersion: 2, status: 'published' }),
  );
  live = (await getPublishedComposition(h.db, 'site-a', 'home')).rows[0];
  assert.equal(live.version, 3);
  assert.equal(
    JSON.parse(live.sections_json)[0].props.title,
    'Updated heading',
  );
  assert.equal(
    (await getPublishedComposition(h.db, 'site-b', 'home')).rows.length,
    0,
  );
});
test('slug saves resolve the canonical website ID and new pages start empty', async (t) => {
  const { h, saveComposition } = await setup(t);
  const result = await saveComposition(
    author,
    input({
      siteId: 'a',
      pageSlug: 'our-team',
      expectedVersion: 0,
      sections: [],
    }),
  );
  assert.equal(result.siteId, 'site-a');
  assert.equal(result.version, 1);
  const row = (
    await h.db.execute(
      "SELECT * FROM page_compositions WHERE page_slug='our-team'",
    )
  ).rows[0];
  assert.equal(row.site_id, 'site-a');
  assert.equal(row.sections_json, '[]');
});
test('permissions, tenant boundaries, malformed sections and invalid versions are enforced', async (t) => {
  const { saveComposition } = await setup(t);
  await assert.rejects(
    saveComposition({ ...author, role: 'reviewer' }, input()),
    (error) => error.status === 403,
  );
  await assert.rejects(
    saveComposition(author, input({ siteId: 'site-b' })),
    (error) => error.status === 404,
  );
  await assert.rejects(
    saveComposition(author, input({ expectedVersion: undefined })),
    (error) => error.status === 400,
  );
  await assert.rejects(
    saveComposition(author, input({ sections: [sections[0], sections[0]] })),
    (error) => error.status === 400,
  );
});
test('restore creates a new draft version and rejects stale restoration', async (t) => {
  const { h, saveComposition } = await setup(t);
  await saveComposition(author, input());
  h.user(author);
  const route = h.route('api/admin/editor/rollback');
  let response = await route.POST(
    h.request('/api/admin/editor/rollback', {
      siteId: 'site-a',
      pageSlug: 'home',
      targetVersion: 2,
      expectedVersion: 2,
    }),
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.newVersion, 3);
  assert.equal(data.status, 'draft');
  assert.deepEqual(data.sections, sections);
  response = await route.POST(
    h.request('/api/admin/editor/rollback', {
      siteId: 'site-a',
      pageSlug: 'home',
      targetVersion: 2,
      expectedVersion: 2,
    }),
  );
  assert.equal(response.status, 409);
});

test('assistant validates complete proposals and preserves nested content', async (t) => {
  const { h } = await setup(t);
  const { validateAiProposal } = h.load('lib/studio/editor/aiProposal.ts');
  const section = {
    ...sections[0],
    props: { title: 'Old', primaryCta: { label: 'Contact', href: '/contact' } },
  };
  const proposal = validateAiProposal(
    '```json\n' +
      JSON.stringify({
        targetSectionId: 'hero',
        summary: 'Shorter heading',
        props: { title: 'Clear', primaryCta: { label: 'Get in touch' } },
      }) +
      '\n```',
    section,
  );
  assert.equal(proposal.props.title, 'Clear');
  assert.deepEqual(proposal.props.primaryCta, {
    label: 'Get in touch',
    href: '/contact',
  });
  for (const raw of [
    { targetSectionId: 'other', props: { title: 'Wrong' } },
    { props: { unknown: 'Invalid' } },
    { props: { title: 'javascript:alert(1)' } },
    { props: { title: 42 } },
  ])
    assert.throws(() =>
      validateAiProposal('```json\n' + JSON.stringify(raw) + '\n```', section),
    );
  assert.throws(() =>
    validateAiProposal('```json\n{"props":{"title":"truncated\n```', section),
  );
  assert.equal(validateAiProposal('Which tone do you prefer?', section), null);
});
test('assistant reuses provider credentials, requires edit access, and never substitutes canned changes', async (t) => {
  const { h } = await setup(t);
  h.user(author);
  const route = h.route('api/admin/editor/ai-polish');
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });
  const body = {
    assistantMode: true,
    provider: 'openai',
    modelId: 'gpt-4o',
    userApiKey: 'fixture-key',
    prompt: 'Shorten the heading',
    section: sections[0],
    allSections: sections,
    pageContext: { siteId: 'site-a', pageSlug: 'home' },
  };
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                '```json\n{"summary":"Shorter heading","targetSectionId":"hero","props":{"title":"Clear heading"}}\n```',
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  let response = await route.POST(
    h.request('/api/admin/editor/ai-polish', body),
  );
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).parsedChanges.props.title,
    'Clear heading',
  );
  assert.equal(
    (
      await h.db.execute(
        "SELECT version FROM page_compositions WHERE id='page-a'",
      )
    ).rows[0].version,
    1,
  );
  global.fetch = async () =>
    new Response(
      JSON.stringify({ error: { message: 'Provider unavailable' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  response = await route.POST(h.request('/api/admin/editor/ai-polish', body));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).parsedChanges, undefined);
  response = await route.POST(
    h.request('/api/admin/editor/ai-polish', {
      ...body,
      pageContext: { siteId: 'site-b', pageSlug: 'home' },
    }),
  );
  assert.equal(response.status, 403);
  h.user({ ...author, role: 'read_only_stakeholder' });
  response = await route.POST(h.request('/api/admin/editor/ai-polish', body));
  assert.equal(response.status, 403);
});

test('draft saving preserves a baseline published by a release using an existing draft version', async (t) => {
  const { h, saveComposition } = await setup(t);
  const { getPublishedComposition } = h.load(
    'lib/studio/editor/publishedComposition.ts',
  );
  await saveComposition(author, input());
  await h.db.execute(
    "UPDATE page_compositions SET status='published' WHERE id='page-a'",
  );
  await saveComposition(author, input({ expectedVersion: 2, sections: [] }));
  const live = (await getPublishedComposition(h.db, 'site-a', 'home')).rows[0];
  assert.equal(live.version, 2);
  assert.equal(
    JSON.parse(live.sections_json)[0].props.title,
    'Updated heading',
  );
});

test('website plans choose multiple pages without a selected section and validate their scope', async (t) => {
  const { h } = await setup(t);
  const { validateWebsiteProposal } = h.load(
    'lib/studio/editor/websiteProposal.ts',
  );
  const pages = [
    { pageSlug: 'home', title: 'Home', version: 1, sections },
    {
      pageSlug: 'about',
      title: 'About',
      version: 2,
      sections: [{ ...sections[0], id: 'about-hero' }],
    },
  ];
  const plan = validateWebsiteProposal(
    '```json\n{"summary":"Dark theme","theme":"dark"}\n```',
    pages,
  );
  assert.equal(plan.pages.length, 2);
  assert.equal(plan.pages[1].sections[0].styles.backgroundColor, '#0F172A');
  assert.equal(pages[0].sections[0].styles.backgroundColor, undefined);
  assert.throws(() =>
    validateWebsiteProposal(
      '{"changes":[{"pageSlug":"foreign","targetSectionId":"hero","props":{"title":"Bad"}}]}',
      pages,
    ),
  );
  assert.throws(() =>
    validateWebsiteProposal(
      '{"changes":[{"pageSlug":"home","targetSectionId":"unknown","props":{"title":"Bad"}}]}',
      pages,
    ),
  );
  assert.throws(() =>
    validateWebsiteProposal(
      '{"orders":[{"pageSlug":"home","sectionIds":[]}]}',
      pages,
    ),
  );
  const sectionPlan = validateWebsiteProposal(
    '{"theme":"dark"}',
    [
      {
        ...pages[0],
        sections: [sections[0], { ...sections[0], id: 'second' }],
      },
    ],
    { pageSlug: 'home', id: 'hero' },
  );
  assert.equal(sectionPlan.pages[0].sections.length, 2);
  assert.equal(
    sectionPlan.pages[0].sections[1].styles.backgroundColor,
    undefined,
  );
});
test('website draft plans apply atomically and roll back all pages on a conflict', async (t) => {
  const { h } = await setup(t);
  const { saveWebsiteDrafts } = h.load('lib/studio/editor/saveComposition.ts');
  await h.db.execute(
    "INSERT INTO page_compositions VALUES('page-about','site-a','about','About','editorial','[]',NULL,1,'published','2026-10-01','2026-10-01')",
  );
  const pages = [
    { pageSlug: 'home', expectedVersion: 1, sections },
    { pageSlug: 'about', expectedVersion: 9, sections },
  ];
  await assert.rejects(
    saveWebsiteDrafts(author, 'site-a', pages),
    (error) => error.status === 409,
  );
  assert.equal(
    (
      await h.db.execute(
        "SELECT version FROM page_compositions WHERE id='page-a'",
      )
    ).rows[0].version,
    1,
  );
  assert.equal(
    (await h.db.execute('SELECT COUNT(*) AS count FROM page_versions')).rows[0]
      .count,
    0,
  );
  pages[1].expectedVersion = 1;
  const result = await saveWebsiteDrafts(author, 'site-a', pages);
  assert.equal(result.length, 2);
  assert.equal(result[1].version, 2);
  await assert.rejects(
    saveWebsiteDrafts(author, 'site-b', pages),
    (error) => error.status === 404,
  );
});
test('website assistant reads authorized website context without selecting a page or section', async (t) => {
  const { h } = await setup(t);
  h.user(author);
  const route = h.route('api/admin/editor/ai-polish');
  const originalFetch = global.fetch;
  t.after(() => (global.fetch = originalFetch));
  await h.db.execute({
    sql: "UPDATE page_compositions SET sections_json=? WHERE id='page-a'",
    args: [JSON.stringify(sections)],
  });
  global.fetch = async (url, options) => {
    const payload = JSON.parse(options.body);
    assert.match(payload.messages[0].content, /Allowed pages and sections/);
    assert.equal(payload.response_format.type, 'json_object');
    assert.match(payload.messages[0].content, /home/);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                message: 'Review this dark theme',
                plan: { summary: 'Dark theme', theme: 'dark' },
              }),
            },
          },
        ],
      }),
      { status: 200 },
    );
  };
  const response = await route.POST(
    h.request('/api/admin/editor/ai-polish', {
      assistantMode: true,
      websiteMode: true,
      provider: 'openai',
      modelId: 'gpt-4o',
      userApiKey: 'fixture-key',
      prompt: 'Create a dark theme',
      pageContext: { siteId: 'site-a' },
    }),
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.parsedChanges.pages[0].pageSlug, 'home');
  assert.equal(data.parsedChanges.pages[0].sections[0].styles.theme, 'dark');
});

test('multi-page saves preserve existing history when a page version counter was reset', async (t) => {
  const { h } = await setup(t);
  const { saveWebsiteDrafts } = h.load('lib/studio/editor/saveComposition.ts');
  await h.db.execute(
    "INSERT INTO page_compositions VALUES('page-about','site-a','about','About','editorial','[]',NULL,1,'draft','2026-10-01','2026-10-01')",
  );
  await h.db.execute(
    "INSERT INTO page_versions(id,composition_id,site_id,page_slug,version,sections_json,status) VALUES('pver_site-a_home_v2','page-a','site-a','home',2,'[]','draft')",
  );
  const results = await saveWebsiteDrafts(author, 'site-a', [
    { pageSlug: 'home', expectedVersion: 1, sections },
    { pageSlug: 'about', expectedVersion: 1, sections },
  ]);
  assert.deepEqual(
    results.map((page) => page.version),
    [3, 2],
  );
  const old = (
    await h.db.execute(
      "SELECT sections_json FROM page_versions WHERE id='pver_site-a_home_v2'",
    )
  ).rows[0];
  assert.equal(old.sections_json, '[]');
  assert.equal(
    (
      await h.db.execute(
        "SELECT COUNT(*) AS total FROM page_versions WHERE page_slug='home'",
      )
    ).rows[0].total,
    2,
  );
});

async function assistantSetup(t) {
  const { h } = await setup(t);
  return h.load('lib/studio/editor/assistantContext.ts');
}
const assistantPages = [
  {
    pageSlug: 'home',
    title: 'Home',
    version: 1,
    sections: [
      {
        id: 'home-hero',
        componentId: 'hero',
        visible: true,
        props: {
          title: 'Welcome',
          bgImage: 'https://images.example/building.jpg',
        },
        styles: {},
      },
    ],
  },
  {
    pageSlug: 'about',
    title: 'About us',
    version: 1,
    sections: [
      {
        id: 'about-hero',
        componentId: 'hero',
        visible: true,
        props: {
          title: 'Our team',
          subtitle: 'Consulting and collaboration',
          bgImage: 'https://images.example/meeting.jpg',
        },
        styles: {},
      },
    ],
  },
];
test('relative hero requests use the current page; named and whole-site requests override it', async (t) => {
  const a = await assistantSetup(t);
  assert.deepEqual(
    a
      .resolveAssistantPages(assistantPages, 'home', 'replace the hero image')
      .map((p) => p.pageSlug),
    ['home'],
  );
  assert.deepEqual(
    a
      .resolveAssistantPages(
        assistantPages,
        'home',
        'replace the hero image on about',
      )
      .map((p) => p.pageSlug),
    ['about'],
  );
  assert.equal(
    a.resolveAssistantPages(
      assistantPages,
      'home',
      'replace hero images across all pages',
    ).length,
    2,
  );
  assert.deepEqual(
    a
      .resolveAssistantPages(
        assistantPages,
        'home',
        'What can you do about the hero image?',
      )
      .map((page) => page.pageSlug),
    ['home'],
  );
  assert.equal(
    a.resolveAssistantPages(assistantPages, 'home', 'review the website')
      .length,
    2,
  );
  assert.deepEqual(
    a
      .resolveAssistantPages(
        assistantPages,
        'home',
        'change about image',
        'page',
      )
      .map((p) => p.pageSlug),
    ['home'],
  );
});
test('image requests create an exact current-page plan using available consulting imagery', async (t) => {
  const a = await assistantSetup(t);
  const images = a.imageCatalogue(assistantPages, []);
  const pages = a.resolveAssistantPages(
    assistantPages,
    'home',
    'Can you replace the hero image with another image that is relevant to consulting',
  );
  const plan = a.heroImageProposal(
    pages,
    images,
    'Can you replace the hero image with another image that is relevant to consulting',
  );
  const validated = a.validateAssistantResponse(
    JSON.stringify(plan),
    pages,
    images,
  );
  assert.equal(validated.proposal.pages.length, 1);
  assert.equal(
    validated.proposal.pages[0].sections[0].props.bgImage,
    'https://images.example/meeting.jpg',
  );
  assert.equal(validated.proposal.pages[0].sections[0].props.title, 'Welcome');
  assert.equal(
    assistantPages[0].sections[0].props.bgImage,
    'https://images.example/building.jpg',
  );
});
test('image catalogue retains semantic context when a photo appears on several pages', async (t) => {
  const a = await assistantSetup(t);
  const pages = [
    ...assistantPages,
    {
      ...assistantPages[1],
      title: 'Contact',
      pageSlug: 'contact',
      sections: [
        {
          ...assistantPages[1].sections[0],
          props: { bgImage: 'https://images.example/meeting.jpg' },
        },
      ],
    },
  ];
  const images = a.imageCatalogue(pages, []);
  assert.equal(images.length, 2);
  assert.ok(
    a.heroImageProposal(
      [pages[0]],
      images,
      'replace hero image with consulting image',
    ),
  );
});
test('multi-part requests and missing suitable imagery are left to the planner rather than partially executed', async (t) => {
  const a = await assistantSetup(t);
  const images = a.imageCatalogue(assistantPages, []);
  assert.equal(
    a.heroImageProposal(
      [assistantPages[0]],
      images,
      'replace hero image and rewrite the title for consulting',
    ),
    null,
  );
  assert.equal(
    a.heroImageProposal(
      [assistantPages[0]],
      [],
      'replace hero image for consulting',
    ),
    null,
  );
});
test('structured responses reject fabricated images, foreign pages and unstructured prose', async (t) => {
  const a = await assistantSetup(t);
  const images = a.imageCatalogue(assistantPages, []);
  const response = (extra = {}) =>
    JSON.stringify({
      message: 'Review this change',
      plan: {
        changes: [
          {
            pageSlug: 'home',
            targetSectionId: 'home-hero',
            props: { bgImage: 'https://invented.example/photo.jpg' },
            ...extra,
          },
        ],
      },
    });
  assert.throws(
    () => a.validateAssistantResponse(response(), assistantPages, images),
    /image catalogue/,
  );
  assert.throws(
    () =>
      a.validateAssistantResponse(
        response({ pageSlug: 'foreign' }),
        assistantPages,
        images,
      ),
    /outside/,
  );
  assert.throws(
    () => a.validateAssistantResponse('Which page?', assistantPages, images),
    /structured/,
  );
  assert.equal(
    a.validateAssistantResponse(
      JSON.stringify({
        message: 'Please upload a suitable photo.',
        plan: null,
      }),
      assistantPages,
      images,
    ).proposal,
    null,
  );
});
test('the planner receives current page, editable field definitions and approved layout variants', async (t) => {
  const a = await assistantSetup(t);
  const prompt = a.assistantSystemPrompt(assistantPages, 'home', []);
  assert.match(prompt, /CURRENT PAGE IN VIEW: home/);
  assert.match(prompt, /bgImage/);
  assert.match(prompt, /editorial_split/);
});

test('website image endpoint targets the current hero and only exposes tenant media without an LLM call', async (t) => {
  const { h } = await setup(t);
  h.user(author);
  await h.db.execute({
    sql: "UPDATE page_compositions SET sections_json=? WHERE id='page-a'",
    args: [JSON.stringify(assistantPages[0].sections)],
  });
  await h.db.executeMultiple(
    "INSERT INTO media_assets VALUES('own-photo','tenant-a','https://images.example/meeting.jpg','meeting.jpg','Consulting team meeting','image/jpeg','2026-10-03'),('foreign-photo','tenant-b','https://private.example/secret.jpg','secret.jpg','Consulting confidential','image/jpeg','2026-10-03');",
  );
  const originalFetch = global.fetch;
  t.after(() => (global.fetch = originalFetch));
  global.fetch = async () => {
    throw new Error('Image selection must not call an LLM');
  };
  const route = h.route('api/admin/editor/ai-polish');
  const body = {
    assistantMode: true,
    websiteMode: true,
    provider: 'openai',
    prompt:
      'Can you replace the hero image with another image that is relevant to consulting',
    pageContext: { siteId: 'site-a', pageSlug: 'home' },
    expectedVersion: 1,
  };
  const response = await route.POST(
    h.request('/api/admin/editor/ai-polish', body),
  );
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.provider, 'workspace-images');
  assert.equal(
    data.parsedChanges.pages[0].sections[0].props.bgImage,
    'https://images.example/meeting.jpg',
  );
  assert.ok(!JSON.stringify(data).includes('private.example'));
  const { saveWebsiteDrafts } = h.load('lib/studio/editor/saveComposition.ts');
  await saveWebsiteDrafts(
    author,
    'site-a',
    data.parsedChanges.pages.map((page) => ({
      pageSlug: page.pageSlug,
      expectedVersion: page.version,
      sections: page.sections,
    })),
  );
  assert.equal(
    JSON.parse(
      (
        await h.db.execute(
          "SELECT sections_json FROM page_compositions WHERE id='page-a'",
        )
      ).rows[0].sections_json,
    )[0].props.bgImage,
    'https://images.example/meeting.jpg',
  );
  const denied = await route.POST(
    h.request('/api/admin/editor/ai-polish', {
      ...body,
      pageContext: { siteId: 'site-b', pageSlug: 'home' },
    }),
  );
  assert.equal(denied.status, 403);
});
test('invalid structured model plans get one bounded correction and preserve page context', async (t) => {
  const { h } = await setup(t);
  h.user(author);
  await h.db.execute({
    sql: "UPDATE page_compositions SET sections_json=? WHERE id='page-a'",
    args: [JSON.stringify(assistantPages[0].sections)],
  });
  let calls = 0;
  const originalFetch = global.fetch;
  t.after(() => (global.fetch = originalFetch));
  global.fetch = async (url, options) => {
    calls++;
    const body = JSON.parse(options.body);
    assert.match(body.messages[0].content, /CURRENT PAGE IN VIEW: home/);
    if (calls > 1)
      assert.match(body.messages.at(-1).content, /failed validation/);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                calls === 1
                  ? 'Which page?'
                  : JSON.stringify({
                      message: 'Review the updated heading',
                      plan: {
                        changes: [
                          {
                            pageSlug: 'home',
                            targetSectionId: 'home-hero',
                            props: { title: 'Clear consulting advice' },
                          },
                        ],
                      },
                    }),
            },
          },
        ],
      }),
      { status: 200 },
    );
  };
  const route = h.route('api/admin/editor/ai-polish');
  const response = await route.POST(
    h.request('/api/admin/editor/ai-polish', {
      assistantMode: true,
      websiteMode: true,
      provider: 'openai',
      modelId: 'gpt-4o',
      userApiKey: 'fixture-key',
      prompt: 'Improve this heading',
      expectedVersion: 1,
      pageContext: { siteId: 'site-a', pageSlug: 'home' },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
  assert.equal(
    (await response.json()).parsedChanges.pages[0].sections[0].props.title,
    'Clear consulting advice',
  );
});
