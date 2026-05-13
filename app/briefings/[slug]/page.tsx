import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { buildMarketCommentary } from '@/lib/market-commentary';
import { getMarketHistory } from '@/lib/db';
import { getBriefingDocument, getBriefingPath, normalizeBriefingSlug, sectionLabels, sectionOrder, type BriefingItem, type BriefingSections } from '@/lib/briefings';

export const dynamic = 'force-dynamic';

function getItemLink(sectionKey: keyof BriefingSections, item: BriefingItem) {
  if ((sectionKey === 'geekNews' || sectionKey === 'hackerNews') && item.discussionUrl) {
    return {
      href: item.discussionUrl,
      label: sectionKey === 'geekNews' ? '긱뉴스에서 보기' : '해커뉴스에서 보기',
    };
  }

  if (item.url) {
    return {
      href: item.url,
      label: '원문',
    };
  }

  return null;
}

function formatMetric(value?: number | null, digits = 2) {
  if (value == null || Number.isNaN(value)) return '-';
  return value.toFixed(digits);
}

function getChangeTone(changePct: number) {
  if (changePct >= 0.15) {
    return {
      card: 'border-emerald-500/30 bg-emerald-500/5',
      badge: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
      text: 'text-emerald-300',
      line: 'stroke-emerald-400',
      fill: 'fill-emerald-500/10',
      icon: TrendingUp,
    };
  }

  if (changePct <= -0.15) {
    return {
      card: 'border-rose-500/30 bg-rose-500/5',
      badge: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
      text: 'text-rose-300',
      line: 'stroke-rose-400',
      fill: 'fill-rose-500/10',
      icon: TrendingDown,
    };
  }

  return {
    card: 'border-border/70 bg-secondary/30',
    badge: 'border-border bg-secondary text-secondary-foreground',
    text: 'text-muted-foreground',
    line: 'stroke-slate-400',
    fill: 'fill-slate-500/10',
    icon: TrendingUp,
  };
}

function getRsiTone(rsiState?: string | null) {
  if (rsiState === '과열권') return 'border-amber-500/30 bg-amber-500/15 text-amber-200';
  if (rsiState === '과매도권') return 'border-sky-500/30 bg-sky-500/15 text-sky-200';
  return 'border-border bg-secondary text-secondary-foreground';
}

function Sparkline({ values, lineClass, fillClass }: { values: number[]; lineClass: string; fillClass: string }) {
  if (values.length < 2) {
    return <div className="h-16 rounded-lg border border-dashed border-border/70 bg-secondary/20" />;
  }

  const width = 160;
  const height = 52;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full overflow-visible">
      <polygon points={areaPoints} className={fillClass} />
      <polyline points={points} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={lineClass} />
    </svg>
  );
}

