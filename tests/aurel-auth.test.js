const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('journal requires an authenticated password session', async () => {
  const response = await fetch(`${baseUrl}/journal`, { redirect: 'manual' });
  assert.equal(response.status, 307);
  assert.match(response.headers.get('location') || '', /^\/login\?next=/);
});
