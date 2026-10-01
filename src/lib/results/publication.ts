import type { PdfGlyph, PdfShade } from './extractPdf';
import { isFinancialNumber, isYearToken } from './numbers';
import type { PublicationBlock, PublicationMetric, PublicationTable } from './types';

interface Phrase {
  text: string;
  x: number;
  right: number;
  height: number;
  fontName: string;
  financial: boolean;
}

interface Line {
  page: number;
  y: number;
  x: number;
  right: number;
  phrases: Phrase[];
  text: string;
  fontSize: number;
  emphasis: boolean;
  financials: Phrase[];
}

interface FoundTable {
  start: number;
  end: number;
  top: number;
  table: PublicationTable;
}

function clean(value: string): string {
  return value.replace(/[\uE000-\uF8FF]/g, '').replace(/\s+/g, ' ').trim();
}

function words(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

function emphasis(fontName: string): boolean {
  return /bold|black|semibold|demi|_f4$/i.test(fontName);
}

function clusterLines(glyphs: PdfGlyph[]): Line[] {
  const sorted = [...glyphs].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x);
  const groups: PdfGlyph[][] = [];
  for (const glyph of sorted) {
    const current = groups[groups.length - 1];
    const anchor = current?.[0];
    const tolerance = Math.max(2.2, Math.min(glyph.height, anchor?.height || glyph.height) * 0.45);
    if (anchor && anchor.page === glyph.page && Math.abs(anchor.y - glyph.y) <= tolerance) current.push(glyph);
    else groups.push([glyph]);
  }

  return groups.map((group) => {
    const ordered = [...group].sort((a, b) => a.x - b.x);
    const phrases: Phrase[] = [];
    for (const glyph of ordered) {
      const financial = isFinancialNumber(glyph.text);
      const previous = phrases[phrases.length - 1];
      const gap = previous ? glyph.x - previous.right : Number.POSITIVE_INFINITY;
      if (previous && !previous.financial && !financial && gap >= -1 && gap < 7) {
        previous.text = clean(`${previous.text} ${glyph.text}`);
        previous.right = glyph.x + glyph.width;
        if (emphasis(glyph.fontName)) previous.fontName = glyph.fontName;
      } else {
        phrases.push({
          text: glyph.text,
          x: glyph.x,
          right: glyph.x + glyph.width,
          height: glyph.height,
          fontName: glyph.fontName,
          financial,
        });
      }
    }
    return {
      page: ordered[0].page,
      y: ordered.reduce((sum, glyph) => sum + glyph.y, 0) / ordered.length,
      x: ordered[0].x,
      right: Math.max(...ordered.map((glyph) => glyph.x + glyph.width)),
      phrases,
      text: clean(phrases.map((phrase) => phrase.text).join(' ')),
      fontSize: Math.max(...ordered.map((glyph) => glyph.height)),
      emphasis: ordered.some((glyph) => emphasis(glyph.fontName)),
      financials: phrases.filter((phrase) => phrase.financial),
    };
  }).filter((line) => line.text.length > 0);
}

function isFurniture(line: Line): boolean {
  if (/summarised consolidated financial statements for the year ended/i.test(line.text)) return true;
  return /^\d{1,2}$/.test(line.text) && line.y < 56;
}

