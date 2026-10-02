import { notFound } from 'next/navigation';
import { AppError, getPerson } from '@nexture/core';
import { orgOf, requirePageCtx } from '@/lib/session';
import { PersonEditor } from '../editor';

export default async function PersonPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  const person = await getPerson(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <PersonEditor key={person.id} orgId={orgId} isAdmin={org.myRole === 'ADMIN'} person={JSON.parse(JSON.stringify(person))} />;
}
