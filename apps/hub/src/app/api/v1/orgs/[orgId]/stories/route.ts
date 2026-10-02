import { createStory, listStories } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ req, ctx, params }) => listStories(ctx, params.orgId, Object.fromEntries(new URL(req.url).searchParams)));
export const POST = route<{ orgId: string }>(async ({ req, ctx, params }) => createStory(ctx, params.orgId, await body(req)), { status: 201 });
