import { getAtlasStatus, setAtlasEnabled } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => getAtlasStatus(ctx, params.orgId));
export const PUT = route<{ orgId: string }>(async ({ req, ctx, params }) => setAtlasEnabled(ctx, params.orgId, await body(req)));
