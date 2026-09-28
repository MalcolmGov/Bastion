# Gold Fields Studio — CMS Implementation Plan & Content Migration Inventory

**Document Version:** 1.0.0  
**Date:** 28 September 2026  
**System Name:** Gold Fields Studio (`/admin`)  
**Target Environment:** Next.js 15.1.7 / App Router, TypeScript, React 19, Tailwind CSS, Embedded Persistent Database (`studio.db` via `@libsql/client` / SQLite with PostgreSQL migration path).

---

## 1. Executive Summary & Architecture Decision

### A. Core Architecture Decision
- **Unified Next.js 15 App Router Architecture:** Rather than introducing a heavy third-party CMS runtime with strict, incompatible Next.js canary peer-dependency locks (`>=15.2.9 <15.3.0` which conflicts with existing Next.js 15.1.7 and breaks React 19 / Three.js 3D WebGL shader dependencies), **Gold Fields Studio** is engineered as a first-class, enterprise-grade, integrated CMS and website management platform built directly into the existing repository at `/admin`.
- **Single Source of Truth:** The database (`studio.db` via `@libsql/client`) serves as the authoritative single source of truth for content, revision history, approval state machines, media assets, audit logs, and website settings.
- **Content Adapter Integration:** The public website's [`ContentRepository`](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/adapters/ContentRepository.ts) is upgraded to a hybrid CMS adapter that queries published database snapshots at runtime while gracefully falling back to pre-seeded static fixtures.
- **Genuine Database Persistence:** Runs locally with zero required external cloud accounts or paid subscriptions. Schema and migrations use standard SQL compatible with PostgreSQL for enterprise multi-region cloud deployment.

---

## 2. Content Migration Inventory

Every currently visible editorial element on the public flagship website has been cataloged and mapped to its corresponding CMS collection or global setting:

| Item / Element | Current Location in Codebase | Destination Collection / Global | Schema Fields & Types |
|---|---|---|---|
| **Site Settings & Brand** | `BrandHeader.tsx`, `tailwind.config.ts` | `Global: site_settings` | `siteName`, `tagline`, `logoUrl`, `crestUrl`, `primaryTicker`, `secondaryTicker`, `contactEmail`, `officeAddress` |
| **Top Utility Links** | `BrandHeader.tsx` (lines 33–77) | `Global: navigation` | `utilityLinks: Array<{ label, url, isExternal, order }>` |
| **Main Navigation & MegaMenu** | `BrandHeader.tsx`, `MegaMenu.tsx` | `Global: navigation` | `navItems: Array<{ id, label, href, children: Array<{ label, description, href, badge }> }>` |
| **Footer Navigation & Legal** | `BrandFooter.tsx` | `Global: footer` | `brandBlurb`, `officeAddress`, `whistleblowingUrl`, `columns: Array<{ title, links }>`, `legalLinks`, `copyrightNotice`, `poweredBy` |
| **Hero Banner** | `src/app/page.tsx` (lines 32–85) | `Collection: pages (slug: 'home')` | `hero: { badge, title, subtitleHtml, description, primaryCta, secondaryCta, bgImage }` |
| **Ticker & Quick Links** | `src/app/page.tsx` (lines 145–185) | `Global: site_settings` | `marketData: Array<{ ticker, price, change, currency }>`, `quickLinks` |
| **Purpose in Action Split** | `src/app/page.tsx` (lines 188–267) | `Collection: pages (slug: 'home')` | `purposeSection: { overtitle, title, description, metrics: Array<{ val, desc }>, image, badge }` |
| **Operations Portfolio** | `src/content/operations.json` (10 mines) | `Collection: operations` | `id, slug, name, country, region, type, status, ownership, attributableProd, overview, coords, image, metrics, highlights, officialUrl` |
| **Geology & Technical Data** | `src/lib/data/operationGeologyData.ts` | `Collection: operations` (nested) | `geology: { mineralization, depositType, miningMethod, processingPlant, powerSource, solarCapacity }` |
| **Financial & Annual Reports** | `src/content/reports.json` (6 documents) | `Collection: reports` | `id, title, period, year, category, date, format, fileSize, downloadUrl, coverImage, summary, highlights, sourceUrl, isEmbargoed` |
| **H1 2026 Disclosure Card** | `src/app/page.tsx` (lines 239–295) | `Collection: releases / reports` | `spotlightReportId, headline, period, groupOutput, southDeepOutput, summary, directPdfUrl` |
| **ESG Targets & Stewardship** | `src/content/sustainability.json` (6 targets) | `Collection: sustainability_targets` | `id, pillar, title, targetYear, baseline: { year, val, unit }, latestActual: { period, val, unit, status }, description, sourceDocument` |
| **Renewable Microgrids** | `src/app/sustainability/page.tsx` | `Collection: case_studies` | `id, title, asset, capacity, co2Abated, commissioningYear, summary, image, metrics` |
| **Tailings Safety (GISTM)** | `src/app/sustainability/page.tsx` | `Collection: sustainability_topics` | `slug: 'tailings-gistm', title, conformanceLevel, auditDate, disclosureUrl, facilitiesCount` |
| **News & SENS Announcements**| `src/content/news.json` (4 articles) | `Collection: news` | `id, slug, title, category, date, readTime, summary, bodyMarkdown, image, sourceUrl, tags` |
| **Careers & Vacancies** | `src/content/jobs.json` (6 demo listings) | `Collection: jobs` | `id, title, department, region, location, type, experienceLevel, postedDate, closingDate, description, requirements, externalAtsUrl` |
| **Regional Supplier Guidance** | `src/content/suppliers.json` (4 regions) | `Collection: supplier_guidance` | `id, countryCode, countryName, currency, statutoryNotice, checklist: Array<{ step, title, desc, docRequired }>, portalUrl, contactEmail` |
| **Regional Contacts Directory**| `src/app/contact/page.tsx` | `Collection: contacts` | `id, region, officeType, address, phone, email, contactPerson, coordinates` |
| **Executive Leadership** | `src/app/about/page.tsx` | `Collection: people` | `id, name, title, committee, biography, portraitUrl, order, appointedDate` |
| **AI Knowledge Sources** | `src/lib/adapters/DemoAssistantProvider.ts` | `Collection: ai_knowledge_sources` | `id, title, url, category, contentHash, status: ('eligible'\|'indexed'\|'withdrawn'), lastIndexed, revisionId` |
| **Media Library Assets** | `public/assets/*` (21 files) | `Collection: media_assets` | `id, filename, filepath, mimeType, sizeBytes, width, height, altText, caption, focalPoint, usageCount, references` |

