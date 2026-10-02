import { adminDeleteOrg, adminGetOrg } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => adminGetOrg(ctx, params.orgId));
export const DELETE = route<{ orgId: string }>(async ({ req, ctx, params }) => adminDeleteOrg(ctx, params.orgId, await body(req)));
