import { Camera, ImagePlus, PenLine, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function JournalEntryForm({ slug, compact = false }: { slug: string; compact?: boolean }) {
  return (
    <form
      action="/api/journal/append"
      method="post"
      encType="multipart/form-data"
      className={`journal-composer ${compact ? 'p-5' : 'p-6 md:p-8'}`}
    >
      <input type="hidden" name="slug" value={slug} />
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--journal-accent)/0.14)] text-[hsl(var(--journal-accent))]">
            <PenLine className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">오늘의 한 페이지</p>
            <p className="text-xs text-muted-foreground">완성하려 하지 않아도 괜찮아</p>
          </div>
        </div>
        <span className="journal-live-dot">지금</span>
      </div>

      <label className="block">
        <span className="sr-only">메모</span>
        <textarea
          name="text"
          rows={compact ? 6 : 9}
          autoFocus={!compact}
          placeholder="지금 머릿속에 남아 있는 장면이나 생각을 적어봐. 한 문장이어도 충분해."
          className="journal-textarea"
        />
      </label>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4">
        <label className="journal-photo-picker">
          <ImagePlus className="size-4" />
          <span>사진 추가</span>
          <input name="photos" type="file" accept="image/*" multiple className="sr-only" />
        </label>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted-foreground sm:block"><Camera className="mr-1 inline size-3.5" /> 여러 장 가능</p>
          <Button type="submit" className="journal-save-button"><Send className="size-3.5" /> 기록하기</Button>
        </div>
      </div>
    </form>
  );
}
