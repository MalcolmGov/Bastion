/**
 * aiJsonRepair.ts
 * Robust JSON extraction, partial JSON repair, and prop/style normalization
 * for AI design and coding models (Claude Opus 5.5, GPT-6 Astra, Gemini, DeepSeek, Qwen).
 */

export interface ParsedAiChanges {
  summary: string;
  props?: Record<string, any>;
  styles?: Record<string, any>;
}

const STYLE_KEYS = new Set([
  'backgroundType', 'backgroundColor', 'gradient', 'textColor', 'headingColor',
  'accentColor', 'borderColor', 'paddingY', 'backgroundPattern', 'patternOpacity',
  'theme', 'backdropBlur', 'backdropSaturate', 'bottomAccentLine', 'brandTextColor'
]);

export function repairAndExtractChanges(replyText: string): ParsedAiChanges | null {
  if (!replyText || typeof replyText !== 'string') return null;

  let str = replyText.trim();

  // 1. Try extracting standard fenced markdown ```json ... ```
  const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch && fenceMatch[1]) {
    str = fenceMatch[1].trim();
  } else {
    // If opening fence exists without closing fence (truncated output)
    str = str.replace(/^[\s\S]*?```(?:json)?\s*/i, '').replace(/\s*```[\s\S]*$/i, '').trim();
  }

  // 2. If starts with `"props":` without outer `{`, wrap it
  if (/^\s*"props"\s*:/i.test(str) && !str.startsWith('{')) {
    str = '{' + str;
  } else if (!str.startsWith('{')) {
    const firstBrace = str.indexOf('{');
    if (firstBrace !== -1) {
      str = str.substring(firstBrace);
    }
  }

  function tryParse(candidate: string) {
    if (!candidate) return null;
    try {
      return JSON.parse(candidate);
    } catch {}
    try {
      const sanitized = candidate
        .replace(/\/\/[^\n\r]*/g, '')
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized);
    } catch {}
    return null;
  }

  let parsedRaw = tryParse(str);

  // 3. Truncation Repair Engine (recovers responses truncated by max_tokens)
  if (!parsedRaw) {
    let working = str;
    const quoteCount = (working.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      const lastQuote = working.lastIndexOf('"');
      if (lastQuote !== -1) {
        working = working.substring(0, lastQuote);
      }
    }

    working = working.replace(/[,\s:]+$/, '');

    // Auto-balance open braces and brackets
    for (let attempt = 0; attempt < 10; attempt++) {
      const openBraces = (working.match(/\{/g) || []).length;
      const closeBraces = (working.match(/\}/g) || []).length;
      const openBrackets = (working.match(/\[/g) || []).length;
      const closeBrackets = (working.match(/\]/g) || []).length;

      let closers = '';
      if (openBrackets > closeBrackets) closers += ']'.repeat(openBrackets - closeBrackets);
      if (openBraces > closeBraces) closers += '}'.repeat(openBraces - closeBraces);

      const candidate = working + closers;
      parsedRaw = tryParse(candidate);
      if (parsedRaw) break;

      const lastComma = working.lastIndexOf(',');
      if (lastComma !== -1 && lastComma > working.length - 150) {
        working = working.substring(0, lastComma);
      } else {
        break;
      }
    }
  }

  // 4. Resilient Key-Value Fallback Regex (extracts props & styles even from heavily corrupted strings)
  if (!parsedRaw || typeof parsedRaw !== 'object') {
    const fallbackProps: Record<string, any> = {};
    const fallbackStyles: Record<string, any> = {};

    const brandMatch = replyText.match(/"brandName"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (brandMatch) fallbackProps.brandName = brandMatch[1].replace(/\\"/g, '"');

    const logoMatch = replyText.match(/"logoDarkUrl"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (logoMatch) fallbackProps.logoDarkUrl = logoMatch[1].replace(/\\"/g, '"');

    const titleMatch = replyText.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (titleMatch) fallbackProps.title = titleMatch[1].replace(/\\"/g, '"');

    const subtitleMatch = replyText.match(/"subtitle"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (subtitleMatch) fallbackProps.subtitle = subtitleMatch[1].replace(/\\"/g, '"');

    const badgeMatch = replyText.match(/"badge"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (badgeMatch) fallbackProps.badge = badgeMatch[1].replace(/\\"/g, '"');

    const ctaTextMatch = replyText.match(/"ctaText"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (ctaTextMatch) fallbackProps.ctaText = ctaTextMatch[1].replace(/\\"/g, '"');

    const themeMatch = replyText.match(/"theme"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (themeMatch) fallbackStyles.theme = themeMatch[1].replace(/\\"/g, '"');

    const bgMatch = replyText.match(/"backgroundColor"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (bgMatch) fallbackStyles.backgroundColor = bgMatch[1].replace(/\\"/g, '"');

    const bgTypeMatch = replyText.match(/"backgroundType"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (bgTypeMatch) fallbackStyles.backgroundType = bgTypeMatch[1].replace(/\\"/g, '"');

    if (Object.keys(fallbackProps).length > 0 || Object.keys(fallbackStyles).length > 0) {
      parsedRaw = {
        props: fallbackProps,
        styles: fallbackStyles
      };
    }
  }

  // 5. Normalization into structured { summary, props, styles }
  if (parsedRaw && typeof parsedRaw === 'object') {
    const summary = parsedRaw.summary || parsedRaw.description || 'AI refined component properties and styling';
    const normalizedProps: Record<string, any> = {};
    const normalizedStyles: Record<string, any> = {};

    if (parsedRaw.props && typeof parsedRaw.props === 'object') {
      Object.assign(normalizedProps, parsedRaw.props);
    }
    if (parsedRaw.styles && typeof parsedRaw.styles === 'object') {
      Object.assign(normalizedStyles, parsedRaw.styles);
    }

    for (const [k, v] of Object.entries(parsedRaw)) {
      if (['summary', 'description', 'props', 'styles', 'changes', 'target'].includes(k)) continue;
      if (STYLE_KEYS.has(k)) {
        normalizedStyles[k] = v;
      } else {
        normalizedProps[k] = v;
      }
    }

    // Default dark background if theme: dark was specified
    if (normalizedStyles.theme === 'dark' && !normalizedStyles.backgroundColor) {
      normalizedStyles.backgroundColor = 'rgba(5, 8, 15, 0.85)';
      normalizedStyles.backgroundType = 'solid';
    }

    if (Object.keys(normalizedProps).length > 0 || Object.keys(normalizedStyles).length > 0) {
      return {
        summary,
        props: Object.keys(normalizedProps).length > 0 ? normalizedProps : undefined,
        styles: Object.keys(normalizedStyles).length > 0 ? normalizedStyles : undefined
      };
    }
  }

  return null;
}
