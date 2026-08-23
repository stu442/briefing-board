const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('one sync request completes the journal Git synchronization flow', async () => {
  const response = await fetch(`${baseUrl}/api/journal/sync`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'sync' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status.clean, true);
  assert.equal(body.status.ahead, 0);
  assert.equal(body.status.behind, 0);
});
