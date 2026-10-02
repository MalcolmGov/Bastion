const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHarness } = require("./harness.cjs");

async function fixture(t) {
  const h = await createHarness();
  t.after(() => h.close());
  await h.db.executeMultiple(`
    UPDATE content_records SET owner_id = 'author-a' WHERE id = 'record-a';
    INSERT INTO content_releases(id,client_id,site_id,name,status) VALUES('rel-a','tenant-a','site-a','Launch','draft'),('rel-b','tenant-b','site-b','Secret','draft');
    INSERT INTO content_release_items(id,release_id,item_type,item_id,title,action) VALUES('item-page','rel-a','page','site-a:home','Home','update'),('item-report','rel-a','report','record-a','Report','update'),('item-foreign','rel-a','report','record-b','Foreign','update');
  `);
  return h;
}
async function attention(h, query = "") {
  return h
    .route("api/admin/workspace/attention")
    .GET(
      h.request("/api/admin/workspace/attention" + query, null, null, "GET"),
    );
}
test("attention pins client scope even when another client is requested", async (t) => {
  const h = await fixture(t);
  const response = await attention(h, "?clientId=tenant-b");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.items.some((item) => item.id === "record-a"));
  assert.ok(
    data.items.every((item) => item.id !== "record-b" && item.id !== "rel-b"),
  );
});
test("foreign and mismatched website scopes are rejected", async (t) => {
  const h = await fixture(t);
  assert.equal((await attention(h, "?siteId=site-b")).status, 404);
  h.user({ role: "platform_admin", client_id: null });
  assert.equal(
    (await attention(h, "?clientId=tenant-a&siteId=site-b")).status,
    404,
  );
});
test("analyst receives analytics shortcuts without unpublished content", async (t) => {
  const h = await fixture(t);
  h.user({ role: "analyst" });
  const data = await (await attention(h)).json();
  assert.equal(data.items.length, 0);
  assert.deepEqual(Object.keys(data.counts), []);
  assert.ok(data.links.some((link) => link.href === "/admin/analytics"));
});
test("editor queue includes owned drafts and scoped page layouts", async (t) => {
  const h = await fixture(t);
  h.user({ id: "author-a", role: "content_editor" });
  const data = await (await attention(h, "?siteId=site-a")).json();
  assert.ok(data.items.some((item) => item.id === "record-a"));
  assert.ok(data.items.some((item) => item.id === "page-a"));
  assert.ok(!data.items.some((item) => item.id === "record-a2"));
  assert.equal(data.counts.draft, 2);
});
test("reviewer queue only shows content submitted for review", async (t) => {
  const h = await fixture(t);
  h.user({ role: "reviewer" });
  await h.db.execute(
    "UPDATE content_records SET status = 'in_review' WHERE id = 'record-a'",
  );
  const data = await (await attention(h)).json();
  assert.deepEqual(
    data.items.filter((item) => item.kind !== "release").map((item) => item.id),
    ["record-a"],
  );
});
test("preview denies unauthenticated users and roles without content access", async (t) => {
  const h = await fixture(t);
  h.user(null);
  const route = h.route("api/admin/releases/[id]/preview");
  assert.equal(
    (await route.GET(null, { params: Promise.resolve({ id: "rel-a" }) }))
      .status,
    401,
  );
  h.user({ role: "analyst", client_id: "tenant-a" });
  assert.equal(
    (await route.GET(null, { params: Promise.resolve({ id: "rel-a" }) }))
      .status,
    403,
  );
});
test("preview resolves encoded page keys without leaking foreign items or releases", async (t) => {
  const h = await fixture(t);
  const { getReleasePreview } = h.load("lib/releases/preview.ts");
  const user = { role: "reviewer", client_id: "tenant-a" };
  assert.equal(await getReleasePreview(user, "rel-b"), null);
  const data = await getReleasePreview(user, "rel-a");
  assert.equal(data.items.find((item) => item.id === "item-page").visual, true);
  assert.equal(data.items.find((item) => item.id === "item-page").live, null);
  assert.equal(
    data.items.find((item) => item.id === "item-foreign").proposed,
    null,
  );
  assert.ok(
    data.items.find((item) => item.id === "item-foreign").issues.length,
  );
  assert.ok(!JSON.stringify(data).includes("unpublished B"));
});
test("comparison uses published revision and validates independent approval for exact hash", async (t) => {
  const h = await fixture(t);
  const { getReleasePreview } = h.load("lib/releases/preview.ts");
  await h.db.executeMultiple(`
    INSERT INTO revisions(id,record_id,data_json,content_hash,author_id) VALUES('live-a','record-a','{"secret":"live A"}','old','author-a');
    UPDATE content_records SET current_published_revision_id='live-a', status='approved' WHERE id='record-a';
    INSERT INTO approvals VALUES('self','revision-a','author-a','approved','hash','2026-10-01'),('stale','revision-a','reviewer-a','approved','old','2026-10-01');
  `);
  const user = { role: "reviewer", client_id: "tenant-a" };
  let item = (await getReleasePreview(user, "rel-a")).items.find(
    (item) => item.id === "item-report",
  );
  assert.equal(item.live.secret, "live A");
  assert.equal(item.proposed.secret, "unpublished A");
  assert.deepEqual(item.fields, ["secret"]);
  assert.ok(item.issues.some((issue) => issue.includes("approval")));
  await h.db.execute(
    "INSERT INTO approvals VALUES('valid','revision-a','reviewer-a','approved','hash','2026-10-02')",
  );
  item = (await getReleasePreview(user, "rel-a")).items.find(
    (item) => item.id === "item-report",
  );
  assert.equal(item.issues.length, 0);
  await h.db.execute(
    "INSERT INTO approvals VALUES('rejected','revision-a','reviewer-a','rejected','hash','2026-10-03')",
  );
  item = (await getReleasePreview(user, "rel-a")).items.find(
    (item) => item.id === "item-report",
  );
  assert.ok(item.issues.some((issue) => issue.includes("approval")));
});
