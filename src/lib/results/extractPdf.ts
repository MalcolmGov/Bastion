import path from 'path';
import { pathToFileURL } from 'url';

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

export async function extractPdfGlyphs(data: Uint8Array): Promise<{ glyphs: PdfGlyph[]; pageCount: number; shades: PdfShade[] }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const workerPath = path.join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const task = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const pdf = await task.promise;
  const glyphs: PdfGlyph[] = [];
  const shades: PdfShade[] = [];
  const opsMap = pdfjs.OPS as Record<string, number>;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const operators = await page.getOperatorList();
    shades.push(...shadeBands(operators, opsMap, pageNumber));
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
  }

  await pdf.destroy();
  return { glyphs, pageCount: pdf.numPages, shades };
}
