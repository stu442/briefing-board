import fs from 'node:fs';
import path from 'node:path';

import { getAdjacentBriefings, getBriefingMetaBySlug, listBriefings, type BriefingMeta } from '@/lib/db';

export type MarketAssetType = 'crypto' | 'etf' | 'fx';

export type MarketCommentary = {
  statusTags: string[];
  commentary: string;
  reflectionQuestion: string;
};

export type MarketSnapshot = {
  displayName: string;
  assetType: MarketAssetType;
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

export type BriefingItem = {
  title: string;
  note?: string;
  url?: string;
  desc?: string;
  discussionUrl?: string;
  originalUrl?: string;
  market?: MarketSnapshot;
};

export type BriefingSections = {
  calendar?: BriefingItem[];
  importantMail?: BriefingItem[];
  inboxPicks?: BriefingItem[];
  geekNews?: BriefingItem[];
  hackerNews?: BriefingItem[];
  market?: BriefingItem[];
  focus?: BriefingItem[];
};

export type BriefingDocument = {
  date: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: string;
  sections: BriefingSections;
};

export function normalizeBriefingSlug(rawSlug: string) {
  return rawSlug.replace(/\.html$/, '');
}

export function getBriefingPath(slug: string) {
  return `/briefings/${slug}.html`;
}

export function getBriefingJsonPath(slug: string) {
  return path.join(process.cwd(), 'content', 'briefings', `${slug}.json`);
}

export function getBriefingDocument(slug: string): (BriefingDocument & { meta: BriefingMeta; previous: BriefingMeta | null; next: BriefingMeta | null }) | null {
  const normalizedSlug = normalizeBriefingSlug(slug);
  const meta = getBriefingMetaBySlug(normalizedSlug);
  if (!meta) return null;

  const jsonPath = getBriefingJsonPath(normalizedSlug);
  if (!fs.existsSync(jsonPath)) return null;

  const doc = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) as BriefingDocument;
  const { previous, next } = getAdjacentBriefings(normalizedSlug);

  return {
    ...doc,
    meta,
    previous,
    next,
  };
}

export function getBriefingIndex() {
  return listBriefings(90).map((item) => ({
    ...item,
    href: getBriefingPath(item.slug),
  }));
}

export const sectionOrder: Array<keyof BriefingSections> = [
  'calendar',
  'importantMail',
  'inboxPicks',
  'geekNews',
  'hackerNews',
  'market',
  'focus',
];

export const sectionLabels: Record<keyof BriefingSections, string> = {
  calendar: '오늘 일정',
  importantMail: '중요 메일',
  inboxPicks: '인박스에서 볼 만한 것',
  geekNews: 'GeekNews',
  hackerNews: 'Hacker News',
  market: '마켓',
  focus: '오늘의 포커스',
};
