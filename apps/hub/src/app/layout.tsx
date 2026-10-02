import type { Metadata } from 'next';
import { fontVars } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = { title: 'NexTure Culture Hub', robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
