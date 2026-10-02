/**
 * Seed realistic Gold Fields H1 2026 interim results document into results_documents table.
 * Fully compliant with IFRS accounting, balance sheet equation (A = L + E),
 * segmental breakdowns (South Deep, Tarkwa, St Ives, Americas), and SA 20% DWT notes.
 */

import { getDb, ensureDbReady } from '../src/lib/db/client';
import { ensureResultsSchema } from '../src/lib/results/store';
import { renderResultsHtml } from '../src/lib/results/renderHtml';
import type { ResultsDocument } from '../src/lib/results/types';

export const GOLD_FIELDS_H1_2026_DOCUMENT: ResultsDocument = {
  issuer: 'Gold Fields Limited',
  title: 'Condensed Reviewed Interim Results for the Six Months Ended 30 June 2026',
  periodLabel: 'H1 2026 (Six Months Ended 30 June 2026)',
  unit: 'US$ million (unless otherwise stated)',
  narrative: [
    'Gold Fields delivered an outstanding operational and financial performance for the six months ended 30 June 2026, driven by sustained elevated gold prices, steady production across all four operating regions, and disciplined cost containment.',
    'Headline earnings surged by 42% to US$612m (US$0.68 per share) compared to US$431m (US$0.48 per share) in H1 2025. Attributable gold equivalent production remained resilient at 1,120,000 ounces.',
    'In line with our capital allocation framework and dividend policy to pay out 30% to 45% of normalised earnings, the Board declared an interim gross dividend of 420 SA cents per share, subject to South African Dividend Withholding Tax (DWT).',
  ],
  highlights: [
    { label: 'Group Revenue', value: 'US$ 2,548m', comparison: '+21% vs H1 2025' },
    { label: 'Operating EBIT', value: 'US$ 938m', comparison: '+38.6% vs H1 2025' },
    { label: 'Headline Earnings', value: 'US$ 612m', comparison: '+42% vs H1 2025' },
    { label: 'Free Cash Flow', value: 'US$ 485m', comparison: '+54% vs H1 2025' },
    { label: 'Headline EPS', value: 'US$ 0.68', comparison: '+42% vs H1 2025' },
    { label: 'Interim Dividend', value: '420 SA cents', comparison: '40% payout ratio' },
  ],
  statements: [
    {
      id: 'income-statement',
      title: 'Condensed Consolidated Income Statement',
      period: 'Six Months Ended 30 June',
      stubLabel: 'US$ Million',
      confidence: 1,
      columns: [
        { id: 'h1-2026', label: 'H1 2026', role: 'figure' },
        { id: 'h1-2025', label: 'H1 2025', role: 'figure' },
        { id: 'variance', label: '% Change', role: 'figure' },
      ],
      rows: [
        { id: 'rev', label: 'Revenue', kind: 'data', cells: ['2,548.0', '2,105.0', '+21.0%'], confidence: 1 },
        { id: 'cos', label: 'Cost of sales before amortisation and depreciation', kind: 'data', cells: ['(1,128.0)', '(980.0)', '+15.1%'], confidence: 1 },
        { id: 'depr', label: 'Amortisation and depreciation', kind: 'data', cells: ['(385.0)', '(362.0)', '+6.4%'], confidence: 1 },
        { id: 'gp', label: 'Gross profit from operations', kind: 'total', cells: ['1,035.0', '763.0', '+35.6%'], confidence: 1 },
        { id: 'admin', label: 'Corporate and administrative expenses', kind: 'data', cells: ['(42.0)', '(38.0)', '+10.5%'], confidence: 1 },
        { id: 'explor', label: 'Exploration and project expenses', kind: 'data', cells: ['(55.0)', '(48.0)', '+14.6%'], confidence: 1 },
        { id: 'ebit', label: 'Operating profit (EBIT)', kind: 'total', cells: ['938.0', '677.0', '+38.6%'], confidence: 1 },
        { id: 'fin_inc', label: 'Finance income', kind: 'data', cells: ['28.0', '19.0', '+47.4%'], confidence: 1 },
        { id: 'fin_exp', label: 'Finance expense', kind: 'data', cells: ['(64.0)', '(72.0)', '-11.1%'], confidence: 1 },
        { id: 'pbt', label: 'Profit before taxation', kind: 'total', cells: ['902.0', '624.0', '+44.6%'], confidence: 1 },
        { id: 'tax', label: 'Mining and income taxation', kind: 'data', cells: ['(278.0)', '(185.0)', '+50.3%'], confidence: 1 },
        { id: 'net_profit', label: 'Net profit for the period', kind: 'total', cells: ['624.0', '439.0', '+42.1%'], confidence: 1 },
        { id: 'nci', label: 'Non-controlling interest', kind: 'data', cells: ['(12.0)', '(8.0)', '+50.0%'], confidence: 1 },
        { id: 'attributable_profit', label: 'Profit attributable to owners of the parent', kind: 'total', cells: ['612.0', '431.0', '+42.0%'], confidence: 1 },
      ],
    },
    {
      id: 'balance-sheet',
      title: 'Condensed Consolidated Statement of Financial Position',
      period: 'As at 30 June',
      stubLabel: 'US$ Million',
      confidence: 1,
      columns: [
        { id: 'jun-2026', label: '30 Jun 2026', role: 'figure' },
        { id: 'dec-2025', label: '31 Dec 2025', role: 'figure' },
        { id: 'jun-2025', label: '30 Jun 2025', role: 'figure' },
      ],
      rows: [
        { id: 'sec-nca', label: 'Non-current assets', kind: 'section', cells: [null, null, null], confidence: 1 },
        { id: 'ppe', label: 'Property, plant and equipment', kind: 'data', cells: ['7,450.0', '7,180.0', '6,920.0'], confidence: 1 },
        { id: 'gw', label: 'Goodwill and intangibles', kind: 'data', cells: ['480.0', '480.0', '480.0'], confidence: 1 },
        { id: 'inv_assoc', label: 'Investments in equity-accounted joint ventures', kind: 'data', cells: ['310.0', '295.0', '280.0'], confidence: 1 },
        { id: 'other_nca', label: 'Deferred taxation and other non-current assets', kind: 'data', cells: ['180.0', '165.0', '150.0'], confidence: 1 },
        { id: 'tot_nca', label: 'Total non-current assets', kind: 'total', cells: ['8,420.0', '8,120.0', '7,830.0'], confidence: 1 },
        { id: 'sec-ca', label: 'Current assets', kind: 'section', cells: [null, null, null], confidence: 1 },
        { id: 'inv', label: 'Inventories and stockpiles', kind: 'data', cells: ['780.0', '720.0', '690.0'], confidence: 1 },
        { id: 'trade_rec', label: 'Trade and other receivables', kind: 'data', cells: ['340.0', '310.0', '295.0'], confidence: 1 },
        { id: 'cash', label: 'Cash and cash equivalents', kind: 'data', cells: ['960.0', '850.0', '685.0'], confidence: 1 },
        { id: 'tot_ca', label: 'Total current assets', kind: 'total', cells: ['2,080.0', '1,880.0', '1,670.0'], confidence: 1 },
        { id: 'tot_assets', label: 'Total assets', kind: 'total', cells: ['10,500.0', '10,000.0', '9,500.0'], confidence: 1 },
        { id: 'sec-eq', label: 'Equity and liabilities', kind: 'section', cells: [null, null, null], confidence: 1 },
        { id: 'share_cap', label: 'Share capital and share premium', kind: 'data', cells: ['3,900.0', '3,900.0', '3,900.0'], confidence: 1 },
        { id: 'ret_earn', label: 'Retained earnings and other reserves', kind: 'data', cells: ['2,480.0', '2,150.0', '1,890.0'], confidence: 1 },
        { id: 'tot_eq', label: 'Total equity', kind: 'total', cells: ['6,380.0', '6,050.0', '5,790.0'], confidence: 1 },
        { id: 'sec-ncl', label: 'Non-current liabilities', kind: 'section', cells: [null, null, null], confidence: 1 },
        { id: 'lt_borrow', label: 'Long-term borrowings and senior notes', kind: 'data', cells: ['1,750.0', '1,820.0', '1,890.0'], confidence: 1 },
        { id: 'env_prov', label: 'Environmental rehabilitation provisions', kind: 'data', cells: ['540.0', '520.0', '510.0'], confidence: 1 },
        { id: 'def_tax_liab', label: 'Deferred taxation liabilities', kind: 'data', cells: ['680.0', '650.0', '630.0'], confidence: 1 },
        { id: 'tot_ncl', label: 'Total non-current liabilities', kind: 'total', cells: ['2,970.0', '2,990.0', '3,030.0'], confidence: 1 },
        { id: 'sec-cl', label: 'Current liabilities', kind: 'section', cells: [null, null, null], confidence: 1 },
        { id: 'trade_pay', label: 'Trade and other payables', kind: 'data', cells: ['820.0', '740.0', '560.0'], confidence: 1 },
        { id: 'st_borrow', label: 'Short-term borrowings and current portion of debt', kind: 'data', cells: ['330.0', '220.0', '120.0'], confidence: 1 },
        { id: 'tot_cl', label: 'Total current liabilities', kind: 'total', cells: ['1,150.0', '960.0', '680.0'], confidence: 1 },
        { id: 'tot_liab', label: 'Total liabilities', kind: 'total', cells: ['4,120.0', '3,950.0', '3,710.0'], confidence: 1 },
        { id: 'tot_eq_liab', label: 'Total equity and liabilities', kind: 'total', cells: ['10,500.0', '10,000.0', '9,500.0'], confidence: 1 },
      ],
    },
    {
      id: 'cash-flow',
      title: 'Condensed Consolidated Statement of Cash Flows',
      period: 'Six Months Ended 30 June',
      stubLabel: 'US$ Million',
      confidence: 1,
      columns: [
        { id: 'h1-2026', label: 'H1 2026', role: 'figure' },
        { id: 'h1-2025', label: 'H1 2025', role: 'figure' },
      ],
      rows: [
        { id: 'cfo', label: 'Cash generated from operating activities', kind: 'data', cells: ['1,085.0', '840.0'], confidence: 1 },
        { id: 'tax_paid', label: 'Taxation paid', kind: 'data', cells: ['(240.0)', '(175.0)'], confidence: 1 },
        { id: 'int_paid', label: 'Net interest paid', kind: 'data', cells: ['(45.0)', '(52.0)'], confidence: 1 },
        { id: 'net_cfo', label: 'Net cash from operating activities', kind: 'total', cells: ['800.0', '613.0'], confidence: 1 },
        { id: 'capex', label: 'Capital expenditure (sustaining & growth)', kind: 'data', cells: ['(315.0)', '(298.0)'], confidence: 1 },
        { id: 'fcf', label: 'Free cash flow from operations', kind: 'total', cells: ['485.0', '315.0'], confidence: 1 },
        { id: 'div_paid', label: 'Dividends paid to shareholders', kind: 'data', cells: ['(210.0)', '(165.0)'], confidence: 1 },
        { id: 'debt_repay', label: 'Net repayment of borrowings', kind: 'data', cells: ['(165.0)', '(120.0)'], confidence: 1 },
        { id: 'net_cash_flow', label: 'Net increase in cash and cash equivalents', kind: 'total', cells: ['110.0', '30.0'], confidence: 1 },
        { id: 'opening_cash', label: 'Cash and cash equivalents at beginning of period', kind: 'data', cells: ['850.0', '655.0'], confidence: 1 },
        { id: 'closing_cash', label: 'Cash and cash equivalents at end of period', kind: 'total', cells: ['960.0', '685.0'], confidence: 1 },
      ],
    },
    {
      id: 'segmental-breakdown',
      title: 'Segmental Operational and Financial Review',
      period: 'Six Months Ended 30 June 2026',
      stubLabel: 'US$ Million',
      confidence: 1,
      columns: [
        { id: 'segment', label: 'Operating Segment', role: 'note' },
        { id: 'country', label: 'Jurisdiction', role: 'note' },
        { id: 'revenue', label: 'Revenue (US$m)', role: 'figure' },
        { id: 'operating_ebit', label: 'Operating EBIT (US$m)', role: 'figure' },
        { id: 'capex', label: 'CapEx (US$m)', role: 'figure' },
      ],
      rows: [
        { id: 'seg-1', label: 'South Deep', kind: 'data', cells: ['South Deep', 'South Africa', '420.0', '165.0', '62.0'], confidence: 1 },
        { id: 'seg-2', label: 'Tarkwa & Damang', kind: 'data', cells: ['Tarkwa & Damang', 'Ghana', '740.0', '295.0', '95.0'], confidence: 1 },
        { id: 'seg-3', label: 'St Ives & Agnew', kind: 'data', cells: ['St Ives & Agnew', 'Australia', '810.0', '315.0', '88.0'], confidence: 1 },
        { id: 'seg-4', label: 'Cerro Corona & Salares Norte', kind: 'data', cells: ['Cerro Corona & Salares Norte', 'Americas (Peru/Chile)', '578.0', '163.0', '70.0'], confidence: 1 },
        { id: 'seg-tot', label: 'Total Group Operations', kind: 'total', cells: ['Total Group Operations', 'Worldwide', '2,548.0', '938.0', '315.0'], confidence: 1 },
      ],
    },
  ],
  notes: [
    'Basis of preparation: These condensed consolidated interim financial statements have been prepared in accordance with International Financial Reporting Standards (IFRS Accounting Standards) as issued by the IASB (IAS 34: Interim Financial Reporting) and the SAICA Financial Reporting Guides as issued by the Accounting Practices Committee.',
    'South African Dividend Withholding Tax (DWT): The gross interim dividend of 420 SA cents per ordinary share is subject to 20% DWT, resulting in a net dividend of 336 SA cents per share for shareholders not exempt under SA tax legislation.',
    'Independent Audit Opinion: The condensed consolidated financial statements for the six months ended 30 June 2026 have been reviewed by PricewaterhouseCoopers Inc., who expressed an unmodified review conclusion.',
  ],
  warnings: [],
  sourceFilename: 'Gold_Fields_H1_2026_Interim_Results.pdf',
  pageCount: 36,
  brand: {
    siteName: 'Gold Fields Limited',
    sourceUrl: 'https://www.goldfields.com',
    logoUrl: '/goldfields-logo.svg',
    colors: ['#0f172a', '#eab308', '#0f172a', '#ffffff'],
    primary: '#0f172a',
    accent: '#eab308',
    ink: '#0f172a',
    paper: '#ffffff',
    headingFont: 'Cinzel, Georgia, serif',
    bodyFont: 'Inter, system-ui, sans-serif',
  },
};

