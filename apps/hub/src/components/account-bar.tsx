'use client';
// Top bar for signed-in pages outside an org (Tạo Culture Hub): shows who is signed in and a way out,
// so an account without a company is never stuck there.
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { BrandLockup } from './brand';

export function AccountBar({ user }: { user: { name: string; email: string } }) {
  const signOut = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };
  return (
    <header className="sticky top-0 z-[10] border-b border-hairline bg-canvas-white">
      <div className="mx-auto flex h-topbar w-full max-w-[760px] items-center justify-between gap-4 px-4 md:px-6">
        <BrandLockup sub="Culture Hub" hideText="hidden sm:block" />
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0 text-right">
            <p className="truncate text-body-md font-semibold leading-tight">{user.name}</p>
            <p className="truncate text-caption text-ink-mute">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-button-md text-ink hover:bg-canvas-section"
          >
            <LogOut size={18} strokeWidth={1.5} aria-hidden />
            Đăng xuất
          </button>
        </div>
      </div>
      <p className="mx-auto w-full max-w-[760px] px-4 pb-2 text-caption text-ink-mute md:px-6">
        Không phải bạn?{' '}
        <button type="button" onClick={signOut} className="font-semibold text-link underline hover:text-link-hover">
          Đăng nhập tài khoản khác
        </button>
      </p>
    </header>
  );
}
