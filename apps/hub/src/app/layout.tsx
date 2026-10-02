import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const body = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-body' });

export const metadata: Metadata = { title: 'NexTure Culture Hub', robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={body.variable} style={{ ['--font-heading' as string]: 'var(--font-body)' }}>
      <body>{children}</body>
    </html>
  );
}
