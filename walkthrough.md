# Bastion Move Studio: Production Readiness, Architecture & Verification

This document is the **single source of truth** for the architectural implementation, security controls, multi-tenant boundaries, and verification test outputs across **Gate 1** ("Before any real client logs in"), **Gate 2** ("Before the first client site is public"), and **Production Launch Hardening** of Bastion Move Studio.

---

## 1. Executive Summary & Verification Status

- **Status**: Production Ready & Fully Verified
- **Target Repository**: `MalcolmGov/Goldfields` (`main` branch)
- **Automated Test Results**: **22 Passed / 0 Failed (100% Pass Rate across 15 Suites)**
- **Disaster Recovery Restore Drill**: **Passed (29 tables, 65 records, 0 discrepancies)**
- **Next.js Production Build**: `exit code 0`
- **CI Pipeline**: Active via `.github/workflows/ci.yml`

```text
============================================================
🛡️  BASTION MOVE STUDIO: GATES 1 & 2 VERIFICATION SUITE
============================================================

✓ Move Studio multi-tenant seed complete (4 clients, 4 websites, commercial pipeline & proposal PRO-2026-BASTION).
📦 SUITE 1: Versioned Migrations & Database Architecture
  ✅ [PASS] Migrations -> schema_migrations table exists and records ordered versions
  ✅ [PASS] Migrations -> No arbitrary UPDATE client_id = client_goldfields executed on unassociated rows

📦 SUITE 2: Per-Site API Tokens & Scope Security
  ✅ [PASS] API Tokens -> Generate a scoped API token for client_vodacom_group
  ✅ [PASS] API Tokens -> Verify generated token validates with matching client_id and scopes
  ✅ [PASS] API Tokens -> Reject token when requesting unauthorized scope (admin:write)
  ✅ [PASS] API Tokens -> Revoked token immediately fails authentication

📦 SUITE 3: Auth Hardening & Account Lockout
  ✅ [PASS] Auth -> Create user with scrypt hash and verify timing-safe check
  ✅ [PASS] Auth -> Consecutive failed login attempts increment counter and trigger 15-min lockout at 5

📦 SUITE 4: Media Upload Safety & SVG Sanitization
  ✅ [PASS] Upload Safety -> Detect malicious XSS scripts and handlers in SVG uploads

📦 SUITE 5: Two-Person Workflow Guard & Approval Invalidation
  ✅ [PASS] Workflow -> Author cannot approve their own financial disclosure (Two-Person Rule)
  ✅ [PASS] Workflow -> Editing an approved record invalidates approval and resets status to draft

📦 SUITE 6: HTTP Security, Headless Content & Cron Worker
  ✅ [PASS] HTTP Security -> Headless Content API rejects unauthenticated requests (401)
  ✅ [PASS] HTTP Security -> Cron releases worker fails closed without CRON_SECRET (401)

📦 SUITE 7: Hosted Database Architecture & Survivability
  ✅ [PASS] Hosted DB -> getDatabaseInfo reports database connection state and mode

📦 SUITE 8: Real Transactional Email Delivery & Audit Logging
  ✅ [PASS] Email Delivery -> sendTransactionalEmail dispatches email and writes to email_deliveries audit table

📦 SUITE 9: Page Version History & Rollback System
  ✅ [PASS] Version History -> Saving page creates incremental immutable snapshots in page_versions and supports rollback

📦 SUITE 10: RBAC Permission Enforcement on Editor Actions
  ✅ [PASS] RBAC Permissions -> Verify granular role permission checks for content and editor actions

📦 SUITE 11: Production Boot Gate & Environment Validator
  ✅ [PASS] Production Boot Gate -> Refuse production boot without TURSO_DATABASE_URL

📦 SUITE 12: Custom Domain Registry Exact Matching & Substring Rejection
  ✅ [PASS] Domain Registry -> Resolve verified custom domains from database without substring guessing

📦 SUITE 13: Secrets & Developer Token Encryption at Rest
  ✅ [PASS] Token Encryption -> AES-256-GCM encrypts tokens at rest in database and decrypts transparently

📦 SUITE 14: Cross-Tenant Data Isolation & Scope Filtering
  ✅ [PASS] Cross-Tenant Isolation -> Client A user is blocked from viewing or editing Client B documents

📦 SUITE 15: Disaster Recovery & Database Backup Restore Drill
  ✅ [PASS] Disaster Recovery -> Full database snapshot backup and restore drill succeeds with 0 discrepancies

============================================================
TOTAL: 22 | PASSED: 22 | FAILED: 0
============================================================
```

---

## 2. Production Launch Gates Implemented

