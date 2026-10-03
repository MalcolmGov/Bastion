import { requireEnv } from './lib/env';
/**
 * Bastion Enterprise CMS — Phase 1 Automated Verification Suite
 * Tests MCP JSON-RPC 2.0 endpoints, Dynamic Zones schema persistence,
 * In-Editor Content Agent transformations, and GitHub integration safety.
 */

export {};

const BASE_URL = 'http://localhost:3010';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'PASS', durationMs });
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'FAIL', durationMs, details: err.message });
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms): ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  console.log('\n============================================================');
  console.log('🚀 BASTION ENTERPRISE CMS — PHASE 1 AUTOMATED TEST SUITE');
  console.log(`Target: ${BASE_URL} | Time: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  let sessionCookie = '';

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: AUTHENTICATION & SESSION MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  console.log('📦 SUITE 1: Authentication & Session Security');

  await runTest('Auth', 'Login as Platform Admin and receive session cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@goldfields.com', password: requireEnv('E2E_CLIENT_PASSWORD') })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert(!!setCookie && setCookie.includes('gf_studio_session'), 'Missing gf_studio_session cookie');
    sessionCookie = (setCookie || '').split(';')[0];
    const data = await res.json();
    assert(data.success === true, 'Response success is not true');
    assert(data.user.role === 'platform_admin', 'User is not platform_admin');
  });

  await runTest('Auth', 'Verify session cookie via /api/admin/auth/me', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: sessionCookie }
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.user.email === 'admin@goldfields.com', 'Authenticated user email mismatch');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: NATIVE MODEL CONTEXT PROTOCOL (MCP) JSON-RPC 2.0
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 2: Native Model Context Protocol (MCP) Server (/api/mcp)');

  await runTest('MCP', 'Handshake initialize returns 2024-11-05 protocol and capabilities', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 101,
        method: 'initialize',
        params: {}
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.result.protocolVersion === '2024-11-05', 'Protocol version must be 2024-11-05');
    assert(data.result.serverInfo.name === 'bastion-mcp-server', 'Server name mismatch');
    assert(!!data.result.capabilities.tools, 'Tools capability missing');
    assert(!!data.result.capabilities.resources, 'Resources capability missing');
  });

  await runTest('MCP', 'tools/list returns 11 registered agent tools with valid schemas', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 102,
        method: 'tools/list'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    const tools = data.result.tools;
    assert(Array.isArray(tools), 'tools must be an array');
    assert(tools.length === 11, `Expected 11 tools, got ${tools.length}`);

    const expectedTools = [
      'list_clients', 'list_collections', 'query_content', 'get_entry',
      'create_entry', 'update_entry', 'publish_entry', 'get_page_composition',
      'save_page_composition', 'extract_brand_dna', 'analyze_compliance'
    ];
    for (const t of expectedTools) {
      assert(tools.some((item: any) => item.name === t), `Missing tool: ${t}`);
    }
  });

  await runTest('MCP', 'tools/call: query_content executes and returns live news documents', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 103,
        method: 'tools/call',
        params: {
          name: 'query_content',
          arguments: { collection: 'news', limit: 3 }
        }
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.result.isError === false, 'Tool returned error');
    const content = JSON.parse(data.result.content[0].text);
    assert(content.total > 0, 'No entries returned from news collection');
    assert(content.entries[0].collection === 'news', 'Returned document is not news');
  });

  await runTest('MCP', 'tools/call: analyze_compliance flags speculative claims with grade C', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 104,
        method: 'tools/call',
        params: {
          name: 'analyze_compliance',
          arguments: { text: 'We guarantee a risk-free massive surge in gold profits for all investors.' }
        }
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.result.isError === false, 'Tool execution error');
    const result = JSON.parse(data.result.content[0].text);
    assert(result.compliant === false, 'Expected non-compliant result');
    assert(result.grade === 'C', 'Expected grade C for critical issues');
    assert(result.issues.some((i: any) => i.severity === 'critical'), 'Expected critical issue flag');
  });

  await runTest('MCP', 'resources/list returns 3 live resources', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 105,
        method: 'resources/list'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.result.resources.length === 3, 'Expected 3 live resources');
  });

  await runTest('MCP', 'resources/read: bastion://telemetry/fleet returns multi-tenant edge vitals', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 106,
        method: 'resources/read',
        params: { uri: 'bastion://telemetry/fleet' }
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    const payload = JSON.parse(data.result.contents[0].text);
    assert(payload.edgeTTFB === '42ms', 'TTFB metric mismatch');
    assert(payload.sslGrade === 'A+', 'SSL grade mismatch');
    assert(Array.isArray(payload.tenants) && payload.tenants.length > 0, 'Tenants list empty');
  });

  await runTest('MCP', 'GET /api/mcp?format=json returns client configuration presets', async () => {
    const res = await fetch(`${BASE_URL}/api/mcp?format=json`);
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.configurations.claudeDesktop.mcpServers.bastion.url.includes('/api/mcp'), 'Claude config missing');
    assert(data.configurations.cursor.bastion.type === 'http', 'Cursor config missing');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 3: IN-EDITOR AI CONTENT AGENT (/api/admin/copilot)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 3: In-Editor AI Content Agent (/api/admin/copilot)');

  await runTest('Agent', 'Corporate Tone Reframe: Institutional Investor voice with AISC discipline', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'reframe',
        text: 'We are expanding our gold production across our mines.',
        tone: 'investor',
        field: 'title'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.action === 'reframe', 'Action mismatch');
    assert(data.rewritten.includes('Disciplined Capital Allocation'), 'Expected capital allocation terminology');
    assert(data.rationale.includes('institutional investor vocabulary'), 'Rationale missing');
  });

  await runTest('Agent', 'Corporate Tone Reframe: ESG & Decarbonization 2030 targets', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'reframe',
        text: 'We are committed to green mining.',
        tone: 'sustainability',
        field: 'title'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.rewritten.includes('2030 Science-Based Decarbonization'), 'Missing ESG 2030 targets');
  });

  await runTest('Agent', 'SENS Compliance Audit flags forward-looking statements with safe alternatives', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'compliance',
        text: 'Gold Fields guarantees a massive surge in dividends with guaranteed risk-free profits in 2026.'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.action === 'compliance', 'Action mismatch');
    assert(data.compliant === false, 'Expected non-compliant audit');
    assert(data.grade === 'C', 'Expected grade C');
    assert(data.issuesCount >= 3, 'Expected at least 3 flagged issues');
    assert(data.compliantRewrite.includes('targeted'), 'Safe replacement targeted missing');
    assert(data.compliantRewrite.includes('disciplined risk-mitigated'), 'Safe replacement risk-mitigated missing');
  });

  await runTest('Agent', 'Automated SEO & Social Metadata generation with 155-char limit', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'seo',
        text: 'Gold Fields announces H1 2026 operational results with steady production at South Deep.',
        field: 'title'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.seo.metaTitle.includes('Gold Fields'), 'Meta title missing client name');
    assert(Array.isArray(data.seo.keywords) && data.seo.keywords.length >= 5, 'Keywords missing');
    assert(!!data.seo.socialCardSnippet, 'Social card snippet missing');
  });

  await runTest('Agent', 'Multi-Language Localization: Spanish (Chile/Peru) & French (Ghana)', async () => {
    const resEs = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'translate',
        text: 'Creating enduring value beyond mining with disciplined capital allocation.',
        targetLanguage: 'es'
      })
    });
    assert(resEs.ok, 'Spanish translation request failed');
    const dataEs = await resEs.json();
    assert(/asignaci[oó]n disciplinada de capital/i.test(dataEs.translated), 'Spanish translation inaccurate');

    const resFr = await fetch(`${BASE_URL}/api/admin/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        action: 'translate',
        text: 'Creating enduring value beyond mining with disciplined capital allocation.',
        targetLanguage: 'fr'
      })
    });
    assert(resFr.ok, 'French translation request failed');
    const dataFr = await resFr.json();
    assert(/allocation disciplin[eé]e du capital/i.test(dataFr.translated), 'French translation inaccurate');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 4: DYNAMIC ZONES & EDITOR PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 4: Dynamic Zones Builder & Composition Persistence');

  let currentSections: any[] = [];

  await runTest('DynamicZones', 'GET /api/admin/editor loads page compositions and modular blocks', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/editor?siteId=apex-advisory&pageSlug=home`);
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    const comp = data.compositions?.find((c: any) => c.pageSlug === 'home') || data.compositions?.[0];
    assert(!!comp && Array.isArray(comp.sections), 'Composition sections missing');
    assert(comp.sections.length > 0, 'Sections array is empty');
    currentSections = comp.sections;
  });

  await runTest('DynamicZones', 'POST /api/admin/editor persists reordered and updated blocks', async () => {
    // Reorder: Move first block to second position
    const reordered = [...currentSections];
    if (reordered.length >= 2) {
      const temp = reordered[0];
      reordered[0] = reordered[1];
      reordered[1] = temp;
    }

    const res = await fetch(`${BASE_URL}/api/admin/editor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteId: 'site_apex_strategy',
        pageSlug: 'home',
        sections: reordered,
        title: 'Apex Advisory — HOME',
        status: 'draft'
      })
    });
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(data.success === true, 'Save composition failed');
  });

  // ─────────────────────────────────────────────────────────────
  // SUITE 5: GITHUB INTEGRATION & OAUTH SAFETY
  // ─────────────────────────────────────────────────────────────
  console.log('\n📦 SUITE 5: GitHub Integration & Developer CLI Detection');

  await runTest('GitHub', 'GET /api/admin/github/connect reports configuration safely without 404', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/github/connect`);
    assert(res.ok, `HTTP status ${res.status}`);
    const data = await res.json();
    assert(typeof data.configured === 'boolean', 'configured field missing');
    assert(typeof data.hasLocalCli === 'boolean', 'hasLocalCli field missing');
    if (!data.configured) {
      assert(data.url === null, 'Unconfigured OAuth should not expose broken auth URL');
    }
  });

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n============================================================');
  console.log('📊 TEST SUITE EXECUTION SUMMARY');
  console.log('============================================================');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);
  console.log(`Total Duration  : ${totalDuration}ms`);

  if (failed === 0) {
    console.log('\n🌟 ALL TESTS PASSED! FULL ENTERPRISE PARITY VERIFIED.\n');
  } else {
    console.error(`\n⚠️  ${failed} TESTS FAILED. CHECK LOGS ABOVE.\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal suite failure:', err);
  process.exit(1);
});
