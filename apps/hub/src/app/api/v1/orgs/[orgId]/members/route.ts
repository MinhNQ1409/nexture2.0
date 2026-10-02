import { listMembers } from '@nexture/core';
import { route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => listMembers(ctx, params.orgId));
