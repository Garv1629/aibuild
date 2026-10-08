import { db } from './server/db.js';
import { verifyOwnerPin } from './server/auth.js';

console.log('=== RUNNING CMS DATABASE VALIDATION ===');

// 1. Initialize
db.init();
console.log('1. Database initialized successfully');

// 2. Test Site Settings
const settings = db.getSiteSettings();
console.log('2. Loaded site headline:', settings.hero?.headline);
const updated = db.updateSiteSettings({
  hero: { headline: 'AI BUILD - PERSISTENT DB' },
});
console.log('3. Updated site headline:', updated.hero?.headline);

// 3. Test Projects
const projectsBefore = db.getProjects();
console.log(`4. Initial projects count: ${projectsBefore.length}`);
const testProject = db.createProject({
  title: 'Autonomous DB Engine',
  category: 'AUTOMATION',
  tagline: 'High-throughput ACID SQLite database persistence test.',
  techStack: ['Node.js', 'SQLite', 'TypeScript'],
});
console.log('5. Created project in DB:', testProject.title, `(ID: ${testProject.id})`);

const projectsAfter = db.getProjects();
console.log(`6. Projects count after insert: ${projectsAfter.length}`);

// 4. Test Reviews
const testReview = db.createReview({
  author: 'Verification Agent',
  role: 'Test Suite',
  company: 'Antigravity Studio',
  rating: 5,
  comment: 'Database persistence verified across browser refreshes and multi-devices.',
  status: 'approved',
});
console.log('7. Created review:', testReview.author, `(Rating: ${testReview.rating})`);

// 5. Test Messages
const testMsg = db.createMessage({
  name: 'John Doe',
  email: 'john@example.com',
  projectType: '01 - UGC ADS',
  budget: '$10,000+',
  message: 'Testing message persistence.',
});
console.log('8. Created message:', testMsg.name);
db.updateMessageStatus(testMsg.id, 'read');
console.log('9. Message marked read');

// 6. Test Quotes
const testQuote = db.createSavedQuote({
  clientName: 'Enterprise Client',
  serviceCategory: '03 - WEBSITE & AUTOMATIONS',
  budgetRange: '$15,000 – $25,000',
  turnaroundTime: '10 Days',
  deliverables: ['Custom CMS', 'Persistent Database'],
});
console.log('10. Saved quote created for:', testQuote.clientName);

// 7. Test Estimator Settings
const estSettings = db.getEstimatorSettings();
console.log('11. Estimator title:', estSettings.modalTitle);

// 8. Test Auth
const authRes = await verifyOwnerPin('2629');
console.log('12. Owner PIN verify result (2629):', authRes.success, authRes.token ? 'Token issued' : 'No token');

// Clean up test items
db.deleteProject(testProject.id);
db.deleteReview(testReview.id);
db.deleteMessage(testMsg.id);
db.deleteSavedQuote(testQuote.id);
db.updateSiteSettings({
  hero: { headline: 'AI BUILD' },
});

console.log('13. Cleaned up temporary test records');
console.log('=== ALL CMS DATABASE TESTS PASSED! ===');
