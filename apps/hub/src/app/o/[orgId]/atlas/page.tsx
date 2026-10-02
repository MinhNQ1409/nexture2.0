import { notFound } from 'next/navigation';
import { getAtlasStatus, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { AtlasView } from './view';

export default async function AtlasPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  if (org.myRole === 'VIEWER') notFound();
  const status = await getAtlasStatus(ctx, orgId);
  return <AtlasView org={{ id: org.id, name: org.name, slug: org.slug, slugLocked: org.slugLocked, logoUrl: org.logo?.url ?? null, canToggle: org.permissions.canToggleAtlas }} initial={status} />;
}
