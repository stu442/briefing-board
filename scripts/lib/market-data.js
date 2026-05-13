const YahooFinance = require('yahoo-finance2').default;

const yahooFinance = new YahooFinance();

const MARKET_SYMBOLS = {
  crypto: {
    BTC: 'BTC-USD',
    ETH: 'ETH-USD',
  },
  etfs: {
    VOO: 'VOO',
    QLD: 'QLD',
    QQQM: 'QQQM',
    JEPI: 'JEPI',
    JEPQ: 'JEPQ',
  },
  fx: {
    'USD/KRW': 'KRW=X',
    'JPY/KRW': 'JPYKRW=X',
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function round(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function getKstDateParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );

  const weekdayMap = {
    Monday: '월요일',
    Tuesday: '화요일',
    Wednesday: '수요일',
    Thursday: '목요일',
    Friday: '금요일',
    Saturday: '토요일',
    Sunday: '일요일',
  };

  const slug = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    slug,
    date: `${slug} ${weekdayMap[parts.weekday] || parts.weekday}`,
  };
}

function calculateSimpleMovingAverage(closes, period) {
  if (!Array.isArray(closes) || closes.length < period) return null;
  const slice = closes.slice(-period);
  const sum = slice.reduce((acc, value) => acc + value, 0);
  return sum / period;
}

