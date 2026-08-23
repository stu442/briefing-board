const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('recent journal row renders the first photo as a thumbnail', async () => {
  const response = await fetch(`${baseUrl}/journal?month=2026-08`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<img[^>]+journal-media\/7D9B0A62-1504-4447-826E-E44E420E5452_1_105_c\.jpeg/);
});
