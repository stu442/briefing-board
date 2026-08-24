'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Font = 'sans' | 'serif' | 'mono';
type TextSize = 'small' | 'default' | 'large';
type Leading = 'compact' | 'default' | 'relaxed';

type JournalSettings = { font: Font; textSize: TextSize; leading: Leading };

const defaults: JournalSettings = { font: 'sans', textSize: 'default', leading: 'default' };
const SettingsContext = createContext<{ settings: JournalSettings; update: (patch: Partial<JournalSettings>) => void }>({ settings: defaults, update: () => {} });

export function JournalSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    const saved = window.localStorage.getItem('aurel-reading-settings');
    if (saved) setSettings({ ...defaults, ...JSON.parse(saved) });
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.journalFont = settings.font;
    root.dataset.journalSize = settings.textSize;
    root.dataset.journalLeading = settings.leading;
    window.localStorage.setItem('aurel-reading-settings', JSON.stringify(settings));
  }, [settings]);
  return <SettingsContext.Provider value={{ settings, update: (patch) => setSettings((current) => ({ ...current, ...patch })) }}>{children}</SettingsContext.Provider>;
}

export function useJournalSettings() {
  return useContext(SettingsContext);
}
