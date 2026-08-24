import { ImageIcon } from 'lucide-react';

import type { JournalBlock } from '@/lib/journal';

export function JournalContent({ blocks }: { blocks: JournalBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.level === 1) return <h1 key={index} className="text-2xl font-semibold tracking-tight text-foreground">{block.text}</h1>;
          if (block.level === 2) return <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground">{block.text}</h2>;
          return <h3 key={index} className="text-lg font-semibold tracking-tight text-foreground">{block.text}</h3>;
        }

        if (block.type === 'list') {
          return (
            <ul key={index} className="space-y-2 pl-5 text-sm leading-6 text-foreground/90">
              {block.items?.map((item, itemIndex) => (
                <li key={itemIndex} className="list-disc">{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'horizontalRule') {
          return <hr key={index} className="my-8 border-0 border-t border-border/80" />;
        }

        if (block.type === 'image') {
          return (
            <figure key={index} className="overflow-hidden rounded-2xl border border-border/70 bg-background/40">
              <img src={block.src} alt={block.alt} className="max-h-[560px] w-full bg-black object-contain" />
              <figcaption className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
                <ImageIcon className="size-3.5" /> {block.originalPath}
              </figcaption>
            </figure>
          );
        }

        return <p key={index} className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{block.text}</p>;
      })}
    </div>
  );
}
