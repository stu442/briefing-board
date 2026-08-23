import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { JournalEntryForm } from '@/components/journal-entry-form';
import { getTodayJournalSlug, normalizeJournalSlug } from '@/lib/journal';

export const dynamic = 'force-dynamic';

export default async function JournalWritePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const slug = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? normalizeJournalSlug(date) : getTodayJournalSlug();
  return <main className="journal-shell"><header className="journal-nav"><Link href="/journal" className="journal-back-link"><ArrowLeft className="size-4" /> 캘린더</Link><Link href="/journal/retrospective" className="journal-nav-link">회고</Link></header><section className="journal-reading-header"><p className="journal-eyebrow">WRITE</p><h1>{slug}</h1></section><section className="mx-auto max-w-3xl"><JournalEntryForm slug={slug} /></section></main>;
}
