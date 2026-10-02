import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as cheerio from 'cheerio';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { applyFigureEdit } from '../src/lib/results/applyFigureEdit';
import { convertPdfBytes, convertSampleBooklet } from '../src/lib/results/convert';
import { isFinancialNumber } from '../src/lib/results/numbers';
import { renderResultsHtml } from '../src/lib/results/renderHtml';
import type { ResultsDocument, ResultsStatement } from '../src/lib/results/types';

async function fragmentedPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([595.28, 841.89]);
  const paint = (text: string, x: number, y: number, size: number, face = font) => {
    page.drawText(text, { x, y, size, font: face });
  };
  paint('NORTH', 48, 780, 16, bold);
  paint('RANGE', 108, 780, 16, bold);
  paint('PLC', 175, 780, 16, bold);
  paint('Half-year', 48, 756, 11);
  paint('results', 108, 756, 11);
  paint('ended', 158, 756, 11);
  paint('30', 200, 756, 11);
  paint('June', 220, 756, 11);
  paint('2026', 252, 756, 11);
  paint('Group', 48, 700, 12, bold);
  paint('income', 92, 700, 12, bold);
  paint('statement', 140, 700, 12, bold);
  const rights = [400, 500];
  const header = ['2026', '2025'];
  header.forEach((value, index) => {
    const width = bold.widthOfTextAtSize(value, 10);
    paint(value, rights[index] - width, 676, 10, bold);
  });
  const rows: Array<[string[], string, string]> = [
    [['Revenue'], '2,410', '2,105'],
    [['Cost', 'of', 'sales'], '(1,440)', '(1,302)'],
    [['Operating', 'profit'], '970', '803'],
  ];
  rows.forEach((row, rowIndex) => {
    const y = 652 - rowIndex * 18;
    let x = 48;
    row[0].forEach((word) => {
      paint(word, x, y, 10);
      x += font.widthOfTextAtSize(word, 10) + 3.2;
    });
    [row[1], row[2]].forEach((value, index) => {
      const width = font.widthOfTextAtSize(value, 10);
      paint(value, rights[index] - width, y, 10);
    });
  });
  return pdf.save();
}

function cell(documentTitle: string, label: string, values: string[]) {
  return { documentTitle, label, values };
}

function testFigureEdit() {
  const document: ResultsDocument = {
    issuer: 'Example',
    title: 'Year ended 31 December 2025',
    periodLabel: 'Year ended 31 December 2025',
    unit: 'R’000',
    narrative: [],
    highlights: [],
    notes: [],
    warnings: [],
    sourceFilename: 'example.pdf',
    pageCount: 1,
    statements: [
      {
        id: 'stmt_income',
        title: 'Summarised consolidated statement of profit or loss',
        period: '',
        stubLabel: '',
        columns: [
          { id: 'note', label: 'Notes', role: 'note' },
          { id: 'current', label: '2025', role: 'figure' },
          { id: 'prior', label: '2024', role: 'figure' },
        ],
        rows: [
          { id: 'revenue', label: 'Revenue', kind: 'data', cells: ['5', '5 834 877', '8 443 462'], confidence: 1 },
          { id: 'cost', label: 'Cost of sales', kind: 'data', cells: [null, '(4 000)', '(5 000)'], confidence: 1 },
        ],
        confidence: 1,
      },
      {
        id: 'stmt_short',
        title: 'Cash generated',
        period: '',
        stubLabel: '',
        columns: [
          { id: 'current', label: '2025', role: 'figure' },
          { id: 'prior', label: '2024', role: 'figure' },
        ],
        rows: [
          { id: 'generated', label: 'Cash generated from operations', kind: 'data', cells: ['679 466', '2 034 712'], confidence: 1 },
        ],
        confidence: 1,
      },
    ],
    publication: [
      { kind: 'heading', level: 2, text: 'Summarised consolidated statement of profit or loss' },
      {
        kind: 'table',
        table: {
          columns: ['Notes', '2025', '2024'],
          current: [false, true, false],
          footnotes: [],
          rows: [
            { kind: 'data', label: 'Revenue', cells: ['5', '5 834 877', '8 443 462'] },
            { kind: 'data', label: 'Cost of sales', cells: [null, '(4 000)', '(5 000)'] },
          ],
        },
      },
      { kind: 'heading', level: 2, text: 'Revenue destination — ferrochrome' },
      {
        kind: 'table',
        table: {
          columns: ['2025', '2024'],
          current: [true, false],
          footnotes: [],
          rows: [
            { kind: 'data', label: 'Revenue', cells: ['119 182', '212 617'] },
          ],
        },
      },
      { kind: 'heading', level: 2, text: 'Cash generated from operations' },
      {
        kind: 'table',
        table: {
          columns: ['2025', '2024'],
          current: [true, false],
          footnotes: [],
          rows: [
            { kind: 'data', label: 'Cash generated from operations', cells: ['679 466', '2 034 712'] },
          ],
        },
      },
    ],
  };

  const revenue = document.statements[0].rows[0];
  const previous = revenue.cells[1];
  revenue.cells[1] = '5 000 000';
  assert.equal(applyFigureEdit(document, 'stmt_income', 'revenue', 1, previous), true);
  const incomeTable = document.publication?.[1].table;
  const destination = document.publication?.[3].table;
  assert.deepEqual(incomeTable?.rows[0].cells, ['5', '5 000 000', '8 443 462']);
  assert.deepEqual(incomeTable?.rows[1].cells, [null, '(4 000)', '(5 000)']);
  assert.deepEqual(incomeTable?.current, [false, true, false]);
  assert.deepEqual(destination?.rows[0].cells, ['119 182', '212 617']);

  const generated = document.statements[1].rows[0];
  const prior = generated.cells[0];
  generated.cells[0] = '700 000';
  assert.equal(applyFigureEdit(document, 'stmt_short', 'generated', 0, prior), true);
  assert.deepEqual(document.publication?.[5].table?.rows[0].cells, ['700 000', '2 034 712']);

  const html = renderResultsHtml(document);
  const $ = cheerio.load(html);
  const rendered = $('th').filter((_, node) => $(node).text() === 'Revenue').first().parent().find('td').toArray().map((node) => $(node).text());
  assert.deepEqual(rendered, ['5', '5 000 000', '8 443 462']);
  assert.equal($('td.current').first().text(), '5 000 000');
  assert.equal(applyFigureEdit(document, 'stmt_income', 'missing', 0, null), false);
}

