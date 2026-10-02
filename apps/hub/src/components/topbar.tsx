'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Building2, ChevronDown, LogOut, Search, ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

type Org = { id: string; name: string };

export function Topbar({ org, orgs, user, isNexture }: { org: Org; orgs: Org[]; user: { name: string; email: string }; isNexture?: boolean }) {
  const [open, setOpen] = useState(false);
  const initials = user.name
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <header className="sticky top-0 z-[10] flex h-topbar items-center justify-between gap-4 border-b border-hairline bg-canvas-white pl-16 pr-6 md:pl-6">
      <div className="relative min-w-0">
        <button type="button" onClick={() => setOpen(!open)} className="flex min-h-10 items-center gap-2 rounded-md px-2 hover:bg-canvas-section" aria-expanded={open} disabled={orgs.length < 2}>
          <Building2 size={20} strokeWidth={1.5} aria-hidden className="shrink-0 text-ink-mute" />
          <span className="truncate font-display text-heading-sm">{org.name}</span>
          {orgs.length > 1 && <ChevronDown size={16} strokeWidth={1.5} aria-hidden />}
        </button>
        {open && (
          <ul className="absolute left-0 top-full z-[20] mt-1 min-w-64 rounded-lg border border-hairline bg-canvas-white p-1 shadow-dropdown">
            {orgs.map((o) => (
              <li key={o.id}>
                <Link href={`/o/${o.id}/dashboard`} className="block rounded-sm px-3 py-2 hover:bg-canvas-section" onClick={() => setOpen(false)}>
                  {o.name}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-hairline pt-1">
              <Link href="/new-org" className="block rounded-sm px-3 py-2 text-primary hover:bg-primary-light">
                Tạo doanh nghiệp mới
              </Link>
            </li>
          </ul>
        )}
      </div>
      <form action={`/o/${org.id}/search`} role="search" className="hidden max-w-sm flex-1 md:block">
        <label className="flex min-h-10 items-center gap-2 rounded-md border border-hairline bg-canvas px-3 focus-within:border-primary">
          <Search size={16} strokeWidth={1.5} className="shrink-0 text-ink-mute" aria-hidden />
          <input name="q" maxLength={100} placeholder="Tìm trong Hub" aria-label="Tìm trong Hub" className="w-full bg-transparent text-body-md outline-none" />
        </label>
      </form>
      <div className="flex items-center gap-3">
        {isNexture && (
          <Link href="/nexture-admin" className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-body-md font-semibold text-primary hover:bg-primary-light">
            <ShieldCheck size={18} strokeWidth={1.5} aria-hidden />
            <span className="hidden lg:inline">Quản trị NexTure</span>
          </Link>
        )}
        <Link href={`/o/${org.id}/search`} aria-label="Tìm kiếm" className="rounded-md p-2 text-ink-mute hover:bg-canvas-section md:hidden">
          <Search size={20} strokeWidth={1.5} aria-hidden />
        </Link>
        <div className="hidden text-right sm:block">
          <p className="text-body-md font-semibold leading-tight">{user.name}</p>
          <p className="text-caption text-ink-mute">{user.email}</p>
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-pill bg-primary-light text-button-md text-primary" aria-hidden>
          {initials}
        </span>
        <button
          type="button"
          title="Đăng xuất"
          aria-label="Đăng xuất"
          className="inline-flex size-10 items-center justify-center rounded-md text-ink-mute hover:bg-canvas-section hover:text-ink"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = '/login';
          }}
        >
          <LogOut size={20} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </header>
  );
}
