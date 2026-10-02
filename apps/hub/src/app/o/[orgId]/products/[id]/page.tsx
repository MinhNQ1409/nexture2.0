import { notFound } from 'next/navigation';
import { AppError, getProduct } from '@nexture/core';
import { orgOf, requirePageCtx } from '@/lib/session';
import { ProductEditor } from '../editor';

export default async function ProductPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  const product = await getProduct(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <ProductEditor key={product.id} orgId={orgId} isAdmin={org.myRole === 'ADMIN'} product={JSON.parse(JSON.stringify(product))} />;
}
