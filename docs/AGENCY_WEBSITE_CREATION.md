# Agency website creation

The default `/admin/create` workflow now uses one reviewed semantic design-system contract instead of separate importer, brand-kit and template palettes. The existing GitHub and advanced import interface remains at `/admin/create/advanced`.

## Pipeline

1. Select an existing client or create a new client, and choose a unique website slug.
2. Extract public styles/assets through `/api/admin/brand/extract` and source copy through `/api/admin/wizard/extract`, or supply a manual brief. Extraction produces candidates, not certified facts. A failed source read is an error; it never fabricates a successful client extraction.
3. Review semantic colour roles, core body/muted text contrast, fonts, heading weight, type scale, radius, logo and source imagery. Export JSON/CSS tokens. Custom proprietary fonts require licensed font files; unavailable fonts use their declared fallback.
4. Choose editorial, contemporary or immersive layouts; review client copy, service descriptions and contact details. Explicitly acknowledge review before creating drafts.
5. `/api/admin/wizard/assemble` normalizes the same tokens on the server, checks contrast and tenant identity, then saves the client/site/brand kit/four page compositions/four author history records in a single transaction. Duplicate slugs return 409 and never replace an existing website.
6. Open Home, About, Services or Contact in the existing visual editor. Missing content is listed in an editorial checklist. Save edits, submit for review and use the existing independent exact-version approval/publication flow.

## Stored contract

`src/lib/studio/designSystem.ts` defines version 1 of the website token contract: semantic colours, typography, spacing, corner radius, logo, source URL and evidence labels. Extraction proposals normalize to this contract. The site stores its creation snapshot in `settings_json.designSystem`; every generated section also stores resolved styles, so typography and design changes are included in page history and approval hashes.

`/admin/design-system` reads the active website's actual saved tokens through a tenant-checked API, rather than displaying a hard-coded Gold Fields palette. `/api/admin/brand/approve` requires an explicit website and saves increasing canonical brand-kit versions. Saving a brand-kit version does not rewrite existing approved page compositions.

## Network and storage boundaries

Public extraction validates DNS addresses and pins a checked address for each HTTP request. Redirect destinations are checked again. Requests are bounded by size and time, and reject private/reserved networks and non-standard ports. Chromium requests use the same checked fetcher; they do not forward browser cookies or credentials to source websites. Rendered extraction limits page count and request/byte budgets, with a static HTML fallback. API responses do not expose assembly stack traces.

Creation is agency-only. All generated pages remain drafts, with no fabricated default statistics, contact addresses, services, social accounts, biographies or evidence claims. Generated navigation resolves to the four saved page slugs under `/sites/<websiteSlug>`; public page visibility still requires publication. The creation result opens the authenticated editor rather than pretending `?preview=true` enables Next draft mode.

## Current boundaries

This release creates a four-page corporate foundation, not a faithful migration of every discovered source page. Industry blueprints identify the site's sector; specialist investor relations, operations and other modules can be added through the existing CMS after editorial review. The creation studio's live direction panel is explicitly illustrative; the visual editor renders the saved website components.

Extraction is synchronous for this bounded workflow. The older background extraction endpoints still use an in-memory job manager and are not durable workers. A persistent job queue, cached extraction snapshots and per-client generation budgets should precede larger crawls or unattended AI generation. No paid LLM call is required for the current deterministic assembly and verification.

Inline SVG logo candidates are not automatically published as data URLs. Use an approved hosted logo asset. A source site that blocks automation requires a manual brief; an inferred palette cannot be guaranteed to match every browser state. Contrast checks cover the named text pairs, not a full accessibility audit.

## Verification

`tests/editor/website-creation.test.cjs` exercises four-page generation, token propagation and history, no fabricated defaults, duplicate/live-site preservation, injected storage rollback, validation, role gating, canonical brand-kit versions, tenant-scoped design-system reads, extraction network boundaries, and rendered footer output without invented response guarantees or dangling legal links.

`tests/e2e/test-website-creation.mjs` uses only a named disposable local preview and dedicated fixture accounts. It verifies creation, editor save/review submission, canonical stored tokens and repeat-creation conflict without any paid AI calls or production publishing.
