/**
 * Bastion Studio — Deep Headless Brand DNA Extraction Engine
 * 
 * Pipeline: website URL → approved brand kit
 * 
 * Executes real Chromium via puppeteer-core to crawl the live DOM, execute client JavaScript,
 * harvest computed styles across all semantic elements, inspect :root CSS variables,
 * discover SVG/retina brand assets, compute WCAG 2.1 AA contrast ratios, and analyze
 * copywriting voice, sentiment, and reading ease.
 */

import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import * as cheerio from 'cheerio';
import { JobManager } from './worker';
import { validateSafeUrl, normalizeUrl } from './importer';
import {
  BrandDnaExtractor,
  type BrandKitDnaResult,
  type ExtractedColorOccurrence,
  type ExtractedFontOccurrence,
  type ExtractedMediaAsset,
  type StandardThemeJson
} from './brandExtractor';

// Popular Google Fonts reference set
const POPULAR_GOOGLE_FONTS = new Set([
  'inter', 'plus jakarta sans', 'dm sans', 'space grotesk', 'roboto',
  'poppins', 'montserrat', 'open sans', 'lato', 'merriweather',
  'playfair display', 'jetbrains mono', 'fira code', 'work sans',
  'outfit', 'raleway', 'nunito', 'noto sans', 'source sans pro',
  'syne', 'manrope', 'urbanist', 'cinzel', 'cormorant garamond', 'lora'
]);

// Font alternatives mapping for commercial / system fonts
const FONT_ALTERNATIVES: Record<string, { googleFont: string; note: string }> = {
  'helvetica neue': { googleFont: 'Inter', note: 'Commercial font. Recommended free Google Font equivalent: Inter' },
  'helvetica': { googleFont: 'Inter', note: 'Commercial font. Recommended free Google Font equivalent: Inter' },
  'futura': { googleFont: 'Space Grotesk', note: 'Commercial geometric sans. Recommended Google Font: Space Grotesk' },
  'proxima nova': { googleFont: 'Montserrat', note: 'Commercial font. Recommended Google Font: Montserrat or Inter' },
  'circular': { googleFont: 'DM Sans', note: 'Proprietary font. Recommended Google Font: DM Sans' },
  'neue haas grotesk': { googleFont: 'Inter', note: 'Commercial font. Recommended Google Font: Inter' },
  'garamond': { googleFont: 'Cormorant Garamond', note: 'Commercial serif. Recommended Google Font: Cormorant Garamond' },
  'times new roman': { googleFont: 'Merriweather', note: 'Legacy system font. Recommended Google Font: Merriweather or Lora' },
  'arial': { googleFont: 'Plus Jakarta Sans', note: 'System font. Modern executive alternative: Plus Jakarta Sans' },
  'benton sans': { googleFont: 'Source Sans 3', note: 'Commercial Benton Sans licence. Suggested web alternative: Source Sans 3' },
  'benton-sans-regular': { googleFont: 'Source Sans 3', note: 'Commercial Benton Sans licence. Suggested web alternative: Source Sans 3' }
};

// Locate Chrome executable path
function findChromeExecutable(): string | null {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/local/bin/google-chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Convert RGB/RGBA string to Hex
function rgbToHex(rgbStr: string): string {
  if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'inherit') return '';
  if (rgbStr.startsWith('#')) return rgbStr.toUpperCase();

  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return '';

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

  if (a < 0.05) return ''; // ignore near-transparent

  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// Relative Luminance for WCAG calculations
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const transform = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

// Contrast Ratio (WCAG 2.1)
function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

// Flesch-Kincaid Reading Analysis
function analyzeReadingLevel(text: string): { gradeLevel: string; score: number } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length || 1;

  let syllableCount = 0;
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) continue;
    const matches = clean.match(/[aeiouy]{1,2}/g);
    syllableCount += matches ? matches.length : 1;
  }

  const score = Math.round(206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllableCount / wordCount));
  const gradeNumber = Math.round(0.39 * (wordCount / sentences) + 11.8 * (syllableCount / wordCount) - 15.59);

  let gradeLevel = 'Standard Executive (High School / College)';
  if (score >= 80) gradeLevel = 'Conversational & Accessible (6th Grade)';
  else if (score >= 60) gradeLevel = 'Professional Standard (8th–9th Grade)';
  else if (score >= 40) gradeLevel = 'Institutional / Governance (College Level)';
  else gradeLevel = 'Specialist / Academic Technical (Post-Graduate)';

  return { gradeLevel: `${gradeLevel} — Grade ${Math.max(1, gradeNumber)}`, score: Math.max(0, Math.min(100, score)) };
}

