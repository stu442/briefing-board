'use client';

import { useEffect, useState } from 'react';
import { Cloud, Download, LoaderCircle, Upload } from 'lucide-react';

type SyncStatus = {
  clean: boolean;
  ahead: number;
  behind: number;
  branch: string;
  remote: string;
};

export function JournalSyncControls() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<'pull' | 'push' | null>(null);

  async function loadStatus() {
    const response = await fetch('/api/journal/sync', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '동기화 상태를 읽지 못했어.');
    setStatus(data);
  }

  useEffect(() => {
    loadStatus().catch((error) => setMessage(error instanceof Error ? error.message : '동기화 상태를 읽지 못했어.'));
  }, []);

  async function sync(action: 'pull' | 'push') {
    setPending(action);
    setMessage('');
    try {
      const response = await fetch('/api/journal/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '동기화에 실패했어.');
      setStatus(data.status);
      setMessage(data.message);
      if (action === 'pull') window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '동기화에 실패했어.');
    } finally {
      setPending(null);
    }
  }

  const stateLabel = !status ? 'Git 확인 중' : !status.clean ? '백업 필요' : status.behind > 0 ? `가져올 기록 ${status.behind}` : status.ahead > 0 ? `올릴 커밋 ${status.ahead}` : '동기화됨';

  return (
    <div className="journal-sync">
      <span className={`journal-sync-state ${status?.clean ? 'is-clean' : ''}`}><Cloud className="size-3" /> {stateLabel}</span>
      <div className="flex items-center gap-1">
        <button type="button" className="journal-sync-button" onClick={() => sync('pull')} disabled={pending !== null} title="GitHub의 최신 기록 가져오기">
          {pending === 'pull' ? <LoaderCircle className="size-3.5 animate-spin" /> : <Download className="size-3.5" />} Pull
        </button>
        <button type="button" className="journal-sync-button" onClick={() => sync('push')} disabled={pending !== null} title="현재 저널을 GitHub에 백업하기">
          {pending === 'push' ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Push
        </button>
      </div>
      {message ? <p className="journal-sync-message">{message}</p> : null}
    </div>
  );
}
