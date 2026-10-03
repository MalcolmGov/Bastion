import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { rasterizeLogoDataUrl } from './logoRaster';

export type CodeProvider = 'anthropic' | 'openai' | 'gemini' | 'deepseek' | 'qwen';

export interface CodeTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface CodeAssistantResult {
  html: string;
  replyText: string;
  summary: string;
  provider: string;
  modelId: string;
}

const REGION_IDS = [
  'results-header',
  'results-highlights',
  'results-narrative',
  'results-statements',
  'results-notes',
  'results-footer',
  'results-layout',
];

const URL_ATTRS = ['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'data', 'srcset', 'background'];

/** Browsers ignore tabs, newlines and other control characters inside a URL scheme, so strip them before checking. */
function isUnsafeUrl(value: string): boolean {
  const normalised = value.replace(/[\u0000-\u0020\u007f-\u009f]/g, '').toLowerCase();
  if (/^(javascript|vbscript):/.test(normalised)) return true;
  if (normalised.startsWith('data:') && !/^data:image\/(png|jpe?g|gif|webp|avif);/.test(normalised)) return true;
  return false;
}

/** Keep binary artwork out of model context while restoring it after a styling pass. */
export function maskPublicationAssets(html: string): { html: string; restore: (value: string) => string } {
  const assets = new Map<string, string>();
  const prefix = `https://bastion-assets.invalid/${crypto.randomUUID()}/`;
  const masked = html.replace(/data:image\/(?:png|jpe?g|gif|webp|avif);base64,[A-Za-z0-9+/=]+/gi, (asset) => {
    const token = `${prefix}${assets.size}`;
    assets.set(token, asset);
    return token;
  });
  return { html: masked, restore: (value) => {
    for (const [token, asset] of assets) value = value.split(token).join(asset);
    return value;
  } };
}

export function sanitizePublicationHtml(html: string): string {
  if (html.length > 12_000_000) throw new Error('This publication exceeds the 12 MB artwork limit.');
  // Keep the strict ban on active SVG data URLs; retain static logo artwork as inert pixels.
  html = html.replace(/data:image\/svg\+xml(?:;base64|;charset=utf-8)?,[^"'<>\s]+/gi, value => rasterizeLogoDataUrl(value) || '');
  const assets = maskPublicationAssets(html);
  const $ = cheerio.load(assets.html);
  $('script, iframe, frame, frameset, object, embed, applet, base, form, input, button, textarea, select, meta[http-equiv]').remove();
  $('link').each((_, element) => {
    const node = $(element);
    try {
      const url = new URL(node.attr('href') || '');
      if (node.attr('rel') !== 'stylesheet' || url.protocol !== 'https:' || url.hostname !== 'fonts.googleapis.com' || url.pathname !== '/css2' || url.username || url.password || url.port) node.remove();
    } catch { node.remove(); }
  });
  $('*').each((_, element) => {
    const node = $(element);
    const attribs = (element as { attribs?: Record<string, string> }).attribs || {};
    for (const name of Object.keys(attribs)) {
      const lower = name.toLowerCase();
      if (lower.startsWith('on') || lower === 'srcdoc') {
        node.removeAttr(name);
        continue;
      }
      if (URL_ATTRS.includes(lower) && isUnsafeUrl(attribs[name] || '')) node.removeAttr(name);
    }
  });
  const rendered = $.html() || '';
  const withDoctype = /<!doctype html>/i.test(rendered) ? rendered : `<!DOCTYPE html>\n${rendered}`;
  if (withDoctype.length > 500_000) throw new Error('The HTML transcription exceeds the 500 KB editing limit. Split the publication before editing.');
  return assets.restore(withDoctype);
}

function replaceStyle(html: string, css: string): string {
  const $ = cheerio.load(html);
  if ($('style#results-theme').length) $('style#results-theme').text(css);
  else $('head').append(`<style id="results-theme">${css}</style>`);
  return sanitizePublicationHtml($.html() || html);
}

function applyRegions(html: string, regions: Record<string, unknown>, css?: string): string {
  const $ = cheerio.load(html);
  if (typeof css === 'string' && css.trim()) {
    if ($('style#results-theme').length) $('style#results-theme').text(css);
    else $('head').append(`<style id="results-theme">${css}</style>`);
  }
  for (const [id, fragment] of Object.entries(regions)) {
    if (!REGION_IDS.includes(id) || typeof fragment !== 'string' || !fragment.trim()) continue;
    const fragmentDoc = cheerio.load(`<div id="results-fragment">${fragment}</div>`);
    fragmentDoc('#results-fragment script, #results-fragment iframe, #results-fragment object, #results-fragment embed').remove();
    const clean = fragmentDoc('#results-fragment').html() || '';
    if ($(`#${id}`).length && clean.trim()) $(`#${id}`).replaceWith(clean);
  }
  return sanitizePublicationHtml($.html() || html);
}

export function extractCodedHtml(reply: string, currentHtml: string): { html: string; summary: string } | null {
  const fenced = reply.match(/```html\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim();
  if (candidate && /<html[\s>]/i.test(candidate) && /<\/html>/i.test(candidate)) {
    return { html: sanitizePublicationHtml(candidate), summary: 'Replaced the publication HTML.' };
  }

  const jsonFence = reply.match(/```json\s*([\s\S]*?)```/i);
  const raw = jsonFence?.[1] || (reply.includes('{') ? reply.slice(reply.indexOf('{')) : '');
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw.replace(/,\s*([}\]])/g, '$1')) as {
      summary?: string;
      css?: string;
      html?: string;
      regions?: Record<string, unknown>;
    };
    if (typeof parsed.html === 'string' && /<html[\s>]/i.test(parsed.html) && /<\/html>/i.test(parsed.html)) {
      return { html: sanitizePublicationHtml(parsed.html), summary: parsed.summary || 'Replaced the publication HTML.' };
    }
    if (parsed.regions && typeof parsed.regions === 'object') {
      return {
        html: applyRegions(currentHtml, parsed.regions, parsed.css),
        summary: parsed.summary || 'Updated page regions and CSS.',
      };
    }
    if (typeof parsed.css === 'string' && parsed.css.trim()) {
      return { html: replaceStyle(currentHtml, parsed.css), summary: parsed.summary || 'Updated the publication stylesheet.' };
    }
  } catch {
    return null;
  }
  return null;
}

function cssVariables(html: string): string {
  const $ = cheerio.load(html);
  return $('style#results-theme').text();
}

function paintRoot(css: string, updates: Record<string, string>, extra = ''): string {
  let next = css;
  for (const [name, value] of Object.entries(updates)) {
    const pattern = new RegExp(`(${name}\\s*:\\s*)[^;]+;`);
    next = pattern.test(next) ? next.replace(pattern, `$1${value};`) : next.replace(':root {', `:root {\n      ${name}: ${value};`);
  }
  if (extra && !next.includes(extra.slice(0, 24))) next += `\n${extra}`;
  return next;
}

const COLOR_MAP: Record<string, string> = {
  blue: '#1d4ed8',
  navy: '#0b1f33',
  gold: '#c8a064',
  green: '#0f766e',
  emerald: '#047857',
  red: '#b91c1c',
  purple: '#6d28d9',
  black: '#111111',
  white: '#f8fafc',
};

export function codePublicationLocally(html: string, prompt: string): { html: string; summary: string; replyText: string } {
  const $ = cheerio.load(html);
  const ask = prompt.toLowerCase();
  const css = cssVariables(html);
  const changes: string[] = [];
  let nextCss = css;

  const hex = prompt.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/)?.[0];
  const named = Object.keys(COLOR_MAP).find((name) => new RegExp(`\\b${name}\\b`, 'i').test(ask));
  const chosen = hex || (named ? COLOR_MAP[named] : '');

  if (/\bdark|night|obsidian\b/i.test(ask)) {
    nextCss = paintRoot(nextCss, {
      '--ink': '#f8fafc',
      '--primary': '#070b12',
      '--paper': '#0b1220',
      '--card': '#121a2b',
      '--line': 'rgba(255,255,255,0.12)',
      '--muted': '#cbd5e1',
    }, `body { background: #0b1220; }\n.metric, .statement { box-shadow: none; }\nthead th { background: #10182a; }`);
    changes.push('Rewrote the theme tokens for a dark editorial page.');
  } else if (/\blight|paper|day\b/i.test(ask)) {
    nextCss = paintRoot(nextCss, {
      '--ink': '#142033',
      '--paper': '#f6f3ec',
      '--card': '#ffffff',
      '--muted': '#5c6b78',
    });
    changes.push('Restored a light paper background and dark ink.');
  }

  if (chosen && !/\bdark\b/i.test(ask)) {
    const target = /\b(accent|highlight|gold)\b/i.test(ask) ? '--accent' : '--primary';
    nextCss = paintRoot(nextCss, { [target]: chosen });
    changes.push(`Set ${target} to ${chosen} in the stylesheet.`);
  }

  if (/\bcompact|tight|dense\b/i.test(ask)) {
    nextCss += '\nth, td { padding: 7px 12px; font-size: 12px; }\n.statement { margin: 12px 0; }';
    changes.push('Reduced table padding and type size in CSS.');
  }
  if (/\bspac|air|roomy|generous\b/i.test(ask)) {
    nextCss += '\nth, td { padding: 16px 18px; }\n.statement { margin: 32px 0; }\n#results-narrative { font-size: 18px; }';
    changes.push('Opened up table and narrative spacing.');
  }
  if (/\bserif|editorial|investor\b/i.test(ask)) {
    nextCss = paintRoot(nextCss, {
      '--heading-font': 'Georgia, "Times New Roman", serif',
      '--body-font': 'Georgia, "Times New Roman", serif',
    });
    changes.push('Switched the page to a serif investor type system.');
  }
  if (/\bsans|modern|grotesk\b/i.test(ask)) {
    nextCss = paintRoot(nextCss, {
      '--heading-font': '"Segoe UI", Helvetica, Arial, sans-serif',
      '--body-font': '"Segoe UI", Helvetica, Arial, sans-serif',
    });
    changes.push('Switched the page to a sans-serif system.');
  }
  if (/\bhide notes|remove notes|drop notes\b/i.test(ask)) {
    $('#results-notes').remove();
    changes.push('Removed the notes section from the HTML.');
  }
  if (/\blarger logo|bigger logo|enlarge (the )?logo\b/i.test(ask)) {
    nextCss += '\n.logo { height: 72px; max-width: 240px; }';
    changes.push('Increased the logo size in CSS.');
  }
  if (/\btwo column|sidebar|split\b/i.test(ask)) {
    nextCss += '\n@media (min-width: 960px) { #results-layout { display: grid; grid-template-columns: minmax(240px, 320px) 1fr; gap: 28px; align-items: start; } #results-statements { grid-column: 2; } }';
    changes.push('Placed the narrative beside the statements with a CSS grid.');
  }
  if (/\bmobile|phone|stack\b/i.test(ask)) {
    nextCss += '\n@media (max-width: 720px) { h1 { font-size: 34px; } .metrics { grid-template-columns: 1fr; } .brand-row { flex-direction: column; align-items: flex-start; } }';
    changes.push('Added a mobile layout pass.');
  }
  if (/\bprint\b/i.test(ask)) {
    nextCss += '\n@media print { header.masthead { padding-bottom: 24px; } .statement { break-inside: avoid; } footer { display: none; } }';
    changes.push('Added print rules so each statement stays together.');
  }

  if (changes.length === 0) {
    nextCss += '\n.statement { border-radius: 28px; } h1 { letter-spacing: -0.045em; } .metric strong { font-variant-numeric: tabular-nums; }';
    changes.push('Applied a layout polish pass to type, numerals, and statement cards.');
  }

  $('style#results-theme').text(nextCss);
  const updated = sanitizePublicationHtml($.html() || html);
  const summary = changes[0];
  const replyText = [
    'Your design proposal is ready to review.',
    ...changes.map((change) => `• ${change}`),
    '',
    '```html',
    '/* Review the proposal, then apply it to the preview. */',
    '```',
    '',
    'Add a provider API key in this chat if you want a frontier model to rewrite arbitrary sections, components, or copy.',
  ].join('\n');
  return { html: updated, summary, replyText };
}

async function completeWithProvider(input: {
  provider: CodeProvider;
  modelId: string;
  apiKey: string;
  systemPrompt: string;
  userMessage: string;
  history: CodeTurn[];
}): Promise<string> {
  const history = input.history.slice(-6);
  if (input.provider === 'anthropic') {
    const targetModel = input.modelId;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: AbortSignal.timeout(60_000),
      headers: {
        'x-api-key': input.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 8192,
        system: input.systemPrompt,
        messages: [
          ...history.map((turn) => ({ role: turn.role, content: turn.content })),
          { role: 'user', content: input.userMessage },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Anthropic returned ${response.status}`);
    return data.content?.find((block: { type?: string }) => block.type === 'text')?.text || data.content?.[0]?.text || '';
  }

  if (input.provider === 'gemini') {
    const model = input.modelId || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${input.apiKey}`, {
      method: 'POST',
      signal: AbortSignal.timeout(60_000),
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.systemPrompt }] },
        contents: [
          ...history.map((turn) => ({
            role: turn.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: turn.content }],
          })),
          { role: 'user', parts: [{ text: input.userMessage }] },
        ],
        generationConfig: { maxOutputTokens: 8192, temperature: 0.3 },
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Gemini returned ${response.status}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  const actualModel = input.modelId;
  const isOpenRouter = input.provider === 'qwen' && input.apiKey.startsWith('sk-or-');
  const endpoint = input.provider === 'deepseek'
    ? 'https://api.deepseek.com/chat/completions'
    : input.provider === 'qwen'
      ? (isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions')
      : 'https://api.openai.com/v1/chat/completions';
  const model = input.provider === 'qwen'
    ? (isOpenRouter ? (actualModel.includes('/') ? actualModel : `qwen/${actualModel}`) : (actualModel || 'qwen-2.5-coder-32b-instruct'))
    : input.provider === 'deepseek'
      ? (actualModel || 'deepseek-chat')
      : (actualModel || 'gpt-4o');
  const response = await fetch(endpoint, {
    method: 'POST',
      signal: AbortSignal.timeout(60_000),
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 8192,
      messages: [
        { role: 'system', content: input.systemPrompt },
        ...history.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: 'user', content: input.userMessage },
      ],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `${input.provider} returned ${response.status}`);
  return data.choices?.[0]?.message?.content || '';
}

/** A design pass must preserve report text, table boundaries, artwork and page provenance. */
export function assertPublicationContentPreserved(before: string, after: string): void {
  const snapshot = (html: string) => {
    const $ = cheerio.load(html);
    $('style, script, link').remove();
    const text = (value: string) => value.replace(/\s+/g, ' ').trim();
    return JSON.stringify({
      text: text($('body').text()),
      tables: $('table').toArray().map(table => $(table).find('tr').toArray().map(row => $(row).find('th, td').toArray().map(cell => ({ text: text($(cell).text()), colspan: $(cell).attr('colspan') || '1', rowspan: $(cell).attr('rowspan') || '1' })))),
      images: $('img').toArray().map(image => $(image).attr('src') || ''),
      references: $('.source-reference').toArray().map(anchor => $(anchor).attr('href')),
    });
  };
  if (snapshot(before) !== snapshot(after)) throw new Error('This design proposal changed report content, financial tables or source artwork. No changes were applied. Use the figures review to make intentional financial corrections.');
}

function systemPrompt(_html: string): string {
  return `You are styling an investor results publication. Return a short explanation and a JSON fence containing {"summary":"what changed","css":"the COMPLETE replacement stylesheet for style#results-theme"}.
Change only typography, colours, spacing, responsive layout and print styles. Preserve all content and readability. Never hide, remove or alter figures, periods, units, tables, footnotes, disclosures or source artwork. Never return replacement HTML or regions. If the request requires changing financial content, explain that it must be corrected in the figures review instead.`;
}

function publicationDesignContext(html: string): string {
  const $ = cheerio.load(html);
  const selectors = new Set<string>();
  $('body *').each((_, element) => {
    const node = $(element);
    const id = node.attr('id');
    if (id) selectors.add(`#${id}`);
    for (const name of (node.attr('class') || '').split(/\s+/).filter(Boolean)) selectors.add(`.${name}`);
  });
  return JSON.stringify({ stylesheet: $('style#results-theme').text(), selectors: [...selectors].slice(0, 200), tables: $('table').length, sourcePages: $('#results-source-visuals img').length });
}

export async function codeResultsPublication(input: {
  provider: CodeProvider;
  modelId: string;
  prompt: string;
  html: string;
  apiKey?: string;
  history?: CodeTurn[];
}): Promise<CodeAssistantResult> {
  const assets = maskPublicationAssets(sanitizePublicationHtml(input.html));
  const current = assets.html;
  const local = () => {
    const coded = codePublicationLocally(current, input.prompt);
    return {
      html: assets.restore(coded.html),
      replyText: coded.replyText,
      summary: coded.summary,
      provider: 'local',
      modelId: 'results-coder',
    };
  };

  if (!input.apiKey) {
    const result = local();
    assertPublicationContentPreserved(sanitizePublicationHtml(input.html), result.html);
    return result;
  }

  try {
    const replyText = await completeWithProvider({
      provider: input.provider,
      modelId: input.modelId,
      apiKey: input.apiKey,
      systemPrompt: systemPrompt(current),
      userMessage: `Instruction:\n${input.prompt}\n\nDesign context (content is protected):\n${publicationDesignContext(current)}`,
      history: input.history || [],
    });
    const extracted = extractCodedHtml(replyText, current);
    if (!extracted) throw new Error('The provider did not return a usable design proposal. No changes were applied. Try a more specific styling request.');
    assertPublicationContentPreserved(current, extracted.html);
    const summary = replyText.split('\n').find((line) => line.trim() && !line.trim().startsWith('```'))?.trim()
      || extracted.summary;
    return {
      html: assets.restore(extracted.html),
      replyText,
      summary,
      provider: input.provider,
      modelId: input.modelId,
    };
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) throw new Error('The AI provider took too long to respond. No changes were applied. Please try again.');
    throw error;
  }
}
