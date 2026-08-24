'use client';

import { Check, RotateCcw } from 'lucide-react';
import { useJournalSettings } from '@/components/journal-settings-provider';

const options = {
  font: [['sans', '기본'], ['serif', '명조'], ['mono', '고정폭']],
  textSize: [['small', '작게'], ['default', '보통'], ['large', '크게']],
  leading: [['compact', '촘촘하게'], ['default', '보통'], ['relaxed', '여유롭게']],
} as const;

export function JournalSettingsPanel() {
  const { settings, update } = useJournalSettings();
  return <section className="journal-settings-card">
    <SettingGroup label="글꼴" options={options.font} value={settings.font} onChange={(font) => update({ font })} />
    <SettingGroup label="글자 크기" options={options.textSize} value={settings.textSize} onChange={(textSize) => update({ textSize })} />
    <SettingGroup label="줄 간격" options={options.leading} value={settings.leading} onChange={(leading) => update({ leading })} />
    <div className="mt-8 border-t border-border/60 pt-5"><button type="button" className="retrospective-cancel-button" onClick={() => update({ font: 'sans', textSize: 'default', leading: 'default' })}><RotateCcw className="size-4" /> 기본값으로</button></div>
  </section>;
}

function SettingGroup<T extends string>({ label, options: values, value, onChange }: { label: string; options: readonly (readonly [T, string])[]; value: T; onChange: (value: T) => void }) {
  return <div className="journal-setting-group"><h2>{label}</h2><div className="journal-setting-options">{values.map(([key, label]) => <button key={key} type="button" className={value === key ? 'is-active' : ''} onClick={() => onChange(key)}>{label}{value === key ? <Check className="size-4" /> : null}</button>)}</div></div>;
}
