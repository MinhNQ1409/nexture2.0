import { deleteMedia, getMedia, updateMedia } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; id: string };
export const GET = route<P>(({ ctx, params }) => getMedia(ctx, params.orgId, params.id));
export const PATCH = route<P>(async ({ req, ctx, params }) => updateMedia(ctx, params.orgId, params.id, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => deleteMedia(ctx, params.orgId, params.id));
