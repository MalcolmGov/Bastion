import { execFile } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import { normalizeUrl, validateSafeUrl } from '@/lib/studio/importer';
import type { ResultsBrand } from './types';

const curl = promisify(execFile);

const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

function expandHex(value: string): string | null {
  const match = value.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!match) return null;
  const raw = match[1];
  const full = raw.length === 3 ? raw.split('').map((char) => char + char).join('') : raw;
  return `#${full.toLowerCase()}`;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (value: number) => {
    const srgb = value / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const l = (max + min) / 2;
  return (max - min) / (1 - Math.abs(2 * l - 1));
}

const FRAMEWORK_COLORS = new Set([
  '#7a00df', '#007cba', '#0073aa', '#00a0d2', '#826eb4', '#f78da7',
  '#cf2e2e', '#ff6900', '#fcb900', '#00d084', '#0693e3', '#9b51e0', '#abb8c3',
]);

export function chooseBrandColors(found: string[]): Pick<ResultsBrand, 'colors' | 'primary' | 'accent' | 'ink' | 'paper'> {
  const counts = new Map<string, number>();
  for (const value of found) {
    const hex = expandHex(value);
    if (!hex || FRAMEWORK_COLORS.has(hex)) continue;
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const colorful = ranked.filter((hex) => saturation(hex) > 0.08 && luminance(hex) > 0.02 && luminance(hex) < 0.85);
  const neutralDark = ranked.filter((hex) => luminance(hex) < 0.28 && saturation(hex) < 0.35);
  const light = ranked.filter((hex) => luminance(hex) > 0.92 && hex !== '#ffffff');
  const primary = neutralDark[0] || '#1c1c1c';
  const accent = colorful.find((hex) => hex !== primary) || '#c8a064';
  return {
    colors: ranked.slice(0, 6),
    primary,
    accent,
    ink: neutralDark[0] || '#1c1c1c',
    paper: light[0] || '#f4f1ea',
  };
}

function absoluteUrl(value: string | undefined, base: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('data:')) return null;
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

function cleanFontName(value: string): string {
  return value.replace(/['"]/g, '').replace(/\s*!important\s*/i, '').trim();
}

function tidySiteName(value: string): string {
  return value
    .replace(/\s*[:|\-–—]\s*home\s*$/i, '')
    .replace(/^home\s*[:|\-–—]\s*/i, '')
    .trim();
}

function isDecorativeAsset(value: string): boolean {
  return /spinner|loader|loading|busy|placeholder|spacer|pixel|1x1|blank|tracking/i.test(value);
}

function googleFamilies(value: string): string[] {
  const names: string[] = [];
  const decoded = decodeURIComponent(value);
  for (const match of decoded.matchAll(/family=([^:&]+)/gi)) {
    const name = match[1].replace(/\+/g, ' ').trim();
    if (name) names.push(name);
  }
  return names;
}

function readFont(css: string, extras: string[] = []): { headingFont: string; bodyFont: string } {
  const ignore = /inherit|initial|unset|system-ui|fontawesome|font-awesome|var\(/i;
  const generic = /^(serif|sans-serif|monospace|cursive|fantasy)$/i;
  const keep = (name: string) => Boolean(name) && !ignore.test(name) && !generic.test(name);
  const familiesOf = (value: string | undefined): string[] => (
    [...new Set((value || '').split(',').map(cleanFontName).filter(keep))].slice(0, 3)
  );
  const bodyRule = css.match(/(?:html\s*,\s*)?body[^{]*\{[^}]*font-family\s*:\s*([^;}{]+)/i);
  const headingRule = css.match(/h1[^{]*\{[^}]*font-family\s*:\s*([^;}{]+)/i);
  const scanned = [...css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)].flatMap((match) => familiesOf(match[1]));
  const bodyFamilies = familiesOf(bodyRule?.[1]);
  const headingFamilies = familiesOf(headingRule?.[1]);
  const bodyFont = (bodyFamilies.length ? bodyFamilies : [...new Set([...extras, ...scanned])].slice(0, 3)).join(', ') || 'inherit';
  const headingFont = (headingFamilies.length ? headingFamilies : bodyFamilies).join(', ') || bodyFont;
  return { headingFont, bodyFont };
}

function logoFromIcon($: cheerio.CheerioAPI, pageUrl: string): string | null {
  const icon = $('.header__logo [data-icon], [class*="logo" i] [data-icon]').first();
  const name = icon.attr('data-icon')?.trim();
  const path = icon.attr('data-path')?.trim();
  if (!name || !path || isDecorativeAsset(`${name} ${path}`)) return null;
  const folder = path.endsWith('/') ? path : `${path}/`;
  return absoluteUrl(`${folder}${name}.svg`, pageUrl);
}

export function parseBrandHtml(html: string, pageUrl: string, stylesheet = ''): ResultsBrand {
  const $ = cheerio.load(html);
  const titleParts = $('title').first().text().split(/[|\-–—]/).map((part) => tidySiteName(part)).filter((part) => part && !/^home$/i.test(part));
  const named = [
    $('meta[property="og:site_name"]').attr('content') || '',
    $('meta[name="application-name"]').attr('content') || '',
  ].map(tidySiteName).find((part) => part && !/^home$/i.test(part));
  const siteName = named || titleParts[0] || 'Client';

  const logoImage = $('img').toArray().map((node) => {
    const src = $(node).attr('src') || '';
    const hint = `${src} ${$(node).attr('class') || ''} ${$(node).attr('alt') || ''} ${$(node).attr('id') || ''}`;
    return { src, hint };
  }).find((image) => /logo/i.test(image.hint) && !isDecorativeAsset(image.hint));
  const touchIcon = $('link[rel="apple-touch-icon"]').toArray()
    .map((node) => ({ href: $(node).attr('href') || '', size: Number.parseInt(($(node).attr('sizes') || '0').split('x')[0] || '0', 10) || 0 }))
    .sort((left, right) => right.size - left.size)[0]?.href;
  const logoCandidates = [
    logoFromIcon($, pageUrl),
    absoluteUrl(logoImage?.src, pageUrl),
    absoluteUrl(touchIcon, pageUrl),
    absoluteUrl($('link[rel="icon"][type="image/svg+xml"], link[rel="icon"]').first().attr('href'), pageUrl),
    absoluteUrl($('meta[property="og:image"]').attr('content'), pageUrl),
  ];
  const logoUrl = logoCandidates.find((value) => value && !isDecorativeAsset(value)) || null;

  const styleText = $('style').toArray().map((node) => $(node).text()).join('\n');
  const inline = $('[style]').toArray().map((node) => $(node).attr('style') || '').join('\n');
  const theme = [
    $('meta[name="theme-color"]').attr('content') || '',
    $('meta[name="msapplication-TileColor"]').attr('content') || '',
  ].join(' ');
  const found = `${theme}\n${styleText}\n${inline}\n${stylesheet}`.match(HEX) || [];
  const colors = chooseBrandColors(found);
  const googleLinks = $('link[href*="fonts.googleapis.com"]').toArray().map((node) => $(node).attr('href') || '');
  const fonts = readFont(`${stylesheet}\n${styleText}`, googleLinks.flatMap(googleFamilies));

  return {
    sourceUrl: pageUrl,
    siteName: siteName.slice(0, 120),
    logoUrl,
    ...colors,
    ...fonts,
  };
}

function blockedPage(html: string): boolean {
  return html.length < 2500 || /incapsula|cf-browser-verification|Just a moment/i.test(html);
}

async function readWithCurl(rawUrl: string, maxBytes = 1_500_000): Promise<{ finalUrl: string; html: string }> {
  let current = normalizeUrl(rawUrl);
  for (let hop = 0; hop < 4; hop += 1) {
    const check = validateSafeUrl(current);
    if (!check.isValid) throw new Error(check.error || 'That website address is not allowed.');
    const { stdout } = await curl('curl', [
      '-sS',
      '--max-time', '12',
      '--max-filesize', String(maxBytes),
      '-A', 'Mozilla/5.0 (compatible; BastionResultsBot/1.0)',
      '-H', 'Accept: text/html',
      '-w', '\n%{http_code} %{redirect_url}',
      current,
    ], { maxBuffer: maxBytes + 64_000, encoding: 'utf8' });
    const marker = stdout.lastIndexOf('\n');
    const body = marker >= 0 ? stdout.slice(0, marker) : stdout;
    const statusLine = marker >= 0 ? stdout.slice(marker + 1).trim() : '';
    const [statusCode, redirectUrl] = statusLine.split(' ');
    const status = Number(statusCode);
    if (status >= 300 && status < 400 && redirectUrl) {
      current = new URL(redirectUrl, current).toString();
      continue;
    }
    if (!Number.isFinite(status) || status >= 400) throw new Error(`The website responded with ${statusCode || 'an error'}.`);
    if (body.length > 1_500_000) throw new Error('The homepage is too large to read for brand colours.');
    return { finalUrl: current, html: body };
  }
  throw new Error('The website redirected too many times.');
}

async function readPublicHtml(rawUrl: string): Promise<{ finalUrl: string; html: string }> {
  let current = normalizeUrl(rawUrl);
  for (let hop = 0; hop < 4; hop += 1) {
    const check = validateSafeUrl(current);
    if (!check.isValid) throw new Error(check.error || 'That website address is not allowed.');
    const response = await fetch(current, {
      redirect: 'manual',
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 (compatible; BastionResultsBot/1.0)',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error('The website redirected without a destination.');
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) throw new Error(`The website responded with ${response.status}.`);
    const type = response.headers.get('content-type') || '';
    if (!type.includes('text/html') && !type.includes('application/xhtml')) {
      throw new Error('That address did not return an HTML page.');
    }
    const html = await response.text();
    if (html.length > 1_500_000) throw new Error('The homepage is too large to read for brand colours.');
    if (blockedPage(html)) return readWithCurl(rawUrl);
    return { finalUrl: current, html };
  }
  throw new Error('The website redirected too many times.');
}

function sanitizeSvg(source: string): string | null {
  if (!/<svg[\s>]/i.test(source)) return null;
  const $ = cheerio.load(source, { xml: true });
  $('script, foreignObject, iframe, embed, object').remove();
  $('*').each((_, element) => {
    const node = $(element);
    const attribs = (element as { attribs?: Record<string, string> }).attribs || {};
    for (const name of Object.keys(attribs)) {
      if (name.toLowerCase().startsWith('on')) node.removeAttr(name);
      const value = node.attr(name) || '';
      if (/^\s*javascript:/i.test(value)) node.removeAttr(name);
    }
  });
  const svg = $('svg').first().toString();
  if (!svg || svg.length > 200_000) return null;
  return svg;
}

async function embedSvgLogo(logoUrl: string): Promise<string | null> {
  try {
    let current = logoUrl;
    for (let hop = 0; hop < 3; hop += 1) {
      const check = validateSafeUrl(current);
      if (!check.isValid || !current.startsWith('https://')) return null;
      const { stdout } = await curl('curl', [
        '-sS',
        '--max-time', '8',
        '-A', 'Mozilla/5.0 (compatible; BastionResultsBot/1.0)',
        '-H', 'Accept: image/svg+xml,*/*',
        '-w', '\n%{http_code} %{redirect_url}',
        current,
      ], { maxBuffer: 300_000, encoding: 'utf8' });
      const marker = stdout.lastIndexOf('\n');
      const body = marker >= 0 ? stdout.slice(0, marker) : stdout;
      const statusLine = marker >= 0 ? stdout.slice(marker + 1).trim() : '';
      const [statusCode, redirectUrl] = statusLine.split(' ');
      const status = Number(statusCode);
      if (status >= 300 && status < 400 && redirectUrl) {
        current = new URL(redirectUrl, current).toString();
        continue;
      }
      if (status !== 200) return null;
      const svg = sanitizeSvg(body);
      if (!svg) return null;
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function readLinkedCss(html: string, pageUrl: string): Promise<string> {
  const $ = cheerio.load(html);
  let host = '';
  try {
    host = new URL(pageUrl).host;
  } catch {
    return '';
  }
  const hrefs = $('link[rel="stylesheet"]').toArray()
    .map((node) => absoluteUrl($(node).attr('href'), pageUrl))
    .filter((url): url is string => Boolean(url))
    .filter((url) => {
      try {
        return new URL(url).host === host && !/font-awesome/i.test(url);
      } catch {
        return false;
      }
    })
    .slice(0, 2);
  const sheets: string[] = [];
  for (const href of hrefs) {
    try {
      const file = await readWithCurl(href, 400_000);
      if (/font-family|@font-face|fonts\.googleapis/i.test(file.html)) sheets.push(file.html.slice(0, 200_000));
    } catch {
      continue;
    }
  }
  return sheets.join('\n');
}

export async function extractResultsBrand(rawUrl: string): Promise<ResultsBrand> {
  const { finalUrl, html } = await readPublicHtml(rawUrl);
  const stylesheet = await readLinkedCss(html, finalUrl);
  const brand = parseBrandHtml(html, finalUrl, stylesheet);
  if (brand.logoUrl && /\.svg($|\?)/i.test(brand.logoUrl)) {
    brand.logoUrl = await embedSvgLogo(brand.logoUrl);
  }
  return brand;
}

function storedLogo(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.startsWith('https://')) return value.slice(0, 1000);
  if (value.startsWith('data:image/svg+xml') && value.length < 250_000) return value;
  return null;
}

export function readStoredBrand(value: unknown): ResultsBrand | null {
  if (!value || typeof value !== 'object') return null;
  const brand = value as Partial<ResultsBrand>;
  const primary = expandHex(String(brand.primary || ''));
  const accent = expandHex(String(brand.accent || ''));
  if (!primary || !accent || typeof brand.sourceUrl !== 'string') return null;
  const colors = Array.isArray(brand.colors)
    ? brand.colors.map((item) => expandHex(String(item))).filter((item): item is string => Boolean(item)).slice(0, 8)
    : [];
  return {
    sourceUrl: brand.sourceUrl.slice(0, 500),
    siteName: String(brand.siteName || 'Client').slice(0, 120),
    logoUrl: storedLogo(brand.logoUrl),
    colors,
    primary,
    accent,
    ink: expandHex(String(brand.ink || '')) || '#142033',
    paper: expandHex(String(brand.paper || '')) || '#f6f3ec',
    headingFont: String(brand.headingFont || 'inherit').slice(0, 80),
    bodyFont: String(brand.bodyFont || 'inherit').slice(0, 80),
  };
}
