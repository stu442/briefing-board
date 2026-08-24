'use client';

import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

export function JournalPhotoPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState(0);
  return <>
    <button type="button" className="journal-photo-picker" onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" /><span>{count ? `사진 ${count}장 선택됨` : '사진 추가'}</span></button>
    <input ref={inputRef} name="photos" type="file" accept="image/*" multiple className="sr-only" onChange={(event) => setCount(event.currentTarget.files?.length || 0)} />
  </>;
}
