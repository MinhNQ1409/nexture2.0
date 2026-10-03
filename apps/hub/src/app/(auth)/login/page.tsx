import { LoginForm } from './form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NexTure Hub · Đăng nhập Digital Culture Hub',
  description: 'NexTure Hub (Digital Culture Hub): nền tảng giúp doanh nghiệp Việt Nam lưu giữ, quản lý và lan tỏa văn hóa doanh nghiệp. Đăng ký miễn phí.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/login' },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const sp = await searchParams;
  return <LoginForm next={sp.next} justReset={sp.reset === '1'} />;
}
