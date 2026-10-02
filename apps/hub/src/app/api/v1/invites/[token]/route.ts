import { previewInvite } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route<{ token: string }>(({ ctx, params }) => previewInvite(ctx.db, params.token), { auth: false });
