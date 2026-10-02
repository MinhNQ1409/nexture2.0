import { getMe } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route(({ ctx }) => getMe(ctx));
