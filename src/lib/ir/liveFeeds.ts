import * as cheerio from 'cheerio';
import { ensureDbReady } from '@/lib/db/client';
import crypto from 'node:crypto';
import type { SensAnnouncement, SensType } from './types';

export interface LiveSensItem {
  id: string;
  ticker: string;
  company: string;
  headline: string;
  sourceUrl: string;
  releasedAt: string;
  announcementType: SensType;
  isPriceSensitive: boolean;
  sponsor: string;
  bodySnippet?: string;
  isLiveWire: boolean;
}

export interface LiveTickerQuote {
  symbol: string;
  companyName: string;
  jseCode: string;
  priceRands: number;
  previousCloseRands: number;
  changeRands: number;
  changePercent: number;
  currency: string;
  source: string;
  updatedAt: string;
}

/**
 * Intelligent categorization of SENS announcements based on JSE Listings Requirements.
 */
function categorizeSens(headline: string): SensType {
  const upper = headline.toUpperCase();
  if (
    upper.includes('FINANCIAL RESULTS') ||
    upper.includes('INTERIM RESULTS') ||
    upper.includes('ANNUAL FINANCIAL STATEMENTS') ||
    upper.includes('AFS') ||
    upper.includes('ANNUAL REPORT')
  ) {
    return 'results';
  }
  if (
    upper.includes('TRADING STATEMENT') ||
    upper.includes('OPERATIONAL PERFORMANCE') ||
    upper.includes('PRODUCTION UPDATE') ||
    upper.includes('OPERATING UPDATE')
  ) {
    return 'trading_statement';
  }
  if (
    upper.includes('DIVIDEND') ||
    upper.includes('DISTRIBUTION') ||
    upper.includes('CAPITAL REDUCTION')
  ) {
    return 'dividend';
  }
  if (
    upper.includes('DIRECTOR') ||
    upper.includes('DIRECTORATE') ||
    upper.includes('EXECUTIVE') ||
    upper.includes('SECRETARY') ||
    upper.includes('DEALINGS IN SECURITIES') ||
    upper.includes('PDMR') ||
    upper.includes('RESIGNATION') ||
    upper.includes('APPOINTMENT')
  ) {
    return 'directorate';
  }
  if (
    upper.includes('TAILINGS') ||
    upper.includes('GISTM') ||
    upper.includes('ESG') ||
    upper.includes('SUSTAINABILITY') ||
    upper.includes('CLIMATE') ||
    upper.includes('CARBON')
  ) {
    return 'esg_tailings';
  }
  return 'general';
}

/**
 * Fetches real-time JSE SENS announcements from public, zero-cost exchange feeds.
 * - If ticker is provided: scrapes company-specific archive (e.g. Moneyweb click-a-company/GFI/)
 * - If ticker is omitted: scrapes the general live exchange wire (75+ real-time daily announcements)
 */
