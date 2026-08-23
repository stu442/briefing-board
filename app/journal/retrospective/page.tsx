import Link from 'next/link';
import { CalendarRange, CheckCircle2, FileText, Plus } from 'lucide-react';

import { JournalContent } from '@/components/journal-content';
import { JournalLayout } from '@/components/journal-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { parseJournalContent } from '@/lib/journal';
import { getCurrentWeeklyRetrospectiveName, getWeeklyRetrospectiveTemplate, listRetrospectiveNotes, readRetrospectiveNote } from '@/lib/retrospective';

export const dynamic = 'force-dynamic';

export default async function RetrospectivePage({ searchParams }: { searchParams: Promise<{ note?: string; saved?: string; error?: string; fresh?: string }> }) {
  const params = await searchParams;
  const defaultName = getCurrentWeeklyRetrospectiveName();
  const notes = listRetrospectiveNotes();
  const selected = params.fresh === '1'
    ? { name: defaultName, content: getWeeklyRetrospectiveTemplate(), updatedAt: '' }
    : (params.note ? readRetrospectiveNote(params.note) : null) || notes[0] || { name: defaultName, content: getWeeklyRetrospectiveTemplate(), updatedAt: '' };

  return <JournalLayout>
    <section className="journal-reading-header">
      <p className="journal-eyebrow"><CalendarRange className="size-3.5" /> RETROSPECTIVE</p>
      <h1>회고</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">일간 기록과 분리된 주간·월간 회고를 Obsidian vault의 Markdown 파일로 바로 읽고, 고치고, 저장해.</p>
    </section>

    {params.saved === '1' ? <p className="journal-feedback"><CheckCircle2 className="size-4" /> Obsidian vault에 저장했어. 상단 동기화로 Git 백업까지 할 수 있어.</p> : null}
    {params.error ? <p className="journal-feedback is-error">저장하지 못했어. 제목과 내용을 다시 확인해줘.</p> : null}

    <section className="retrospective-grid">
      <aside className="retrospective-list">
        <div className="mb-4 flex items-center justify-between">
          <p className="journal-section-label">VAULT NOTES</p>
          <Link href="/journal/retrospective?fresh=1" className="retrospective-new"><Plus className="size-3.5" /> 이번 주</Link>
        </div>
        <div className="space-y-2">
          {notes.map((note) => <Link key={note.name} href={`/journal/retrospective?note=${encodeURIComponent(note.name)}`} className={`retrospective-note-link ${note.name === selected.name ? 'is-active' : ''}`}>
            <FileText className="mt-0.5 size-4 shrink-0" />
            <span><strong>{note.name.replace(/\.md$/, '')}</strong><small>수정 {note.updatedAt}</small></span>
          </Link>)}
          {!notes.length ? <p className="journal-empty-state">아직 회고 노트가 없어. 이번 주 첫 회고를 시작해봐.</p> : null}
        </div>
      </aside>

      <div className="space-y-8">
        <article className="journal-reading-card retrospective-reading">
          <p className="journal-section-label mb-5">READING · {selected.name.replace(/\.md$/, '')}</p>
          <JournalContent blocks={parseJournalContent(selected.content)} />
        </article>

        <form action="/api/journal/retrospective" method="post" className="journal-composer p-6 md:p-8">
          <input type="hidden" name="note" value={selected.name} />
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="journal-section-label mb-2">MARKDOWN EDITOR</p><h2 className="text-xl font-semibold tracking-[-0.04em]">{selected.name.replace(/\.md$/, '')}</h2></div>
            <button type="submit" className="journal-save-button">회고 저장</button>
          </div>
          <MarkdownEditor name="content" initialValue={selected.content} />
        </form>
      </div>
    </section>
  </JournalLayout>;
}
