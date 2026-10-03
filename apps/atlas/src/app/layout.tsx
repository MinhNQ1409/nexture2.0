import type { Metadata } from 'next';
import Link from 'next/link';
import { Map as MapIcon, Search } from 'lucide-react';
import { fontVars } from '@/lib/fonts';
import { getT } from '@/lib/i18n';
import { LangSwitch } from './lang-switch';
import { NavLink } from './nav-link';
import { BrandLockup } from './brand';
import { SITE_NAME, SITE_URL, VERIFICATION } from '@/lib/site';
import './globals.css';

const demo = process.env.DEMO_MODE === 'true';

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: 'NexTure Culture Atlas · Văn hóa doanh nghiệp Việt Nam', template: '%s' },
    description: `NexTure: ${t.siteDesc}`,
    applicationName: 'NexTure',
    keywords: ['NexTure', 'NexTure Culture Atlas', 'NexTure Hub', 'văn hóa doanh nghiệp', 'enterprise culture', 'Vietnam'],
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'vi_VN', images: [{ url: '/brand/nexture-logo.png', width: 1309, height: 605, alt: 'NexTure' }] },
    twitter: { card: 'summary' },
    verification: { google: VERIFICATION.google, other: VERIFICATION.bing ? { 'msvalidate.01': VERIFICATION.bing } : undefined },
    ...(demo ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await getT();
  return (
    <html lang={lang} className={fontVars}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-[1100] border-b border-hairline bg-canvas-white">
          <nav className="mx-auto flex h-topbar w-full max-w-standard items-center gap-4 px-4 md:gap-6 md:px-6">
            <Link href="/" aria-label="NexTure Culture Atlas" className="shrink-0">
              <BrandLockup sub="Culture Atlas" hideText="hidden sm:block" />
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
        <footer className="bg-surface-dark py-8 text-caption text-on-dark-mute">
          <div className="mx-auto flex w-full max-w-standard flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between md:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/nexture-logo-light.png" alt="Executive NexTure" width={130} height={60} className="h-[60px] w-auto" />
            <p>{t.footer}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
