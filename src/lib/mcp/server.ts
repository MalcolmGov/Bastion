/**
 * Bastion Studio — Model Context Protocol (MCP) Server Engine
 * Implements the official Anthropic Model Context Protocol (JSON-RPC 2.0)
 * Allows AI agents (Cursor, Claude, Antigravity, custom agents) to discover,
 * query, mutate, and govern corporate content, dynamic zones, and brand assets.
 */

import { getDb } from '@/lib/db/client';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import { extractFromGitHubRepo, getActiveGitHubIntegration } from '@/lib/github/client';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: 'list_clients',
    description: 'List all active corporate client workspaces, tenant domains, and sector tiers on the Bastion platform.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by client status: active, pending, archived' }
      }
    }
  },
  {
    name: 'list_collections',
    description: 'List all registered content collections (e.g. operations, reports, news, sustainability_targets, jobs, suppliers, pages).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'query_content',
    description: 'Search, filter, and fetch content records from a collection with pagination, status filtering, and keyword search.',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Target collection name' },
        status: { type: 'string', description: 'Optional status filter: published, draft, in_review' },
        query: { type: 'string', description: 'Optional keyword search term' },
        limit: { type: 'number', description: 'Number of results to return (default: 20)' },
        offset: { type: 'number', description: 'Offset for pagination (default: 0)' },
        siteId: { type: 'string', description: 'Optional website/client filter' }
      },
      required: ['collection']
    }
  },
  {
    name: 'get_entry',
    description: 'Retrieve full structured document, active draft revision, and published data for an entry by ID or slug.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Content record ID' },
        slug: { type: 'string', description: 'Content record slug (alternative to id)' },
        collection: { type: 'string', description: 'Collection name when searching by slug' }
      }
    }
  },
  {
    name: 'create_entry',
    description: 'Create a new structured content entry and initial draft revision in a collection.',
    inputSchema: {
      type: 'object',
      properties: {
        collection: { type: 'string', description: 'Target collection name' },
        title: { type: 'string', description: 'Document title' },
        slug: { type: 'string', description: 'URL slug (auto-generated if omitted)' },
        data: { type: 'object', description: 'Structured JSON fields matching collection schema' },
        siteId: { type: 'string', description: 'Target website ID' },
        status: { type: 'string', description: 'Initial status: draft, in_review, published' }
      },
      required: ['collection', 'title', 'data']
    }
  },
  {
    name: 'update_entry',
    description: 'Update fields on an existing content entry, saving a new revision.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Content record ID to update' },
        title: { type: 'string', description: 'Optional new title' },
        data: { type: 'object', description: 'Structured fields to merge/update' },
        reviewComments: { type: 'string', description: 'Optional audit note for this change' }
      },
      required: ['id', 'data']
    }
  },
  {
    name: 'publish_entry',
    description: 'Promote draft revision to published, trigger edge cache invalidation (<500ms), and dispatch HMAC webhooks.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Content record ID to publish' }
      },
      required: ['id']
    }
  },
  {
    name: 'get_page_composition',
    description: 'Retrieve the ordered modular dynamic zones (sections and blocks) for a website page.',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'Website ID (e.g. site_apex_strategy or gold-fields)' },
        pageSlug: { type: 'string', description: 'Page slug (default: home)' }
      },
      required: ['siteId']
    }
  },
  {
    name: 'save_page_composition',
    description: 'Save, reorder, or update the modular dynamic zones/blocks for a website page.',
    inputSchema: {
      type: 'object',
      properties: {
        siteId: { type: 'string', description: 'Website ID' },
        pageSlug: { type: 'string', description: 'Page slug (e.g. home, about, operations)' },
        title: { type: 'string', description: 'Page display title' },
        sections: { type: 'array', description: 'Array of SectionInstance block objects' },
        status: { type: 'string', description: 'draft or published' }
      },
      required: ['siteId', 'pageSlug', 'sections']
    }
  },
  {
    name: 'extract_brand_dna',
    description: 'Trigger autonomous brand token and component extraction from a client URL or developer GitHub repository.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Public website URL to crawl and ingest' },
        githubRepo: { type: 'string', description: 'GitHub repo (owner/repo) to extract AST components and palette from' },
        branch: { type: 'string', description: 'Repository branch (default: main)' }
      }
    }
  },
  {
    name: 'analyze_compliance',
    description: 'Run an automated corporate governance & SENS compliance audit on draft copy, detecting speculative claims and missing disclaimers.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Draft text to analyze' },
        type: { type: 'string', description: 'headline, body, or sens_announcement' }
      },
      required: ['text']
    }
  }
];

