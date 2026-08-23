import { JournalEntryForm } from '@/components/journal-entry-form';
import { JournalLayout } from '@/components/journal-layout';
import { getTodayJournalSlug, normalizeJournalSlug } from '@/lib/journal';

export const dynamic = 'force-dynamic';

export default async function JournalWritePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const slug = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? normalizeJournalSlug(date) : getTodayJournalSlug();
  return <JournalLayout><section className="journal-reading-header"><p className="journal-eyebrow">WRITE</p><h1>{slug}</h1></section><section className="mx-auto max-w-3xl"><JournalEntryForm slug={slug} /></section></JournalLayout>;
}
