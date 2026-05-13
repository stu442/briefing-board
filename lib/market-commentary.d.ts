export type MarketCommentary = {
  statusTags: string[];
  commentary: string;
  reflectionQuestion: string;
};

export declare function buildMarketCommentary(snapshot: {
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
}): MarketCommentary;