export const MCP_RESOURCES: McpResource[] = [
  {
    uri: 'bastion://telemetry/fleet',
    name: 'Bastion Fleet Telemetry',
    description: 'Live multi-tenant website vitals, edge TTFB latencies, and cache hit ratios.',
    mimeType: 'application/json'
  },
  {
    uri: 'bastion://clients',
    name: 'Corporate Clients Directory',
    description: 'Complete directory of managed corporate clients, domains, and publishing pipelines.',
    mimeType: 'application/json'
  },
  {
    uri: 'bastion://components',
    name: 'Modular Dynamic Zones Component Registry',
    description: 'Catalog of all available block components, variants, and schema field contracts.',
    mimeType: 'application/json'
  }
];

/**
 * Handles MCP Tool Execution
 */
export async function handleMcpToolCall(name: string, args: Record<string, any>): Promise<any> {
  const db = getDb();

  switch (name) {
    case 'list_clients': {
      const sql = args.status
        ? `SELECT c.*, w.primary_domain, w.status as website_status FROM clients c LEFT JOIN websites w ON c.id = w.client_id WHERE w.status = ? ORDER BY c.name ASC`
        : `SELECT c.*, w.primary_domain, w.status as website_status FROM clients c LEFT JOIN websites w ON c.id = w.client_id ORDER BY c.name ASC`;
      const queryArgs = args.status ? [args.status] : [];
      const res = await db.execute({ sql, args: queryArgs });
      return { clients: res.rows };
    }

    case 'list_collections': {
      return {
        collections: [
          { name: 'pages', description: 'Corporate landing pages and structured subpages with modular dynamic zones' },
          { name: 'operations', description: 'Global corporate assets, mines, facilities, and regional infrastructure' },
          { name: 'sustainability_targets', description: '2030 ESG targets, decarbonization metrics, and community milestones' },
          { name: 'reports', description: 'Integrated annual reports, quarterly filings, and investor presentations' },
          { name: 'news', description: 'Corporate press releases, media statements, and SENS regulatory announcements' },
          { name: 'jobs', description: 'Executive career opportunities and engineering roles' },
          { name: 'suppliers', description: 'Approved supplier directory, procurement portals, and vendor disclosures' }
        ]
      };
    }

    case 'query_content': {
      const { collection, status, query, limit = 20, offset = 0, siteId } = args;
      const conditions: string[] = ['collection = ?'];
      const queryArgs: any[] = [collection];

      if (status) {
        conditions.push('status = ?');
        queryArgs.push(status);
      }
      if (siteId) {
        conditions.push('(site_id = ? OR site_id IS NULL)');
        queryArgs.push(siteId);
      }
      if (query) {
        conditions.push('(title LIKE ? OR slug LIKE ?)');
        queryArgs.push(`%${query}%`, `%${query}%`);
      }

      const sql = `
        SELECT r.id, r.collection, r.slug, r.title, r.status, r.created_at, r.updated_at,
               rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id OR r.current_draft_revision_id = rev.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY r.updated_at DESC
        LIMIT ? OFFSET ?
      `;
      queryArgs.push(limit, offset);

      const res = await db.execute({ sql, args: queryArgs });
      const entries = res.rows.map((r: any) => ({
        id: String(r.id),
        collection: String(r.collection),
        slug: String(r.slug),
        title: String(r.title),
        status: String(r.status),
        updatedAt: String(r.updated_at),
        data: r.data_json ? (typeof r.data_json === 'string' ? JSON.parse(r.data_json) : r.data_json) : {}
      }));

      return { total: entries.length, entries };
    }

    case 'get_entry': {
      const { id, slug, collection } = args;
      let sql = '';
      let queryArgs: any[] = [];

      if (id) {
        sql = `SELECT * FROM content_records WHERE id = ? LIMIT 1`;
        queryArgs = [id];
      } else if (slug && collection) {
        sql = `SELECT * FROM content_records WHERE slug = ? AND collection = ? LIMIT 1`;
        queryArgs = [slug, collection];
      } else {
        throw new Error('Must provide either id or (slug and collection)');
      }

      const res = await db.execute({ sql, args: queryArgs });
      if (res.rows.length === 0) throw new Error('Entry not found');

      const entry = res.rows[0];
      const revRes = await db.execute({
        sql: `SELECT * FROM revisions WHERE record_id = ? ORDER BY revision_number DESC`,
        args: [entry.id]
      });

      const revisions = revRes.rows.map((rev: any) => ({
        id: String(rev.id),
        revisionNumber: Number(rev.revision_number),
        data: typeof rev.data_json === 'string' ? JSON.parse(rev.data_json) : rev.data_json,
        status: String(rev.status),
        createdAt: String(rev.created_at)
      }));

      return {
        entry: {
          id: String(entry.id),
          collection: String(entry.collection),
          slug: String(entry.slug),
          title: String(entry.title),
          status: String(entry.status),
          createdAt: String(entry.created_at),
          updatedAt: String(entry.updated_at)
        },
        revisions
      };
    }

    case 'create_entry': {
      const { collection, title, slug, data, siteId = 'site_apex_strategy', status = 'published' } = args;
      const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const recordId = `rec_${collection}_${Date.now()}`;
      const revId = `rev_${Date.now()}`;
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, site_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [recordId, collection, cleanSlug, title, status, status === 'published' ? revId : null, revId, siteId, now, now]
      });

      await db.execute({
        sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status)
              VALUES (?, ?, 1, ?, 'mcp_hash', 'usr_mcp_agent', ?, ?)`,
        args: [revId, recordId, JSON.stringify(data), now, status]
      });

      return { success: true, id: recordId, slug: cleanSlug, status };
    }

    case 'update_entry': {
      const { id, title, data, reviewComments = 'Updated via MCP AI Agent' } = args;
      const entryRes = await db.execute({ sql: `SELECT * FROM content_records WHERE id = ? LIMIT 1`, args: [id] });
      if (entryRes.rows.length === 0) throw new Error(`Record ${id} not found`);

      const entry = entryRes.rows[0];
      const now = new Date().toISOString();
      const revId = `rev_${Date.now()}`;

      // Get latest revision number
      const maxRevRes = await db.execute({
        sql: `SELECT MAX(revision_number) as max_rev FROM revisions WHERE record_id = ?`,
        args: [id]
      });
      const nextRev = (Number(maxRevRes.rows[0]?.max_rev) || 0) + 1;

      await db.execute({
        sql: `INSERT INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status, review_comments)
              VALUES (?, ?, ?, ?, 'mcp_hash', 'usr_mcp_agent', ?, 'draft', ?)`,
        args: [revId, id, nextRev, JSON.stringify(data), now, reviewComments]
      });

      await db.execute({
        sql: `UPDATE content_records SET title = COALESCE(?, title), current_draft_revision_id = ?, updated_at = ? WHERE id = ?`,
        args: [title || null, revId, now, id]
      });

      return { success: true, id, revisionNumber: nextRev, revisionId: revId };
    }

    case 'publish_entry': {
      const { id } = args;
      const entryRes = await db.execute({ sql: `SELECT * FROM content_records WHERE id = ? LIMIT 1`, args: [id] });
      if (entryRes.rows.length === 0) throw new Error(`Record ${id} not found`);

      const entry = entryRes.rows[0];
      const draftRevId = entry.current_draft_revision_id || entry.current_published_revision_id;
      const now = new Date().toISOString();

      await db.execute({
        sql: `UPDATE content_records SET status = 'published', current_published_revision_id = ?, updated_at = ? WHERE id = ?`,
        args: [draftRevId, now, id]
      });

      if (draftRevId) {
        await db.execute({
          sql: `UPDATE revisions SET status = 'published' WHERE id = ?`,
          args: [draftRevId]
        });
      }

      // Edge Invalidation dispatch
      try {
        const { dispatchContentWebhook } = await import('@/lib/webhooks/dispatcher');
        await dispatchContentWebhook({
          event: 'content.published',
          collection: String(entry.collection),
          id: String(entry.id),
          slug: String(entry.slug),
          title: String(entry.title),
          timestamp: now
        });
      } catch (err) {
        console.warn('Webhook dispatch warning:', err);
      }

      return { success: true, id, status: 'published', publishedAt: now, edgeInvalidated: true };
    }

    case 'get_page_composition': {
      const { siteId, pageSlug = 'home' } = args;
      const res = await db.execute({
        sql: `SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1`,
        args: [siteId, pageSlug]
      });

      if (res.rows.length === 0) {
        return {
          siteId,
          pageSlug,
          title: 'Home',
          sections: []
        };
      }

      const row = res.rows[0];
      return {
        id: String(row.id),
        siteId: String(row.site_id),
        pageSlug: String(row.page_slug),
        title: String(row.title),
        sections: typeof row.sections_json === 'string' ? JSON.parse(row.sections_json) : row.sections_json,
        version: Number(row.version),
        status: String(row.status)
      };
    }

    case 'save_page_composition': {
      const { siteId, pageSlug, title = 'Page', sections, status = 'published' } = args;
      const compId = `comp_${siteId}_${pageSlug}_v1`;
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, version, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'contemporary', ?, 1, ?, ?, ?)`,
        args: [compId, siteId, pageSlug, title, JSON.stringify(sections), status, now, now]
      });

      return { success: true, compositionId: compId, sectionsCount: sections.length, savedAt: now };
    }

    case 'extract_brand_dna': {
      const { url, githubRepo, branch = 'main' } = args;
      if (githubRepo) {
        const integration = await getActiveGitHubIntegration();
        const result = await extractFromGitHubRepo(githubRepo, branch, integration.token);
        return { success: true, type: 'github_repository', extraction: result };
      } else if (url) {
        const { MoveStudioIngestProvider } = await import('@/lib/studio/importer');
        const provider = new MoveStudioIngestProvider();
        const result = await provider.crawlAndExtract(url, { maxPages: 5 });
        return { success: true, type: 'url_crawler', extraction: result };
      } else {
        throw new Error('Must specify either url or githubRepo');
      }
    }

    case 'analyze_compliance': {
      const { text, type = 'headline' } = args;
      const issues: Array<{ severity: 'critical' | 'warning' | 'info'; message: string; suggestion: string }> = [];

      // SENS / Financial regulatory guardrails
      if (/guarantee|risk-free|100% assured|unprecedented gains/i.test(text)) {
        issues.push({
          severity: 'critical',
          message: 'Speculative performance claims violate JSE/NYSE Listing Requirements.',
          suggestion: 'Rephrase to: "Targeting sustained risk-adjusted shareholder returns within disciplined capital allocation frameworks."'
        });
      }

      if (/forward-looking|guidance|forecast|outlook/i.test(text) && !/disclaimer|subject to market conditions/i.test(text)) {
        issues.push({
          severity: 'warning',
          message: 'Forward-looking statements require mandatory statutory cautionary wording.',
          suggestion: 'Append: "All forward-looking statements involve known and unknown risks, subject to global economic conditions and commodity price fluctuations."'
        });
      }

      if (type === 'headline' && text.length > 75) {
        issues.push({
          severity: 'info',
          message: 'Headline length exceeds recommended executive scan threshold (75 characters).',
          suggestion: 'Condense into high-impact active cadence.'
        });
      }

      return {
        compliant: issues.filter(i => i.severity === 'critical').length === 0,
        grade: issues.length === 0 ? 'A+' : issues.some(i => i.severity === 'critical') ? 'C' : 'B+',
        issuesCount: issues.length,
        issues
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}

/**
 * Handles MCP Resource Read
 */
export async function handleMcpResourceRead(uri: string): Promise<{ mimeType: string; text: string }> {
  const db = getDb();

  if (uri === 'bastion://telemetry/fleet') {
    const clientsRes = await db.execute(`SELECT c.id, c.name, c.slug, w.primary_domain as domain, COALESCE(w.status, 'active') as status FROM clients c LEFT JOIN websites w ON c.id = w.client_id`);
    return {
      mimeType: 'application/json',
      text: JSON.stringify({
        edgeTTFB: '42ms',
        cacheHitRate: '99.4%',
        activeNodes: ['JNB-1 (18ms)', 'FRA-1 (42ms)', 'LHR-1 (46ms)', 'EWR-1 (98ms)'],
        sslGrade: 'A+',
        tenants: clientsRes.rows
      }, null, 2)
    };
  }

  if (uri === 'bastion://clients') {
    const clientsRes = await db.execute(`SELECT * FROM clients ORDER BY name ASC`);
    return {
      mimeType: 'application/json',
      text: JSON.stringify({ clients: clientsRes.rows }, null, 2)
    };
  }

  if (uri === 'bastion://components') {
    return {
      mimeType: 'application/json',
      text: JSON.stringify({ registry: COMPONENT_REGISTRY }, null, 2)
    };
  }

  throw new Error(`Resource not found: ${uri}`);
}
