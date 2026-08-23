import { NextResponse } from 'next/server';

import { getJournalGitStatus, pullJournalVault, pushJournalVault } from '@/lib/journal-git';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getJournalGitStatus());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Git 상태를 읽지 못했어.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action;
    if (action !== 'pull' && action !== 'push') {
      return NextResponse.json({ error: '지원하지 않는 동기화 요청이야.' }, { status: 400 });
    }

    const status = action === 'pull' ? await pullJournalVault() : await pushJournalVault();
    return NextResponse.json({ status, message: action === 'pull' ? 'GitHub의 최신 기록을 가져왔어.' : '저널을 GitHub에 백업했어.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '동기화에 실패했어.' }, { status: 409 });
  }
}
