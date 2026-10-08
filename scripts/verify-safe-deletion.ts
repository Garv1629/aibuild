import { db } from '../server/db';

async function runSafeDeletionVerification() {
  console.log('=== STARTING SAFE DELETION & RECOVERY TEST SUITE ===\n');

  // Initialize DB
  db.init();

  // ==========================================
  // TEST 1: PROJECTS SAFE DELETION & RECOVERY
  // ==========================================
  console.log('1. Testing Projects Safe Deletion & Restoration Flow...');
  const testProjectPayload = {
    number: '99',
    title: 'Safe Deletion Test Showcase',
    category: 'TESTING',
    tagline: 'Safe deletion verification project item',
    col1_image1: 'https://images.unsplash.com/photo-1',
    col1_image2: 'https://images.unsplash.com/photo-2',
    col2_image: 'https://images.unsplash.com/photo-3',
    video_url: '',
    media_type: 'image',
    media_items_json: JSON.stringify([]),
    live_url: 'https://test.local',
    tech_stack_json: JSON.stringify(['React', 'TypeScript']),
    featured: 1,
    aspect_ratio: 'auto',
    status: 'published',
    sort_order: 999,
  };

  // Step 1a: Create Project
  const createdProject = db.createProject(testProjectPayload);
  const projectId = createdProject.id;
  console.log(`   [PASS] Created test project with ID: ${projectId}`);

  // Step 1b: Verify visible on public website
  let publicProjects = db.getProjects(false, false);
  const foundInPublic = publicProjects.find((p) => p.id === projectId);
  if (!foundInPublic) {
    throw new Error('FAILED: Newly created published project was not found in public projects query!');
  }
  console.log('   [PASS] Project is visible publicly on website.');

  // Step 1c: Safe Delete Project (Soft Delete)
  db.softDeleteProject(projectId, 'Admin Tester');
  console.log('   [PASS] Soft-deleted project (is_deleted = 1, status = archived).');

  // Step 1d: Verify immediately HIDDEN from public website
  publicProjects = db.getProjects(false, false);
  const foundInPublicAfterDelete = publicProjects.find((p) => p.id === projectId);
  if (foundInPublicAfterDelete) {
    throw new Error('FAILED: Soft-deleted project is STILL visible in public projects query!');
  }
  console.log('   [PASS] Soft-deleted project disappeared from public website.');

  // Step 1e: Verify ADMIN still identifies deleted item in Trash
  const allProjectsAdmin = db.getProjects(true, true);
  const foundInAdminTrash = allProjectsAdmin.find((p) => p.id === projectId);
  if (!foundInAdminTrash || !foundInAdminTrash.is_deleted || foundInAdminTrash.status !== 'archived') {
    throw new Error('FAILED: Soft-deleted project was not found in admin trash view with correct flags!');
  }
  console.log('   [PASS] Admin can identify and inspect soft-deleted project in Trash.');

  // Step 1f: Restore Project
  db.restoreProject(projectId, 'Admin Tester');
  console.log('   [PASS] Restored project from Trash.');

  // Step 1g: Verify project is back and visible publicly
  publicProjects = db.getProjects(false, false);
  const foundInPublicAfterRestore = publicProjects.find((p) => p.id === projectId);
  if (!foundInPublicAfterRestore || foundInPublicAfterRestore.status !== 'published') {
    throw new Error('FAILED: Restored project is not visible publicly with status = published!');
  }
  console.log('   [PASS] Restored project reappears on public website.');

  // Step 1h: Test Permanent Delete from Trash
  db.softDeleteProject(projectId);
  db.deleteProject(projectId, true);
  const allProjectsAfterHardDelete = db.getProjects(true, true);
  if (allProjectsAfterHardDelete.some((p) => p.id === projectId)) {
    throw new Error('FAILED: Project was not permanently deleted when permanent = true requested!');
  }
  console.log('   [PASS] Permanent deletion from trash verified.\n');

  // ==========================================
  // TEST 2: REVIEWS SAFE DELETION & RECOVERY
  // ==========================================
  console.log('2. Testing Reviews Safe Deletion & Restoration Flow...');
  const testReviewPayload = {
    author: 'Safe Delete Reviewer',
    role: 'VP of Product',
    company: 'Test Corp',
    avatar: 'https://images.unsplash.com/photo-avatar',
    rating: 5,
    comment: 'Exceptional AI build delivery with complete data persistence and safety.',
    date: 'Oct 4, 2026',
    status: 'approved',
    is_featured: 1,
    project_referenced: 'Test Case',
  };

  // Step 2a: Create Review
  const createdReview = db.createReview(testReviewPayload);
  const reviewId = createdReview.id;
  console.log(`   [PASS] Created test review with ID: ${reviewId}`);

  // Step 2b: Verify public view
  let publicReviews = db.getReviews(false, false);
  if (!publicReviews.some((r) => r.id === reviewId)) {
    throw new Error('FAILED: Created review is not visible in public reviews!');
  }
  console.log('   [PASS] Review is visible publicly on website.');

  // Step 2c: Soft delete review
  db.softDeleteReview(reviewId, 'Admin Tester');
  console.log('   [PASS] Soft-deleted review.');

  // Step 2d: Verify hidden publicly
  publicReviews = db.getReviews(false, false);
  if (publicReviews.some((r) => r.id === reviewId)) {
    throw new Error('FAILED: Soft-deleted review is STILL visible publicly!');
  }
  console.log('   [PASS] Soft-deleted review disappeared from public website.');

  // Step 2e: Verify present in admin trash
  const allReviewsAdmin = db.getReviews(true, true);
  const foundRevInTrash = allReviewsAdmin.find((r) => r.id === reviewId);
  if (!foundRevInTrash || !foundRevInTrash.is_deleted || foundRevInTrash.status !== 'archived') {
    throw new Error('FAILED: Deleted review not found in admin trash query!');
  }
  console.log('   [PASS] Admin can identify deleted review in Trash.');

  // Step 2f: Restore review
  db.restoreReview(reviewId, 'Admin Tester');
  publicReviews = db.getReviews(false, false);
  if (!publicReviews.some((r) => r.id === reviewId)) {
    throw new Error('FAILED: Restored review did not reappear in public reviews!');
  }
  console.log('   [PASS] Restored review reappears on public website.');

  // Clean up
  db.deleteReview(reviewId, true);
  console.log('   [PASS] Cleaned up test review.\n');

  // ==========================================
  // TEST 3: SERVICES SAFE DELETION & RECOVERY
  // ==========================================
  console.log('3. Testing Services / Disciplines Safe Deletion & Restoration Flow...');
  const currentSettings = db.getSiteSettingsAdmin();
  const currentServices = currentSettings.services?.items || [];

  const testServiceItem = {
    number: '99',
    title: 'TEMPORARY DISCIPLINE',
    description: 'A test discipline to test safe deletion and draft recovery.',
    tagline: 'Safe deletion test',
    videoUrl: '',
    videoPoster: '',
    mediaItems: [],
    weCreate: ['Item 1'],
    process: ['Step 1'],
    turnaround: '1-2 days',
    deliverables: ['Files'],
    isDeleted: false,
    deletedAt: null,
  };

  // Step 3a: Add and Publish Service
  const settingsWithNewService = {
    ...currentSettings,
    services: {
      ...currentSettings.services,
      heading: currentSettings.services?.heading || 'WHAT WE DO',
      subheading: currentSettings.services?.subheading || '',
      items: [...currentServices, testServiceItem],
    },
  };
  db.publishSiteSettings(settingsWithNewService);

  let publishedSettings = db.getPublishedSiteSettings();
  let foundService = publishedSettings.services?.items?.find((s: any) => s.number === '99');
  if (!foundService) {
    throw new Error('FAILED: Test service discipline was not published to public site settings!');
  }
  console.log('   [PASS] Service discipline published and visible on public website.');

  // Step 3b: Soft-delete Service discipline
  const softDeletedServices = settingsWithNewService.services.items.map((s: any) =>
    s.number === '99' ? { ...s, isDeleted: true, deletedAt: new Date().toISOString() } : s
  );
  db.publishSiteSettings({
    ...settingsWithNewService,
    services: {
      ...settingsWithNewService.services,
      items: softDeletedServices,
    },
  });

  // Step 3c: Verify soft-deleted service disappears from public site settings
  publishedSettings = db.getPublishedSiteSettings();
  const foundServicePublicAfterDel = publishedSettings.services?.items?.find((s: any) => s.number === '99');
  if (foundServicePublicAfterDel) {
    throw new Error('FAILED: Soft-deleted service is STILL visible in public site settings!');
  }
  console.log('   [PASS] Soft-deleted service discipline disappeared from public website.');

  // Step 3d: Verify Admin Settings STILL contain the deleted item with isDeleted / deletedAt for recovery
  const adminSettingsAfterDel = db.getSiteSettingsAdmin();
  const foundInAdminServices = adminSettingsAfterDel.services?.items?.find((s: any) => s.number === '99');
  if (!foundInAdminServices || !foundInAdminServices.isDeleted) {
    throw new Error('FAILED: Soft-deleted service was not preserved in admin site settings for recovery!');
  }
  console.log('   [PASS] Soft-deleted service remains safely preserved in Admin Trash.');

  // Step 3e: Restore Service discipline
  const restoredServices = adminSettingsAfterDel.services.items.map((s: any) =>
    s.number === '99' ? { ...s, isDeleted: false, deletedAt: null } : s
  );
  db.publishSiteSettings({
    ...adminSettingsAfterDel,
    services: {
      ...adminSettingsAfterDel.services,
      items: restoredServices,
    },
  });

  publishedSettings = db.getPublishedSiteSettings();
  const foundRestoredService = publishedSettings.services?.items?.find((s: any) => s.number === '99');
  if (!foundRestoredService || foundRestoredService.isDeleted) {
    throw new Error('FAILED: Restored service discipline does not appear on public website!');
  }
  console.log('   [PASS] Restored service discipline reappears on public website.');

  // Clean up
  const cleanedServices = (publishedSettings.services?.items || []).filter((s: any) => s.number !== '99');
  db.publishSiteSettings({
    ...publishedSettings,
    services: {
      ...publishedSettings.services,
      items: cleanedServices,
    },
  });
  console.log('   [PASS] Cleaned up test service.\n');

  // ==========================================
  // TEST 4: MESSAGES & QUOTES SAFE DELETION
  // ==========================================
  console.log('4. Testing Inbound Messages & Saved Quotes Safe Deletion...');
  const testMsg = db.createMessage({
    name: 'Safe Delete Message',
    email: 'tester@example.com',
    company: 'Test Co',
    project_type: 'AI Build',
    budget: '$5,000',
    message: 'Testing soft deletion for inbound inquiries',
    date: 'Just now',
    status: 'unread',
  });
  db.softDeleteMessage(testMsg.id);
  const activeMsgs = db.getMessages(false);
  const allMsgs = db.getMessages(true);
  if (activeMsgs.some((m) => m.id === testMsg.id)) {
    throw new Error('FAILED: Soft-deleted message found in active messages query!');
  }
  if (!allMsgs.some((m) => m.id === testMsg.id && m.is_deleted)) {
    throw new Error('FAILED: Soft-deleted message not found in admin trash query!');
  }
  db.restoreMessage(testMsg.id);
  const activeMsgsAfterRestore = db.getMessages(false);
  if (!activeMsgsAfterRestore.some((m) => m.id === testMsg.id)) {
    throw new Error('FAILED: Restored message not found in active messages!');
  }
  db.deleteMessage(testMsg.id, true);
  console.log('   [PASS] Inbound Messages safe deletion, trash, and recovery verified.');

  const testQuote = db.createSavedQuote({
    client_name: 'Safe Delete Quote Client',
    client_email: 'quote@example.com',
    service_category: 'UGC ADS',
    budget_range: '$10,000',
    turnaround_time: '5 days',
    deliverables_json: JSON.stringify(['Video 1', 'Video 2']),
    notes: 'Quote test',
    status: 'draft',
  });
  db.softDeleteSavedQuote(testQuote.id);
  const activeQuotes = db.getSavedQuotes(false);
  const allQuotes = db.getSavedQuotes(true);
  if (activeQuotes.some((q) => q.id === testQuote.id)) {
    throw new Error('FAILED: Soft-deleted quote found in active quotes query!');
  }
  if (!allQuotes.some((q) => q.id === testQuote.id && q.is_deleted)) {
    throw new Error('FAILED: Soft-deleted quote not found in admin trash query!');
  }
  db.restoreSavedQuote(testQuote.id);
  const activeQuotesAfterRestore = db.getSavedQuotes(false);
  if (!activeQuotesAfterRestore.some((q) => q.id === testQuote.id)) {
    throw new Error('FAILED: Restored quote not found in active quotes query!');
  }
  db.deleteSavedQuote(testQuote.id, true);
  console.log('   [PASS] Saved Quotes safe deletion, trash, and recovery verified.\n');

  console.log('====================================================');
  console.log('✓ ALL SAFE DELETION & RESTORATION TESTS PASSED 100%');
  console.log('====================================================');
}

runSafeDeletionVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:\n', err);
  process.exit(1);
});
