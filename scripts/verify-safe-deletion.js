import { db } from '../server/db.ts';

async function runSafeDeletionTests() {
  console.log('====================================================');
  console.log('--- STARTING SAFE DELETION & RESTORE VERIFICATION ---');
  console.log('====================================================');

  await db.init();
  console.log('[Setup] Database initialized successfully.');

  // ==========================================
  // TEST 1: PROJECTS SAFE DELETION & RESTORE
  // ==========================================
  console.log('\n--- [TEST 1: PROJECTS] ---');
  const testProject = {
    title: 'Safe Deletion Test Project ' + Date.now(),
    category: '3D Simulation',
    description: 'A test project to verify soft-delete, trash isolation, and restore.',
    featured: true,
    tags: ['SafeDelete', 'Test'],
    status: 'published',
  };

  const createdProject = db.saveProject(testProject, 'Admin Tester');
  console.log(`[Projects] 1. Created published project ID: ${createdProject.id}`);

  // Verify visible publicly
  let publicProjects = db.getProjects(false);
  let isPublic = publicProjects.some(p => p.id === createdProject.id);
  if (!isPublic) throw new Error('FAIL: Created published project is not visible publicly');
  console.log('[Projects] 2. Verified project is VISIBLE on public site.');

  // Soft-Delete (Move to Trash)
  const softDeleted = db.softDeleteProject(createdProject.id, 'Admin Tester');
  if (!softDeleted || !softDeleted.isDeleted) throw new Error('FAIL: softDeleteProject did not mark as deleted');
  console.log('[Projects] 3. Project soft-deleted (moved to Trash).');

  // Verify hidden publicly
  publicProjects = db.getProjects(false);
  isPublic = publicProjects.some(p => p.id === createdProject.id);
  if (isPublic) throw new Error('FAIL: Soft-deleted project is still visible publicly!');
  console.log('[Projects] 4. Verified project is HIDDEN from public website.');

  // Verify visible in Admin Trash
  let adminAllProjects = db.getProjects(true);
  const foundInAdmin = adminAllProjects.find(p => p.id === createdProject.id);
  if (!foundInAdmin || !foundInAdmin.isDeleted) {
    throw new Error('FAIL: Soft-deleted project missing from Admin Trash or not flagged as isDeleted!');
  }
  console.log(`[Projects] 5. Verified project REMAINS RECOVERABLE in Admin Trash (deletedAt: ${foundInAdmin.deletedAt}).`);

  // Restore Project
  const restoredProject = db.restoreProject(createdProject.id, 'Admin Tester');
  if (!restoredProject || restoredProject.isDeleted) {
    throw new Error('FAIL: restoreProject failed to clear deleted flags');
  }
  console.log('[Projects] 6. Project restored from Trash.');

  // Verify visible publicly again (restored as published)
  publicProjects = db.getProjects(false);
  isPublic = publicProjects.some(p => p.id === createdProject.id);
  if (!isPublic) throw new Error('FAIL: Restored project is not visible publicly!');
  console.log('[Projects] 7. Verified project RE-APPEARS PUBLICLY after restore.');

  // Permanent Delete cleanup
  db.deleteProject(createdProject.id, true, 'Admin Tester');
  adminAllProjects = db.getProjects(true);
  if (adminAllProjects.some(p => p.id === createdProject.id)) {
    throw new Error('FAIL: Permanent delete did not remove record from DB');
  }
  console.log('[Projects] 8. Permanent delete verified & cleaned up.');

  // ==========================================
  // TEST 2: REVIEWS / TESTIMONIALS SAFE DELETION & RESTORE
  // ==========================================
  console.log('\n--- [TEST 2: REVIEWS] ---');
  const testReview = {
    name: 'Jane Doe ' + Date.now(),
    company: 'TestCorp',
    role: 'Art Director',
    content: 'Fantastic work on 3D animations!',
    rating: 5,
    approved: true,
    featured: true,
    verified: true,
  };

  const createdReview = db.saveReview(testReview, 'Admin Tester');
  console.log(`[Reviews] 1. Created approved review ID: ${createdReview.id}`);

  // Verify public visibility
  let publicReviews = db.getReviews(false);
  if (!publicReviews.some(r => r.id === createdReview.id)) {
    throw new Error('FAIL: Created approved review is not visible publicly');
  }
  console.log('[Reviews] 2. Verified review is VISIBLE publicly.');

  // Soft Delete
  db.softDeleteReview(createdReview.id, 'Admin Tester');
  console.log('[Reviews] 3. Review soft-deleted (moved to Trash).');

  // Verify hidden publicly
  publicReviews = db.getReviews(false);
  if (publicReviews.some(r => r.id === createdReview.id)) {
    throw new Error('FAIL: Soft-deleted review still visible publicly!');
  }
  console.log('[Reviews] 4. Verified review is HIDDEN publicly.');

  // Verify in Admin list with isDeleted
  let adminReviews = db.getReviews(true);
  const foundReview = adminReviews.find(r => r.id === createdReview.id);
  if (!foundReview || !foundReview.isDeleted) {
    throw new Error('FAIL: Deleted review not found in admin list with isDeleted flag');
  }
  console.log('[Reviews] 5. Verified review is RECOVERABLE in Admin Trash.');

  // Restore
  db.restoreReview(createdReview.id, 'Admin Tester');
  publicReviews = db.getReviews(false);
  if (!publicReviews.some(r => r.id === createdReview.id)) {
    throw new Error('FAIL: Restored review not visible publicly');
  }
  console.log('[Reviews] 6. Review RESTORED and visible publicly again.');

  // Permanent Delete cleanup
  db.deleteReview(createdReview.id, true, 'Admin Tester');
  adminReviews = db.getReviews(true);
  if (adminReviews.some(r => r.id === createdReview.id)) {
    throw new Error('FAIL: Permanent delete did not remove review');
  }
  console.log('[Reviews] 7. Permanent delete verified & cleaned up.');

  // ==========================================
  // TEST 3: SERVICES SAFE DELETION & RESTORE
  // ==========================================
  console.log('\n--- [TEST 3: SERVICES / DISCIPLINES] ---');
  const initialSettings = await db.getSiteSettingsAdmin();
  const testServiceId = 'service-test-' + Date.now();
  const testService = {
    id: testServiceId,
    title: 'Hologram VFX Design',
    category: 'VFX',
    description: 'High end volumetric rendering',
    icon: 'Sparkles',
    pricingStartingAt: 2500,
    tags: ['VFX', 'Hologram'],
    isDeleted: false,
    deletedAt: null,
  };

  // Add service to draft and publish
  const updatedServices = [...(initialSettings.draft.services || []), testService];
  await db.saveSiteSettingsDraft({
    ...initialSettings.draft,
    services: updatedServices,
  });
  await db.publishSiteSettings('Admin Tester');
  console.log(`[Services] 1. Added and published new test service: ${testServiceId}`);

  // Verify public visibility
  let publicSettings = await db.getSiteSettings(false);
  if (!publicSettings.services?.some(s => s.id === testServiceId)) {
    throw new Error('FAIL: Newly published service not in public settings!');
  }
  console.log('[Services] 2. Verified service is VISIBLE publicly.');

  // Soft Delete service in draft and publish
  let currentAdminSettings = await db.getSiteSettingsAdmin();
  let servicesWithDeleted = (currentAdminSettings.draft.services || []).map(s => {
    if (s.id === testServiceId) {
      return { ...s, isDeleted: true, deletedAt: new Date().toISOString() };
    }
    return s;
  });
  await db.saveSiteSettingsDraft({
    ...currentAdminSettings.draft,
    services: servicesWithDeleted,
  });
  await db.publishSiteSettings('Admin Tester');
  console.log('[Services] 3. Soft-deleted service and published update.');

  // Verify hidden publicly
  publicSettings = await db.getSiteSettings(false);
  if (publicSettings.services?.some(s => s.id === testServiceId)) {
    throw new Error('FAIL: Soft-deleted service is still returned in public site settings!');
  }
  console.log('[Services] 4. Verified service is HIDDEN from public website.');

  // Verify recoverable in admin draft
  currentAdminSettings = await db.getSiteSettingsAdmin();
  const adminService = currentAdminSettings.draft.services?.find(s => s.id === testServiceId);
  if (!adminService || !adminService.isDeleted) {
    throw new Error('FAIL: Soft-deleted service missing isDeleted flag in Admin CMS draft');
  }
  console.log('[Services] 5. Verified service is RECOVERABLE in Admin Services Trash.');

  // Restore Service
  const restoredServices = (currentAdminSettings.draft.services || []).map(s => {
    if (s.id === testServiceId) {
      return { ...s, isDeleted: false, deletedAt: null };
    }
    return s;
  });
  await db.saveSiteSettingsDraft({
    ...currentAdminSettings.draft,
    services: restoredServices,
  });
  await db.publishSiteSettings('Admin Tester');
  publicSettings = await db.getSiteSettings(false);
  if (!publicSettings.services?.some(s => s.id === testServiceId)) {
    throw new Error('FAIL: Restored service did not reappear on public website');
  }
  console.log('[Services] 6. Service RESTORED and confirmed live on public site.');

  // Cleanup service
  const cleanedServices = (currentAdminSettings.draft.services || []).filter(s => s.id !== testServiceId);
  await db.saveSiteSettingsDraft({
    ...currentAdminSettings.draft,
    services: cleanedServices,
  });
  await db.publishSiteSettings('Admin Tester');
  console.log('[Services] 7. Cleaned up test service.');

  // ==========================================
  // TEST 4: INBOUND MESSAGES SAFE DELETION
  // ==========================================
  console.log('\n--- [TEST 4: INBOUND MESSAGES] ---');
  const testMessage = {
    name: 'Alex Mercer',
    email: 'alex@example.com',
    message: 'I would like a quote on 3D game assets.',
    projectType: '3D Game Assets',
  };

  const createdMsg = db.saveMessage(testMessage);
  console.log(`[Messages] 1. Created inbound message ID: ${createdMsg.id}`);

  // Soft delete message
  db.softDeleteMessage(createdMsg.id);
  let activeMessages = db.getMessages(false);
  if (activeMessages.some(m => m.id === createdMsg.id)) {
    throw new Error('FAIL: Soft-deleted message still in active messages list');
  }
  let trashMessages = db.getMessages(true);
  const foundMsg = trashMessages.find(m => m.id === createdMsg.id);
  if (!foundMsg || !foundMsg.isDeleted) {
    throw new Error('FAIL: Soft-deleted message not in trash with isDeleted flag');
  }
  console.log('[Messages] 2. Verified message moved to Trash and hidden from active inbox.');

  // Restore message
  db.restoreMessage(createdMsg.id);
  activeMessages = db.getMessages(false);
  if (!activeMessages.some(m => m.id === createdMsg.id)) {
    throw new Error('FAIL: Restored message did not return to active inbox');
  }
  console.log('[Messages] 3. Verified message RESTORED to active inbox.');

  // Permanent Delete
  db.deleteMessage(createdMsg.id, true);
  trashMessages = db.getMessages(true);
  if (trashMessages.some(m => m.id === createdMsg.id)) {
    throw new Error('FAIL: Permanent delete did not remove message from database');
  }
  console.log('[Messages] 4. Verified permanent delete cleans up message.');

  console.log('\n====================================================');
  console.log('✅ ALL SAFE DELETION & RESTORATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runSafeDeletionTests().catch(err => {
  console.error('❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
