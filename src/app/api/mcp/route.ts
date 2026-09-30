import { NextRequest, NextResponse } from 'next/server';
import {
  MCP_TOOLS,
  MCP_RESOURCES,
  handleMcpToolCall,
  handleMcpResourceRead
} from '@/lib/mcp/server';

/**
 * Bastion Model Context Protocol (MCP) Server Endpoint
 * Implements Anthropic MCP JSON-RPC 2.0 Specification
 * 
 * Enables AI agents (Cursor, Claude Desktop, Antigravity, custom agents)
 * to interact with the Bastion CMS Content Lake, Dynamic Zones, and Brand Engine.
 */

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as JsonRpcRequest;
    const { id = 1, method, params = {} } = body;

    // 1. Handshake / Initialize
    if (method === 'initialize') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true },
            resources: { subscribe: false, listChanged: true }
          },
          serverInfo: {
            name: 'bastion-mcp-server',
            version: '1.0.0',
            description: 'Bastion Enterprise CMS — Headless Content Lake & Dynamic Zones Engine'
          }
        }
      });
    }

    // 2. Initialized notification (acknowledgement)
    if (method === 'notifications/initialized') {
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
    }

    // 3. Ping
    if (method === 'ping') {
      return NextResponse.json({ jsonrpc: '2.0', id, result: {} });
    }

    // 4. Tools Listing
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: MCP_TOOLS
        }
      });
    }

    // 5. Tool Call Execution
    if (method === 'tools/call') {
      const toolName = params.name;
      const toolArgs = params.arguments || {};

      if (!toolName) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name in params' }
        }, { status: 400 });
      }

      try {
        const executionResult = await handleMcpToolCall(toolName, toolArgs);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof executionResult === 'string'
                  ? executionResult
                  : JSON.stringify(executionResult, null, 2)
              }
            ],
            isError: false
          }
        });
      } catch (toolError: any) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `[MCP Tool Error] ${toolError?.message || String(toolError)}`
              }
            ],
            isError: true
          }
        });
      }
    }

    // 6. Resources Listing
    if (method === 'resources/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          resources: MCP_RESOURCES
        }
      });
    }

    // 7. Resource Read
    if (method === 'resources/read') {
      const uri = params.uri;
      if (!uri) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing resource URI in params' }
        }, { status: 400 });
      }

      try {
        const resource = await handleMcpResourceRead(uri);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri,
                mimeType: resource.mimeType,
                text: resource.text
              }
            ]
          }
        });
      } catch (resError: any) {
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: resError?.message || 'Resource read failure' }
        }, { status: 500 });
      }
    }

    // Unrecognized Method
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method '${method}' not supported by Bastion MCP Server.`
      }
    }, { status: 404 });

  } catch (err: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: `Parse error: ${err?.message || 'Invalid JSON'}`
      }
    }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3010';
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;
  const mcpEndpoint = `${baseUrl}/api/mcp`;

  const accept = req.headers.get('accept') || '';
  if (accept.includes('application/json') || req.nextUrl.searchParams.get('format') === 'json') {
    return NextResponse.json({
      name: 'bastion-mcp-server',
      version: '1.0.0',
      protocolVersion: '2024-11-05',
      endpoint: mcpEndpoint,
      tools: MCP_TOOLS,
      resources: MCP_RESOURCES,
      configurations: {
        claudeDesktop: {
          mcpServers: {
            bastion: {
              url: mcpEndpoint
            }
          }
        },
        cursor: {
          bastion: {
            type: 'http',
            url: mcpEndpoint
          }
        }
      }
    });
  }

  // Developer interactive documentation UI
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bastion MCP Server — Developer & Agent Hub</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090b10;
      --card: #11141d;
      --border: #1e2433;
      --accent: #d97706;
      --accent-hover: #b45309;
      --emerald: #10b981;
      --cyan: #06b6d4;
      --text: #f3f4f6;
      --muted: #9ca3af;
      --code-bg: #05070a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 32px 20px;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .pulse {
      width: 7px;
      height: 7px;
      background: var(--emerald);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--emerald);
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; color: #fff; margin-top: 8px; }
    p.lead { color: var(--muted); font-size: 14px; max-width: 650px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .card h3 { font-size: 15px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #38bdf8;
      overflow-x: auto;
      margin-top: 8px;
    }
    .copy-btn {
      background: #1e2433;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      float: right;
      transition: all 0.15s;
    }
    .copy-btn:hover { background: #334155; }
    .tool-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .tool-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
    .tool-name { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #fbbf24; }
    .tool-desc { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
    .tag { font-size: 10px; background: #1e2433; color: #94a3b8; padding: 2px 6px; border-radius: 4px; }
    .endpoint-pill {
      font-family: 'JetBrains Mono', monospace;
      background: #1e2433;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #38bdf8;
      border: 1px solid #334155;
      display: inline-block;
      margin-top: 8px;
    }
    .tester-section {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-top: 32px;
    }
    select, button.test-exec {
      background: #1e2433;
      border: 1px solid #334155;
      color: #fff;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
    }
    button.test-exec {
      background: var(--accent);
      border-color: var(--accent);
      font-weight: 600;
      cursor: pointer;
      margin-left: 8px;
    }
    button.test-exec:hover { background: var(--accent-hover); }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <span class="badge"><span class="pulse"></span> MCP Server Active &bull; JSON-RPC 2.0</span>
        <h1>Bastion Model Context Protocol (MCP) Server</h1>
        <p class="lead">Connect Claude Desktop, Cursor, Antigravity, or custom agent swarms directly to the Bastion Headless Content Lake, Dynamic Zones engine, and Brand DNA pipeline.</p>
        <div class="endpoint-pill">POST ${mcpEndpoint}</div>
      </div>
      <div>
        <a href="/admin/overview" style="color: var(--muted); text-decoration: none; font-size: 13px; border: 1px solid var(--border); padding: 8px 14px; border-radius: 6px; background: var(--card); display: inline-block;">&larr; Back to Admin Overview</a>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <h3>
          <span>Cursor MCP Integration</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('cursor-cfg').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500)">Copy</button>
        </h3>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Add to your project's <code>.cursor/mcp.json</code> or Cursor Settings:</p>
        <pre id="cursor-cfg">{
  "mcpServers": {
    "bastion": {
      "type": "http",
      "url": "${mcpEndpoint}"
    }
  }
}</pre>
      </div>

      <div class="card">
        <h3>
          <span>Claude Desktop Integration</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('claude-cfg').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 1500)">Copy</button>
        </h3>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">Add to <code>claude_desktop_config.json</code> under <code>mcpServers</code>:</p>
        <pre id="claude-cfg">{
  "mcpServers": {
    "bastion-cms": {
      "url": "${mcpEndpoint}"
    }
  }
}</pre>
      </div>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 16px; font-weight: 700;">Registered Tools (${MCP_TOOLS.length})</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 14px;">
      ${MCP_TOOLS.map(tool => `
        <div class="tool-item">
          <div class="tool-header">
            <span class="tool-name">${tool.name}</span>
            <span class="tag">JSON-RPC</span>
          </div>
          <p class="tool-desc">${tool.description}</p>
          <div style="font-size: 11px; color: #64748b;">
            Params: ${Object.keys(tool.inputSchema.properties || {}).join(', ') || 'None'}
          </div>
        </div>
      `).join('')}
    </div>

    <h2 style="font-size: 18px; margin-top: 32px; margin-bottom: 16px; font-weight: 700;">Live Resources (${MCP_RESOURCES.length})</h2>
    <div class="grid">
      ${MCP_RESOURCES.map(res => `
        <div class="card">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--cyan); margin-bottom: 6px;">${res.uri}</div>
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${res.name}</div>
          <div style="font-size: 12px; color: var(--muted);">${res.description}</div>
        </div>
      `).join('')}
    </div>

    <div class="tester-section">
      <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Live In-Browser Tool Tester</h3>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px;">Test any Bastion MCP tool execution synchronously through this endpoint:</p>
      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px;">
        <select id="tool-select">
          ${MCP_TOOLS.map(t => `<option value="${t.name}">${t.name}</option>`).join('')}
        </select>
        <button class="test-exec" onclick="runToolTest()">Execute Tool</button>
      </div>
      <pre id="test-output" style="max-height: 280px; overflow-y: auto;">// Execution response will appear here...</pre>
    </div>
  </div>

  <script>
    async function runToolTest() {
      const toolName = document.getElementById('tool-select').value;
      const out = document.getElementById('test-output');
      out.innerText = 'Calling ' + toolName + '...';

      let sampleArgs = {};
      if (toolName === 'query_content') sampleArgs = { collection: 'news', limit: 3 };
      if (toolName === 'list_clients') sampleArgs = { status: 'active' };
      if (toolName === 'extract_brand_dna') sampleArgs = { url: 'https://www.goldfields.com' };
      if (toolName === 'analyze_compliance') sampleArgs = { text: 'Gold Fields announces 2026 ESG milestones and expected revenue surge.', type: 'article' };
      if (toolName === 'get_page_composition') sampleArgs = { slug: 'home' };

      try {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'web-test-' + Date.now(),
            method: 'tools/call',
            params: {
              name: toolName,
              arguments: sampleArgs
            }
          })
        });
        const data = await res.json();
        out.innerText = JSON.stringify(data, null, 2);
      } catch (e) {
        out.innerText = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
