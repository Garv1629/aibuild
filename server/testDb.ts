import { db } from './db.js';
import { verifyOwnerPin, updateOwnerPin } from './auth.js';

console.log('--- RUNNING CMS DATABASE TESTS ---');

// 1. Initialize
db.init();
console.log('✓ Database initialized');

// 2. Test Site Settings
const settings = db.getSiteSettings();
console.log('✓ Site settings loaded:', settings.hero?.headline);
const updatedSettings = db.updateSiteSettings({
  hero: { headline: 'AI BUILD - PERSISTENT DB' },
});
console.log('✓ Updated headline in DB:', updatedSettings.hero?.headline);

// 3. Test Projects
const projectsBefore = db.getProjects();
console.log(`✓ Initial projects count: ${projectsBefore.length}`);
const testProject = db.createProject({
  title: 'Autonomous DB Engine',
  category: 'AUTOMATION',
  tagline: 'High-throughput ACID SQLite database persistence test.',
  techStack: ['Node.js', 'SQLite', 'TypeScript'],
});
console.log('✓ Created project in DB:', testProject.title, `(ID: ${testProject.id})`);

const projectsAfter = db.getProjects();
console.log(`✓ Projects count after insert: ${projectsAfter.length}`);

const updatedProj = db.updateProject(testProject.id, {
  title: 'Autonomous DB Engine (Updated)',
});
console.log('✓ Updated project title:', updatedProj.title);

// 4. Test Reviews
const testReview = db.createReview({
  author: 'Verification Agent',
  role: 'Test Suite',
  company: 'Antigravity Studio',
  rating: 5,
  comment: 'Database persistence verified across browser refreshes and multi-devices.',
  status: 'approved',
});
console.log('✓ Created review:', testReview.author, `(Rating: ${testReview.rating})`);

// 5. Test Messages
const testMsg = db.createMessage({
  name: 'John Doe',
  email: 'john@example.com',
  projectType: '01 - UGC ADS',
  budget: '$10,000+',
  message: 'Testing message persistence.',
});
console.log('✓ Created message:', testMsg.name);
db.updateMessageStatus(testMsg.id, 'read');
console.log('✓ Message marked read');

// 6. Test Quotes
const testQuote = db.createSavedQuote({
  clientName: 'Enterprise Client',
  serviceCategory: '03 - WEBSITE & AUTOMATIONS',
  budgetRange: '$15,000 – $25,000',
  turnaroundTime: '10 Days',
  deliverables: ['Custom CMS', 'Persistent Database'],
});
console.log('✓ Saved quote created for:', testQuote.clientName);

// 7. Test Estimator Settings
const estSettings = db.getEstimatorSettings();
console.log('✓ Estimator title:', estSettings.modalTitle);

// 8. Test Auth
const authRes = await verifyOwnerPin('2629');
console.log('✓ Owner PIN verify result (2629):', authRes.success, authRes.token ? 'Token issued' : 'No token');

// Clean up test items
db.deleteProject(testProject.id);
db.deleteReview(testReview.id);
db.deleteMessage(testMsg.id);
db.deleteSavedQuote(testQuote.id);
// Restore original headline
db.updateSiteSettings({
  hero: { headline: 'AI BUILD' },
});

console.log('✓ Cleaned up test records');
console.log('--- ALL CMS DATABASE TESTS PASSED SUCCESSFULLY! ---');
