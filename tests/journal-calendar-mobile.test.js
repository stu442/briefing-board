const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('calendar has no fixed desktop width that clips the mobile grid', () => {
  const page = fs.readFileSync(path.join(__dirname, '..', 'app/journal/page.tsx'), 'utf8');
  assert.doesNotMatch(page, /min-w-\[448px\]/);
  assert.doesNotMatch(page, /overflow-x-auto pb-2/);
});
