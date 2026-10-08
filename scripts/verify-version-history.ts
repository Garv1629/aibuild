import { db, sanitizeVersionPayload } from '../server/db';

async function runVersionHistoryVerification() {
  console.log('=== STARTING CMS VERSION HISTORY & TIME TRAVEL VERIFICATION ===\n');

  // Step 1: Initialize Database
  console.log('1. Initializing DB and checking initial baseline...');
  db.init();

  // Test sanitization function directly
  const sensitivePayload = {
    hero: { title: 'Test Hero' },
    pinHash: 'super-secret-hash',
    adminPin: '123456',
    token: 'jwt-token-xyz',
    nested: {
      secretKey: 'key',
      safeField: 'This is safe',
    },
  };
  const sanitized = sanitizeVersionPayload(sensitivePayload);
  if (sanitized.pinHash || sanitized.adminPin || sanitized.token || sanitized.nested?.secretKey) {
    throw new Error('FAILED: Sensitive fields were NOT removed by sanitizeVersionPayload!');
  }
  if (sanitized.hero?.title !== 'Test Hero' || sanitized.nested?.safeField !== 'This is safe') {
    throw new Error('FAILED: Safe fields were unexpectedly modified during sanitization!');
  }
  console.log('   [PASS] Sensitive security fields are safely sanitized from version snapshots.');

  // Step 2: Create / Publish Initial Content (Version 1)
  console.log('\n2. Creating & Publishing Initial Content State (v1)...');
  const initialContent = db.getSiteSettingsAdmin();
  const v1Content = {
    ...initialContent,
    hero: {
      ...initialContent.hero,
      headlineMain: 'ALPHA_HEADLINE_V1',
      subheadline: 'Subheadline version 1 for testing history',
    },
  };
  db.publishSiteSettings(v1Content);

  const historyV1 = db.getVersions('site_content', 10);
  console.log(`   Recorded versions count for site_content: ${historyV1.length}`);
  const latestV1 = historyV1[0];
  console.log(`   Latest recorded version: v${latestV1.versionNumber} - "${latestV1.title}"`);
  if (!latestV1.content.hero.headlineMain.includes('ALPHA_HEADLINE_V1')) {
    throw new Error(`FAILED: Expected headline to be ALPHA_HEADLINE_V1, got ${latestV1.content.hero.headlineMain}`);
  }
  console.log('   [PASS] Version 1 snapshot successfully recorded.');

  // Step 3: Edit & Publish Again (Version 2)
  console.log('\n3. Editing & Publishing Second Content State (v2)...');
  const v2Content = {
    ...v1Content,
    hero: {
      ...v1Content.hero,
      headlineMain: 'BETA_HEADLINE_V2',
      subheadline: 'Subheadline version 2 with updated copy',
    },
  };
  db.publishSiteSettings(v2Content);

  const historyV2 = db.getVersions('site_content', 10);
  const latestV2 = historyV2[0];
  console.log(`   Recorded versions count: ${historyV2.length}`);
  console.log(`   Latest recorded version: v${latestV2.versionNumber} - "${latestV2.title}"`);
  if (!latestV2.content.hero.headlineMain.includes('BETA_HEADLINE_V2')) {
    throw new Error(`FAILED: Expected headline to be BETA_HEADLINE_V2, got ${latestV2.content.hero.headlineMain}`);
  }
  if (latestV2.versionNumber <= latestV1.versionNumber) {
    throw new Error(`FAILED: Version number did not increment! v1: ${latestV1.versionNumber}, v2: ${latestV2.versionNumber}`);
  }
  console.log('   [PASS] Version 2 snapshot successfully recorded with incremental version number.');

  // Step 4: Verify Public View Reflects V2
  console.log('\n4. Verifying Public Website Endpoint reflects v2...');
  const publicContentV2 = db.getPublishedSiteSettings();
  if (publicContentV2.hero.headlineMain !== 'BETA_HEADLINE_V2') {
    throw new Error(`FAILED: Public content does not reflect published v2: ${publicContentV2.hero.headlineMain}`);
  }
  console.log('   [PASS] Public website accurately reflects published v2 content.');

  // Step 5: Restore Older Version 1 (Time Travel)
  console.log(`\n5. Restoring Older Version (v${latestV1.versionNumber})...`);
  const restoreResult = await db.restoreVersion(latestV1.id, 'Lead QA Admin');
  console.log('   Restore executed. Result:', restoreResult.success ? 'Success' : 'Failed');

  // Step 6: Verify Restored State & Lineage Preservation
  console.log('\n6. Verifying Restored State & Lineage Preservation...');
  const historyAfterRestore = db.getVersions('site_content', 10);
  console.log(`   Total versions now in history: ${historyAfterRestore.length}`);
  const newestVersion = historyAfterRestore[0];
  console.log(`   New current version: v${newestVersion.versionNumber} - "${newestVersion.title}"`);

  // Verify that previous versions (v1 and v2) are still present in history
  const hasV1InHistory = historyAfterRestore.some((v: any) => v.id === latestV1.id);
  const hasV2InHistory = historyAfterRestore.some((v: any) => v.id === latestV2.id);
  if (!hasV1InHistory || !hasV2InHistory) {
    throw new Error('FAILED: Older versions were destroyed during restore! History must be additive & immutable.');
  }
  console.log('   [PASS] Previous history is 100% preserved (v1 and v2 still intact).');

  // Verify that the restored content is now active in published site
  const publicContentRestored = db.getPublishedSiteSettings();
  if (publicContentRestored.hero.headlineMain !== 'ALPHA_HEADLINE_V1') {
    throw new Error(`FAILED: Published content after restore should be ALPHA_HEADLINE_V1, got: ${publicContentRestored.hero.headlineMain}`);
  }
  console.log('   [PASS] Public website immediately reflects restored v1 content.');

  // Step 7: Test Project & Estimator Version Tracking
  console.log('\n7. Testing Estimator & Pricing Version Tracking...');
  const currentEstimator = db.getEstimatorSettings();
  db.updateEstimatorSettings({
    ...currentEstimator,
    modalTitle: 'Custom Estimator Rate Card v9',
  });
  const estimatorVersions = db.getVersions('estimator', 5);
  console.log(`   Estimator versions recorded: ${estimatorVersions.length}`);
  if (estimatorVersions.length === 0 || estimatorVersions[0].content.modalTitle !== 'Custom Estimator Rate Card v9') {
    throw new Error('FAILED: Estimator version was not recorded correctly.');
  }
  console.log('   [PASS] Estimator pricing version tracking verified.');

  console.log('\n=== ALL VERSION HISTORY & TIME TRAVEL TESTS PASSED SUCCESSFULLY! ===\n');
}

runVersionHistoryVerification().catch((err) => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
