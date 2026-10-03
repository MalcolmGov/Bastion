import type { ResultsDocument, ResultsStatement, ResultsRow } from './types';

export interface FinancialIssue {
  id: string;
  kind: 'subtotal' | 'missing' | 'period' | 'unit';
  title: string;
  detail: string;
  sourcePage?: number;
  statementId: string;
}
export interface FinancialValidation {
  issues: FinancialIssue[];
  totalsChecked: number;
  totalsSkipped: number;
}

// Decimal arithmetic stays exact, including amounts larger than Number.MAX_SAFE_INTEGER.
export function parseReportAmount(value: string | null | undefined): { value: bigint; decimals: number } | null {
  if (value == null) return null;
  const raw = value.trim().replace(/[\u00a0\u202f]/g, ' ').replace(/−/g, '-');
  if (/^[—–-]$/.test(raw)) return { value: BigInt('0'), decimals: 0 };
  const match = raw.match(/^(\()?(-?)(\d{1,3}(?:[ ,]\d{3})+|\d+)(?:\.(\d+))?(\))?$/);
  if (!match || Boolean(match[1]) !== Boolean(match[5]) || match[1] && match[2]) return null;
  const decimals = match[4]?.length || 0;
  if (decimals > 8) return null;
  const magnitude = BigInt(match[3].replace(/[ ,]/g, '') + (match[4] || ''));
  return { value: (match[1] || match[2] ? -BigInt('1') : BigInt('1')) * magnitude, decimals };
}
function formatAmount(value: bigint, decimals: number): string {
  const raw = (value < BigInt('0') ? -value : value).toString().padStart(decimals + 1, '0');
  const whole = decimals ? raw.slice(0, -decimals) : raw;
  return (value < BigInt('0') ? '-' : '') + whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (decimals ? '.' + raw.slice(-decimals) : '');
}
function cellAmount(row: ResultsRow, column: number) {
  // Intentional blanks are excluded components, not invented values in the report.
  if (row.sourceBlankCells?.includes(column) && !row.cells[column]?.trim()) return { value: BigInt('0'), decimals: 0 };
  return parseReportAmount(row.cells[column]);
}
function unit(label: string): string | null {
  const normalized = label.toLowerCase().replace(/[’']/g, '').replace(/\s/g, '');
  const match = normalized.match(/(?:us\$|zar|gbp|eur|usd|r|£|€|\$)(?:000|million|millions|billion|billions)/);
  return match?.[0].replace('millions', 'million').replace('billions', 'billion') || null;
}
function primary(statement: ResultsStatement): boolean {
  return /statement of (?:financial position|profit|cash flows)|income statement|balance sheet/i.test(statement.title) && !statement.columns.some(column => /previously|currently|restated/i.test(column.label));
}

export function validateFinancials(document: ResultsDocument): FinancialValidation {
  const result: FinancialValidation = { issues: [], totalsChecked: 0, totalsSkipped: 0 };
  const add = (statement: ResultsStatement, key: string, kind: FinancialIssue['kind'], title: string, detail: string) => result.issues.push({ id: `${statement.id}:${key}`, statementId: statement.id, sourcePage: statement.sourcePage, kind, title, detail });
  const source = document.sourceFinancialContext;
  const reportContext = document.statements[0] || { id: 'report', title: '', period: '', stubLabel: '', rows: [], columns: [], confidence: 1 };
  if (source && document.periodLabel.trim().toLowerCase() !== source.periodLabel.trim().toLowerCase()) add(reportContext, 'source-period', 'period', 'Report period differs from the conversion', `The original conversion identified “${source.periodLabel}”; the current heading is “${document.periodLabel}”. Verify the original reporting period.`);
  if (source && unit(source.unit) && unit(document.unit) !== unit(source.unit)) add(reportContext, 'source-unit', 'unit', 'Report unit differs from the conversion', `The original conversion identified ${source.unit}; the current report unit is ${document.unit}. Confirm the currency and scale against the source PDF.`);
  const reportYears = [...document.periodLabel.matchAll(/\b(?:19|20)\d{2}\b/g)].map(match => Number(match[0]));
  for (const statement of document.statements) {
    for (const row of statement.rows.filter(row => row.kind !== 'section')) {
      statement.columns.forEach((column, index) => {
        if (column.role !== 'figure' || row.sourceBlankCells?.includes(index)) return;
        if (!row.cells[index]?.trim()) add(statement, `${row.id}:missing:${index}`, 'missing', 'Missing financial figure', `${row.label || 'Unlabelled row'} · ${column.label || 'Unlabelled column'} has no extracted figure. Compare it with the PDF; do not assume zero.`);
      });
    }
    if (primary(statement)) {
      const years = statement.columns.filter(column => column.role === 'figure').flatMap(column => [...column.label.matchAll(/\b(?:19|20)\d{2}\b/g)].map(match => Number(match[0])));
      if (years.length && reportYears.length && Math.max(...years) !== Math.max(...reportYears)) add(statement, 'period', 'period', 'Reporting period needs confirmation', `${statement.title} has latest comparative year ${Math.max(...years)}, while the report heading contains ${Math.max(...reportYears)}. This may be intentional; check the source headings.`);
      const units = [...new Set(statement.columns.filter(column => column.role === 'figure').map(column => unit(column.label)).filter(Boolean))];
      if (units.length > 1) add(statement, 'units', 'unit', 'Comparative columns use different units', `${statement.title} contains ${units.join(' and ')}. Confirm currencies and scales before comparing amounts.`);
      if (!units.length && !unit(document.unit)) add(statement, 'unit-unconfirmed', 'unit', 'Financial unit needs confirmation', `${statement.title} has no recognised monetary scale in its extracted column headings or report unit. Check the PDF for the currency and scale; no unit has been guessed.`);
    }
    // Only explicit category breakdowns are additive here. Accounting equations and roll-forwards need richer source structure.
    const categoryBreakdown = /destination|geographic|by region|by country/i.test(statement.title);
    for (let index = 0; index < statement.rows.length; index++) {
      const total = statement.rows[index];
      if (total.kind !== 'total') continue;
      if (!categoryBreakdown) { result.totalsSkipped++; continue; }
      let start = index - 1;
      while (start >= 0 && statement.rows[start].kind === 'data') start--;
      const components = statement.rows.slice(start + 1, index);
      if (components.length < 2) { result.totalsSkipped++; continue; }
      statement.columns.forEach((column, col) => {
        if (column.role !== 'figure' || /%|percent|margin|ratio|per share/i.test(column.label)) return;
        const reported = cellAmount(total, col);
        let amounts = components.map(row => cellAmount(row, col));
        if (!reported || amounts.some(amount => !amount)) { result.totalsSkipped++; return; }
        // Explicit Asia breakdowns must not count both the region and its country rows.
        const asia = components.findIndex(row => /^asia\*?$/i.test(row.label.trim()));
        if (asia >= 0) {
          let end = asia + 1;
          while (end < components.length && /^(?:china|indonesia|other asia)\b/i.test(components[end].label)) end++;
          if (end > asia + 1) {
            const parent = amounts[asia]!;
            const children = amounts.slice(asia + 1, end).map(amount => amount!);
            const scale = Math.max(parent.decimals, ...children.map(amount => amount.decimals));
            const sum = children.reduce((sum, amount) => sum + amount.value * BigInt('10') ** BigInt(scale - amount.decimals), BigInt('0'));
            if (sum !== BigInt('0') && sum !== parent.value * BigInt('10') ** BigInt(scale - parent.decimals)) { result.totalsSkipped++; return; }
            amounts = amounts.filter((_, i) => i <= asia || i >= end);
          }
        }
        const values = amounts.map(amount => amount!);
        const scale = Math.max(reported.decimals, ...values.map(amount => amount.decimals));
        const sum = values.reduce((sum, amount) => sum + amount.value * BigInt('10') ** BigInt(scale - amount.decimals), BigInt('0'));
        const printed = reported.value * BigInt('10') ** BigInt(scale - reported.decimals);
        result.totalsChecked++;
        // Flag exact displayed-value differences for review; never silently round or repair.
        const tolerance = BigInt('0');
        const difference = sum - printed;
        if (difference > tolerance || difference < -tolerance) add(statement, `${total.id}:sum:${col}`, 'subtotal', 'Subtotal does not match its components', `${statement.title} · ${column.label}: reported ${formatAmount(printed, scale)}; recognised components add to ${formatAmount(sum, scale)} (difference ${formatAmount(difference, scale)} in the displayed units). Original figures are unchanged. Rounding or category hierarchy may explain a difference; confirm the source with the issuer.`);
      });
    }
  }
  return result;
}
