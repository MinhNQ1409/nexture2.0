import { SignupForm } from './form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NexTure Hub · Đăng ký Digital Culture Hub',
  description: 'NexTure Hub (Digital Culture Hub): nền tảng giúp doanh nghiệp Việt Nam lưu giữ, quản lý và lan tỏa văn hóa doanh nghiệp. Đăng ký miễn phí.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/signup' },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <SignupForm next={(await searchParams).next} />;
}
