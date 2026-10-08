import http from 'http';
import { db } from '../server/db.ts';

async function runTests() {
  console.log('--- STARTING DRAFT & PUBLISH END-TO-END VERIFICATION ---');

  // Step 1: Initialize Database & Verify initial state
  await db.init();
  console.log('[1/7] DB Initialized successfully.');

  const initialPublic = await db.getSiteSettings(false);
  const initialAdmin = await db.getSiteSettingsAdmin();
  console.log('[2/7] Initial Public Title:', initialPublic.siteTitle);
  console.log('      Initial Admin Status:', initialAdmin.publishStatus);

  // Step 2: Edit & Save Draft (Admin changes hero subtitle & title)
  const draftPayload = {
    ...initialAdmin.draft,
    siteTitle: 'JACK - 3D Creator [DRAFT TEST ' + Date.now() + ']',
    hero: {
      ...initialAdmin.draft.hero,
      title: 'Testing Draft Mode ' + Date.now(),
      subtitle: 'This is a draft that should NOT be visible to the public yet'
    }
  };

  await db.saveSiteSettingsDraft(draftPayload);
  console.log('[3/7] Draft saved to DB successfully.');

  // Step 3: Verify Public vs Draft Isolation
  const publicAfterDraft = await db.getSiteSettings(false);
  const adminAfterDraft = await db.getSiteSettingsAdmin();

  if (publicAfterDraft.siteTitle === draftPayload.siteTitle) {
    throw new Error('FAIL: Public website leaked draft title before publishing!');
  }
  if (adminAfterDraft.draft.siteTitle !== draftPayload.siteTitle) {
    throw new Error('FAIL: Admin draft was not persisted!');
  }
  if (adminAfterDraft.publishStatus !== 'modified') {
    throw new Error(`FAIL: Expected status to be 'modified', got '${adminAfterDraft.publishStatus}'`);
  }
  console.log('[4/7] Verified Draft Isolation:');
  console.log('      Public title remains:', publicAfterDraft.siteTitle);
  console.log('      Admin draft title:', adminAfterDraft.draft.siteTitle);
  console.log('      Admin status:', adminAfterDraft.publishStatus);

  // Step 4: Publish Draft to Live
  await db.publishSiteSettings(draftPayload);
  const publicAfterPublish = await db.getSiteSettings(false);
  const adminAfterPublish = await db.getSiteSettingsAdmin();

  if (publicAfterPublish.siteTitle !== draftPayload.siteTitle) {
    throw new Error('FAIL: Public website did not update with published content!');
  }
  if (adminAfterPublish.publishStatus !== 'published') {
    throw new Error(`FAIL: Expected admin status to be 'published', got '${adminAfterPublish.publishStatus}'`);
  }
  console.log('[5/7] Verified Publish to Public:');
  console.log('      Public title now updated to:', publicAfterPublish.siteTitle);
  console.log('      Admin status:', adminAfterPublish.publishStatus);

  // Step 5: Projects Workflow Test
  console.log('[6/7] Testing Projects Draft & Publish Workflow...');
  const testProject = await db.createProject({
    title: 'Automated Draft Project ' + Date.now(),
    category: '3D Modeling',
    description: 'Testing draft project visibility',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
    status: 'draft',
    published: false
  });

  const publicProjects1 = await db.getProjects(false);
  const allProjects1 = await db.getProjects(true);

  if (publicProjects1.some(p => p.id === testProject.id)) {
    throw new Error('FAIL: Draft project appeared on public website!');
  }
  if (!allProjects1.some(p => p.id === testProject.id)) {
    throw new Error('FAIL: Draft project not found in admin project list!');
  }
  console.log('      Draft project hidden from public, visible in admin.');

  // Publish Project
  await db.publishProject(testProject.id);
  const publicProjects2 = await db.getProjects(false);
  if (!publicProjects2.some(p => p.id === testProject.id)) {
    throw new Error('FAIL: Published project not visible in public listing!');
  }
  console.log('      Published project now visible in public listing.');

  // Unpublish Project
  await db.unpublishProject(testProject.id);
  const publicProjects3 = await db.getProjects(false);
  if (publicProjects3.some(p => p.id === testProject.id)) {
    throw new Error('FAIL: Unpublished project still appears in public listing!');
  }
  console.log('      Unpublished project hidden from public listing.');

  // Cleanup test project
  await db.deleteProject(testProject.id);

  // Restore original site title if desired
  await db.publishSiteSettings({
    ...publicAfterPublish,
    siteTitle: initialPublic.siteTitle,
    hero: initialPublic.hero
  });

  console.log('[7/7] Cleaned up test data & restored clean title.');
  console.log('====================================================');
  console.log('ALL DRAFT & PUBLISH VERIFICATION TESTS PASSED (7/7)!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