---

## 3. Database Schema & Architecture

### A. Technology Choice: `@libsql/client` (SQLite Engine)
- Zero external services required for local development.
- Stored in project root as `studio.db` (git-ignored, reproducible with `npm run studio:seed`).
- Strict schema with foreign keys, indexes, and transactional revisions.

### B. Core Tables & Relational Mapping
1. **`users`**: `id`, `name`, `email`, `password_hash`, `role` (`platform_admin` | `content_editor` | `reviewer` | `publisher` | `analyst` | `website_operator` | `ai_knowledge_manager` | `read_only_stakeholder`), `region_scope`, `created_at`, `last_login`.
2. **`sessions`**: `id`, `user_id`, `token_hash`, `expires_at`, `ip_address`, `user_agent`.
3. **`content_records`**: `id`, `collection`, `slug`, `title`, `current_published_revision_id`, `current_draft_revision_id`, `status` (`draft` | `in_review` | `approved` | `changes_requested` | `scheduled` | `published` | `archived`), `owner_id`, `created_at`, `updated_at`.
4. **`revisions`**: `id`, `record_id`, `revision_number`, `data_json`, `content_hash`, `author_id`, `created_at`, `status`, `review_comments`.
5. **`approvals`**: `id`, `revision_id`, `reviewer_id`, `decision` (`approved` | `rejected`), `comment`, `created_at`, `content_hash_at_approval`.
6. **`scheduled_jobs`**: `id`, `revision_id`, `publish_at_utc`, `status` (`pending` | `executed` | `cancelled` | `failed`), `scheduled_by_id`, `executed_at_utc`, `error_log`.
7. **`audit_log`**: `id`, `actor_id`, `action`, `collection`, `record_id`, `revision_id`, `result` (`success` | `denied`), `correlation_id`, `ip_address`, `created_at`.
8. **`media_assets`**: `id`, `filename`, `url`, `mime_type`, `size_bytes`, `width`, `height`, `alt_text`, `caption`, `focal_x`, `focal_y`, `created_at`.
9. **`asset_usages`**: `id`, `asset_id`, `record_id`, `field_path`.
10. **`incidents`**: `id`, `title`, `severity` (`low` | `medium` | `high` | `critical`), `status` (`open` | `acknowledged` | `investigating` | `resolved`), `affected_routes`, `owner_id`, `timeline_json`, `created_at`, `resolved_at`.
11. **`ai_knowledge_items`**: `id`, `title`, `source_url`, `published_revision_id`, `status` (`pending` | `indexed` | `withdrawn` | `failed`), `chunk_count`, `last_indexed_at`, `eligibility_criteria`.
12. **`analytics_events`**: `id`, `event_name`, `properties_json`, `timestamp`, `session_hash`.

