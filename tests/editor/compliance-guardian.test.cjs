const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHarness } = require('./harness.cjs');

test('Compliance Guardian: detects JSE Section 8.2 unconditional financial guarantees and remediates', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const {
    auditCanvasCompliance,
    applyComplianceRemedy
  } = h.load('lib/studio/editor/complianceGuardian.ts');

  const testSections = [
    {
      id: 'sec_hero_1',
      componentId: 'hero',
      visible: true,
      props: {
        title: 'We will guarantee a 25% margin expansion next year',
        subtitle: 'Leading sustainable mining across Africa'
      }
    }
  ];

  const report = auditCanvasCompliance(testSections);
  assert.equal(report.status, 'non_compliant');
  assert.equal(report.criticalCount, 1);
  assert.ok(report.score < 80);

  const issue = report.issues.find(i => i.category === 'jse_regulatory');
  assert.ok(issue, 'JSE regulatory issue detected');
  assert.equal(issue.severity, 'critical');
  assert.equal(issue.ruleTitle, 'Unconditional Forward-Looking Financial Guarantee');
  assert.ok(issue.statutoryReference.includes('JSE Listings Requirements § 8.2'));

  // Test single remediation
  const remediated = applyComplianceRemedy(testSections, issue.remedyPatch);
  assert.ok(!remediated[0].props.title.includes('will guarantee'));
  assert.ok(remediated[0].props.title.includes('disciplined expansion'));

  // Re-audit should now be clean of critical errors
  const reAudit = auditCanvasCompliance(remediated);
  assert.equal(reAudit.criticalCount, 0);
});

test('Compliance Guardian: detects ESG greenwashing and unverified carbon neutral claims', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const {
    auditCanvasCompliance,
    applyComplianceRemedy
  } = h.load('lib/studio/editor/complianceGuardian.ts');

  const testSections = [
    {
      id: 'sec_esg_1',
      componentId: 'financial_highlights',
      visible: true,
      props: {
        title: 'Our operations are 100% green and completely carbon neutral',
        eyebrow: 'Sustainability Leadership'
      }
    }
  ];

  const report = auditCanvasCompliance(testSections);
  assert.equal(report.status, 'non_compliant');
  assert.ok(report.criticalCount >= 1);

  const greenwashIssue = report.issues.find(i => i.category === 'esg_greenwashing');
  assert.ok(greenwashIssue, 'Greenwashing issue detected');
  assert.equal(greenwashIssue.severity, 'critical');
  assert.ok(greenwashIssue.statutoryReference.includes('ISSB S2 Climate Standard'));

  // Apply remedy
  const remediated = applyComplianceRemedy(testSections, greenwashIssue.remedyPatch);
  assert.ok(!remediated[0].props.title.includes('100% green'));
  assert.ok(remediated[0].props.title.includes('renewable grid microgrid integration'));
});

test('Compliance Guardian: detects POPIA privacy and brand voice sensationalist hyperbole', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const {
    auditCanvasCompliance,
    applyComplianceRemedy
  } = h.load('lib/studio/editor/complianceGuardian.ts');

  const testSections = [
    {
      id: 'sec_cta_1',
      componentId: 'cta',
      visible: true,
      props: {
        title: 'Join us to celebrate massive profits this quarter',
        ctaText: 'Subscribe to investor alerts'
      }
    }
  ];

  const report = auditCanvasCompliance(testSections);
  assert.ok(report.issues.length >= 2, 'Detects both hyperbole and POPIA notice');

  const hyperbole = report.issues.find(i => i.category === 'brand_integrity');
  assert.ok(hyperbole, 'Detects brand tone hyperbole');
  assert.equal(hyperbole.severity, 'advisory');

  const popia = report.issues.find(i => i.category === 'popia_privacy');
  assert.ok(popia, 'Detects POPIA consent omission');
  assert.equal(popia.severity, 'warning');
});

test('Compliance Guardian: bulk remediation cleanses all violations in a single pass', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const {
    auditCanvasCompliance,
    applyAllComplianceRemedies
  } = h.load('lib/studio/editor/complianceGuardian.ts');

  const dirtySections = [
    {
      id: 'sec_hero_messy',
      componentId: 'hero',
      visible: true,
      props: {
        title: 'Gold Fields will guarantee a 30% surge in operational profits',
        subtitle: 'Our mining assets are 100% green with massive profits delivered to investors.'
      }
    }
  ];

  const initialReport = auditCanvasCompliance(dirtySections);
  assert.ok(initialReport.issues.length >= 2, 'Initial audit flags multiple issues');
  assert.ok(initialReport.score < 70, 'Initial score is penalized');

  // Perform 1-click bulk remediation
  const cleanSections = applyAllComplianceRemedies(dirtySections, initialReport.issues);
  const cleanReport = auditCanvasCompliance(cleanSections);

  assert.equal(cleanReport.criticalCount, 0, 'Zero critical violations remain');
  assert.ok(cleanReport.score >= 90, 'Score is restored to Grade A');
  assert.ok(!cleanSections[0].props.title.includes('will guarantee'));
  assert.ok(!cleanSections[0].props.subtitle.includes('100% green'));
  assert.ok(!cleanSections[0].props.subtitle.includes('massive profits'));
});

test('Compliance Guardian: API route returns structured audit report and rules catalogue', async (t) => {
  const h = await createHarness();
  t.after(() => h.close());

  const { POST, GET } = h.load('app/api/admin/editor/compliance/route.ts');

  // Test GET (Catalogue)
  const getRes = await GET();
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.rulesCount >= 5);
  assert.ok(Array.isArray(getData.activeJurisdictions));

  // Test POST (Audit Request)
  const mockReq = {
    json: async () => ({
      siteId: 'site_goldfields_flagship',
      pageSlug: 'home',
      sections: [
        {
          id: 'sec_test_api',
          componentId: 'hero',
          visible: true,
          props: {
            title: 'Sustainable gold mining with zero-carbon operations'
          }
        }
      ]
    })
  };

  const postRes = await POST(mockReq);
  const postData = await postRes.json();
  assert.equal(postRes.status, 200);
  assert.equal(postData.success, true);
  assert.ok(postData.report);
  assert.equal(postData.report.criticalCount, 1);
  assert.equal(postData.report.issues[0].category, 'esg_greenwashing');
});
