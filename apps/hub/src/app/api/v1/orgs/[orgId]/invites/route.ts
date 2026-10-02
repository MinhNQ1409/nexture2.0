import { createInvite, listInvites } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => listInvites(ctx, params.orgId));
export const POST = route<{ orgId: string }>(
  async ({ req, ctx, params }) => createInvite(ctx, params.orgId, await body(req), process.env.HUB_BASE_URL ?? new URL(req.url).origin),
  { status: 201 },
);
