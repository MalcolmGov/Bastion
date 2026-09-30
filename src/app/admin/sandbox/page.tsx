'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code2,
  Zap,
  Globe,
  Database,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  FileJson,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileCode2,
  GitBranch,
  Boxes,
  SlidersHorizontal
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface EndpointOption {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  category: 'Mining & Ops' | 'Financial & Regulatory' | 'Pages & Layouts' | 'Webhooks & Cache';
  defaultParams?: Record<string, string>;
}

const ENDPOINTS: EndpointOption[] = [
  {
    id: 'ops_all',
    name: '10 Global Mining Operations',
    method: 'GET',
    path: '/api/content/operations',
    description: 'Returns all 10 mining assets with coordinates, attributable gold ounces, and ESG infrastructure.',
    category: 'Mining & Ops',
  },
  {
    id: 'ops_single',
    name: 'Single Mine Profile (South Deep)',
    method: 'GET',
    path: '/api/content/operations/south-deep',
    description: 'Full operational profile, 50MW Khanyisa solar plant, workforce agreement, and reserves.',
    category: 'Mining & Ops',
  },
  {
    id: 'reports_all',
    name: 'Financial Results & Investor PDFs',
    method: 'GET',
    path: '/api/content/reports',
    description: 'Quarterly financial booklets, annual disclosures, JSE/NYSE filings, and direct PDF URLs.',
    category: 'Financial & Regulatory',
  },
  {
    id: 'news_sens',
    name: 'Regulatory SENS Announcements',
    method: 'GET',
    path: '/api/content/news',
    description: 'Time-sensitive market releases, JSE regulatory tags, publication dates, and rich text body.',
    category: 'Financial & Regulatory',
  },
  {
    id: 'sustainability_esg',
    name: 'ESG & 2030 Sustainability Scorecard',
    method: 'GET',
    path: '/api/content/sustainability',
    description: 'Decarbonisation trajectories, water recycling stats, community trust spend, and baseline targets.',
    category: 'Mining & Ops',
  },
  {
    id: 'pages_layout',
    name: 'Modular Page Compositions',
    method: 'GET',
    path: '/api/content/pages',
    description: 'Ordered component block tree, layout variants, and metadata for Bastion frontend rendering.',
    category: 'Pages & Layouts',
    defaultParams: { preview: 'true' },
  },
  {
    id: 'webhook_ping',
    name: 'Outbound Cache Invalidation Ping',
    method: 'POST',
    path: '/api/admin/settings/headless',
    description: 'Simulates instant publish event and tests Bastion endpoint latency (< 500ms target).',
    category: 'Webhooks & Cache',
  },
];

interface GraphQLPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  query: string;
  variables?: string;
}

