import { adminLockOrg, adminUnlockOrg } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route<{ orgId: string }>(async ({ req, ctx, params }) => adminLockOrg(ctx, params.orgId, await body(req)));
export const DELETE = route<{ orgId: string }>(({ ctx, params }) => adminUnlockOrg(ctx, params.orgId));
