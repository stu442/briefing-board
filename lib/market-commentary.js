const LONG_TERM_GROWTH_SYMBOLS = new Set(['VOO', 'QQQM']);
const INCOME_SYMBOLS = new Set(['JEPI', 'JEPQ']);
const CRYPTO_SYMBOLS = new Set(['BTC-USD', 'ETH-USD']);
const FX_SYMBOLS = new Set(['KRW=X', 'JPYKRW=X', 'USD/KRW', 'JPY/KRW']);

function hasValue(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

function getAssetRole(snapshot) {
  const { assetType, symbol } = snapshot;

  if (symbol === 'QLD') return 'leveraged_growth';
  if (INCOME_SYMBOLS.has(symbol)) return 'income';
  if (assetType === 'fx' || FX_SYMBOLS.has(symbol)) return 'currency';
  if (assetType === 'crypto' || CRYPTO_SYMBOLS.has(symbol)) return 'crypto_store';
  return 'growth';
}

function getTrendState(snapshot) {
  const { price, ma20, ma60, ma120 } = snapshot;
  if (!hasValue(price)) return 'unknown';

  const comparisons = [ma20, ma60, ma120].filter(hasValue);
  if (!comparisons.length) return 'unknown';

  const above20 = hasValue(ma20) ? price > ma20 : null;
  const above60 = hasValue(ma60) ? price > ma60 : null;
  const above120 = hasValue(ma120) ? price > ma120 : null;

  if (above20 === true && above60 === true && above120 === true) return 'strong_up';
  if (above20 === true && above60 === true) return 'up';
  if (above20 === false && above60 === false && above120 === false) return 'strong_down';
  if (above20 === false && above60 === false) return 'down';
  return 'mixed';
}

function getNormalizedRsiState(snapshot) {
  const { rsi14 } = snapshot;
  if (!hasValue(rsi14)) return 'unknown';
  if (rsi14 >= 70) return 'overheated';
  if (rsi14 >= 60) return 'strong';
  if (rsi14 <= 30) return 'oversold';
  return 'neutral';
}

function getVolatilityState(snapshot, assetRole) {
  if (assetRole === 'crypto_store' || assetRole === 'leveraged_growth') return 'high';
  if (snapshot.assetType === 'fx') return 'medium';
  return 'low';
}

function buildStatusTags({ snapshot, assetRole, trendState, rsiStateNormalized, volatilityState }) {
  const tags = [];

  if (rsiStateNormalized === 'overheated') tags.push('단기 과열 주의');
  else if (rsiStateNormalized === 'oversold') tags.push('과매도 구간 관찰');
  else if (trendState === 'strong_up' || trendState === 'up') tags.push('추세 양호');
  else if (trendState === 'strong_down' || trendState === 'down') tags.push('약세 주의');
  else tags.push('중립');

  if (assetRole === 'leveraged_growth') tags.push('레버리지 주의');
  else if (assetRole === 'income') tags.push('인컴 자산 관점');
  else if (assetRole === 'currency' && snapshot.changePct > 0) tags.push('환율 부담 주의');
  else if (LONG_TERM_GROWTH_SYMBOLS.has(snapshot.symbol)) tags.push('장기 적립 관점');
  else if (volatilityState === 'high') tags.push('변동성 큼');

  return tags.slice(0, 2);
}

function getTrendSentence(trendState) {
  switch (trendState) {
    case 'strong_up':
    case 'up':
      return 'MA20·MA60 위에서 움직이고 있어 단기 흐름은 비교적 양호한 편.';
    case 'mixed':
      return '단기와 중기 신호가 엇갈려 추세 해석은 다소 혼재된 상태.';
    case 'down':
    case 'strong_down':
      return '주요 이동평균 아래에 있어 추세 둔화 또는 조정 구간으로 볼 수 있음.';
    default:
      return '보조지표가 충분하지 않아 방향 해석은 제한적.';
  }
}

function getRsiSentence(rsiStateNormalized) {
  switch (rsiStateNormalized) {
    case 'overheated':
      return 'RSI가 높은 편이라 추세 강도와 별개로 단기 과열 가능성은 함께 봐야 함.';
    case 'strong':
      return 'RSI는 강한 편이지만 아직 과열 단정 단계는 아님.';
    case 'oversold':
      return '낙폭이 커 보여도 과매도 신호만으로 즉시 반등을 전제하긴 어려움.';
    case 'neutral':
      return 'RSI 기준으로는 과열·과매도 치우침이 크지 않음.';
    default:
      return null;
  }
}

function getRoleSentence(assetRole) {
  switch (assetRole) {
    case 'crypto_store':
      return '코인 특성상 방향 판단보다 변동성 감내 가능한 비중인지가 더 중요.';
    case 'growth':
      return '장기 적립 자산이라 단기 등락보다 지속 보유 원칙과의 정합성이 중요.';
    case 'leveraged_growth':
      return '레버리지 ETF라 상승 민감도만큼 하락 변동도 커질 수 있어 비중 관리가 중요.';
    case 'income':
      return '인컴 성격이 강해 가격 모멘텀보다 포트폴리오 내 역할과 총수익 관점이 중요.';
    case 'currency':
      return '환율은 방향 예측보다 분할 환전 규칙을 유지하는 편이 실전적으로 더 유리.';
    default:
      return '지표 해석과 함께 자산의 역할을 같이 보는 편이 중요.';
  }
}

function buildCommentaryText({ assetRole, trendState, rsiStateNormalized }) {
  const parts = [getTrendSentence(trendState)];

  if (trendState === 'unknown' && (rsiStateNormalized === 'overheated' || rsiStateNormalized === 'oversold')) {
    parts.push(getRsiSentence(rsiStateNormalized));
  }

  parts.push(getRoleSentence(assetRole));
  return parts.filter(Boolean).slice(0, 2).join(' ');
}

function buildReflectionQuestion(assetRole) {
  switch (assetRole) {
    case 'crypto_store':
      return '지금 판단은 thesis 기반인가, 최근 가격 움직임에 대한 반응인가?';
    case 'leveraged_growth':
      return '이 비중은 변동성 확대 시에도 유지 가능한가?';
    case 'income':
      return '이 자산의 목적이 시세차익인가, 현금흐름인가?';
    case 'currency':
      return '이번 환전 판단은 계획된 분할 실행인가, 조급한 반응인가?';
    case 'growth':
    default:
      return '이번 판단이 장기 적립 원칙과 일치하는가?';
  }
}

function buildMarketCommentary(snapshot) {
  const assetRole = getAssetRole(snapshot);
  const trendState = getTrendState(snapshot);
  const rsiStateNormalized = getNormalizedRsiState(snapshot);
  const volatilityState = getVolatilityState(snapshot, assetRole);

  return {
    statusTags: buildStatusTags({ snapshot, assetRole, trendState, rsiStateNormalized, volatilityState }),
    commentary: buildCommentaryText({ assetRole, trendState, rsiStateNormalized }),
    reflectionQuestion: buildReflectionQuestion(assetRole),
  };
}

module.exports = {
  buildMarketCommentary,
  getAssetRole,
  getTrendState,
  getNormalizedRsiState,
  getVolatilityState,
};
