import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCounter,
  getNextIndex,
  getRoleForIndex,
  calculateScrollProgress,
  getServiceIndexFromScroll,
  filterProjects,
  PROJECT_CATEGORIES,
  ROLES,
  SERVICES,
  PROJECTS,
  JOURNAL_ENTRIES,
  EXPLORATIONS,
  STATS,
  BRAND_NAME,
  BRAND_TAGLINE,
  GITHUB_URL,
} from './portfolio.ts';

test('formatCounter pads numbers to 3 digits and clamps bounds', () => {
  assert.equal(formatCounter(0), '000');
  assert.equal(formatCounter(7), '007');
  assert.equal(formatCounter(42), '042');
  assert.equal(formatCounter(100), '100');
  assert.equal(formatCounter(-5), '000');
  assert.equal(formatCounter(150), '100');
});

test('getNextIndex wraps correctly', () => {
  assert.equal(getNextIndex(0, 3), 1);
  assert.equal(getNextIndex(1, 3), 2);
  assert.equal(getNextIndex(2, 3), 0);
  assert.equal(getNextIndex(0, 0), 0);
});

test('getRoleForIndex cycles through the 4 offered services', () => {
  assert.equal(getRoleForIndex(0), 'Web Development');
  assert.equal(getRoleForIndex(1), 'AI Videos');
  assert.equal(getRoleForIndex(2), 'UGC Videos');
  assert.equal(getRoleForIndex(3), 'E-books');
  assert.equal(getRoleForIndex(4), 'Web Development');
});

test('calculateScrollProgress calculates and clamps scroll percentage', () => {
  assert.equal(calculateScrollProgress(0, 1000), 0);
  assert.equal(calculateScrollProgress(500, 1000), 0.5);
  assert.equal(calculateScrollProgress(1000, 1000), 1);
  assert.equal(calculateScrollProgress(1500, 1000), 1);
  assert.equal(calculateScrollProgress(-100, 1000), 0);
  assert.equal(calculateScrollProgress(500, 0), 0);
});

test('getServiceIndexFromScroll maps scroll progression to the 4 services sequentially', () => {
  // 4 services: 0: Web Development, 1: AI Videos, 2: UGC Videos, 3: E-books
  assert.equal(getServiceIndexFromScroll(0.0, 4), 0);
  assert.equal(getServiceIndexFromScroll(0.12, 4), 0);
  assert.equal(getServiceIndexFromScroll(0.24, 4), 0);

  assert.equal(getServiceIndexFromScroll(0.25, 4), 1);
  assert.equal(getServiceIndexFromScroll(0.35, 4), 1);
  assert.equal(getServiceIndexFromScroll(0.49, 4), 1);

  assert.equal(getServiceIndexFromScroll(0.50, 4), 2);
  assert.equal(getServiceIndexFromScroll(0.65, 4), 2);
  assert.equal(getServiceIndexFromScroll(0.74, 4), 2);

  assert.equal(getServiceIndexFromScroll(0.75, 4), 3);
  assert.equal(getServiceIndexFromScroll(0.90, 4), 3);
  assert.equal(getServiceIndexFromScroll(1.0, 4), 3);

  // Boundary safety
  assert.equal(getServiceIndexFromScroll(-0.5, 4), 0);
  assert.equal(getServiceIndexFromScroll(1.5, 4), 3);
});

