import Link from 'next/link';
import { CalendarDays, Camera, Clock3, PencilLine } from 'lucide-react';
import { notFound } from 'next/navigation';

import { JournalContent } from '@/components/journal-content';
import { JournalLayout } from '@/components/journal-layout';
import { normalizeJournalSlug, parseJournalContent, readJournalNote } from '@/lib/journal';

export const dynamic = 'force-dynamic';

export default async function JournalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = readJournalNote(normalizeJournalSlug(slug));

  if (!note) notFound();

  return (
    <JournalLayout>
      <section className="journal-reading-header">
        <p className="journal-eyebrow"><CalendarDays className="size-3.5" /> {note.slug}</p>
        <h1>그날의 기록.</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" /> 마지막 수정 {note.updatedAt}</span>
          {note.photoCount > 0 ? <span className="inline-flex items-center gap-1.5"><Camera className="size-3.5" /> 사진 {note.photoCount}장</span> : null}
        </div>
      </section>

      <section className="journal-reading-grid">
        <article className="journal-reading-card">
          <JournalContent blocks={parseJournalContent(note.content)} />
        </article>
        <aside className="journal-reading-aside">
          <Link href={`/journal/edit/${note.slug}`} className="retrospective-edit-button"><PencilLine className="size-4" /> 수정하기</Link>
        </aside>
      </section>
    </JournalLayout>
  );
}
