import { notFound } from 'next/navigation';
import { AppError, getEvent } from '@nexture/core';
import { orgOf, requirePageCtx } from '@/lib/session';
import { EventEditor } from '../editor';

export default async function EventPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  const event = await getEvent(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <EventEditor key={event.id} orgId={orgId} isAdmin={org.myRole === 'ADMIN'} event={JSON.parse(JSON.stringify(event))} />;
}
