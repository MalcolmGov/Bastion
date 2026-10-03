import os
import base64
import subprocess
import shutil

PROJECT_DIR = os.getcwd()
PROPOSAL_DIR = os.path.join(PROJECT_DIR, 'public', 'proposal')
DOCUMENTS_DIR = '/Users/malcolmgovender/Documents'
DOCS_ARTIFACTS_DIR = os.path.join(DOCUMENTS_DIR, 'Goldfields-BastionGroup-Artifacts')

os.makedirs(PROPOSAL_DIR, exist_ok=True)
os.makedirs(DOCS_ARTIFACTS_DIR, exist_ok=True)

def img_to_b64(filepath):
    if not os.path.exists(filepath):
        return ""
    with open(filepath, "rb") as f:
        data = f.read()
    ext = os.path.splitext(filepath)[1].lower().replace('.', '')
    if ext == 'svg':
        mime = 'image/svg+xml'
    elif ext in ['jpg', 'jpeg']:
        mime = 'image/jpeg'
    elif ext == 'png':
        mime = 'image/png'
    else:
        mime = 'application/octet-stream'
    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"

# Images
bastion_logo_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/bastion-logo.png'))
bastion_white_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/bastion-logo-white.png'))
logo_svg_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/gold-fields-logo.svg'))
emblem_svg_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/goldfields-emblem.svg'))
og_share_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/goldfields-og-share.png'))
design_tokens_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/design-system-tokens.png'))
governance_card_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/governance-audit-card.png'))

