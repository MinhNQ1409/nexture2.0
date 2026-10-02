import { acceptInvite } from '@nexture/core';
import { route } from '@/lib/api';

export const POST = route<{ token: string }>(({ ctx, params, email }) => acceptInvite(ctx, params.token, email));
