import type { PdfGlyph } from './extractPdf';

interface Phrase { text: string; x: number; right: number }
interface HeaderLine { phrases: Phrase[] }

export function isWordHyphen(glyph: PdfGlyph, index: number, ordered: PdfGlyph[]): boolean {
  const before = ordered[index - 1];
  const after = ordered[index + 1];
  return /^[-‐‑]$/.test(glyph.text) && Boolean(before && after
    && /[A-Za-z]$/.test(before.text) && /^[A-Za-z]/.test(after.text)
    && Math.abs(glyph.x - before.x - before.width) < 3
    && Math.abs(after.x - glyph.x - glyph.width) < 3);
}

/** Expand grouped year/state headings across the columns they span. */
export function restatementHeaders(lines: HeaderLine[], columns: number[], labels: string[]): string[] {
  const phrases = lines.flatMap((line) => line.phrases);
  const states = phrases.filter((phrase) => /^(previously|currently)(?: stated)?$/i.test(phrase.text)).sort((a, b) => a.x - b.x);
  if (!states.some((phrase) => /^previously/i.test(phrase.text)) || !states.some((phrase) => /^currently/i.test(phrase.text))) return labels;
  const years = phrases.filter((phrase) => /^(19|20)\d{2}$/.test(phrase.text)).sort((a, b) => a.x - b.x);
  const closest = (right: number, candidates: Phrase[]) => candidates.reduce<Phrase | undefined>((best, phrase) => !best
    || Math.abs(right - (phrase.x + phrase.right) / 2) < Math.abs(right - (best.x + best.right) / 2) ? phrase : best, undefined);
  return columns.map((right, index) => {
    const state = closest(right, states)?.text.match(/previously|currently/i)?.[0] || '';
    const year = closest(right, years)?.text || labels[index].match(/(19|20)\d{2}/)?.[0] || '';
    const detail = labels[index].replace(/(19|20)\d{2}|previously|currently|stated|group/gi, '').replace(/\s+/g, ' ').trim();
    return [year, `${state} stated`, detail].filter(Boolean).join('\n');
  });
}

export function mergeWrappedLabels<T extends { text: string; y: number; financials: unknown[]; phrases: unknown[] }>(lines: T[]): T[] {
  const merged: T[] = [];
  for (const line of lines) {
    const previous = merged[merged.length - 1];
    if (previous && previous.financials.length === 0 && line.financials.length >= 2
        && previous.y - line.y > 0 && previous.y - line.y <= 14
        && /\b(with|and|of|for|to|the|in|on|at|from)$/i.test(previous.text)) {
      merged[merged.length - 1] = { ...line, text: `${previous.text} ${line.text}`, phrases: [...previous.phrases, ...line.phrases] };
    } else merged.push(line);
  }
  return merged;
}
