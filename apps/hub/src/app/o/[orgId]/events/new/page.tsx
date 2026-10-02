import { notFound } from 'next/navigation';
import { canOrg } from '@nexture/core';
import { orgOf, requirePageCtx } from '@/lib/session';
import { EventEditor } from '../editor';

export default async function NewEventPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  if (!canOrg(org.myRole, 'content.create')) notFound();
  return <EventEditor orgId={orgId} isAdmin={org.myRole === 'ADMIN'} event={null} />;
}
