import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '민수 브리핑',
  description: 'Tailscale 내부 전용 개인 브리핑 보드',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
