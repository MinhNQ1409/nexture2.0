import { notFound } from 'next/navigation';
import { STORY_TYPES, type StoryType } from '@nexture/contracts';
import { canOrg } from '@nexture/core';
import { orgOf, requirePageCtx } from '@/lib/session';
import { StoryEditor } from '../editor';

export default async function NewStoryPage({ params, searchParams }: { params: Promise<{ orgId: string }>; searchParams: Promise<{ type?: string }> }) {
  const { orgId } = await params;
  const { type } = await searchParams;
  const ctx = await requirePageCtx();
  const org = await orgOf(ctx, orgId);
  if (!canOrg(org.myRole, 'content.create')) notFound();
  const defaultType = (STORY_TYPES as readonly string[]).includes(type ?? '') ? (type as StoryType) : undefined;
  return <StoryEditor orgId={orgId} isAdmin={org.myRole === 'ADMIN'} story={null} featured={false} defaultType={defaultType} />;
}
