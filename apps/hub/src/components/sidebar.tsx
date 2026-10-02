'use client';
// App shell navigation (DESIGN.md: sidebar-nav on primary; ≥1024px 240px, 768–1023px icon-only 64px, <768px off-canvas).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Building2, CalendarClock, Flag, Gem, Globe, Images, LayoutDashboard, Menu, Package, UserCog, Users, X, type LucideIcon } from 'lucide-react';
import { cx } from './ui';

type Item = { href: string; label: string; icon: LucideIcon; ready?: boolean; adminOrEditor?: boolean };
const SECTIONS: { label: string; items: Item[] }[] = [
  {
    label: 'Văn hóa',
    items: [
      { href: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, ready: true },
      { href: 'timeline', label: 'Culture Timeline', icon: CalendarClock },
      { href: 'stories', label: 'Câu chuyện', icon: BookOpen },
      { href: 'events', label: 'Sự kiện', icon: Flag, ready: true },
      { href: 'people', label: 'Con người', icon: Users },
      { href: 'products', label: 'Sản phẩm & Dự án', icon: Package },
      { href: 'values', label: 'Giá trị văn hóa', icon: Gem },
      { href: 'library', label: 'Thư viện tư liệu', icon: Images },
    ],
  },
  {
    label: 'Quản trị',
    items: [
      { href: 'atlas', label: 'Culture Atlas', icon: Globe, ready: true, adminOrEditor: true },
      { href: 'settings/profile', label: 'Hồ sơ doanh nghiệp', icon: Building2, ready: true },
      { href: 'settings/members', label: 'Thành viên', icon: UserCog, ready: true, adminOrEditor: true },
    ],
  },
];

function NavList({ orgId, canSeeAdmin, compact, onNavigate }: { orgId: string; canSeeAdmin: boolean; compact: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-2">
      {SECTIONS.map((s) => {
        const items = s.items.filter((i) => !i.adminOrEditor || canSeeAdmin);
        if (!items.length) return null;
        return (
          <div key={s.label} className="flex flex-col gap-1">
            <p className={cx('px-4 pb-1 pt-4 text-micro-cap uppercase text-on-primary/50', compact && 'lg:block hidden')}>{s.label}</p>
            {items.map((i) => {
              const href = `/o/${orgId}/${i.href}`;
              const active = pathname.startsWith(href);
              const body = (
                <>
                  <i.icon size={24} strokeWidth={1.5} aria-hidden className="shrink-0" />
                  <span className={cx('truncate', compact && 'hidden lg:inline')}>{i.label}</span>
                </>
              );
              const cls = cx(
                'flex min-h-11 items-center gap-3 rounded-sm px-4 py-2.5 text-body-md transition-colors duration-[120ms]',
                compact && 'justify-center px-0 lg:justify-start lg:px-4',
                active ? 'bg-primary-dark font-semibold text-on-primary' : 'text-on-primary/70',
                i.ready ? 'hover:bg-primary-dark hover:text-on-primary' : 'cursor-not-allowed opacity-60',
              );
              return i.ready ? (
                <Link key={i.href} href={href} className={cls} aria-current={active ? 'page' : undefined} title={i.label} onClick={onNavigate}>
                  {body}
                </Link>
              ) : (
                <span key={i.href} className={cls} title={`${i.label} (đang xây dựng)`} aria-disabled>
                  {body}
                </span>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function Brand({ compact }: { compact: boolean }) {
  return (
    <div className={cx('flex h-topbar items-center px-6 font-display text-heading-md text-on-primary', compact && 'justify-center px-0 lg:justify-start lg:px-6')}>
      <span className={cx(compact && 'hidden lg:inline')}>NexTure Hub</span>
      {compact && <span className="lg:hidden">N</span>}
    </div>
  );
}

export function Sidebar({ orgId, canSeeAdmin }: { orgId: string; canSeeAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-sidebar-collapsed shrink-0 flex-col overflow-y-auto bg-primary md:flex lg:w-sidebar">
        <Brand compact />
        <NavList orgId={orgId} canSeeAdmin={canSeeAdmin} compact />
      </aside>

      <button type="button" className="fixed left-3 top-2 z-[10] inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-canvas-section md:hidden" aria-label="Mở menu" onClick={() => setOpen(true)}>
        <Menu size={24} strokeWidth={1.5} aria-hidden />
      </button>
      {open && (
        <div className="fixed inset-0 z-[50] md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-surface-dark/40" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-sidebar flex-col overflow-y-auto bg-primary shadow-drawer">
            <div className="flex items-center justify-between pr-2">
              <Brand compact={false} />
              <button type="button" className="inline-flex size-10 items-center justify-center rounded-md text-on-primary hover:bg-primary-dark" aria-label="Đóng menu" onClick={() => setOpen(false)}>
                <X size={24} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <NavList orgId={orgId} canSeeAdmin={canSeeAdmin} compact={false} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
