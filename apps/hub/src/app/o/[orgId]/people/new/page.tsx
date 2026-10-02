import { notFound } from 'next/navigation';
import { canOrg, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { PersonEditor } from '../editor';

export default async function NewPersonPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ founder?: string }> }) {
  const { orgId } = await params;
  const { founder } = await searchParams;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (!canOrg(org.myRole, 'content.create')) notFound();
  return <PersonEditor orgId={orgId} isAdmin={org.myRole === 'ADMIN'} person={null} founder={founder === '1'} />;
}