async function main() {
  testFigureEdit();
  assert.equal(isFinancialNumber('(1,104)'), true);
  assert.equal(isFinancialNumber('(4%)'), true);
  assert.equal(isFinancialNumber('1,486'), true);
  assert.equal(isFinancialNumber('2026'), false);
  assert.equal(isFinancialNumber('H1 2026'), false);

  const document = await convertSampleBooklet();
  const income = document.statements.find((statement) => /income statement/i.test(statement.title));
  const operations = document.statements.find((statement) => /operational review/i.test(statement.title));

  assert.ok(income, `missing income statement. Found: ${document.statements.map((statement) => statement.title).join(', ')}`);
  assert.ok(operations, `missing operational review. Found: ${document.statements.map((statement) => statement.title).join(', ')}`);
  assert.match(document.issuer, /HELIOS GOLD LIMITED/);
  assert.ok(document.narrative.length >= 2, 'expected narrative paragraphs');
  assert.ok(document.notes.length >= 2, `expected notes, got ${document.notes.join(' | ')}`);

  const expected = [
    cell('income', 'Revenue', ['1,842', '1,615', '14%']),
    cell('income', 'Cost of sales', ['(1,104)', '(1,021)', '8%']),
    cell('income', 'Profit for the period', ['247', '163', '52%']),
    cell('operations', 'All-in sustaining cost (US$/oz)', ['1,486', '1,542', '(4%)']),
    cell('operations', 'Attributable gold production (koz)', ['612', '574', '7%']),
  ];

  for (const item of expected) {
    const statement: ResultsStatement = (item.documentTitle === 'income' ? income : operations) as ResultsStatement;
    const row = statement.rows.find((candidate) => candidate.label === item.label);
    assert.ok(row, `missing row ${item.label}`);
    assert.deepEqual(row.cells, item.values, `${item.label} cells`);
    assert.equal(row.confidence, 1, `${item.label} confidence`);
  }

  assert.deepEqual(income.columns.map((column) => column.label), ['H1 2026', 'H1 2025', 'Change']);
  assert.ok(document.highlights.some((highlight) => highlight.label === 'Revenue' && highlight.value === '1,842'));
  assert.equal(document.warnings.length, 0, document.warnings.join('\n'));

  const fragmented = await convertPdfBytes(await fragmentedPdf(), 'north-range.pdf');
  const group = fragmented.statements.find((statement) => /income statement/i.test(statement.title));
  assert.ok(group, `fragmented title missing: ${fragmented.statements.map((statement) => statement.title).join(', ')}`);
  const cost = group.rows.find((row) => row.label === 'Cost of sales');
  assert.ok(cost, `fragmented labels: ${group.rows.map((row) => row.label).join(' | ')}`);
  assert.deepEqual(cost.cells, ['(1,440)', '(1,302)']);
  assert.equal(group.columns.map((column) => column.label).join(','), '2026,2025');

  const merafePath = 'fixtures/merafe-summarised-results-2025.pdf';
  if (fs.existsSync(merafePath)) {
    const merafe = await convertPdfBytes(new Uint8Array(fs.readFileSync(merafePath)), 'merafe_financial_results_4200.pdf');
    assert.match(merafe.issuer, /MERAFE RESOURCES LIMITED/);
    assert.equal(merafe.periodLabel, 'Year ended 31 December 2025');
    const position = merafe.statements.find((statement) => /financial position/i.test(statement.title));
    const income = merafe.statements.find((statement) => /profit or loss/i.test(statement.title));
    const cash = merafe.statements.find((statement) => /cash flows/i.test(statement.title));
    assert.ok(position, merafe.statements.map((statement) => statement.title).join(' | '));
    assert.ok(income, 'missing profit or loss');
    assert.ok(cash, 'missing cash flows');
    const equipment = position.rows.find((row) => row.label === 'Property, plant and equipment');
    assert.deepEqual(equipment?.cells.filter((cell) => cell && !/^\d{1,2}$/.test(cell)), ['1 147 920', '1 124 913']);
    const revenue = income.rows.find((row) => row.label === 'Revenue');
    assert.ok(revenue, income.rows.map((row) => row.label).join(' | '));
    assert.deepEqual(revenue.cells.filter((cell) => cell && !/^\d{1,2}$/.test(cell)), ['5 834 877', '8 443 462']);
    assert.equal(revenue.cells.find((cell) => cell === '5'), '5');
    const generated = cash.rows.find((row) => /Cash generated from operations/.test(row.label));
    assert.deepEqual(generated?.cells.filter((cell) => cell && !/^\d{1,2}$/.test(cell)), ['679 466', '2 034 712']);
    const revenueCard = merafe.highlights.find((highlight) => /R5 835 million/.test(highlight.value));
    assert.ok(revenueCard, JSON.stringify(merafe.highlights));
    assert.match(revenueCard.label, /revenue/i);
    assert.equal(merafe.highlights.some((highlight) => highlight.value === '2024'), false);
    assert.ok(merafe.narrative.some((paragraph) => /ferrochrome sales/i.test(paragraph)), 'commentary was not read in column order');
    assert.ok(merafe.narrative.length >= 2 && merafe.narrative.length <= 12, `narrative length ${merafe.narrative.length}`);
    assert.ok(merafe.narrative.every((paragraph) => paragraph.split(/\s+/).length >= 12), merafe.narrative.join('\n---\n'));
    const publication = merafe.publication || [];
    const positionTable = publication.find((block) => block.table?.rows.some((row) => row.label === 'Property, plant and equipment'));
    const equipmentRow = positionTable?.table?.rows.find((row) => row.label === 'Property, plant and equipment');
    assert.deepEqual(equipmentRow?.cells, [null, '1 147 920', '1 124 913']);
    assert.deepEqual(positionTable?.table?.current, [false, true, false]);
    assert.ok(publication.some((block) => /ferrochrome sales volumes to 124kt/.test(block.text || '')));
    assert.ok(publication.some((block) => block.kind === 'heading' && /Basis of preparation/.test(block.text || '')));
    assert.ok(publication.some((block) => /gross final cash dividend of 8 cents/.test(block.text || '')));
    const cashTable = publication.find((block) => block.table?.rows.some((row) => /Cash generated from operations/.test(row.label)));
    const generatedRow = cashTable?.table?.rows.find((row) => /Cash generated from operations/.test(row.label));
    assert.deepEqual(generatedRow?.cells.filter((cell) => cell && !/^\d{1,2}$/.test(cell)), ['679 466', '2 034 712']);
    assert.ok(equipment && position);
    const equipmentIndex = equipment.cells.findIndex((cell) => cell === '1 147 920');
    const equipmentPrevious = equipment.cells[equipmentIndex];
    equipment.cells[equipmentIndex] = '2 222 222';
    assert.equal(applyFigureEdit(merafe, position.id, equipment.id, equipmentIndex, equipmentPrevious), true);
    assert.deepEqual(equipmentRow?.cells, [null, '2 222 222', '1 124 913']);
    assert.deepEqual(positionTable?.table?.current, [false, true, false]);
    const corrected = cheerio.load(renderResultsHtml(merafe));
    const correctedCells = corrected('th').filter((_, node) => corrected(node).text() === 'Property, plant and equipment').first().parent().find('td');
    assert.equal(correctedCells.eq(1).text(), '2 222 222');
    assert.equal(correctedCells.eq(1).hasClass('current'), true);
    assert.equal(correctedCells.eq(2).text(), '1 124 913');
    assert.equal(correctedCells.eq(2).hasClass('current'), false);
    console.log('merafe conversion ok', {
      statements: merafe.statements.map((statement) => statement.title),
      warnings: merafe.warnings.length,
      narrative: merafe.narrative.length,
      highlights: merafe.highlights.map((highlight) => `${highlight.label} => ${highlight.value}`),
    });
  }

  console.log('results conversion ok', {
    statements: document.statements.map((statement) => ({
      title: statement.title,
      rows: statement.rows.length,
      columns: statement.columns.map((column) => column.label),
    })),
    highlights: document.highlights.map((highlight) => highlight.label),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
