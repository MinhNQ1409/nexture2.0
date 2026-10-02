import { adminHide } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route(async ({ req, ctx }) => adminHide(ctx, await body(req)));
