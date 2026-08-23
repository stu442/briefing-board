const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('daily writing screen provides a Markdown editor', async () => {
  const response = await fetch(`${baseUrl}/journal/write`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /name="text"/);
  assert.match(html, /contentEditable="true"/);
  assert.match(html, /#` \+ Space로 제목/);
  assert.match(html, /Obsidian처럼 한 화면/);
});
