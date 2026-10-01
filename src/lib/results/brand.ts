import * as cheerio from 'cheerio';
import { normalizeUrl, validateSafeUrl } from '@/lib/studio/importer';
import type { ResultsBrand } from './types';

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

export function chooseBrandColors(found: string[]): Pick<ResultsBrand, 'colors' | 'primary' | 'accent' | 'ink' | 'paper'> {
  const counts = new Map<string, number>();
  for (const value of found) {
    const hex = expandHex(value);
    if (!hex) continue;
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([hex]) => hex);
  const colorful = ranked.filter((hex) => saturation(hex) > 0.15 && luminance(hex) > 0.02 && luminance(hex) < 0.85);
  const dark = ranked.filter((hex) => luminance(hex) < 0.18);
  const light = ranked.filter((hex) => luminance(hex) > 0.9);
  const primary = colorful[0] || '#0d1c30';
  const accent = colorful.find((hex) => hex !== primary) || '#c8a064';
  return {
    colors: ranked.slice(0, 6),
    primary,
    accent,
    ink: dark[0] || '#142033',
    paper: light[0] || '#f6f3ec',
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

function readFont(css: string): { headingFont: string; bodyFont: string } {
  const families = [...css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)]
    .map((match) => match[1].split(',')[0].replace(/['"]/g, '').trim())
    .filter((name) => name && !/inherit|initial|unset|system-ui/i.test(name));
  const headingFont = families[0] || 'inherit';
  const bodyFont = families[1] || families[0] || 'inherit';
  return { headingFont, bodyFont };
}

export function parseBrandHtml(html: string, pageUrl: string): ResultsBrand {
  const $ = cheerio.load(html);
  const siteName =
    $('meta[property="og:site_name"]').attr('content')?.trim()
    || $('meta[name="application-name"]').attr('content')?.trim()
    || $('title').first().text().split(/[|\-–—]/)[0].trim()
    || 'Client';

  const logoCandidates = [
    $('link[rel="apple-touch-icon"]').attr('href'),
    $('link[rel="icon"]').attr('href'),
    $('meta[property="og:image"]').attr('content'),
    $('header img, img[alt*="logo" i], img[src*="logo" i], img[class*="logo" i]').first().attr('src'),
  ];
  const logoUrl = logoCandidates.map((value) => absoluteUrl(value, pageUrl)).find(Boolean) || null;

  const styleText = $('style').toArray().map((node) => $(node).text()).join('\n');
  const inline = $('[style]').toArray().map((node) => $(node).attr('style') || '').join('\n');
  const theme = [
    $('meta[name="theme-color"]').attr('content') || '',
    $('meta[name="msapplication-TileColor"]').attr('content') || '',
  ].join(' ');
  const found = `${theme}\n${styleText}\n${inline}`.match(HEX) || [];
  const colors = chooseBrandColors(found);
  const fonts = readFont(`${styleText}\n${$('link[href*="fonts.googleapis.com"]').attr('href') || ''}`);

  return {
    sourceUrl: pageUrl,
    siteName: siteName.slice(0, 120),
    logoUrl,
    ...colors,
    ...fonts,
  };
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
        'User-Agent': 'BastionResultsBot/1.0',
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
    return { finalUrl: current, html };
  }
  throw new Error('The website redirected too many times.');
}

export async function extractResultsBrand(rawUrl: string): Promise<ResultsBrand> {
  const { finalUrl, html } = await readPublicHtml(rawUrl);
  return parseBrandHtml(html, finalUrl);
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
    logoUrl: typeof brand.logoUrl === 'string' && brand.logoUrl.startsWith('https://') ? brand.logoUrl.slice(0, 1000) : null,
    colors,
    primary,
    accent,
    ink: expandHex(String(brand.ink || '')) || '#142033',
    paper: expandHex(String(brand.paper || '')) || '#f6f3ec',
    headingFont: String(brand.headingFont || 'inherit').slice(0, 80),
    bodyFont: String(brand.bodyFont || 'inherit').slice(0, 80),
  };
}
