'use client';

import { useState } from 'react';
import { Bold, Code2, Heading2, List, PencilLine, Eye } from 'lucide-react';

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after = '') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || '텍스트';
  textarea.setRangeText(`${before}${selected}${after}`, start, end, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

export function MarkdownEditor({ name, initialValue }: { name: string; initialValue: string }) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [value, setValue] = useState(initialValue);

  return <div className="markdown-editor">
    <div className="markdown-editor-toolbar">
      <div className="flex items-center gap-1">
        <button type="button" title="제목" onClick={(event) => insertAtCursor(event.currentTarget.closest('.markdown-editor')!.querySelector('textarea')!, '## ')}><Heading2 className="size-4" /></button>
        <button type="button" title="굵게" onClick={(event) => insertAtCursor(event.currentTarget.closest('.markdown-editor')!.querySelector('textarea')!, '**', '**')}><Bold className="size-4" /></button>
        <button type="button" title="목록" onClick={(event) => insertAtCursor(event.currentTarget.closest('.markdown-editor')!.querySelector('textarea')!, '- ')}><List className="size-4" /></button>
        <button type="button" title="인용" onClick={(event) => insertAtCursor(event.currentTarget.closest('.markdown-editor')!.querySelector('textarea')!, '> ')}><Code2 className="size-4" /></button>
      </div>
      <div className="markdown-mode-switch" aria-label="에디터 보기 모드">
        <button type="button" className={mode === 'write' ? 'is-active' : ''} onClick={() => setMode('write')}><PencilLine className="size-3.5" /> 작성</button>
        <button type="button" className={mode === 'preview' ? 'is-active' : ''} onClick={() => setMode('preview')}><Eye className="size-3.5" /> 미리보기</button>
      </div>
    </div>
    {mode === 'write' ? <textarea name={name} value={value} onChange={(event) => setValue(event.target.value)} className="markdown-editor-input" rows={22} spellCheck="true" /> : <pre className="markdown-editor-preview">{value || '아직 쓴 내용이 없어.'}</pre>}
    {mode === 'preview' ? <input type="hidden" name={name} value={value} /> : null}
    <p className="mt-3 text-xs text-muted-foreground">Markdown 지원 · <code>## 제목</code> · <code>- 목록</code> · <code>**굵게**</code> · <code>&gt; 인용</code></p>
  </div>;
}
