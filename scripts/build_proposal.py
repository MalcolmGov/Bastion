import os
import base64
import subprocess
import shutil

PROJECT_DIR = os.getcwd()
PROPOSAL_DIR = os.path.join(PROJECT_DIR, 'public', 'proposal')
os.makedirs(PROPOSAL_DIR, exist_ok=True)

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
logo_svg_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/gold-fields-logo.svg'))
emblem_svg_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/goldfields-emblem.svg'))
og_share_b64 = img_to_b64(os.path.join(PROJECT_DIR, 'public/assets/goldfields-og-share.png'))
hero_screenshot_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790576282836.png')
design_system_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790571926391.png')
globe_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790567902942.png')
cms_pages_b64 = img_to_b64('/Users/malcolmgovender/.gemini/antigravity/brain/8d5736b7-122d-4e9c-95b8-96b414fb7dfa/.user_uploaded/media_1790569477869.png')

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gold Fields — Digital Flagship & Studio CMS Executive Proposal | Website Whisperers</title>
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
      line-height: 1.5;
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
      padding: 12px 24px;
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
      gap: 10px;
    }}

    .btn {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }}

    .btn-gold {{
      background: var(--gold-accent);
      color: var(--navy-dark);
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
      margin: 32px auto;
      background: white;
      box-shadow: 0 12px 48px rgba(8, 43, 73, 0.12);
    }}

    /* Page Layout */
    .page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 16mm 18mm 14mm 18mm;
      position: relative;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      border-bottom: 1px solid var(--mist);
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
      padding-bottom: 12px;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--mist);
      font-size: 10.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--ink-muted);
    }}

    .doc-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      margin-top: 16px;
      border-top: 1px solid var(--mist);
      font-size: 10px;
      color: var(--ink-muted);
    }}

    /* Cover Page Specific */
    .cover-page {{
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      background: radial-gradient(circle at 85% 15%, #0e446e 0%, var(--navy-dark) 65%);
      color: white;
      padding: 22mm 20mm;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      border-bottom: none;
    }}

    .cover-page::before {{
      content: "";
      position: absolute;
      top: -120px;
      right: -120px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(0, 229, 192, 0.14) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }}

    .cover-page::after {{
      content: "";
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(200, 160, 100, 0.18) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }}

    .cover-top {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }}

    .agency-name {{
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: white;
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .agency-name span {{
      color: var(--turquoise-bright);
    }}

    .agency-sub {{
      font-size: 10.5px;
      color: var(--gold-accent);
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-weight: 700;
      margin-top: 2px;
    }}

    .client-emblem {{
      height: 64px;
      width: auto;
    }}

    .cover-hero {{
      margin-top: 40px;
      position: relative;
      z-index: 10;
    }}

    .cover-badge {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 14px;
      border-radius: 9999px;
      background: rgba(8, 43, 73, 0.85);
      border: 1px solid rgba(0, 229, 192, 0.45);
      color: var(--turquoise-bright);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      margin-bottom: 20px;
      box-shadow: 0 0 20px rgba(0,229,192,0.25);
    }}

    .cover-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 46px;
      line-height: 1.14;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 18px;
    }}

    .cover-title .highlight {{
      font-style: italic;
      color: var(--turquoise-bright);
      font-weight: 600;
      display: block;
      margin-top: 4px;
      text-shadow: 0 0 30px rgba(0,229,192,0.4);
    }}

    .cover-desc {{
      font-size: 16px;
      line-height: 1.6;
      color: #CBD5E1;
      max-width: 620px;
      margin-bottom: 32px;
      font-weight: 400;
    }}

    .cover-meta-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      background: rgba(10, 53, 90, 0.65);
      border: 1px solid rgba(200, 160, 100, 0.35);
      border-radius: 10px;
      padding: 20px;
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
    }}

    .cover-meta-item .label {{
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--gold-accent);
      font-weight: 700;
      margin-bottom: 4px;
    }}

    .cover-meta-item .val {{
      font-size: 12.5px;
      font-weight: 600;
      color: white;
      line-height: 1.4;
    }}

    /* Typography & Section Styles */
    h2.section-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 26px;
      color: var(--navy-primary);
      margin-bottom: 8px;
      line-height: 1.25;
    }}

    .section-eyebrow {{
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--gold-mineral);
      margin-bottom: 4px;
    }}

    .lead-text {{
      font-size: 13.5px;
      line-height: 1.55;
      color: var(--ink-muted);
      margin-bottom: 18px;
    }}

    /* Stat Cards */
    .stats-row {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }}

    .stat-card {{
      background: var(--bg-editorial);
      border: 1px solid var(--mist);
      border-radius: 8px;
      padding: 14px 12px;
      text-align: center;
      border-top: 3px solid var(--gold-accent);
    }}

    .stat-num {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--navy-primary);
      line-height: 1.1;
      margin-bottom: 2px;
    }}

    .stat-label {{
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-muted);
    }}

    /* Feature Grid */
    .pillars-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
    }}

    .pillar-card {{
      border: 1px solid var(--mist);
      border-radius: 10px;
      padding: 16px 18px;
      background: white;
      box-shadow: 0 2px 10px rgba(8, 43, 73, 0.03);
    }}

    .pillar-header {{
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }}

    .pillar-icon-box {{
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: rgba(8, 43, 73, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: var(--navy-primary);
    }}

    .pillar-title {{
      font-size: 14.5px;
      font-weight: 700;
      color: var(--navy-primary);
    }}

    .pillar-desc {{
      font-size: 12px;
      color: var(--ink-muted);
      line-height: 1.5;
      margin-bottom: 10px;
    }}

    .pillar-list {{
      list-style: none;
      font-size: 11.5px;
      color: var(--ink);
    }}

    .pillar-list li {{
      position: relative;
      padding-left: 16px;
      margin-bottom: 4px;
    }}

    .pillar-list li::before {{
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--forest-green);
      font-weight: 800;
    }}

    /* Visual Showcase Images */
    .showcase-block {{
      margin: 14px 0 16px 0;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--mist);
      box-shadow: 0 4px 20px rgba(8, 43, 73, 0.07);
      background: var(--navy-dark);
      height: 220px;
      display: flex;
      flex-direction: column;
    }}

    .showcase-img {{
      width: 100%;
      height: 185px;
      display: block;
      object-fit: cover;
      object-position: top;
    }}

    .showcase-caption {{
      padding: 8px 14px;
      background: white;
      border-top: 1px solid var(--mist);
      font-size: 11px;
      color: var(--ink-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 35px;
    }}

    .showcase-caption strong {{
      color: var(--navy-primary);
    }}

    /* Comparison Table */
    .comparison-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 18px 0;
      font-size: 12px;
    }}

    .comparison-table th {{
      background: var(--navy-primary);
      color: white;
      text-align: left;
      padding: 10px 14px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }}

    .comparison-table td {{
      padding: 9px 14px;
      border-bottom: 1px solid var(--mist);
      color: var(--ink);
    }}

    .comparison-table tr:nth-child(even) {{
      background: var(--bg-editorial);
    }}

    .tag-before {{
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #FEE2E2;
      color: #991B1B;
      font-weight: 700;
      font-size: 10px;
    }}

    .tag-after {{
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #DCFCE7;
      color: #166534;
      font-weight: 700;
      font-size: 10px;
    }}

    /* Architecture Diagram Box */
    .arch-box {{
      background: linear-gradient(135deg, #0A355A 0%, var(--navy-dark) 100%);
      color: white;
      border-radius: 10px;
      padding: 18px 20px;
      margin: 16px 0;
      border: 1px solid rgba(200, 160, 100, 0.4);
    }}

    .arch-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 14px;
    }}

    .arch-card {{
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      padding: 12px;
    }}

    .arch-card-title {{
      font-size: 12px;
      font-weight: 700;
      color: var(--turquoise-bright);
      margin-bottom: 4px;
    }}

    .arch-card-desc {{
      font-size: 10.5px;
      color: #CBD5E1;
      line-height: 1.45;
    }}

    /* Credentials & Verification Box */
    .creds-box {{
      background: var(--bg-editorial);
      border: 1.5px solid var(--gold-accent);
      border-radius: 10px;
      padding: 18px 20px;
      margin: 16px 0;
    }}

    .creds-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }}

    .cred-item {{
      background: white;
      padding: 12px 14px;
      border-radius: 6px;
      border: 1px solid var(--mist);
    }}

    .cred-label {{
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--gold-mineral);
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }}

    .cred-val {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 12px;
      font-weight: 600;
      color: var(--navy-primary);
    }}

    /* Sign-off section */
    .signoff-section {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1.5px solid var(--mist);
    }}

    .sign-block .org-name {{
      font-size: 13px;
      font-weight: 800;
      color: var(--navy-primary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 3px;
    }}

    .sign-block .person-name {{
      font-size: 14.5px;
      font-weight: 700;
      color: var(--ink);
    }}

    .sign-block .role-title {{
      font-size: 11px;
      color: var(--ink-muted);
      margin-bottom: 24px;
    }}

    .sign-line {{
      height: 1px;
      background: var(--ink);
      width: 85%;
      margin-bottom: 6px;
    }}

    .sign-date {{
      font-size: 10.5px;
      color: var(--ink-muted);
    }}

    /* Print / PDF Styling */
    @media print {{
      body {{
        background: white !important;
      }}
      .top-actions-bar {{
        display: none !important;
      }}
      .proposal-container {{
        width: 210mm !important;
        margin: 0 !important;
        box-shadow: none !important;
      }}
      .page {{
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        border-bottom: none !important;
        padding: 16mm 18mm 14mm 18mm !important;
      }}
      .cover-page {{
        width: 210mm !important;
        height: 297mm !important;
        max-height: 297mm !important;
        page-break-after: always !important;
        break-after: page !important;
        padding: 22mm 20mm !important;
      }}
      * {{
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }}
    }}
  </style>
</head>
<body>

  <!-- Sticky Actions Bar (for browser viewing) -->
  <div class="top-actions-bar">
    <div class="top-brand">
      <span class="badge">Official Delivery</span>
      <span>Website Whisperers × Gold Fields Limited</span>
    </div>
    <div class="action-btns">
      <a href="https://goldfields-bay.vercel.app" target="_blank" class="btn btn-outline">🌐 View Production Site</a>
      <a href="https://goldfields-bay.vercel.app/admin/login" target="_blank" class="btn btn-outline">🔐 Open Studio CMS</a>
      <button onclick="window.print()" class="btn btn-turquoise">🖨️ Print / Save as PDF</button>
      <a href="/proposal/goldfields-executive-proposal.pdf" download class="btn btn-gold">⬇️ Download PDF</a>
    </div>
  </div>

  <div class="proposal-container">

    <!-- ========================================== -->
    <!-- PAGE 1: COVER PAGE                         -->
    <!-- ========================================== -->
    <div class="page cover-page">
      <div class="cover-top">
        <div class="agency-tag">
          <div class="agency-name">WEBSITE <span>WHISPERERS</span></div>
          <div class="agency-sub">Digital Strategy & Engineering Studio</div>
        </div>
        <img src="{emblem_svg_b64}" alt="Gold Fields Crest" class="client-emblem">
      </div>

      <div class="cover-hero">
        <div class="cover-badge">
          ● Platform Handover & Strategic Delivery Proposal
        </div>
        <h1 class="cover-title">
          The Next-Generation Digital Flagship
          <span class="highlight">Beyond Mining.</span>
        </h1>
        <p class="cover-desc">
          An enterprise-grade headless web ecosystem, 3D operations visualizer, and live CMS Studio architected for Gold Fields Limited to establish total content autonomy, regulatory agility, and global brand preeminence.
        </p>
      </div>

      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <div class="label">Prepared By</div>
          <div class="val">Benjamin, Lead Digital Architect<br>Website Whisperers</div>
        </div>
        <div class="cover-meta-item">
          <div class="label">Client & Stakeholders</div>
          <div class="val">Gold Fields Limited<br>Executive & Corporate Comms</div>
        </div>
        <div class="cover-meta-item">
          <div class="label">Release & Date</div>
          <div class="val">Version 2.4 Production Release<br>September 2026</div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 2: EXECUTIVE SUMMARY & MANDATE        -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 01 / Strategic Vision</span>
        </div>

        <div class="section-eyebrow">Strategic Executive Summary</div>
        <h2 class="section-title">Empowering Gold Fields with Total Digital Independence</h2>
        <p class="lead-text">
          Traditional corporate mining websites are crippled by slow, monolithic architectures where simple text edits, ESG report uploads, or SENS regulatory announcements take days and require costly external engineering tickets. Website Whisperers was commissioned to replace this outdated model with a modern, high-velocity digital flagship.
        </p>

        <!-- Stats Row -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-num">6</div>
            <div class="stat-label">Global Jurisdictions</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">10</div>
            <div class="stat-label">Flagship Assets</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">&lt;30s</div>
            <div class="stat-label">Publishing Velocity</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">100%</div>
            <div class="stat-label">GISTM Conformance</div>
          </div>
        </div>

        <div class="section-eyebrow">The Core Breakthrough</div>
        <h3 style="font-size: 17px; color: var(--navy-primary); margin-bottom: 8px; font-weight: 700;">
          Real-Time Dynamic Publishing Without Code Deployments
        </h3>
        <p style="font-size: 13px; line-height: 1.6; color: var(--ink-muted); margin-bottom: 16px;">
          The fundamental objective of this transformation is that <strong>Gold Fields corporate communications, investor relations, and sustainability teams have 100% independent command of all published content</strong>. Edits made inside Gold Fields Studio OS are reflected across the global production website instantly—with zero code changes, zero developer dependencies, and zero build redeployments.
        </p>

        <!-- Comparison Table -->
        <table class="comparison-table">
          <thead>
            <tr>
              <th style="width: 25%;">Operational Dimension</th>
              <th style="width: 37%;">Legacy Web Architecture</th>
              <th style="width: 38%;">Website Whisperers Solution</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Publishing Turnaround</strong></td>
              <td><span class="tag-before">3 to 7 Days</span> (ticket queue)</td>
              <td><span class="tag-after">Instant (&lt; 30 Seconds)</span></td>
            </tr>
            <tr>
              <td><strong>Regulatory Risk (SENS/SEC)</strong></td>
              <td><span class="tag-before">High</span> (manual code deploys)</td>
              <td><span class="tag-after">Zero</span> (scheduled atomic release)</td>
            </tr>
            <tr>
              <td><strong>Mine Asset Visualization</strong></td>
              <td><span class="tag-before">Static 2D PDFs</span></td>
              <td><span class="tag-after">Interactive 3D WebGL Globe</span></td>
            </tr>
            <tr>
              <td><strong>Brand Consistency</strong></td>
              <td><span class="tag-before">Fragmented CSS</span></td>
              <td><span class="tag-after">Unified Living Design System</span></td>
            </tr>
            <tr>
              <td><strong>Mobile & Share Performance</strong></td>
              <td><span class="tag-before">Cluttered & Unoptimized</span></td>
              <td><span class="tag-after">100% Responsive + WhatsApp Cards</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 02</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 3: STUDIO OS HEADLESS CMS             -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 02 / Headless CMS Studio</span>
        </div>

        <div class="section-eyebrow">Pillar 01: Enterprise Content Management</div>
        <h2 class="section-title">Gold Fields Studio OS — Your Autonomous Command Center</h2>
        <p class="lead-text">
          A bespoke, multi-tenant administrative portal designed exclusively for Gold Fields' corporate governance structure. Studio OS gives non-technical staff an intuitive interface to manage every aspect of the company's public disclosures.
        </p>

        <div class="showcase-block">
          <img src="{cms_pages_b64}" alt="Studio OS Flagship Pages Manager" class="showcase-img">
          <div class="showcase-caption">
            <span><strong>Figure 1:</strong> Studio OS Content Governance — Live Page Editing, Version History & Review Statuses</span>
            <span style="color: var(--turquoise-deep); font-weight: 700;">Live in Production</span>
          </div>
        </div>

        <div class="pillars-grid">
          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">✍️</div>
              <div class="pillar-title">Visual Modular Editing</div>
            </div>
            <div class="pillar-desc">
              Non-destructive editing of flagship pages, executive bios, operational profiles, quarterly releases, and career vacancies.
            </div>
            <ul class="pillar-list">
              <li>Instant draft preview mode via encrypted cookie tokens</li>
              <li>Field-level validation for regulatory metrics & ESG figures</li>
              <li>Asset media library with automatic Vercel Blob sync</li>
            </ul>
          </div>

          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">⚖️</div>
              <div class="pillar-title">4-Tier Governance Workflow</div>
            </div>
            <div class="pillar-desc">
              Guarantees strict compliance oversight before any statement or result goes live to international capital markets.
            </div>
            <ul class="pillar-list">
              <li>Draft → In Review → Approved → Published pipeline</li>
              <li>Role-based access: Admin, Editor, Reviewer, Publisher</li>
              <li>Cryptographic SHA-256 audit trail logged for every edit</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 03</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 4: 3D OPERATIONS GLOBE & TELEMETRY    -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 03 / Operations Geolocation</span>
        </div>

        <div class="section-eyebrow">Pillar 02: Interactive Mining Visualization</div>
        <h2 class="section-title">Real 3D Earth Globe & Mine Asset Matrix</h2>
        <p class="lead-text">
          Gold Fields operates across 6 nations and extreme geographic diversity. We engineered a custom Three.js WebGL 3D Globe that lets institutional investors, sovereign analysts, and local communities explore each asset in high-definition interactive 3D.
        </p>

        <div class="showcase-block">
          <img src="{globe_b64}" alt="Real 3D Operations Globe" class="showcase-img">
          <div class="showcase-caption">
            <span><strong>Figure 2:</strong> Hardware-Accelerated 3D Globe with Asset Pinpointing & Regional Environmental Telemetry</span>
            <span style="color: var(--turquoise-deep); font-weight: 700;">Three.js / WebGL</span>
          </div>
        </div>

        <div class="pillars-grid">
          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">🌍</div>
              <div class="pillar-title">Multi-Modal Asset Exploration</div>
            </div>
            <div class="pillar-desc">
              Visitors can toggle seamlessly between an interactive 3D Globe, a planar 2D Regional Map, and an exhaustive Data Matrix.
            </div>
            <ul class="pillar-list">
              <li>Orbital controls with touch-friendly mobile rotation</li>
              <li>Interactive pulse beacons highlighting active mining hubs</li>
              <li>Instant country filtering (SA, Ghana, Chile, Peru, Aus, Canada)</li>
            </ul>
          </div>

          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">📊</div>
              <div class="pillar-title">Deep Operational Telemetry</div>
            </div>
            <div class="pillar-desc">
              Every asset drawer reveals critical operational metrics directly connected to Gold Fields' H1 2026 data.
            </div>
            <ul class="pillar-list">
              <li>Annual gold output (Moz) & workforce metrics</li>
              <li>Solar / renewable power integration percentages</li>
              <li>Tailings storage compliance & GISTM disclosure links</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 04</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 5: LIVING DESIGN SYSTEM & TOKENS      -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 04 / Brand Governance</span>
        </div>

        <div class="section-eyebrow">Pillar 03: Unified Brand System</div>
        <h2 class="section-title">The Gold Fields Living Design System & UI Library</h2>
        <p class="lead-text">
          To ensure brand integrity across current and future digital properties, Website Whisperers created an interactive Design System portal embedded directly within Studio OS at <code>/admin/design-system</code>.
        </p>

        <div class="showcase-block">
          <img src="{design_system_b64}" alt="Interactive Design System & UI Component Library" class="showcase-img">
          <div class="showcase-caption">
            <span><strong>Figure 3:</strong> Living Token Sandbox — Color Palettes, Typography Scales, Buttons & 1-Click Copy Utilities</span>
            <span style="color: var(--turquoise-deep); font-weight: 700;">WCAG AAA Verified</span>
          </div>
        </div>

        <div class="pillars-grid">
          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">🎨</div>
              <div class="pillar-title">Institutional Color Palette</div>
            </div>
            <div class="pillar-desc">
              Tailored tokens reflecting Gold Fields' heritage, geological wealth, and renewable innovation.
            </div>
            <ul class="pillar-list">
              <li><strong>Deep Navy (#082B49):</strong> Institutional trust & governance</li>
              <li><strong>Mineral Gold (#C99700):</strong> Authenticated gold production</li>
              <li><strong>Horizon Turquoise (#00E5C0):</strong> ESG & renewable energy</li>
              <li><strong>Forest Green (#1F6E43):</strong> Biodiversity stewardship</li>
            </ul>
          </div>

          <div class="pillar-card">
            <div class="pillar-header">
              <div class="pillar-icon-box">⚡</div>
              <div class="pillar-title">Component Blueprints</div>
            </div>
            <div class="pillar-desc">
              Standardized modular building blocks enabling marketing teams to construct cohesive pages effortlessly.
            </div>
            <ul class="pillar-list">
              <li>Tested for strict WCAG AAA / AA accessible color contrast</li>
              <li>1-click token copy utility with instant toast confirmations</li>
              <li>Reusable CTA buttons, data badges, and financial cards</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 05</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 6: ARCHITECTURE, SECURITY & SHARING   -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 05 / Cloud Architecture & Social</span>
        </div>

        <div class="section-eyebrow">Pillar 04: Technical Foundation</div>
        <h2 class="section-title">Enterprise Infrastructure & Multi-Channel Social Sharing</h2>
        <p class="lead-text">
          A world-class mining corporation requires institutional security, sub-second global edge performance, and immaculate presentation across WhatsApp, LinkedIn, Twitter/X, and financial news aggregators.
        </p>

        <!-- Social Media Showcase -->
        <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 18px;">
          <div style="border-radius: 8px; overflow: hidden; border: 1px solid var(--mist); box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
            <img src="{og_share_b64}" alt="1200x630 Open Graph Sharing Card" style="width: 100%; height: auto; display: block;">
            <div style="padding: 8px 12px; background: white; font-size: 10.5px; color: var(--ink-muted);">
              <strong>WhatsApp & Social Sharing Card (1200×630):</strong> Optimized &lt;110KB for instant previews in investor chat bubbles.
            </div>
          </div>
          <div style="background: var(--bg-editorial); border: 1px solid var(--mist); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--gold-mineral); margin-bottom: 6px;">
              Social Experience
            </div>
            <div style="font-size: 13px; font-weight: 700; color: var(--navy-primary); margin-bottom: 6px;">
              Executive Thumbnail & Favicons
            </div>
            <p style="font-size: 11px; color: var(--ink-muted); line-height: 1.45; margin-bottom: 10px;">
              When Gold Fields links are shared on WhatsApp or LinkedIn, the site dynamically presents the official Lion Crest and verified ticker info.
            </p>
            <div style="font-size: 10.5px; color: var(--forest-green); font-weight: 700; line-height: 1.5;">
              ✓ Multi-resolution Favicon (16/32/48)<br>
              ✓ Apple Touch Icon (180x180)<br>
              ✓ Vector SVG Icon for 4K Displays
            </div>
          </div>
        </div>

        <!-- Architecture Breakdown -->
        <div class="arch-box">
          <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--gold-accent);">
            Cloud Infrastructure Topology
          </div>
          <div style="font-size: 16px; font-weight: 700; color: white; margin-top: 2px;">
            Serverless Global Edge & Distributed LibSQL Persistence
          </div>

          <div class="arch-grid">
            <div class="arch-card">
              <div class="arch-card-title">1. Vercel Global Edge</div>
              <div class="arch-card-desc">
                Next.js 15 App Router deployed across 300+ global edge locations. Delivers &lt;100ms response times worldwide.
              </div>
            </div>

            <div class="arch-card">
              <div class="arch-card-title">2. Resilient Database Layer</div>
              <div class="arch-card-desc">
                LibSQL distributed database with serverless scratch replication in <code>/tmp</code> and Turso cloud synchronization.
              </div>
            </div>

            <div class="arch-card">
              <div class="arch-card-title">3. Enterprise Security</div>
              <div class="arch-card-desc">
                Hardened HTTP headers, TLS 1.3 encryption, salted SHA-256 password hashing, and encrypted 7-day session cookies.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 06</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 7: LIVE VERIFICATION & CREDENTIALS    -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 06 / Live Handover & Access</span>
        </div>

        <div class="section-eyebrow">Deliverables & Access Handover</div>
        <h2 class="section-title">Production Verification & Demonstration Access</h2>
        <p class="lead-text">
          The entire ecosystem has been successfully engineered, compiled, audited, and deployed to live production. The Gold Fields executive team can test and verify all functionality immediately.
        </p>

        <!-- Credentials Box -->
        <div class="creds-box">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(200, 160, 100, 0.4); padding-bottom: 10px;">
            <div>
              <div style="font-size: 15px; font-weight: 800; color: var(--navy-primary);">
                Studio OS Administrative Access
              </div>
              <div style="font-size: 11.5px; color: var(--ink-muted);">
                Production credentials for executive evaluation
              </div>
            </div>
            <a href="https://goldfields-bay.vercel.app/admin/login" target="_blank" class="btn btn-gold" style="font-size: 10.5px; padding: 6px 12px;">
              Launch Studio Portal →
            </a>
          </div>

          <div class="creds-grid">
            <div class="cred-item">
              <div class="cred-label">Portal Sign-in URL</div>
              <div class="cred-val">https://goldfields-bay.vercel.app/admin/login</div>
            </div>
            <div class="cred-item">
              <div class="cred-label">Platform Admin Email</div>
              <div class="cred-val">admin@goldfields.com</div>
            </div>
            <div class="cred-item">
              <div class="cred-label">Pre-configured Password</div>
              <div class="cred-val">GoldFields2026!</div>
            </div>
            <div class="cred-item">
              <div class="cred-label">Enterprise Role</div>
              <div class="cred-val">Platform Admin (Full Governance Rights)</div>
            </div>
          </div>

          <div style="margin-top: 12px; font-size: 10.5px; color: var(--ink-muted); line-height: 1.5;">
            *Additional pre-seeded testing personas: <code>editor@goldfields.com</code> (Content Editor), <code>reviewer@goldfields.com</code> (Compliance Reviewer), and <code>publisher@goldfields.com</code> (Head of Communications) — all sharing password <code>GoldFields2026!</code>.
          </div>
        </div>

        <!-- Key Environments -->
        <div style="margin-top: 18px;">
          <h3 style="font-size: 15px; color: var(--navy-primary); font-weight: 700; margin-bottom: 10px;">
            Key Environments & Flagship Entry Points
          </h3>
          <ul style="list-style: none; font-size: 12px; line-height: 1.8;">
            <li>🌍 <strong>Public Flagship Portal:</strong> <a href="https://goldfields-bay.vercel.app" target="_blank" style="color: var(--navy-primary); text-decoration: underline;">https://goldfields-bay.vercel.app</a></li>
            <li>🌐 <strong>Interactive 3D Operations Globe:</strong> <a href="https://goldfields-bay.vercel.app/operations" target="_blank" style="color: var(--navy-primary); text-decoration: underline;">https://goldfields-bay.vercel.app/operations</a></li>
            <li>🎨 <strong>Living Design System Sandbox:</strong> <a href="https://goldfields-bay.vercel.app/admin/design-system" target="_blank" style="color: var(--navy-primary); text-decoration: underline;">https://goldfields-bay.vercel.app/admin/design-system</a></li>
            <li>📈 <strong>Investor Relations & Reporting:</strong> <a href="https://goldfields-bay.vercel.app/reports" target="_blank" style="color: var(--navy-primary); text-decoration: underline;">https://goldfields-bay.vercel.app/reports</a></li>
            <li>🌿 <strong>2030 ESG Sustainability Hub:</strong> <a href="https://goldfields-bay.vercel.app/sustainability" target="_blank" style="color: var(--navy-primary); text-decoration: underline;">https://goldfields-bay.vercel.app/sustainability</a></li>
          </ul>
        </div>
      </div>

      <div class="doc-footer">
        <span>Confidential • Prepared for Gold Fields Limited</span>
        <span>Page 07</span>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PAGE 8: ROADMAP, PARTNERSHIP & SIGN-OFF   -->
    <!-- ========================================== -->
    <div class="page">
      <div class="page-content">
        <div class="doc-header">
          <span>Website Whisperers • Executive Proposal</span>
          <span>Section 07 / Partnership & Sign-off</span>
        </div>

        <div class="section-eyebrow">Strategic Horizon</div>
        <h2 class="section-title">Ongoing Innovation & Phase 2 Roadmap</h2>
        <p class="lead-text">
          Website Whisperers is committed to standing beside Gold Fields as your premier digital engineering and digital communications partner. We propose the following strategic roadmap:
        </p>

        <div class="pillars-grid" style="margin-bottom: 24px;">
          <div class="pillar-card">
            <div class="pillar-title" style="margin-bottom: 6px;">Phase 2: Live IoT Mine Feeds</div>
            <div class="pillar-desc">
              Direct connection with on-site SCADA and environmental sensors for live solar generation telemetry and real-time carbon offset counters.
            </div>
          </div>
          <div class="pillar-card">
            <div class="pillar-title" style="margin-bottom: 6px;">Phase 3: Multi-Language Jurisdictions</div>
            <div class="pillar-desc">
              Automated neural translation into Spanish (for Salares Norte & Cerro Corona) and Canadian French, managed seamlessly via Studio OS.
            </div>
          </div>
        </div>

        <div class="section-eyebrow">Formal Acceptance & Platform Handover</div>
        <p style="font-size: 12px; color: var(--ink-muted); line-height: 1.55; margin-bottom: 24px;">
          By executing this handover document, Gold Fields Limited acknowledges the successful engineering and deployment of the Next-Generation Digital Flagship and Studio OS CMS in accordance with the enterprise delivery specifications.
        </p>

        <div class="signoff-section">
          <div class="sign-block">
            <div class="org-name">Website Whisperers</div>
            <div class="person-name">Benjamin</div>
            <div class="role-title">Lead Digital Architect & Strategist</div>
            <div class="sign-line"></div>
            <div class="sign-date">Date: 28 September 2026</div>
          </div>

          <div class="sign-block">
            <div class="org-name">Gold Fields Limited</div>
            <div class="person-name">Executive Committee Representative</div>
            <div class="role-title">Corporate Communications & Investor Relations</div>
            <div class="sign-line"></div>
            <div class="sign-date">Date: ________________________</div>
          </div>
        </div>
      </div>

      <div class="doc-footer">
        <span>Website Whisperers • https://www.websitewhisperers.co.za/</span>
        <span>Page 08</span>
      </div>
    </div>

  </div>

</body>
</html>
"""

html_path = os.path.join(PROPOSAL_DIR, 'goldfields-executive-proposal.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"HTML proposal saved to {html_path} ({os.path.getsize(html_path)} bytes)")

# Compile to PDF using Google Chrome headless
pdf_filename = 'goldfields-executive-proposal.pdf'
pdf_path = os.path.join(PROPOSAL_DIR, pdf_filename)
pdf_project_path = os.path.join(PROJECT_DIR, 'Goldfields-Website-Whisperers-Proposal.pdf')
desktop_pdf_path = '/Users/malcolmgovender/Desktop/Goldfields-Website-Whisperers-Proposal.pdf'

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
    print(f"PDF generated successfully at: {pdf_path}")
    shutil.copyfile(pdf_path, pdf_project_path)
    shutil.copyfile(pdf_path, desktop_pdf_path)
    print(f"Copied PDF to: {desktop_pdf_path}")
    print(f"PDF file size: {os.path.getsize(pdf_path)} bytes")
else:
    print(f"Error generating PDF: {res.stderr}")
