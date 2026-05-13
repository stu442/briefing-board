import fs from 'node:fs';
import path from 'node:path';

import { Boxes, Clock3, ExternalLink, Files, PanelTop, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBriefingIndex } from '@/lib/briefings';

export const dynamic = 'force-dynamic';

type HtmlArtifact = {
  name: string;
  href: string;
  title: string;
  description: string;
  updatedAt: string;
};

function prettifyArtifactTitle(fileName: string) {
  return fileName
    .replace(/\.html$/, '')
    .split('-')
    .map((part) => {
      if (part.toLowerCase() === 'erd') return 'ERD';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function getArtifactDescription(fileName: string) {
  if (fileName.includes('architecture')) return '브리핑 보드의 전체 구성, 데이터 흐름, cron 흐름을 보여주는 다이어그램';
  if (fileName.includes('erd')) return 'SQLite 테이블 구조와 JSON 문서 관계를 정리한 ERD';
  return '직접 생성한 HTML 문서';
}

function getHtmlArtifacts(): HtmlArtifact[] {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) return [];

  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => {
      const filePath = path.join(publicDir, entry.name);
      const stats = fs.statSync(filePath);
      return {
        name: entry.name,
        href: `/${entry.name}`,
        title: prettifyArtifactTitle(entry.name),
        description: getArtifactDescription(entry.name),
        updatedAt: new Date(stats.mtime).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export default function HomePage() {
  const briefings = getBriefingIndex();
  const artifacts = getHtmlArtifacts();
  const generatedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  return (
    <main className="container py-6 md:py-10">
      <section className="mb-6 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm md:p-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <PanelTop className="size-3.5" /> Tailscale 내부 전용
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">민수 브리핑</h1>
        <p className="mt-3 max-w-3xl text-balance text-sm leading-6 text-muted-foreground md:text-base">
          텔레그램은 입구, 읽기는 여기서. 매일 브리핑이 쌓이고 같은 날짜 페이지에 시장 업데이트까지 합쳐지는 개인 보드.
          이제 생성한 다이어그램/ERD 같은 HTML 산출물도 여기서 같이 볼 수 있게 정리했다.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Clock3 className="size-4" /> 최근 렌더링 · {generatedAt}</span>
          <span className="inline-flex items-center gap-2"><Sparkles className="size-4" /> Next.js + TypeScript + shadcn-style UI</span>
          <span className="inline-flex items-center gap-2"><Files className="size-4" /> HTML 산출물 {artifacts.length}개</span>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Artifacts</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">생성된 HTML 파일</h2>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs text-muted-foreground">
            다이어그램 / ERD / 추후 문서 산출물
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {artifacts.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle>아직 생성된 HTML 파일이 없어</CardTitle>
                <CardDescription>다이어그램이나 리포트 HTML을 만들면 여기에 자동으로 노출돼.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {artifacts.map((artifact) => (
            <Card key={artifact.name} className="border-border/70 bg-card/95 transition-transform hover:-translate-y-0.5">
              <CardHeader>
                <CardDescription>{artifact.name}</CardDescription>
                <CardTitle className="text-xl">{artifact.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">{artifact.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">html</Badge>
                  {artifact.name.includes('architecture') ? <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">architecture</Badge> : null}
                  {artifact.name.includes('erd') ? <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">erd</Badge> : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">업데이트 · {artifact.updatedAt}</span>
                  <LinkButton href={artifact.href} variant="secondary" size="sm">
                    열기 <ExternalLink className="size-4" />
                  </LinkButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Daily Briefings</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">날짜별 브리핑</h2>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Boxes className="mr-1 size-3.5" /> {briefings.length}개 페이지
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {briefings.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardHeader>
                <CardTitle>아직 브리핑이 없어</CardTitle>
                <CardDescription>cron이 첫 브리핑을 넣으면 여기부터 쌓여.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {briefings.map((briefing) => (
            <Card key={briefing.slug} className="border-border/70 bg-card/95 transition-transform hover:-translate-y-0.5">
              <CardHeader>
                <CardDescription>{briefing.briefing_date}</CardDescription>
                <CardTitle className="text-xl">{briefing.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm leading-6 text-muted-foreground">{briefing.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {briefing.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">업데이트 · {briefing.updated_at.replace('T', ' ').slice(0, 16)}</span>
                  <LinkButton href={briefing.href} variant="secondary" size="sm">
                    브리핑 보기 <ExternalLink className="size-4" />
                  </LinkButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
