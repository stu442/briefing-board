# Market Card Commentary Spec v1

## Goal
마켓 카드에 숫자만 보여주는 대신, 투자 판단을 돕는 짧은 코멘트 계층을 추가한다.

원칙:
- 예측/추천 문구는 피한다.
- 지표 해석 + 자산 역할 + 점검 질문 중심으로 구성한다.
- 한 카드에서 너무 길어지지 않게 유지한다.
- 자동 생성 가능해야 한다.

---

## Output Shape

```ts
export type MarketCommentary = {
  statusTags: string[];
  commentary: string;
  reflectionQuestion: string;
};
```

추천 확장 타입:

```ts
export type MarketSnapshot = {
  displayName: string;
  assetType: 'crypto' | 'etf' | 'fx';
  symbol: string;
  currency: string;
  price: number;
  previousClose: number;
  changePct: number;
  priceText: string;
  changeText: string;
  rsi14?: number | null;
  rsiState?: string | null;
  ma20?: number | null;
  ma60?: number | null;
  ma120?: number | null;
  commentary?: MarketCommentary;
};
```

---

## Inputs

입력으로 사용하는 필드:
- `assetType`
- `symbol`
- `price`
- `changePct`
- `rsi14`
- `ma20`
- `ma60`
- `ma120`

가능하면 향후 추가 고려:
- 최근 30일 고점/저점 대비 위치
- 5일 또는 20일 변동성
- 보유 목적 메타데이터(장기 적립 / 인컴 / 환전용)

---

## High-Level Strategy

코멘트는 아래 3단으로 만든다.

1. **statusTags**
   - 한눈에 보는 상태 요약
   - 1~2개, 많아도 3개 이내

2. **commentary**
   - 지표를 자연어로 짧게 해석
   - 1~2문장

3. **reflectionQuestion**
   - 사용자 판단을 돕는 질문 1개

---

## Derived Signals

### 1) Trend State

```ts
trendState:
  | 'strong_up'
  | 'up'
  | 'mixed'
  | 'down'
  | 'strong_down'
  | 'unknown'
```

권장 판정 규칙:

- `strong_up`
  - `price > ma20 && price > ma60 && price > ma120`
- `up`
  - `price > ma20 && price > ma60`
- `mixed`
  - 위/아래가 섞여 있거나, 일부 MA 값이 없음
- `down`
  - `price < ma20 && price < ma60`
- `strong_down`
  - `price < ma20 && price < ma60 && price < ma120`
- `unknown`
  - 핵심 값이 너무 비어 있어 판정 곤란

### 2) RSI State

```ts
rsiStateNormalized:
  | 'overheated'
  | 'strong'
  | 'neutral'
  | 'oversold'
  | 'unknown'
```

권장 판정 규칙:
- `rsi14 >= 70` → `overheated`
- `60 <= rsi14 < 70` → `strong`
- `30 < rsi14 < 60` → `neutral`
- `rsi14 <= 30` → `oversold`
- 값 없음 → `unknown`

### 3) Volatility State

```ts
volatilityState:
  | 'high'
  | 'medium'
  | 'low'
```

초기 v1 단순 규칙:
- `crypto` → `high`
- `symbol === 'QLD'` → `high`
- `fx` → `medium`
- 나머지 ETF → `low`

### 4) Asset Role

```ts
assetRole:
  | 'growth'
  | 'leveraged_growth'
  | 'income'
  | 'currency'
  | 'crypto_store'
```

권장 매핑:
- `BTC`, `ETH` → `crypto_store`
- `VOO`, `QQQM` → `growth`
- `QLD` → `leveraged_growth`
- `JEPI`, `JEPQ` → `income`
- `USD/KRW`, `JPY/KRW`, `KRW=X`, `JPYKRW=X` → `currency`
- 나머지 ETF → `growth`

---

## Status Tag Rules

최종 `statusTags`는 우선순위를 둬서 1~2개만 선택한다.

### Primary Tag
우선순위:
1. `단기 과열 주의` if `rsiStateNormalized === 'overheated'`
2. `과매도 구간 관찰` if `rsiStateNormalized === 'oversold'`
3. `추세 양호` if `trendState === 'strong_up' || trendState === 'up'`
4. `약세 주의` if `trendState === 'strong_down' || trendState === 'down'`
5. `중립` otherwise

### Secondary Tag
우선순위:
- `변동성 큼` if `volatilityState === 'high'`
- `레버리지 주의` if `assetRole === 'leveraged_growth'`
- `인컴 자산 관점` if `assetRole === 'income'`
- `장기 적립 관점` if `symbol === 'VOO' || symbol === 'QQQM'`
- `환율 부담 주의` if `assetRole === 'currency' && changePct > 0`
- `분할 접근 우세` if `rsiStateNormalized === 'overheated' || volatilityState === 'high'`

주의:
- `레버리지 주의`와 `변동성 큼`이 동시에 필요해도 둘 다 넣지 말고 더 설명적인 쪽 하나만 선택 가능
- 최종 태그 수는 2개 권장

