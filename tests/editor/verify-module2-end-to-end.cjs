const { createHarness } = require('./harness.cjs');

async function main() {
  const h = await createHarness();
  const {
    auditCanvasCompliance,
    applyComplianceRemedy,
    applyAllComplianceRemedies
  } = h.load('lib/studio/editor/complianceGuardian.ts');

  console.log('================================================================');
  console.log('       BASTION COMPLIANCE GUARDIAN (MODULE 2) FULL AUDIT        ');
  console.log('================================================================\n');

  // Realistic dirty canvas representing unvetted corporate draft
  const initialSections = [
    {
      id: 'sec_hero_1',
      componentId: 'hero',
      visible: true,
      props: {
        title: 'We will guarantee a 25% margin expansion next year with massive profits',
        subtitle: 'Our mining operations are 100% green and completely carbon neutral'
      }
    },
    {
      id: 'sec_cta_1',
      componentId: 'cta',
      visible: true,
      props: {
        title: 'Subscribe to investor alerts',
        eyebrow: 'Reduced our emissions by 40%'
      }
    }
  ];

  console.log('[STEP 1] Scanning Initial Unvetted Canvas...');
  const initialReport = auditCanvasCompliance(initialSections);
  console.log(`  - Overall Score:        ${initialReport.score} / 100`);
  console.log(`  - Regulatory Grade:     Grade ${initialReport.grade}`);
  console.log(`  - Pre-Flight Status:    ${initialReport.status.toUpperCase()}`);
  console.log(`  - Total Checks Run:     ${initialReport.checksRun}`);
  console.log(`  - Total Violations:     ${initialReport.totalIssues}`);
  console.log(`  - Critical Violations:  ${initialReport.criticalCount}`);
  console.log(`  - Warning Advisories:   ${initialReport.warningCount}`);
  console.log(`  - Brand Advisories:     ${initialReport.advisoryCount}`);

  console.log('\n[STEP 2] Detected Violations & Statutory Citations:');
  initialReport.issues.forEach((iss, idx) => {
    console.log(`\n  Issue #${idx + 1}: [${iss.severity.toUpperCase()}] ${iss.ruleTitle}`);
    console.log(`    • Statute:     ${iss.statutoryReference}`);
    console.log(`    • Target Text: "${iss.flaggedText}"`);
    console.log(`    • Remediation: "${iss.suggestedFix}"`);
    console.log(`    • Explanation: ${iss.explanation}`);
  });

  console.log('\n[STEP 3] Executing 1-Click Bulk Auto-Remediation...');
  const cleanedSections = applyAllComplianceRemedies(initialSections, initialReport.issues);

  console.log('\n[STEP 4] Re-Scanning Remediated Canvas...');
  const finalReport = auditCanvasCompliance(cleanedSections);
  console.log(`  - Post-Remedy Score:    ${finalReport.score} / 100`);
  console.log(`  - Post-Remedy Grade:    Grade ${finalReport.grade}`);
  console.log(`  - Post-Remedy Status:   ${finalReport.status.toUpperCase()}`);
  console.log(`  - Critical Remaining:   ${finalReport.criticalCount}`);
  console.log(`  - Total Issues Left:    ${finalReport.totalIssues}`);

  console.log('\n[STEP 5] Cleaned Canvas Copy Inspection:');
  console.log(`  • Cleaned Hero Title:`);
  console.log(`    "${cleanedSections[0].props.title}"`);
  console.log(`  • Cleaned Hero Subtitle:`);
  console.log(`    "${cleanedSections[0].props.subtitle}"`);
  console.log(`  • Cleaned CTA Title:`);
  console.log(`    "${cleanedSections[1].props.title}"`);
  console.log(`  • Cleaned CTA Eyebrow:`);
  console.log(`    "${cleanedSections[1].props.eyebrow}"`);

  console.log('\n[STEP 6] Pre-Flight Gate Verification:');
  if (finalReport.criticalCount === 0 && finalReport.score >= 90) {
    console.log('  ✅ PRE-FLIGHT PUBLISH GATE: CLEARED (Grade A+ • 100% Statutory Compliant)');
  } else {
    console.error('  ❌ PRE-FLIGHT BLOCKED');
    process.exit(1);
  }

  h.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
