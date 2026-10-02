import { deleteEvent, getEvent, updateEvent } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; id: string };
export const GET = route<P>(({ ctx, params }) => getEvent(ctx, params.orgId, params.id));
export const PATCH = route<P>(async ({ req, ctx, params }) => updateEvent(ctx, params.orgId, params.id, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => deleteEvent(ctx, params.orgId, params.id));
