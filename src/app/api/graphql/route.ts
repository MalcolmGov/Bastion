import { NextRequest, NextResponse } from 'next/server';
import { readSecret, secretsMatch, tokenFromRequest } from '@/lib/auth/apiToken';
import { buildSchema, graphql } from 'graphql';
import { getDb, ensureDbReady } from '@/lib/db/client';
import { BLUEPRINTS } from '@/lib/studio/blueprints';

// GraphQL Schema Definition (SDL)
const typeDefs = `
  scalar JSON

  type FocalPoint {
    x: Float!
    y: Float!
  }

  type MediaAsset {
    id: ID!
    filename: String!
    url: String!
    mimeType: String!
    sizeBytes: Int
    folderId: String
    focalPoint: FocalPoint
    tags: [String!]
  }

  type DynamicZoneBlock {
    id: ID!
    blockType: String!
    order: Int!
    isEnabled: Boolean!
    data: JSON
    featuredMedia: MediaAsset
  }

  type ReleaseItem {
    id: ID!
    releaseId: String!
    itemType: String!
    itemId: String!
    title: String!
    action: String!
    changesSummary: String
  }

  type ContentRelease {
    id: ID!
    name: String!
    description: String
    status: String!
    scheduledAt: String
    publishedAt: String
    itemCount: Int!
    items: [ReleaseItem!]!
  }

  type Page {
    id: ID!
    siteId: String!
    slug: String!
    title: String!
    layoutCollection: String!
    version: Int!
    status: String!
    locale: String
    updatedAt: String!
    meta: JSON
    # Deeply populated relations
    dynamicZones: [DynamicZoneBlock!]!
    featuredMedia: MediaAsset
    bundledRelease: ContentRelease
  }

  type Operation {
    id: ID!
    slug: String!
    title: String!
    country: String
    status: String!
    metrics: JSON
    infrastructure: JSON
    updatedAt: String
    featuredMedia: MediaAsset
  }

  type Report {
    id: ID!
    slug: String!
    title: String!
    year: String
    category: String
    fileUrl: String
    fileSize: String
    status: String!
    updatedAt: String
  }

  type NewsArticle {
    id: ID!
    slug: String!
    title: String!
    category: String
    summary: String
    publishedAt: String
    status: String!
    featuredMedia: MediaAsset
  }

  type Query {
    # Pages & Deep Relations
    pages(locale: String, status: String, siteId: String, limit: Int): [Page!]!
    page(slug: String!, locale: String, siteId: String): Page

    # Operations & Telemetry
    operations(country: String, limit: Int): [Operation!]!
    operation(slug: String!): Operation

    # Investor Financial Reports
    reports(year: String, category: String, limit: Int): [Report!]!

    # Market & Regulatory News
    news(category: String, limit: Int): [NewsArticle!]!
    newsArticle(slug: String!): NewsArticle

    # Content Releases
    releases(status: String): [ContentRelease!]!
    release(id: ID!): ContentRelease

    # Digital Asset Management (DAM)
    mediaAssets(folderId: String, limit: Int): [MediaAsset!]!
    mediaAsset(id: ID!): MediaAsset

    # Studio Blueprint Catalog
    blueprintCatalog: JSON
  }
`;

const schema = buildSchema(typeDefs);

// Helper to resolve Media Asset
async function resolveMediaAsset(db: any, assetIdOrUrl: string | null | undefined): Promise<any | null> {
  if (!assetIdOrUrl) return null;

  try {
    const res = await db.execute({
      sql: `SELECT * FROM media_assets WHERE id = ? OR url = ? OR filename = ? LIMIT 1`,
      args: [assetIdOrUrl, assetIdOrUrl, assetIdOrUrl]
    });

    if (res.rows.length > 0) {
      const row = res.rows[0];
      let focalPoint = { x: 50.0, y: 50.0 };
      if (row.hotspot_data_json) {
        try {
          const parsed = JSON.parse(String(row.hotspot_data_json));
          if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            focalPoint = { x: parsed.x, y: parsed.y };
          }
        } catch {
          // ignore
        }
      }

      return {
        id: String(row.id),
        filename: String(row.filename || ''),
        url: String(row.url || ''),
        mimeType: String(row.mime_type || 'image/png'),
        sizeBytes: Number(row.size_bytes || 0),
        folderId: String(row.folder_id || 'corporate'),
        focalPoint,
        tags: ['corporate', 'goldfields', 'phase2']
      };
    }
  } catch (e) {
    console.error('Error resolving media asset:', e);
  }

  // Fallback synthesised asset if URL given
  if (typeof assetIdOrUrl === 'string' && (assetIdOrUrl.startsWith('/') || assetIdOrUrl.startsWith('http'))) {
    return {
      id: `asset_${encodeURIComponent(assetIdOrUrl).replace(/[^a-zA-Z0-9]/g, '_')}`,
      filename: assetIdOrUrl.split('/').pop() || 'asset.png',
      url: assetIdOrUrl,
      mimeType: assetIdOrUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg',
      sizeBytes: 245000,
      folderId: 'corporate',
      focalPoint: { x: 50.0, y: 50.0 },
      tags: ['fallback']
    };
  }

  return null;
}

