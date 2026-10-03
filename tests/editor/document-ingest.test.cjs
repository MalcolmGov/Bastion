const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

test('Document Ingestion: pre-loaded corporate demo samples synthesize valid components', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const {
    CORPORATE_REPORT_SAMPLES,
    synthesizeSectionsFromInsights,
    ingestCorporateDocument
  } = h.load('lib/studio/editor/documentIngest.ts');

  assert.ok(CORPORATE_REPORT_SAMPLES['goldfields-annual-2025'], 'Gold Fields sample exists');
  assert.ok(CORPORATE_REPORT_SAMPLES['anglo-esg-2025'], 'Anglo American sample exists');
  assert.ok(CORPORATE_REPORT_SAMPLES['standardbank-interim-2025'], 'Standard Bank sample exists');

  // Test Gold Fields Ingestion
  const result = await ingestCorporateDocument({
    sampleId: 'goldfields-annual-2025',
    brandKit: { colors: { accent: { hex: '#F59E0B' } } }
  });

  assert.equal(result.success, true);
  assert.equal(result.insights.companyName, 'Gold Fields Limited');
  assert.ok(result.insights.kpis.length >= 4, 'Has at least 4 extracted KPIs');
  assert.equal(result.insights.kpis[0].value, '2.30 Moz');
  assert.equal(result.insights.kpis[1].value, '$1,280 /oz');
  assert.equal(result.insights.kpis[2].value, '$920 Million');

  // Check generated sections
  assert.equal(result.sections.length, 5, 'Synthesizes 5 modular sections');
  const [hero, pillars, quote, faq, cta] = result.sections;

  assert.equal(hero.componentId, 'hero');
  assert.ok(hero.props.title.includes('Disciplined Capital Allocation'));
  assert.equal(hero.props.stats.length, 4);
  assert.equal(hero.styles.accentColor, '#F59E0B');

  assert.equal(pillars.componentId, 'case_studies');
  assert.ok(pillars.props.caseStudies.length >= 3);

  assert.equal(quote.componentId, 'rich_text');
  assert.ok(quote.props.quote.includes('disciplined operational execution'));
  assert.ok(quote.props.author.includes('Mike Fraser'));

  assert.equal(faq.componentId, 'faq');
  assert.ok(faq.props.items.length >= 3);

  assert.equal(cta.componentId, 'cta');
  assert.ok(cta.props.title.includes('2025 Integrated Annual Report'));
});

test('Document Ingestion: extracts KPIs and executive statements from raw text input', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { ingestCorporateDocument } = h.load('lib/studio/editor/documentIngest.ts');

  const sampleCorporateText = `
    Discovery Limited
    Integrated Annual Report 2025
    Theme: Pioneering Shared-Value Insurance and Global Health Tech Expansion
    
    Executive Review by Adrian Gore:
    "Our shared-value model continues to demonstrate profound societal and financial impact as we expand our global presence."
    
    Key Financial & Operating Highlights:
    Normalized headline earnings expanded to R12.8 Billion (+15% YoY).
    Core operating profit reached R14.2 Billion.
    Vitality active lives grew to 4.2 Million across 40 global markets.
    Solvency capital requirement ratio stood at 218%, comfortably above regulatory minimums.
  `;

  const result = await ingestCorporateDocument({
    text: sampleCorporateText,
    brandKit: { colors: { accent: { hex: '#EA580C' } } }
  });

  assert.equal(result.success, true);
  assert.ok(result.insights.companyName.includes('Discovery'), 'Extracted company name');
  assert.ok(result.insights.theme.includes('Shared-Value Insurance'), 'Extracted theme');
  assert.ok(result.insights.kpis.length >= 4, 'Extracted at least 4 metrics');
  assert.ok(result.sections.length === 5, 'Synthesized 5 sections from raw text');
  assert.equal(result.sections[0].styles.accentColor, '#EA580C', 'Applied brand kit accent');
});

test('Document Ingestion: API returns samples catalogue on GET', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { GET } = h.load('app/api/admin/editor/ingest-document/route.ts');
  const res = await GET();
  const data = await res.json();

  assert.ok(Array.isArray(data.samples));
  assert.equal(data.samples.length, 3);
  assert.equal(data.samples[0].id, 'goldfields-annual-2025');
  assert.equal(data.samples[0].companyName, 'Gold Fields Limited');
});

test('Document Ingestion: extracts text and financial metrics from genuine PDF buffer', async (t) => {
  const fs = require('fs');
  const path = require('path');
  const h = await createHarness();
  t.after(() => h.close());

  const { extractTextFromPdfBuffer, ingestCorporateDocument, toCleanUint8Array } = h.load('lib/studio/editor/documentIngest.ts');

  const pdfPath = path.resolve(process.cwd(), 'fixtures/merafe-summarised-results-2025.pdf');
  assert.ok(fs.existsSync(pdfPath), 'Merafe fixtures PDF exists');

  const fileBuffer = fs.readFileSync(pdfPath);
  assert.ok(Buffer.isBuffer(fileBuffer));

  // Test toCleanUint8Array
  const cleanUint8 = toCleanUint8Array(fileBuffer);
  assert.equal(cleanUint8.constructor.name, 'Uint8Array');
  assert.equal(Buffer.isBuffer(cleanUint8), false);

  // Test PDF text extraction from Node Buffer directly
  const extractedText = await extractTextFromPdfBuffer(fileBuffer);
  assert.ok(extractedText.length > 500, 'Extracted rich text from PDF');
  assert.ok(extractedText.includes('MERAFE RESOURCES LIMITED'), 'Extracted company title');
  assert.ok(extractedText.includes('SUMMARISED CONSOLIDATED FINANCIAL STATEMENTS'), 'Extracted reporting title');

  // Test full ingestion pipeline with PDF Buffer
  const result = await ingestCorporateDocument({
    buffer: fileBuffer,
    brandKit: { colors: { accent: { hex: '#0EA5E9' } } }
  });

  assert.equal(result.success, true);
  assert.equal(result.insights.companyName, 'Merafe Resources Limited');
  assert.ok(result.insights.kpis.length >= 4, 'Extracted at least 4 corporate KPIs');
  assert.equal(result.sections.length, 5, 'Synthesizes 5 production sections');
  assert.equal(result.sections[0].styles.accentColor, '#0EA5E9');
});

