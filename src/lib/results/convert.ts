import fs from 'fs';
import path from 'path';
import { composeResultsDocument } from './compose';
import { extractPdfGlyphs } from './extractPdf';
import { buildSampleResultsPdf } from './sampleBooklet';
import type { ResultsDocument } from './types';

export async function convertPdfBytes(data: Uint8Array, sourceFilename: string): Promise<ResultsDocument> {
  const extracted = await extractPdfGlyphs(data);
  if (!extracted.glyphs.some(glyph => /[\p{L}\p{N}]/u.test(glyph.text))) throw new Error('This PDF has no selectable text. Run OCR on the original PDF, then upload the searchable version. No financial figures have been inferred.');
  const document = composeResultsDocument(extracted.glyphs, extracted.pageCount, sourceFilename, extracted.shades);
  document.sourcePages = extracted.sourcePages;
  document.warnings.push(...extracted.visualWarnings);
  const textPages = new Set(extracted.glyphs.filter(glyph => /[\p{L}\p{N}]/u.test(glyph.text)).map(glyph => glyph.page));
  const imageOnlyPages = extracted.paintedPages.filter(page => !textPages.has(page));
  if (imageOnlyPages.length) document.warnings.push(`Pages ${imageOnlyPages.join(', ')} have no selectable text. They are preserved as source artwork only; use OCR and verify any missing financial content before publishing.`);
  return document;
}

export async function convertSampleBooklet(): Promise<ResultsDocument> {
  const bytes = await buildSampleResultsPdf();
  return convertPdfBytes(bytes, 'helios-gold-interim-results-h1-2026.pdf');
}

export async function convertMerafeExample(): Promise<ResultsDocument> {
  const file = path.join(process.cwd(), 'fixtures/merafe-summarised-results-2025.pdf');
  const bytes = new Uint8Array(fs.readFileSync(file));
  return convertPdfBytes(bytes, 'merafe-summarised-results-2025.pdf');
}
