import Link from 'next/link';
import { ArrowLeft, BookOpen, PenLine } from 'lucide-react';

export default function NotFound() {
  return <main className="journal-shell flex min-h-screen items-center justify-center">
    <section className="journal-not-found">
      <p className="journal-eyebrow"><BookOpen className="size-3.5" /> AUREL</p>
      <p className="journal-not-found-code">404</p>
      <h1>아직 기록이 없는 날이야.</h1>
      <p>사라진 게 아니라, 아직 빈 페이지인 거야. 오늘의 첫 문장을 남겨볼까?</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/journal/write" className="journal-save-button"><PenLine className="size-4" /> 오늘 기록하기</Link>
        <Link href="/journal" className="retrospective-edit-button"><ArrowLeft className="size-4" /> 캘린더로</Link>
      </div>
    </section>
  </main>;
}
