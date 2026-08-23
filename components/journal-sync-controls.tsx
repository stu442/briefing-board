'use client';

import { useEffect, useState } from 'react';
import { Cloud, LoaderCircle, RefreshCw } from 'lucide-react';

type SyncStatus = { clean: boolean; ahead: number; behind: number; branch: string; remote: string };

export function JournalSyncControls() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function loadStatus() {
    const response = await fetch('/api/journal/sync', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '동기화 상태를 읽지 못했어.');
    setStatus(data);
  }

  useEffect(() => { loadStatus().catch((error) => setMessage(error instanceof Error ? error.message : '동기화 상태를 읽지 못했어.')); }, []);

  async function sync() {
    setPending(true); setMessage('');
    try {
      const response = await fetch('/api/journal/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sync' }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '동기화에 실패했어.');
      setStatus(data.status); setMessage(data.message); window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '동기화에 실패했어.');
    } finally { setPending(false); }
  }

  const stateLabel = !status ? 'Git 확인 중' : !status.clean || status.behind > 0 || status.ahead > 0 ? '동기화 필요' : '동기화됨';
  return <div className="journal-sync"><span className={`journal-sync-state ${status?.clean ? 'is-clean' : ''}`}><Cloud className="size-3" /> {stateLabel}</span><button type="button" className="journal-sync-button" onClick={sync} disabled={pending} title="GitHub에서 가져오고 이 기기의 모든 변경을 커밋·백업"><>{pending ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} 동기화</></button>{message ? <p className="journal-sync-message">{message}</p> : null}</div>;
}