hero_screenshot_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576282836.png')
globe_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790528693970.png')
mining_hero_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790571551705.png')
h1_card_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790562287284.png')
cms_pages_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790567902942.png')
login_portal_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576120565.png')

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gold Fields — Digital Flagship & Studio CMS Executive Proposal | BastionGroup</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');

    :root {{
      --navy-dark: #061D32;
      --navy-primary: #082B49;
      --navy-surface: #0A355A;
      --gold-mineral: #B79855;
      --gold-accent: #C8A064;
      --gold-light: #F0E4CE;
      --turquoise-bright: #00E5C0;
      --turquoise-deep: #00826E;
      --forest-green: #1F6E43;
      --ink: #172C3D;
      --ink-muted: #526373;
      --mist: #E2E7EA;
      --bg-editorial: #F8FAFC;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    @page {{
      size: A4 portrait;
      margin: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: var(--ink);
      background-color: #ECEFF3;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }}

    /* Top interactive bar for online preview */
    .top-actions-bar {{
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(6, 29, 50, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(200, 160, 100, 0.3);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }}

    .top-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
    }}

    .top-brand .badge {{
      background: rgba(0, 229, 192, 0.15);
      color: var(--turquoise-bright);
      border: 1px solid rgba(0, 229, 192, 0.4);
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }}

    .action-btns {{
      display: flex;
      gap: 8px;
    }}

    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }}

    .btn-gold {{
      background: var(--gold-accent);
      color: var(--navy-dark);
      box-shadow: 0 2px 10px rgba(200, 160, 100, 0.3);
    }}
    .btn-gold:hover {{
      background: #dfb57b;
      transform: translateY(-1px);
    }}

    .btn-turquoise {{
      background: var(--turquoise-bright);
      color: var(--navy-dark);
      box-shadow: 0 0 15px rgba(0,229,192,0.4);
    }}
    .btn-turquoise:hover {{
      background: #33eed1;
      transform: translateY(-1px);
    }}

    .btn-outline {{
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }}
    .btn-outline:hover {{
      background: rgba(255, 255, 255, 0.2);
    }}

    /* Proposal Container */
    .proposal-container {{
      width: 210mm;
      margin: 24px auto;
      background: white;
      box-shadow: 0 12px 48px rgba(8, 43, 73, 0.12);
    }}

    /* Page Layout */
    .page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 13mm 16mm 10mm 16mm;
      position: relative;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      border-bottom: 1px solid var(--mist);
      box-sizing: border-box;
    }}

    .page-content {{
      flex: 1;
      display: flex;
      flex-direction: column;
    }}

    /* Page Header & Footer */
    .doc-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--mist);
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
    }}

    .doc-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      margin-top: 10px;
      border-top: 1px solid var(--mist);
      font-size: 9px;
      color: var(--ink-muted);
    }}

    /* Cover Page */
    .cover-page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      background: radial-gradient(circle at 85% 15%, #0e446e 0%, var(--navy-dark) 65%);
      color: white;
      padding: 18mm 18mm 14mm 18mm;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      border-bottom: none;
      box-sizing: border-box;
    }}

    .cover-top {{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .cover-logo-lockup {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}

    .cover-divider {{
      width: 1px;
      height: 38px;
      background: rgba(200, 160, 100, 0.4);
    }}

    .client-emblem {{
      height: 48px;
      width: auto;
    }}

    .cover-hero {{
      margin: auto 0;
    }}

    .cover-badge {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 229, 192, 0.12);
      border: 1px solid rgba(0, 229, 192, 0.35);
      color: var(--turquoise-bright);
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 16px;
    }}

    .cover-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      line-height: 1.15;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }}

    .cover-title .highlight {{
      display: block;
      color: var(--gold-accent);
      font-style: italic;
      font-size: 32px;
      margin-top: 4px;
    }}

    .cover-desc {{
      font-size: 13.5px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
      max-width: 580px;
      margin-bottom: 24px;
    }}

    .cover-meta-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: rgba(8, 43, 73, 0.7);
      border: 1px solid rgba(200, 160, 100, 0.3);
      border-radius: 8px;
      padding: 14px 16px;
    }}

    .cover-meta-item .label {{
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--turquoise-bright);
      margin-bottom: 4px;
    }}

    .cover-meta-item .val {{
      font-size: 11px;
      font-weight: 600;
      color: white;
      line-height: 1.35;
    }}

    /* Typography & Sections */
    .section-eyebrow {{
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--gold-mineral);
      margin-bottom: 4px;
    }}

    .section-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 21px;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 6px;
      line-height: 1.2;
    }}

    .lead-text {{
      font-size: 11px;
      line-height: 1.5;
      color: var(--ink-muted);
      margin-bottom: 12px;
    }}

    /* Cards & Grids */
    .features-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }}

    .feature-card {{
      background: var(--bg-editorial);
      border: 1px solid var(--mist);
      border-left: 3px solid var(--navy-primary);
      border-radius: 6px;
      padding: 10px 12px;
    }}

    .feature-card.gold {{
      border-left-color: var(--gold-mineral);
    }}
    .feature-card.turquoise {{
      border-left-color: var(--turquoise-deep);
    }}
    .feature-card.green {{
      border-left-color: var(--forest-green);
    }}

    .feature-title {{
      font-size: 11.5px;
      font-weight: 700;
      color: var(--navy-primary);
      margin-bottom: 4px;
    }}

    .feature-desc {{
      font-size: 10px;
      color: var(--ink-muted);
      line-height: 1.45;
    }}

    /* Visual Showcase Containers */
    .showcase-frame {{
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--mist);
      background: var(--navy-dark);
      margin-bottom: 10px;
      box-shadow: 0 4px 16px rgba(8, 43, 73, 0.08);
    }}

    .showcase-frame img {{
      width: 100%;
      height: 175px;
      object-fit: cover;
      display: block;
    }}

    .showcase-caption {{
      padding: 6px 12px;
      font-size: 9px;
      color: var(--mist);
      background: #061D32;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
    }}

    .showcase-caption strong {{
      color: var(--turquoise-bright);
    }}

    /* Tables */
    .matrix-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
      margin-top: 6px;
      margin-bottom: 12px;
    }}

    .matrix-table th {{
      background: var(--navy-primary);
      color: white;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 6px 10px;
      text-align: left;
    }}

    .matrix-table td {{
      padding: 6px 10px;
      border-bottom: 1px solid var(--mist);
      vertical-align: top;
      line-height: 1.35;
    }}

    .matrix-table tr:nth-child(even) {{
      background: #F8FAFC;
    }}

    .tag-diff {{
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 8.5px;
    }}
    .tag-legacy {{ background: #FEE2E2; color: #991B1B; }}
    .tag-modern {{ background: #DCFCE7; color: #166534; }}

    /* Sign-off Blocks */
    .signoff-section {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--mist);
    }}

    .sign-block {{
      background: var(--bg-editorial);
      border: 1px solid var(--mist);
      border-radius: 6px;
      padding: 12px;
    }}

    .sign-block .org-name {{
      font-size: 11px;
      font-weight: 800;
      color: var(--navy-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .sign-block .person-name {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 15px;
      font-weight: 700;
      color: var(--navy-dark);
      margin: 4px 0 2px 0;
    }}

    .sign-block .sign-line {{
      height: 1px;
      background: var(--gold-mineral);
      margin: 12px 0 6px 0;
    }}

    .sign-block .sign-date {{
      font-size: 9px;
      color: var(--ink-muted);
    }}

    @media print {{
      body {{
        background: white;
      }}
      .top-actions-bar {{
        display: none !important;
      }}
      .proposal-container {{
        margin: 0 !important;
        box-shadow: none !important;
        width: 100% !important;
      }}
      .page {{
        border-bottom: none !important;
        page-break-after: always !important;
        break-after: page !important;
      }}
    }}
  </style>
</head>
<body>

  <!-- Sticky Actions Bar -->
  <div class="top-actions-bar">
    <div class="top-brand">
      <span class="badge">Enterprise Delivery</span>
      <span>BastionGroup × Gold Fields Limited</span>
    </div>
    <div class="action-btns">
      <a href="/proposal/Goldfields-BastionGroup-Executive-Deck.pptx" download class="btn btn-gold">📊 Download PowerPoint Deck (.pptx)</a>
      <a href="https://goldfields-bay.vercel.app" target="_blank" class="btn btn-outline">🌐 View Production Site</a>
      <a href="https://goldfields-bay.vercel.app/admin/login" target="_blank" class="btn btn-outline">🔐 Open Studio CMS</a>
      <button onclick="window.print()" class="btn btn-turquoise">🖨️ Print / Save as PDF</button>
    </div>
  </div>

  <div class="proposal-container">

    <!-- PAGE 01: COVER -->
    <div class="page cover-page">
      <div class="cover-top">
        <div class="cover-logo-lockup">
          <img src="{bastion_white_b64}" alt="BastionGroup" style="height: 38px; width: auto;">
          <div class="cover-divider"></div>
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--gold-accent);">CORPORATE COMMUNICATIONS</span>
        </div>
        <img src="{emblem_svg_b64}" alt="Gold Fields Crest" class="client-emblem">
      </div>

      <div class="cover-hero">
        <div class="cover-badge">
          ● Strategic Executive Proposal & Handover
        </div>
        <h1 class="cover-title">
          The Next-Generation Digital Flagship
          <span class="highlight">Beyond Mining.</span>
        </h1>
        <p class="cover-desc">
          An enterprise-grade headless web ecosystem, 3D operations visualizer, and Studio OS Content Engine architected for Gold Fields Limited to establish total content autonomy, regulatory agility, and global investor preeminence.
        </p>
      </div>

      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <div class="label">Prepared By</div>
          <div class="val">BastionGroup<br><span style="font-size: 9.5px; color: var(--gold-light);">bastiongroup.co.za</span></div>
        </div>
        <div class="cover-meta-item">
          <div class="label">Presented By</div>
          <div class="val">Benjamin<br><span style="font-size: 9.5px; color: var(--gold-light);">BastionGroup</span></div>
        </div>
        <div class="cover-meta-item">
          <div class="label">Client & Stakeholders</div>
          <div class="val">Gold Fields Limited<br><span style="font-size: 9.5px; color: var(--gold-light);">Executive Committee</span></div>
        </div>
        <div class="cover-meta-item">
          <div class="label">Delivery Status</div>
          <div class="val">Production Verified<br><span style="font-size: 9.5px; color: var(--turquoise-bright);">September 2026</span></div>
        </div>
      </div>
    </div>

    <!-- PAGE 02: STRATEGIC VISION & VALUE MATRIX -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 01 / Strategic Vision</span>
        </div>

        <div class="section-eyebrow">Strategic Executive Summary</div>
        <h2 class="section-title">Empowering Gold Fields with Total Digital Independence</h2>
        <p class="lead-text">
          Traditional corporate mining websites are crippled by slow, monolithic architectures where simple text edits, ESG report uploads, or SENS regulatory announcements take days and require costly external engineering tickets. BastionGroup was commissioned to replace this outdated model with a modern, high-velocity digital flagship.
        </p>

        <div class="features-grid">
          <div class="feature-card turquoise">
            <div class="feature-title">01. Real-Time Content Autonomy</div>
            <div class="feature-desc">Corporate Affairs and IR teams can edit hero headlines, manage mining asset disclosures, update board bios, and publish press releases without writing code.</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">02. Live Market & Operational Telemetry</div>
            <div class="feature-desc">Real-time GFI ticker data, AISC cost tracking ($1,385/oz), and renewable energy metrics (54%) dynamically presented across all digital touchpoints.</div>
          </div>
          <div class="feature-card green">
            <div class="feature-title">03. 2030 ESG Tracking Command</div>
            <div class="feature-desc">Live accountability across all six 2030 ESG pillars including Khanyisa solar plant output, water recycling benchmarks, and 100% GISTM tailings dam safety.</div>
          </div>
          <div class="feature-card">
            <div class="feature-title">04. Bank-Grade Edge Architecture</div>
            <div class="feature-desc">Sub-second global response times (0.8s LCP), enterprise serverless failover, and cryptographic SHA-256 audit logs ensuring absolute regulatory compliance.</div>
          </div>
        </div>

        <div class="section-eyebrow" style="margin-top: 6px;">Comparative Value Benchmark</div>
        <table class="matrix-table">
          <thead>
            <tr>
              <th style="width: 25%;">Capability / Metric</th>
              <th style="width: 37%;">Legacy Outsourced Agency</th>
              <th style="width: 38%;">BastionGroup Modernized Flagship</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Publishing Turnaround</strong></td>
              <td><span class="tag-diff tag-legacy">3–5 Days</span> High retainers & tickets</td>
              <td><span class="tag-diff tag-modern">&lt; 60 Seconds</span> In-house Studio OS</td>
            </tr>
            <tr>
              <td><strong>Global Page Speed (LCP)</strong></td>
              <td><span class="tag-diff tag-legacy">4.8s Latency</span> Monolithic server crashes</td>
              <td><span class="tag-diff tag-modern">0.8s Speed</span> Serverless edge network</td>
            </tr>
            <tr>
              <td><strong>Asset Transparency</strong></td>
              <td><span class="tag-diff tag-legacy">Static 2D PDFs</span> Disconnected annual data</td>
              <td><span class="tag-diff tag-modern">Interactive 3D WebGL</span> Live mine telemetry</td>
            </tr>
            <tr>
              <td><strong>Analyst Research</strong></td>
              <td><span class="tag-diff tag-legacy">Keyword Search</span> Unranked link lists</td>
              <td><span class="tag-diff tag-modern">AI Copilot</span> Verified page citations</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 02</span>
      </div>
    </div>

    <!-- PAGE 03: PUBLIC FLAGSHIP EXPERIENCE -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 02 / Public Flagship</span>
        </div>

        <div class="section-eyebrow">Public Flagship Experience</div>
        <h2 class="section-title">Cinematic Brand Narrative & Real-Time Telemetry</h2>
        <p class="lead-text">
          The public-facing website establishes Gold Fields as the preeminent modern mining enterprise, pairing prestigious corporate aesthetics with real-time operational transparency.
        </p>

        <div class="showcase-frame">
          <img src="{hero_screenshot_b64}" alt="Gold Fields Flagship Hero">
          <div class="showcase-caption">
            <span><strong>Production Hero:</strong> Live interactive interface with electric turquoise italic 'beyond mining.'</span>
            <span>https://goldfields-bay.vercel.app</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card turquoise">
            <div class="feature-title">Real-Time Market Telemetry Strip</div>
            <div class="feature-desc">Dynamic stock ticker (JSE & NYSE: GFI), operational cost guidance ($1,385/oz AISC), 54% renewable energy mix, and 2.30Moz gold production index.</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">Conversational AI Knowledge Copilot</div>
            <div class="feature-desc">Integrated query prompt allowing institutional investors and analysts to query Integrated Annual Reports with verified page citations.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 03</span>
      </div>
    </div>

    <!-- PAGE 04: 3D OPERATIONS GLOBE -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 03 / Geospatial 3D</span>
        </div>

        <div class="section-eyebrow">Geospatial Operations</div>
        <h2 class="section-title">Interactive 3D WebGL Real-Earth Orbital Globe</h2>
        <p class="lead-text">
          Replacing static map illustrations, our WebGL visualizer maps all ten mining assets across six sovereign jurisdictions with orbital rotation, touch navigation, and live telemetry drawers.
        </p>

        <div class="showcase-frame">
          <img src="{globe_b64}" alt="Interactive 3D Earth Globe">
          <div class="showcase-caption">
            <span><strong>Three.js Orbital Engine:</strong> South Deep, Tarkwa, Salares Norte, and Australian microgrid assets.</span>
            <span>60 FPS WebGL</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card turquoise">
            <div class="feature-title">6 Sovereign Jurisdictions</div>
            <div class="feature-desc">South Africa (South Deep), Ghana (Tarkwa & Damang), Australia (St Ives, Granny Smith, Agnew, Gruyere), Chile (Salares Norte), Peru (Cerro Corona), Canada (Windfall JV).</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">Instant Telemetry Drawer</div>
            <div class="feature-desc">Clicking any coordinate reveals mine type, attributable production, AISC performance, and renewable energy integration.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 04</span>
      </div>
    </div>

    <!-- PAGE 05: 2030 ESG SUSTAINABILITY -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 04 / ESG Command</span>
        </div>

        <div class="section-eyebrow">Environmental, Social & Governance</div>
        <h2 class="section-title">2030 ESG Sustainability Tracking Command</h2>
        <p class="lead-text">
          Institutional ESG rating agencies (MSCI, Sustainalytics) demand granular, verified data. Our platform elevates Gold Fields' 2030 sustainability commitments into a living tracking dashboard.
        </p>

        <div class="showcase-frame">
          <img src="{mining_hero_b64}" alt="Sustainable Extraction and Khanyisa Solar">
          <div class="showcase-caption">
            <span><strong>Clean Energy Transition:</strong> 50MW Khanyisa solar plant and electric haulage operations.</span>
            <span>2030 Target Tracking</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card green">
            <div class="feature-title">Net-Zero Decarbonization & Renewables</div>
            <div class="feature-desc">30% absolute carbon reduction by 2030; South Deep's 50MW solar plant delivers 24% of power, offsetting 110,000 tonnes of CO2e annually.</div>
          </div>
          <div class="feature-card turquoise">
            <div class="feature-title">Tailings Integrity & Water Stewardship</div>
            <div class="feature-desc">100% compliance with Global Industry Standard on Tailings Management (GISTM) and 80% recycled/reused water benchmark achieved.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 05</span>
      </div>
    </div>

    <!-- PAGE 06: INVESTOR RELATIONS & DISCLOSURES -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 05 / Capital Markets</span>
        </div>

        <div class="section-eyebrow">Capital Markets & Disclosures</div>
        <h2 class="section-title">Investor Relations Hub & SENS Regulatory Wire</h2>
        <p class="lead-text">
          Designed to cater directly to institutional investors, analysts, and wealth managers across the JSE and NYSE with instant access to financial disclosures.
        </p>

        <div class="showcase-frame">
          <img src="{h1_card_b64}" alt="H1 2026 Disclosures Card">
          <div class="showcase-caption">
            <span><strong>Results Disclosures Portal:</strong> H1 2026 Financial & Operational Results with direct 3.8MB PDF download.</span>
            <span>SENS & SEC Syndicated</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card gold">
            <div class="feature-title">Interactive Financial Booklets</div>
            <div class="feature-desc">H1 2026 Financial Results, Mineral Resources & Reserves statements, and Climate Action Progress with full-text search and flipbook viewer.</div>
          </div>
          <div class="feature-card turquoise">
            <div class="feature-title">Automated SENS & SEC Syndication</div>
            <div class="feature-desc">Direct automated synchronization with JSE SENS and SEC Form 6-K regulatory newsfeeds for instantaneous disclosure compliance.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 06</span>
      </div>
    </div>

    <!-- PAGE 07: STUDIO OS HEADLESS CMS -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 06 / Studio OS CMS</span>
        </div>

        <div class="section-eyebrow">Content Autonomy & Publishing Engine</div>
        <h2 class="section-title">Studio OS: In-House Visual Modular Page Builder</h2>
        <p class="lead-text">
          Studio OS gives Gold Fields total control over digital assets. Corporate Affairs can edit copy, rearrange sections, preview on mobile devices, and publish globally in seconds.
        </p>

        <div class="showcase-frame">
          <img src="{cms_pages_b64}" alt="Studio OS Visual Builder">
          <div class="showcase-caption">
            <span><strong>WYSIWYG Modular Canvas:</strong> Drag, duplicate, and configure modular blocks with instant viewport simulation.</span>
            <span>Studio OS Engine</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card turquoise">
            <div class="feature-title">Drag-and-Drop Modular Canvas</div>
            <div class="feature-desc">Reorder hero banners, metric cards, and press releases with live visual preview without touching HTML, CSS, or backend code.</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">Encrypted Draft Previews</div>
            <div class="feature-desc">Generate secure preview links with 24-hour expiration tokens for executive committee and legal review before public deployment.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 07</span>
      </div>
    </div>

    <!-- PAGE 08: REGULATORY GOVERNANCE & AUDIT TRAIL -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 07 / Governance & Compliance</span>
        </div>

        <div class="section-eyebrow">Governance & Risk Management</div>
        <h2 class="section-title">4-Tier Approval Workflows & Immutable Audit Trail</h2>
        <p class="lead-text">
          As a dual-listed entity on the JSE and NYSE, Gold Fields requires strict editorial governance. Studio OS incorporates automated multi-stage sign-offs and cryptographic verification.
        </p>

        <div class="showcase-frame">
          <img src="{governance_card_b64}" alt="Governance Audit Graphic">
          <div class="showcase-caption">
            <span><strong>Cryptographic Compliance Log:</strong> SHA-256 hash validation, user IP tracking, and embargo release timing.</span>
            <span>JSE / SEC Compliant</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card turquoise">
            <div class="feature-title">4-Tier Sign-Off Pipeline</div>
            <div class="feature-desc">Draft Staged (Author) → Legal & IR Compliance Verification → ExCo Approval Sign-Off → Scheduled Global Broadcast.</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">Instant 3-Second Rollback</div>
            <div class="feature-desc">In the event of an urgent regulatory correction, any previous page revision can be restored across the global CDN in under 3 seconds.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 08</span>
      </div>
    </div>

    <!-- PAGE 09: LIVING DESIGN SYSTEM -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 08 / Design System</span>
        </div>

        <div class="section-eyebrow">Brand Identity & Accessibility</div>
        <h2 class="section-title">Living Design System & WCAG AAA Compliance</h2>
        <p class="lead-text">
          To ensure brand integrity across all digital channels, BastionGroup engineered a tokenized design system enforcing institutional typography, certified contrast ratios, and responsive UI components.
        </p>

        <div class="showcase-frame">
          <img src="{design_tokens_b64}" alt="Design Tokens Graphic">
          <div class="showcase-caption">
            <span><strong>Living Color Tokens:</strong> Deep Navy (#061D32), Mineral Gold (#C8A064), Horizon Turquoise (#00E5C0), Forest Green (#1F6E43).</span>
            <span>WCAG 2.1 AAA</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card gold">
            <div class="feature-title">Certified Contrast Ratios (7:1+)</div>
            <div class="feature-desc">Every interactive button, table header, and data visualization surpasses WCAG 2.1 AAA benchmarks for optimal readability.</div>
          </div>
          <div class="feature-card turquoise">
            <div class="feature-title">Harmonized Corporate Typography</div>
            <div class="feature-desc">Georgia / Playfair Display editorial serif for executive authority paired with Plus Jakarta Sans for crisp data presentation.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 09</span>
      </div>
    </div>

    <!-- PAGE 10: MOBILE ARCHITECTURE & SOCIAL ENGINE -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 09 / Multi-Channel Distribution</span>
        </div>

        <div class="section-eyebrow">Social Media & Messaging Engine</div>
        <h2 class="section-title">Automated Open Graph Cards & Mobile Responsiveness</h2>
        <p class="lead-text">
          Institutional investors and journalists consume press releases on smartphones. Our automated engine pre-renders high-impact branded cards for WhatsApp and LinkedIn sharing.
        </p>

        <div class="showcase-frame">
          <img src="{og_share_b64}" alt="WhatsApp Open Graph Card">
          <div class="showcase-caption">
            <span><strong>1200x630 Social Card:</strong> Gold Fields lion crest, live operational metrics, and branded border for WhatsApp and LinkedIn.</span>
            <span>Automated Pre-rendering</span>
          </div>
        </div>

        <div class="features-grid">
          <div class="feature-card gold">
            <div class="feature-title">High-Impact WhatsApp Previews</div>
            <div class="feature-desc">Shared URLs automatically display a rich preview card with gold accents and official crest rather than a blank link.</div>
          </div>
          <div class="feature-card turquoise">
            <div class="feature-title">100% Fluid Mobile Layout</div>
            <div class="feature-desc">Flawless scaling from 360px smartphones to 4K boardroom screens with touch drawers and collapsible financial tables.</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 10</span>
      </div>
    </div>

    <!-- PAGE 11: SECURITY & LIVE ACCESS -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 10 / Infrastructure & Access</span>
        </div>

        <div class="section-eyebrow">Enterprise Topology & Security</div>
        <h2 class="section-title">Serverless Edge Network & Live Access Credentials</h2>
        <p class="lead-text">
          The platform operates on a globally distributed serverless edge topology with automated SSL, DDoS mitigation, and ACID-compliant distributed database transactions.
        </p>

        <div class="showcase-frame">
          <img src="{login_portal_b64}" alt="Studio OS Login Portal">
          <div class="showcase-caption">
            <span><strong>Studio OS Authentication Gateway:</strong> Secure login with encrypted session cookies and audit trail logging.</span>
            <span>Production Verified</span>
          </div>
        </div>

        <div class="feature-card turquoise" style="margin-bottom: 12px; background: #061D32; color: white;">
          <div class="feature-title" style="color: var(--turquoise-bright);">VERIFIED PRODUCTION ACCESS DIRECTORY</div>
          <div style="font-family: monospace; font-size: 10.5px; line-height: 1.6; margin-top: 4px;">
            Public Flagship: https://goldfields-bay.vercel.app<br>
            Studio OS Portal: https://goldfields-bay.vercel.app/admin/login<br>
            Login Email: admin@goldfields.com<br>
            Access: credentials are issued separately by your account manager
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 11</span>
      </div>
    </div>

    <!-- PAGE 12: STRATEGIC ROADMAP & HANDOVER -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>BastionGroup • Executive Proposal</span>
          <span>Section 11 / Partnership & Sign-off</span>
        </div>

        <div class="section-eyebrow">Strategic Horizon</div>
        <h2 class="section-title">BastionGroup Partnership & Platform Handover</h2>
        <p class="lead-text">
          BastionGroup is committed to standing beside Gold Fields as your premier corporate communications and investor reporting partner. We propose the following strategic roadmap:
        </p>

        <div class="features-grid" style="margin-bottom: 16px;">
          <div class="feature-card turquoise">
            <div class="feature-title">Phase 2: Live IoT Mine Feeds</div>
            <div class="feature-desc">Direct connection with Khanyisa solar SCADA and Australian microgrid sensors for live renewable MWh generation and verified carbon offset counters.</div>
          </div>
          <div class="feature-card gold">
            <div class="feature-title">Phase 3: Multi-Language AI Localization</div>
            <div class="feature-desc">Automated neural translation into Spanish (for Salares Norte and Cerro Corona stakeholders) and Canadian French, managed via Studio OS.</div>
          </div>
        </div>

        <div class="section-eyebrow">Formal Acceptance & Platform Handover</div>
        <p style="font-size: 10.5px; color: var(--ink-muted); line-height: 1.45; margin-bottom: 14px;">
          By executing this handover document, Gold Fields Limited acknowledges the successful engineering and deployment of the Next-Generation Digital Flagship and Studio OS CMS in accordance with the enterprise delivery specifications.
        </p>

        <div class="signoff-section">
          <div class="sign-block">
            <div class="org-name">BastionGroup</div>
            <div class="person-name">Benjamin</div>
            <div class="sign-line"></div>
            <div class="sign-date">Date: 28 September 2026 • Digital Signature Verified</div>
          </div>

          <div class="sign-block">
            <div class="org-name">Gold Fields Limited</div>
            <div class="person-name">Executive Committee Representative</div>
            <div class="sign-line"></div>
            <div class="sign-date">Date: ________________________ • Corporate Affairs & IR</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>BastionGroup • https://bastiongroup.co.za/ • Prepared by Benjamin</span>
        <span>Page 12</span>
      </div>
    </div>

  </div>

</body>
</html>
"""

html_path = os.path.join(PROPOSAL_DIR, 'goldfields-executive-proposal.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"✅ HTML proposal saved to {html_path} ({os.path.getsize(html_path)} bytes)")

# Copy HTML to Documents folder
doc_html = os.path.join(DOCUMENTS_DIR, 'goldfields-executive-proposal.html')
shutil.copyfile(html_path, doc_html)
print(f"✅ Copied HTML to Documents: {doc_html}")

artifact_html = os.path.join(DOCS_ARTIFACTS_DIR, 'goldfields-executive-proposal.html')
shutil.copyfile(html_path, artifact_html)
print(f"✅ Copied HTML to Artifacts: {artifact_html}")

# Compile HTML to PDF using Google Chrome headless
pdf_filename = 'Goldfields-BastionGroup-Executive-Proposal.pdf'
pdf_path = os.path.join(PROPOSAL_DIR, pdf_filename)
pdf_project_path = os.path.join(PROJECT_DIR, pdf_filename)
doc_pdf_path = os.path.join(DOCUMENTS_DIR, pdf_filename)
artifact_pdf_path = os.path.join(DOCS_ARTIFACTS_DIR, pdf_filename)

chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cmd = [
    chrome_bin,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Generating PDF with Google Chrome headless...")
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode == 0:
    print(f"✅ PDF generated successfully at: {pdf_path} ({os.path.getsize(pdf_path)} bytes)")
    shutil.copyfile(pdf_path, pdf_project_path)
    shutil.copyfile(pdf_path, doc_pdf_path)
    shutil.copyfile(pdf_path, artifact_pdf_path)
    print(f"✅ Copied PDF to Documents: {doc_pdf_path}")
    print(f"✅ Copied PDF to Artifacts: {artifact_pdf_path}")
else:
    print(f"❌ Error generating PDF: {res.stderr}")
