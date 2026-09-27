# Gold Fields — Digital Flagship Corporate Website Prototype

A modern, authoritative, and accessible corporate website prototype for **Gold Fields Limited**, created using [goldfields.com](https://www.goldfields.com/) as the primary reference.

> **Concept Prototype Notice:** This implementation is a proposed redesign concept built for demonstration and evaluation purposes. It is not an authorized replacement for the official Gold Fields website. All operational, financial, and sustainability metrics are source-grounded in Gold Fields' published disclosures (as of 27 September 2026).

---

## 1. Key Highlights & Architectural Features

- **Authentic Brand Grounding:**
  - Official vector SVG logo (`/assets/gold-fields-logo.svg`) and mobile icon mark.
  - Verified deep navy (`#082B49`), midnight (`#061D32`), mineral gold (`#B79855` / `#C8A064`), warm editorial white (`#F7F6F2`), and forest sustainability green (`#24634D`).
  - Core narrative anchor: **“Creating enduring value beyond mining.”**
- **Verified H1 2026 Reporting & Operations Portfolio:**
  - Includes latest **H1 2026 Results** (published 25 August 2026) and Q1 2026 updates.
  - 9 active mines & projects across 6 countries:
    - **South Africa:** South Deep (underground deep-level mechanized gold, 151 koz H1 production, landmark 5-year wage agreement signed July 2026, 50MW Khanyisa solar plant).
    - **Australia:** Agnew, Granny Smith, Gruyere (50% JV), St Ives.
    - **Ghana:** Tarkwa (90% Gold Fields, 10% Gov of Ghana). *Historical archive note:* Damang formally transferred to the Government of Ghana on 18 April 2026.
    - **Chile:** Salares Norte (high-altitude open pit ramp-up).
    - **Peru:** Cerro Corona (copper-gold porphyry).
    - **Canada:** Windfall Project (50/50 JV with Osisko Mining).
- **Embedded AI Assistant: "Ask Gold Fields":**
  - Persistent right drawer and contextual inline triggers.
  - 6 complete deterministic, source-backed demonstration paths with citations, dates, and action cards.
  - Ethical boundaries: clearly directs whistleblowing to independent **Speak Up** and disclaims speculative financial predictions.
- **Client-Side Tools & Discovery:**
  - **Interactive Global Operations Map:** Custom SVG world map with filterable regional hubs and asset-type switching.
  - **My Report Pack Shortlist:** Local document queue with deterministic `.txt` link and summary index generation.
  - **2030 ESG Target Tracker:** Science-based targets tracking Scope 1 & 2 decarbonization, water recycling (78%), and 100% GISTM tailings conformance.
  - **Country-Specific Supplier Guide:** 5-step compliance and pre-qualification checklist builder with direct links to official procurement portals.

---

## 2. Information Architecture & Routes

| Route | Page Purpose | Key Features |
|---|---|---|
| `/` | Brand Flagship Homepage | Hero, market strip, purpose in action, SVG map, latest results, ESG mosaic, news, careers/suppliers |
| `/about` | Purpose, Strategy & Governance | Purpose narrative, 5 core values, 3 strategic pillars, Executive Committee, 135+ year heritage |
| `/operations` | Global Portfolio Explorer | Filterable map/list, regional breakdown, Damang transfer disclosure |
| `/operations/[slug]` | Reusable Operation Detail | Pre-rendered static pages for all 10 assets (geology, metrics, Khanyisa solar, AI trigger) |
| `/sustainability` | ESG Commitments & Evidence | 2030 targets tracker, TSF/GISTM stewardship, Salares Norte dry stack tailings, Khanyisa solar |
| `/investors` | Results & Shareholder Hub | H1 2026 results booklet, dividend track record, dual listing (JSE/NYSE: GFI), financial calendar |
| `/reports` | Corporate Report Library | Categorized archive, year filters, search, "My Report Pack" builder with export |
| `/media` | News & Releases | Category filters (Media Releases, SENS, Achievements), press contacts |
| `/media/[slug]` | Editorial Article Template | Static articles (wage agreement, H1 results, ISO 55001, solar milestone) |
| `/careers` | People & Work Culture | Culture overview, 6 discipline filters, sample roles with "Demonstration Listing" badges |
| `/suppliers` | Supplier Prequalification | Regional guidance (ZA, GH, AU, AM), compliance checklist, official portal links, Speak Up |
| `/contact` | Regional Contact Directory | Verified regional offices, IR contacts, validated demo enquiry form |
| `/search` | Global Site Search | Full-page indexed search with `?q=` URL synchronization across all content |
| `/design-system` | Design System Inspector | Development route demonstrating tokens, typography, buttons, badges, and card states |

---

## 3. Technology Stack

- **Framework:** Next.js 15.1.7 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS with semantic design variables
- **Icons:** Lucide React
- **Rendering:** Static Site Generation (SSG) for all 30 routes (`generateStaticParams`) ensuring sub-second response times and WCAG 2.2 AA compliance
- **Data Layer:** Typed repository pattern (`ContentRepository`) abstracting source-backed JSON fixtures

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### Installation & Run

```bash
cd goldfields

# Install dependencies (if not already installed)
npm install

# Run development server
npm run dev
# -> Opens http://localhost:3000

# Build production bundle
npm run build

# Start production server
npm run start -- -p 3010
# -> Opens http://localhost:3010
```

---

## 5. Prototype vs. Future Production Integrations

| Feature | Implemented in Concept Prototype | Future Production Roadmap |
|---|---|---|
| **AI Assistant** | Deterministic source-backed engine covering 6 core stakeholder paths; zero API keys required | RAG pipeline connected to authenticated vector index of all historical filing PDFs |
| **Market Data** | Illustrative delayed snapshots (JSE: ZAR 285.50, NYSE: USD 16.20) with disclaimers | Real-time Bloomberg / Refinitiv feed integration |
| **Report Pack** | Client-side shortlist queue with synthesized text index download | Server-side batch ZIP compilation of original signed PDF reports |
| **Careers** | Structured role explorer with labeled demonstration vacancies | Direct API integration with Workday / SuccessFactors recruitment systems |
| **Suppliers** | 5-step preparation checklist builder with official portal redirection | Direct single sign-on (SSO) integration into Coupa and regional ERPs |
| **Contact Form** | Client-side validation confirming demo state without sending data | CRM integration routing enquiries to regional corporate affairs desks |

---

## 6. Brand Audit & Asset Inventory

Consult [BRAND_AUDIT.md](./BRAND_AUDIT.md) for full documentation of verified logo proportions, color measurements, font specifications, operational truth as of 27 September 2026, and asset licensing terms.
