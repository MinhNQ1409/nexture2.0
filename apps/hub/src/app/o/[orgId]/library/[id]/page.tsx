import { notFound } from 'next/navigation';
import { AppError, getMedia, getOrg } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { MediaDetail } from './view';

export default async function MediaPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const media = await getMedia(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <MediaDetail key={media.id} orgId={orgId} isAdmin={org.myRole === 'ADMIN'} initial={JSON.parse(JSON.stringify(media))} />;
}