// Resolver Root
function createRootResolvers(db: any) {
  return {
    // 1. Pages Query with deep relations population
    pages: async ({ locale, status, siteId, limit = 50 }: any) => {
      let sql = `SELECT * FROM page_compositions WHERE 1=1`;
      const args: any[] = [];

      if (siteId) {
        sql += ` AND site_id = ?`;
        args.push(siteId);
      }
      if (status) {
        sql += ` AND status = ?`;
        args.push(status);
      }

      sql += ` ORDER BY page_slug ASC LIMIT ?`;
      args.push(limit);

      const res = await db.execute({ sql, args });

      return res.rows.map((row: any) => formatPageRow(db, row));
    },

    page: async ({ slug, siteId }: any) => {
      let sql = `SELECT * FROM page_compositions WHERE page_slug = ?`;
      const args: any[] = [slug];

      if (siteId) {
        sql += ` AND site_id = ?`;
        args.push(siteId);
      }

      sql += ` LIMIT 1`;
      const res = await db.execute({ sql, args });
      if (res.rows.length === 0) return null;

      return formatPageRow(db, res.rows[0]);
    },

    // 2. Operations Query
    operations: async ({ country, limit = 20 }: any) => {
      let sql = `
        SELECT r.id, r.slug, r.title, r.status, r.updated_at, rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id
        WHERE r.collection = 'operations'
      `;
      const args: any[] = [];

      if (country) {
        sql += ` AND rev.data_json LIKE ?`;
        args.push(`%"country":"${country}"%`);
      }

      sql += ` LIMIT ?`;
      args.push(limit);

      const res = await db.execute({ sql, args });
      return res.rows.map((row: any) => {
        let data: any = {};
        try {
          data = row.data_json ? JSON.parse(String(row.data_json)) : {};
        } catch {
          // ignore
        }

        return {
          id: String(row.id),
          slug: String(row.slug),
          title: String(row.title),
          country: data.country || 'Global',
          status: String(row.status || 'published'),
          metrics: data.metrics || null,
          infrastructure: data.infrastructure || null,
          updatedAt: String(row.updated_at || new Date().toISOString()),
          featuredMedia: async () => resolveMediaAsset(db, data.imageUrl || data.image || `/assets/${row.slug}.png`)
        };
      });
    },

    operation: async ({ slug }: any) => {
      const sql = `
        SELECT r.id, r.slug, r.title, r.status, r.updated_at, rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id
        WHERE r.collection = 'operations' AND r.slug = ?
        LIMIT 1
      `;
      const res = await db.execute({ sql, args: [slug] });
      if (res.rows.length === 0) return null;

      const row = res.rows[0];
      let data: any = {};
      try {
        data = row.data_json ? JSON.parse(String(row.data_json)) : {};
      } catch {
        // ignore
      }

      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        country: data.country || 'Global',
        status: String(row.status || 'published'),
        metrics: data.metrics || null,
        infrastructure: data.infrastructure || null,
        updatedAt: String(row.updated_at || new Date().toISOString()),
        featuredMedia: async () => resolveMediaAsset(db, data.imageUrl || data.image || `/assets/${row.slug}.png`)
      };
    },

    // 3. Reports Query
    reports: async ({ year, category, limit = 50 }: any) => {
      let sql = `
        SELECT r.id, r.slug, r.title, r.status, r.updated_at, rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id
        WHERE r.collection = 'reports'
      `;
      const args: any[] = [];

      if (year) {
        sql += ` AND rev.data_json LIKE ?`;
        args.push(`%"year":"${year}"%`);
      }
      if (category) {
        sql += ` AND rev.data_json LIKE ?`;
        args.push(`%"category":"${category}"%`);
      }

      sql += ` LIMIT ?`;
      args.push(limit);

      const res = await db.execute({ sql, args });
      return res.rows.map((row: any) => {
        let data: any = {};
        try {
          data = row.data_json ? JSON.parse(String(row.data_json)) : {};
        } catch {
          // ignore
        }
        return {
          id: String(row.id),
          slug: String(row.slug),
          title: String(row.title),
          year: data.year || '2026',
          category: data.category || 'Integrated Annual Report',
          fileUrl: data.fileUrl || `/reports/${row.slug}.pdf`,
          fileSize: data.fileSize || '14.2 MB',
          status: String(row.status || 'published'),
          updatedAt: String(row.updated_at || new Date().toISOString())
        };
      });
    },

    // 4. News Query
    news: async ({ category, limit = 20 }: any) => {
      let sql = `
        SELECT r.id, r.slug, r.title, r.status, r.updated_at, rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id
        WHERE r.collection = 'news'
      `;
      const args: any[] = [];
      if (category) {
        sql += ` AND rev.data_json LIKE ?`;
        args.push(`%"category":"${category}"%`);
      }

      sql += ` LIMIT ?`;
      args.push(limit);

      const res = await db.execute({ sql, args });
      return res.rows.map((row: any) => {
        let data: any = {};
        try {
          data = row.data_json ? JSON.parse(String(row.data_json)) : {};
        } catch {
          // ignore
        }
        return {
          id: String(row.id),
          slug: String(row.slug),
          title: String(row.title),
          category: data.category || 'SENS Regulatory',
          summary: data.summary || data.teaser || '',
          publishedAt: data.publishedAt || String(row.updated_at),
          status: String(row.status || 'published'),
          featuredMedia: async () => resolveMediaAsset(db, data.featuredImage || data.imageUrl)
        };
      });
    },

    newsArticle: async ({ slug }: any) => {
      const sql = `
        SELECT r.id, r.slug, r.title, r.status, r.updated_at, rev.data_json
        FROM content_records r
        LEFT JOIN revisions rev ON r.current_published_revision_id = rev.id
        WHERE r.collection = 'news' AND r.slug = ?
        LIMIT 1
      `;
      const res = await db.execute({ sql, args: [slug] });
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      let data: any = {};
      try {
        data = row.data_json ? JSON.parse(String(row.data_json)) : {};
      } catch {
        // ignore
      }
      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        category: data.category || 'SENS Regulatory',
        summary: data.summary || data.teaser || '',
        publishedAt: data.publishedAt || String(row.updated_at),
        status: String(row.status || 'published'),
        featuredMedia: async () => resolveMediaAsset(db, data.featuredImage || data.imageUrl)
      };
    },

    // 5. Content Releases
    releases: async ({ status }: any) => {
      let sql = `SELECT * FROM content_releases WHERE 1=1`;
      const args: any[] = [];
      if (status) {
        sql += ` AND status = ?`;
        args.push(status);
      }
      sql += ` ORDER BY created_at DESC`;

      const res = await db.execute({ sql, args });
      return res.rows.map((row: any) => formatReleaseRow(db, row));
    },

    release: async ({ id }: any) => {
      const res = await db.execute({
        sql: `SELECT * FROM content_releases WHERE id = ? LIMIT 1`,
        args: [id]
      });
      if (res.rows.length === 0) return null;
      return formatReleaseRow(db, res.rows[0]);
    },

    // 6. Media Assets (DAM)
    mediaAssets: async ({ folderId, limit = 50 }: any) => {
      let sql = `SELECT * FROM media_assets WHERE 1=1`;
      const args: any[] = [];
      if (folderId) {
        sql += ` AND folder_id = ?`;
        args.push(folderId);
      }
      sql += ` LIMIT ?`;
      args.push(limit);

      const res = await db.execute({ sql, args });
      return res.rows.map((row: any) => {
        let focalPoint = { x: 50.0, y: 50.0 };
        if (row.hotspot_data_json) {
          try {
            const parsed = JSON.parse(String(row.hotspot_data_json));
            if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
              focalPoint = { x: parsed.x, y: parsed.y };
            }
          } catch {
            // ignore
          }
        }
        return {
          id: String(row.id),
          filename: String(row.filename),
          url: String(row.url),
          mimeType: String(row.mime_type),
          sizeBytes: Number(row.size_bytes),
          folderId: String(row.folder_id || 'corporate'),
          focalPoint,
          tags: ['corporate', 'dam']
        };
      });
    },

    mediaAsset: async ({ id }: any) => {
      return resolveMediaAsset(db, id);
    },

    // 7. Blueprint Catalog
    blueprintCatalog: () => BLUEPRINTS
  };
}

