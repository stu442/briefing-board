const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('renders every adjacent photo reference from an existing daily note', async () => {
  const response = await fetch(`${baseUrl}/journal/2026-08-23`);
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /journal-media\/7D9B0A62-1504-4447-826E-E44E420E5452_1_105_c\.jpeg/);
  assert.match(html, /journal-media\/4AE47F3A-C4E2-4997-BCFF-938062FFC50A_1_102_o\.jpeg/);
});
