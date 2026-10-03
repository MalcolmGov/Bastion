import * as cheerio from 'cheerio';

/**
 * Allowlist sanitiser for HTML *fragments* that are stored as data and later injected with
 * dangerouslySetInnerHTML (for example SENS announcement bodies). Unlike sanitizePublicationHtml,
 * which handles whole booklet documents, this never adds a doctype or <html>/<body> wrapper.
 *
 * Unknown tags are unwrapped (their text is kept), script-like tags are removed with their content,
 * and every attribute not on the allowlist is dropped.
 */

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'article', 'b', 'blockquote', 'br', 'caption', 'cite', 'code', 'col', 'colgroup',
  'dd', 'del', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4',
  'h5', 'h6', 'header', 'hr', 'i', 'img', 'ins', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's',
  'section', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'tr', 'u', 'ul',
]);

/** Removed together with everything inside them. */
const REMOVE_WITH_CONTENT = new Set([
  'script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'noscript',
  'template', 'svg', 'math', 'form', 'select', 'textarea', 'button', 'title', 'head', 'link',
  'meta', 'base',
]);

const GLOBAL_ATTRS = new Set(['class', 'title', 'lang', 'dir', 'style', 'align']);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  td: new Set(['colspan', 'rowspan', 'headers', 'width', 'height']),
  th: new Set(['colspan', 'rowspan', 'scope', 'headers', 'width', 'height']),
  col: new Set(['span', 'width']),
  colgroup: new Set(['span', 'width']),
  table: new Set(['width']),
  ol: new Set(['start', 'type']),
  li: new Set(['value']),
};

/** Browsers ignore tabs, newlines and other control characters inside a URL scheme, so strip them first. */
function normaliseUrl(value: string): string {
  return value.replace(/[\u0000- \u007f-\u009f]/g, '').toLowerCase();
}

function isSafeLink(value: string): boolean {
  const url = normaliseUrl(value);
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(url);
  if (!scheme) return true; // relative path, #anchor or protocol-relative
  return ['http', 'https', 'mailto', 'tel'].includes(scheme[1]);
}

function isSafeImageSrc(value: string): boolean {
  const url = normaliseUrl(value);
  if (url.startsWith('data:')) return /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(url);
  return isSafeLink(value) && !/^(mailto|tel):/.test(url);
}

function isSafeStyle(value: string): boolean {
  const css = value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\\/g, '').toLowerCase();
  return !/(url\s*\(|expression\s*\(|@import|javascript:|vbscript:|behavior\s*:|-moz-binding|position\s*:\s*(fixed|absolute))/.test(css);
}

/** Whether an attribute may stay on an allowlisted tag. Event handlers and unknown attributes never do. */
function isAttributeKept(tag: string, name: string, value: string): boolean {
  const lower = name.toLowerCase();
  if (lower.startsWith('on')) return false;
  if (!GLOBAL_ATTRS.has(lower) && !TAG_ATTRS[tag]?.has(lower)) return false;
  if (tag === 'a' && lower === 'href') return isSafeLink(value);
  if (tag === 'img' && lower === 'src') return isSafeImageSrc(value);
  if (lower === 'style') return isSafeStyle(value);
  if (tag === 'a' && lower === 'target') return value === '_blank' || value === '_self';
  return true;
}

function stripComments($: cheerio.CheerioAPI): void {
  $.root().find('*').addBack().contents().each((_, node) => {
    if (node.type === 'comment' || node.type === 'directive') $(node).remove();
  });
}

const selectAllElements = ($: cheerio.CheerioAPI) => $('*').toArray();
type ElementNode = ReturnType<typeof selectAllElements>[number];

function sanitizeElement($: cheerio.CheerioAPI, element: ElementNode): void {
  const node = $(element);
  const { tagName, attribs } = element as { tagName?: string; attribs?: Record<string, string> };
  const tag = tagName?.toLowerCase() || '';

  if (REMOVE_WITH_CONTENT.has(tag)) {
    node.remove();
    return;
  }
  if (!ALLOWED_TAGS.has(tag)) {
    node.replaceWith(node.contents());
    return;
  }

  for (const [name, value] of Object.entries(attribs ?? {})) {
    if (!isAttributeKept(tag, name, value)) node.removeAttr(name);
  }
  if (tag === 'a' && node.attr('target') === '_blank') node.attr('rel', 'noopener noreferrer');
  if (tag === 'img' && !node.attr('src')) node.remove();
}

export function sanitizeHtmlFragment(html: string): string {
  if (!html) return '';
  const $ = cheerio.load(html, null, false);
  stripComments($);
  for (const element of selectAllElements($)) sanitizeElement($, element);
  return $.html();
}