// Format page composition row with deep relations resolvers
function formatPageRow(db: any, row: any) {
  let parsedSections: any[] = [];
  try {
    if (typeof row.sections_json === 'string') {
      parsedSections = JSON.parse(row.sections_json);
    } else if (Array.isArray(row.sections_json)) {
      parsedSections = row.sections_json;
    }
  } catch (e) {
    parsedSections = [];
  }

  let meta: any = null;
  try {
    if (typeof row.meta_json === 'string') {
      meta = JSON.parse(row.meta_json);
    } else if (row.meta_json) {
      meta = row.meta_json;
    }
  } catch {
    meta = null;
  }

  return {
    id: String(row.id),
    siteId: String(row.site_id),
    slug: String(row.page_slug),
    title: String(row.title),
    layoutCollection: String(row.layout_collection || 'classic-corporate'),
    version: Number(row.version || 1),
    status: String(row.status || 'published'),
    locale: meta?.locale || 'en',
    updatedAt: String(row.updated_at || new Date().toISOString()),
    meta,

    // Deep dynamic zones population
    dynamicZones: parsedSections.map((sec: any, index: number) => ({
      id: String(sec.id || `sec_${index}`),
      blockType: String(sec.type || sec.blockType || 'custom'),
      order: typeof sec.order === 'number' ? sec.order : index,
      isEnabled: sec.isEnabled !== false,
      data: sec.data || sec.props || {},
      featuredMedia: async () => {
        const mediaSource = sec.data?.imageUrl || sec.data?.image || sec.data?.backgroundImage;
        return resolveMediaAsset(db, mediaSource);
      }
    })),

    // Deep featured media resolver
    featuredMedia: async () => {
      const mediaSource = meta?.ogImage || parsedSections[0]?.data?.imageUrl;
      return resolveMediaAsset(db, mediaSource);
    },

    // Deep bundled release resolver
    bundledRelease: async () => {
      try {
        const relItemRes = await db.execute({
          sql: `SELECT release_id FROM content_release_items WHERE item_id = ? OR item_id = ? LIMIT 1`,
          args: [String(row.id), String(row.page_slug)]
        });
        if (relItemRes.rows.length > 0) {
          const relId = relItemRes.rows[0].release_id;
          const relRes = await db.execute({
            sql: `SELECT * FROM content_releases WHERE id = ? LIMIT 1`,
            args: [relId]
          });
          if (relRes.rows.length > 0) {
            return formatReleaseRow(db, relRes.rows[0]);
          }
        }
      } catch (e) {
        console.error('Error bundling release for page:', e);
      }
      return null;
    }
  };
}

