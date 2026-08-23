'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Heading1, Heading2, List, ListOrdered, Quote } from 'lucide-react';

type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; text?: string };

function markdownToDocument(markdown: string) {
  const content: Node[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let list: Node[] = [];
  let listType: 'bulletList' | 'orderedList' = 'bulletList';
  const flushList = () => {
    if (!list.length) return;
    content.push({ type: listType, content: list });
    list = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      const nextType = ordered ? 'orderedList' : 'bulletList';
      if (list.length && listType !== nextType) flushList();
      listType = nextType;
      list.push({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: (bullet || ordered)![1] }] }] });
      continue;
    }
    flushList();
    if (!line) continue;
    if (heading) content.push({ type: 'heading', attrs: { level: heading[1].length }, content: [{ type: 'text', text: heading[2] }] });
    else if (line.startsWith('> ')) content.push({ type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: line.slice(2) }] }] });
    else content.push({ type: 'paragraph', content: [{ type: 'text', text: line }] });
  }
  flushList();
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

function nodeText(node: Node): string {
  if (node.type === 'text') return node.text || '';
  return (node.content || []).map(nodeText).join(node.type === 'hardBreak' ? '\n' : '');
}

function documentToMarkdown(nodes: Node[] = []): string {
  return nodes.map((node) => {
    if (node.type === 'heading') return `${'#'.repeat(Number(node.attrs?.level || 1))} ${nodeText(node)}`;
    if (node.type === 'blockquote') return `> ${documentToMarkdown(node.content).replace(/\n/g, '\n> ')}`;
    if (node.type === 'bulletList') return (node.content || []).map((item) => `- ${nodeText(item)}`).join('\n');
    if (node.type === 'orderedList') return (node.content || []).map((item, index) => `${index + 1}. ${nodeText(item)}`).join('\n');
    return nodeText(node);
  }).filter(Boolean).join('\n\n');
}

export function MarkdownEditor({ name, initialValue }: { name: string; initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: markdownToDocument(initialValue),
    editorProps: { attributes: { class: 'tiptap-journal-editor', 'aria-label': '기록 작성' } },
    onUpdate: ({ editor }) => setValue(documentToMarkdown(editor.getJSON().content as Node[])),
  });

  useEffect(() => {
    if (editor) editor.commands.setContent(markdownToDocument(initialValue), { emitUpdate: false });
  }, [editor, initialValue]);

  if (!editor) return null;
  const button = (title: string, active: boolean, action: () => void, icon: ReactNode) => <button type="button" title={title} className={active ? 'is-active' : ''} onMouseDown={(event) => event.preventDefault()} onClick={action}>{icon}</button>;

  return <div className="markdown-editor">
    <div className="markdown-editor-toolbar">
      <div className="flex items-center gap-1">
        {button('제목 1', editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 className="size-4" />)}
        {button('제목 2', editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="size-4" />)}
        {button('굵게', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="size-4" />)}
        {button('글머리 목록', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="size-4" />)}
        {button('번호 목록', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="size-4" />)}
        {button('인용', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="size-4" />)}
      </div>
    </div>
    <EditorContent editor={editor} />
    <input type="hidden" name={name} value={value} />
  </div>;
}
