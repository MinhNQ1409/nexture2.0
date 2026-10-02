import { deleteValue, updateValue } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; id: string };
export const PATCH = route<P>(async ({ req, ctx, params }) => updateValue(ctx, params.orgId, params.id, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => deleteValue(ctx, params.orgId, params.id));
