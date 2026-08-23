const test = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = process.env.JOURNAL_WEB_URL || 'http://100.107.216.56:3088';
const existingPhoto = '7D9B0A62-1504-4447-826E-E44E420E5452_1_105_c.jpeg';

test('serves an existing vault-root photo referenced by a daily note', async () => {
  const response = await fetch(`${baseUrl}/journal-media/${existingPhoto}`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/jpeg');
  assert.ok((await response.arrayBuffer()).byteLength > 0);
});
