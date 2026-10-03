const test = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const SPEAK = 'api/admin/voice-copilot/speak';

async function fixture(t, { configured = true } = {}) {
  const h = await createHarness();
  const saved = { fetch: global.fetch, key: process.env.ELEVENLABS_API_KEY, voice: process.env.ELEVENLABS_VOICE_ID };
  if (configured) process.env.ELEVENLABS_API_KEY = 'test-key-not-real'; else delete process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_VOICE_ID = 'configured-voice-id';
  const upstream = [];
  global.fetch = async (url, init) => {
    upstream.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    return new Response('audio', { status: 200 });
  };
  let now = Date.UTC(2026, 9, 3, 12, 0, 0);
  t.mock.method(Date, 'now', () => now);
  const realWarn = console.warn, realError = console.error;
  console.warn = () => {};
  console.error = () => {};
  t.after(() => {
    global.fetch = saved.fetch;
    if (saved.key === undefined) delete process.env.ELEVENLABS_API_KEY; else process.env.ELEVENLABS_API_KEY = saved.key;
    if (saved.voice === undefined) delete process.env.ELEVENLABS_VOICE_ID; else process.env.ELEVENLABS_VOICE_ID = saved.voice;
    console.warn = realWarn;
    console.error = realError;
    h.close();
  });
  const signIn = (id = 'user-1') => h.user({ id, name: id, email: `${id}@test.local`, role: 'content_editor', client_id: 'tenant-a' });
  signIn();
  const speak = (text, extra = {}, headers = {}) => {
    const req = h.request('/api/admin/voice-copilot/speak', { text, ...extra });
    for (const [name, value] of Object.entries(headers)) req.headers.set(name, value);
    return h.route(SPEAK).POST(req);
  };
  return {
    h, upstream, signIn, speak,
    advance: ms => { now += ms; },
    limits: () => h.load('lib/copilot/ttsLimits.ts').TTS_LIMITS,
    // Sends `count` requests of `chars` characters, moving the clock on so the per-minute limit is never what stops them.
    spend: async (count, chars) => {
      const statuses = [];
      for (let i = 0; i < count; i++) {
        statuses.push((await speak('x'.repeat(chars))).status);
        now += 3000;
      }
      return statuses;
    },
  };
}

// ---- who may use it, and what it is allowed to ask for ----

test('a signed-out request is refused and nothing is sent to ElevenLabs', async t => {
  const f = await fixture(t);
  f.h.user(null);
  const res = await f.speak('Hello there.');
  assert.equal(res.status, 401);
  assert.equal(f.upstream.length, 0);
});

test('a signed-in person gets audio from the configured voice and model, and the text is passed on as sent', async t => {
  const f = await fixture(t);
  const res = await f.speak('  Good morning.  ');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'audio/mpeg');
  assert.equal(f.upstream.length, 1);
  assert.ok(f.upstream[0].url.includes('/text-to-speech/configured-voice-id/stream'), f.upstream[0].url);
  assert.equal(f.upstream[0].body.text, 'Good morning.');
  assert.equal(f.upstream[0].body.model_id, 'eleven_turbo_v2_5');
});

test('the voice and model are chosen by the server: a caller cannot pick them or steer the request to another ElevenLabs address', async t => {
  const f = await fixture(t);
  const res = await f.speak('Hello.', { voice_id: '../../v1/user/subscription', model_id: 'eleven_multilingual_v2' });
  assert.equal(res.status, 200);
  assert.equal(f.upstream.length, 1);
  const url = new URL(f.upstream[0].url);
  assert.equal(url.hostname, 'api.elevenlabs.io');
  assert.equal(url.pathname, '/v1/text-to-speech/configured-voice-id/stream');
  assert.equal(f.upstream[0].body.model_id, 'eleven_turbo_v2_5');
});

