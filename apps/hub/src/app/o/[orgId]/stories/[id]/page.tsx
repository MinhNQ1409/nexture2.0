import { notFound } from 'next/navigation';
import { AppError, getOrg, getStory } from '@nexture/core';
import { requirePageCtx } from '@/lib/session';
import { StoryEditor } from '../editor';

export default async function StoryPage({ params }: { params: Promise<{ orgId: string; id: string }> }) {
  const { orgId, id } = await params;
  const ctx = await requirePageCtx();
  const org = await getOrg(ctx, orgId);
  const story = await getStory(ctx, orgId, id).catch((e) => {
    if (e instanceof AppError) notFound();
    throw e;
  });
  return <StoryEditor key={story.id} orgId={orgId} isAdmin={org.myRole === 'ADMIN'} featured={org.featuredStoryId === story.id} story={JSON.parse(JSON.stringify(story))} />;
}
