import { notFound } from 'next/navigation';
import { adminGetOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { AdminOrgView } from './view';

export default async function AdminOrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx(`/nexture-admin/orgs/${orgId}`);
  const org = await adminGetOrg(ctx, orgId).catch(() => notFound());
  return <AdminOrgView initial={JSON.parse(JSON.stringify(org))} />;
}
