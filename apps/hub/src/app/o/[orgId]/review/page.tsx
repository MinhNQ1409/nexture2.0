import { notFound } from 'next/navigation';
import { canOrg, getOrg, reviewQueue } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { ReviewView } from './view';

export default async function ReviewPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (!canOrg(org.myRole, 'review.view')) notFound();
  const { items } = await reviewQueue(ctx, orgId);
  return <ReviewView orgId={orgId} isAdmin={org.myRole === 'ADMIN'} initial={JSON.parse(JSON.stringify(items))} />;
}
