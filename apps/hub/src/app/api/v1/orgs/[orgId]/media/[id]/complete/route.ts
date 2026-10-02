import { completeUpload } from '@nexture/core';
import { body, route } from '@/lib/api';

export const POST = route<{ orgId: string; id: string }>(async ({ req, ctx, params }) => completeUpload(ctx, params.orgId, params.id, await body(req)));
