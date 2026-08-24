const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('settings page exposes reading preferences', async () => {
  const response = await fetch(`${baseUrl}/journal/settings`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /글꼴/);
  assert.match(html, /줄 간격/);
  assert.match(html, /글자 크기/);
});
