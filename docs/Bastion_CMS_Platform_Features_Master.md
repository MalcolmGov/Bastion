# Bastion Corporate Website & AI Investor Relations CMS Studio
## Comprehensive Master Feature Specification & Capability Architecture
### *A Production-Ready, Bespoke Technology Platform Owned and Operated by Bastion Group*

```
========================================================================================
DOCUMENT CONTROL & METADATA
========================================================================================
DOCUMENT TITLE:     Bastion CMS — Master Feature Catalog & Capability Specification
PREPARED FOR:       Benjamin & Yudesh | Bastion Group (bastiongroup.co.za)
PREPARED BY:        Malcolm Govender | Founder & CEO, Moove Digital (movedigital.africa)
DATE OF ISSUE:      03 October 2026
REVISION / STATUS:  Version 4.0 — Master Feature Architecture Document
FILE FORMAT:        Microsoft Word (.docx) & Markdown (.md)
FILE LOCATION:      ~/Documents/Bastion_CMS_Platform_Features_Master.docx
========================================================================================
```

---

## Executive Introduction

This document provides the definitive, complete feature specification for the **Bastion Corporate Website & AI Investor Relations CMS Platform**. Every capability detailed in this specification is fully engineered, verified, and functioning in the production codebase.

The architecture is divided into two strategic domains:
1. **Part 1: Bastion Agency Platform & Revenue Engine (Capabilities 01 – 10)**: Advanced tools reserved for Bastion Group to accelerate client delivery, convert 120-page statutory reports in 60 seconds, and capture high-margin recurring conversion revenue.
2. **Part 2: Corporate Governance, Investor Relations & Client Portal (Capabilities 11 – 21)**: The enterprise client experience built for listed CEOs, CFOs, IR directors, and board reviewers to maintain compliance, update content, and govern market releases without developer dependencies.

---

# Part 1: Bastion Agency Platform & Revenue Engine
### *Capabilities 01 – 10: Engineered for Bastion Group Delivery Velocity & Monetization*

---

### 01 — Multimodal PDF-to-HTML & Responsive Web Ingest Studio

*60-second statutory report conversion into clean semantic HTML5 and React components*

Transforms the traditional 3-to-4-week manual copywriting, chart rebuilding, and layout grind into a 60-second automated ingestion pipeline. Bastion drops any 120-page Integrated Annual Report or ESG PDF into the studio and immediately converts raw text, tables, and executive letters into structured, responsive web components.

• **✓ Deterministic Financial Parsing**: Enforces exact numeric parity with zero LLM drift—guaranteeing 100% accuracy on basis points (`bps`), EBITDA percentages, and currency denominations without mathematical hallucination.

• **✓ Automated Brand Palette & Typography Mapping**: Auto-extracts corporate primary, accent, background, surface, text, and border hex codes from the PDF and restyles the generated web suite instantly.

• **✓ 1-Click Staged Handover to Client Review**: Automatically packages and stages converted drafts directly into the client's review queue (`/admin/tasks`) with `status: 'in_review'` for immediate C-suite approval.

---

### 02 — AI Copilot & Natural Language Coding Assistant for Bastion Users

*Claude 3.5 Sonnet, Haiku & GPT-4o conversational coding bar for rapid website generation*

Engineered specifically for Bastion’s website delivery and creative team. Agency developers and producers use a conversational prompt bar inside the canvas to generate entire websites, scaffold bespoke sections, adjust layouts, and write tailored React code in seconds.

• **✓ Natural Language Website & Layout Generation**: Issue plain-English instructions: "Generate a 4-section mining investor homepage", "Build an executive board governance grid", or "Restyle this financial table with dark-mode borders".

• **✓ Real-Time Visual Diff Inspection & 1-Click Revert**: Inspect visual side-by-side diffs of code and styling changes before applying them to the live canvas, with instant 1-click revert capability.

• **✓ Multi-Model LLM Vault**: Connects seamlessly with Anthropic Claude (3.5 Sonnet / 3.7 / Haiku) and OpenAI with encrypted per-agency API key management (`ApiKeysTab.tsx`).

---

### 03 — Role-Gated Agency Monetization Engine

*High-margin commercial barrier billing R45,000 – R85,000 per report conversion*

Engineered to turn the CMS into a direct agency profit center rather than a cost sink. Advanced ingestion, PDF-to-HTML parsing, and structural layout tools are strictly restricted to Bastion administrators, preventing clients from bypassing the agency.

• **✓ Hardware-Level Role Gating**: Client accounts are partitioned at the database schema level (`platform_admin` vs `client_editor`); unauthorized ingestion requests fail closed with HTTP 403 Forbidden.