---

## 4. Editorial Workflow & State Machine

```
              ┌───────────────┐
              │     DRAFT     │◄────────────┐
              └───────┬───────┘             │
                      │ Send for Review     │ Changes
                      ▼                     │ Requested
              ┌───────────────┐             │
              │   IN REVIEW   ├─────────────┘
              └───────┬───────┘
                      │ Reviewer Approval
                      ▼
              ┌───────────────┐
              │   APPROVED    │
              └───────┬───────┘
                      ├──────────────────────────┐
                      │ Immediate Publish        │ Schedule for Future Release
                      ▼                          ▼
              ┌───────────────┐          ┌───────────────┐
              │   PUBLISHED   │          │   SCHEDULED   │
              └───────┬───────┘          └───────┬───────┘
                      │                          │ Worker executes at UTC time
                      │ Archive / Rollback       │
                      ▼                          ▼
              ┌───────────────┐          ┌───────────────┐
              │   ARCHIVED    │          │   PUBLISHED   │
              └───────────────┘          └───────────────┘
```

### Key Workflow Safeguards:
1. **Hash-Bound Approvals:** Approving binds strictly to the SHA-256 hash of the revision data. Any subsequent edits invalidate approval immediately.
2. **Two-Person Rule for Financial Releases:** Any content marked as financial/results disclosure requires approval by a user different from the author (`author_id !== reviewer_id`).
3. **Embargo Protection:** Scheduled items and associated assets are locked in protected storage until the scheduled timestamp has passed in UTC.
4. **Durable Worker:** A background runner processes scheduled releases, automated link checks, and AI index synchronization with idempotent receipts.

---

## 5. Visual Page Editor

- **3-Panel Ergonomic Layout:**
  - **Left (240px):** Component tree outline (Hero, Metric Row, Operations Explorer, Story Split, News Grid, CTA, etc.) with move up/down, duplicate, delete.
  - **Center (Responsive Canvas):** Live interactive preview rendered using the exact public React components (`BrandHeader`, `Hero`, `OperationsMap`, `BrandFooter`), with switchable viewport toggles (Desktop 1440px, Tablet 768px, Mobile 375px).
  - **Right (320px):** Inspector panel for the selected block (typography text fields, image selectors with focal points, metric inputs, layout variant switches).
- **Draft vs. Live Isolation:** The preview uses session-isolated state; the public production site continues serving only the `PUBLISHED` revision.

---

## 6. Public AI Assistant Knowledge Governance

- **"Ask Gold Fields" Governance Portal:**
  - Source library showing all eligible documents and web pages.
  - Hard rule: Draft, embargoed, deleted, and confidential documents are automatically excluded at retrieval time.
  - Verification & Test Lab: Pre-configured test suite validating prompt responses, citations, groundedness, and prompt injection defense.
  - Public Assistant Kill-Switch: Instant emergency shutoff setting with configurable friendly public fallback message.

---

## 7. Delivery Plan & Verification

1. **Phase 1: Foundation & Database**
   - Install `@libsql/client` and seed script.
   - Provision `studio.db` with complete schema, migrations, and seed data from JSON fixtures.
   - Setup session authentication and server-side RBAC middleware.
2. **Phase 2: Branded Admin Shell & Dashboard**
   - Build `/admin` layout with deep navy sidebar, gold accents, top bar, user menu, environment pill ("Local Demo").
   - Implement the operational overview dashboard (Reviews pending, Website Health, Publishing Calendar, My Tasks).
3. **Phase 3: Content Management & Visual Builder**
   - Build table views with search, filtering, sorting, and pagination for Pages, News, Operations, Reports, Sustainability, Careers, Suppliers.
   - Build Visual Page Builder for the homepage and operation detail pages.
   - Implement review and two-person approval state machine.
4. **Phase 4: Assets, Media & Background Worker**
   - Implement Media Library with drag-and-drop upload, alt text, and usage reference tracking.
   - Implement background scheduled publishing worker with Africa/Johannesburg (SAST) and UTC time zone support.
5. **Phase 5: Intelligence & Monitoring Workspaces**
   - Analytics Workspace with event taxonomy and filterable dashboards.
   - Website Health & Monitoring Workspace with automated broken link checks and incident tracking.
   - SEO & Redirects manager with OG preview and slug validation.
6. **Phase 6: Public AI Knowledge Administration & Public Website Integration**
   - Ingestion and evaluation lab for "Ask Gold Fields".
   - Wire `ContentRepository` to read from published database revisions.
   - Verify all 30 public routes reflect published updates.
7. **Phase 7: End-to-End Testing & Verification**
   - Execute the 12 mandatory validation journeys specified in the prompt.