// Format release row with item resolver
function formatReleaseRow(db: any, row: any) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    status: String(row.status),
    scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
    publishedAt: row.published_at ? String(row.published_at) : null,
    itemCount: Number(row.item_count || 0),
    items: async () => {
      try {
        const itemsRes = await db.execute({
          sql: `SELECT * FROM content_release_items WHERE release_id = ? ORDER BY created_at ASC`,
          args: [row.id]
        });
        return itemsRes.rows.map((item: any) => ({
          id: String(item.id),
          releaseId: String(item.release_id),
          itemType: String(item.item_type),
          itemId: String(item.item_id),
          title: String(item.title),
          action: String(item.action || 'update'),
          changesSummary: item.changes_summary ? String(item.changes_summary) : null
        }));
      } catch {
        return [];
      }
    }
  };
}

function checkAuthorization(req: NextRequest): boolean {
  const token = tokenFromRequest(req.headers.get('authorization'), new URL(req.url).searchParams.get('apiKey'));
  return secretsMatch(token, readSecret('API_SECRET_TOKEN'));
}

// POST Handler (Standard GraphQL Client Request)
export async function POST(req: NextRequest) {
  try {
    if (!checkAuthorization(req)) {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized: Invalid Bearer token for Bastion GraphQL API' }] },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { query, variables, operationName } = body;

    if (!query) {
      return NextResponse.json({ errors: [{ message: 'GraphQL query string is required' }] }, { status: 400 });
    }

    await ensureDbReady();
    const db = getDb();
    const rootValue = createRootResolvers(db);

    const result = await graphql({
      schema,
      source: query,
      rootValue,
      variableValues: variables,
      operationName
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GraphQL Execution Error:', err);
    return NextResponse.json(
      { errors: [{ message: err.message || 'Internal GraphQL execution failure' }] },
      { status: 500 }
    );
  }
}

// GET Handler (Introspection & URL queries)
export async function GET(req: NextRequest) {
  try {
    if (!checkAuthorization(req)) {
      return NextResponse.json(
        { errors: [{ message: 'Unauthorized: Invalid Bearer token for Bastion GraphQL API' }] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const variablesRaw = searchParams.get('variables');
    let variables: any = undefined;

    if (variablesRaw) {
      try {
        variables = JSON.parse(variablesRaw);
      } catch {
        // ignore
      }
    }

    // Default introspection query if no query provided
    const sourceQuery = query || `
      query IntrospectSchema {
        __schema {
          types {
            name
            kind
            description
          }
        }
      }
    `;

    await ensureDbReady();
    const db = getDb();
    const rootValue = createRootResolvers(db);

    const result = await graphql({
      schema,
      source: sourceQuery,
      rootValue,
      variableValues: variables
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('GraphQL GET Error:', err);
    return NextResponse.json(
      { errors: [{ message: err.message || 'Internal GraphQL execution failure' }] },
      { status: 500 }
    );
  }
}
