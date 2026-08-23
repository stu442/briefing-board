import Link from 'next/link';
import type { ReactNode } from 'react';

import { JournalSyncControls } from '@/components/journal-sync-controls';

export function JournalHeader() {
  return <header className="journal-nav"><Link href="/journal" className="journal-wordmark">aurel<span>.</span></Link><nav className="flex items-center gap-1 sm:gap-2" aria-label="저널 메뉴"><Link href="/journal" className="journal-nav-link">캘린더</Link><Link href="/journal/write" className="journal-nav-link">글쓰기</Link><Link href="/journal/retrospective" className="journal-nav-link">회고</Link><JournalSyncControls /></nav></header>;
}

export function JournalLayout({ children }: { children: ReactNode }) {
  return <main className="journal-shell"><JournalHeader />{children}</main>;
}
