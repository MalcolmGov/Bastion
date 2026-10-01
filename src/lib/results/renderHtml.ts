import type { ResultsDocument, ResultsRow } from './types';

function esc(value: string | null | undefined): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fontStack(name: string | undefined, fallback: string): string {
  const cleaned = (name || '').replace(/["<>;{}]/g, '').trim();
  if (!cleaned || cleaned === 'inherit' || /var\(/i.test(cleaned)) return fallback;
  return `"${cleaned}", ${fallback}`;
}

function luminance(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: string, second: string): number {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function rowHtml(row: ResultsRow): string {
  if (row.kind === 'section') {
    return `<tr class="section"><td colspan="99">${esc(row.label)}</td></tr>`;
  }
  const cells = row.cells.map((cell) => `<td>${esc(cell || '—')}</td>`).join('');
  return `<tr class="${row.kind}"><th>${esc(row.label)}</th>${cells}</tr>`;
}

function brandName(document: ResultsDocument): string {
  const name = document.brand?.siteName?.trim() || '';
  if (!name || /^client$/i.test(name)) return '';
  return name;
}

export function renderResultsHtml(document: ResultsDocument): string {
  const brand = document.brand;
  const primary = brand?.primary || '#0d1c30';
  const accent = brand?.accent || '#c8a064';
  const ink = brand?.ink || '#142033';
  const paper = brand?.paper || '#f4f1ea';
  const masthead = luminance(primary) > 0.45 ? ink : primary;
  const mastheadInk = luminance(masthead) > 0.45 ? ink : '#f7f4ee';
  const rule = contrast(accent, masthead) >= 3 ? accent : mastheadInk;
  const heading = fontStack(brand?.headingFont, 'Georgia, "Iowan Old Style", Palatino, serif');
  const body = fontStack(brand?.bodyFont, '"Segoe UI", Helvetica, Arial, sans-serif');
  const name = brandName(document);
  const logo = brand?.logoUrl
    ? `<img class="logo" src="${esc(brand.logoUrl)}" alt="${esc(name || document.issuer)}" referrerpolicy="no-referrer" />`
    : '';
  const wordmark = !logo && name ? `<span class="wordmark">${esc(name)}</span>` : '';

  const highlights = document.highlights.map((item) => `
    <article class="metric">
      <p>${esc(item.label)}</p>
      <strong>${esc(item.value)}</strong>
      ${item.comparison ? `<span>${esc(item.comparison)}</span>` : ''}
    </article>`).join('');

  const narrative = document.narrative.map((paragraph, index) => (
    `<p class="${index === 0 ? 'lead-copy' : ''}">${esc(paragraph)}</p>`
  )).join('');

  const contents = document.statements
    .filter((statement) => statement.title.length > 0 && statement.title.length < 90)
    .map((statement) => `<a href="#${esc(statement.id)}">${esc(statement.title)}</a>`)
    .join('');

  const statements = document.statements.map((statement) => `
    <section class="statement" id="${esc(statement.id)}">
      <header>
        <h2>${esc(statement.title)}</h2>
        <p>${esc([statement.period, document.unit].filter(Boolean).join(' · '))}</p>
      </header>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>${esc(statement.stubLabel || ' ')}</th>
              ${statement.columns.map((column) => `<th>${esc(column.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${statement.rows.map((row) => rowHtml(row)).join('')}
          </tbody>
        </table>
      </div>
    </section>`).join('');

  const notes = document.notes.length
    ? `<section id="results-notes"><h2>Notes</h2><ol>${document.notes.map((note) => `<li>${esc(note)}</li>`).join('')}</ol></section>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(document.issuer)} — ${esc(document.periodLabel)}</title>
  <style id="results-theme">
    :root {
      --ink: ${ink};
      --primary: ${primary};
      --accent: ${accent};
      --paper: ${paper};
      --masthead: ${masthead};
      --masthead-ink: ${mastheadInk};
      --rule: ${rule};
      --card: #ffffff;
      --line: color-mix(in srgb, ${ink} 14%, white);
      --muted: color-mix(in srgb, ${ink} 58%, white);
      --heading-font: ${heading};
      --body-font: ${body};
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--body-font); }
    header.masthead { background: var(--masthead); color: var(--masthead-ink); padding: 36px 7vw 56px; border-bottom: 4px solid var(--rule); }
    .brand-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; min-height: 36px; }
    .lockup { display: flex; align-items: center; gap: 14px; }
    .logo { height: 46px; width: auto; max-width: 220px; object-fit: contain; }
    .wordmark { font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; }
    .unit { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.75; }
    .kicker { margin: 36px 0 0; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--rule); }
    h1 { font-family: var(--heading-font); font-weight: 500; font-size: clamp(40px, 6vw, 72px); line-height: 0.92; letter-spacing: -0.03em; margin: 12px 0 16px; max-width: 14ch; }
    .lede { margin: 0; max-width: 36rem; font-size: 20px; line-height: 1.4; opacity: 0.88; }
    main { width: min(1120px, calc(100% - 48px)); margin: 0 auto 72px; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: -28px; background: var(--card); border: 1px solid var(--line); }
    .metric { padding: 22px 20px 18px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .metric p { margin: 0; min-height: 2.6em; color: var(--muted); font-size: 13px; line-height: 1.35; }
    .metric strong { display: block; margin-top: 12px; font-family: var(--heading-font); font-size: 30px; font-weight: 500; line-height: 1.05; letter-spacing: -0.03em; }
    .metric span { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; }
    #results-contents { display: flex; flex-wrap: wrap; gap: 8px 18px; padding: 28px 0 8px; }
    #results-contents a { color: var(--ink); font-size: 13px; text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    #results-narrative { max-width: 68ch; margin: 28px 0 8px; }
    #results-narrative h2, .statement h2, #results-notes h2 { font-family: var(--heading-font); font-weight: 500; letter-spacing: -0.02em; }
    #results-narrative h2 { margin: 0 0 16px; font-size: 28px; }
    #results-narrative p { margin: 0 0 14px; font-size: 16px; line-height: 1.65; }
    #results-narrative .lead-copy { font-size: 18px; line-height: 1.55; }
    .statement { background: var(--card); border: 1px solid var(--line); margin: 28px 0; }
    .statement header { display: flex; justify-content: space-between; gap: 16px; align-items: end; padding: 22px 24px 8px; }
    .statement h2 { margin: 0; font-size: 26px; max-width: 28ch; }
    .statement header p { margin: 0; color: var(--muted); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; font-size: 14px; }
    th, td { padding: 11px 16px; text-align: right; border-top: 1px solid var(--line); font-variant-numeric: tabular-nums; }
    th:first-child, td:first-child { text-align: left; font-variant-numeric: normal; }
    thead th { background: color-mix(in srgb, var(--paper) 55%, white); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
    tr.section td { background: color-mix(in srgb, var(--accent) 18%, white); color: var(--masthead); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 700; }
    tr.total th, tr.total td { font-weight: 700; border-top: 2px solid var(--ink); }
    #results-notes { margin-top: 36px; max-width: 76ch; }
    #results-notes ol { padding-left: 18px; color: var(--muted); line-height: 1.6; }
    footer { border-top: 1px solid var(--line); padding: 28px 7vw 48px; color: var(--muted); font-size: 12px; letter-spacing: 0.02em; }
    @media (max-width: 900px) {
      .metrics { grid-template-columns: 1fr 1fr; }
      h1 { max-width: none; }
    }
    @media (max-width: 640px) {
      header.masthead { padding: 24px 20px 40px; }
      .metrics { grid-template-columns: 1fr; margin-top: 16px; }
      .statement header { display: block; }
      .brand-row { align-items: flex-start; }
    }
    @media print {
      header.masthead { padding-bottom: 24px; }
      .statement { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <header class="masthead" id="results-header">
    <div class="brand-row">
      <div class="lockup">${logo}${wordmark}</div>
      <span class="unit">${esc(document.unit)}</span>
    </div>
    <p class="kicker">Summarised results</p>
    <h1>${esc(document.issuer)}</h1>
    <p class="lede">${esc(document.periodLabel)}</p>
  </header>
  <main id="results-layout">
    ${highlights ? `<section class="metrics" id="results-highlights">${highlights}</section>` : ''}
    ${contents ? `<nav id="results-contents" aria-label="Statements">${contents}</nav>` : ''}
    ${narrative ? `<section id="results-narrative"><h2>Commentary</h2>${narrative}</section>` : ''}
    <div id="results-statements">${statements}</div>
    ${notes}
  </main>
  <footer id="results-footer">Prepared by Bastion from ${esc(document.sourceFilename || 'the source PDF')}.</footer>
</body>
</html>`;
}
