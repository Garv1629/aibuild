import { CmsDatabase } from '../server/db';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 VERIFYING PUBLISHED / HIDDEN VISIBILITY CONTROLS');
  console.log('====================================================');

  const db = new CmsDatabase();
  await db.init();

  // ---------------------------------------------------------------
  // 1. TEST PROJECTS PUBLISHED / HIDDEN CONTROLS
  // ---------------------------------------------------------------
  console.log('\n--- Test 1: Projects Published / Hidden Workflow ---');
  const testProjId = `test-proj-${Date.now()}`;

  // Step 1: Create a hidden / draft project
  console.log('1. Creating hidden/draft project...');
  const createdProj = db.createProject({
    id: testProjId,
    title: 'Alpha Secret Launch',
    category: 'AI VIDEOS',
    tagline: 'Super secret confidential prototype',
    status: 'draft',
    col1Image1: 'https://images.unsplash.com/photo-1',
    col1Image2: 'https://images.unsplash.com/photo-2',
    col2Image: 'https://images.unsplash.com/photo-3',
  });
  console.log(`   Created project ID: ${createdProj.id}, status: ${createdProj.status}`);

  // Step 2: Verify NOT in public website API query
  const publicProjects1 = db.getProjects(false);
  const isFoundPublic1 = publicProjects1.some((p: any) => p.id === testProjId);
  console.log(`2. Public API contains hidden project? -> ${isFoundPublic1 ? '❌ FAIL (visible)' : '✅ PASS (hidden)'}`);
  if (isFoundPublic1) throw new Error('Hidden project appeared on public query!');

  // Step 3: Verify Admin query contains it and admin can edit it
  const adminProjects1 = db.getProjects(true);
  const foundAdmin1 = adminProjects1.find((p: any) => p.id === testProjId);
  console.log(`3. Admin API contains hidden project? -> ${foundAdmin1 ? '✅ PASS' : '❌ FAIL'}`);
  if (!foundAdmin1) throw new Error('Admin could not find hidden project!');

  // Step 4: Admin edits hidden project
  console.log('4. Admin editing hidden project content...');
  db.updateProject(testProjId, {
    title: 'Alpha Secret Launch (Revised V2)',
    tagline: 'Latest revised confidential prototype details',
  });
  const editedHidden = db.getProjectById(testProjId);
  console.log(`   Saved title: "${editedHidden.title}", status: ${editedHidden.status}`);
  if (editedHidden.title !== 'Alpha Secret Launch (Revised V2)') throw new Error('Edits failed to save on hidden project');

  // Step 5: Verify still NOT public after edits
  const publicProjects2 = db.getProjects(false);
  const isFoundPublic2 = publicProjects2.some((p: any) => p.id === testProjId);
  console.log(`5. Public API after edits contains hidden project? -> ${isFoundPublic2 ? '❌ FAIL' : '✅ PASS (still hidden)'}`);
  if (isFoundPublic2) throw new Error('Edited hidden project leaked to public site!');

  // Step 6: Publish project
  console.log('6. Publishing project live to public...');
  db.publishProject(testProjId);

  // Step 7: Verify public API now returns latest saved version
  const publicProjects3 = db.getProjects(false);
  const foundPublic3 = publicProjects3.find((p: any) => p.id === testProjId);
  console.log(`7. Public API after publishing contains project? -> ${foundPublic3 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Published title on public site: "${foundPublic3?.title}"`);
  if (!foundPublic3 || foundPublic3.title !== 'Alpha Secret Launch (Revised V2)') {
    throw new Error('Public site does not show latest published version!');
  }

  // Step 8: Simulate reload / another browser / device restart
  console.log('8. Simulating page reload / secondary device session...');
  const dbSession2 = new CmsDatabase();
  await dbSession2.init();
  const session2Public = dbSession2.getProjects(false).find((p: any) => p.id === testProjId);
  console.log(`   Session 2 public query finds published project? -> ${session2Public ? '✅ PASS' : '❌ FAIL'}`);
  if (!session2Public) throw new Error('Published state did not persist across reload/session!');

  // Step 9: Hide / Unpublish project again
  console.log('9. Hiding / unpublishing project...');
  dbSession2.unpublishProject(testProjId);
  const session2PublicAfterHide = dbSession2.getProjects(false).find((p: any) => p.id === testProjId);
  console.log(`   Public query after unpublishing finds project? -> ${session2PublicAfterHide ? '❌ FAIL (visible)' : '✅ PASS (hidden again)'}`);
  if (session2PublicAfterHide) throw new Error('Unpublished project is still visible publicly!');

  // Clean up test project
  db.deleteProject(testProjId, true);

  // ---------------------------------------------------------------
  // 2. TEST REVIEWS PUBLISHED / HIDDEN (APPROVED VS PENDING)
  // ---------------------------------------------------------------
  console.log('\n--- Test 2: Reviews Published (Approved) / Hidden (Pending) Workflow ---');
  const testRevId = `test-rev-${Date.now()}`;

  // Step 1: Create a pending / hidden review
  console.log('1. Creating pending/hidden review...');
  const createdRev = db.createReview({
    id: testRevId,
    author: 'Elena Rostova',
    company: 'Neural Matrix Lab',
    role: 'VP AI Engineering',
    rating: 5,
    comment: 'Spectacular 3D and AI execution from start to finish.',
    status: 'pending',
  });
  console.log(`   Created review ID: ${createdRev.id}, status: ${createdRev.status}`);

  // Step 2: Verify public API does not return pending review
  const publicRev1 = db.getReviews(false);
  const isRevPublic1 = publicRev1.some((r: any) => r.id === testRevId);
  console.log(`2. Public API contains pending review? -> ${isRevPublic1 ? '❌ FAIL (visible)' : '✅ PASS (hidden)'}`);
  if (isRevPublic1) throw new Error('Pending review leaked to public reviews feed!');

  // Step 3: Admin query contains pending review
  const adminRev1 = db.getReviews(true);
  const foundAdminRev1 = adminRev1.find((r: any) => r.id === testRevId);
  console.log(`3. Admin API contains pending review? -> ${foundAdminRev1 ? '✅ PASS' : '❌ FAIL'}`);
  if (!foundAdminRev1) throw new Error('Admin could not see pending review!');

  // Step 4: Admin updates review and approves (publishes) it
  console.log('4. Admin updating review comment & publishing (approving)...');
  db.updateReview(testRevId, {
    comment: 'Spectacular 3D and AI execution from start to finish. Highly recommended for top-tier launches!',
    status: 'approved',
  });

  // Step 5: Verify public API now displays latest approved version
  const publicRev2 = db.getReviews(false);
  const foundRevPublic2 = publicRev2.find((r: any) => r.id === testRevId);
  console.log(`5. Public API displays approved review? -> ${foundRevPublic2 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Public comment: "${foundRevPublic2?.comment}"`);
  if (!foundRevPublic2 || !foundRevPublic2.comment.includes('Highly recommended')) {
    throw new Error('Public reviews feed did not display latest approved review version!');
  }

  // Step 6: Simulate reload / new device session
  console.log('6. Simulating reload / new device session for reviews...');
  const dbSession3 = new CmsDatabase();
  await dbSession3.init();
  const session3Rev = dbSession3.getReviews(false).find((r: any) => r.id === testRevId);
  console.log(`   Session 3 finds approved review? -> ${session3Rev ? '✅ PASS' : '❌ FAIL'}`);
  if (!session3Rev) throw new Error('Review approved state did not persist in database!');

  // Clean up test review
  db.deleteReview(testRevId, true);

  // ---------------------------------------------------------------
  // 3. TEST SERVICES & DISCIPLINES PUBLISHED / HIDDEN
  // ---------------------------------------------------------------
  console.log('\n--- Test 3: Services & Disciplines Published / Hidden Workflow ---');
  const currentSettings = db.getSiteSettings(true);
  const originalServices = currentSettings.services?.items || [];

  const testDisciplineNumber = '99';
  const modifiedServices = [
    ...originalServices,
    {
      number: testDisciplineNumber,
      title: 'QUANTUM VISUALIZATION',
      description: 'Experimental holographic rendering workflows',
      status: 'hidden',
      isHidden: true,
      tagline: 'Experimental',
    },
  ];

  console.log('1. Saving site settings draft with a hidden discipline (#99)...');
  db.saveSiteSettingsDraft({
    ...currentSettings,
    services: {
      ...currentSettings.services,
      items: modifiedServices,
    },
  });

  console.log('2. Publishing site settings...');
  db.publishSiteSettings();

  // Step 3: Verify public site settings filters out hidden discipline
  const publicSettings1 = db.getSiteSettings(false);
  const foundPublicDisc1 = (publicSettings1.services?.items || []).find((s: any) => s.number === testDisciplineNumber);
  console.log(`3. Public site settings contains hidden discipline #99? -> ${foundPublicDisc1 ? '❌ FAIL (visible)' : '✅ PASS (hidden)'}`);
  if (foundPublicDisc1) throw new Error('Hidden discipline appeared in public site settings!');

  // Step 4: Verify admin draft settings retains the hidden discipline
  const adminSettings1 = db.getSiteSettings(true);
  const foundAdminDisc1 = (adminSettings1.services?.items || []).find((s: any) => s.number === testDisciplineNumber);
  console.log(`4. Admin settings contains hidden discipline #99? -> ${foundAdminDisc1 ? '✅ PASS' : '❌ FAIL'}`);
  if (!foundAdminDisc1) throw new Error('Admin settings lost the hidden discipline!');

  // Step 5: Unhide / Publish the discipline
  console.log('5. Setting discipline #99 to published (isHidden: false)...');
  const publishedDisciplineServices = (adminSettings1.services?.items || []).map((s: any) =>
    s.number === testDisciplineNumber ? { ...s, isHidden: false, status: 'published' } : s
  );
  db.publishSiteSettings({
    ...adminSettings1,
    services: {
      ...adminSettings1.services,
      items: publishedDisciplineServices,
    },
  });

  const publicSettings2 = db.getSiteSettings(false);
  const foundPublicDisc2 = (publicSettings2.services?.items || []).find((s: any) => s.number === testDisciplineNumber);
  console.log(`6. Public site settings contains published discipline #99? -> ${foundPublicDisc2 ? '✅ PASS' : '❌ FAIL'}`);
  if (!foundPublicDisc2) throw new Error('Published discipline did not appear on public site settings!');

  // Clean up: revert services back to original
  console.log('7. Cleaning up test discipline...');
  db.publishSiteSettings({
    ...adminSettings1,
    services: {
      ...adminSettings1.services,
      items: originalServices,
    },
  });

  console.log('\n====================================================');
  console.log('🎉 ALL PUBLISHED / HIDDEN CONTROLS TESTS PASSED!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
