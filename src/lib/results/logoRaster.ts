import * as cheerio from 'cheerio';
import { createCanvas, Image } from '@napi-rs/canvas';

const TAGS = new Set(['svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'defs', 'lineargradient', 'radialgradient', 'stop', 'clippath', 'mask', 'use', 'title', 'desc']);
const ATTRS = new Set(['xmlns', 'viewbox', 'width', 'height', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'transform', 'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'opacity', 'id', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform', 'clip-path', 'mask', 'href', 'xlink:href', 'xmlns:xlink', 'preserveaspectratio']);

/** Rasterize a restricted, self-contained SVG. No scripts, CSS, entities or remote assets reach the renderer. */
export function rasterizeLogoDataUrl(value: string): string | null {
  if (!/^data:image\/svg\+xml[;,]/i.test(value) || value.length > 250_000) return null;
  try {
    const comma = value.indexOf(',');
    const source = /;base64/i.test(value.slice(0, comma)) ? Buffer.from(value.slice(comma + 1), 'base64').toString('utf8') : decodeURIComponent(value.slice(comma + 1));
    if (/<!DOCTYPE|<!ENTITY/i.test(source)) return null;
    const $ = cheerio.load(source, { xml: true });
    $('*').each((_, element) => {
      const node = $(element);
      if (!TAGS.has(('tagName' in element ? element.tagName : '').toLowerCase())) { node.remove(); return; }
      const attributes = (element as { attribs?: Record<string, string> }).attribs || {};
      for (const [name, content] of Object.entries(attributes)) {
        const lower = name.toLowerCase();
        if (!ATTRS.has(lower) || (['href', 'xlink:href'].includes(lower) && !/^#[\w-]+$/.test(content)) || (/url\s*\(/i.test(content) && !/^url\(#[\w-]+\)$/.test(content)) || /javascript:|data:|https?:|[\u0000-\u001f]/i.test(content) && !lower.startsWith('xmlns')) node.removeAttr(name);
      }
    });
    const svg = $('svg').first();
    if (!svg.length) return null;
    const view = (svg.attr('viewBox') || '').split(/[\s,]+/).map(Number);
    const width = Number.parseFloat(svg.attr('width') || '') || view[2] || 320;
    const height = Number.parseFloat(svg.attr('height') || '') || view[3] || 100;
    if (![width, height].every(n => Number.isFinite(n) && n > 0)) return null;
    const scale = Math.min(2, 1024 / width, 512 / height);
    const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
    if (!svg.attr('viewBox')) svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.attr('width', String(w)).attr('height', String(h)).attr('xmlns', 'http://www.w3.org/2000/svg');
    const image = new Image();
    image.src = Buffer.from(svg.toString());
    const canvas = createCanvas(w, h);
    canvas.getContext('2d').drawImage(image, 0, 0, w, h);
    return `data:image/png;base64,${canvas.toBuffer('image/png').toString('base64')}`;
  } catch { return null; }
}
