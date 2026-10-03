import 'server-only';
import { getDb } from '@/lib/db/client';
import { flagshipDraftsAllowed } from '@/lib/auth/draftPreview';
import { ContentRepository } from '@/lib/adapters/ContentRepository';
import type {
  Operation,
  ReportItem,
  SustainabilityTarget,
  NewsArticle,
  JobListing,
  SupplierGuidance
} from '@/lib/types';

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  hero?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    bgImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  blocks?: any[];
  meta?: {
    description?: string;
    keywords?: string;
  };
}

/**
 * Fetch a single page by slug from studio.db (or draft revision if previewing)
 */
export async function getPublishedPage(slug: string, isDraft = false): Promise<PageContent | null> {
  try {
    const db = getDb();
    const drafts = isDraft && (await flagshipDraftsAllowed());
    const recResult = await db.execute({
      sql: `SELECT * FROM content_records WHERE collection = 'pages' AND slug = ? AND (client_id IS NULL OR client_id = 'client_goldfields') LIMIT 1`,
      args: [slug]
    });

    if (recResult.rows.length === 0) return null;
    const rec = recResult.rows[0];

    const revId = drafts
      ? (rec.current_draft_revision_id || rec.current_published_revision_id)
      : rec.current_published_revision_id;

    if (!revId) return null;

    const revResult = await db.execute({
      sql: `SELECT * FROM revisions WHERE id = ? LIMIT 1`,
      args: [revId]
    });

    if (revResult.rows.length === 0) return null;
    const rev = revResult.rows[0];
    const data = typeof rev.data_json === 'string' ? JSON.parse(rev.data_json) : (rev.data_json || {});

    return {
      id: String(rec.id),
      slug: String(rec.slug),
      title: String(rec.title),
      ...data
    };
  } catch (err) {
    console.warn(`[getPublishedPage] Error reading page "${slug}" from db:`, err);
    return null;
  }
}

/**
 * Generic fetcher for all published records in a collection
 */
export async function getPublishedCollection<T>(collection: string, isDraft = false): Promise<T[]> {
  try {
    const db = getDb();
    const drafts = isDraft && (await flagshipDraftsAllowed());
    const res = await db.execute({
      sql: `SELECT r.id, r.slug, r.title, r.status, rev.data_json
            FROM content_records r
            LEFT JOIN revisions rev ON rev.id = (
              CASE WHEN ? = 1 THEN COALESCE(r.current_draft_revision_id, r.current_published_revision_id)
                   ELSE r.current_published_revision_id END
            )
            WHERE (r.collection = ? OR (r.collection = 'sustainability_targets' AND ? = 'sustainability'))
              AND (r.client_id IS NULL OR r.client_id = 'client_goldfields')
              AND (r.status = 'published' OR ? = 1)
            ORDER BY r.updated_at DESC`,
      args: [drafts ? 1 : 0, collection, collection, drafts ? 1 : 0]
    });

    if (res.rows.length === 0) return [];

    return res.rows.map((row) => {
      const parsed = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
      return {
        id: String(row.id),
        slug: String(row.slug),
        title: String(row.title),
        ...parsed
      } as T;
    });
  } catch (err) {
    console.warn(`[getPublishedCollection] Error querying collection "${collection}":`, err);
    return [];
  }
}

/**
 * Generic fetcher for a single record by slug or id
 */
export async function getPublishedRecordBySlug<T>(collection: string, slug: string, isDraft = false): Promise<T | null> {
  try {
    const db = getDb();
    const drafts = isDraft && (await flagshipDraftsAllowed());
    const res = await db.execute({
      sql: `SELECT r.id, r.slug, r.title, r.status, rev.data_json
            FROM content_records r
            LEFT JOIN revisions rev ON rev.id = (
              CASE WHEN ? = 1 THEN COALESCE(r.current_draft_revision_id, r.current_published_revision_id)
                   ELSE r.current_published_revision_id END
            )
            WHERE (r.collection = ? OR (r.collection = 'sustainability_targets' AND ? = 'sustainability'))
              AND (r.client_id IS NULL OR r.client_id = 'client_goldfields')
              AND (r.slug = ? OR r.id = ?)
              AND (r.status = 'published' OR ? = 1)
            LIMIT 1`,
      args: [drafts ? 1 : 0, collection, collection, slug, slug, drafts ? 1 : 0]
    });

    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    const parsed = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
    return {
      id: String(row.id),
      slug: String(row.slug),
      title: String(row.title),
      ...parsed
    } as T;
  } catch (err) {
    console.warn(`[getPublishedRecordBySlug] Error querying "${collection}/${slug}":`, err);
    return null;
  }
}

/* ============================================================
   Collection-Specific Helpers with Automatic Fixture Fallback
   ============================================================ */

export async function getPublishedOperations(isDraft = false): Promise<Operation[]> {
  const fromDb = await getPublishedCollection<Operation>('operations', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getOperations();
}

export async function getPublishedOperationBySlug(slug: string, isDraft = false): Promise<Operation | undefined> {
  const fromDb = await getPublishedRecordBySlug<Operation>('operations', slug, isDraft);
  if (fromDb) return fromDb;
  return ContentRepository.getOperationBySlug(slug);
}

export async function getPublishedNews(isDraft = false): Promise<NewsArticle[]> {
  const fromDb = await getPublishedCollection<NewsArticle>('news', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getNews();
}

export async function getPublishedNewsBySlug(slug: string, isDraft = false): Promise<NewsArticle | undefined> {
  const fromDb = await getPublishedRecordBySlug<NewsArticle>('news', slug, isDraft);
  if (fromDb) return fromDb;
  return ContentRepository.getNewsBySlug(slug);
}

export async function getPublishedReports(isDraft = false): Promise<ReportItem[]> {
  const fromDb = await getPublishedCollection<ReportItem>('reports', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getReports();
}

export async function getPublishedJobs(isDraft = false): Promise<JobListing[]> {
  const fromDb = await getPublishedCollection<JobListing>('jobs', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getJobs();
}

export async function getPublishedSuppliers(isDraft = false): Promise<SupplierGuidance[]> {
  const fromDb = await getPublishedCollection<SupplierGuidance>('suppliers', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getSupplierGuidance();
}

export async function getPublishedSustainabilityTargets(isDraft = false): Promise<SustainabilityTarget[]> {
  const fromDb = await getPublishedCollection<SustainabilityTarget>('sustainability', isDraft);
  if (fromDb.length > 0) return fromDb;
  return ContentRepository.getSustainabilityTargets();
}