test('empty, blank and non-text input is refused before any limit is spent or any request is sent', async t => {
  const f = await fixture(t);
  for (const text of ['', '   ', undefined, null, 12345, {}, ['a']]) {
    const res = await f.h.route(SPEAK).POST(f.h.request('/api/admin/voice-copilot/speak', { text }));
    assert.equal(res.status, 400, `accepted ${JSON.stringify(text)}`);
  }
  assert.equal(f.upstream.length, 0);
});

// ---- the limits ----

test('one request may not carry more text than a sentence or two, and a refused one costs nothing', async t => {
  const f = await fixture(t);
  const { maxCharsPerRequest, charBudgets } = f.limits();
  const tooLong = (await f.speak('x'.repeat(maxCharsPerRequest + 1)));
  assert.equal(tooLong.status, 413);
  assert.equal(f.upstream.length, 0);
  const exact = await f.speak('x'.repeat(maxCharsPerRequest));
  assert.equal(exact.status, 200, 'the largest allowed text is refused');
  // Refused text is not charged: after enough refused requests to empty the hourly budget twice over, a normal one still works.
  const hourly = charBudgets[0].limit;
  const refused = Math.ceil((hourly * 2) / (maxCharsPerRequest + 1));
  const statuses = await f.spend(refused, maxCharsPerRequest + 1);
  assert.ok(statuses.every(status => status === 413), 'oversized requests were not all refused with 413');
  assert.equal((await f.speak('Still fine.')).status, 200);
});

test('a person who sends requests faster than speech needs is stopped, and told when to retry', async t => {
  const f = await fixture(t);
  const { requestsPerMinute } = f.limits();
  for (let i = 0; i < requestsPerMinute; i++) assert.equal((await f.speak('One short sentence.')).status, 200, `request ${i + 1} refused`);
  const before = f.upstream.length;
  const refused = await f.speak('One short sentence.');
  assert.equal(refused.status, 429);
  assert.ok(Number(refused.headers.get('retry-after')) >= 1, 'no Retry-After');
  assert.equal(f.upstream.length, before, 'a refused request still reached ElevenLabs');
  f.advance(MINUTE + 1000);
  assert.equal((await f.speak('One short sentence.')).status, 200, 'still refused after the minute is over');
});

test('the limit belongs to the signed-in person, not to an address a caller can change', async t => {
  const f = await fixture(t);
  const { requestsPerMinute } = f.limits();
  for (let i = 0; i < requestsPerMinute; i++) await f.speak('One short sentence.', {}, { 'x-forwarded-for': `203.0.113.${i}` });
  assert.equal((await f.speak('One short sentence.', {}, { 'x-forwarded-for': '198.51.100.9' })).status, 429, 'a new address got a new allowance');
  f.signIn('user-2');
  assert.equal((await f.speak('One short sentence.', {}, { 'x-forwarded-for': '203.0.113.1' })).status, 200, 'another person was stopped by the first one');
});

test('spend is bounded by characters, because that is what is billed: an hour and a day each have a budget', async t => {
  const f = await fixture(t);
  const { maxCharsPerRequest, charBudgets } = f.limits();
  const [hourly, daily] = charBudgets;
  assert.equal(hourly.windowMs, HOUR);
  assert.equal(daily.windowMs, DAY);
  // Full-size requests, spaced out so only the character budget can stop them.
  const firstHour = await f.spend(Math.ceil(hourly.limit / maxCharsPerRequest) + 5, maxCharsPerRequest);
  const accepted = firstHour.filter(status => status === 200).length * maxCharsPerRequest;
  assert.ok(accepted <= hourly.limit, `${accepted} characters were let through in an hour (limit ${hourly.limit})`);
  assert.ok(accepted > hourly.limit - maxCharsPerRequest, 'the budget was refused early');
  assert.equal(firstHour[firstHour.length - 1], 429, 'the hour budget did not stop them');
  // Hours pass, and the day's budget still ends it.
  let total = accepted;
  for (let hour = 1; hour < 12; hour++) {
    f.advance(HOUR + MINUTE);
    const statuses = await f.spend(Math.ceil(hourly.limit / maxCharsPerRequest) + 5, maxCharsPerRequest);
    total += statuses.filter(status => status === 200).length * maxCharsPerRequest;
  }
  assert.ok(total <= daily.limit, `${total} characters in half a day (day budget ${daily.limit})`);
  assert.ok(total >= daily.limit - maxCharsPerRequest, 'the day budget was refused early');
});

