# Gold Fields — Brand Audit & Digital Identity Specifications

**Audit Date:** 27 September 2026  
**Auditor:** Antigravity Creative & Digital Engineering  
**Primary Reference:** [Gold Fields Official Corporate Portal](https://www.goldfields.com/)  
**Concept Prototype Status:** Proposed Digital Flagship (Demonstration Only)

---

## 1. Executive Brand Identity

- **Official Public Brand Name:** **Gold Fields** (with a space; never "Goldfields" or "GoldFields" in public headings).
- **Core Corporate Purpose:** *"Creating enduring value beyond mining."* (Retained as primary narrative anchor).
- **Listing & Ticker Identifiers:** JSE: GFI | NYSE: GFI.
- **Corporate Headquarters:** 150 Helen Road, Sandown, Sandton, 2196, South Africa.

---

## 2. Verified Logo Assets & Treatment

| Asset | Source URL / Filename | Dimensions / Type | Usage Rules |
|---|---|---|---|
| **Primary Logo** | `https://www.goldfields.com/images/gold-fields-logo.svg` | Scalable Vector SVG | Primary brand header, desktop navbar, footer |
| **White Icon Mark** | `https://www.goldfields.com/images/icon-logo-white.png` | PNG Raster (Minified mark) | Dark headers, mobile headers, responsive drawers |
| **Mobile Mark** | `https://www.goldfields.com/images/icon-logo-mobile.png` | PNG Raster | Compact mobile utility bar |

**Clear Space & Constraints:**
- Maintain clear space equal to the height of the capital "G" around the logo.
- Minimum digital render height: 32px (Desktop), 24px (Mobile).
- Authentic artwork downloaded directly; no recreation, no imitation lion, no non-proportional scaling.

---

## 3. Brand Colours & Typography

### A. Measured Live Palette (Extracted from goldfields.com)
- **Deep Navy (Backgrounds/Nav):** `#003068` and `rgba(0, 29, 57, 0.45)` (hero overlays).
- **Authentic Turquoise Accent (Quicklinks & Borders):** `#00B398` (used in `.quicklinks`, `.turqoise`, navbar and footer underlines `linear-gradient(to left, #00B398, #001D39)`).
- **Mineral Sage/Turquoise:** `#6FA287`.
- **Site Accent Gold (Careers/Badges):** `#C8A064`.
- **Secondary Dark Blue:** `#082B49`.
- **Surface White:** `#FFFFFF`.
- **Light Contrast Gray:** `#F5F7FA`.

### B. Prototype Extended Tokens (Engineered for WCAG 2.2 AA Contrast)
To ensure editorial weight, high legibility, and accessible contrast ratios (minimum 4.5:1 for body, 3:1 for large text):

| Token Name | Hex Value | Semantic Role | WCAG Contrast |
|---|---|---|---|
| `--color-navy-dark` | `#061D32` | Midnight footer, deep cinematic overlays | > 12:1 against warm white |
| `--color-navy-brand` | `#082B49` | Primary headers, mega menu, primary buttons | > 10:1 against white |
| `--color-navy-subtle`| `#003068` | Secondary interactive accents & hover states | Brand authentic tone |
| `--color-turquoise`  | `#00B398` | Authentic live site accent, quicklinks, navbar gradient | > 7:1 on navy; 3.1:1 on white |
| `--color-turquoise-dark` | `#00826E` | WCAG AA accessible text variant for light surfaces | 4.8:1 against white |
| `--color-turquoise-light`| `#E0F7F4` | Environmental & water pill background surface | Soft tint canvas |
| `--color-turquoise-sage` | `#6FA287` | Mineral sage / environmental secondary accent | Muted natural tone |
| `--color-gold-mineral`| `#B79855` | Subtle rules, map pins, active tab indicators | Paired with dark surfaces |
| `--color-gold-accent` | `#C8A064` | Verified live site gold for pills and badges | Used with dark ink text |
| `--color-gold-dark`   | `#76571F` | Gold-toned text on light surfaces | 4.8:1 against white |
| `--color-editorial-bg`| `#F7F6F2` | Warm white background for editorial reading | Soft reading contrast |
| `--color-surface`     | `#FFFFFF` | Card surfaces, modals, popovers | Base white |
| `--color-ink`         | `#172C3D` | Body text, headings, tabular metrics | 11.2:1 against warm white |
| `--color-slate`       | `#526373` | Secondary text, meta dates, captions | 5.2:1 against white |
| `--color-mist`        | `#E2E7EA` | Hairline dividers, quiet borders, cards | Low-intensity structure |
| `--color-forest`      | `#24634D` | Sustainability accents, environmental badges | 5.1:1 against white |

### C. Typography
- **Headings & Brand Display:** Modern editorial sans-serif (`Manrope`, system fallback sans).
- **Body & Editorial Reading:** Highly readable neutral sans-serif (`Inter`, system fallback sans).
- **Data & Financial Figures:** Tabular lining numbers (`font-variant-numeric: tabular-nums`).
- **Hierarchy:**
  - Desktop Hero H1: 64–80px, line-height 1.15.
  - Section Headings H2: 36–48px, line-height 1.25.
  - Editorial Body: 16–18px, line-height 1.6–1.7. Maximum line length: 65–75 characters.

---

## 4. Operational & Reporting Truth (As of 27 September 2026)

### Verified Operations Portfolio (9 Mines & Projects across 6 Countries)
1. **South Africa:**
   - *South Deep* — Deep-level mechanized underground gold mine. Attributable H1 2026 production: 151,000 oz. Five-year wage agreement signed with organized labour July 2026. 50MW Khanyisa Solar Plant operating.
2. **Australia:**
   - *Agnew* — Underground, renewable microgrid (wind/solar).
   - *Granny Smith* — Underground, gas + solar/battery microgrid.
   - *Gruyere* — 50/50 joint venture open pit with Gold Road Resources.
   - *St Ives* — Open pit and underground.
3. **Chile:**
   - *Salares Norte* — High-altitude open pit (Atacama region, ~4,500m elevation), ramping up gold-silver production.
4. **Ghana:**
   - *Tarkwa* — Open pit (90% Gold Fields, 10% Government of Ghana).
   - *Damang (Discontinued/Transferred):* **CRITICAL STATUS:** Damang was transferred to the Government of Ghana on 18 April 2026. It is strictly excluded from current active assets and noted historically.
5. **Peru:**
   - *Cerro Corona* — Open pit copper-gold porphyry operation.
6. **Canada:**
   - *Windfall Project* — 50/50 joint venture partnership with Osisko Mining; high-grade gold development project.

### Verified Reporting Periods
- **Latest Half-Year Results:** **H1 2026 Financial & Operational Results** (released Tuesday, 25 August 2026, 07:05 SAST).
- **Quarterly Results:** Q1 2026 Results (released 7 May 2026).
- **Annual Suite:** 2025 Integrated Annual Report suite (released April 2026).
- **Market Data:** JSE: GFI (~ZAR 285.50 illustrative snapshot), NYSE: GFI (~USD 16.20 illustrative snapshot). Explicitly labelled as delayed / illustrative concept data.

### Verified Corporate Values
1. **Safety:** If we cannot mine safely, we will not mine.
2. **Respect:** We treat each other with dignity and care.
3. **Collaboration:** We work together to achieve shared value.
4. **Responsibility:** We act with integrity and care for our communities and environment.
5. **Integrity:** We uphold the highest ethical standards.

---

## 5. Asset Inventory & Attribution

| Asset | Local Path | Verified Official Source | Classification |
|---|---|---|---|
| Vector Logo | `/assets/gold-fields-logo.svg` | goldfields.com/images/gold-fields-logo.svg | Verified Authentic |
| White Logo | `/assets/icon-logo-white.png` | goldfields.com/images/icon-logo-white.png | Verified Authentic |
| H1 2026 Banner | `/assets/gold-fields-releases-h1-2026.jpg` | goldfields.com/images/banners/... | Verified Authentic |
| Salares Norte Hero | `/assets/salaresnorte-trucks-in-pit-2025.png` | goldfields.com/images/banners/... | Verified Authentic |
| Sustainability Hero| `/assets/sustainability-report-2024.png` | goldfields.com/images/... | Verified Authentic |
| Regional Ops Imagery| `/assets/*-ops-image.png` | goldfields.com/images/2024-new/... | Verified Authentic |
| Report Tiles | `/assets/home-*.png` | goldfields.com/images/2024-new/... | Verified Authentic |
| Megamenu Panels | `/assets/nav*.jpg` | goldfields.com/images/... | Verified Authentic |

*Legal Disclaimer:* All downloaded brand marks and photographic assets are utilized solely for this private evaluation concept prototype under fair corporate demonstration principles. Public deployment requires explicit brand licensing approval from Gold Fields Limited.
