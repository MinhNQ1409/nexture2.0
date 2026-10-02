import { canOrg, getOrg, listValues } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { ValuesView } from './view';

export default async function ValuesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const { items } = await listValues(ctx, orgId);
  return <ValuesView orgId={orgId} canManage={canOrg(org.myRole, 'values.manage')} initial={items} />;
}
