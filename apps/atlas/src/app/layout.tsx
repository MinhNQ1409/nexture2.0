import type { Metadata } from 'next';
import Link from 'next/link';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const body = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-body' });
const demo = process.env.DEMO_MODE === 'true';

export const metadata: Metadata = {
  title: 'Vietnam Enterprise Culture Atlas',
  description: 'Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.',
  ...(demo ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={body.variable} style={{ ['--font-heading' as string]: 'var(--font-body)' }}>
      <body>
        <header className="border-b border-border bg-surface">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
            <Link href="/" className="font-display text-lg font-semibold text-brand">
              Culture Atlas
            </Link>
            <Link href="/companies" className="text-sm">
              Doanh nghiệp
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
