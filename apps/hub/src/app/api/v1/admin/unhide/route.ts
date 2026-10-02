import { adminUnhide } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route(async ({ req, ctx }) => adminUnhide(ctx, await body(req)));
