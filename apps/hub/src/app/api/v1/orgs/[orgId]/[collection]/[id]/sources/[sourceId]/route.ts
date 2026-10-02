import { removeSource, updateSource } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; collection: string; id: string; sourceId: string };
export const PATCH = route<P>(async ({ req, ctx, params }) => updateSource(ctx, params.collection, params.orgId, params.id, params.sourceId, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => removeSource(ctx, params.collection, params.orgId, params.id, params.sourceId));
