import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpenText, CalendarDays, Camera, ChevronRight, Sparkles } from 'lucide-react';

import { JournalContent } from '@/components/journal-content';
import { JournalEntryForm } from '@/components/journal-entry-form';
import { JournalSyncControls } from '@/components/journal-sync-controls';
import { getTodayJournalSlug, listJournalNotes, parseJournalContent, readJournalNote } from '@/lib/journal';

export const dynamic = 'force-dynamic';

function formatKoreanDate(slug: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', ...options }).format(new Date(`${slug}T12:00:00+09:00`));
}

function getMonth(value: string | undefined, fallbackSlug: string) {
  const candidate = value && /^\d{4}-\d{2}$/.test(value) ? value : fallbackSlug.slice(0, 7);
  const [year, month] = candidate.split('-').map(Number);
  return { year, month, key: `${year}-${String(month).padStart(2, '0')}` };
}

function shiftMonth(year: number, month: number, offset: number) {
  const shifted = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function JournalHomePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const todaySlug = getTodayJournalSlug();
  const { month: monthQuery } = await searchParams;
  const selectedMonth = getMonth(monthQuery, todaySlug);
  const todayNote = readJournalNote(todaySlug);
  const allNotes = listJournalNotes(500);
  const notesBySlug = new Map(allNotes.map((note) => [note.slug, note]));
  const recentNotes = allNotes.slice(0, 20);
  const todayLabel = formatKoreanDate(todaySlug, { month: 'long', day: 'numeric', weekday: 'long' });
  const firstWeekday = new Date(Date.UTC(selectedMonth.year, selectedMonth.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(selectedMonth.year, selectedMonth.month, 0)).getUTCDate();
  const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);

  return (
    <main className="journal-shell">
      <header className="journal-nav">
        <Link href="/journal" className="journal-wordmark">aurel<span>.</span></Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <JournalSyncControls />
          <Link href="/" className="journal-nav-link">브리핑 홈 <ArrowUpRight className="size-3" /></Link>
        </div>
      </header>

      <section className="journal-hero">
        <p className="journal-eyebrow"><Sparkles className="size-3.5" /> {todayLabel}</p>
        <h1>오늘을,<br /><em>있는 그대로.</em></h1>
        <p className="journal-hero-copy">사진, 문장, 그리고 지금 있는 곳까지. 한 줄부터 오늘의 페이지를 남겨봐.</p>
      </section>

      <section className="mb-10 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="journal-section-label">CALENDAR</p><h2 className="mt-1 text-xl font-semibold">{selectedMonth.year}년 {selectedMonth.month}월</h2></div>
          <div className="flex gap-2">
            <Link className="journal-sync-button" href={`/journal?month=${shiftMonth(selectedMonth.year, selectedMonth.month, -1)}`} aria-label="이전 달"><ArrowLeft className="size-4" /></Link>
            <Link className="journal-sync-button" href={`/journal?month=${todaySlug.slice(0, 7)}`}>오늘</Link>
            <Link className="journal-sync-button" href={`/journal?month=${shiftMonth(selectedMonth.year, selectedMonth.month, 1)}`} aria-label="다음 달"><ArrowRight className="size-4" /></Link>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground sm:gap-2 sm:text-xs">{['일','월','화','수','목','금','토'].map((day) => <span key={day} className="py-1">{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="aspect-square" />;
            const slug = `${selectedMonth.key}-${String(day).padStart(2, '0')}`;
            const note = notesBySlug.get(slug);
            const isToday = slug === todaySlug;
            return <Link key={slug} href={`/journal/${slug}`} className={`relative aspect-square overflow-hidden rounded-xl border p-1.5 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--journal-accent))] sm:p-2 ${isToday ? 'border-[hsl(var(--journal-accent))]' : 'border-border/60'}`} style={note?.coverImage ? { backgroundImage: `linear-gradient(180deg, rgba(13, 16, 24, .05), rgba(13, 16, 24, .82)), url(${note.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              <span className={`relative z-10 block text-xs font-semibold ${note?.coverImage ? 'text-white' : ''}`}>{day}</span>
              {note ? <span className={`relative z-10 mt-1 hidden line-clamp-3 text-[10px] leading-3 sm:block ${note.coverImage ? 'text-white/90' : 'text-muted-foreground'}`}>{note.preview}</span> : <span className="relative z-10 mt-1 hidden text-[10px] text-muted-foreground/60 sm:block">기록하기</span>}
              {note?.photoCount ? <Camera className={`absolute bottom-1.5 right-1.5 z-10 size-3 ${note.coverImage ? 'text-white/90' : 'text-muted-foreground'}`} /> : null}
            </Link>;
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">날짜를 누르면 그날의 기록을 열거나 새로 쓸 수 있어. 사진이 있는 날은 첫 사진이 배경으로 표시돼.</p>
      </section>

      <section className="journal-main-grid">
        <div className="space-y-5">
          <JournalEntryForm slug={todaySlug} />
          {todayNote ? <Link href={todayNote.href as never} className="journal-today-card group"><div className="flex items-center justify-between gap-3"><span className="journal-section-label">TODAY&apos;S PAGE</span><span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">전체 보기 <ChevronRight className="size-3.5" /></span></div><div className="mt-4 max-h-40 overflow-hidden mask-fade-bottom"><JournalContent blocks={parseJournalContent(todayNote.content)} /></div></Link> : null}
        </div>
        <aside className="journal-timeline">
          <div className="mb-5 flex items-end justify-between gap-4"><div><p className="journal-section-label">YOUR DAYS</p><h2>지난 기록</h2></div><span className="text-xs text-muted-foreground">{recentNotes.length}개</span></div>
          {recentNotes.length === 0 ? <div className="journal-empty-state"><BookOpenText className="size-5" /><p>첫 문장을 남기면<br />여기에 하루가 쌓여.</p></div> : <div className="journal-note-list">{recentNotes.map((note) => <Link key={note.slug} href={note.href as never} className="journal-note-row group"><div className="journal-date-block"><strong>{formatKoreanDate(note.slug, { day: '2-digit' })}</strong><span>{formatKoreanDate(note.slug, { month: 'short' })}</span></div><div className="min-w-0 flex-1"><div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3" /> {formatKoreanDate(note.slug, { weekday: 'short' })}{note.photoCount > 0 ? <span className="inline-flex items-center gap-1"><Camera className="size-3" /> {note.photoCount}</span> : null}</div><p className="journal-note-preview">{note.preview}</p></div><ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></Link>)}</div>}
        </aside>
      </section>
    </main>
  );
}