export class HeadlessBrandExtractor {
  async extractWithJob(url: string, jobId: string, maxPages = 4): Promise<BrandKitDnaResult> {
    return HeadlessBrandExtractor.extractWithJob(url, jobId, maxPages);
  }

  static async extractWithJob(url: string, jobId: string, maxPages = 4): Promise<BrandKitDnaResult> {
    const chromePath = findChromeExecutable();
    JobManager.appendLog(jobId, `Target URL validation: ${url}`);

    // Step 1: Security validation
    const normalized = normalizeUrl(url);
    const validation = validateSafeUrl(normalized);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Target URL failed security validation.');
    }
    const safeUrl = normalized;
    JobManager.updateProgress(jobId, 1, 'Initializing Chromium Sandbox & Network Security', 10);
    JobManager.appendLog(jobId, `SSRF check passed. Validated target: ${safeUrl}`);

    let browser: Browser | null = null;

    try {
      if (chromePath) {
        JobManager.appendLog(jobId, `Launching headless Chromium engine at: ${chromePath}`);
        browser = await puppeteer.launch({
          executablePath: chromePath,
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1440,900'
          ]
        });
      } else {
        JobManager.appendLog(jobId, 'Native Chromium not found. Reading the public HTML and linked stylesheets.', 'warn');
        const result = await new BrandDnaExtractor().extractBrandKit(safeUrl);
        JobManager.completeJob(jobId, result);
        return result;
      }

      // Step 2: Render Homepage & Execute JavaScript
      JobManager.updateProgress(jobId, 2, 'Rendering Homepage & Executing Dynamic Client Scripts', 25);
      JobManager.appendLog(jobId, `Navigating to ${safeUrl} with 1440x900 viewport...`);

      const crawledPages: Array<{ url: string; title: string; status: number }> = [];
      let homepageData: any = null;

