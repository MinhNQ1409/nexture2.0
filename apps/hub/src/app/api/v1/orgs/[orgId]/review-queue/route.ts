import { reviewQueue } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => reviewQueue(ctx, params.orgId));
