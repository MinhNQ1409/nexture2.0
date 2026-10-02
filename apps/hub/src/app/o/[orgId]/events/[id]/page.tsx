import { notFound } from 'next/navigation';
import { AppError, getEvent, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { EventEditor } from '../editor';

export default async function EventPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const event = await getEvent(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <EventEditor orgId={orgId} isAdmin={org.myRole === 'ADMIN'} event={JSON.parse(JSON.stringify(event))} />;
}
