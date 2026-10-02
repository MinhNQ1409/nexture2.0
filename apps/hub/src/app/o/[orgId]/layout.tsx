import Link from 'next/link';
import { getMe, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { notFound } from 'next/navigation';
import { SignOutButton } from '@/components/sign-out';

// Sidebar items that are not built yet are listed so the shape matches 06 §4; they light up in later steps.
const NAV = [
  { href: 'dashboard', label: 'Tổng quan', ready: true },
  { href: 'timeline', label: 'Culture Timeline' },
  { href: 'stories', label: 'Câu chuyện' },
  { href: 'people', label: 'Con người' },
  { href: 'products', label: 'Sản phẩm & Dự án' },
  { href: 'values', label: 'Giá trị văn hóa' },
  { href: 'library', label: 'Thư viện tư liệu' },
  { href: 'settings/members', label: 'Thành viên', ready: true, perm: 'members' as const },
];

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx(`/o/${orgId}/dashboard`);
  const org = await getOrg(ctx, orgId).catch(() => notFound());
  const me = await getMe(ctx);
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-border bg-surface p-4">
        <p className="font-display text-lg font-semibold">{org.name}</p>
        {me.organizations.length > 1 && (
          <details className="mt-1 text-sm text-text-muted">
            <summary className="cursor-pointer">Đổi doanh nghiệp</summary>
            <ul className="mt-1 space-y-1">
              {me.organizations.map((o) => (
                <li key={o.id}>
                  <Link href={`/o/${o.id}/dashboard`}>{o.name}</Link>
                </li>
              ))}
            </ul>
          </details>
        )}
        <nav className="mt-6 space-y-1 text-sm">
          {NAV.filter((n) => !n.perm || org.myRole !== 'VIEWER').map((n) =>
            n.ready ? (
              <Link key={n.href} href={`/o/${orgId}/${n.href}`} className="block rounded-sm px-2 py-1.5 hover:bg-brand-soft">
                {n.label}
              </Link>
            ) : (
              <span key={n.href} className="block px-2 py-1.5 text-text-muted" title="Đang xây dựng">
                {n.label}
              </span>
            ),
          )}
        </nav>
        <div className="mt-8 border-t border-border pt-4 text-sm">
          <p>{ctx.user.name}</p>
          <p className="text-text-muted">{ctx.user.email}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
