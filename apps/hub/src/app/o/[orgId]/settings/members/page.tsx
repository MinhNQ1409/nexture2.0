import { notFound } from 'next/navigation';
import { getOrg, listInvites, listMembers } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { MembersView } from './view';

export default async function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (org.myRole === 'VIEWER') notFound();
  const members = await listMembers(ctx, orgId);
  const invites = org.permissions.canManageMembers ? (await listInvites(ctx, orgId)).items : [];
  return (
    <MembersView
      orgId={orgId}
      me={ctx.actor.userId}
      canManage={org.permissions.canManageMembers}
      members={members.items.map((m) => ({ ...m, joinedAt: m.joinedAt.toISOString() }))}
      invites={invites.map((i) => ({ ...i, expiresAt: i.expiresAt.toISOString(), createdAt: i.createdAt.toISOString() }))}
    />
  );
}
