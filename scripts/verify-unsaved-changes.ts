import { unsavedChanges } from '../src/services/unsavedChanges.ts';

async function testUnsavedChangesManager() {
  console.log('--- STARTING UNSAVED CHANGES PROTECTION UNIT & LOGIC VERIFICATION ---');

  // Test 1: Initially clean
  if (unsavedChanges.hasUnsavedChanges()) {
    throw new Error('FAIL: Unsaved changes manager should start clean!');
  }
  console.log('[1/5] Initial state is clean (no unsaved changes).');

  // Test 2: Mark section dirty
  unsavedChanges.setDirty('content', true, { label: 'Website Content & Media' });
  if (!unsavedChanges.hasUnsavedChanges()) {
    throw new Error('FAIL: hasUnsavedChanges should be true after setting content dirty!');
  }
  if (!unsavedChanges.isSectionDirty('content')) {
    throw new Error('FAIL: isSectionDirty(content) should be true!');
  }
  const labels = unsavedChanges.getDirtySectionLabels();
  if (!labels.includes('Website Content & Media')) {
    throw new Error('FAIL: getDirtySectionLabels did not include section label!');
  }
  console.log('[2/5] Section dirty registration & labels verified.');

  // Test 3: Multiple dirty sections
  unsavedChanges.setDirty('project-editor', true, { label: 'Project: Test Project' });
  const multiLabels = unsavedChanges.getDirtySectionLabels();
  if (multiLabels.length !== 2) {
    throw new Error(`FAIL: Expected 2 dirty sections, got ${multiLabels.length}`);
  }
  console.log('[3/5] Multiple dirty sections tracking verified.');

  // Test 4: Discard / Reset
  unsavedChanges.setDirty('content', false);
  if (!unsavedChanges.hasUnsavedChanges()) {
    throw new Error('FAIL: hasUnsavedChanges should still be true because project-editor is dirty!');
  }
  unsavedChanges.setDirty('project-editor', false);
  if (unsavedChanges.hasUnsavedChanges()) {
    throw new Error('FAIL: hasUnsavedChanges should be false after all sections cleaned!');
  }
  console.log('[4/5] Section cleaning and reset verified.');

  // Test 5: Discard with callback
  let discarded = false;
  unsavedChanges.setDirty('estimator-settings', true, {
    label: 'Estimator Rates',
    onDiscard: () => {
      discarded = true;
    }
  });
  unsavedChanges.discardAll();
  if (!discarded || unsavedChanges.hasUnsavedChanges()) {
    throw new Error('FAIL: discardAll did not execute onDiscard callback or clear dirty map!');
  }
  console.log('[5/5] discardAll callback execution verified.');

  console.log('===========================================================');
  console.log('ALL UNSAVED CHANGES PROTECTION LOGIC TESTS PASSED (5/5)!');
  console.log('===========================================================');
}

testUnsavedChangesManager().catch((err) => {
  console.error('UNSAVED CHANGES TEST ERROR:', err);
  process.exit(1);
});
