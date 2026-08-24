import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { JournalLayout } from '@/components/journal-layout';
import { JournalPhotoPicker } from '@/components/journal-photo-picker';
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
    <form action="/api/journal/save" method="post" encType="multipart/form-data" className="mx-auto max-w-3xl journal-composer p-6 md:p-8">
      <input type="hidden" name="slug" value={slug} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><p className="journal-section-label">MARKDOWN EDITOR</p><div className="flex items-center gap-3"><JournalPhotoPicker /><button type="submit" className="journal-save-button">기록 저장</button></div></div>
      <MarkdownEditor name="content" initialValue={note.content} />
    </form>
  </JournalLayout>;
}
