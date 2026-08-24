import { LockKeyhole } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  return <main className="journal-shell flex min-h-screen items-center justify-center"><section className="aurel-login-card"><p className="journal-eyebrow"><LockKeyhole className="size-3.5" /> PRIVATE JOURNAL</p><h1>aurel<span>.</span></h1><p>비밀번호를 입력하면 개인 기록을 열 수 있어.</p><form action="/api/auth/login" method="post"><input type="hidden" name="next" value={next || '/journal'} /><label htmlFor="password">비밀번호</label><input id="password" name="password" type="password" inputMode="numeric" autoComplete="current-password" autoFocus required /><button type="submit" className="journal-save-button">들어가기</button>{error === 'invalid' ? <p className="aurel-login-error">비밀번호가 맞지 않아.</p> : null}</form></section></main>;
}
