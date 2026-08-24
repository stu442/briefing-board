import { SlidersHorizontal } from 'lucide-react';

import { JournalLayout } from '@/components/journal-layout';
import { JournalSettingsPanel } from '@/components/journal-settings-panel';

export default function JournalSettingsPage() {
  return <JournalLayout><section className="journal-reading-header"><p className="journal-eyebrow"><SlidersHorizontal className="size-3.5" /> SETTINGS</p><h1>읽기 설정</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">글을 쓰고 읽을 때의 글꼴, 글자 크기, 줄 간격을 내 취향에 맞게 조정해.</p></section><JournalSettingsPanel /></JournalLayout>;
}