const GRAPHQL_PRESETS: GraphQLPreset[] = [
  {
    id: 'page_tree',
    name: 'Full Page & Dynamic Zones Tree',
    description: 'Deep population of dynamic zone component blocks, media assets with focal points, and bundled release info.',
    category: 'Pages & Blueprints',
    query: `query GetFullPageTree {
  page(slug: "home") {
    id
    slug
    title
    layoutCollection
    version
    status
    locale
    dynamicZones {
      id
      blockType
      order
      isEnabled
      featuredMedia {
        id
        filename
        url
        mimeType
        focalPoint {
          x
          y
        }
      }
    }
    featuredMedia {
      id
      url
    }
    bundledRelease {
      id
      name
      status
      itemCount
      items {
        title
        action
      }
    }
  }
}`
  },
  {
    id: 'ops_deep',
    name: '10 Global Mining Assets with Coordinates',
    description: 'Attributable gold ounces, environmental infrastructure, and featured imagery.',
    category: 'Mining & Ops',
    query: `query GetMiningOperations {
  operations(limit: 10) {
    id
    slug
    title
    country
    status
    metrics
    infrastructure
    featuredMedia {
      id
      filename
      url
      focalPoint {
        x
        y
      }
    }
  }
}`
  },
  {
    id: 'releases_deep',
    name: 'Content Releases & Change Bundles',
    description: 'Scheduled batch publications, staging status, and included item snapshots.',
    category: 'Governance & Releases',
    query: `query GetContentReleases {
  releases {
    id
    name
    status
    scheduledAt
    publishedAt
    itemCount
    items {
      id
      itemType
      title
      action
      changesSummary
    }
  }
}`
  },
  {
    id: 'dam_assets',
    name: 'Enterprise DAM Assets & Focal Points',
    description: 'Digital asset management catalog with AI focal point coordinates (x, y) and metadata.',
    category: 'Media DAM',
    query: `query GetDigitalAssets {
  mediaAssets(folderId: "corporate", limit: 15) {
    id
    filename
    url
    mimeType
    sizeBytes
    folderId
    focalPoint {
      x
      y
    }
    tags
  }
}`
  },
  {
    id: 'investor_reports',
    name: 'Investor Financial PDF Disclosures',
    description: 'Annual reports, quarterly financials, and direct JSE/NYSE document links.',
    category: 'Financial & Regulatory',
    query: `query GetInvestorReports {
  reports(limit: 10) {
    id
    slug
    title
    year
    category
    fileUrl
    fileSize
    status
  }
}`
  },
  {
    id: 'regulatory_news',
    name: 'Regulatory SENS News & Announcements',
    description: 'Time-sensitive market releases with categories, summaries, and media.',
    category: 'Financial & Regulatory',
    query: `query GetRegulatoryNews {
  news(limit: 10) {
    id
    slug
    title
    category
    summary
    publishedAt
    featuredMedia {
      url
    }
  }
}`
  }
];

