import type { PublicationBlock, PublicationTable, ResultsDocument, ResultsStatement } from './types';

function normalizeLabel(value: string): string {
  return value.toLowerCase().replace(/&amp;/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

function headingBefore(blocks: PublicationBlock[], index: number): string {
  const parts: string[] = [];
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const block = blocks[cursor];
    if (block.kind === 'table') break;
    if (block.kind === 'heading' && block.text) parts.unshift(block.text);
    if (parts.length >= 2) break;
  }
  return parts.join(' ');
}

function titleScore(statement: ResultsStatement, heading: string): number {
  const words = new Set(normalizeLabel(statement.title).split(' ').filter((word) => word.length > 2));
  if (!words.size) return 0;
  return normalizeLabel(heading).split(' ').filter((word) => word.length > 2 && words.has(word)).length;
}

function overlap(statement: ResultsStatement, table: PublicationTable): number {
  const labels = new Set(table.rows.map((row) => normalizeLabel(row.label)).filter(Boolean));
  return statement.rows.filter((row) => row.kind !== 'section' && labels.has(normalizeLabel(row.label))).length;
}

function writeCell(cells: Array<string | null>, cellIndex: number, previousValue: string | null, nextValue: string): void {
  const value = nextValue.trim() ? nextValue.trim() : null;
  const previous = (previousValue || '').trim();
  const sameSlot = cellIndex >= 0 && cellIndex < cells.length && (!previous || (cells[cellIndex] || '').trim() === previous);
  if (sameSlot) {
    cells[cellIndex] = value;
    return;
  }
  const matches = cells
    .map((cell, index) => ((cell || '').trim() === previous ? index : -1))
    .filter((index) => index >= 0);
  if (previous && matches.length > 0) {
    const target = matches.reduce((best, index) => (Math.abs(index - cellIndex) < Math.abs(best - cellIndex) ? index : best));
    cells[target] = value;
    return;
  }
  if (cellIndex >= 0 && cellIndex < cells.length) cells[cellIndex] = value;
}

/**
 * Copies one edited statement figure into the publication table that is rendered.
 * Other cells, tables, and the current-year shading stay as extracted.
 * Returns false when the published booklet has no matching row.
 */
export function applyFigureEdit(
  document: ResultsDocument,
  statementId: string,
  rowId: string,
  cellIndex: number,
  previousValue: string | null,
): boolean {
  const blocks = document.publication;
  const statement = document.statements.find((item) => item.id === statementId);
  const source = statement?.rows.find((item) => item.id === rowId);
  if (!blocks?.length || !statement || !source || source.kind === 'section') return false;

  const wanted = normalizeLabel(source.label);
  if (!wanted) return false;
  const nextValue = source.cells[cellIndex] ?? '';

  const candidates = blocks.flatMap((block, index) => {
    if (block.kind !== 'table' || !block.table) return [];
    const rows = block.table.rows.filter((row) => row.kind !== 'section' && normalizeLabel(row.label) === wanted);
    if (!rows.length) return [];
    return [{
      table: block.table,
      rows,
      score: overlap(statement, block.table) + titleScore(statement, headingBefore(blocks, index)) * 2,
    }];
  }).sort((left, right) => right.score - left.score);

  const match = candidates[0];
  if (!match) return false;
  const previous = (previousValue || '').trim();
  const row = match.rows.find((item) => previous && item.cells.some((cell) => (cell || '').trim() === previous)) || match.rows[0];
  writeCell(row.cells, cellIndex, previousValue, nextValue);
  return true;
}