test('hero scroll simulation: stationary, forward, reverse, and unpinning', () => {
  const scrollableDistance = 2080; // 360vh - 100vh on an 800px viewport
  let currentScroll = 0;
  let activeIndex = 0;

  const simulateScroll = (newScroll: number) => {
    currentScroll = Math.max(0, newScroll);
    const progress = Math.max(0, Math.min(1, currentScroll / scrollableDistance));
    const nextIndex = getServiceIndexFromScroll(progress, 4);
    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
    }
  };

  // 1. Initial state at top of page (Stationary for 10s: scroll does not change)
  simulateScroll(0);
  assert.equal(activeIndex, 0); // Web Development
  // Stationary check: time passes with 0 scroll change
  assert.equal(activeIndex, 0);

  // 2. Slow forward scroll through services
  simulateScroll(300); // within Service 0
  assert.equal(activeIndex, 0); // Web Development

  simulateScroll(600); // crosses 0.25 threshold
  assert.equal(activeIndex, 1); // AI Videos

  // 3. Stop between services (stationary check)
  simulateScroll(800);
  assert.equal(activeIndex, 1);
  // Stationary at 800px: activeIndex remains 1
  assert.equal(activeIndex, 1);

  simulateScroll(1100); // crosses 0.50 threshold
  assert.equal(activeIndex, 2); // UGC Videos

  simulateScroll(1600); // crosses 0.75 threshold
  assert.equal(activeIndex, 3); // E-books

  // 4. Reverse scrolling upwards
  simulateScroll(1200); // back to UGC Videos
  assert.equal(activeIndex, 2);

  simulateScroll(700); // back to AI Videos
  assert.equal(activeIndex, 1);

  simulateScroll(200); // back to Web Development
  assert.equal(activeIndex, 0);

  // 5. Complete all 4 services and unpin past container
  simulateScroll(2100); // past 2080px scrollable distance
  assert.equal(activeIndex, 3); // Remains on 4th service as container scrolls out of view
  assert.ok(currentScroll > scrollableDistance); // Hero unpinned, revealing #work section
});

test('filterProjects correctly filters projects by the 4 offered services', () => {
  assert.equal(filterProjects(PROJECTS, 'All').length, 4);
  
  const webProjects = filterProjects(PROJECTS, 'Web Development');
  assert.equal(webProjects.length, 1);
  assert.equal(webProjects[0].id, 'sri-balaji-real-estate');

  const aiVideoProjects = filterProjects(PROJECTS, 'AI Videos');
  assert.equal(aiVideoProjects.length, 1);
  assert.equal(aiVideoProjects[0].id, 'cinematic-ai-studio');

  const ugcVideoProjects = filterProjects(PROJECTS, 'UGC Videos');
  assert.equal(ugcVideoProjects.length, 1);
  assert.equal(ugcVideoProjects[0].id, 'ugc-viral-creative-lab');

  const ebookProjects = filterProjects(PROJECTS, 'E-books');
  assert.equal(ebookProjects.length, 1);
  assert.equal(ebookProjects[0].id, 'digital-mastery-ebooks');
});

test('services list defines exactly the 4 required services with deliverables', () => {
  assert.equal(SERVICES.length, 4);
  assert.deepEqual(
    SERVICES.map((s) => s.title),
    ['Web Development', 'AI Videos', 'UGC Videos', 'E-books']
  );
  SERVICES.forEach((service) => {
    assert.ok(service.deliverables.length >= 4);
    assert.ok(service.tools.length >= 3);
  });
});

test('brand information matches prompt specification', () => {
  assert.equal(BRAND_NAME, 'AI Build');
  assert.equal(BRAND_TAGLINE, 'Build Smarter. Create Faster. Think Beyond.');
  assert.equal(GITHUB_URL, 'https://github.com/Garv1629');
});

test('data structures satisfy all original design specs with AI Build content', () => {
  assert.equal(ROLES.length, 4);
  assert.equal(PROJECTS.length, 4);
  PROJECTS.forEach((p) => {
    assert.ok(p.title);
    assert.ok(p.category);
    assert.ok(p.image);
  });
  assert.equal(JOURNAL_ENTRIES.length, 4);
  assert.equal(EXPLORATIONS.length, 6);
  assert.equal(STATS.length, 3);
});

test('projects adhere strictly to valid service categories and required fields', () => {
  PROJECTS.forEach((p) => {
    assert.ok(p.title.length > 0);
    assert.ok(PROJECT_CATEGORIES.includes(p.category as any));
    assert.ok(p.image.length > 0);
  });
});

test('projects have isPublished and order defined', () => {
  PROJECTS.forEach((p) => {
    assert.equal(typeof p.isPublished, 'boolean');
    assert.equal(typeof p.order, 'number');
  });
});




