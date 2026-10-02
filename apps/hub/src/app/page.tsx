import { redirect } from 'next/navigation';
import { getMe } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';

export default async function Home() {
  const ctx = await requirePageCtx();
  const me = await getMe(ctx);
  const first = me.organizations.find((o) => !o.lockedAt) ?? me.organizations[0];
  redirect(first ? `/o/${first.id}/dashboard` : ctx.actor.platformRole === 'NEXTURE_ADMIN' ? '/nexture-admin' : '/new-org');
}
