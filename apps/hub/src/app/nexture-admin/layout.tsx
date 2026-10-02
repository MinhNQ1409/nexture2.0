// NexTure internal area (06 §15): its own dark top bar; 404 for anyone who is not NEXTURE_ADMIN.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requirePageCtx } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requirePageCtx('/nexture-admin');
  if (ctx.actor.platformRole !== 'NEXTURE_ADMIN') notFound();
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[10] bg-surface-dark text-on-dark">
        <div className="mx-auto flex h-topbar w-full max-w-standard items-center gap-4 px-4 md:px-6">
          <Link href="/nexture-admin" className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-md bg-canvas-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/nexture-mark.png" alt="" width={26} height={19} />
            </span>
            <span className="font-display text-heading-sm">NexTure · Quản trị nội bộ</span>
          </Link>
          <Link href="/" className="ml-auto inline-flex items-center gap-2 text-body-md text-on-dark-mute hover:text-on-dark">
            <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
            <span className="hidden sm:inline">Về Hub</span>
          </Link>
          <span className="hidden text-caption text-on-dark-mute md:inline">{ctx.user.email}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-standard flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
