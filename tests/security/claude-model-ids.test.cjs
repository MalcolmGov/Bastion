const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHarness } = require('./harness.cjs');

const root = path.resolve(__dirname, '../..');
// Dated Claude 3.x snapshots that Anthropic has retired: every request naming one returns 404.
const RETIRED = /claude-3-(?:5|7)-(?:sonnet|haiku)-\d{8}|claude-3-opus-\d{8}|claude-3-sonnet-\d{8}/;

test('copy-assistant Claude provider requests a current model and sends the existing request shape', async t => {
  const h = await createHarness();
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; h.close(); });
  const { CloudAnthropicProvider } = h.load('lib/studio/aiAssistant.ts');

  let sent;
  globalThis.fetch = async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return { ok: true, status: 200, json: async () => ({ content: [{ text: '{"result":"Sharper headline","explanation":"Shorter."}' }] }) };
  };
  const res = await new CloudAnthropicProvider('sk-ant-test').execute({ action: 'improve_headline', inputContent: 'Our headline' });
  assert.equal(sent.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(sent.body.model, 'claude-haiku-4-5');
  assert.doesNotMatch(sent.body.model, RETIRED);
  assert.equal(sent.body.max_tokens, 500);
  assert.equal(res.provider, 'anthropic');
  assert.equal(res.result, 'Sharper headline');
});

test('copy-assistant Claude provider still falls back to local heuristics when the API errors', async t => {
  const h = await createHarness();
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  t.after(() => { globalThis.fetch = realFetch; console.warn = realWarn; h.close(); });
  console.warn = () => {};
  const { CloudAnthropicProvider } = h.load('lib/studio/aiAssistant.ts');
  globalThis.fetch = async () => ({ ok: false, status: 404, json: async () => ({}) });
  const res = await new CloudAnthropicProvider('sk-ant-test').execute({ action: 'improve_headline', inputContent: 'Our headline' });
  assert.equal(res.success, true);
  assert.equal(res.provider, 'deterministic_local');
});

test('files that call Claude for editors name no retired Claude 3.5 model IDs', () => {
  // src/lib/sre/engine.ts is intentionally excluded: it falls back to a heuristic engine today and is
  // tracked separately because enabling its model call changes behaviour. ai-polish still names the
  // retired claude-3-7 id on purpose, inside mapModelId, to redirect it to a live model.
  const retired35 = /claude-3-5-(?:sonnet|haiku)-\d{8}/;
  const files = [
    'src/lib/studio/aiAssistant.ts',
    'src/app/api/admin/voice-copilot/route.ts',
    'src/app/api/admin/editor/ai-polish/route.ts',
    'src/components/studio/MultiModelAiCodingChat.tsx',
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(source, retired35, `${file} still names a retired Claude 3.5 model`);
  }
});
