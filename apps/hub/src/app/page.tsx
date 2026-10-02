import { redirect } from 'next/navigation';
import { getMe } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';

export default async function Home() {
  const ctx = await requirePageCtx();
  const me = await getMe(ctx);
  const first = me.organizations[0];
  redirect(first ? `/o/${first.id}/dashboard` : '/new-org');
}
