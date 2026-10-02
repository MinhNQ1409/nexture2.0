import { createUploadUrl } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route<{ orgId: string }>(async ({ req, ctx, params }) => createUploadUrl(ctx, params.orgId, await body(req)), { status: 201 });
