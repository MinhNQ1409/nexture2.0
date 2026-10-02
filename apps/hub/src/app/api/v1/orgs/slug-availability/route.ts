import { slugAvailability } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route(({ req, ctx }) => slugAvailability(ctx.db, new URL(req.url).searchParams.get('slug') ?? ''));
