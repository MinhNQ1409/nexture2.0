import { listActivity } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ req, ctx, params }) => listActivity(ctx, params.orgId, Object.fromEntries(new URL(req.url).searchParams)));