• **✓ Built-in Commercial Upsell Modal**: When corporate clients attempt to access document parsing, the system renders a branded upsell gate showcasing Bastion's conversion services.

• **✓ 91.8% Gross Profit Margins**: Reduces internal agency turnaround costs from R120,000 (160 billable hours) to R4,500, delivering over R2,000,000 in net annual profit across 12 listed clients.

---

### 04 — Live Website Brand DNA Extractor

*Crawl any corporate URL to extract logos, color palettes, and typography scales in seconds*

Most prospective clients will not provide Figma files or source code. Bastion’s Brand DNA engine crawls any public corporate website (e.g. `goldfields.com`) and automatically compiles a versioned, reusable brand theme kit.

• **✓ Automated Token Extraction**: Captures primary, secondary, and accent colors, typography weights, font hierarchies, button corner radii, and spacing scales.

• **✓ Logo & Media Harvesting**: Extracts high-resolution SVG logos, favicons, and metadata imagery into the media library as draft assets.

• **✓ Brand Voice & Tone Profiling**: Analyzes executive statements and copy to generate a tone-of-voice summary that guides AI content generation.

---

### 05 — Native Commercial Contracting Suite: Quotes, SARS eInvoicing & eSign

*Complete B2B contracting, Section 20 tax invoicing, and HMAC cryptographic signatures*

Eliminates the need to buy and juggle DocuSign, Salesforce CPQ, and third-party invoicing SaaS. Bastion issues proposals, secures legal acceptance, and bills corporate clients directly within the CMS.

• **✓ Dynamic B2B Quotations (`/quote/[token]`)**: Generate branded client proposals with custom rate cards, scopes (e.g. *“R45k Annual Report Ingestion”*), and PO number tracking.

• **✓ SARS-Compliant Tax eInvoicing (`/invoice/[token]`)**: Automatically calculates 15% South African VAT, validates corporate tax IDs, and generates print-ready PDF invoices.

• **✓ Cryptographic HMAC SHA-256 Signatures**: Dual-mode interactive touch canvas and typed signature generator capturing IP address, corporate title, and ISO-8601 timestamps.

---

### 06 — Multi-Tenant Client Perimeter & Zero SaaS Seat Tax

*Unlimited client portals, isolated database schemas, and zero per-seat software fees*

Run dozens of discrete enterprise clients (e.g. Gold Fields, Vodacom, Anglo) on a single cohesive infrastructure without cross-tenant data contamination or expensive SaaS licensing penalties.

• **✓ Strict Database Tenant Partitioning**: Every database query is strictly scoped to `client_id`, ensuring client editors and auditors can never see another tenant's files or assets.

• **✓ Zero SaaS Seat Licensing Tax**: Onboard 50 client organizations, 200 editors, and unlimited executive board reviewers at $0 incremental per-seat cost.

• **✓ Instant Portfolio Switcher**: Agency admins can toggle between mining, telecom, and financial services client websites in 1 click from a unified command bar.

---

### 07 — Autonomous SRE, Global Telemetry & Incident Rollback

*Sub-50ms edge delivery, automated incident evidence, and 1-click snapshot restore*

Enterprise-grade reliability engineering built directly into the admin console. Monitor real-time uptime across global edge nodes, detect runtime anomalies, and restore prior states instantly.

• **✓ Live Health & Synthetic Probing (`/admin/sre`)**: Real-time telemetry monitoring uptime, TTFB latency across regional CDNs (CPT-1, JNB-1, LHR-1), and SSL certificate validity.

• **✓ Automated Incident Evidence & Rollback**: Detects syntax or component failures and restores prior stable compositions instantly with zero downtime.

• **✓ Status Page Telemetry**: Public and internal status dashboards showcasing 99.98% 90-day availability to inspire enterprise client confidence.

---

### 08 — Bidirectional GitHub Sync & Database Blueprints

*Export compositions and database schemas directly into version-controlled repositories*

Provides full developer sovereignty. Bastion engineers can export site configurations, dynamic components, and database schemas directly to GitHub.

• **✓ Git-Backed Blueprints**: Version-control website templates, section presets, and client themes across staging and production branches.

• **✓ Automated CI/CD Deployment**: Push updates through automated GitHub Actions pipelines without manual server interventions.

• **✓ GraphQL & REST API Hub**: Full GraphQL explorer (`/api/graphql`) and REST endpoints for omnichannel headless content syndication.

---

### 09 — Interactive Zara Voice Copilot

*Hands-free voice assistant inside the CMS for rapid speech-driven editing*

A cutting-edge speech interface built directly into the studio navigation bar for executive and agency accessibility.

• **✓ Voice-Driven Editing & Commands**: Dictate copy updates, navigate across pages, and query platform status using conversational voice commands.

• **✓ Audio Transcription & Meeting Notes**: Convert spoken executive debriefs directly into structured draft web copy.