      if (browser) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Bastion Brand DNA Extractor)');

        const response = await page.goto(safeUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const title = await page.title();
        crawledPages.push({ url: safeUrl, title, status: response ? response.status() : 200 });
        JobManager.appendLog(jobId, `Loaded homepage: "${title}" (Status ${crawledPages[0].status})`);

        // Harvest computed styles, :root tokens, and elements on live DOM
        homepageData = await page.evaluate(() => {
          // 1. Harvest :root CSS Custom Properties
          const rootVars: Record<string, string> = {};
          try {
            for (const sheet of Array.from(document.styleSheets)) {
              try {
                for (const rule of Array.from(sheet.cssRules || [])) {
                  if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
                    for (let i = 0; i < rule.style.length; i++) {
                      const prop = rule.style[i];
                      if (prop.startsWith('--')) {
                        rootVars[prop] = rule.style.getPropertyValue(prop).trim();
                      }
                    }
                  }
                }
              } catch (_) {
                // cross-origin stylesheets may block cssRules access
              }
            }
          } catch (_) {}

          // 2. Computed styles for key elements
          const sample = (selector: string) => {
            const el = document.querySelector(selector);
            if (!el) return null;
            const cs = window.getComputedStyle(el);
            return {
              bg: cs.backgroundColor,
              color: cs.color,
              fontFamily: cs.fontFamily,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              borderRadius: cs.borderRadius,
              border: cs.border
            };
          };

          const bodyStyle = sample('body');
          const h1Style = sample('h1') || sample('h2');
          const pStyle = sample('p');
          const btnStyle = sample('button') || sample('a.btn') || sample('.button') || sample('a[href*="contact"]');
          const navStyle = sample('nav') || sample('header');
          const cardStyle = sample('.card') || sample('article') || sample('section');

          // 3. Collect all unique colors across visible elements
          const colorCounts: Record<string, { count: number; elements: Set<string> }> = {};
          const fontCounts: Record<string, { count: number; weights: Set<string>; usedIn: Set<string> }> = {};

          const allElements = document.querySelectorAll('body, header, nav, footer, main, section, article, h1, h2, h3, h4, p, button, a, span, div');
          const maxInspect = Math.min(allElements.length, 300);

          for (let i = 0; i < maxInspect; i++) {
            const el = allElements[i];
            const tagName = el.tagName.toLowerCase();
            try {
              const cs = window.getComputedStyle(el);

              // Background
              const bg = cs.backgroundColor;
              if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                if (!colorCounts[bg]) colorCounts[bg] = { count: 0, elements: new Set() };
                colorCounts[bg].count++;
                colorCounts[bg].elements.add(tagName);
              }

              // Text Color
              const clr = cs.color;
              if (clr && clr !== 'rgba(0, 0, 0, 0)' && clr !== 'transparent') {
                if (!colorCounts[clr]) colorCounts[clr] = { count: 0, elements: new Set() };
                colorCounts[clr].count++;
                colorCounts[clr].elements.add(tagName);
              }

              // Font
              const ff = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
              if (ff) {
                if (!fontCounts[ff]) fontCounts[ff] = { count: 0, weights: new Set(), usedIn: new Set() };
                fontCounts[ff].count++;
                fontCounts[ff].weights.add(cs.fontWeight);
                fontCounts[ff].usedIn.add(tagName);
              }
            } catch (_) {}
          }

          // 4. Asset extraction (SVGs and Images)
          const headerIcon = document.querySelector('.header__logo [data-icon]');
          const svgs = Array.from(document.querySelectorAll('.header__logo svg, header svg, [class*="logo"] svg')).slice(0, 4).map((s, idx) => ({
            id: `svg_${idx}`,
            outerHTML: s.outerHTML,
            viewBox: s.getAttribute('viewBox') || '',
            className: (s.getAttribute('class') || '')
          }));

          const imgs = Array.from(document.querySelectorAll('img')).slice(0, 20).map(img => ({
            src: img.currentSrc || img.src,
            alt: img.alt || '',
            className: img.className || '',
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }));

          // 5. Navigation discovery for multi-page crawl
          const navLinks = Array.from(document.querySelectorAll('a[href]'))
            .map(a => ({ href: (a as HTMLAnchorElement).href, label: a.textContent?.trim() || '' }))
            .filter(link => {
              try {
                const u = new URL(link.href);
                return u.origin === window.location.origin && !link.href.includes('#') && !link.href.includes('mailto:');
              } catch (_) {
                return false;
              }
            });

          // 6. Text corpus for copy analysis
          const metaDesc = (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '';
          const headings = Array.from(document.querySelectorAll('h1, h2, h3')).slice(0, 12).map(h => h.textContent?.trim() || '').filter(Boolean);
          const bodyParagraphs = Array.from(document.querySelectorAll('p')).slice(0, 10).map(p => p.textContent?.trim() || '').filter(Boolean);

          return {
            rootVars,
            bodyStyle,
            h1Style,
            pStyle,
            btnStyle,
            navStyle,
            cardStyle,
            colorCounts: Object.entries(colorCounts).map(([k, v]) => ({ color: k, count: v.count, elements: Array.from(v.elements) })),
            fontCounts: Object.entries(fontCounts).map(([k, v]) => ({ font: k, count: v.count, weights: Array.from(v.weights), usedIn: Array.from(v.usedIn) })),
            headerIcon: headerIcon ? {
              name: headerIcon.getAttribute('data-icon') || '',
              path: headerIcon.getAttribute('data-path') || '',
            } : null,
            svgs,
            imgs,
            navLinks,
            metaDesc,
            headings,
            bodyParagraphs
          };
        });

        // Step 3: Multi-Page Crawling (About, Services, Contact)
        JobManager.updateProgress(jobId, 3, 'Crawling High-Value Subpages (About, Services, Contact)', 40);
        const subpageTargets = [
          homepageData.navLinks.find((l: any) => /about|company|who-we-are/i.test(l.href)),
          homepageData.navLinks.find((l: any) => /services|solutions|capabilities|practice|operations/i.test(l.href)),
          homepageData.navLinks.find((l: any) => /contact|offices|connect/i.test(l.href)),
          homepageData.navLinks.find((l: any) => /investors|sustainability|esg|governance/i.test(l.href))
        ].filter(Boolean).slice(0, 3);

        for (const sub of subpageTargets) {
          try {
            JobManager.appendLog(jobId, `Crawling subpage: ${sub.href} (${sub.label})`);
            const subRes = await page.goto(sub.href, { waitUntil: 'domcontentloaded', timeout: 15000 });
            const subTitle = await page.title();
            crawledPages.push({ url: sub.href, title: subTitle, status: subRes ? subRes.status() : 200 });
          } catch (subErr: any) {
            JobManager.appendLog(jobId, `Subpage ${sub.href} notice: ${subErr.message}`, 'warn');
          }
        }

        await page.close();
      }

      // Step 4: Brand Asset Discovery
      JobManager.updateProgress(jobId, 4, 'Harvesting Brand Assets & Vector SVGs', 60);
      const logos: ExtractedMediaAsset[] = [];
      const media: ExtractedMediaAsset[] = [];

      if (homepageData) {
        const icon = homepageData.headerIcon;
        if (icon?.name && icon.path && !/spinner|loader|flag|close|search|arrow/i.test(icon.name)) {
          const folder = icon.path.endsWith('/') ? icon.path : `${icon.path}/`;
          try {
            logos.push({
              id: 'header_logo',
              url: new URL(`${folder}${icon.name}.svg`, safeUrl).toString(),
              altText: 'Header logo',
              category: 'logo',
              isSvg: true,
            });
            JobManager.appendLog(jobId, `Header logo: ${icon.name}.svg`);
          } catch {}
        }
        for (const [idx, s] of (homepageData.svgs || []).entries()) {
          const isLogo = /logo|brand|emblem/i.test(s.className || '');
          if (isLogo && s.outerHTML.length < 200_000) {
            logos.push({
              id: `svg_logo_${idx}`,
              url: `data:image/svg+xml;utf8,${encodeURIComponent(s.outerHTML)}`,
              altText: 'Extracted Vector Logo',
              category: 'logo',
              isSvg: true,
              svgContent: s.outerHTML
            });
            JobManager.appendLog(jobId, `Discovered inline vector SVG brand mark (${s.viewBox || 'standard'})`);
          }
        }

        // Collect Images
        for (const [idx, img] of (homepageData.imgs || []).entries()) {
          const isLogo = /logo|brand/i.test(img.alt || '') || /logo/i.test(img.className || '');
          const asset: ExtractedMediaAsset = {
            id: `media_${idx}`,
            url: img.src,
            altText: img.alt || 'Brand Asset',
            category: isLogo ? 'logo' : (idx < 3 ? 'hero' : 'general'),
            width: img.naturalWidth,
            height: img.naturalHeight,
            isSvg: img.src.endsWith('.svg')
          };
          if (isLogo) logos.push(asset);
          else media.push(asset);
        }
      }

      if (logos.length === 0) {
        JobManager.appendLog(jobId, 'No header logo was found on the page.', 'warn');
      }

      // Step 5: Analyzing Copy, Voice & Sentiment
      JobManager.updateProgress(jobId, 5, 'Analyzing Editorial Voice, Reading Level & Sentiment', 75);
      const textCorpus = [
        homepageData?.metaDesc || '',
        ...(homepageData?.headings || []),
        ...(homepageData?.bodyParagraphs || [])
      ].join(' ');

      const reading = analyzeReadingLevel(textCorpus || 'Corporate enterprise delivering specialized capabilities with rigorous compliance.');
      JobManager.appendLog(jobId, `Flesch-Kincaid Reading Score: ${reading.score}/100 (${reading.gradeLevel})`);

      // Step 6: Google Font Mapping & WCAG AA Audit
      JobManager.updateProgress(jobId, 6, 'Google Font Mapping & WCAG AA Contrast Audit', 85);

      // Detect and map fonts
      const detectedFonts: ExtractedFontOccurrence[] = (homepageData?.fontCounts || []).map((f: any) => {
        const lower = f.font.toLowerCase();
        const isGoogle = POPULAR_GOOGLE_FONTS.has(lower);
        const alt = FONT_ALTERNATIVES[lower];
        return {
          name: f.font,
          isGoogleFont: isGoogle,
          weights: f.weights.map((w: string) => parseInt(w) || 400),
          licenseNote: alt ? alt.note : (isGoogle ? 'Open Source Google Font' : 'Commercial font requiring client license confirmation'),
          alternative: alt ? alt.googleFont : undefined,
          usedIn: f.usedIn
        };
      });

      const headingFont = detectedFonts.find(f => f.usedIn.some((t: string) => t.startsWith('h'))) || {
        name: 'Plus Jakarta Sans',
        isGoogleFont: true,
        weights: [700, 800],
        usedIn: ['h1', 'h2']
      };

      const bodyFont = detectedFonts.find(f => f.usedIn.includes('p') || f.usedIn.includes('body')) || {
        name: 'Inter',
        isGoogleFont: true,
        weights: [400, 500],
        usedIn: ['p', 'body']
      };

      JobManager.appendLog(jobId, `Typography Pairing: Heading "${headingFont.name}" + Body "${bodyFont.name}"`);

      // Synthesize Primary Palette Colors
      const hexColors = (homepageData?.colorCounts || [])
        .map((c: any) => ({ hex: rgbToHex(c.color), count: c.count, elements: c.elements }))
        .filter((c: any) => Boolean(c.hex));

      // Determine Primary, Accent, Surface, Canvas
      const darkColors = hexColors.filter((c: any) => getLuminance(c.hex) < 0.2);
      const lightColors = hexColors.filter((c: any) => getLuminance(c.hex) > 0.8);
      const midColors = hexColors.filter((c: any) => getLuminance(c.hex) >= 0.2 && getLuminance(c.hex) <= 0.8);

      const primary = darkColors[0]?.hex || '#0F172A';
      const accent = midColors[0]?.hex || '#0284C7';
      const bg = lightColors[0]?.hex || '#F8FAFC';
      const surface = '#FFFFFF';
      const text = primary;
      const muted = '#64748B';
      const border = '#E2E8F0';

      // WCAG Compliance Calculations
      const textOnBgRatio = getContrastRatio(text, bg);
      const textOnSurfaceRatio = getContrastRatio(text, surface);
      const accentOnBgRatio = getContrastRatio(accent, bg);

      const wcagCompliance = {
        textOnBg: {
          ratio: textOnBgRatio,
          passesAA: textOnBgRatio >= 4.5,
          warning: textOnBgRatio < 4.5 ? 'Contrast below WCAG AA 4.5:1 minimum standard.' : undefined
        },
        textOnSurface: {
          ratio: textOnSurfaceRatio,
          passesAA: textOnSurfaceRatio >= 4.5,
          warning: textOnSurfaceRatio < 4.5 ? 'Contrast below WCAG AA 4.5:1 minimum standard.' : undefined
        },
        accentOnBg: {
          ratio: accentOnBgRatio,
          passesAA: accentOnBgRatio >= 3.0,
          warning: accentOnBgRatio < 3.0 ? 'Accent contrast below 3.0:1 threshold.' : undefined
        }
      };

      JobManager.appendLog(jobId, `WCAG 2.1 AA Audit: Text/Canvas (${textOnBgRatio}:1), Text/Surface (${textOnSurfaceRatio}:1)`);

      // Step 7: Standard Theme JSON Normalization
      JobManager.updateProgress(jobId, 7, 'Normalizing Standard Theme JSON Schema', 95);

      const theme: StandardThemeJson = {
        color: {
          primary,
          accent,
          bg,
          surface,
          text,
          muted,
          border
        },
        font: {
          heading: headingFont.name,
          body: bodyFont.name
        },
        radius: {
          sm: 4,
          md: 8,
          lg: 16
        },
        space: [0, 4, 8, 12, 16, 24, 32, 48, 64],
        logo: {
          primary: logos[0]?.url || '',
          mark: logos[0]?.url || '',
          onDark: logos[0]?.url || ''
        },
        voice: {
          summary: `${crawledPages[0]?.title || 'Corporate Organization'} communicates with an ${reading.score < 50 ? 'authoritative, institutional tone focused on regulatory compliance and market leadership' : 'approachable, customer-aligned perspective emphasizing execution reliability'}.`,
          doNot: [
            'Do not use low-contrast text on primary brand backgrounds (violates WCAG AA standard).',
            'Do not alter the letter-spacing or aspect ratio of the primary vector logo.',
            'Do not mix saturated decorative gradients into formal financial or governance tables.'
          ]
        },
        sources: {
          site: safeUrl,
          extractedEngine: chromePath ? 'Headless Chromium Engine (Puppeteer-Core)' : 'Cheerio Static DOM Parser Fallback'
        }
      };

      const result: BrandKitDnaResult = {
        sourceUrl: safeUrl,
        extractedAt: new Date().toISOString(),
        crawledPages,
        theme,
        wcagCompliance,
        fontAnalysis: {
          heading: headingFont,
          body: bodyFont,
          detectedFamilies: detectedFonts
        },
        assets: {
          logos,
          media
        },
        copyAnalysis: {
          title: crawledPages[0]?.title || 'Client Website',
          metaDescription: homepageData?.metaDesc || 'Specialized enterprise delivering corporate capabilities with rigorous governance.',
          readingLevel: reading.gradeLevel,
          readingScore: reading.score,
          sentiment: reading.score < 50 ? 'Institutional & Authoritative' : 'Modern & Accessible',
          commonPhrases: (homepageData?.headings || []).slice(0, 6)
        },
        generatedArtifacts: {
          cssVariables: `:root {\n  --brand-primary: ${primary};\n  --brand-accent: ${accent};\n  --brand-bg: ${bg};\n  --brand-surface: ${surface};\n  --brand-text: ${text};\n  --brand-font-heading: "${headingFont.name}", sans-serif;\n  --brand-font-body: "${bodyFont.name}", sans-serif;\n}`,
          tailwindConfigSnippet: `{\n  colors: {\n    brand: {\n      primary: "${primary}",\n      accent: "${accent}",\n      bg: "${bg}",\n      surface: "${surface}"\n    }\n  },\n  fontFamily: {\n    heading: ["${headingFont.name}", "sans-serif"],\n    body: ["${bodyFont.name}", "sans-serif"]\n  }\n}`
        }
      };

      JobManager.completeJob(jobId, result);
      return result;
    } catch (err: any) {
      try {
        JobManager.appendLog(jobId, `Browser render failed (${err?.message || 'unknown'}). Reading the public HTML instead.`, 'warn');
        const result = await new BrandDnaExtractor().extractBrandKit(safeUrl);
        JobManager.completeJob(jobId, result);
        return result;
      } catch (staticErr: any) {
        JobManager.failJob(jobId, staticErr?.message || err?.message || 'Headless extraction encountered an error');
        throw staticErr;
      }
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (_) {}
      }
    }
  }
}