---

## Commentary Generation Rules

### Commentary Formula

```text
[추세 해석 1문장] + [자산 역할 또는 리스크 보정 1문장]
```

문장 길이 가이드:
- 70~110자 정도 권장
- 최대 2문장

### Trend Sentence Templates

#### strong_up / up
- `MA20·MA60 위에서 움직이고 있어 단기 흐름은 비교적 양호한 편.`
- `중기 추세는 유지되고 있어 급격한 훼손 신호는 아직 제한적.`

#### mixed
- `단기와 중기 신호가 엇갈려 추세 해석은 다소 혼재된 상태.`
- `일부 평균선 기준으로는 버티고 있지만 확실한 방향성은 아직 약함.`

#### down / strong_down
- `주요 이동평균 아래에 있어 추세 둔화 또는 조정 구간으로 볼 수 있음.`
- `낙폭 자체보다 추세 훼손이 일시적인지 확인이 필요한 구간.`

#### unknown
- `보조지표가 충분하지 않아 방향 해석은 제한적.`

### RSI Sentence Templates

#### overheated
- `RSI가 높은 편이라 추세 강도와 별개로 단기 과열 가능성은 함께 봐야 함.`

#### strong
- `RSI는 강한 편이지만 아직 과열 단정 단계는 아님.`

#### neutral
- `RSI 기준으로는 과열·과매도 치우침이 크지 않음.`

#### oversold
- `낙폭이 커 보여도 과매도 신호만으로 즉시 반등을 전제하긴 어려움.`

### Asset Role Add-on Templates

#### crypto_store
- `코인 특성상 방향 판단보다 변동성 감내 가능한 비중인지가 더 중요.`

#### growth
- `장기 적립 자산이라 단기 등락보다 지속 보유 원칙과의 정합성이 중요.`

#### leveraged_growth
- `레버리지 ETF라 상승 민감도만큼 하락 변동도 커질 수 있어 비중 관리가 중요.`

#### income
- `인컴 성격이 강해 가격 모멘텀보다 포트폴리오 내 역할과 총수익 관점이 중요.`

#### currency
- `환율은 방향 예측보다 분할 환전 규칙을 유지하는 편이 실전적으로 더 유리.`

### Assembly Heuristic

권장 조합 순서:
1. 추세 관련 한 문장 선택
2. RSI가 극단(`overheated` / `oversold`)이면 그 문장을 우선 포함
3. 마지막에 자산 역할 문장 1개 추가
4. 문장이 3개를 넘으면 2개까지만 유지

예시 조합:
- `MA20·MA60 위에서 움직이고 있어 단기 흐름은 비교적 양호한 편. 코인 특성상 방향 판단보다 변동성 감내 가능한 비중인지가 더 중요.`
- `주요 이동평균 아래에 있어 조정 구간으로 볼 수 있음. 인컴 성격이 강해 가격 모멘텀보다 자산 역할을 함께 봐야 함.`

---

## Reflection Question Rules

질문은 **자산 역할 기반**으로 고정 템플릿을 주는 것이 안정적이다.

### crypto_store
- `지금 판단은 thesis 기반인가, 최근 가격 움직임에 대한 반응인가?`
- `이 비중은 급락이 와도 유지 가능한 수준인가?`

### growth
- `이번 판단이 장기 적립 원칙과 일치하는가?`
- `이번 움직임이 내 장기 thesis를 바꿀 정도인가, 아니면 노이즈인가?`

### leveraged_growth
- `이 비중은 변동성 확대 시에도 유지 가능한가?`
- `기대수익보다 리스크 감내 범위를 먼저 점검했는가?`

### income
- `지금 이 자산을 성장 기대 자산처럼 보고 있진 않은가?`
- `이 자산의 목적이 시세차익인가, 현금흐름인가?`

### currency
- `이번 환전 판단은 계획된 분할 실행인가, 조급한 반응인가?`
- `환율 변화가 자산 판단을 과하게 흔들고 있지 않은가?`

선택 규칙:
- 자산마다 기본 질문 2개를 두고, `changePct` 방향이나 `rsi` 상태에 따라 하나 고른다.
- v1에서는 랜덤 없이 고정 선택이 더 낫다.

---

## Recommended TypeScript API

```ts
export type MarketCommentary = {
  statusTags: string[];
  commentary: string;
  reflectionQuestion: string;
};

export function buildMarketCommentary(snapshot: MarketSnapshot): MarketCommentary {
  // derive trend state
  // derive normalized RSI state
  // derive volatility state
  // map asset role
  // choose 1~2 tags
  // assemble commentary text
  // choose reflection question
}
```

보조 함수 제안:

