import type { Metadata } from 'next';
import Link from 'next/link';
import { fontVars } from '@/lib/fonts';
import './globals.css';

const demo = process.env.DEMO_MODE === 'true';

export const metadata: Metadata = {
  title: 'Vietnam Enterprise Culture Atlas',
  description: 'Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.',
  ...(demo ? { robots: { index: false, follow: false } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={fontVars}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-[10] border-b border-hairline bg-canvas-white">
          <nav className="mx-auto flex h-topbar w-full max-w-standard items-center gap-6 px-4 md:px-6">
            <Link href="/" className="font-display text-heading-md text-primary">
              Culture Atlas
            </Link>
            <Link href="/companies" className="text-body-md font-semibold text-ink hover:text-primary">
              Doanh nghiệp
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-standard flex-1 px-4 py-8 md:px-6 md:py-12">{children}</main>
        <footer className="bg-surface-dark py-4 text-caption text-on-dark-mute">
          <div className="mx-auto w-full max-w-standard px-4 md:px-6">Vietnam Enterprise Culture Atlas · Nội dung do doanh nghiệp tự công bố</div>
        </footer>
      </body>
    </html>
  );
}
