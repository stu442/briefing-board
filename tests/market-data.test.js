const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildMarketHistoryRows,
  calculateSimpleMovingAverage,
  calculateRsi,
  buildMarketPatch,
} = require('../scripts/lib/market-data');

test('calculateSimpleMovingAverage returns null when there is not enough data', () => {
  assert.equal(calculateSimpleMovingAverage([1, 2, 3], 5), null);
});

test('calculateSimpleMovingAverage calculates the trailing average', () => {
  assert.equal(calculateSimpleMovingAverage([1, 2, 3, 4, 5], 5), 3);
});

test('calculateRsi returns a bounded value for mixed gains and losses', () => {
  const value = calculateRsi([44, 45, 46, 45, 44, 45, 47, 46, 48, 47, 49, 50, 49, 51, 50], 14);
  assert.equal(typeof value, 'number');
  assert.ok(value >= 0 && value <= 100);
});

test('buildMarketPatch creates market entries for crypto, ETFs, and FX with indicators', () => {
  const closes = Array.from({ length: 130 }, (_, index) => 100 + index);
  const points = closes.map((close, index) => ({ marketDate: `2026-01-${String(index + 1).padStart(2, '0')}`, close }));

  const patch = buildMarketPatch({
    now: new Date('2026-05-13T00:00:00+09:00'),
    crypto: {
      BTC: { symbol: 'BTC-USD', points, closes, currency: 'USD' },
      ETH: { symbol: 'ETH-USD', points, closes: closes.map((v) => v / 10), currency: 'USD' },
    },
    etfs: {
      VOO: { symbol: 'VOO', points, closes, currency: 'USD' },
      QLD: { symbol: 'QLD', points, closes, currency: 'USD' },
      QQQM: { symbol: 'QQQM', points, closes, currency: 'USD' },
      JEPI: { symbol: 'JEPI', points, closes, currency: 'USD' },
      JEPQ: { symbol: 'JEPQ', points, closes, currency: 'USD' },
    },
    fx: {
      'USD/KRW': { symbol: 'KRW=X', points, closes: closes.map((v) => 1300 + v), currency: 'KRW' },
      'JPY/KRW': { symbol: 'JPYKRW=X', points, closes: closes.map((v) => 8 + v / 100), currency: 'KRW' },
    },
  });

  assert.equal(patch.slug, '2026-05-13');
  assert.equal(patch.sections.market.length, 9);
  assert.match(patch.sections.market[0].title, /BTC/);
  assert.equal(patch.sections.market[0].market.assetType, 'crypto');
  const voo = patch.sections.market.find((item) => item.title.startsWith('VOO'));
  assert.ok(voo);
  assert.match(voo.note, /RSI/);
  assert.match(voo.note, /MA20/);
  assert.equal(voo.market.assetType, 'etf');
  const usdKrw = patch.sections.market.find((item) => item.title.startsWith('USD\/KRW'));
  assert.ok(usdKrw);
  assert.equal(usdKrw.market.assetType, 'fx');
});

test('buildMarketHistoryRows creates normalized rows for charting', () => {
  const closes = Array.from({ length: 20 }, (_, index) => 100 + index);
  const points = closes.map((close, index) => ({ marketDate: `2026-02-${String(index + 1).padStart(2, '0')}`, close }));

  const rows = buildMarketHistoryRows({
    now: new Date('2026-05-13T00:00:00+09:00'),
    crypto: {
      BTC: { symbol: 'BTC-USD', points, closes, currency: 'USD' },
    },
    etfs: {},
    fx: {},
  });

  assert.equal(rows.length, 19);
  assert.equal(rows[0].symbol, 'BTC-USD');
  assert.equal(rows[0].marketDate, '2026-02-02');
  assert.equal(rows.at(-1).closePrice, 119);
});