function calculateRsi(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length <= period) return null;

  let gains = 0;
  let losses = 0;
  for (let index = 1; index <= period; index += 1) {
    const delta = closes[index] - closes[index - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  for (let index = period + 1; index < closes.length; index += 1) {
    const delta = closes[index] - closes[index - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    averageGain = ((averageGain * (period - 1)) + gain) / period;
    averageLoss = ((averageLoss * (period - 1)) + loss) / period;
  }

  if (averageLoss === 0) return 100;
  const rs = averageGain / averageLoss;
  return 100 - (100 / (1 + rs));
}

function getLastTwo(closes) {
  if (!Array.isArray(closes) || closes.length < 2) {
    throw new Error('Need at least two close values.');
  }
  return {
    previous: closes[closes.length - 2],
    current: closes[closes.length - 1],
  };
}

function formatSignedPercent(value) {
  const rounded = round(value, 2);
  if (rounded == null) return '-';
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}%`;
}

function formatPrice(value, currency, digits = 2) {
  const rounded = round(value, digits);
  if (rounded == null) return '-';
  if (currency === 'KRW') return `${rounded.toFixed(digits)}원`;
  if (currency === 'USD') return `$${rounded.toFixed(digits)}`;
  return `${rounded.toFixed(digits)} ${currency}`;
}

function describeRsi(rsi) {
  if (rsi == null) return 'RSI 계산 대기';
  if (rsi >= 70) return '과열권';
  if (rsi <= 30) return '과매도권';
  return '중립권';
}

function buildIndicatorSnapshot(closes) {
  const { current, previous } = getLastTwo(closes);
  const changePct = ((current - previous) / previous) * 100;
  const ma20 = calculateSimpleMovingAverage(closes, 20);
  const ma60 = calculateSimpleMovingAverage(closes, 60);
  const ma120 = calculateSimpleMovingAverage(closes, 120);
  const rsi14 = calculateRsi(closes, 14);

  return {
    current,
    previous,
    changePct,
    ma20,
    ma60,
    ma120,
    rsi14,
    rsiState: describeRsi(rsi14),
  };
}

function buildMarketPayload(name, assetType, series, options = {}) {
  const closes = series.closes;
  const snapshot = buildIndicatorSnapshot(closes);
  const priceDigits = options.priceDigits ?? 2;

  return {
    displayName: name,
    assetType,
    symbol: series.symbol,
    currency: series.currency,
    price: round(snapshot.current, priceDigits),
    previousClose: round(snapshot.previous, priceDigits),
    changePct: round(snapshot.changePct, 2),
    priceText: formatPrice(snapshot.current, series.currency, priceDigits),
    changeText: formatSignedPercent(snapshot.changePct),
    rsi14: snapshot.rsi14 == null ? null : round(snapshot.rsi14, 1),
    rsiState: snapshot.rsiState,
    ma20: snapshot.ma20 == null ? null : round(snapshot.ma20, 2),
    ma60: snapshot.ma60 == null ? null : round(snapshot.ma60, 2),
    ma120: snapshot.ma120 == null ? null : round(snapshot.ma120, 2),
  };
}

function buildTickerNote(name, assetType, series, options = {}) {
  const market = buildMarketPayload(name, assetType, series, options);
  const pieces = [`${market.priceText} (${market.changeText})`];

  if (options.includeIndicators) {
    if (market.rsi14 != null) pieces.push(`RSI ${market.rsi14.toFixed(1)} · ${market.rsiState}`);
    if (market.ma20 != null && market.ma60 != null && market.ma120 != null) {
      pieces.push(`MA20 ${market.ma20.toFixed(2)} / MA60 ${market.ma60.toFixed(2)} / MA120 ${market.ma120.toFixed(2)}`);
    }
  }

  return {
    title: `${name} · ${series.symbol}`,
    note: pieces.join(' · '),
    market,
  };
}

function buildFxNote(name, series) {
  const market = buildMarketPayload(name, 'fx', series, { priceDigits: 3 });

  return {
    title: `${name}`,
    note: `${market.priceText} (${market.changeText}) · 전일 대비 환율 변화`,
    market,
  };
}

function buildMarketPatch({ now = new Date(), crypto, etfs, fx }) {
  const { slug, date } = getKstDateParts(now);
  const marketItems = [];

  for (const [name, series] of Object.entries(crypto)) {
    marketItems.push(buildTickerNote(name, 'crypto', series, { includeIndicators: false, priceDigits: 2 }));
  }

  for (const [name, series] of Object.entries(etfs)) {
    marketItems.push(buildTickerNote(name, 'etf', series, { includeIndicators: true, priceDigits: 2 }));
  }

  for (const [name, series] of Object.entries(fx)) {
    marketItems.push(buildFxNote(name, series));
  }

  return {
    slug,
    date,
    sections: {
      market: marketItems,
    },
  };
}

function buildMarketHistoryRows({ now = new Date(), crypto, etfs, fx }) {
  const recordedAt = now.toISOString();
  const rows = [];
  const groups = [
    ['crypto', crypto],
    ['etf', etfs],
    ['fx', fx],
  ];

  for (const [assetType, group] of groups) {
    for (const [name, series] of Object.entries(group)) {
      if (!Array.isArray(series.points) || !series.points.length) continue;

      for (let index = 1; index < series.points.length; index += 1) {
        const prefixCloses = series.points.slice(0, index + 1).map((point) => point.close);
        const snapshot = buildIndicatorSnapshot(prefixCloses);
        const point = series.points[index];
        if (!point.marketDate) continue;

        rows.push({
          symbol: series.symbol,
          displayName: name,
          assetType,
          marketDate: point.marketDate,
          closePrice: round(point.close, assetType === 'fx' ? 3 : 2),
          currency: series.currency,
          changePct: round(snapshot.changePct, 2),
          rsi14: snapshot.rsi14 == null ? null : round(snapshot.rsi14, 1),
          rsiState: snapshot.rsiState,
          ma20: snapshot.ma20 == null ? null : round(snapshot.ma20, 2),
          ma60: snapshot.ma60 == null ? null : round(snapshot.ma60, 2),
          ma120: snapshot.ma120 == null ? null : round(snapshot.ma120, 2),
          recordedAt,
        });
      }
    }
  }

  return rows;
}

async function fetchYahooSeries(symbol, { range = '6mo', interval = '1d', maxAttempts = 3 } = {}) {
  const period1 = range === '6mo' ? new Date(Date.now() - (1000 * 60 * 60 * 24 * 190)) : undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await yahooFinance.chart(symbol, {
        period1,
        interval,
      });
      const points = (result.quotes ?? [])
        .map((quote) => ({
          marketDate: quote.date ? new Date(quote.date).toISOString().slice(0, 10) : null,
          close: quote.close,
        }))
        .filter((point) => point.marketDate && typeof point.close === 'number');
      const closes = points.map((point) => point.close);
      const currency = result.meta?.currency ?? 'USD';
      if (closes.length < 2) throw new Error(`Not enough close data for ${symbol}`);
      return { symbol, points, closes, currency };
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Yahoo request failed for ${symbol}: ${error.message}`);
      }
      await sleep(1400 * attempt);
    }
  }

  throw new Error(`Unreachable fetch path for ${symbol}`);
}

async function fetchAllMarketSeries() {
  const result = { crypto: {}, etfs: {}, fx: {} };

  for (const [groupName, groupSymbols] of Object.entries(MARKET_SYMBOLS)) {
    for (const [name, symbol] of Object.entries(groupSymbols)) {
      result[groupName][name] = await fetchYahooSeries(symbol);
      await sleep(900);
    }
  }

  return result;
}

module.exports = {
  MARKET_SYMBOLS,
  buildMarketHistoryRows,
  buildMarketPatch,
  calculateRsi,
  calculateSimpleMovingAverage,
  fetchAllMarketSeries,
  fetchYahooSeries,
  getKstDateParts,
};
