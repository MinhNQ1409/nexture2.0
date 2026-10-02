import { reorderValues } from '@nexture/core';
import { body, route } from '@/lib/api';

export const PUT = route<{ orgId: string }>(async ({ req, ctx, params }) => reorderValues(ctx, params.orgId, await body(req)));
