import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { JournalSettingsProvider } from '@/components/journal-settings-provider';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '민수 보드',
  description: 'Tailscale 내부 전용 개인 브리핑 + 저널 보드',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}><JournalSettingsProvider>{children}</JournalSettingsProvider></body>
    </html>
  );
}
