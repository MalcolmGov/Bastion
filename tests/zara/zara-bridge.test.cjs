const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('../editor/harness.cjs');

test('Zara AI Bridge: returns executive greeting for empty query', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ZaraBridgeClient } = h.load('lib/zara/bridgeClient.ts');
  const client = new ZaraBridgeClient();

  const res = await client.processMessage('', [], {
    portalViewMode: 'agency',
    userName: 'Malcolm',
    clientName: 'Gold Fields Limited'
  });

  assert.ok(res.reply.includes('Zara AI Executive Copilot'));
  assert.ok(res.reply.includes('Malcolm'));
  assert.ok(res.speechText.includes('Zara AI Executive Copilot'));
  assert.ok(res.suggestedNextSteps.length > 0);
});

test('Zara AI Bridge: executes Compliance Guardian tool on demand', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ZaraBridgeClient } = h.load('lib/zara/bridgeClient.ts');
  const client = new ZaraBridgeClient();

  const res = await client.processMessage('Zara, run a statutory compliance audit on our copy', [], {
    portalViewMode: 'agency',
    userName: 'Malcolm',
    clientId: 'client_goldfields'
  });

  assert.equal(res.toolsExecuted.length, 1);
  assert.equal(res.toolsExecuted[0].toolName, 'runComplianceAudit');
  assert.ok(res.reply.includes('Compliance Guardian Audit'));
  assert.ok(res.toolsExecuted[0].result.overallScore !== undefined);
  assert.ok(res.actionCards.length > 0);
});

test('Zara AI Bridge: executes SRE Edge Fleet Telemetry tool', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ZaraBridgeClient } = h.load('lib/zara/bridgeClient.ts');
  const client = new ZaraBridgeClient();

  const res = await client.processMessage('Zara, check multi-tenant SRE fleet uptime and edge latency', [], {
    portalViewMode: 'agency',
    userName: 'Malcolm'
  });

  assert.equal(res.toolsExecuted.length, 1);
  assert.equal(res.toolsExecuted[0].toolName, 'getFleetHealth');
  assert.ok(res.reply.includes('Fleet Telemetry'));
  assert.ok(res.speechText.includes('latency') || res.speechText.includes('operational'));
});

test('Zara AI Bridge: extracts Brand DNA design system tokens', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ZaraBridgeClient } = h.load('lib/zara/bridgeClient.ts');
  const client = new ZaraBridgeClient();

  const res = await client.processMessage('Zara, extract the brand design tokens for Gold Fields', [], {
    portalViewMode: 'agency',
    userName: 'Malcolm',
    clientName: 'Gold Fields'
  });

  assert.equal(res.toolsExecuted.length, 1);
  assert.equal(res.toolsExecuted[0].toolName, 'extractBrandDna');
  assert.equal(res.toolsExecuted[0].result.primaryColor, '#D97706');
  assert.ok(res.reply.includes('Brand DNA & Design System Extracted'));
});

test('Zara AI Bridge: Public Corporate Concierge grounds responses in verified disclosures', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ZaraBridgeClient } = h.load('lib/zara/bridgeClient.ts');
  const client = new ZaraBridgeClient();

  const res = await client.processMessage('Tell me about the South Deep bulk mechanized mining operation', [], {
    portalViewMode: 'public',
    clientName: 'Gold Fields Limited'
  });

  assert.ok(res.toolsExecuted.length > 0);
  assert.equal(res.toolsExecuted[0].toolName, 'searchCorporateDisclosures');
  assert.ok(res.reply.includes('South Deep') || res.reply.includes('Authoritative Corporate Disclosures'));
  assert.ok(res.sources.length > 0);
  assert.ok(res.actionCards.length > 0);
});
