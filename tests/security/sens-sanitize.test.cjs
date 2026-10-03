const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const { createHarness } = require('./harness.cjs');

const SENS_TABLE = `CREATE TABLE sens_announcements(
  id TEXT PRIMARY KEY, client_id TEXT, site_id TEXT, headline TEXT, announcement_type TEXT, jse_code TEXT,
  isin_code TEXT, released_at TEXT, body_html TEXT, summary TEXT, pdf_url TEXT, is_price_sensitive INTEGER,
  status TEXT, sponsor TEXT, embargo_until TEXT, created_at TEXT, updated_at TEXT)`;

const ATTACKS = [
  '<img src=x onerror=alert(1)>',
  '<p onclick="alert(1)">x</p>',
  '<script>alert(1)</script><p>after</p>',
  '<a href="javascript:alert(1)">x</a>',
  '<a href="  JaVaScRiPt:alert(1)">x</a>',
  '<a href="java&#9;script:alert(1)">x</a>',
  '<a href="java&#x0A;script:alert(1)">x</a>',
  '<a href="vbscript:msgbox(1)">x</a>',
  '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>',
  '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
  '<svg onload=alert(1)><script>alert(1)</script></svg>',
  '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
  '<math><mi href="javascript:alert(1)">x</mi></math>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<iframe src="https://evil.example"></iframe>',
  '<form action="javascript:alert(1)"><input name=a><button formaction="javascript:alert(1)">go</button></form>',
  '<object data="javascript:alert(1)"></object><embed src="javascript:alert(1)">',
  '<style>@import url(https://evil.example/x.css);</style><p>x</p>',
  '<p style="background:url(javascript:alert(1))">x</p>',
  '<p style="position:fixed;top:0;left:0;width:100%;height:100%">overlay</p>',
  '<meta http-equiv="refresh" content="0;url=https://evil.example"><base href="https://evil.example/">',
  '<!--[if IE]><script>alert(1)</script><![endif]--><p>x</p>',
  '<scr<script>ipt>alert(1)</scr</script>ipt>',
  '<details open ontoggle=alert(1)>x</details>',
  '<p id="x" name="y" onmouseover="alert(1)" data-x="1">x</p>',
];

const DANGEROUS = /<script|<iframe|<svg|<math|<style|<form|<object|<embed|<meta|<base|javascript:|vbscript:|data:text|srcdoc|\son\w+\s*=/i;

test('SENS body sanitiser removes active content from an attack corpus', async t => {
  const h = await createHarness();
  t.after(() => h.close());
  const { sanitizeHtmlFragment } = h.load('lib/security/sanitizeHtmlFragment.ts');
  for (const payload of ATTACKS) {
    const out = sanitizeHtmlFragment(payload);
    assert.doesNotMatch(out, DANGEROUS, `payload survived: ${payload} -> ${out}`);
    const $ = cheerio.load(out, null, false);
    $('*').each((_, el) => {
      for (const [name, value] of Object.entries(el.attribs || {})) {
        assert.ok(!name.toLowerCase().startsWith('on'), `event handler kept: ${payload} -> ${out}`);
        const url = value.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
        assert.doesNotMatch(url, /^(javascript|vbscript):/, `unsafe url kept: ${payload} -> ${out}`);
      }
    });
  }
});

test('SENS body sanitiser keeps ordinary disclosure formatting and adds no document wrapper', async t => {
  const h = await createHarness();
  t.after(() => h.close());
  const { sanitizeHtmlFragment } = h.load('lib/security/sanitizeHtmlFragment.ts');
  const seeded = '<p>Gold Fields Limited (&quot;Gold Fields&quot;) is pleased to report.</p><p><strong>SALIENT FEATURES:</strong></p><ul><li>Production increased by 4%.</li><li>AISC reduced to US$1,180 per ounce.</li></ul>';
  const out = sanitizeHtmlFragment(seeded);
  assert.doesNotMatch(out, /<html|<body|<head|<!doctype/i);
  const before = cheerio.load(seeded, null, false), after = cheerio.load(out, null, false);
  assert.equal(after.root().text(), before.root().text());
  assert.equal(after('p').length, 2);
  assert.equal(after('strong').length, 1);
  assert.equal(after('li').length, 2);

  const table = sanitizeHtmlFragment('<table><thead><tr><th scope="col" colspan="2">Metric</th></tr></thead><tbody><tr><td align="right" style="color:#333">1,120,000 oz</td></tr></tbody></table>');
  assert.match(table, /<th scope="col" colspan="2">/);
  assert.match(table, /<td align="right" style="color:#333">/);

  const link = sanitizeHtmlFragment('<a href="https://www.jse.co.za/" target="_blank">JSE</a> <a href="/investors#sens">internal</a> <a href="mailto:ir@example.com">mail</a>');
  assert.match(link, /href="https:\/\/www\.jse\.co\.za\/"/);
  assert.match(link, /rel="noopener noreferrer"/);
  assert.match(link, /href="\/investors#sens"/);
  assert.match(link, /href="mailto:ir@example\.com"/);

  assert.equal(sanitizeHtmlFragment(''), '');
});

test('SENS service sanitises on write and on read of rows stored before the fix', async t => {
  const h = await createHarness();
  t.after(() => h.close());
  await h.db.execute(SENS_TABLE);
  const service = h.load('lib/ir/sensService.ts');

  const created = await service.createSensAnnouncement({
    clientId: 'tenant-a', siteId: 'site-a', headline: 'Trading statement',
    bodyHtml: '<p>Safe text</p><img src=x onerror=alert(1)><script>alert(1)</script>',
  });
  assert.doesNotMatch(created.bodyHtml, DANGEROUS);
  const stored = (await h.db.execute({ sql: 'SELECT body_html FROM sens_announcements WHERE id = ?', args: [created.id] })).rows[0];
  assert.doesNotMatch(String(stored.body_html), DANGEROUS);
  assert.match(String(stored.body_html), /Safe text/);

  await h.db.execute({
    sql: `INSERT INTO sens_announcements VALUES('legacy-1','tenant-a','site-a','Legacy','general','JSE: X',NULL,'2026-10-01',?,NULL,NULL,1,'published','Sponsor',NULL,'2026-10-01','2026-10-01')`,
    args: ['<p>Legacy</p><a href="java&#9;script:alert(1)" onclick="alert(1)">x</a><iframe srcdoc="<script>alert(1)</script>"></iframe>'],
  });
  const listed = await service.listSensAnnouncements('tenant-a');
  const legacy = listed.find(item => item.id === 'legacy-1');
  assert.ok(legacy);
  assert.doesNotMatch(legacy.bodyHtml, DANGEROUS);
  assert.match(legacy.bodyHtml, /Legacy/);
  const single = await service.getSensAnnouncement('legacy-1', 'tenant-a');
  assert.doesNotMatch(single.bodyHtml, DANGEROUS);
});