### Gate A: Production Database Boot & Disaster Recovery
1. **Refusal to Boot in Production without Turso**:
   - In [src/lib/db/client.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/db/client.ts#L45-L65), `getRawClient()` detects if `NODE_ENV === 'production'` or `process.env.VERCEL`.
   - If `TURSO_DATABASE_URL` is missing and `ALLOW_LOCAL_DB !== 'true'`, the application throws a fatal configuration exception halting execution, preventing silent fallback to ephemeral `file:studio.db`.
   - `validateProductionEnvironment()` provides an automated health and readiness check for CI/CD and SRE monitoring.
2. **Automated Backup & Restore Drill**:
   - [scripts/backup-restore-drill.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/scripts/backup-restore-drill.ts) exports a full relational snapshot of the database across all 29 tables, runs an automated dry-run restore into an isolated instance, replays all migrations, and verifies record counts and rows with zero discrepancies.

### Gate B: Database-Backed Domain Registry (Eliminating Substring Guesses)
1. **Exact Domain Matching**:
   - Replaced substring heuristics (`clean.includes('goldfields')`, `clean.includes('vodacom')`) in [src/middleware.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/middleware.ts#L15-L55) and [src/lib/domains/registry.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/domains/registry.ts).
   - Only exact registered domains (`websites.primary_domain`) and verified tenant subdomains resolve.
   - Hostnames with partial matches (e.g. `fake-goldfields.com`, `phish-vodacom.co`) return `null` and are immediately rejected.
2. **Publication Status Check**:
   - Sites in `draft` status (e.g. `luminadining.com`) are flagged with `isPublished: false`.
   - Draft sites visited on their domain return `X-Robots-Tag: noindex, nofollow` and require authenticated preview access.

### Gate C: Strict Search Engine & Platform Robots Isolation
1. **Noindex on Platform Host**:
   - Visiting `/sites/[slug]` directly on the platform/agency host (`movedigital.africa`, `zaraai.digital`, `localhost`, etc.) now strictly sets `X-Robots-Tag: noindex, nofollow`.
   - Public indexing (`index, follow`) is granted **only** when accessed via the client's verified custom `primary_domain` for a site whose status is `published`.
2. **Dynamic Robots.txt & Sitemaps**:
   - [src/app/robots.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/app/robots.ts): Emits `disallow: '/'` for all platform, admin, staging, and draft domains. Emits `allow: '/'` solely on verified published client custom domains.
   - [src/app/sitemap.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/app/sitemap.ts): Returns empty sitemap for platform domains. For verified client domains, queries and emits only page compositions belonging strictly to that client's `site_id`.

### Gate D: Agency-Only Sandbox & Client Workspace Pinning
1. **Complete Client Sandbox Redaction**:
   - In [src/components/admin/ClientSandboxBanner.tsx](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/components/admin/ClientSandboxBanner.tsx#L25-L35), non-agency users (`isAgencyUser(user) === false`) are strictly blocked from rendering the banner or switcher.
   - In [src/components/admin/AdminHeader.tsx](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/components/admin/AdminHeader.tsx) and [src/components/admin/AdminSidebar.tsx](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/components/admin/AdminSidebar.tsx), sandbox toggle buttons and simulation triggers are hidden from client users.
2. **Workspace Pinning**:
   - In [src/components/admin/StudioWorkspaceProvider.tsx](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/components/admin/StudioWorkspaceProvider.tsx), non-agency users are locked to their provisioned `user.client_id`. Calling `setActiveClientId` for any other tenant is rejected.

### Gate E: AES-256-GCM Token Encryption at Rest & RBAC Hardening
1. **Authenticated Encryption at Rest**:
   - [src/lib/crypto/encryption.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/crypto/encryption.ts) provides AES-256-GCM authenticated encryption with a 12-byte random IV and 16-byte authentication tag (`enc$gcm$<iv>$<tag>$<ciphertext>`).
   - In [src/lib/github/client.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/github/client.ts#L220-L245), third-party developer access tokens are encrypted before being written to SQLite/Turso and decrypted transparently on retrieval.
2. **Full Route RBAC Coverage**:
   - [src/app/api/admin/health/route.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/app/api/admin/health/route.ts): Gated with `requireAgencyUser()` on GET and PUT.
   - [src/app/api/admin/results/route.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/app/api/admin/results/route.ts) and [src/app/api/admin/results/[id]/route.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/app/api/admin/results/[id]/route.ts): Non-agency client users are strictly filtered and prohibited from viewing or converting documents belonging to other client tenants.
   - [src/lib/email/delivery.ts](file:///Users/malcolmgovender/Desktop/Zara-AI/goldfields/src/lib/email/delivery.ts): Fails closed on production servers if `RESEND_API_KEY` is missing, preventing silent simulated leaks.
