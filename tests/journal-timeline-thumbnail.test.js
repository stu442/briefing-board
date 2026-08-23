const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('calendar is the default journal view and exposes a past-records toggle', async () => {
  const response = await fetch(`${baseUrl}/journal?month=2026-08`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('캘린더'));
  assert.ok(html.includes('지난 기록'));
});
