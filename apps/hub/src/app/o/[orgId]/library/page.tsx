import { canOrg, getOrg, listMedia } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { LibraryView } from './view';

export default async function LibraryPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ q?: string }> }) {
  const { orgId } = await params;
  const q = ((await searchParams).q ?? '').trim();
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const initial = await listMedia(ctx, orgId, { pageSize: 48, q });
  return <LibraryView orgId={orgId} canUpload={canOrg(org.myRole, 'content.create')} initial={JSON.parse(JSON.stringify(initial))} initialQ={q} />;
}