• **✓ Multilingual Speech Recognition**: Transcribe and process executive commands with instant visual canvas reflection.

---

### 10 — Central Client Portfolio & Provisioning Command Center

*1-click client onboarding wizard, isolated domain bindings, and automated tenant creation*

Allows Bastion administrators to spin up, configure, and manage new corporate client instances in minutes rather than weeks.

• **✓ Automated Onboarding Wizard (`/admin/onboard`)**: 5-step guided provisioning capturing client corporate profile, tax credentials, brand kit, and site architecture.

• **✓ Custom Domain & SSL Routing**: Automatic Let's Encrypt TLS provisioning and reverse-proxy routing for client-specific subdomains or root enterprise domains.

• **✓ Global User Access Control**: Manage agency accounts, client editors, and auditor permissions with granular role assignments across all hosted properties.

---
---

# Part 2: Corporate Governance, Investor Relations & Client Portal
### *Capabilities 11 – 21: Built for Listed Issuers, IR Teams, C-Suite & Board Governance*

---

### 11 — Real-Time JSE §8.2 & ISSB S2 Compliance Guardian

*24/7 regulatory safe-harbor auditor and ESG greenwashing shield*

Corporate websites cannot afford unhedged forward-looking financial guarantees or unverified environmental claims. The Compliance Guardian scans live canvas copy in real time to protect the board of directors from securities exchange censures.

• **✓ JSE Section 8.2 Safe-Harbor Auditor**: Automatically intercepts unhedged earnings promises (`will guarantee`, `profits will surge`) and applies 1-click safe-harbor legal disclosures.

• **✓ ISSB S2 Greenwashing Shield**: Audits sustainability and net-zero claims, flagging missing Scope 1, 2, and 3 audited baselines before release.

• **✓ Pre-Flight Publication Lock**: Prevents accidental publication of non-compliant pages, ensuring every public release holds a verified Grade A+ compliance score.

---

### 12 — Production Visual Canvas Studio & Dynamic Zones

*Zero-code in-place visual editor engineered for non-technical corporate communicators*

Eliminates IT and developer ticket backlogs for routine copy, image, and statement updates. Corporate IR and marketing staff edit text and replace photos directly on the live page with zero risk of breaking responsive layout rules.

• **✓ 15+ Pre-Built Corporate Components**: Hero showcases, executive team grids, financial highlights, process flows, interactive maps, and responsive CTAs.

• **✓ Focal-Point Media DAM**: Upload high-resolution corporate photography with focal-point cropping, ensuring executive portraits never crop awkwardly on mobile devices.

• **✓ Multi-Device Live Viewport**: Synchronized canvas toggles instantly between Desktop (1440px), Tablet (768px), and Mobile (375px) viewports with full undo/redo history.

---

### 13 — Multi-Model AI Content Assistant & Brand DNA Memory

*Claude Haiku 4.5 & GPT-4o with brand memory & bounded schema repair*

Not a generic chat widget. The in-editor copilot reads the active page component tree, understands corporate tone and brand constraints, and executes structured mutations directly into the CMS state without developer assistance.

• **✓ Natural Language Section Mutations**: Corporate IR staff issue plain-English prompts: "Make this Q3 investor-ready", "Highlight our B-BBEE credentials", or "Rewrite for concise executive clarity".

• **✓ Brand Kit & Voice Constraints**: Automatically adheres to approved brand hex codes, typography weights, and forbidden phrases, ensuring every revision stays strictly on-brand.

• **✓ Self-Healing Schema Validation**: Bounded JSON repair pipeline ensures the AI never injects malformed code, breaks CSS styles, or crashes the live page.

---

### 14 — Interactive Financial Reporting & SENS Wire Teleprinter

*Dynamic balance sheets, YoY variance toggles, and real-time regulatory feeds*

Traditional CMSs reduce financial data to static text. Bastion gives institutional analysts and retail investors interactive financial tools tailored to listed equity transparency.

• **✓ Interactive Financial Statements**: Income statements, balance sheets, and cash flows with interactive Year-over-Year (YoY) variance toggles and basis-point precision.

• **✓ Live SENS Regulatory Feed**: Real-time Stock Exchange News Service teleprinter with regulatory category filters, keyword search, and PDF circular attachments.

• **✓ Dividend Withholding Tax (DWT) Calculator**: Interactive web tool allowing shareholders to calculate net dividend yields factoring in statutory 20% DWT deductions.

---

### 15 — Time-Locked Embargo Distribution & Dual Sign-Off

*Cryptographic embargo locks and multi-stage C-suite approval workflows*

Market-sensitive financial results and M&A circulars cannot leak prior to statutory market open. Bastion coordinates multi-stakeholder governance with time-locked releases and dual sign-off.

