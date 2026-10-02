import { notFound } from 'next/navigation';
import { getMe, getOrg } from '@nexture/core';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { requirePageCtx } from '@/lib/session';

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx(`/o/${orgId}/dashboard`);
  const org = await getOrg(ctx, orgId).catch(() => notFound());
  const me = await getMe(ctx);
  return (
    <div className="flex min-h-screen">
      <Sidebar orgId={orgId} canSeeAdmin={org.myRole !== 'VIEWER'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar org={{ id: org.id, name: org.name }} orgs={me.organizations} user={{ name: ctx.user.name, email: ctx.user.email }} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
