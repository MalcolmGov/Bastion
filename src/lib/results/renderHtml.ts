import type { PublicationBlock, PublicationTable, ResultsDocument, ResultsRow } from './types';

function esc(value: string | null | undefined): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function webFont(name: string | undefined, fallback: string): string {
  const first = (name || '').split(',')[0] || '';
  if (/benton/i.test(first)) return fontStack('Source Sans 3', fallback);
  return fontStack(name, fallback);
}

function fontStack(name: string | undefined, fallback: string): string {
  const parts = (name || '')
    .split(',')
    .map((part) => part.replace(/["'<>;{}]/g, '').trim())
    .filter((part) => part && part !== 'inherit' && !/var\(/i.test(part) && !/^(serif|sans-serif|monospace|cursive|fantasy)$/i.test(part));
  if (!parts.length) return fallback;
  const sans = /franklin|lato|helvetica|arial|inter|jakarta|manrope|segoe|roboto|source sans|nunito|sans/i.test(parts.join(' '));
  return `${parts.map((part) => `"${part}"`).join(', ')}, ${sans ? 'sans-serif' : fallback}`;
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

function saturation(hex: string): number {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return (max - min) / (1 - Math.abs(2 * l - 1));
}

function rowHtml(row: ResultsRow): string {
  if (row.kind === 'section') {
    return `<tr class="section"><td colspan="99">${esc(row.label)}</td></tr>`;
  }
  const cells = row.cells.map((cell) => `<td>${esc(cell || '—')}</td>`).join('');
  return `<tr class="${row.kind}"><th>${esc(row.label)}</th>${cells}</tr>`;
}

function tableHtml(table: PublicationTable): string {
  const head = table.columns.map((label, index) => (
    `<th class="${table.current[index] ? 'current' : ''}">${esc(label).replace(/\n/g, '<br>')}</th>`
  )).join('');
  const span = table.columns.length + 1;
  const rows = table.rows.map((row) => {
    if (row.kind === 'section') {
      return `<tr class="section"><th colspan="${span}">${esc(row.label)}</th></tr>`;
    }
    const cells = row.cells.map((cell, index) => (
      `<td class="${table.current[index] ? 'current' : ''}">${esc(cell || '')}</td>`
    )).join('');
    return `<tr class="${row.kind}"><th>${esc(row.label)}</th>${cells}</tr>`;
  }).join('');
  const notes = table.footnotes.map((note) => `<p class="footnote">${esc(note)}</p>`).join('');
  return `<div class="table-wrap"><table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table></div>${notes}`;
}

function publicationHtml(blocks: PublicationBlock[]): string {
  let region = 'results-narrative';
  const chunks: string[] = [];
  let open = '';
  const close = () => {
    if (!open) return;
    chunks.push(`</div>`);
    open = '';
  };
  const ensure = (next: string) => {
    if (open === next) return;
    close();
    open = next;
    chunks.push(`<div id="${next}">`);
  };
  for (const block of blocks) {
    if (block.kind === 'heading' && block.level === 2 && block.text) {
      if (/commentary/i.test(block.text)) region = 'results-narrative';
      else if (/statement of|cash flow|changes in equity|earnings per share/i.test(block.text)) region = 'results-statements';
      else if (/notes to the|administration|basis of preparation/i.test(block.text)) region = 'results-notes';
      else if (/year in review/i.test(block.text)) region = 'results-highlights';
    }
    ensure(region);
    if (block.kind === 'heading') {
      const tag = block.level === 3 ? 'h3' : 'h2';
      chunks.push(`<${tag}>${esc(block.text)}</${tag}>`);
    } else if (block.kind === 'paragraph') {
      chunks.push(`<p>${esc(block.text)}</p>`);
    } else if (block.kind === 'list') {
      chunks.push(`<ul class="contents-list">${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`);
    } else if (block.kind === 'metrics') {
      const groups = new Map<string, typeof block.metrics>();
      for (const metric of block.metrics || []) {
        const key = metric.group || '';
        groups.set(key, [...(groups.get(key) || []), metric]);
      }
      const cards = [...groups.entries()].map(([group, metrics]) => `
        <section class="metric-group">
          ${group ? `<h3>${esc(group)}</h3>` : ''}
          <div class="metrics">${(metrics || []).map((metric) => `
            <article class="metric">
              <p>${esc(metric.label)}</p>
              <strong>${esc(metric.value)}</strong>
              ${metric.comparison ? `<span>${esc(metric.comparison)}</span>` : ''}
            </article>`).join('')}</div>
        </section>`).join('');
      chunks.push(cards);
    } else if (block.kind === 'table' && block.table) {
      chunks.push(`<section class="statement">${tableHtml(block.table)}</section>`);
    }
  }
  close();
  return chunks.join('');
}

function googleFontLink(fonts: Array<string | undefined>): string {
  const names = [...new Set(fonts.flatMap((font) => (font || '').split(',').map((part) => part.replace(/["']/g, '').trim())))]
    .filter((name) => name && !/inherit|serif|sans-serif|monospace|system-ui|segoe|helvetica|arial|georgia|palatino|iowan|cursive|fantasy/i.test(name));
  if (!names.length) return '';
  const query = names.map((name) => `family=${name.replace(/\s+/g, '+')}:wght@300;400;500;600;700`).join('&');
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${query}&amp;display=swap" />`;
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
  const neutralPrimary = saturation(primary) < 0.35 && luminance(primary) < 0.35;
  const masthead = neutralPrimary ? '#ffffff' : (luminance(primary) > 0.45 ? ink : primary);
  const mastheadInk = luminance(masthead) > 0.45 ? ink : '#f7f4ee';
  const rule = contrast(accent, masthead) >= 3 ? accent : mastheadInk;
  const heading = webFont(brand?.headingFont, 'Georgia, "Iowan Old Style", Palatino, serif');
  const body = webFont(brand?.bodyFont, '"Source Sans 3", "Segoe UI", Helvetica, Arial, sans-serif');
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
  ${googleFontLink([brand?.headingFont, brand?.bodyFont])}
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
    body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--body-font); font-weight: 400; line-height: 1.4; }
    header.masthead { background: var(--masthead); color: var(--masthead-ink); padding: 36px 7vw 56px; border-bottom: 4px solid var(--rule); }
    .brand-row { display: flex; justify-content: space-between; align-items: center; gap: 20px; min-height: 36px; }
    .lockup { display: flex; align-items: center; gap: 14px; }
    .logo { height: 44px; width: auto; max-width: 240px; object-fit: contain; background: #fff; padding: 8px 12px; border-radius: 8px; }
    .wordmark { font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; }
    .unit { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.75; }
    .kicker { margin: 36px 0 0; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--rule); }
    h1 { font-family: var(--heading-font); font-weight: 700; font-size: clamp(40px, 6vw, 72px); line-height: 1.05; letter-spacing: 0; margin: 12px 0 16px; max-width: 16ch; }
    .lede { margin: 0; max-width: 36rem; font-size: 20px; line-height: 1.4; opacity: 0.88; }
    main { width: min(1120px, calc(100% - 48px)); margin: 0 auto 72px; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: -28px; background: var(--card); border: 1px solid var(--line); }
    .metric { padding: 22px 20px 18px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
    .metric p { margin: 0; min-height: 2.6em; color: var(--muted); font-size: 13px; line-height: 1.35; }
    #results-layout .metric p, #results-layout .metric span, #results-layout .metric strong { max-width: none; margin-left: 0; margin-right: 0; text-align: center; }
    .metric strong { display: block; margin-top: 12px; font-family: var(--heading-font); font-size: 30px; font-weight: 500; line-height: 1.05; letter-spacing: -0.03em; }
    .metric span { display: block; margin-top: 8px; color: var(--muted); font-size: 12px; }
    #results-contents { display: flex; flex-wrap: wrap; gap: 8px 18px; padding: 28px 0 8px; }
    #results-contents a { color: var(--ink); font-size: 13px; text-decoration: none; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
    #results-narrative { margin: 28px auto 8px; }
    #results-layout h2, #results-layout h3, #results-layout p, #results-layout .contents-list, #results-layout .footnote {
      text-align: center;
      margin-left: auto;
      margin-right: auto;
    }
    #results-narrative h2, .statement h2, #results-notes h2, #results-layout h2, #results-layout h3 { font-family: var(--heading-font); letter-spacing: 0; }
    #results-layout h2 { margin: 28px auto 16px; font-size: 28px; font-weight: 400; line-height: 1.21; color: var(--accent); }
    #results-layout h3 { font-weight: 500; color: var(--ink); }
    #results-narrative p, #results-layout p { margin: 0 auto 14px; font-size: 16px; font-weight: 400; line-height: 1.4; }
    #results-narrative .lead-copy { font-size: 18px; line-height: 1.4; }
    .statement { background: var(--card); border: 1px solid var(--line); margin: 28px 0; }
    .statement header { display: flex; justify-content: space-between; gap: 16px; align-items: end; padding: 22px 24px 8px; }
    #results-layout .statement h2 { margin: 0; font-size: 26px; max-width: 28ch; text-align: left; color: var(--ink); }
    #results-layout .statement header p { margin: 0; max-width: none; color: var(--muted); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; text-align: right; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 680px; font-size: 14px; }
    th, td { padding: 11px 16px; text-align: right; border-top: 1px solid var(--line); font-variant-numeric: tabular-nums; }
    th:first-child, td:first-child { text-align: left; font-variant-numeric: normal; }
    thead th { background: color-mix(in srgb, var(--paper) 55%, white); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
    th.current, td.current { background: #e6e7e8; }
    thead th.current { background: #d9dadb; }
    tr.section th { text-align: left; background: #f4f2ee; color: var(--ink); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; }
    tr.subtotal th, tr.subtotal td { font-weight: 700; border-top: 1px solid var(--ink); }
    tr.total th, tr.total td { font-weight: 700; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
    tr.total td.current, tr.total th.current { background: #dcdede; }
    h3 { margin: 28px 0 8px; font-family: var(--heading-font); font-size: 20px; font-weight: 500; }
    .footnote { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.5; }
    #results-layout .metric-group .metrics { margin-top: 16px; }
    .metric-group { margin-top: 8px; }
    #results-layout .metric-group h3 { margin: 22px 0 0; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; text-align: center; }
    #results-layout .contents-list { margin: 8px auto 24px; padding-left: 1.25em; list-style-position: outside; text-align: left; line-height: 1.7; width: max-content; max-width: 36rem; }
    #results-narrative p, #results-notes p, #results-statements p, #results-highlights p, #results-layout .footnote { max-width: 68ch; }
    #results-layout .footnote { font-size: 12px; line-height: 1.5; }
    #results-notes { margin-top: 36px; }
    #results-notes ol { margin: 0 auto; padding-left: 0; max-width: 68ch; color: var(--ink); line-height: 1.4; list-style-position: inside; text-align: center; }
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
    ${document.publication?.length ? publicationHtml(document.publication) : `
    ${highlights ? `<section class="metrics" id="results-highlights">${highlights}</section>` : ''}
    ${contents ? `<nav id="results-contents" aria-label="Statements">${contents}</nav>` : ''}
    ${narrative ? `<section id="results-narrative"><h2>Commentary</h2>${narrative}</section>` : ''}
    <div id="results-statements">${statements}</div>
    ${notes}`}
  </main>
  <footer id="results-footer">Prepared by Bastion from ${esc(document.sourceFilename || 'the source PDF')}.</footer>
</body>
</html>`;
}