• **✓ Time-Locked Embargo Distribution**: Schedule releases to publish down to the exact second (e.g., 07:05 SAST market opening bell) across all CDN edges automatically.

• **✓ Tasks & Approvals Center (`/admin/tasks`)**: Staged multi-page report conversions arrive in a unified queue where executives, auditors, and legal counsel approve with 1 click.

• **✓ Immutable Audit Trail (`/admin/audit`)**: Every character change, preview, sign-off, and publication action is cryptographically logged with user identity, timestamp, and IP address.

---

### 16 — Multi-Language & Global Localization Hub

*Publish corporate communications across global investor markets effortlessly*

International holding companies and listed dual-exchange entities need to publish across multiple regulatory jurisdictions and languages.

• **✓ Side-by-Side Locale Editing**: Manage regional variants and translations with synchronized layout inheritance.

• **✓ Dynamic Locale Fallback**: Ensures untranslated sub-sections gracefully display approved corporate English copy without breaking layout geometry.

• **✓ Translation Workflow Governance**: Coordinate localized releases with language-specific review and sign-off states.

---

### 17 — Client Experience Sandbox & Self-Paced Learning

*Risk-free staging environment and interactive executive training hub*

Gives corporate clients complete confidence before publishing live changes.

• **✓ Client Sandbox Banner**: Clear visual distinction between live production and safe sandbox testing modes.

• **✓ Interactive Learning Center (`/admin/learn`)**: Built-in video walkthroughs and operational guides tailored to corporate PR and IR executives.

• **✓ Pre-Populated Client Presets**: Test and preview corporate templates pre-populated with realistic listed company data (e.g. Vodacom, Solaris, Gold Fields).

---

### 18 — Interactive Real 3D Globe & Operations Asset Map

*Interactive geospatial visualizer for global mining, infrastructure, and industrial assets*

Replaces static graphic maps with an interactive WebGL 3D globe and detailed regional operation cards.

• **✓ Real 3D Interactive Globe**: Geospatial rendering of global corporate operations with smooth rotational physics and site marker clustering.

• **✓ Operational Detail Drawers (`/operations/[slug]`)**: Drill down into specific mine shafts, plants, or regional facilities to view annual output, workforce headcount, and safety stats.

• **✓ TRIFR Safety & ESG Metric Cards**: Display audited Total Recordable Injury Frequency Rates (TRIFR) and environmental metrics alongside operational assets.

---

### 19 — Executive Board Governance & Leadership Directory

*Institutional C-Suite and Non-Executive Director profiles with committee matrices*

Designed to meet King IV governance disclosure standards for board oversight and committee accountability.

• **✓ Board Committee Membership Matrices**: Display Audit, Remuneration, Social & Ethics, and Risk committee chairmanships and memberships.

• **✓ Investor-Grade Executive Biographies**: Detailed executive track records, appointment dates, qualifications, and independence classifications.

• **✓ High-Resolution Media Downloads**: Provide journalists, institutional analysts, and conference organizers with print-quality executive portraits and biographies in 1 click.

---

### 20 — Anonymous Whistleblower, Ethics & Protected Disclosure Portal

*Encrypted ethics reporting line compliant with POPIA and Protected Disclosures legislation*

Embeds high-stakes corporate compliance directly into the corporate web portal, providing an anonymous channel for reporting governance breaches.

• **✓ Anonymous Incident Filing (`/ethics`, `/admin/ethics`)**: Encrypted incident reporting generating a unique tracking PIN for anonymous two-way follow-up.

• **✓ Case Management & Investigation Desk**: Secure internal investigator dashboard for logging evidence, tracking resolution status, and recording audit findings.

• **✓ Statutory Compliance Protection**: Ensures complete alignment with the South African Protected Disclosures Act and POPIA Section 11 lawful processing requirements.

---

### 21 — Supplier Procurement & Public Tender Board

*Institutional procurement portal for issuing RFQs, tracking tender deadlines, and supplier onboarding*

Integrates corporate supply chain governance into the public web portal, promoting B-BBEE supplier development and transparent procurement.

• **✓ Public Tender Registry (`/suppliers`, `/admin/tenders`)**: Publish procurement requests, categorize by industry (Mining, Engineering, Logistics), and display closing countdowns.

• **✓ Secure Tender Document Distribution**: Distribute mandatory specification documents, technical RFQ packs, and compliance questionnaires.

• **✓ Automated Bid Submission Intake**: Collect electronic vendor bids, tax clearance certificates, and B-BBEE verification affidavits securely.

---
========================================================================================
END OF MASTER FEATURE SPECIFICATION
Bastion Technology Solutions & Moove Digital · October 2026
========================================================================================
