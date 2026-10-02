import type { Metadata } from 'next';
import Link from 'next/link';
import { Map as MapIcon, Search } from 'lucide-react';
import { fontVars } from '@/lib/fonts';
import { getT } from '@/lib/i18n';
import { LangSwitch } from './lang-switch';
import { NavLink } from './nav-link';
import './globals.css';

const demo = process.env.DEMO_MODE === 'true';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: 'Vietnam Enterprise Culture Atlas',
    description: t.siteDesc,
    ...(demo ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getT();
  return (
    <html lang={lang} className={fontVars}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-[1100] border-b border-hairline bg-canvas-white/95 backdrop-blur">
          <nav className="mx-auto flex h-topbar w-full max-w-standard items-center gap-4 px-4 md:gap-6 md:px-6">
            <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-heading-md text-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/nexture-mark.png" alt="" width={30} height={22} />
              <span className="hidden sm:inline">Culture Atlas</span>
            </Link>
            <NavLink href="/companies">{t.navCompanies}</NavLink>
            <NavLink href="/map">
              <MapIcon size={18} strokeWidth={1.5} aria-hidden className="hidden sm:inline" />
              {t.navMap}
            </NavLink>
            <NavLink href="/search" className="ml-auto">
              <Search size={18} strokeWidth={1.5} aria-hidden />
              <span className="hidden sm:inline">{t.navSearch}</span>
            </NavLink>
            <LangSwitch to={lang === 'en' ? 'vi' : 'en'} label={lang === 'en' ? 'VI' : 'EN'} title={t.switchLabel} />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-standard flex-1 px-4 py-8 md:px-6 md:py-12">{children}</main>
        <footer className="bg-surface-dark py-4 text-caption text-on-dark-mute">
          <div className="mx-auto w-full max-w-standard px-4 md:px-6">{t.footer}</div>
        </footer>
      </body>
    </html>
  );
}