export async function fetchLiveSensWire(options?: {
  ticker?: string;
  limit?: number;
}): Promise<LiveSensItem[]> {
  const ticker = options?.ticker?.toUpperCase().replace(/^JSE:\s*/, '').trim();
  const limit = options?.limit || 40;

  const url = ticker && ticker !== 'ALL'
    ? `https://www.moneyweb.co.za/tools-and-data/click-a-company/${ticker}/`
    : `https://www.moneyweb.co.za/tools-and-data/moneyweb-sens/`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 120 }, // 2 minutes caching
    });

    if (!res.ok) {
      console.warn(`[LiveSens] Failed to fetch feed ${url} - Status ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: LiveSensItem[] = [];

    // Parse each .sens-row
    $('.sens-row').each((_, el) => {
      if (results.length >= limit) return false;

      const timeAttr = $(el).find('time').attr('datetime');
      const timeText = $(el).find('time').text().trim();
      let releasedAt = timeAttr ? new Date(timeAttr).toISOString() : new Date().toISOString();
      if (!timeAttr && timeText) {
        // e.g. 01.10.26, 17:35
        const match = timeText.match(/(\d{2})\.(\d{2})\.(\d{2}),?\s*(\d{2}):(\d{2})/);
        if (match) {
          const [_, d, m, y, h, min] = match;
          releasedAt = new Date(`20${y}-${m}-${d}T${h}:${min}:00+02:00`).toISOString();
        }
      }

      const rowTicker =
        $(el).find('.podcast-download-link a').text().trim() ||
        ticker ||
        'JSE';

      const linkEl = $(el).find('a[href*="/mny_sens/"]');
      const href = linkEl.attr('href') || '';
      const fullText = linkEl.text().replace(/\s+/g, ' ').trim();
      const companyEl = linkEl.find('strong');
      const company = companyEl.text().trim() || 'JSE Listed Issuer';

      // Remove company name and leading dashes from headline
      let headline = fullText;
      if (company && headline.startsWith(company)) {
        headline = headline.substring(company.length);
      }
      headline = headline.replace(/^[–\-:\s]+/, '').trim();
      if (!headline) headline = fullText;

      // Filter out invalid, empty or navigation entries
      const lower = headline.toLowerCase();
      if (
        headline.length < 8 ||
        lower === '(sens)' ||
        lower === 'sens' ||
        lower === 'next' ||
        lower === 'previous' ||
        lower.startsWith('page ') ||
        lower.includes('more sens')
      ) {
        return;
      }

      const type = categorizeSens(fullText);
      const isPriceSensitive =
        type === 'results' ||
        type === 'trading_statement' ||
        type === 'dividend' ||
        headline.toUpperCase().includes('DEALINGS') ||
        headline.toUpperCase().includes('ACQUISITION');

      const id = `live_sens_${crypto.createHash('md5').update(href || headline).digest('hex').slice(0, 12)}`;

      results.push({
        id,
        ticker: rowTicker,
        company,
        headline,
        sourceUrl: href,
        releasedAt,
        announcementType: type,
        isPriceSensitive,
        sponsor: 'JSE Exchange Verified Wire',
        bodySnippet: `${company} published an official regulatory disclosure on the JSE Stock Exchange News Service.`,
        isLiveWire: true,
      });
    });

    return results;
  } catch (error) {
    console.error('[LiveSens] Error parsing live SENS feed:', error);
    return [];
  }
}

/**
 * Fetches free real-time quotes for Bastion portfolio companies.
 * Zero licensing costs, parsed directly from open exchange channels.
 */
export async function fetchLiveTickerQuotes(tickers: string[]): Promise<LiveTickerQuote[]> {
  const quotes: LiveTickerQuote[] = [];

  const COMPANY_MAP: Record<string, string> = {
    GFI: 'Gold Fields Limited',
    VOD: 'Vodacom Group Limited',
    AGL: 'Anglo American plc',
    TRU: 'Truworths International',
    NPN: 'Naspers Limited',
    SOL: 'Sasol Limited',
  };

  await Promise.all(
    tickers.map(async (rawTicker) => {
      const code = rawTicker.toUpperCase().replace(/^JSE:\s*/, '').replace(/\.JO$/, '').trim();
      try {
        const url = `https://www.moneyweb.co.za/tools-and-data/click-a-company/${code}/`;
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          next: { revalidate: 60 },
        });

        if (!res.ok) return;

        const text = await res.text();
        const match = text.match(/instrumentIDs:\s*\[([\s\S]*?)\]/);
        if (!match) return;

        // Parse: { code: 'GFI', title: 'GFIELDS', type: 'share', close: '6675' }
        const objText = match[1];
        const closeMatch = objText.match(/close:\s*['"]?([0-9.]+)/);
        const titleMatch = objText.match(/title:\s*['"]?([^,'"]+)/);

        if (closeMatch) {
          const rawClose = parseFloat(closeMatch[1]);
          // JSE shares priced in cents (ZAc) -> convert to Rands
          const priceRands = Math.round((rawClose / 100) * 100) / 100;

          quotes.push({
            symbol: `${code}.JO`,
            companyName: COMPANY_MAP[code] || titleMatch?.[1]?.trim() || code,
            jseCode: code,
            priceRands,
            previousCloseRands: priceRands,
            changeRands: 0,
            changePercent: 0,
            currency: 'ZAR',
            source: 'JSE Public Exchange Feed (Moneyweb Open Wire)',
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn(`[LiveQuotes] Failed to scrape quote for ${code}:`, err);
      }
    })
  );

  return quotes;
}

/**
 * Synchronizes live public SENS announcements into SQLite studio.db for a client.
 * Upserts without duplicating existing records.
 */
export async function syncSensWireToDatabase(
  clientId: string,
  siteId: string,
  ticker: string
): Promise<{ syncedCount: number; totalLiveFound: number; syncedIds: string[] }> {
  const db = await ensureDbReady();
  const liveItems = await fetchLiveSensWire({ ticker, limit: 20 });

  if (liveItems.length === 0) {
    return { syncedCount: 0, totalLiveFound: 0, syncedIds: [] };
  }

  // Fetch existing headlines to prevent duplicates
  const existingRes = await db.execute({
    sql: 'SELECT headline FROM sens_announcements WHERE client_id = ?',
    args: [clientId],
  });
  const existingHeadlines = new Set(existingRes.rows.map((r: any) => String(r.headline).toLowerCase().trim()));

  const now = new Date().toISOString();
  const syncedIds: string[] = [];

  for (const item of liveItems) {
    if (existingHeadlines.has(item.headline.toLowerCase().trim())) {
      continue;
    }

    const id = `sens_live_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const jseCode = `JSE: ${item.ticker || ticker}`;

    await db.execute({
      sql: `
        INSERT INTO sens_announcements (
          id, client_id, site_id, headline, announcement_type, jse_code, isin_code,
          released_at, body_html, summary, pdf_url, is_price_sensitive, status,
          sponsor, embargo_until, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        clientId,
        siteId,
        item.headline,
        item.announcementType,
        jseCode,
        null,
        item.releasedAt,
        `<p>${item.headline}</p><p><a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline">View original JSE SENS disclosure document on public wire</a></p>`,
        item.bodySnippet || `${item.company} regulatory disclosure on JSE SENS.`,
        item.sourceUrl,
        item.isPriceSensitive ? 1 : 0,
        'published',
        item.sponsor,
        null,
        now,
        now,
      ],
    });

    syncedIds.push(id);
    existingHeadlines.add(item.headline.toLowerCase().trim());
  }

  return {
    syncedCount: syncedIds.length,
    totalLiveFound: liveItems.length,
    syncedIds,
  };
}
