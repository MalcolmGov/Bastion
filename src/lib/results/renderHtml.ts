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
  if (!cleaned || cleaned === 'inherit') return fallback;
  return `"${cleaned}", ${fallback}`;
}

function rowHtml(row: ResultsRow, columnCount: number): string {
  if (row.kind === 'section') {
    return `<tr class="section"><td colspan="${columnCount + 1}">${esc(row.label)}</td></tr>`;
  }
  const cells = row.cells.map((cell) => `<td>${esc(cell || '—')}</td>`).join('');
  return `<tr class="${row.kind}">${row.kind === 'total' ? `<th>${esc(row.label)}</th>` : `<th>${esc(row.label)}</th>`}${cells}</tr>`;
}

export function renderResultsHtml(document: ResultsDocument): string {
  const brand = document.brand;
  const primary = brand?.primary || '#0d1c30';
  const accent = brand?.accent || '#c8a064';
  const ink = brand?.ink || '#142033';
  const paper = brand?.paper || '#f6f3ec';
  const heading = fontStack(brand?.headingFont, 'Georgia, "Times New Roman", serif');
  const body = fontStack(brand?.bodyFont, '"Segoe UI", Helvetica, Arial, sans-serif');
  const logo = brand?.logoUrl
    ? `<img class="logo" src="${esc(brand.logoUrl)}" alt="${esc(brand.siteName || document.issuer)}" />`
    : '';

  const highlights = document.highlights.map((item) => `
    <article class="metric">
      <p>${esc(item.label)}</p>
      <strong>${esc(item.value)}</strong>
      ${item.comparison ? `<span>${esc(item.comparison)}</span>` : ''}
    </article>`).join('');

  const narrative = document.narrative.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');

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
            ${statement.rows.map((row) => rowHtml(row, statement.columns.length)).join('')}
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
      --card: #ffffff;
      --line: color-mix(in srgb, ${ink} 12%, white);
      --muted: color-mix(in srgb, ${ink} 62%, white);
      --heading-font: ${heading};
      --body-font: ${body};
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--body-font); }
    header.masthead { background: var(--primary); color: white; padding: 28px 8vw 72px; }
    .brand-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; letter-spacing: 0.16em; text-transform: uppercase; font-size: 11px; color: var(--accent); }
    .logo { height: 42px; width: auto; max-width: 180px; object-fit: contain; background: white; border-radius: 8px; padding: 4px; }
    h1 { font-family: var(--heading-font); font-size: clamp(36px, 6vw, 68px); line-height: 0.95; font-weight: 560; margin: 28px 0 12px; max-width: 16ch; }
    .lede { max-width: 40rem; font-size: 20px; color: color-mix(in srgb, white 82%, var(--accent)); }
    main { width: min(1120px, calc(100% - 48px)); margin: -36px auto 64px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .metric { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 18px 18px 16px; box-shadow: 0 10px 30px rgba(16, 24, 40, 0.05); }
    .metric p { margin: 0; color: var(--muted); font-size: 14px; }
    .metric strong { display: block; margin-top: 10px; font-family: var(--heading-font); font-size: 32px; letter-spacing: -0.04em; }
    .metric span { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; }
    #results-narrative { max-width: 46rem; margin: 36px 0; font-size: 16px; line-height: 1.7; }
    .statement { background: var(--card); border: 1px solid var(--line); border-radius: 24px; margin: 22px 0; overflow: hidden; }
    .statement header { display: flex; justify-content: space-between; gap: 16px; align-items: end; padding: 22px 24px 14px; }
    .statement h2 { margin: 0; font-family: var(--heading-font); font-size: 28px; }
    .statement header p { margin: 0; color: var(--muted); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 640px; font-size: 14px; }
    th, td { padding: 12px 16px; text-align: right; border-top: 1px solid var(--line); }
    th:first-child, td:first-child { text-align: left; position: sticky; left: 0; background: inherit; }
    thead th { background: color-mix(in srgb, var(--paper) 70%, white); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
    tr.section td { background: color-mix(in srgb, var(--accent) 16%, white); color: var(--primary); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; }
    tr.total th, tr.total td { font-weight: 700; border-top: 1px solid var(--ink); }
    #results-notes { margin-top: 28px; }
    #results-notes ol { padding-left: 18px; color: var(--muted); line-height: 1.6; }
    footer { border-top: 1px solid var(--line); padding: 28px 8vw 40px; color: var(--muted); font-size: 12px; }
    @media (max-width: 720px) {
      header.masthead { padding: 22px 20px 64px; }
      .statement header { display: block; }
    }
  </style>
</head>
<body>
  <header class="masthead" id="results-header">
    <div class="brand-row">
      <span>${logo}${esc(brand?.siteName || 'Bastion Results')}</span>
      <span>${esc(document.unit)}</span>
    </div>
    <h1>${esc(document.issuer)}</h1>
    <p class="lede">${esc(document.periodLabel)}</p>
  </header>
  <main id="results-layout">
    ${highlights ? `<section class="metrics" id="results-highlights">${highlights}</section>` : ''}
    ${narrative ? `<section id="results-narrative">${narrative}</section>` : ''}
    <div id="results-statements">${statements}</div>
    ${notes}
  </main>
  <footer id="results-footer">Prepared by Bastion from ${esc(document.sourceFilename || 'the source PDF')}.</footer>
</body>
</html>`;
}
