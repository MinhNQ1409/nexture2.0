import { deleteProduct, getProduct, updateProduct } from '@nexture/core';
import { body, route } from '@/lib/api';

type P = { orgId: string; id: string };
export const GET = route<P>(({ ctx, params }) => getProduct(ctx, params.orgId, params.id));
export const PATCH = route<P>(async ({ req, ctx, params }) => updateProduct(ctx, params.orgId, params.id, await body(req)));
export const DELETE = route<P>(({ ctx, params }) => deleteProduct(ctx, params.orgId, params.id));
