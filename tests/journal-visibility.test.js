const test = require('node:test');
const assert = require('node:assert/strict');

test('journal home lists daily notes stored in month folders', async () => {
  const response = await fetch('http://127.0.0.1:3087/journal');
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /지난 기록/);
  assert.match(html, /href="\/journal\/2026-07-27"/);
  assert.match(html, /아 월요일이라니/);
});
