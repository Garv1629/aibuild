import { db } from '../server/db.ts';

async function runOrderingTests() {
  console.log('====================================================');
  console.log('--- STARTING PERSISTENT ORDERING END-TO-END TEST ---');
  console.log('====================================================');

  await db.init();
  console.log('[Setup] Database initialized successfully.');

  // ==========================================
  // TEST 1: PROJECTS PERSISTENT ORDERING
  // ==========================================
  console.log('\n--- [TEST 1: PROJECTS ORDERING] ---');
  const now = Date.now();
  const projA = db.saveProject({
    title: `Alpha Project ${now}`,
    category: 'UGC ADS',
    description: 'First project in creation',
    status: 'published',
  }, 'Admin Tester');

  const projB = db.saveProject({
    title: `Beta Project ${now}`,
    category: 'AI VIDEOS',
    description: 'Second project in creation',
    status: 'published',
  }, 'Admin Tester');

  const projC = db.saveProject({
    title: `Gamma Project ${now}`,
    category: 'AUTOMATION',
    description: 'Third project in creation',
    status: 'published',
  }, 'Admin Tester');

  console.log(`[Projects] 1. Created 3 test projects: A (${projA.id}), B (${projB.id}), C (${projC.id})`);

  // Reverse the order: C -> A -> B
  const desiredProjectOrder = [projC.id, projA.id, projB.id];
  db.reorderProjects(desiredProjectOrder, 'Admin Tester');
  console.log(`[Projects] 2. Reordered to [C, A, B] persistently in database.`);

  // Verify SQLite / Database has updated display_order
  const reorderedProjects = db.getProjects(true, false);
  const findC = reorderedProjects.find(p => p.id === projC.id);
  const findA = reorderedProjects.find(p => p.id === projA.id);
  const findB = reorderedProjects.find(p => p.id === projB.id);

  if (findC?.displayOrder !== 0 || findA?.displayOrder !== 1 || findB?.displayOrder !== 2) {
    throw new Error(`FAIL: Project display_order indices mismatch! Expected C:0, A:1, B:2; got C:${findC?.displayOrder}, A:${findA?.displayOrder}, B:${findB?.displayOrder}`);
  }
  console.log(`[Projects] 3. Verified sequential normalized display_order: C=${findC.displayOrder}, A=${findA.displayOrder}, B=${findB.displayOrder}`);

  // Verify public site query returns exact order
  const publicProjects = db.getProjects(false);
  const indexC = publicProjects.findIndex(p => p.id === projC.id);
  const indexA = publicProjects.findIndex(p => p.id === projA.id);
  const indexB = publicProjects.findIndex(p => p.id === projB.id);

  if (indexC > indexA || indexA > indexB) {
    throw new Error(`FAIL: Public query did not return requested order [C, A, B]! Indices: C=${indexC}, A=${indexA}, B=${indexB}`);
  }
  console.log(`[Projects] 4. Verified public website query returns exact database ordering [C -> A -> B].`);

  // Clean up
  db.deleteProject(projA.id, true, 'Admin Tester');
  db.deleteProject(projB.id, true, 'Admin Tester');
  db.deleteProject(projC.id, true, 'Admin Tester');
  console.log(`[Projects] 5. Cleaned up test projects.`);

  // ==========================================
  // TEST 2: REVIEWS PERSISTENT ORDERING
  // ==========================================
  console.log('\n--- [TEST 2: REVIEWS ORDERING] ---');
  const revA = db.saveReview({
    author: `Alice ${now}`,
    company: 'Alpha Corp',
    role: 'Product Lead',
    comment: 'Great 3D assets',
    rating: 5,
    status: 'approved',
  }, 'Admin Tester');

  const revB = db.saveReview({
    author: `Bob ${now}`,
    company: 'Beta Labs',
    role: 'Creative Director',
    comment: 'Awesome visuals',
    rating: 5,
    status: 'approved',
  }, 'Admin Tester');

  const revC = db.saveReview({
    author: `Charlie ${now}`,
    company: 'Gamma Studios',
    role: 'CEO',
    comment: 'Super fast delivery',
    rating: 5,
    status: 'approved',
  }, 'Admin Tester');

  console.log(`[Reviews] 1. Created 3 test reviews: A (${revA.id}), B (${revB.id}), C (${revC.id})`);

  // Reorder reviews: B -> C -> A
  const desiredReviewOrder = [revB.id, revC.id, revA.id];
  db.reorderReviews(desiredReviewOrder, 'Admin Tester');
  console.log(`[Reviews] 2. Reordered to [B, C, A] persistently in database.`);

  const adminReviews = db.getReviews(true, false);
  const rB = adminReviews.find(r => r.id === revB.id);
  const rC = adminReviews.find(r => r.id === revC.id);
  const rA = adminReviews.find(r => r.id === revA.id);

  if (rB?.displayOrder !== 0 || rC?.displayOrder !== 1 || rA?.displayOrder !== 2) {
    throw new Error(`FAIL: Reviews display_order indices mismatch! Expected B:0, C:1, A:2; got B:${rB?.displayOrder}, C:${rC?.displayOrder}, A:${rA?.displayOrder}`);
  }
  console.log(`[Reviews] 3. Verified sequential normalized display_order: B=${rB.displayOrder}, C=${rC.displayOrder}, A=${rA.displayOrder}`);

  // Verify public reviews query returns exact order
  const publicReviews = db.getReviews(false);
  const rIndexB = publicReviews.findIndex(r => r.id === revB.id);
  const rIndexC = publicReviews.findIndex(r => r.id === revC.id);
  const rIndexA = publicReviews.findIndex(r => r.id === revA.id);

  if (rIndexB > rIndexC || rIndexC > rIndexA) {
    throw new Error(`FAIL: Public reviews query did not return requested order [B, C, A]! Indices: B=${rIndexB}, C=${rIndexC}, A=${rIndexA}`);
  }
  console.log(`[Reviews] 4. Verified public reviews query returns exact database ordering [B -> C -> A].`);

  // Clean up
  db.deleteReview(revA.id, true, 'Admin Tester');
  db.deleteReview(revB.id, true, 'Admin Tester');
  db.deleteReview(revC.id, true, 'Admin Tester');
  console.log(`[Reviews] 5. Cleaned up test reviews.`);

  // ==========================================
  // TEST 3: SERVICES PERSISTENT ORDERING
  // ==========================================
  console.log('\n--- [TEST 3: SERVICES ORDERING] ---');
  const adminSettings = await db.getSiteSettingsAdmin();
  const originalServices = adminSettings.draft.services?.items || [];

  const testServ1 = { number: `T1-${now}`, title: 'VFX Hologram', description: 'Volumetric rendering', isDeleted: false };
  const testServ2 = { number: `T2-${now}`, title: 'WebGL Shaders', description: 'Interactive shaders', isDeleted: false };

  // Save with testServ1 then testServ2
  await db.saveSiteSettingsDraft({
    ...adminSettings.draft,
    services: {
      heading: 'WHAT WE DO',
      subheading: 'Manifesto',
      items: [testServ1, testServ2, ...originalServices],
    },
  });

  // Reorder: testServ2 then testServ1
  let updatedSettings = await db.getSiteSettingsAdmin();
  const reorderedServicesList = [testServ2, testServ1, ...originalServices].map((s, idx) => ({ ...s, displayOrder: idx }));

  await db.saveSiteSettingsDraft({
    ...updatedSettings.draft,
    services: {
      ...updatedSettings.draft.services,
      items: reorderedServicesList,
    },
  });
  await db.publishSiteSettings('Admin Tester');
  console.log(`[Services] 1. Reordered test services in draft and published live.`);

  const liveSettings = await db.getSiteSettings(false);
  const liveItems = liveSettings.services?.items || [];
  const s2Idx = liveItems.findIndex(s => s.number === testServ2.number);
  const s1Idx = liveItems.findIndex(s => s.number === testServ1.number);

  if (s2Idx === -1 || s1Idx === -1 || s2Idx > s1Idx) {
    throw new Error(`FAIL: Public services ordering did not preserve [testServ2 -> testServ1]! Got s2Idx=${s2Idx}, s1Idx=${s1Idx}`);
  }
  console.log(`[Services] 2. Verified public website reflects exact persisted services ordering.`);

  // Clean up
  await db.saveSiteSettingsDraft({
    ...updatedSettings.draft,
    services: {
      ...updatedSettings.draft.services,
      items: originalServices,
    },
  });
  await db.publishSiteSettings('Admin Tester');
  console.log(`[Services] 3. Restored original services.`);

  console.log('\n====================================================');
  console.log('✅ ALL DRAG & DROP PERSISTENT ORDERING TESTS PASSED 100%!');
  console.log('====================================================');
}

runOrderingTests().catch((err) => {
  console.error('❌ ORDERING TEST RUNNER FAILED:', err);
  process.exit(1);
});
