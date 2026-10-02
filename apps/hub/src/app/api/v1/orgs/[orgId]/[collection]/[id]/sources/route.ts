import { addSource } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; collection: string; id: string };
export const POST = route<P>(async ({ req, ctx, params }) => addSource(ctx, params.collection, params.orgId, params.id, await body(req)), { status: 201 });
