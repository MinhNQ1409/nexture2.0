import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock } from 'lucide-react';
import { AppError, getMe } from '@nexture/core';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { orgOf, requirePageCtx } from '@/lib/session';

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx(`/o/${orgId}/dashboard`);
  const me = await getMe(ctx);
  const org = await orgOf(ctx, orgId).catch((e) => (e instanceof AppError && e.code === 'ORG_LOCKED' ? (e.details?.reason as string | null) ?? '' : notFound()));
  if (typeof org === 'string') return <Locked reason={org} others={me.organizations.filter((o) => o.id !== orgId && !o.lockedAt)} isNexture={ctx.actor.platformRole === 'NEXTURE_ADMIN'} />;
  return (
    <div className="flex min-h-screen">
      <Sidebar orgId={orgId} canSeeAdmin={org.myRole !== 'VIEWER'} isAdmin={org.myRole === 'ADMIN'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar org={{ id: org.id, name: org.name }} orgs={me.organizations} isNexture={ctx.actor.platformRole === 'NEXTURE_ADMIN'} user={{ name: ctx.user.name, email: ctx.user.email }} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function Locked({ reason, others, isNexture }: { reason: string; others: { id: string; name: string }[]; isNexture: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-canvas-white p-8 text-center shadow-card">
        <span className="inline-flex size-12 items-center justify-center rounded-pill bg-error-bg text-error">
          <Lock size={24} strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="text-heading-lg">Doanh nghiệp đang bị tạm khóa</h1>
        <p className="text-body-md text-ink-mute">NexTure đã tạm khóa doanh nghiệp này{reason ? ` với lý do: ${reason}` : ''}. Dữ liệu vẫn được giữ nguyên. Vui lòng liên hệ NexTure để được hỗ trợ.</p>
        <div className="flex flex-col gap-2">
          {others.map((o) => (
            <Link key={o.id} href={`/o/${o.id}/dashboard`} className="text-link hover:underline">
              Mở {o.name}
            </Link>
          ))}
          {isNexture && (
            <Link href="/nexture-admin" className="text-link hover:underline">
              Mở khu quản trị NexTure
            </Link>
          )}
          <Link href="/new-org" className="text-link hover:underline">
            Tạo doanh nghiệp mới
          </Link>
        </div>
      </div>
    </main>
  );
}
