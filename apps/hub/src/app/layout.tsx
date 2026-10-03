import type { Metadata } from 'next';
import { fontVars } from '@/lib/fonts';
import './globals.css';

const HUB_URL = (process.env.HUB_BASE_URL ?? 'https://nexture-hub.vercel.app').replace(/\/$/, '');

// Private workspace: nothing is indexed except the sign-in and sign-up pages, which opt back in.
export const metadata: Metadata = {
  metadataBase: new URL(HUB_URL),
  title: 'NexTure Hub',
  applicationName: 'NexTure Hub',
  robots: { index: false, follow: false },
  openGraph: { type: 'website', siteName: 'NexTure Hub', locale: 'vi_VN', images: [{ url: '/brand/nexture-logo.png', width: 1309, height: 605, alt: 'NexTure' }] },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