export async function seedGoldFieldsResults() {
  await ensureDbReady();
  const db = getDb();
  await ensureResultsSchema(db);

  const document = GOLD_FIELDS_H1_2026_DOCUMENT;
  const presentationHtml = renderResultsHtml(document);
  document.presentationHtml = presentationHtml;

  const now = new Date().toISOString();
  const slug = 'gold-fields-interim-h1-2026';
  const id = 'res_gold_fields_h1_2026';
  const clientId = 'client_goldfields';
  const title = `${document.issuer} — ${document.periodLabel}`;

  // Insert or update published document
  await db.execute({
    sql: `INSERT OR REPLACE INTO results_documents
          (id, client_id, slug, title, status, source_filename, document_json, created_at, updated_at, published_at)
          VALUES (?, ?, ?, ?, 'published', ?, ?, ?, ?, ?)`,
    args: [
      id,
      clientId,
      slug,
      title,
      document.sourceFilename,
      JSON.stringify(document),
      now,
      now,
      now,
    ],
  });

  console.log(`✓ Seeded Gold Fields H1 2026 Results Document:`);
  console.log(`  ID: ${id}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Client ID: ${clientId}`);
  console.log(`  Status: published`);
  console.log(`  Live URL: /results/${slug}`);
}

if (require.main === module) {
  seedGoldFieldsResults()
    .then(() => {
      console.log('Results document seed finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed results document:', err);
      process.exit(1);
    });
}
