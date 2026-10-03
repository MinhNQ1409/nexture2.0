import { addMemberByEmail, listMembers } from '@nexture/core';
import { body, route } from '@/lib/api';

export const GET = route<{ orgId: string }>(({ ctx, params }) => listMembers(ctx, params.orgId));
export const POST = route<{ orgId: string }>(async ({ req, ctx, params }) => addMemberByEmail(ctx, params.orgId, await body(req)), { status: 201 });
