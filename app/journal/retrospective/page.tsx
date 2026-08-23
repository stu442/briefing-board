import Link from 'next/link';
import { ArrowLeft, CalendarRange } from 'lucide-react';

export default function RetrospectivePage() {
  return <main className="journal-shell"><header className="journal-nav"><Link href="/journal" className="journal-back-link"><ArrowLeft className="size-4" /> 캘린더</Link><Link href="/journal/write" className="journal-nav-link">글쓰기</Link></header><section className="journal-reading-header"><p className="journal-eyebrow"><CalendarRange className="size-3.5" /> RETROSPECTIVE</p><h1>회고</h1><p className="mt-3 text-sm text-muted-foreground">주간·월간 회고는 일간 기록과 분리해서 이곳에 쌓아갈게.</p></section><section className="mx-auto max-w-3xl rounded-3xl border border-border/70 bg-card/70 p-6"><h2 className="text-lg font-semibold">주간 회고</h2><p className="mt-2 text-sm text-muted-foreground">기존 Obsidian 회고 노트를 이 화면에 연결하고, 새 회고 작성 폼을 다음 단계로 붙이는 중이야.</p></section></main>;
}
