import path from 'path';
import { pathToFileURL } from 'url';
import type { ResultsDocument } from './types';

export interface PdfGlyph {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  fontName: string;
}

export interface PdfShade {
  page: number;
  x: number;
  right: number;
}

interface PdfTextItem {
  str?: string;
  width?: number;
  height?: number;
  transform?: number[];
  fontName?: string;
}

function shadeBands(ops: { fnArray: number[]; argsArray: unknown[] }, opsMap: Record<string, number>, page: number): PdfShade[] {
  const shades: PdfShade[] = [];
  let fill = { r: 0, g: 0, b: 0 };
  const take = (coords: number[], at: number, count: number) => {
    const slice = coords.slice(at, at + count);
    return { slice, at: at + count };
  };
  for (let index = 0; index < ops.fnArray.length; index += 1) {
    const name = ops.fnArray[index];
    const args = ops.argsArray[index] as { 0?: number; 1?: number; 2?: number } | number[][] | null;
    if (name === opsMap.setFillRGBColor && args && !Array.isArray(args)) {
      fill = { r: Number(args[0] || 0), g: Number(args[1] || 0), b: Number(args[2] || 0) };
    }
    if (name !== opsMap.constructPath || !Array.isArray(args)) continue;
    const grey = Math.abs(fill.r - fill.g) < 12 && Math.abs(fill.g - fill.b) < 12 && fill.r >= 210 && fill.r <= 245;
    if (!grey) continue;
    const pathOps = args[0] as number[];
    const coords = args[1] as number[];
    if (!pathOps || !coords) continue;
    let at = 0;
    for (const op of pathOps) {
      if (op === opsMap.rectangle) {
        const next = take(coords, at, 4);
        at = next.at;
        const [x, , width, height] = next.slice;
        if (width > 28 && Math.abs(height) > 8) shades.push({ page, x, right: x + width });
        continue;
      }
      if (op === opsMap.moveTo || op === opsMap.lineTo) at += 2;
      else if (op === opsMap.curveTo) at += 6;
      else if (op === opsMap.curveTo2 || op === opsMap.curveTo3) at += 4;
    }
  }
  const unique: PdfShade[] = [];
  for (const shade of shades) {
    if (!unique.some((item) => Math.abs(item.x - shade.x) < 4 && Math.abs(item.right - shade.right) < 4)) unique.push(shade);
  }
  return unique;
}

export async function extractPdfGlyphs(data: Uint8Array): Promise<{ glyphs: PdfGlyph[]; pageCount: number; shades: PdfShade[]; sourcePages: NonNullable<ResultsDocument['sourcePages']>; visualWarnings: string[]; paintedPages: number[] }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const task = pdfjs.getDocument({
    data,
    useSystemFonts: false,
    standardFontDataUrl: path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/'),
    isEvalSupported: false,
  });
  const pdf = await task.promise;
  const glyphs: PdfGlyph[] = [];
  const shades: PdfShade[] = [];
  type Surface = { canvas: unknown; context: CanvasRenderingContext2D };
  const canvasFactory = pdf.canvasFactory as { create(width: number, height: number): Surface; destroy(surface: Surface): void };
  const sourcePages: NonNullable<ResultsDocument['sourcePages']> = [];
  const visualWarnings: string[] = [];
  let imageBytes = 0;
  const pageCount = pdf.numPages;
  const opsMap = pdfjs.OPS as Record<string, number>;
  const paintedPages: number[] = [];
  const paintOps = new Set(['paintImageXObject', 'paintInlineImageXObject', 'paintImageXObjectRepeat', 'paintImageMaskXObject', 'shadingFill', 'fill', 'eoFill', 'stroke', 'fillStroke', 'eoFillStroke'].map(name => opsMap[name]));

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const operators = await page.getOperatorList();
      if (operators.fnArray.some((operation: number) => paintOps.has(operation))) paintedPages.push(pageNumber);
      shades.push(...shadeBands(operators, opsMap, pageNumber));
      // Preserve source artwork (including vector charts) without guessing chart values.
      // Bound both raster work and stored payload size for large investor booklets.
      if (pageNumber <= 40 && imageBytes < 8_000_000) {
        let surface: Surface | undefined;
        try {
          const natural = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(1.5, 1400 / Math.max(natural.width, natural.height)) });
          surface = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
          await page.render({ canvasContext: surface.context, viewport }).promise;
          const canvas = surface.canvas as unknown as { toBuffer(type: string, quality: number): Buffer };
          const image = `data:image/jpeg;base64,${canvas.toBuffer('image/jpeg', 82).toString('base64')}`;
          if (imageBytes + image.length <= 8_000_000) {
            sourcePages.push({ page: pageNumber, width: Math.ceil(viewport.width), height: Math.ceil(viewport.height), image });
            imageBytes += image.length;
          }
        } catch {
          visualWarnings.push(`Source artwork on page ${pageNumber} could not be rendered. Compare that page with the original PDF.`);
        } finally {
          if (surface) canvasFactory.destroy(surface);
        }
      }
      const content = await page.getTextContent();
      for (const item of content.items as PdfTextItem[]) {
        const text = item.str?.replace(/\s+/g, ' ').trim();
        if (!text || !item.transform) continue;
        glyphs.push({
          text,
          x: item.transform[4] ?? 0,
          y: item.transform[5] ?? 0,
          width: item.width ?? 0,
          height: item.height || Math.hypot(item.transform[2] ?? 0, item.transform[3] ?? 0) || 10,
          page: pageNumber,
          fontName: item.fontName || '',
        });
      }
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }
  if (sourcePages.length < pageCount && !visualWarnings.length) visualWarnings.push('Source visual previews are limited to 40 pages and 8 MB. Compare remaining pages with the original PDF.');
  return { glyphs, pageCount, shades, sourcePages, visualWarnings, paintedPages };
}
