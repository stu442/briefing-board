const test = require('node:test');
const assert = require('node:assert/strict');

test('journal sync endpoint reports the vault Git status', async () => {
  const response = await fetch('http://127.0.0.1:3087/api/journal/sync');
  assert.equal(response.status, 200);

  const status = await response.json();
  assert.equal(status.remote, 'origin/main');
  assert.equal(typeof status.clean, 'boolean');
  assert.equal(typeof status.ahead, 'number');
  assert.equal(typeof status.behind, 'number');
});
