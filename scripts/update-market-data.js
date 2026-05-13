#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { upsertMarketPrices } = require('../app/db');
const { buildMarketHistoryRows, buildMarketPatch, fetchAllMarketSeries } = require('./lib/market-data');

async function main() {
  const now = new Date();
  const series = await fetchAllMarketSeries();
  const patch = buildMarketPatch({ now, ...series });
  const marketRows = buildMarketHistoryRows({ now, ...series });
  upsertMarketPrices(marketRows);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'briefing-market-'));
  const patchPath = path.join(tempDir, `${patch.slug}.json`);
  fs.writeFileSync(patchPath, `${JSON.stringify(patch, null, 2)}\n`, 'utf8');

  execFileSync(process.execPath, [path.join(__dirname, 'merge-briefing.js'), patchPath], {
    stdio: 'inherit',
  });
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
