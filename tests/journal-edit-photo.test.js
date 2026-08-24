const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('daily edit screen exposes an image attachment picker without vault boilerplate copy', async () => {
  const response = await fetch(`${baseUrl}/journal/edit/2026-08-24`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /사진 추가/);
  assert.doesNotMatch(html, /저장하면 Obsidian vault/);
});