```ts
function getAssetRole(snapshot: MarketSnapshot): AssetRole;
function getTrendState(snapshot: MarketSnapshot): TrendState;
function getRsiState(snapshot: MarketSnapshot): RsiStateNormalized;
function getVolatilityState(snapshot: MarketSnapshot): VolatilityState;
function buildStatusTags(ctx: CommentaryContext): string[];
function buildCommentaryText(ctx: CommentaryContext): string;
function buildReflectionQuestion(ctx: CommentaryContext): string;
```

---

## Suggested File Placement

### Option A: rendering layer only
- `lib/market-commentary.ts`
- 서버 렌더링 직전에 `snapshot -> commentary` 생성

장점:
- 기존 JSON 구조를 당장 바꾸지 않아도 됨
- 실험 속도가 빠름

### Option B: content generation layer 포함
- `scripts/lib/market-data.js` 또는 별도 `scripts/lib/market-commentary.js`
- 브리핑 JSON에 commentary를 미리 주입

장점:
- HTML 외 다른 채널(텔레그램, 요약 메일)에도 재사용 쉬움

### Recommendation
v1은 **Option A** 추천.
- UI 실험이 빠름
- 기존 브리핑 생성 파이프라인 변경 범위가 작음
- 나중에 안정화되면 생성 파이프라인으로 이동 가능

---

## UI Placement

카드 하단 배지 아래 영역 추천:

```text
[추세 양호] [변동성 큼]

코멘트
MA20·MA60 위에서 움직이고 있어 단기 흐름은 비교적 양호한 편. 코인 특성상 방향 판단보다 변동성 감내 가능한 비중인지가 더 중요.

체크
지금 판단은 thesis 기반인가, 최근 가격 움직임에 대한 반응인가?
```

권장 UI 레이블:
- `코멘트`
- `체크`

또는 더 미니멀하게:
- `해석`
- `질문`

---

## Examples

### BTC Example
Input:
- `assetType=crypto`
- `symbol=BTC`
- `price > ma20, ma60, ma120`
- `rsi14=73`

Output:
```json
{
  "statusTags": ["단기 과열 주의", "변동성 큼"],
  "commentary": "MA20·MA60 위에서 움직이고 있어 단기 흐름은 비교적 양호한 편. 코인 특성상 방향 판단보다 변동성 감내 가능한 비중인지가 더 중요.",
  "reflectionQuestion": "지금 판단은 thesis 기반인가, 최근 가격 움직임에 대한 반응인가?"
}
```

### VOO Example
Input:
- `assetType=etf`
- `symbol=VOO`
- `price > ma20 && price > ma60`
- `rsi14=61`

Output:
```json
{
  "statusTags": ["추세 양호", "장기 적립 관점"],
  "commentary": "중기 추세는 유지되고 있어 급격한 훼손 신호는 아직 제한적. 장기 적립 자산이라 단기 등락보다 지속 보유 원칙과의 정합성이 중요.",
  "reflectionQuestion": "이번 판단이 장기 적립 원칙과 일치하는가?"
}
```

### QLD Example
Output:
```json
{
  "statusTags": ["추세 양호", "레버리지 주의"],
  "commentary": "MA20·MA60 위에서 움직이고 있어 추세는 양호한 편. 레버리지 ETF라 상승 민감도만큼 하락 변동도 커질 수 있어 비중 관리가 중요.",
  "reflectionQuestion": "이 비중은 변동성 확대 시에도 유지 가능한가?"
}
```

### JEPI Example
Output:
```json
{
  "statusTags": ["중립", "인컴 자산 관점"],
  "commentary": "단기와 중기 신호가 엇갈려 추세 해석은 다소 혼재된 상태. 인컴 성격이 강해 가격 모멘텀보다 포트폴리오 내 역할과 총수익 관점이 중요.",
  "reflectionQuestion": "이 자산의 목적이 시세차익인가, 현금흐름인가?"
}
```

### USD/KRW Example
Output:
```json
{
  "statusTags": ["중립", "환율 부담 주의"],
  "commentary": "추세 해석은 가능하더라도 환율은 방향 예측보다 분할 환전 규칙을 유지하는 편이 실전적으로 더 유리. 해외자산 매수 체감 단가에 미치는 영향도 함께 볼 필요가 있음.",
  "reflectionQuestion": "이번 환전 판단은 계획된 분할 실행인가, 조급한 반응인가?"
}
```

---

## v1 Non-Goals

이번 버전에서 하지 않는 것:
- 매수/매도 추천
- 목표가 제시
- 예측성 문구
- 거시 뉴스 해석 결합
- 개인 포트폴리오 비중 기반 개인화

---

## Next Implementation Step

추천 순서:
1. `lib/market-commentary.ts` 생성
2. `buildMarketCommentary(snapshot)` 구현
3. `MarketSnapshot` 타입에 `commentary?: MarketCommentary` 추가 또는 렌더 단계에서 계산
4. `app/briefings/[slug]/page.tsx`의 `MarketCard` 하단에 코멘트 UI 추가
5. 예시 데이터 2~3개로 렌더 확인
6. 문장 길이/톤 조정