function isHeaderish(line: Line): boolean {
  if (line.fontSize >= 15 || words(line.text) > 8) return false;
  if (/^(as at|for the year ended)\b/i.test(line.text)) return false;
  if (/r['’]?000|\bnotes?\b|restated|31 december|audited|% of revenue|in relation|to total|net of taxation/i.test(line.text)) return true;
  const years = line.phrases.filter((phrase) => isYearToken(phrase.text));
  return years.length >= 1 && years.length === line.phrases.length;
}

function isSectionish(line: Line): boolean {
  if (/^(as at|for the year ended)\b/i.test(line.text)) return false;
  if (line.financials.length > 0 || line.fontSize >= 15) return false;
  if (line.text.length < 2 || line.text.length > 68) return false;
  if (/[.!?]$/.test(line.text) || words(line.text) > 8) return false;
  if (isHeaderish(line) || isFurniture(line)) return false;
  return true;
}

function isFootnote(line: Line): boolean {
  return /^\*+/.test(line.text) && line.financials.length === 0 && words(line.text) >= 3;
}

function noteColumn(columns: number[], lines: Line[]): number[] {
  if (!columns.length) return columns;
  const first = Math.min(...columns);
  const notes = lines.flatMap((line) => line.financials.filter((phrase) => /^\d{1,2}$/.test(phrase.text.replace(/\s/g, '')) && phrase.right < first - 10));
  if (!notes.length) return columns;
  const right = notes.reduce((sum, phrase) => sum + phrase.right, 0) / notes.length;
  return [right, ...columns];
}

function clusterColumns(lines: Line[]): number[] {
  const edges = lines.flatMap((line) => line.financials.map((phrase) => phrase.right)).sort((a, b) => a - b);
  const groups: number[][] = [];
  for (const edge of edges) {
    const group = groups[groups.length - 1];
    if (!group || edge - group[group.length - 1] > 14) groups.push([edge]);
    else group.push(edge);
  }
  return groups
    .filter((group) => group.length >= 2)
    .map((group) => group.reduce((sum, value) => sum + value, 0) / group.length);
}

function nearestColumn(right: number, columns: number[]): number {
  let best = -1;
  let distance = 36;
  columns.forEach((center, index) => {
    const delta = Math.abs(right - center);
    if (delta < distance) {
      distance = delta;
      best = index;
    }
  });
  return best;
}

function headerText(lines: Line[], columns: number[]): string[] {
  const labels = columns.map(() => '');
  for (const line of lines) {
    for (const phrase of line.phrases) {
      const index = nearestColumn(phrase.right, columns);
      if (index < 0) continue;
      const piece = clean(phrase.text);
      labels[index] = labels[index] ? `${labels[index]}\n${piece}` : piece;
    }
  }
  return labels.map((label) => label.replace(/[ \t]+/g, ' ').replace(/\b([A-Za-z0-9’']{2,})(?:\n\1\b)+/g, '$1').trim());
}

function currentFlags(labels: string[], columns: number[], shades: PdfShade[]): boolean[] {
    const shaded = columns.map((right) => shades.some((shade) => right >= shade.x + 4 && right <= shade.right + 4));
  if (shaded.some(Boolean)) return shaded;
  const years = labels.map((label) => Number(label.match(/20\d{2}/)?.[0] || 0));
  const latest = Math.max(...years);
  if (latest < 1990) return columns.map(() => false);
  const flags = columns.map(() => false);
  let active = false;
  labels.forEach((label, index) => {
    const year = years[index];
    if (year === latest) active = true;
    else if (year && year !== latest) active = false;
    flags[index] = active && !/note/i.test(label);
  });
  return flags;
}

function extractNumericTables(lines: Line[], shades: PdfShade[]): FoundTable[] {
  const found: FoundTable[] = [];
  const used = new Set<number>();
  let index = 0;
  while (index < lines.length) {
    if (used.has(index) || lines[index].financials.length < 2) {
      index += 1;
      continue;
    }
    let start = index;
    while (start > 0 && !used.has(start - 1) && (isHeaderish(lines[start - 1]) || isSectionish(lines[start - 1]))) start -= 1;
    let end = index;
    let dataRows = 1;
    while (end + 1 < lines.length && !used.has(end + 1)) {
      const next = lines[end + 1];
      const gap = lines[end].y - next.y;
      if (next.fontSize >= 15 && next.text.length > 18) break;
      if (dataRows >= 2 && isHeaderish(next) && !isHeaderish(lines[end])) break;
      const tableish = next.financials.length >= 1 || isSectionish(next) || isHeaderish(next) || isFootnote(next);
      if (!tableish || gap > 28) break;
      if (next.financials.length >= 2) dataRows += 1;
      end += 1;
    }
    const slice = lines.slice(start, end + 1);
    const figureLines = slice.filter((line) => line.financials.length >= 2);
    const columns = noteColumn(clusterColumns(figureLines), figureLines);
    if (columns.length < 2 || figureLines.length < 2) {
      index += 1;
      continue;
    }
    const headerLines = slice.filter((line) => isHeaderish(line));
    const labels = headerText(headerLines, columns);
    const firstFigure = Math.min(...figureLines.flatMap((line) => line.financials.map((phrase) => phrase.x)));
    const footnotes: string[] = [];
    const rows = slice.filter((line) => !isHeaderish(line)).flatMap((line) => {
      if (isFootnote(line)) {
        footnotes.push(line.text);
        return [];
      }
      const label = clean(line.phrases
        .filter((phrase) => !phrase.financial && phrase.right < firstFigure - 6)
        .map((phrase) => phrase.text)
        .join(' '));
      if (!label && line.financials.length === 0) return [];
      const cells = columns.map(() => null as string | null);
      if (line.financials.length > 0) {
        for (const phrase of line.financials) {
          const column = nearestColumn(phrase.right, columns);
          if (column >= 0) cells[column] = phrase.text;
        }
      }
      const kind = /^total\b/i.test(label) ? 'total' : !label && line.financials.length >= 2 ? 'subtotal' : line.financials.length === 0 ? 'section' : 'data';
      return [{ kind, label, cells }] as PublicationTable['rows'];
    });
    if (rows.filter((row) => row.kind !== 'section').length < 2) {
      index += 1;
      continue;
    }
    for (let cursor = start; cursor <= end; cursor += 1) used.add(cursor);
    found.push({
      start,
      end,
      top: lines[start].y,
      table: { columns: labels, current: currentFlags(labels, columns, shades), rows, footnotes },
    });
    index = end + 1;
  }
  return found;
}

function isHeading(line: Line): boolean {
  if (isHeaderish(line) || isFurniture(line) || line.financials.length > 0) return false;
  if (/^(as at|for the year ended)\b/i.test(line.text)) return false;
  if (line.fontSize >= 14.5 && line.text.length < 140) return true;
  if (!line.emphasis || line.text.length > 64 || /[.!?:]$/.test(line.text)) return false;
  if (words(line.text) < 1 || words(line.text) > 7) return false;
  if (/^[a-z(]/.test(line.text)) return false;
  return true;
}

function fromPhrases(line: Line, phrases: Phrase[]): Line {
  return {
    ...line,
    x: phrases[0].x,
    right: Math.max(...phrases.map((phrase) => phrase.right)),
    phrases,
    text: clean(phrases.map((phrase) => phrase.text).join(' ')),
    fontSize: Math.max(...phrases.map((phrase) => phrase.height)),
    emphasis: phrases.some((phrase) => emphasis(phrase.fontName)),
    financials: phrases.filter((phrase) => phrase.financial),
  };
}

function flowBlocks(lines: Line[]): PublicationBlock[] {
  const blocks: PublicationBlock[] = [];
  let buffer = '';
  let list: string[] = [];
  const flushParagraph = () => {
    const text = clean(buffer);
    buffer = '';
    if (words(text) >= 4) blocks.push({ kind: 'paragraph', text });
    else if (text && blocks[blocks.length - 1]?.kind === 'paragraph') {
      blocks[blocks.length - 1].text = clean(`${blocks[blocks.length - 1].text} ${text}`);
    } else if (text) blocks.push({ kind: 'paragraph', text });
  };
  const flushList = () => {
    if (list.length >= 3) blocks.push({ kind: 'list', items: list });
    else list.forEach((item) => blocks.push({ kind: 'paragraph', text: item }));
    list = [];
  };
  lines.forEach((line, index) => {
    const listItem = line.text.match(/^(?:\d{1,2}|IBC)\s+\S/);
    if (listItem && line.financials.length <= 1 && words(line.text) < 16 && !/[.!?]$/.test(line.text)) {
      flushParagraph();
      list.push(line.text);
      return;
    }
    if (list.length && words(line.text) <= 8 && !/[.!?]$/.test(line.text) && !/^(?:\d{1,2}|IBC)\s/.test(line.text)) {
      list[list.length - 1] = clean(`${list[list.length - 1]} ${line.text}`);
      return;
    }
    if (list.length) flushList();
    if (/^(as at|for the year ended)$/i.test(line.text)) {
      flushParagraph();
      blocks.push({ kind: 'paragraph', text: line.text });
      return;
    }
    if (isHeading(line)) {
      flushParagraph();
      const previous = blocks[blocks.length - 1];
      if (previous?.kind === 'heading' && previous.level === 3 && previous.text && words(line.text) <= 8) {
        previous.text = clean(`${previous.text} ${line.text}`);
      } else {
        blocks.push({ kind: 'heading', level: line.fontSize >= 14.5 ? 2 : 3, text: line.text });
      }
      return;
    }
    const previous = lines[index - 1];
    const gap = previous ? previous.y - line.y : 0;
    if (buffer && /[.!?]["')\]]*$/.test(buffer) && gap > 14) flushParagraph();
    if (/[A-Za-z]-$/.test(buffer)) buffer = `${buffer.slice(0, -1)}${line.text}`;
    else buffer = buffer ? `${buffer} ${line.text}` : line.text;
  });
  flushParagraph();
  flushList();
  return blocks;
}

function joinColumns(left: PublicationBlock[], right: PublicationBlock[]): PublicationBlock[] {
  if (!left.length) return right;
  if (!right.length) return left;
  const last = left[left.length - 1];
  const first = right[0];
  if (last.kind === 'paragraph' && first.kind === 'paragraph' && last.text && first.text && !/[.!?]"?$/.test(last.text)) {
    return [
      ...left.slice(0, -1),
      { kind: 'paragraph', text: clean(`${last.text} ${first.text}`) },
      ...right.slice(1),
    ];
  }
  return [...left, ...right];
}

function piecesOf(line: Line): Line[] {
  const groups: Phrase[][] = [];
  for (const phrase of line.phrases) {
    const group = groups[groups.length - 1];
    const previous = group?.[group.length - 1];
    const gap = previous ? phrase.x - previous.right : 0;
    if (previous && gap > 16 && !phrase.financial && !previous.financial) groups.push([phrase]);
    else if (group) group.push(phrase);
    else groups.push([phrase]);
  }
  return groups.map((group) => fromPhrases(line, group));
}

function columnGutter(lines: Line[]): number | null {
  const narrow = lines.filter((line) => line.fontSize < 14.5 && line.right - line.x < 300);
  if (narrow.length < 8) return null;
  const clusters: number[][] = [];
  for (const start of narrow.map((line) => line.x).sort((a, b) => a - b)) {
    const group = clusters[clusters.length - 1];
    if (!group || start - group[group.length - 1] > 48) clusters.push([start]);
    else group.push(start);
  }
  const ranked = [...clusters].sort((a, b) => b.length - a.length).slice(0, 2).sort((a, b) => a[0] - b[0]);
  if (ranked.length < 2 || ranked[0].length < 4 || ranked[1].length < 4) return null;
  if (ranked[1][0] - ranked[0][0] < 70) return null;
  return (ranked[0][ranked[0].length - 1] + ranked[1][0]) / 2;
}

function proseBlocks(lines: Line[]): PublicationBlock[] {
  if (!lines.length) return [];
  const pieces = lines.flatMap((line) => piecesOf(line));
  const gutter = columnGutter(pieces);
  if (!gutter) return flowBlocks(pieces);
  const blocks: PublicationBlock[] = [];
  let left: Line[] = [];
  let right: Line[] = [];
  const flushColumns = () => {
    if (!left.length && !right.length) return;
    blocks.push(...joinColumns(flowBlocks(left), flowBlocks(right)));
    left = [];
    right = [];
  };
  for (const line of pieces) {
    if (line.fontSize >= 14.5 && line.financials.length === 0) {
      flushColumns();
      blocks.push(...flowBlocks([line]));
      continue;
    }
    (line.x < gutter ? left : right).push(line);
  }
  flushColumns();
  return blocks;
}

function isMetricPage(lines: Line[]): boolean {
  const values = lines.filter((line) => line.fontSize >= 16 && line.text.length < 28 && line.financials.length <= 1);
  return values.length >= 4 && !lines.some((line) => line.financials.length >= 2);
}

function metricBlocks(lines: Line[]): PublicationBlock[] {
  const title = lines.find((line) => line.fontSize >= 15);
  const groups = lines.filter((line) => line.emphasis && line.fontSize < 14 && words(line.text) <= 3 && line.phrases.length === 1);
  const bands = new Map<number, Line[]>();
  for (const line of lines) {
    if (title && line === title) continue;
    if (groups.includes(line)) continue;
    const key = [...bands.keys()].find((start) => Math.abs(start - line.x) < 50) ?? line.x;
    bands.set(key, [...(bands.get(key) || []), line]);
  }
  const metrics: PublicationMetric[] = [];
  for (const band of bands.values()) {
    const ordered = [...band].sort((a, b) => b.y - a.y);
    ordered.forEach((line, index) => {
      if (line.fontSize < 16) return;
      const caption: string[] = [];
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        const prior = ordered[cursor];
        if (prior.fontSize >= 16 || /^\(/.test(prior.text)) break;
        caption.unshift(prior.text);
      }
      const comparison = ordered[index + 1]?.text.startsWith('(') ? ordered[index + 1].text : '';
      const group = [...groups].reverse().find((item) => item.y > line.y)?.text || '';
      if (caption.length) metrics.push({ group, label: clean(caption.join(' ')), value: line.text, comparison });
    });
  }
  const blocks: PublicationBlock[] = [];
  if (title) blocks.push({ kind: 'heading', level: 2, text: title.text });
  if (metrics.length) blocks.push({ kind: 'metrics', metrics });
  const footnote = lines.find((line) => /^\*/.test(line.text));
  if (footnote) blocks.push({ kind: 'paragraph', text: footnote.text });
  return blocks;
}

function coverBlocks(lines: Line[]): PublicationBlock[] {
  const blocks: PublicationBlock[] = [];
  const tagline = lines.find((line) => /delivering today|investing in tomorrow/i.test(line.text));
  const title = clean(lines
    .filter((line) => line !== tagline && !/^(19|20)\d{2}$/.test(line.text) && line.fontSize >= 11)
    .map((line) => line.text)
    .join(' '));
  if (title) blocks.push({ kind: 'heading', level: 2, text: title });
  if (tagline) blocks.push({ kind: 'paragraph', text: tagline.text });
  return blocks;
}

function textGrid(lines: Line[], used: Set<number>): FoundTable[] {
  const found: FoundTable[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (used.has(index)) continue;
    const header = lines[index];
    if (header.phrases.length < 3 || header.financials.length > 0 || words(header.text) > 16) continue;
    const anchors = header.phrases.map((phrase) => phrase.x);
    if (anchors[1] - anchors[0] < 40) continue;
    let end = index;
    while (end + 1 < lines.length && !used.has(end + 1)) {
      const next = lines[end + 1];
      if (next.fontSize >= 14.5 || next.financials.length >= 2) break;
      const aligned = next.phrases.every((phrase) => anchors.some((anchor) => Math.abs(phrase.x - anchor) < 24));
      if (!aligned || lines[end].y - next.y > 22) break;
      end += 1;
    }
    if (end === index) continue;
    const body = lines.slice(index + 1, end + 1);
    const rows: PublicationTable['rows'] = [];
    let current: string[] = anchors.map(() => '');
    let previousY = header.y;
    const push = () => {
      if (current.some((cell) => cell.trim())) {
        rows.push({ kind: 'data', label: clean(current[0]), cells: current.slice(1).map((cell) => clean(cell) || null) });
      }
      current = anchors.map(() => '');
    };
    for (const line of body) {
      if (previousY - line.y > 15 && current.some((cell) => cell.trim())) push();
      for (const phrase of line.phrases) {
        let column = 0;
        let distance = Number.POSITIVE_INFINITY;
        anchors.forEach((anchor, anchorIndex) => {
          const delta = Math.abs(phrase.x - anchor);
          if (delta < distance) {
            distance = delta;
            column = anchorIndex;
          }
        });
        current[column] = clean(current[column] ? `${current[column]} ${phrase.text}` : phrase.text);
      }
      previousY = line.y;
    }
    push();
    if (rows.length < 2) continue;
    for (let cursor = index; cursor <= end; cursor += 1) used.add(cursor);
    found.push({
      start: index,
      end,
      top: header.y,
      table: {
        columns: header.phrases.slice(1).map((phrase) => phrase.text),
        current: header.phrases.slice(1).map(() => false),
        rows,
        footnotes: [],
      },
    });
  }
  return found;
}

function layoutPage(lines: Line[], shades: PdfShade[]): PublicationBlock[] {
  const body = lines.filter((line) => !isFurniture(line));
  if (!body.length) return [];
  if (body.some((line) => line.fontSize >= 28)) return coverBlocks(body);
  if (isMetricPage(body)) return metricBlocks(body);
  const numeric = extractNumericTables(body, shades);
  const used = new Set<number>();
  numeric.forEach((table) => {
    for (let index = table.start; index <= table.end; index += 1) used.add(index);
  });
  const grids = textGrid(body, used);
  const events: Array<{ y: number; blocks: PublicationBlock[] }> = [
    ...numeric.map((table) => ({ y: table.top, blocks: [{ kind: 'table' as const, table: table.table }] })),
    ...grids.map((table) => ({ y: table.top, blocks: [{ kind: 'table' as const, table: table.table }] })),
  ];
  const cuts = events.map((event) => event.y);
  const remaining = body.filter((_, index) => !used.has(index));
  let segment: Line[] = [];
  const flushSegment = () => {
    if (!segment.length) return;
    events.push({ y: segment[0].y, blocks: proseBlocks(segment) });
    segment = [];
  };
  for (const line of remaining) {
    const split = segment.length > 0 && cuts.some((y) => segment[segment.length - 1].y > y && line.y < y);
    if (split) flushSegment();
    segment.push(line);
  }
  flushSegment();
  return events.sort((a, b) => b.y - a.y).flatMap((event) => event.blocks);
}

export function buildPublication(glyphs: PdfGlyph[], shades: PdfShade[] = []): PublicationBlock[] {
  const lines = clusterLines(glyphs);
  const pages = [...new Set(lines.map((line) => line.page))].sort((a, b) => a - b);
  return pages.flatMap((page) => layoutPage(
    lines.filter((line) => line.page === page),
    shades.filter((shade) => shade.page === page),
  ));
}
