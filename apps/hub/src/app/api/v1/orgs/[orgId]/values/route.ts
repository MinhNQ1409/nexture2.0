import { createValue, listValues } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => listValues(ctx, params.orgId));
export const POST = route<{ orgId: string }>(async ({ req, ctx, params }) => createValue(ctx, params.orgId, await body(req)), { status: 201 });
