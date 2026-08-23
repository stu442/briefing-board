const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('an unwritten calendar day opens the writer instead of a 404', async () => {
  const response = await fetch(`${baseUrl}/journal?month=2026-08`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="\/journal\/write\?date=2026-08-24"/);
});

test('not-found page offers a calm recovery path', async () => {
  const response = await fetch(`${baseUrl}/journal/unknown`);
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /아직 기록이 없는 날이야/);
  assert.match(html, /오늘 기록하기/);
});
