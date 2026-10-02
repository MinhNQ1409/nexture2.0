import type { UpdateOrgInput } from '@nexture/contracts';
import { getOrg, updateOrg } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => getOrg(ctx, params.orgId));
export const PATCH = route<{ orgId: string }>(async ({ req, ctx, params }) => updateOrg(ctx, params.orgId, (await body(req)) as UpdateOrgInput));
