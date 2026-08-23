'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { Bold, Code2, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markdownToEditableHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let list: string[] = [];
  let ordered = false;
  const flushList = () => {
    if (!list.length) return;
    html.push(`<${ordered ? 'ol' : 'ul'}>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`);
    list = [];
  };
  for (const line of lines) {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || numbered) {
      const nextOrdered = Boolean(numbered);
      if (list.length && ordered !== nextOrdered) flushList();
      ordered = nextOrdered;
      list.push((bullet || numbered)![1]);
      continue;
    }
    flushList();
    if (!line.trim()) continue;
    if (heading) html.push(`<h${heading[1].length}>${escapeHtml(heading[2])}</h${heading[1].length}>`);
    else if (line.startsWith('> ')) html.push(`<blockquote>${escapeHtml(line.slice(2))}</blockquote>`);
    else html.push(`<p>${escapeHtml(line)}</p>`);
  }
  flushList();
  return html.join('') || '<p><br></p>';
}

function nodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent?.trim() || '';
  if (!(node instanceof HTMLElement)) return '';
  const text = node.innerText.replace(/\n+$/g, '').trim();
  if (!text) return '';
  if (/^H[1-3]$/.test(node.tagName)) return `${'#'.repeat(Number(node.tagName.slice(1)))} ${text}`;
  if (node.tagName === 'BLOCKQUOTE') return `> ${text}`;
  if (node.tagName === 'UL') return Array.from(node.children).map((item) => `- ${(item as HTMLElement).innerText.trim()}`).join('\n');
  if (node.tagName === 'OL') return Array.from(node.children).map((item, index) => `${index + 1}. ${(item as HTMLElement).innerText.trim()}`).join('\n');
  return text;
}

function editorToMarkdown(editor: HTMLDivElement) {
  return Array.from(editor.childNodes).map(nodeToMarkdown).filter(Boolean).join('\n\n');
}

export function MarkdownEditor({ name, initialValue }: { name: string; initialValue: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(initialValue);

  const sync = () => {
    if (editorRef.current) setValue(editorToMarkdown(editorRef.current));
  };
  const command = (commandName: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(commandName, false, commandValue);
    sync();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== ' ') return;
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    const block = anchor?.parentElement?.closest('p,div');
    if (!block) return;
    const marker = block.textContent?.trim();
    const tag = marker === '#' ? 'h1' : marker === '##' ? 'h2' : marker === '###' ? 'h3' : null;
    if (!tag) return;
    event.preventDefault();
    const replacement = document.createElement(tag);
    replacement.innerHTML = '<br>';
    block.replaceWith(replacement);
    const range = document.createRange();
    range.selectNodeContents(replacement);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    sync();
  };

  return <div className="markdown-editor">
    <div className="markdown-editor-toolbar">
      <div className="flex items-center gap-1">
        <button type="button" title="제목 1" onMouseDown={(event) => event.preventDefault()} onClick={() => command('formatBlock', 'h1')}><Heading1 className="size-4" /></button>
        <button type="button" title="제목 2" onMouseDown={(event) => event.preventDefault()} onClick={() => command('formatBlock', 'h2')}><Heading2 className="size-4" /></button>
        <button type="button" title="굵게" onMouseDown={(event) => event.preventDefault()} onClick={() => command('bold')}><Bold className="size-4" /></button>
        <button type="button" title="글머리 목록" onMouseDown={(event) => event.preventDefault()} onClick={() => command('insertUnorderedList')}><List className="size-4" /></button>
        <button type="button" title="번호 목록" onMouseDown={(event) => event.preventDefault()} onClick={() => command('insertOrderedList')}><ListOrdered className="size-4" /></button>
        <button type="button" title="인용" onMouseDown={(event) => event.preventDefault()} onClick={() => command('formatBlock', 'blockquote')}><Quote className="size-4" /></button>
      </div>
      <span className="text-[11px] text-muted-foreground">`#` + Space로 제목</span>
    </div>
    <div ref={editorRef} className="markdown-live-editor" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" onInput={sync} onKeyDown={onKeyDown} dangerouslySetInnerHTML={{ __html: markdownToEditableHtml(initialValue) }} />
    <textarea className="markdown-mobile-fallback" value={value} onChange={(event) => setValue(event.target.value)} placeholder="여기에 바로 써도 저장돼. 제목은 # 제목처럼 작성해줘." rows={14} />
    <input type="hidden" name={name} value={value} />
    <p className="mt-3 text-xs text-muted-foreground">Obsidian처럼 한 화면에서 바로 서식이 적용돼. 제목, 굵게, 목록, 인용을 지원해.</p>
  </div>;
}