export default function BastionDeveloperSandboxPage() {
  const { activeClient } = useStudioWorkspace();
  const isGoldFields = activeClient?.id === 'client_goldfields';

  // Mode: REST vs GraphQL
  const [sandboxMode, setSandboxMode] = useState<'rest' | 'graphql'>('rest');

  // REST State
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointOption>(ENDPOINTS[0]);
  const [includeAuth, setIncludeAuth] = useState(true);
  const [apiKey, setApiKey] = useState('sec_goldfields_bastion_2026_live');
  const [enablePreview, setEnablePreview] = useState(false);
  const [customParams, setCustomParams] = useState('');

  // Execution states
  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'nextjs' | 'fetch' | 'webhook'>('nextjs');
  const [activeViewTab, setActiveViewTab] = useState<'json' | 'preview' | 'docs'>('json');

  // GraphQL State
  const [selectedGqlPreset, setSelectedGqlPreset] = useState<GraphQLPreset>(GRAPHQL_PRESETS[0]);
  const [gqlQuery, setGqlQuery] = useState(GRAPHQL_PRESETS[0].query);
  const [gqlVariables, setGqlVariables] = useState('{}');
  const [gqlLoading, setGqlLoading] = useState(false);
  const [gqlResponse, setGqlResponse] = useState<any>(null);
  const [gqlStatus, setGqlStatus] = useState<number | null>(null);
  const [gqlLatencyMs, setGqlLatencyMs] = useState<number | null>(null);
  const [activeGqlTab, setActiveGqlTab] = useState<'response' | 'schema' | 'snippets'>('response');
  const [activeGqlClient, setActiveGqlClient] = useState<'apollo' | 'fetch' | 'urql'>('apollo');

  // Load initial response on mount
  useEffect(() => {
    executeRequest();
  }, [selectedEndpoint]);

  const executeGraphQLQuery = async () => {
    setGqlLoading(true);
    setGqlStatus(null);
    setGqlLatencyMs(null);

    const startTime = performance.now();
    try {
      let parsedVars: any = undefined;
      try {
        if (gqlVariables.trim()) parsedVars = JSON.parse(gqlVariables);
      } catch {
        // ignore
      }

      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(includeAuth ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          query: gqlQuery,
          variables: parsedVars
        })
      });

      const duration = Math.round(performance.now() - startTime);
      const data = await res.json();
      setGqlStatus(res.status);
      setGqlLatencyMs(duration);
      setGqlResponse(data);
    } catch (err: any) {
      setGqlStatus(500);
      setGqlLatencyMs(Math.round(performance.now() - startTime));
      setGqlResponse({ errors: [{ message: err.message }] });
    } finally {
      setGqlLoading(false);
    }
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      if (selectedEndpoint.method === 'POST') {
        const res = await fetch('/api/admin/settings/headless', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ping', siteId: 'site_goldfields_flagship' }),
        });
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();
        setResponseStatus(res.status);
        setLatencyMs(data.latencyMs || duration);
        setResponsePayload(data);
      } else {
        // Construct GET URL with query params
        const query = new URLSearchParams();
        if (includeAuth) {
          query.set('apiKey', apiKey);
        }
        if (enablePreview || selectedEndpoint.defaultParams?.preview) {
          query.set('preview', 'true');
        }
        if (customParams) {
          const parts = customParams.split('&');
          parts.forEach((p) => {
            const [k, v] = p.split('=');
            if (k && v) query.set(k, v);
          });
        }

        const queryString = query.toString() ? `?${query.toString()}` : '';
        const url = `${selectedEndpoint.path}${queryString}`;

        const headers: Record<string, string> = {};
        if (includeAuth) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(url, { headers });
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();
        setResponseStatus(res.status);
        setLatencyMs(duration);
        setResponsePayload(data);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setLatencyMs(Math.round(performance.now() - startTime));
      setResponsePayload({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Code snippets generator
  const getCurlSnippet = () => {
    if (selectedEndpoint.method === 'POST') {
      return `curl -X POST https://cms.goldfields.com${selectedEndpoint.path} \\
  -H "Content-Type: application/json" \\
  -d '{"action": "ping"}'`;
    }
    const previewFlag = enablePreview ? '?preview=true' : '';
    return `curl -X GET "https://cms.goldfields.com${selectedEndpoint.path}${previewFlag}" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Accept: application/json"`;
  };

  const getNextJsSnippet = () => {
    return `// app/operations/page.tsx (Next.js 15 Server Component)
export default async function OperationsPage() {
  const res = await fetch('https://cms.goldfields.com/api/content/operations', {
    headers: {
      Authorization: \`Bearer \${process.env.GOLDFIELDS_CMS_API_KEY}\`,
    },
    // Automatic Next.js cache revalidated by Move Studio webhook
    next: { tags: ['operations'] },
  });

  const { items: mines } = await res.json();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mines.map((mine) => (
        <div key={mine.id} className="p-6 rounded-2xl border border-slate-800 bg-[#0E1522]">
          <h2 className="text-xl font-bold text-white">{mine.name}</h2>
          <p className="text-sm text-amber-400 font-mono">{mine.country} • {mine.type}</p>
          <div className="mt-4 text-xs text-slate-300">
            Attributable Output: {mine.attributableProductionH1_2026}
          </div>
        </div>
      ))}
    </div>
  );
}`;
  };

  const getFetchSnippet = () => {
    return `// Standard JavaScript / TypeScript client
async function fetchGoldFieldsContent(collection) {
  const response = await fetch(\`https://cms.goldfields.com/api/content/\${collection}\`, {
    headers: {
      'Authorization': 'Bearer ${apiKey}',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(\`Failed to fetch \${collection}: \${response.statusText}\`);
  }

  return await response.json();
}`;
  };

  const getWebhookSnippet = () => {
    return `// app/api/webhooks/cms-update/route.ts (Bastion Webhook Receiver)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-bastion-signature') || '';
  const rawBody = await req.text();
  const secret = process.env.BASTION_WEBHOOK_SECRET;

  // 1. Verify HMAC-SHA256 signature
  const expectedSig = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  // 2. Parse payload and instantly revalidate affected routes (<500ms SLA)
  const { event, collection, slug } = JSON.parse(rawBody);

  if (collection === 'operations') {
    revalidateTag('operations');
    revalidatePath('/operations');
  } else if (collection === 'news') {
    revalidateTag('news');
    revalidatePath('/news');
  } else if (collection === 'reports') {
    revalidateTag('reports');
    revalidatePath('/investors/reports');
  }

  return NextResponse.json({ received: true, revalidated: collection });
} catch (e: any) {
  return NextResponse.json({ error: e.message }, { status: 500 });
}`;
  };

  const getGqlApolloSnippet = () => {
    return `// Apollo Client Integration (Next.js / React)
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: 'https://cms.goldfields.com/api/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: 'Bearer ${apiKey}',
  },
});

export const QUERY = gql\`
${gqlQuery.trim()}
\`;

export async function fetchBastionContent() {
  const { data } = await apolloClient.query({
    query: QUERY,
    variables: ${gqlVariables.trim() || '{}'}
  });
  return data;
}`;
  };

  const getGqlFetchSnippet = () => {
    return `// Native Fetch GraphQL Request
export async function fetchGraphQL() {
  const response = await fetch('https://cms.goldfields.com/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ${apiKey}',
    },
    body: JSON.stringify({
      query: \`${gqlQuery.trim()}\`,
      variables: ${gqlVariables.trim() || '{}'},
    }),
    next: { revalidate: 60 } // Next.js ISR cache
  });

  const { data, errors } = await response.json();
  if (errors) {
    console.error('GraphQL Errors:', errors);
    throw new Error(errors[0].message);
  }
  return data;
}`;
  };

  const getGqlUrqlSnippet = () => {
    return `// urql GraphQL Client
import { createClient, cacheExchange, fetchExchange } from 'urql';

export const client = createClient({
  url: 'https://cms.goldfields.com/api/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: { authorization: 'Bearer ${apiKey}' },
  }),
});`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#141C2A] via-[#0E1522] to-[#121A28] border border-[#232F42] shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase tracking-widest flex items-center space-x-1">
              <Terminal className="w-3 h-3 mr-1" />
              <span>Bastion Developer Sandbox</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Headless API v1.0</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center space-x-2">
            <span>Interactive API Explorer & Sandbox Suite</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live interactive console for Bastion’s technical lead to test Gold Fields content schemas, token authentication, and instant webhook revalidation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={sandboxMode === 'graphql' ? executeGraphQLQuery : executeRequest}
            disabled={sandboxMode === 'graphql' ? gqlLoading : isLoading}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2 transition cursor-pointer ${
              sandboxMode === 'graphql'
                ? 'bg-gradient-to-r from-purple-500 to-sky-500 hover:from-purple-400 hover:to-sky-400 text-white shadow-purple-500/20'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20'
            }`}
          >
            {(sandboxMode === 'graphql' ? gqlLoading : isLoading) ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className={`w-4 h-4 ${sandboxMode === 'graphql' ? 'fill-white' : 'fill-black'}`} />
            )}
            <span>{sandboxMode === 'graphql' ? 'Execute GraphQL' : 'Execute Request'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Switcher: REST vs GraphQL */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] shadow-xs">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setSandboxMode('rest')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              sandboxMode === 'rest'
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>REST Headless Content API</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              v1.0
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSandboxMode('graphql');
              if (!gqlResponse) executeGraphQLQuery();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition cursor-pointer ${
              sandboxMode === 'graphql'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4 text-purple-400" />
            <span>GraphQL Explorer &amp; Relations DSL</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-purple-500/20 to-sky-500/20 text-purple-300 border border-purple-500/40">
              Sanity &amp; Strapi 5 Parity
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono px-3">
          {sandboxMode === 'rest' ? 'GET /api/content/[collection]' : 'POST /api/graphql (Deep Population)'}
        </div>
      </div>

      {sandboxMode === 'rest' ? (
        /* Main Sandbox Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Picker & Params */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Select Content Endpoint</span>
              <span className="text-sky-400 font-mono text-[10px]">{ENDPOINTS.length} Available</span>
            </div>

            <div className="space-y-1.5">
              {ENDPOINTS.map((ep) => {
                const isSelected = selectedEndpoint.id === ep.id;
                return (
                  <button
                    key={ep.id}
                    type="button"
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col space-y-1 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40 text-white'
                        : 'bg-[#141C2A] border-[#232F42] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            ep.method === 'GET'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[170px]">
                          {ep.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono truncate">{ep.path.split('/').pop()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{ep.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Request Header & Parameters Panel */}
          <div className="p-4 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-3.5 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Request Controls & Authentication
            </div>

            {/* Auth Toggle */}
            <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-200">Include Bearer Token</span>
                <input
                  type="checkbox"
                  checked={includeAuth}
                  onChange={(e) => setIncludeAuth(e.target.checked)}
                  className="rounded border-[#232F42] text-amber-500 focus:ring-0 w-4 h-4 bg-[#0A0F18]"
                />
              </label>
              {includeAuth && (
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0F18] border border-[#1E293B] text-[11px] font-mono text-sky-400"
                  placeholder="Bearer token"
                />
              )}
            </div>

            {/* Preview Toggle */}
            <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Draft Preview Mode</div>
                <div className="text-[10px] text-slate-500">Append ?preview=true to payload</div>
              </div>
              <input
                type="checkbox"
                checked={enablePreview}
                onChange={(e) => setEnablePreview(e.target.checked)}
                className="rounded border-[#232F42] text-amber-500 focus:ring-0 w-4 h-4 bg-[#0A0F18]"
              />
            </div>

            {/* Additional Query Params */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Custom Query Parameters</label>
              <input
                type="text"
                value={customParams}
                onChange={(e) => setCustomParams(e.target.value)}
                placeholder="e.g. limit=3&search=tarkwa"
                className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Execution Console & Visual Preview */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active URL Bar */}
          <div className="p-3 rounded-2xl bg-[#0D121B] border border-[#1E293B] flex items-center space-x-2 text-xs font-mono">
            <span
              className={`px-2 py-1 rounded font-bold text-[10px] ${
                selectedEndpoint.method === 'GET'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {selectedEndpoint.method}
            </span>
            <div className="flex-1 text-slate-300 truncate font-semibold">
              https://cms.goldfields.com{selectedEndpoint.path}
              {enablePreview ? '?preview=true' : ''}
              {customParams ? `&${customParams}` : ''}
            </div>
            <div className="flex items-center space-x-2">
              {responseStatus && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    responseStatus === 200
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {responseStatus} OK
                </span>
              )}
              {latencyMs !== null && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                  {latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* View Mode Tabs (JSON Response vs Visual Component Simulator vs Code Snippets) */}
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-2 text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setActiveViewTab('json')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeViewTab === 'json'
                    ? 'bg-[#1E293B] text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>Live JSON Response</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeViewTab === 'preview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Bastion Frontend Simulator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('docs')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
                  activeViewTab === 'docs'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Integration Code Snippets</span>
              </button>
            </div>

            {activeViewTab === 'json' && responsePayload && (
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(responsePayload, null, 2), 'payload')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono"
              >
                {copiedCode === 'payload' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode === 'payload' ? 'Copied JSON' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {/* VIEW TAB 1: RAW FORMATTED JSON */}
          {activeViewTab === 'json' && (
            <div className="relative rounded-2xl bg-[#080C14] border border-[#1E293B] overflow-hidden p-4 min-h-[420px] max-h-[580px] overflow-y-auto font-mono text-[11px] leading-relaxed text-amber-300 scrollbar-thin scrollbar-thumb-slate-800">
              {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#080C14]/90">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-400">Executing live endpoint query...</span>
                </div>
              ) : (
                <pre>{JSON.stringify(responsePayload, null, 2)}</pre>
              )}
            </div>
          )}

          {/* VIEW TAB 2: BASTION FRONTEND COMPONENT SIMULATOR */}
          {activeViewTab === 'preview' && (
            <div className="p-6 rounded-2xl bg-[#080C14] border border-[#1E293B] space-y-6 min-h-[420px]">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Bastion Frontend Live Simulation</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Demonstrates how Bastion’s website renders this API data without modifying code.
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ✓ Hydrated from Move Studio API
                </span>
              </div>

              {/* Mock Frontend Render of Mining Operations */}
              {selectedEndpoint.id.startsWith('ops') ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(responsePayload?.items || [responsePayload]).slice(0, 2).map((mine: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-[#0E1522] border border-[#222E42] shadow-xl space-y-3 relative overflow-hidden group hover:border-amber-400/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                            {mine.region || mine.country || 'Global Mine'} • {mine.type || 'Asset'}
                          </span>
                          <h3 className="text-lg font-bold text-white mt-0.5">{mine.name || mine.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {mine.status || 'Active'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {mine.overview || 'World-class mechanized underground mining facility.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1A2333] text-[11px]">
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">Attributable Output</div>
                          <div className="font-bold text-white font-mono">{mine.attributableProductionH1_2026 || '151,000 oz'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">Renewable Power</div>
                          <div className="font-bold text-amber-300 truncate">Khanyisa 50MW Solar</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedEndpoint.id === 'reports_all' ? (
                <div className="space-y-3">
                  {(responsePayload?.items || []).slice(0, 3).map((rep: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#0E1522] border border-[#222E42] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{rep.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {rep.period} • {rep.category} • {rep.year}
                        </div>
                      </div>
                      <a
                        href={rep.pdfUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/20 text-xs font-bold transition flex items-center space-x-1"
                      >
                        <span>Download PDF</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#0E1522] border border-[#222E42] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">Live Data Connected</div>
                  <div className="text-xs text-slate-400 max-w-md mx-auto">
                    Bastion’s frontend components map directly to the structured JSON payload returned by this endpoint.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW TAB 3: INTEGRATION CODE SNIPPETS */}
          {activeViewTab === 'docs' && (
            <div className="p-6 rounded-2xl bg-[#080C14] border border-[#1E293B] space-y-4 min-h-[420px]">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-xs">
                <div className="flex space-x-2">
                  {[
                    { id: 'nextjs', label: 'Next.js 15 (Server Component)' },
                    { id: 'webhook', label: 'Bastion Webhook Listener (<500ms)' },
                    { id: 'curl', label: 'cURL Terminal' },
                    { id: 'fetch', label: 'Standard JS (fetch)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCodeTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        activeCodeTab === tab.id
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const snippet =
                      activeCodeTab === 'nextjs'
                        ? getNextJsSnippet()
                        : activeCodeTab === 'webhook'
                        ? getWebhookSnippet()
                        : activeCodeTab === 'curl'
                        ? getCurlSnippet()
                        : getFetchSnippet();
                    copyToClipboard(snippet, activeCodeTab);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono"
                >
                  {copiedCode === activeCodeTab ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === activeCodeTab ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#0A0F18] border border-[#1A2333] text-[11px] font-mono text-sky-300 leading-relaxed overflow-x-auto max-h-[460px]">
                {activeCodeTab === 'nextjs' && getNextJsSnippet()}
                {activeCodeTab === 'webhook' && getWebhookSnippet()}
                {activeCodeTab === 'curl' && getCurlSnippet()}
                {activeCodeTab === 'fetch' && getFetchSnippet()}
              </pre>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* GraphQL Explorer & Relations Playground (Sanity & Strapi 5 Parity) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
          {/* Left Column: Preset Selector & Interactive Query Editor (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Presets Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-purple-400" />
                  <span>GraphQL Presets (Deep Population)</span>
                </span>
                <span className="text-purple-400 font-mono text-[10px]">{GRAPHQL_PRESETS.length} Presets</span>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {GRAPHQL_PRESETS.map((preset) => {
                  const isSelected = selectedGqlPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedGqlPreset(preset);
                        setGqlQuery(preset.query);
                        if (preset.variables) setGqlVariables(preset.variables);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left border transition flex flex-col space-y-1 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40 text-white'
                          : 'bg-slate-50 dark:bg-[#141C2A] border-slate-200 dark:border-[#232F42] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Interactive Query Editor */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Query Editor (GraphQL SDL)</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(gqlQuery, 'gql_query');
                    }}
                    className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copy Query"
                  >
                    {copiedCode === 'gql_query' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={gqlQuery}
                  onChange={(e) => setGqlQuery(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-purple-500 resize-y"
                  placeholder="Enter GraphQL query..."
                />
              </div>

              {/* Variables */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-between">
                  <span>Variables (JSON)</span>
                  <span className="text-[9px] text-slate-500 font-mono">Optional</span>
                </div>
                <textarea
                  value={gqlVariables}
                  onChange={(e) => setGqlVariables(e.target.value)}
                  rows={2}
                  spellCheck={false}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500 resize-none"
                  placeholder="{}"
                />
              </div>

              {/* Run Query Button */}
              <button
                type="button"
                onClick={executeGraphQLQuery}
                disabled={gqlLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-sky-500 hover:from-purple-400 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
              >
                {gqlLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Execute GraphQL Query (Deep Population)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Execution Telemetry & Tabs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Telemetry Header */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center space-x-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold ${
                    gqlStatus === 200
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {gqlStatus ? `${gqlStatus} OK` : 'Ready'}
                </span>
                {gqlLatencyMs !== null && (
                  <span className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{gqlLatencyMs}ms</span>
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span>Deep Relations Populated</span>
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveGqlTab('response')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                    activeGqlTab === 'response'
                      ? 'bg-white dark:bg-[#1E293B] text-purple-400 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Response JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGqlTab('schema')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                    activeGqlTab === 'schema'
                      ? 'bg-white dark:bg-[#1E293B] text-sky-400 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Schema Types</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGqlTab('snippets')}
                  className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                    activeGqlTab === 'snippets'
                      ? 'bg-white dark:bg-[#1E293B] text-emerald-400 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Client Code</span>
                </button>
              </div>
            </div>

            {/* TAB 1: RESPONSE JSON */}
            {activeGqlTab === 'response' && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 min-h-[460px] shadow-inner relative">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-900 font-mono">
                  <span>POST /api/graphql &bull; Response Payload</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(gqlResponse, null, 2), 'gql_resp')}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    {copiedCode === 'gql_resp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'gql_resp' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>

                <pre className="p-2 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto max-h-[520px]">
                  {gqlResponse ? JSON.stringify(gqlResponse, null, 2) : '// Click "Execute GraphQL Query" to run'}
                </pre>
              </div>
            )}

            {/* TAB 2: SCHEMA TYPES DOCUMENTATION */}
            {activeGqlTab === 'schema' && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-4 max-h-[580px] overflow-y-auto">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Registered GraphQL Schema &amp; Deep Relations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Strongly typed entities with automated resolution of dynamic zones, DAM focal points, and bundled releases.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  {/* Page Type */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-400">type Page</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">Core Content Model</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>id: <span className="text-sky-400">ID!</span>, slug: <span className="text-sky-400">String!</span>, title: <span className="text-sky-400">String!</span></div>
                      <div>layoutCollection: <span className="text-sky-400">String!</span>, status: <span className="text-sky-400">String!</span>, locale: <span className="text-sky-400">String</span></div>
                      <div className="text-purple-300 font-bold">dynamicZones: [DynamicZoneBlock!]! <span className="text-[10px] text-slate-500 font-normal">&larr; Deep Relation</span></div>
                      <div className="text-sky-300 font-bold">featuredMedia: MediaAsset <span className="text-[10px] text-slate-500 font-normal">&larr; Deep Relation</span></div>
                      <div className="text-emerald-300 font-bold">bundledRelease: ContentRelease <span className="text-[10px] text-slate-500 font-normal">&larr; Deep Relation</span></div>
                    </div>
                  </div>

                  {/* DynamicZoneBlock */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-400">type DynamicZoneBlock</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">Polymorphic Block</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>id: <span className="text-sky-400">ID!</span>, blockType: <span className="text-sky-400">String!</span> (hero, metrics_grid, split_feature, etc.)</div>
                      <div>order: <span className="text-sky-400">Int!</span>, isEnabled: <span className="text-sky-400">Boolean!</span>, data: <span className="text-sky-400">JSON</span></div>
                      <div className="text-sky-300 font-bold">featuredMedia: MediaAsset <span className="text-[10px] text-slate-500 font-normal">&larr; Deep Relation (Focal Point)</span></div>
                    </div>
                  </div>

                  {/* MediaAsset */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">type MediaAsset</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Enterprise DAM</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>id: <span className="text-sky-400">ID!</span>, filename: <span className="text-sky-400">String!</span>, url: <span className="text-sky-400">String!</span></div>
                      <div>mimeType: <span className="text-sky-400">String!</span>, sizeBytes: <span className="text-sky-400">Int</span>, folderId: <span className="text-sky-400">String</span></div>
                      <div className="text-emerald-300 font-bold">focalPoint: FocalPoint &#123; x: Float!, y: Float! &#125;</div>
                    </div>
                  </div>

                  {/* ContentRelease */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#141C2A] border border-slate-200 dark:border-[#232F42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">type ContentRelease</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">Release Governance</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>id: <span className="text-sky-400">ID!</span>, name: <span className="text-sky-400">String!</span>, status: <span className="text-sky-400">String!</span></div>
                      <div>itemCount: <span className="text-sky-400">Int!</span>, scheduledAt: <span className="text-sky-400">String</span>, publishedAt: <span className="text-sky-400">String</span></div>
                      <div className="text-amber-300 font-bold">items: [ReleaseItem!]! <span className="text-[10px] text-slate-500 font-normal">&larr; Deep Relation</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CLIENT INTEGRATION CODE */}
            {activeGqlTab === 'snippets' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-[#1E293B] space-y-4 min-h-[460px]">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E293B] pb-3 text-xs">
                  <div className="flex space-x-2">
                    {[
                      { id: 'apollo', label: 'Apollo Client (Next.js)' },
                      { id: 'fetch', label: 'Native Fetch' },
                      { id: 'urql', label: 'urql GraphQL' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveGqlClient(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                          activeGqlClient === tab.id
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const snippet =
                        activeGqlClient === 'apollo'
                          ? getGqlApolloSnippet()
                          : activeGqlClient === 'fetch'
                          ? getGqlFetchSnippet()
                          : getGqlUrqlSnippet();
                      copyToClipboard(snippet, 'gql_snippet');
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 font-mono cursor-pointer"
                  >
                    {copiedCode === 'gql_snippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode === 'gql_snippet' ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 leading-relaxed overflow-x-auto max-h-[460px]">
                  {activeGqlClient === 'apollo' && getGqlApolloSnippet()}
                  {activeGqlClient === 'fetch' && getGqlFetchSnippet()}
                  {activeGqlClient === 'urql' && getGqlUrqlSnippet()}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
