import Link from 'next/link';
import { ArrowUpRight, BookOpenText, CalendarDays, Camera, ChevronRight, Sparkles } from 'lucide-react';

import { JournalContent } from '@/components/journal-content';
import { JournalEntryForm } from '@/components/journal-entry-form';
import { JournalSyncControls } from '@/components/journal-sync-controls';
import { getTodayJournalSlug, listJournalNotes, parseJournalContent, readJournalNote } from '@/lib/journal';

export const dynamic = 'force-dynamic';

function formatKoreanDate(slug: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(`${slug}T12:00:00+09:00`);
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', ...options }).format(date);
}

export default function JournalHomePage() {
  const todaySlug = getTodayJournalSlug();
  const todayNote = readJournalNote(todaySlug);
  const recentNotes = listJournalNotes(20);
  const todayLabel = formatKoreanDate(todaySlug, { month: 'long', day: 'numeric', weekday: 'long' });

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
        <p className="journal-hero-copy">생각이 정리되지 않아도 괜찮아. 한 줄부터 오늘의 페이지를 남겨봐.</p>
      </section>

      <section className="journal-main-grid">
        <div className="space-y-5">
          <JournalEntryForm slug={todaySlug} />

          {todayNote ? (
            <Link href={todayNote.href as never} className="journal-today-card group">
              <div className="flex items-center justify-between gap-3">
                <span className="journal-section-label">TODAY&apos;S PAGE</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">전체 보기 <ChevronRight className="size-3.5" /></span>
              </div>
              <div className="mt-4 max-h-40 overflow-hidden mask-fade-bottom">
                <JournalContent blocks={parseJournalContent(todayNote.content)} />
              </div>
            </Link>
          ) : null}
        </div>

        <aside className="journal-timeline">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="journal-section-label">YOUR DAYS</p>
              <h2>지난 기록</h2>
            </div>
            <span className="text-xs text-muted-foreground">{recentNotes.length}개</span>
          </div>

          {recentNotes.length === 0 ? (
            <div className="journal-empty-state">
              <BookOpenText className="size-5" />
              <p>첫 문장을 남기면<br />여기에 하루가 쌓여.</p>
            </div>
          ) : (
            <div className="journal-note-list">
              {recentNotes.map((note) => (
                <Link key={note.slug} href={note.href as never} className="journal-note-row group">
                  <div className="journal-date-block">
                    <strong>{formatKoreanDate(note.slug, { day: '2-digit' })}</strong>
                    <span>{formatKoreanDate(note.slug, { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" /> {formatKoreanDate(note.slug, { weekday: 'short' })}
                      {note.photoCount > 0 ? <span className="inline-flex items-center gap-1"><Camera className="size-3" /> {note.photoCount}</span> : null}
                    </div>
                    <p className="journal-note-preview">{note.preview}</p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