function MarketCard({ item }: { item: BriefingItem }) {
  const market = item.market;
  if (!market) {
    return (
      <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
        <p className="font-medium leading-6 text-foreground">{item.title}</p>
        {item.note ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
      </div>
    );
  }

  const tone = getChangeTone(market.changePct);
  const history = getMarketHistory(market.symbol, 30);
  const values = history.map((row) => row.close_price);
  const TrendIcon = tone.icon;
  const marketCommentary = market.commentary ?? buildMarketCommentary(market);

  return (
    <article className={`min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm ${tone.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">{market.displayName}</p>
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              {market.symbol}
            </Badge>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {market.assetType === 'crypto' ? 'Crypto' : market.assetType === 'etf' ? 'ETF' : 'FX'}
          </p>
        </div>
        <Badge variant="outline" className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${tone.badge}`}>
          <TrendIcon className="mr-1 size-3.5" /> {market.changeText}
        </Badge>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="break-all text-2xl font-semibold tracking-tight text-foreground">{market.priceText}</p>
          <p className={`mt-1 text-sm ${tone.text}`}>
            전일 종가 {formatMetric(market.previousClose, market.assetType === 'fx' ? 3 : 2)}
          </p>
        </div>
        <div className="min-w-0 text-left text-xs text-muted-foreground sm:min-w-[92px] sm:text-right">
          <p>30일 흐름</p>
          <p className="break-words">{history.length ? `${history[0]?.market_date} → ${history[history.length - 1]?.market_date}` : '데이터 준비 중'}</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-white/5 bg-black/10 px-2 py-1.5">
        <Sparkline values={values} lineClass={tone.line} fillClass={tone.fill} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {marketCommentary.statusTags.map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full px-2.5 py-1 text-xs text-muted-foreground">
            {tag}
          </Badge>
        ))}
        {market.rsi14 != null ? (
          <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-xs ${getRsiTone(market.rsiState)}`}>
            RSI {market.rsi14.toFixed(1)} · {market.rsiState}
          </Badge>
        ) : null}
        {market.ma20 != null ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs text-muted-foreground">
            MA20 {market.ma20.toFixed(2)}
          </Badge>
        ) : null}
        {market.ma60 != null ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs text-muted-foreground">
            MA60 {market.ma60.toFixed(2)}
          </Badge>
        ) : null}
        {market.ma120 != null ? (
          <Badge variant="outline" className="rounded-full px-2.5 py-1 text-xs text-muted-foreground">
            MA120 {market.ma120.toFixed(2)}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/10 p-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">코멘트</p>
          <p className="text-sm leading-6 text-foreground/90">{marketCommentary.commentary}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">체크</p>
          <p className="text-sm leading-6 text-muted-foreground">{marketCommentary.reflectionQuestion}</p>
        </div>
      </div>
    </article>
  );
}

function MarketGrid({ items, emptyMessage }: { items?: BriefingItem[]; emptyMessage: string }) {
  if (!items?.length) {
    return <p className="text-sm leading-6 text-muted-foreground">{emptyMessage}</p>;
  }

  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <MarketCard key={`${item.title}-${item.market?.symbol ?? ''}`} item={item} />)}</div>;
}

function BriefingList({ sectionKey, items, emptyMessage }: { sectionKey: keyof BriefingSections; items?: BriefingItem[]; emptyMessage: string }) {
  if (sectionKey === 'market') {
    return <MarketGrid items={items} emptyMessage={emptyMessage} />;
  }

  if (!items?.length) {
    return <p className="text-sm leading-6 text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const link = getItemLink(sectionKey, item);

        return (
          <li key={`${item.title}-${item.discussionUrl ?? item.url ?? ''}`} className="rounded-xl border border-border/70 bg-secondary/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="font-medium leading-6 text-foreground">{item.title}</p>
                {item.note ? <p className="text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
                {!item.note && item.desc ? <p className="text-sm leading-6 text-muted-foreground">{item.desc}</p> : null}
                {item.originalUrl && item.discussionUrl ? (
                  <a href={item.originalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                    원문 바로가기 <ExternalLink className="size-3.5" />
                  </a>
                ) : null}
              </div>
              {link ? (
                <a href={link.href} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                  {link.label} <ExternalLink className="size-4" />
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function BriefingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const briefing = getBriefingDocument(normalizeBriefingSlug(slug));
  if (!briefing) notFound();

  return (
    <main className="container py-6 md:py-10">
      <section className="rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm md:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 목록으로
        </Link>
        <p className="mt-5 text-sm text-muted-foreground">{briefing.date}</p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight md:text-5xl">{briefing.title}</h1>
        <p className="mt-4 max-w-3xl text-balance text-sm leading-6 text-muted-foreground md:text-base">{briefing.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {briefing.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">생성 시각 · {briefing.createdAt}</p>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {sectionOrder.map((sectionKey) => (
          <Card key={sectionKey} className={sectionKey === 'focus' || sectionKey === 'market' ? 'xl:col-span-2' : ''}>
            <CardHeader>
              <CardTitle>{sectionLabels[sectionKey]}</CardTitle>
              <CardDescription>{sectionKey === 'market' ? 'SQLite 시계열과 함께 누적되는 마켓 카드' : '오늘 날짜 페이지에 누적되는 섹션'}</CardDescription>
            </CardHeader>
            <CardContent>
              <BriefingList
                sectionKey={sectionKey}
                items={briefing.sections[sectionKey]}
                emptyMessage={sectionKey === 'calendar' ? '오늘 등록된 일정이 없습니다.' : '아직 채워진 항목이 없습니다.'}
              />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">이전/다음 브리핑 이동</p>
            <Separator />
            <div className="flex flex-wrap gap-3">
              {briefing.previous ? (
                <LinkButton href={getBriefingPath(briefing.previous.slug)} variant="outline" size="sm">
                  <ArrowLeft className="size-4" /> {briefing.previous.briefing_date}
                </LinkButton>
              ) : (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground">이전 브리핑 없음</Badge>
              )}
              {briefing.next ? (
                <LinkButton href={getBriefingPath(briefing.next.slug)} variant="outline" size="sm">
                  {briefing.next.briefing_date} <ArrowRight className="size-4" />
                </LinkButton>
              ) : (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-muted-foreground">다음 브리핑 없음</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
