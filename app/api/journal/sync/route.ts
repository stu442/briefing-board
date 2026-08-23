import { NextResponse } from 'next/server';

import { getJournalGitStatus, syncJournalVault } from '@/lib/journal-git';

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
    if (body?.action !== 'sync') {
      return NextResponse.json({ error: '지원하지 않는 동기화 요청이야.' }, { status: 400 });
    }

    const status = await syncJournalVault();
    return NextResponse.json({ status, message: 'GitHub에서 최신 기록을 가져오고, 이 기기의 변경도 백업했어.' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '동기화에 실패했어.' }, { status: 409 });
  }
}
