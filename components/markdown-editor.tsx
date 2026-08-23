'use client';

import { useState, type ReactNode } from 'react';
import { Bold, Code2, Heading2, List, PencilLine, Eye } from 'lucide-react';

function insertAtCursor(textarea: HTMLTextAreaElement, before: string, after = '') {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || '텍스트';
  textarea.setRangeText(`${before}${selected}${after}`, start, end, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.focus();
}

function MarkdownPreview({ value }: { value: string }) {
  const lines = value.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(<ul key={`list-${blocks.length}`} className="space-y-1 pl-5">{list.map((item, index) => <li className="list-disc" key={index}>{item}</li>)}</ul>);
    list = [];
  };
  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const item = line.match(/^[-*]\s+(.+)$/);
    if (!line.trim()) { flushList(); continue; }
    if (item) { list.push(item[1]); continue; }
    flushList();
    if (heading) {
      const Tag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3';
      blocks.push(<Tag key={`heading-${blocks.length}`}>{heading[2]}</Tag>);
    } else if (line.startsWith('> ')) {
      blocks.push(<blockquote key={`quote-${blocks.length}`}>{line.slice(2)}</blockquote>);
    } else {
      blocks.push(<p key={`paragraph-${blocks.length}`}>{line}</p>);
    }
  }
  flushList();
  return <div className="markdown-rendered-preview">{blocks.length ? blocks : '아직 쓴 내용이 없어.'}</div>;
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
    {mode === 'write' ? <textarea name={name} value={value} onChange={(event) => setValue(event.target.value)} className="markdown-editor-input" rows={22} spellCheck="true" /> : <MarkdownPreview value={value} />}
    {mode === 'preview' ? <input type="hidden" name={name} value={value} /> : null}
    <p className="mt-3 text-xs text-muted-foreground">Markdown 지원 · <code>## 제목</code> · <code>- 목록</code> · <code>**굵게**</code> · <code>&gt; 인용</code></p>
  </div>;
}
