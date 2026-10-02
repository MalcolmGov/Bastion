# Bastion — Enterprise Multi-Tenant Corporate CMS & Digital Experience Platform

[![Production Status](https://img.shields.io/badge/status-production--ready-emerald.svg)](https://github.com/MalcolmGov/Bastion)
[![Verification Gates](https://img.shields.io/badge/gates-40%2F40%20passed-success.svg)](https://github.com/MalcolmGov/Bastion)
[![Architecture](https://img.shields.io/badge/architecture-strict%20multi--tenant-blue.svg)](https://github.com/MalcolmGov/Bastion)
[![Framework](https://img.shields.io/badge/next.js-15.1%20%7C%20react%2019-black.svg)](https://nextjs.org/)

**Bastion** is an enterprise-grade, multi-tenant digital experience and content management platform engineered specifically for corporate organizations, publicly listed enterprises, and institutional clients.

---

## 1. Why Bastion Was Built

Modern enterprise websites and investor portals require institutional-grade reliability, strict statutory compliance (King IV, POPIA, JSE/SENS), high-availability hosting, and rapid content publishing. 

Historically, corporate enterprises have been trapped between two inadequate models:
1. **Monolithic Legacy CMSs (WordPress, Drupal, Sitecore):** Bloated, vulnerable to security exploits, slow to load, and reliant on costly agency developer hours for even minor narrative or disclosure updates.
2. **Generic Headless Systems:** Fragmented developer tools that lack built-in governance, regulatory announcement feeds, investor relations tooling, and approval safeguards.

**Bastion bridges this gap.** Bastion Group retains total architectural control over infrastructure, security, performance, templates, and core brand design systems, while empowering corporate communications and investor relations teams with a distraction-free, zero-code publishing suite. Changes to market disclosures, press releases, reports, and ESG targets can be drafted, reviewed, approved under the Two-Person Rule, and published in real time without writing a single line of code.

---

## 2. Who Bastion Is Built For

Bastion delivers two distinct, securely connected experiences:

### 🛡️ 1. Bastion Agency Studio (Platform Operations)
Built for the **Bastion team, digital agency leads, and platform administrators**:
- **Centralized Multi-Tenant Portfolio:** Command center to oversee all enterprise clients, manage domains, and monitor site health.
- **Client Onboarding & Commercial Tiers:** 6-step guided onboarding wizard to provision corporate workspaces with tiered commercial packaging (**Silver**, **Gold**, and **Platinum**) and custom contract pricing.
- **Enterprise Digital Asset Management (DAM):** High-resolution media repository with folder hierarchies, focal-point cropping, and strict SVG sanitization.
- **Automated SRE & Site Reliability:** Real-time health probes, anomaly diagnosis, self-healing remediation, and uptime verification.
- **Client Experience Sandbox:** Instant simulation of any client workspace with one-click role switching to verify workflows before client handover.

### 🏢 2. Corporate Client CMS Workspace (Tenant Operations)
Built for **corporate communications directors, investor relations officers, sustainability leads, and compliance executives**:
- **Distraction-Free Publishing:** Autonomous, zero-code content editing for corporate landing pages, executive leadership profiles, and news releases.
- **Strict Data Isolation:** Cryptographically and relationally isolated tenant boundaries ensuring Company A never sees Company B's data, media, drafts, or disclosures.
- **Institutional Regulatory Hub:** Dedicated suites for JSE SENS announcements, financial calendars with dividend withholding tax (DWT) calculations, and interactive financial results.
- **Statutory Compliance & Governance:** Automated King IV and POPIA scorecards, encrypted whistleblower hotlines, and transparent procurement tender boards.

---

## 3. Core Architectural Modules

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BASTION PLATFORM CORE                           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
┌───────────────────────────────────┐ ┌───────────────────────────────────┐
│       BASTION AGENCY STUDIO       │ │      CORPORATE CLIENT WORKSPACE   │
│  • Multi-Tenant Administration    │ │  • Zero-Code Visual Page Editor   │
│  • Client Onboarding & Tiers      │ │  • Interactive Results Studio     │
│  • Enterprise DAM & Media Library │ │  • JSE SENS Regulatory Feeder     │
│  • Release & Rollout Manager      │ │  • King IV & POPIA Governance     │
│  • Autonomous SRE Diagnostic Probes││  • Encrypted Whistleblower Portal │
│  • Commercial Proposal Generator  │ │  • Corporate Supplier Tender Board│
└───────────────────────────────────┘ └───────────────────────────────────┘
```

### Strict Multi-Tenant Data Isolation
- **Tenant Resolver & Cookie Synchronization:** Every request resolves the tenant context from session cookies, secure headers (`x-client-id`), or verified route parameters.
- **Non-Bypassable Database Queries:** Database queries strictly enforce tenant boundaries (`WHERE client_id = ?`), preventing cross-tenant leakage across pages, media, results conversions, and audit logs.
- **Automatic Content Provisioning:** Onboarding a new client automatically provisions isolated starter pages, DAM folders, and default site compositions.

### Interactive Results Studio & PDF-to-HTML
- **Automated Conversion:** Converts complex corporate financial results PDFs into interactive, responsive, branded HTML investor portals.
- **Institutional Ratio Engine:** Automatically extracts and computes Gross Margin, Operating Margin, Return on Assets (ROA), and Debt-to-Equity ratios.
- **Balance Sheet Validator:** Programmatically verifies the fundamental accounting equation ($\text{Assets} = \text{Liabilities} + \text{Equity}$) with zero variance tolerance.
- **Compliant Financial Export:** Generates RFC 4180 CSV exports with proper cell escaping and parenthetical negatives for analyst modeling.

### Regulatory Feeder & Financial Calendar
- **JSE SENS Feeder:** Publishes price-sensitive stock exchange announcements with ticker references and categorization.
- **Financial Calendar Hub:** Interactive corporate action tracking with RFC 5545 iCalendar (`.ics`) generation and automated South African Dividend Withholding Tax (DWT) calculations.

### Institutional Two-Person Rule & Visual Diffs
- **Two-Person Rule:** Author cannot approve their own financial disclosures; independent peer review and sign-off is programmatically enforced.
- **Visual Myers Diff Engine:** Side-by-side line-by-line and token-level visual diffs highlight exact modifications before publication, invalidating prior approvals if content changes.

### Automated King IV & POPIA Governance Scorecard
- **16 Statutory Rules:** Automated compliance engine audits board independence, committee composition, privacy statements, and security policies.
- **Weighted Category Scoring:** Computes transparent governance ratings across Board Leadership, Audit Committee, Stakeholder Relations, and Data Privacy.

### Encrypted Ethics Hotline & Whistleblower Portal
- **Zero-IP Retention:** Anonymizes whistleblower submissions by stripping headers and zeroing client IP addresses.
- **AES-256-GCM Encryption:** Confidential whistleblower narratives are encrypted at rest with randomly generated tracking credentials.
- **Bidirectional Dialogue:** Cryptographically protected channel allowing anonymous whistleblowers and corporate ombudsmen to communicate securely.

### Corporate Supplier Tender Board
- **Statutory Vendor Validation:** Validates South African CIPC company registration numbers, SARS Tax Compliance Status (TCS) PINs, and B-BBEE certification levels.
- **RFP Bidding Portal:** Structured tender management for procurement teams with automated compliance verification.

---

## 4. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript | Server Components, Server Actions, Dynamic Streaming |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive enterprise design system with light/dark support |
| **Database** | LibSQL / SQLite, Turso | Versioned schema migrations (13 applied), connection pooling |
| **Security & Auth** | scrypt password hashing, AES-256-GCM | Encrypted secrets at rest, edge sliding-window rate limiting |
| **Email Delivery** | Resend API | Transactional invitations, welcome emails, and audit delivery |
| **Storage & DAM** | Enterprise Media Library | SVG script sanitization, focal-point cropping, folder tagging |
| **Verification** | Automated Test Suite | 40 production gates verifying security, isolation, and DR |

---

## 5. Getting Started

### Prerequisites
- **Node.js**: v18.18+ (tested on Node v20 & v26)
- **npm**: v9+

### Installation & Local Setup

```bash
# Clone the repository
git clone https://github.com/MalcolmGov/Bastion.git
cd Bastion

# Install dependencies
npm install

# Run database migrations and seed data
npm run seed

# Run the development server
npm run dev
# -> Opens http://localhost:3000
```

### Production Build & Verification

```bash
# Verify all 40 production gates
ALLOW_LOCAL_DB=true npx tsx scripts/verify-production-gates.ts

# Build production bundle
npm run build

# Start production server
npm run start -- -p 3010
# -> Opens http://localhost:3010
```

---

## 6. Commercial Packages

Bastion offers structured multi-tenant packages selectable during onboarding:

| Feature / Tier | Silver | Gold | Platinum |
|---|:---:|:---:|:---:|
| **Target Profile** | Mid-market enterprises | Large corporate entities | Publicly listed multinationals |
| **Dedicated Websites** | 1 corporate site | Up to 3 sites & portals | Unlimited corporate sites |
| **Visual Page Builder** | Included | Included | Included |
| **DAM Storage** | 25 GB | 100 GB | 1 TB Dedicated |
| **Interactive Results** | Standard | Advanced Segmental | Full PDF-to-HTML Studio |
| **Two-Person Approval Rule**| Optional | Included | Enforced Institutional |
| **King IV / POPIA Audit** | Basic | Quarterly Automated | Continuous Real-Time |
| **Ethics Hotline** | — | Included | AES-256-GCM Encrypted |
| **Tender Procurement Portal** | — | Included | Statutory CIPC/SARS Validation |
| **Pricing** | Custom Quote | Custom Quote | Custom Quote |

---

## 7. Security & Governance

- **Zero Data Leakage:** Cryptographic and query-level isolation ensures no corporate client can access another client's records.
- **Edge Defense-in-Depth:** HTTP security headers (`HSTS`, `X-Content-Type-Options: nosniff`, `SAMEORIGIN`, `Permissions-Policy`).
- **Audit Trail:** Immutable audit logs track every authentication, content draft, approval, and release with correlation IDs.
- **Disaster Recovery:** Fully automated snapshot backups and restore drills ensuring business continuity.

---

© 2026 Bastion Group. All rights reserved. Strictly confidential enterprise digital platform.
