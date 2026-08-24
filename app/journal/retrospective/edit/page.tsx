import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { JournalLayout } from '@/components/journal-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { getCurrentWeeklyRetrospectiveName, getWeeklyRetrospectiveTemplate, readRetrospectiveNote } from '@/lib/retrospective';

export const dynamic = 'force-dynamic';

export default async function RetrospectiveEditPage({ searchParams }: { searchParams: Promise<{ note?: string }> }) {
  const { note: rawNote } = await searchParams;
  const defaultName = getCurrentWeeklyRetrospectiveName();
  const note = rawNote ? readRetrospectiveNote(rawNote) : null;
  if (rawNote && !note) notFound();
  const current = note || { name: defaultName, content: getWeeklyRetrospectiveTemplate() };

  return <JournalLayout>
    <section className="journal-reading-header"><Link href={`/journal/retrospective?note=${encodeURIComponent(current.name)}`} className="journal-back-link"><ArrowLeft className="size-4" /> 회고 읽기로</Link><p className="journal-eyebrow mt-8">EDIT RETROSPECTIVE</p><h1>{current.name.replace(/\.md$/, '')}</h1></section>
    <form action="/api/journal/retrospective" method="post" className="mx-auto max-w-3xl journal-composer p-6 md:p-8">
      <input type="hidden" name="note" value={current.name} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="journal-section-label">MARKDOWN EDITOR</p><button type="submit" className="journal-save-button">회고 저장</button></div>
      <MarkdownEditor name="content" initialValue={current.content} />
    </form>
  </JournalLayout>;
}
