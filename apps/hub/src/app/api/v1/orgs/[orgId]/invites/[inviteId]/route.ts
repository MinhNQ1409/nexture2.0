import { revokeInvite } from '@nexture/core';
import { route } from '@/lib/api';

export const DELETE = route<{ orgId: string; inviteId: string }>(({ ctx, params }) => revokeInvite(ctx, params.orgId, params.inviteId));
