const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';

test('calendar view exposes a written day with its photo cover and journal link', async () => {
  const response = await fetch(`${baseUrl}/journal?month=2026-08`);
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /CALENDAR/);
  assert.match(html, /href="\/journal\/2026-08-23"/);
  assert.match(html, /journal-media\/7D9B0A62-1504-4447-826E-E44E420E5452_1_105_c\.jpeg/);
});
