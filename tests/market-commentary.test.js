const test = require('node:test');
const assert = require('node:assert/strict');

const { buildMarketCommentary } = require('../lib/market-commentary');

test('buildMarketCommentary marks overheated crypto assets with volatility-aware guidance', () => {
  const commentary = buildMarketCommentary({
    displayName: 'Bitcoin',
    assetType: 'crypto',
    symbol: 'BTC-USD',
    currency: 'USD',
    price: 120000,
    previousClose: 118500,
    changePct: 1.27,
    priceText: '$120,000.00',
    changeText: '+1.27%',
    rsi14: 73.2,
    rsiState: '과열권',
    ma20: 112000,
    ma60: 105000,
    ma120: 98000,
  });

  assert.deepEqual(commentary.statusTags, ['단기 과열 주의', '변동성 큼']);
  assert.match(commentary.commentary, /MA20·MA60 위/);
  assert.match(commentary.commentary, /변동성 감내 가능한 비중/);
  assert.equal(commentary.reflectionQuestion, '지금 판단은 thesis 기반인가, 최근 가격 움직임에 대한 반응인가?');
});

test('buildMarketCommentary frames VOO as a long-term accumulation asset', () => {
  const commentary = buildMarketCommentary({
    displayName: 'Vanguard S&P 500 ETF',
    assetType: 'etf',
    symbol: 'VOO',
    currency: 'USD',
    price: 525.42,
    previousClose: 522.16,
    changePct: 0.62,
    priceText: '$525.42',
    changeText: '+0.62%',
    rsi14: 61.1,
    rsiState: '중립',
    ma20: 519.2,
    ma60: 503.4,
    ma120: 488.7,
  });

  assert.deepEqual(commentary.statusTags, ['추세 양호', '장기 적립 관점']);
  assert.match(commentary.commentary, /장기 적립 자산/);
  assert.equal(commentary.reflectionQuestion, '이번 판단이 장기 적립 원칙과 일치하는가?');
});

test('buildMarketCommentary frames USD/KRW around disciplined FX execution', () => {
  const commentary = buildMarketCommentary({
    displayName: 'USD/KRW',
    assetType: 'fx',
    symbol: 'KRW=X',
    currency: 'KRW',
    price: 1382.155,
    previousClose: 1376.201,
    changePct: 0.43,
    priceText: '₩1,382.155',
    changeText: '+0.43%',
    rsi14: 54.3,
    rsiState: '중립',
    ma20: 1378.4,
    ma60: 1362.1,
    ma120: 1348.2,
  });

  assert.deepEqual(commentary.statusTags, ['추세 양호', '환율 부담 주의']);
  assert.match(commentary.commentary, /분할 환전 규칙/);
  assert.equal(commentary.reflectionQuestion, '이번 환전 판단은 계획된 분할 실행인가, 조급한 반응인가?');
});
