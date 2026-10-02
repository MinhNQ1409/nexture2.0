import { adminListOrgs } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route(({ req, ctx }) => adminListOrgs(ctx, Object.fromEntries(new URL(req.url).searchParams)));