test('an hour later the budget is back', async t => {
  const f = await fixture(t);
  const { maxCharsPerRequest, charBudgets } = f.limits();
  const statuses = await f.spend(Math.ceil(charBudgets[0].limit / maxCharsPerRequest) + 5, maxCharsPerRequest);
  assert.equal(statuses[statuses.length - 1], 429);
  f.advance(HOUR + MINUTE);
  assert.equal((await f.speak('Back again.')).status, 200);
});

test('the budget is each person\'s own', async t => {
  const f = await fixture(t);
  const { maxCharsPerRequest, charBudgets } = f.limits();
  await f.spend(Math.ceil(charBudgets[0].limit / maxCharsPerRequest) + 5, maxCharsPerRequest);
  assert.equal((await f.speak('Spent.')).status, 429);
  f.signIn('user-2');
  assert.equal((await f.speak('Not spent.')).status, 200);
});

test('when ElevenLabs is not configured nothing is charged to the budget', async t => {
  const f = await fixture(t, { configured: false });
  const { maxCharsPerRequest, charBudgets } = f.limits();
  const statuses = await f.spend(Math.ceil((charBudgets[0].limit * 2) / maxCharsPerRequest), maxCharsPerRequest);
  assert.ok(statuses.every(status => status === 503), 'an unconfigured server answered something other than 503');
  process.env.ELEVENLABS_API_KEY = 'test-key-not-real';
  assert.equal((await f.speak('Now configured.')).status, 200);
});

// ---- the budget itself ----

test('a budget counts what is spent in a sliding window, refuses what does not fit, and says when it will', async t => {
  const f = await fixture(t);
  const { spendBudget } = f.h.load('lib/security/usageBudget.ts');
  const windows = [{ limit: 100, windowMs: 10 * MINUTE }];
  const T0 = 1_000_000;
  assert.equal(spendBudget('a', 60, windows, T0).allowed, true);
  assert.equal(spendBudget('a', 40, windows, T0 + MINUTE).allowed, true);
  const refused = spendBudget('a', 10, windows, T0 + 2 * MINUTE);
  assert.equal(refused.allowed, false);
  // The 60 spent at T0 leaves the window at T0 + 10 minutes, which is when 10 more fits: 8 minutes from now.
  assert.equal(refused.retryAfterSec, 8 * 60);
  assert.equal(spendBudget('a', 10, windows, T0 + 10 * MINUTE).allowed, true, 'not allowed once the old spend expired');
  assert.equal(spendBudget('b', 100, windows, T0).allowed, true, 'one key affected another');
});

test('a refused spend is not recorded, and every window is checked', async t => {
  const f = await fixture(t);
  const { spendBudget } = f.h.load('lib/security/usageBudget.ts');
  const windows = [{ limit: 50, windowMs: MINUTE }, { limit: 80, windowMs: HOUR }];
  const T0 = 5_000_000;
  assert.equal(spendBudget('k', 50, windows, T0).allowed, true);
  assert.equal(spendBudget('k', 1, windows, T0 + 1000).allowed, false, 'the minute limit was ignored');
  // Had the refused 1 been recorded, 50 + 1 + 30 would exceed the hour's 80; it was not, so 30 fits exactly.
  assert.equal(spendBudget('k', 30, windows, T0 + 2 * MINUTE).allowed, true, 'a refused spend was recorded');
  assert.equal(spendBudget('k', 1, windows, T0 + 3 * MINUTE).allowed, false, 'the hour limit was ignored');
});
