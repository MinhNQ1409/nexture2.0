import { changeRole, removeMember } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; userId: string };
export const PATCH = route<P>(async ({ req, ctx, params }) => changeRole(ctx, params.orgId, params.userId, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => removeMember(ctx, params.orgId, params.userId));
