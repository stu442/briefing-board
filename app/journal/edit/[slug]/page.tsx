import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { JournalLayout } from '@/components/journal-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { normalizeJournalSlug, readJournalNote } from '@/lib/journal';

export const dynamic = 'force-dynamic';

export default async function JournalEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = normalizeJournalSlug(rawSlug);
  const note = readJournalNote(slug);
  if (!note) notFound();

  return <JournalLayout>
    <section className="journal-reading-header"><Link href={`/journal/${slug}`} className="journal-back-link"><ArrowLeft className="size-4" /> 기록 읽기로</Link><p className="journal-eyebrow mt-8">EDIT ENTRY</p><h1>{slug}</h1></section>
    <form action="/api/journal/save" method="post" className="mx-auto max-w-3xl journal-composer p-6 md:p-8">
      <input type="hidden" name="slug" value={slug} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="journal-section-label mb-2">MARKDOWN EDITOR</p><p className="text-sm text-muted-foreground">저장하면 Obsidian vault의 원본 일기 노트가 갱신돼.</p></div><button type="submit" className="journal-save-button">기록 저장</button></div>
      <MarkdownEditor name="content" initialValue={note.content} />
    </form>
  </JournalLayout>;
}
