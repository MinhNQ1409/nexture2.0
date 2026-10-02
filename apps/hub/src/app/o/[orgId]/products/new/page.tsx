import { notFound } from 'next/navigation';
import { canOrg, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { ProductEditor } from '../editor';

export default async function NewProductPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { orgId } = await params;
  const { kind } = await searchParams;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (!canOrg(org.myRole, 'content.create')) notFound();
  return <ProductEditor orgId={orgId} isAdmin={org.myRole === 'ADMIN'} product={null} kind={kind === 'PROJECT' ? 'PROJECT' : 'PRODUCT'} />;
}
