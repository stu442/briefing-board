'use client';

import { useState, type ReactNode } from 'react';
import { CalendarDays, List } from 'lucide-react';

export function JournalViewSwitcher({ calendar, timeline }: { calendar: ReactNode; timeline: ReactNode }) {
  const [view, setView] = useState<'calendar' | 'timeline'>('calendar');
  return <section className="mt-6"><div className="mb-5 inline-flex rounded-xl border border-border/70 bg-card p-1"><button type="button" onClick={() => setView('calendar')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium ${view === 'calendar' ? 'bg-[hsl(var(--journal-accent))] text-white' : 'text-muted-foreground'}`}><CalendarDays className="size-4" /> 캘린더</button><button type="button" onClick={() => setView('timeline')} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium ${view === 'timeline' ? 'bg-[hsl(var(--journal-accent))] text-white' : 'text-muted-foreground'}`}><List className="size-4" /> 지난 기록</button></div>{view === 'calendar' ? calendar : timeline}</section>;
}
