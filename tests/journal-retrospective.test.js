const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('retrospective screen connects existing vault notes and exposes a Markdown editor', async () => {
  const response = await fetch(`${baseUrl}/journal/retrospective`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /2026년 8월 4주차 회고/);
  assert.match(html, /name="content"/);
  assert.match(html, /Markdown 지원/);
  assert.match(html, /회고 저장/);
});
