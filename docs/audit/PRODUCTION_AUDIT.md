# Bastion audit: additions to PR #1

This is a second pass. The main report is `BASTION_AUDIT.md` (PR #1: invite takeover, governance/IR-sync auth, SSRF list, encryption fallback, public rate limits, CI). This file only lists what that audit did not cover, and which of its items overlap. Same commit range (`main`), manual read, `tsc` clean; no live testing and no `npm audit`.

## Fixed in this PR (stacked on #1)
1. **Stored XSS in published results booklets (PDF-to-HTML output), cross-tenant privilege escalation.** `sanitizePublicationHtml` (`src/lib/results/codeAssistant.ts:37`) was a small denylist: its `javascript:` regex missed tab/newline-obfuscated schemes (`java&#9;script:`), and `action`/`formaction`/`data:` URLs, `<form>` and `srcdoc` were not handled. The output is served same-origin as `text/html` with no CSP at `/results/[slug]/document`, and `PATCH /api/admin/results/[id]` needs only `requireUser`, so any client user (even read-only) can publish a booklet that runs script on the studio origin when an agency admin or visitor opens it. Fixed: control characters stripped before scheme checks, `javascript:`/`vbscript:`/non-image `data:` blocked in all URL attributes, forms/inputs/`srcdoc` removed, and the document route sends a sandbox CSP (opaque origin, no scripts) as a second layer.

## New findings, not fixed
2. **High: role permissions mostly unenforced.** `requirePermission` is used on 4 routes, ~19 others use `requireUser`, so `read_only_stakeholder` / `analyst` can create, edit and publish results documents and use CMS write APIs.
3. **High: predictable temporary password** `<ClientName>2026!` (`src/lib/email/welcomeTemplate.ts:30`); scripts also hard-code `Bastion2026!` / `GoldFields2026!`. Confirm no real account uses them.
4. **High: stored XSS in SENS announcements.** `bodyHtml` saved unsanitised (`api/admin/ir/sens/route.ts`) and rendered with `dangerouslySetInnerHTML` (`src/app/admin/sens/page.tsx:1106`). Reuse the sanitiser on write.
5. **Medium: SVG sanitisers are denylists** (`results/brand.ts:266` `sanitizeSvg`; `media/upload` `isUnsafeSvg` is evadable with `<a xlink:href="java&#x09;script:...">`). Use an allowlist library and serve SVGs with a sandbox CSP.
6. **Medium: subdomain tenant match** (`middleware.ts` step 3): any host with 3+ labels whose first label equals a registered slug resolves to that tenant (`goldfields.attacker.com`). Require exact verified domains. (PR #1's note 10 covers only the hard-coded registry.)

## Already covered in PR #1's report (see `BASTION_AUDIT.md`)
Governance/IR-sync auth (fixed there; my duplicate fix was dropped), SSRF validator and redirect/DNS gaps, login rate limit and lockout, OAuth `state`, `quick-approve` GET, public endpoints defaulting to `client_goldfields`, per-instance rate limiter, `studio.db` bundling, CI gaps.
